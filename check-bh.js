import axios from 'axios';

async function check() {
  const urls = [
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2.jpg",
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2-1.jpg",
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2-Poster.jpg",
    "https://stat5.bollywoodhungama.in/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2-Poster-1.jpg",
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/04/Bhool-Bhulaiyaa-2.jpg",
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/04/Bhool-Bhulaiyaa-2-1.jpg"
  ];

  for (const u of urls) {
    try {
      const res = await axios.head(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`✅ OK: ${u}`);
    } catch (e) {
      console.log(`❌ FAIL: ${u} - ${e.message}`);
    }
  }
}

check();
