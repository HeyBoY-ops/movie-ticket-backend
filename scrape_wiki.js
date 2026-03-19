const titles = {
  'Gadar 2': 'Gadar_2', 'Rocky Aur Rani Kii Prem Kahaani': 'Rocky_Aur_Rani_Kii_Prem_Kahaani',
  'Tiger 3': 'Tiger_3', 'Dunki': 'Dunki_(film)', 'Animal': 'Animal_(2023_film)',
  'Kabir Singh': 'Kabir_Singh', 'Chennai Express': 'Chennai_Express',
  'Yeh Jawaani Hai Deewani': 'Yeh_Jawaani_Hai_Deewani', 'Zindagi Na Milegi Dobara': 'Zindagi_Na_Milegi_Dobara',
  'Tumbbad': 'Tumbbad', 'Queen': 'Queen_(2014_film)', 'Gully Boy': 'Gully_Boy',
  'Lagaan': 'Lagaan', 'Drishyam 2': 'Drishyam_2', 'Vikram': 'Vikram_(2022_film)',
  'Kantara': 'Kantara_(film)', 'Sita Ramam': 'Sita_Ramam', 'Barbie': 'Barbie_(film)',
  'Spider-Man: Across the Spider-Verse': 'Spider-Man:_Across_the_Spider-Verse',
  '3 Idiots': '3_Idiots', 'Baahubali 2: The Conclusion': 'Baahubali_2:_The_Conclusion',
  'KGF: Chapter 2': 'K.G.F:_Chapter_2', 'Pathaan': 'Pathaan_(film)', 'Jawan': 'Jawan_(film)'
};

async function run() {
  const map = {};
  for (const [title, wikiPath] of Object.entries(titles)) {
    try {
      const res = await fetch(`https://en.wikipedia.org/wiki/${wikiPath}`);
      const text = await res.text();
      // Regex to find infobox image src
      const match = text.match(/class="infobox-image".*?src="(\/\/[^"]+)"/s) || text.match(/class="infobox[^>]*>.*?<img[^>]*src="(\/\/[^"]+)"/s);
      
      if (match) {
        let url = 'https:' + match[1];
        if (url.includes('/thumb/')) {
           const parts = url.split('/');
           parts.pop(); 
           url = parts.join('/').replace('/thumb/', '/');
        }
        console.log(`"${title}": "${url}",`);
        map[title] = url;
      } else {
        console.log(`"${title}": "NOT FOUND",`);
      }
    } catch (e) {
      console.log(`"${title}": "ERROR: ${e.message}",`);
    }
  }
}

run();
