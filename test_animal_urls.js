const urlsToTest = [
  'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg',
  'https://image.tmdb.org/t/p/w500/1Xdd3XA2W0JEYFDE2T9sUaO51vM.jpg',
  'https://m.media-amazon.com/images/M/MV5BNGViM2M4NmUtMmNkNy00MTQ5LTk5MDYtNmNhODAzODkwOTJlXkEyXkFqcGdeQXVyMTY1NDY4NTIw._V1_FMjpg_UX1000_.jpg'
];

async function run() {
  for (const url of urlsToTest) {
    try {
      const res = await fetch(url, { method: 'HEAD' });
      console.log(`${url} - Status: ${res.status}`);
    } catch (e) {
      console.log(`${url} - Error: ${e.message}`);
    }
  }
}

run();
