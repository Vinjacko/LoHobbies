// contiene l'API di TMDB per la ricerca dei film popolari
const endpoint = '/movie/popular';

async function searchPopularFilm () {
  const data = await fetch(`${baseUrl}${endpoint}?api_key=${apiKey}&language=it-IT`);
  return data.json()['results'];
}

module.exports = searchPopularFilm;
