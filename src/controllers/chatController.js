import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

// OpenRouter client - completely free, no Google project restrictions
const getOpenRouterClient = () => new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "MovieDay Assistant",
  },
});

// All currently available free models on OpenRouter (fetched live 2026-04-12)
const FREE_MODELS = [
  "google/gemma-3-4b-it:free",
  "google/gemma-3-12b-it:free",
  "google/gemma-3-27b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemma-4-31b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "nvidia/nemotron-3-super-120b-a12b:free",
  "nousresearch/hermes-3-llama-3.1-405b:free",
  "liquid/lfm-2.5-1.2b-instruct:free",
  "openai/gpt-oss-20b:free",
];

// Sleep helper for retry
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const callOpenRouter = async (systemPrompt, userPrompt, jsonMode = false, historyMessages = []) => {
  const client = getOpenRouterClient();
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (attempt > 1) {
      console.log(`Retry attempt ${attempt}, waiting 3s...`);
      await sleep(3000);
    }

    for (const model of FREE_MODELS) {
      try {
        console.log(`Trying model: ${model}`);
        const messages = [
          { role: "system", content: systemPrompt },
          ...historyMessages,
          { role: "user", content: userPrompt },
        ];

        const params = { model, messages, max_tokens: 1000, temperature: 0.7 };
        if (jsonMode) params.response_format = { type: "json_object" };

        const response = await client.chat.completions.create(params);
        const text = response.choices[0]?.message?.content || "";
        if (text) {
          console.log(`✅ Success with model: ${model}`);
          return { text, model };
        }
      } catch (err) {
        const status = err?.status || err?.response?.status;
        console.error(`❌ Model ${model} failed (${status}):`, err.message?.substring(0, 80));
        continue;
      }
    }
  }
  throw new Error("All models exhausted after retries.");
};

export const chatController = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY.includes("REPLACE_WITH")) {
      return res.status(200).json({
        reply: "⚠️ **Chatbot Not Configured:** Please add your free OpenRouter API key to the backend `.env` file as `OPENROUTER_API_KEY`. Get your free key at https://openrouter.ai/keys",
      });
    }

    // ==========================================
    // STAGE 1: INTENT DETECTION
    // ==========================================
    const intentSystemPrompt = `You are a smart intent detector for a movie ticket booking platform. 
Analyze the user's message and return a valid JSON object with this structure:
{
  "intent": "booking" | "search" | "recommendation" | "help" | "general",
  "parameters": {
    "movieTitle": string | null,
    "genre": string | null,
    "city": string | null,
    "mood": string | null,
    "intensity": string | null
  }
}
Return ONLY the JSON object, no extra text.`;

    const recentHistoryStr = (history || []).slice(-4)
      .map((h) => `${h.role}: ${h.content}`)
      .join("\n");
    const intentUserPrompt = `[Context]\n${recentHistoryStr}\n[User Message]\n${message}`;

    let intentData = { intent: "general", parameters: {} };
    try {
      const intentResult = await callOpenRouter(intentSystemPrompt, intentUserPrompt, true);
      const cleaned = intentResult.text.replace(/```json/gi, "").replace(/```/g, "").trim();
      intentData = JSON.parse(cleaned);
    } catch (e) {
      console.error("Intent detection failed, using general fallback:", e.message);
    }

    const { intent, parameters } = intentData;
    console.log("Detected Intent:", intent, parameters);

    // ==========================================
    // STAGE 2: DYNAMIC DATA RETRIEVAL (RAG)
    // ==========================================
    let contextData = "No specific database context needed.";

    if (intent === "booking" || intent === "search") {
      const where = {};
      if (parameters.movieTitle) {
        where.title = { contains: parameters.movieTitle, mode: "insensitive" };
      }
      const movies = await prisma.movie.findMany({
        where,
        take: 10,
        select: { id: true, title: true, language: true, rating: true, description: true, genre: true },
      });

      contextData = movies.length > 0
        ? "Movies found:\n" + movies.map((m) =>
            `- ${m.title} (${m.language || "Unknown"}): Genres: ${m.genre.join(", ")}, Rating: ${m.rating ?? "N/A"}. ${m.description ?? ""}`
          ).join("\n")
        : "No matching movies found. Tell the user there are no exact matches.";

    } else if (intent === "recommendation") {
      const movies = await prisma.movie.findMany({
        take: 30,
        select: { id: true, title: true, genre: true, rating: true, description: true, language: true },
      });

      let filtered = [...movies];

      if (parameters.genre) {
        const g = parameters.genre.toLowerCase();
        filtered = filtered.filter((m) => m.genre.some((x) => x.toLowerCase().includes(g)));
      }

      if (parameters.intensity === "lighter" || parameters.mood === "happy") {
        const light = ["comedy", "animation", "adventure", "family", "romance"];
        filtered = filtered.filter((m) => m.genre.some((g) => light.includes(g.toLowerCase())));
      } else if (["intense", "dark", "tense"].includes(parameters.intensity) || ["dark", "tense"].includes(parameters.mood)) {
        const dark = ["thriller", "horror", "drama", "crime", "action"];
        filtered = filtered.filter((m) => m.genre.some((g) => dark.includes(g.toLowerCase())));
      }

      if (parameters.movieTitle && filtered.length > 5) {
        const ref = movies.find((m) => m.title.toLowerCase().includes(parameters.movieTitle.toLowerCase()));
        if (ref) {
          filtered.sort((a, b) => {
            const aO = a.genre.filter((g) => ref.genre.includes(g)).length;
            const bO = b.genre.filter((g) => ref.genre.includes(g)).length;
            return bO - aO;
          });
        }
      }

      contextData = filtered.length === 0
        ? "No matching movies. Use fallback: 'Sorry, I couldn't find a perfect match. Try another query.'"
        : "Movies for recommendation (pick 2-3):\n" + filtered.slice(0, 10).map((m) =>
            `- ${m.title}: Genres: ${m.genre.join(", ")}, Rating: ${m.rating ?? "N/A"}. ${m.description ?? ""}`
          ).join("\n");

    } else if (intent === "help") {
      contextData = `Platform Info:
- Booking Flow: Select movie → choose theater → pick timing → select seats
- Refunds: Cancel up to 2 hours before showtime for 90% refund
- Issues: Try clearing browser cache or check "My Bookings"`;
    }

    // ==========================================
    // STAGE 3: RESPONSE GENERATION
    // ==========================================
    const systemResponsePrompt = `You are a smart movie booking assistant for MovieDay, a movie ticket booking platform.

CORE RULES:
- Be concise, helpful, and action-oriented
- Only use movies from the provided context data — NEVER invent movies
- Always guide users to the next step (book, explore, search)
- Use emojis sparingly for readability

RECOMMENDATION FORMAT (use EXACTLY when recommending):
🎬 **Movie Name**
🎭 Genre | ⭐ Rating
💡 Why: One sentence why it matches the user's request
👉 [Book Now] or [Explore Showtimes]

BOOKING GUIDANCE:
Guide step by step: movie → theatre → timing → seats

If no match found, say exactly: "Sorry, I couldn't find a perfect match. Try another query."

=== CONTEXT ===
Intent: ${intent}
${contextData}
===============`;

    // Build conversation history for OpenRouter
    const historyMessages = (history || []).slice(-8).map((h) => ({
      role: h.role === "user" ? "user" : "assistant",
      content: h.content,
    }));

    const result = await callOpenRouter(systemResponsePrompt, message, false, historyMessages);

    res.status(200).json({ reply: result.text, modelUsed: result.model });

  } catch (error) {
    console.error("Chat Controller Error:", error.message);

    res.status(500).json({
      error: "Failed to process chat request.",
      details: error.message,
    });
  }
};
