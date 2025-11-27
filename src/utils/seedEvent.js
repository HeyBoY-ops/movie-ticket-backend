import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding event data...");

  // 1. Create or Find the "Sunburn Arena" Movie (Event)
  const movieData = {
    title: "Sunburn Arena Ft. Alan Walker",
    description: "Get ready for the biggest musical extravaganza of the year! Sunburn Arena brings you the legendary Alan Walker.",
    genre: ["Event", "Music", "Concert"],
    language: "English",
    duration: 180, // 3 hours
    rating: 5.0,
    poster_url: "https://wanderon-images.gumlet.io/blogs/new/2024/09/sunburn-arena-ft.-alan-walker-timing-and-date.png",
    trailer_url: "",
    release_date: new Date("2024-12-14"),
    director: "Sunburn",
    cast: ["Alan Walker"],
  };

  let movie = await prisma.movie.findFirst({
    where: { title: movieData.title },
  });

  if (!movie) {
    movie = await prisma.movie.create({ data: movieData });
    console.log("Created Event Movie:", movie.id);
  } else {
    console.log("Event Movie already exists:", movie.id);
  }

  // 2. Create or Find a Theater for the Event
  const theaterData = {
    name: "Mahalaxmi Race Course",
    city: "Mumbai",
    address: "Keshavrao Khadye Marg, Royal Western India Turf Club, Mahalakshmi",
    total_screens: 1,
  };

  let theater = await prisma.theater.findFirst({
    where: { name: theaterData.name },
  });

  if (!theater) {
    theater = await prisma.theater.create({ data: theaterData });
    console.log("Created Event Venue:", theater.id);
  } else {
    console.log("Event Venue already exists:", theater.id);
  }

  // 3. Create a Show for the Event
  const showData = {
    movie_id: movie.id,
    theater_id: theater.id,
    screen_number: 1,
    show_date: new Date("2024-12-14T16:00:00.000Z"),
    show_time: "04:00 PM",
    total_seats: 5000,
    price: 1500,
    booked_seats: [],
  };

  // Check if show exists
  const existingShow = await prisma.show.findFirst({
    where: {
      movie_id: movie.id,
      theater_id: theater.id,
      show_date: showData.show_date,
    },
  });

  if (!existingShow) {
    const show = await prisma.show.create({ data: showData });
    console.log("Created Event Show:", show.id);
  } else {
    console.log("Event Show already exists:", existingShow.id);
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
