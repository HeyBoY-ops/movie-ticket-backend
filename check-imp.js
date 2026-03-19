import axios from 'axios';

async function check() {
  const urls = [
    "http://www.impawards.com/2011/posters/rockstar_xlg.jpg",
    "http://www.impawards.com/intl/india/2011/posters/rockstar.jpg",
    "http://www.impawards.com/intl/india/2011/posters/rockstar_ver2.jpg",
    "http://www.impawards.com/intl/india/2022/posters/bhool_bhulaiyaa_two.jpg",
    "http://www.impawards.com/intl/india/2022/posters/bhool_bhulaiyaa_2.jpg",
    "http://www.impawards.com/intl/india/2022/posters/bhool_bhulaiyaa_ii.jpg",
    "http://www.impawards.com/intl/india/2022/posters/bhool_bhulaiyaa_two_ver3.jpg",
    "http://www.impawards.com/intl/india/2022/posters/bhool_bhulaiyaa_2_ver2.jpg",
    "http://www.impawards.com/intl/india/2023/posters/omg_two_ver2.jpg",
    "http://www.impawards.com/intl/india/2023/posters/omg_2_ver2.jpg",
    "http://www.impawards.com/intl/india/2023/posters/oh_my_god_2.jpg",
    "https://bollyspice.com/wp-content/uploads/2022/04/Bhool-Bhulaiyaa-2-Poster.jpg",
    "https://bollyspice.com/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2-Poster.jpg",
    "https://bollyspice.com/wp-content/uploads/2023/07/OMG-2-Poster.jpg",
    "https://bollyspice.com/wp-content/uploads/2023/08/OMG-2-Poster.jpg",
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2022/05/Bhool-Bhulaiyaa-2-1.jpg",
    "https://stat4.bollywoodhungama.in/wp-content/uploads/2023/07/OMG-2-1.jpg",
    // Wikipedia Special:FilePath Tests
    "https://en.wikipedia.org/wiki/Special:FilePath/Bhool_Bhulaiyaa_2_film_poster.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/OMG_2_–_Oh_My_God!_2_poster.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/OMG_2_poster.jpg",
    "https://en.wikipedia.org/wiki/Special:FilePath/Bhool_Bhulaiyaa_2_poster.jpg",
    "http://www.impawards.com/intl/india/2022/posters/bhool_bhulaiyaa_two_ver2.jpg",
    "http://www.impawards.com/intl/india/2023/posters/omg_two.jpg",
    "http://www.impawards.com/intl/india/2023/posters/omg_2.jpg",
    "http://www.impawards.com/intl/india/2023/posters/oh_my_god_two.jpg"
  ];

  for (const url of urls) {
    try {
      await axios.head(url, { timeout: 3000 });
      console.log(`✅ OK: ${url}`);
    } catch (e) {
      console.log(`❌ FAIL: ${url} - ${e.message}`);
    }
  }
}

check();
