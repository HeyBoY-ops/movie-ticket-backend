const titles = [
  'Gadar 2', 'Rocky Aur Rani Kii Prem Kahaani', 'Tiger 3', 'Dunki', 'Animal',
  'Kabir Singh', 'Chennai Express', 'Yeh Jawaani Hai Deewani', 'Zindagi Na Milegi Dobara',
  'Tumbbad', 'Queen', 'Gully Boy', 'Lagaan', 'Drishyam 2', 'Vikram', 'Kantara',
  'Sita Ramam', 'Barbie', 'Spider-Man: Across the Spider-Verse', '3 Idiots',
  'Baahubali 2: The Conclusion', 'KGF: Chapter 2', 'Pathaan', 'Jawan'
];

async function run() {
  for (const t of titles) {
    // Wikipedia might have disambiguation, e.g. "Animal (2023 film)"
    let title = t;
    if (t === 'Animal') title = 'Animal (2023 film)';
    if (t === 'Queen') title = 'Queen (2014 film)';
    if (t === 'Vikram') title = 'Vikram (2022 film)';
    const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodeURIComponent(title)}`);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId !== '-1' && pages[pageId].original) {
        console.log(`"${t}": "${pages[pageId].original.source}",`);
    } else {
        console.log(`"${t}": "NOT FOUND",`);
    }
  }
}
run();
