const endpoint = '/movie/search';

fetch(`${baseUrl}${endpoint}?api_key=${apiKey}&language=it-IT`)
  .then(response => response.json())
  .then(data => {
    console.log('Film popolari:', data.results);
  })
  .catch(error => {
    console.error('Errore nella richiesta:', error);
  });