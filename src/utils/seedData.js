import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with multiple movies and theaters...");

  // 1. Create Theaters
  // 1. Create Theaters
  const theatersData = [
    // Mumbai
    { name: "PVR Icon: Phoenix Palladium", city: "Mumbai", address: "Lower Parel", total_screens: 5 },
    { name: "INOX: Megaplex", city: "Mumbai", address: "Malad", total_screens: 10 },
    { name: "Cinepolis: Nexus Seawoods", city: "Mumbai", address: "Navi Mumbai", total_screens: 6 },
    { name: "Sterling Cineplex", city: "Mumbai", address: "Fort", total_screens: 3 },
    { name: "Carnival Cinemas", city: "Mumbai", address: "Andheri", total_screens: 4 },

    // Delhi-NCR
    { name: "PVR: Select Citywalk", city: "Delhi-NCR", address: "Saket", total_screens: 6 },
    { name: "INOX: Nehru Place", city: "Delhi-NCR", address: "Nehru Place", total_screens: 4 },
    { name: "PVR: Ambience Mall", city: "Delhi-NCR", address: "Gurgaon", total_screens: 8 },

    // Bengaluru
    { name: "PVR: Koramangala", city: "Bengaluru", address: "Koramangala", total_screens: 7 },
    { name: "INOX: Lido", city: "Bengaluru", address: "Ulsoor", total_screens: 4 },
    { name: "Cinepolis: Orion Mall", city: "Bengaluru", address: "Rajajinagar", total_screens: 9 },

    // Hyderabad
    { name: "PVR: Preston Prime", city: "Hyderabad", address: "Gachibowli", total_screens: 5 },
    { name: "AMB Cinemas", city: "Hyderabad", address: "Gachibowli", total_screens: 7 },
    { name: "Prasads Multiplex", city: "Hyderabad", address: "Necklace Road", total_screens: 6 },

    // Pune
    { name: "PVR: Phoenix Market City", city: "Pune", address: "Viman Nagar", total_screens: 9 },
    { name: "Cinepolis: Westend", city: "Pune", address: "Aundh", total_screens: 5 },
  ];

  const theaters = [];
  for (const t of theatersData) {
    let theater = await prisma.theater.findFirst({ where: { name: t.name } });
    if (!theater) {
      theater = await prisma.theater.create({ data: t });
    }
    theaters.push(theater);
    console.log(`Theater: ${theater.name}`);
  }

  // 2. Create Movies
  const moviesData = [
    {
      title: "Inception",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genre: ["Sci-Fi", "Action", "Thriller"],
      language: "English",
      duration: 148,
      rating: 8.8,
      poster_url: "https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      release_date: new Date("2010-07-16"),
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    },
    {
      title: "The Dark Knight",
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
      genre: ["Action", "Crime", "Drama"],
      language: "English",
      duration: 152,
      rating: 9.0,
      poster_url: "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      trailer_url: "https://www.youtube.com/watch?v=EXeTwQWrcwY",
      release_date: new Date("2008-07-18"),
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart"],
    },
    {
      title: "Interstellar",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      genre: ["Sci-Fi", "Adventure", "Drama"],
      language: "English",
      duration: 169,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/gEU2QniL6E8AHtMY4kRFW57gnY.jpg",
      trailer_url: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      release_date: new Date("2014-11-07"),
      director: "Christopher Nolan",
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    },
    {
      title: "Avengers: Endgame",
      description: "After the devastating events of Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
      genre: ["Action", "Sci-Fi", "Adventure"],
      language: "English",
      duration: 181,
      rating: 8.4,
      poster_url: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
      trailer_url: "https://www.youtube.com/watch?v=TcMBFSGVi1c",
      release_date: new Date("2019-04-26"),
      director: "Anthony Russo, Joe Russo",
      cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo"],
    },
    {
      title: "Spider-Man: Across the Spider-Verse",
      description: "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.",
      genre: ["Animation", "Action", "Adventure"],
      language: "English",
      duration: 140,
      rating: 8.7,
      poster_url: "https://image.tmdb.org/t/p/original/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
      trailer_url: "https://www.youtube.com/watch?v=cqGjhVJWtEg",
      release_date: new Date("2023-06-02"),
      director: "Joaquim Dos Santos",
      cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac"],
    },
    {
      title: "The Shawshank Redemption",
      description: "Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.",
      genre: ["Drama"],
      language: "English",
      duration: 142,
      rating: 9.3,
      poster_url: "https://image.tmdb.org/t/p/original/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      trailer_url: "https://www.youtube.com/watch?v=6hB3S9bIaco",
      release_date: new Date("1994-09-23"),
      director: "Frank Darabont",
      cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton"],
    },
    {
      title: "The Godfather",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.",
      genre: ["Crime", "Drama"],
      language: "English",
      duration: 175,
      rating: 9.2,
      poster_url: "https://image.tmdb.org/t/p/original/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
      trailer_url: "https://www.youtube.com/watch?v=sY1S34973zA",
      release_date: new Date("1972-03-14"),
      director: "Francis Ford Coppola",
      cast: ["Marlon Brando", "Al Pacino", "James Caan"],
    },
    {
      title: "Pulp Fiction",
      description: "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.",
      genre: ["Crime", "Drama"],
      language: "English",
      duration: 154,
      rating: 8.9,
      poster_url: "https://image.tmdb.org/t/p/original/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      trailer_url: "https://www.youtube.com/watch?v=s7EdQ4FqbhY",
      release_date: new Date("1994-10-14"),
      director: "Quentin Tarantino",
      cast: ["John Travolta", "Uma Thurman", "Samuel L. Jackson"],
    },
    {
      title: "Fight Club",
      description: "An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into something much, much more.",
      genre: ["Drama"],
      language: "English",
      duration: 139,
      rating: 8.8,
      poster_url: "https://image.tmdb.org/t/p/original/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      trailer_url: "https://www.youtube.com/watch?v=qtRKdVHc-cE",
      release_date: new Date("1999-10-15"),
      director: "David Fincher",
      cast: ["Brad Pitt", "Edward Norton", "Meat Loaf"],
    },
    {
      title: "Forrest Gump",
      description: "The presidencies of Kennedy and Johnson, the events of Vietnam, Watergate and other historical events unfold from the perspective of an Alabama man with an IQ of 75.",
      genre: ["Drama", "Romance"],
      language: "English",
      duration: 142,
      rating: 8.8,
      poster_url: "https://image.tmdb.org/t/p/original/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
      trailer_url: "https://www.youtube.com/watch?v=bLvqoHBptjg",
      release_date: new Date("1994-07-06"),
      director: "Robert Zemeckis",
      cast: ["Tom Hanks", "Robin Wright", "Gary Sinise"],
    },
    {
      title: "Inception",
      description: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
      genre: ["Action", "Adventure", "Sci-Fi"],
      language: "English",
      duration: 148,
      rating: 8.8,
      poster_url: "https://image.tmdb.org/t/p/original/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      trailer_url: "https://www.youtube.com/watch?v=YoHD9XEInc0",
      release_date: new Date("2010-07-16"),
      director: "Christopher Nolan",
      cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page"],
    },
    {
      title: "The Matrix",
      description: "When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.",
      genre: ["Action", "Sci-Fi"],
      language: "English",
      duration: 136,
      rating: 8.7,
      poster_url: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      trailer_url: "https://www.youtube.com/watch?v=vKQi3bBA1y8",
      release_date: new Date("1999-03-31"),
      director: "Lana Wachowski, Lilly Wachowski",
      cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    },
    {
      title: "Goodfellas",
      description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
      genre: ["Biography", "Crime", "Drama"],
      language: "English",
      duration: 146,
      rating: 8.7,
      poster_url: "https://image.tmdb.org/t/p/original/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
      trailer_url: "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
      release_date: new Date("1990-09-19"),
      director: "Martin Scorsese",
      cast: ["Robert De Niro", "Ray Liotta", "Joe Pesci"],
    },
    {
      title: "Se7en",
      description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
      genre: ["Crime", "Drama", "Mystery"],
      language: "English",
      duration: 127,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/6yoghtyTpznpBik8EngEmJskVUO.jpg",
      trailer_url: "https://www.youtube.com/watch?v=znmZoVkCjpI",
      release_date: new Date("1995-09-22"),
      director: "David Fincher",
      cast: ["Morgan Freeman", "Brad Pitt", "Kevin Spacey"],
    },
    {
      title: "It's a Wonderful Life",
      description: "An angel is sent from Heaven to help a desperately frustrated businessman by showing him what life would have been like if he had never existed.",
      genre: ["Drama", "Family", "Fantasy"],
      language: "English",
      duration: 130,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/bTjFwh1733TNswwR3xmfxDwvTE3.jpg",
      trailer_url: "https://www.youtube.com/watch?v=iLR3gZrU2Xo",
      release_date: new Date("1946-12-20"),
      director: "Frank Capra",
      cast: ["James Stewart", "Donna Reed", "Lionel Barrymore"],
    },
    {
      title: "Seven Samurai",
      description: "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
      genre: ["Action", "Drama"],
      language: "Japanese",
      duration: 207,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg",
      trailer_url: "https://www.youtube.com/watch?v=wJ1TOratDYo",
      release_date: new Date("1954-04-26"),
      director: "Akira Kurosawa",
      cast: ["Toshiro Mifune", "Takashi Shimura", "Keiko Tsushima"],
    },
    {
      title: "City of God",
      description: "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a kingpin.",
      genre: ["Crime", "Drama"],
      language: "Portuguese",
      duration: 130,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/k7eYdWnZn6y4XR4vnR6N4uuYFh.jpg",
      trailer_url: "https://www.youtube.com/watch?v=dcUOO4Itgmw",
      release_date: new Date("2002-02-05"),
      director: "Fernando Meirelles, Kátia Lund",
      cast: ["Alexandre Rodrigues", "Leandro Firmino", "Matheus Nachtergaele"],
    },
    {
      title: "Life Is Beautiful",
      description: "When an open-minded Jewish librarian and his son become victims of the Holocaust, he uses a perfect mixture of will, humor, and imagination to protect his son from the dangers around their camp.",
      genre: ["Comedy", "Drama", "Romance"],
      language: "Italian",
      duration: 116,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/mfnkSeeVOBVheuyn2lo4tfmOPQb.jpg",
      trailer_url: "https://www.youtube.com/watch?v=pGsN8b19Q4u",
      release_date: new Date("1997-12-20"),
      director: "Roberto Benigni",
      cast: ["Roberto Benigni", "Nicoletta Braschi", "Giorgio Cantarini"],
    },
    {
      title: "Spirited Away",
      description: "A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.",
      genre: ["Animation", "Family", "Fantasy"],
      language: "Japanese",
      duration: 125,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/39wmItIWsg5sZMyRUKGk2cu1Pf2.jpg",
      trailer_url: "https://www.youtube.com/watch?v=ByXuk9QqQkk",
      release_date: new Date("2001-07-20"),
      director: "Hayao Miyazaki",
      cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki"],
    },
    {
      title: "Parasite",
      description: "All-unemployed Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
      genre: ["Comedy", "Drama", "Thriller"],
      language: "Korean",
      duration: 132,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
      trailer_url: "https://www.youtube.com/watch?v=5xH0HfJHsaY",
      release_date: new Date("2019-05-30"),
      director: "Bong Joon-ho",
      cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong"],
    },
    {
      title: "The Green Mile",
      description: "A supernatural tale set on death row in a Southern prison, where gentle giant John Coffey possesses the mysterious power to heal people's ailments.",
      genre: ["Crime", "Drama", "Fantasy"],
      language: "English",
      duration: 189,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/velWPhVMQeQKcxggNEU8YmIo52R.jpg",
      trailer_url: "https://www.youtube.com/watch?v=Ki4haFrqSrw",
      release_date: new Date("1999-12-10"),
      director: "Frank Darabont",
      cast: ["Tom Hanks", "Michael Clarke Duncan", "David Morse"],
    },
    {
      title: "Interstellar",
      description: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
      genre: ["Adventure", "Drama", "Sci-Fi"],
      language: "English",
      duration: 169,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/gEU2QniL6E8AHtMY4kRFW57gnY.jpg",
      trailer_url: "https://www.youtube.com/watch?v=zSWdZVtXT7E",
      release_date: new Date("2014-11-05"),
      director: "Christopher Nolan",
      cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"],
    },
    {
      title: "Whiplash",
      description: "A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student's potential.",
      genre: ["Drama", "Music"],
      language: "English",
      duration: 107,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/6uHEDEh986zRxSzoOjaYlD8hD5s.jpg",
      trailer_url: "https://www.youtube.com/watch?v=7d_jQycdQGo",
      release_date: new Date("2014-10-10"),
      director: "Damien Chazelle",
      cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser"],
    },
    {
      title: "The Prestige",
      description: "After a tragic accident, two stage magicians engage in a battle to create the ultimate illusion while sacrificing everything they have to outwit each other.",
      genre: ["Drama", "Mystery", "Sci-Fi"],
      language: "English",
      duration: 130,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg",
      trailer_url: "https://www.youtube.com/watch?v=o4gHCmTQDVI",
      release_date: new Date("2006-10-20"),
      director: "Christopher Nolan",
      cast: ["Christian Bale", "Hugh Jackman", "Scarlett Johansson"],
    },
    {
      title: "The Departed",
      description: "An undercover cop and a mole in the police attempt to identify each other while infiltrating an Irish gang in South Boston.",
      genre: ["Crime", "Drama", "Thriller"],
      language: "English",
      duration: 151,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/nTM891IqJR2niPM43cVyrFRzVwg.jpg",
      trailer_url: "https://www.youtube.com/watch?v=iojhqm0JTW4",
      release_date: new Date("2006-10-06"),
      director: "Martin Scorsese",
      cast: ["Leonardo DiCaprio", "Matt Damon", "Jack Nicholson"],
    },
    {
      title: "Gladiator",
      description: "A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.",
      genre: ["Action", "Adventure", "Drama"],
      language: "English",
      duration: 155,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/ty8TGRuvJLPUmAR1H1nRIsgwvim.jpg",
      trailer_url: "https://www.youtube.com/watch?v=owK1qxDselE",
      release_date: new Date("2000-05-01"),
      director: "Ridley Scott",
      cast: ["Russell Crowe", "Joaquin Phoenix", "Connie Nielsen"],
    },
    {
      title: "The Lion King",
      description: "Lion prince Simba and his father are targeted by his bitter uncle, who wants to ascend the throne himself.",
      genre: ["Animation", "Adventure", "Drama"],
      language: "English",
      duration: 88,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/sKCr78MXSLixwmZ8DyJLrpMsd15.jpg",
      trailer_url: "https://www.youtube.com/watch?v=4sj1MT05lAA",
      release_date: new Date("1994-06-23"),
      director: "Roger Allers, Rob Minkoff",
      cast: ["Matthew Broderick", "Jeremy Irons", "James Earl Jones"],
    },
    {
      title: "The Matrix",
      description: "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.",
      genre: ["Action", "Sci-Fi"],
      language: "English",
      duration: 136,
      rating: 8.7,
      poster_url: "https://image.tmdb.org/t/p/original/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      trailer_url: "https://www.youtube.com/watch?v=m8e-FF8MsqU",
      release_date: new Date("1999-03-31"),
      director: "Lana Wachowski, Lilly Wachowski",
      cast: ["Keanu Reeves", "Laurence Fishburne", "Carrie-Anne Moss"],
    },
    {
      title: "Goodfellas",
      description: "The story of Henry Hill and his life in the mob, covering his relationship with his wife Karen Hill and his mob partners Jimmy Conway and Tommy DeVito in the Italian-American crime syndicate.",
      genre: ["Biography", "Crime", "Drama"],
      language: "English",
      duration: 146,
      rating: 8.7,
      poster_url: "https://image.tmdb.org/t/p/original/aKuFiU82s5ISJpGZp7YkIr3kCUd.jpg",
      trailer_url: "https://www.youtube.com/watch?v=qo5jJpHtI1Y",
      release_date: new Date("1990-09-12"),
      director: "Martin Scorsese",
      cast: ["Robert De Niro", "Ray Liotta", "Joe Pesci"],
    },
    {
      title: "Seven Samurai",
      description: "A poor village under attack by bandits recruits seven unemployed samurai to help them defend themselves.",
      genre: ["Action", "Drama"],
      language: "Japanese",
      duration: 207,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/8OKmBV5BUFzmozIC3pPWKHy17kx.jpg",
      trailer_url: "https://www.youtube.com/watch?v=wJ1TOratDYo",
      release_date: new Date("1954-04-26"),
      director: "Akira Kurosawa",
      cast: ["Toshiro Mifune", "Takashi Shimura", "Keiko Tsushima"],
    },
    {
      title: "City of God",
      description: "In the slums of Rio, two kids' paths diverge as one struggles to become a photographer and the other a kingpin.",
      genre: ["Crime", "Drama"],
      language: "Portuguese",
      duration: 130,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg",
      trailer_url: "https://www.youtube.com/watch?v=dcUOO4Itgmw",
      release_date: new Date("2002-02-05"),
      director: "Fernando Meirelles, Kátia Lund",
      cast: ["Alexandre Rodrigues", "Leandro Firmino", "Matheus Nachtergaele"],
    },
    {
      title: "Se7en",
      description: "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.",
      genre: ["Crime", "Drama", "Mystery"],
      language: "English",
      duration: 127,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/6yoghtyTpznpBik8EngEmJskVUO.jpg",
      trailer_url: "https://www.youtube.com/watch?v=znmZoVkCjpI",
      release_date: new Date("1995-09-22"),
      director: "David Fincher",
      cast: ["Morgan Freeman", "Brad Pitt", "Kevin Spacey"],
    },
    {
      title: "The Silence of the Lambs",
      description: "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.",
      genre: ["Crime", "Drama", "Thriller"],
      language: "English",
      duration: 118,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/rplLJ2hPcOQmkFhTqUte0MkEaO2.jpg",
      trailer_url: "https://www.youtube.com/watch?v=W6Mm8Sbe__o",
      release_date: new Date("1991-02-14"),
      director: "Jonathan Demme",
      cast: ["Jodie Foster", "Anthony Hopkins", "Lawrence A. Bonney"],
    },
    {
      title: "It's a Wonderful Life",
      description: "An angel is sent from Heaven to help a desperately frustrated businessman by showing him what life would have been like if he had never existed.",
      genre: ["Drama", "Family", "Fantasy"],
      language: "English",
      duration: 130,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/bSqt9rhDZx1Q7UZ86dBPKdNomp2.jpg",
      trailer_url: "https://www.youtube.com/watch?v=iLR3gZrU2Xo",
      release_date: new Date("1946-12-20"),
      director: "Frank Capra",
      cast: ["James Stewart", "Donna Reed", "Lionel Barrymore"],
    },
    {
      title: "Life of Pi",
      description: "A young man who survives a disaster at sea is hurtled into an epic journey of adventure and discovery. While cast away, he forms an unexpected connection with another survivor: a fearsome Bengal tiger.",
      genre: ["Adventure", "Drama", "Fantasy"],
      language: "English",
      duration: 127,
      rating: 7.9,
      poster_url: "https://image.tmdb.org/t/p/original/mYDKm9dH065oa67Uap0oZ2Z985.jpg",
      trailer_url: "https://www.youtube.com/watch?v=3mMN693GX2o",
      release_date: new Date("2012-11-20"),
      director: "Ang Lee",
      cast: ["Suraj Sharma", "Irrfan Khan", "Adil Hussain"],
    },
    {
      title: "Saving Private Ryan",
      description: "Following the Normandy Landings, a group of U.S. soldiers go behind enemy lines to retrieve a paratrooper whose brothers have been killed in action.",
      genre: ["Drama", "War"],
      language: "English",
      duration: 169,
      rating: 8.6,
      poster_url: "https://image.tmdb.org/t/p/original/uqx37mW8zXsKhM91pgiloJ9irYo.jpg",
      trailer_url: "https://www.youtube.com/watch?v=zwhP5b4tD6g",
      release_date: new Date("1998-07-24"),
      director: "Steven Spielberg",
      cast: ["Tom Hanks", "Matt Damon", "Tom Sizemore"],
    },
    {
      title: "The Usual Suspects",
      description: "A sole survivor tells of the twisty events leading up to a horrific gun battle on a boat, which began when five criminals met at a seemingly random police lineup.",
      genre: ["Crime", "Drama", "Mystery"],
      language: "English",
      duration: 106,
      rating: 8.5,
      poster_url: "https://image.tmdb.org/t/p/original/bUP537Wv5D3aV55dZ8v8X8c5N5.jpg",
      trailer_url: "https://www.youtube.com/watch?v=oiXdPolca5w",
      release_date: new Date("1995-07-19"),
      director: "Bryan Singer",
      cast: ["Kevin Spacey", "Gabriel Byrne", "Chazz Palminteri"],
    },
  ];

  const movies = [];
  for (const m of moviesData) {
    // Check if exists by title
    let movie = await prisma.movie.findFirst({ where: { title: m.title } });
    if (!movie) {
      movie = await prisma.movie.create({ data: m });
    }
    movies.push(movie);
    console.log(`Movie: ${movie.title}`);
  }

  // 3. Create Shows
  console.log("Deleting existing shows and bookings...");
  await prisma.booking.deleteMany({}); // Delete bookings first to avoid FK errors
  await prisma.show.deleteMany({}); // Clean slate

  // Create shows for each movie in random theaters
  const timeSlots = [
    "10:00 AM", // Morning
    "02:00 PM", // Afternoon
    "06:00 PM", // Evening
    "10:00 PM"  // Night
  ];

  for (const movie of movies) {
    // Randomly select a subset of theaters for this movie (e.g., 70% of theaters)
    const selectedTheaters = theaters.filter(() => Math.random() > 0.3);

    for (const theater of selectedTheaters) {
      // Create shows for next 15 days
      for (let d = 0; d < 15; d++) {
        const date = new Date();
        date.setDate(date.getDate() + d);
        date.setHours(0, 0, 0, 0); // Normalize to midnight

        // Randomly decide if this theater shows this movie on this date (e.g., 80% chance)
        if (Math.random() > 0.2) {
          // Pick 3-4 random unique times
          const numShows = Math.floor(Math.random() * 2) + 3; // 3 or 4 shows

          // Shuffle timeSlots to pick unique random times
          const shuffledTimes = [...timeSlots].sort(() => 0.5 - Math.random());
          const selectedTimes = shuffledTimes.slice(0, numShows).sort((a, b) => {
            // Sort times chronologically for better DB insertion order (optional but nice)
            const dateA = new Date(`2000/01/01 ${a}`);
            const dateB = new Date(`2000/01/01 ${b}`);
            return dateA - dateB;
          });

          for (const time of selectedTimes) {
            const showData = {
              movie_id: movie.id,
              theater_id: theater.id,
              screen_number: Math.floor(Math.random() * theater.total_screens) + 1,
              show_date: date,
              show_time: time,
              total_seats: 100,
              price: Math.floor(Math.random() * 300) + 200, // Random price 200-500
              booked_seats: [],
            };

            await prisma.show.create({ data: showData });
            // console.log(`Show created for ${movie.title} at ${theater.name} on ${date.toDateString()} at ${time}`);
          }
        }
      }
    }
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
