const titles = {
  'Rockstar': 'Rockstar_(2011_film)',
  'Kahaani': 'Kahaani',
  'Uri: The Surgical Strike': 'Uri:_The_Surgical_Strike',
  'Sanju': 'Sanju',
  'Brahmastra: Part One - Shiva': 'Brahmāstra:_Part_One_–_Shiva'
};

async function run() {
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
      } else {
        console.log(`"${title}": "NOT FOUND",`);
      }
    } catch (e) {
      console.log(`"${title}": "ERROR: ${e.message}",`);
    }
  }
}

run();
