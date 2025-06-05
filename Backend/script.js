const mongoose = require('mongoose');

// Connessione al database
mongoose.connect('mongodb://localhost:27017/MoviesSeries', {
  useNewUrlParser: true,        //  Dice a Mongoose di usare il nuovo parser dell’URL di connessione di MongoDB (introdotto a partire dalla versione 3.1.0 del driver).
  useUnifiedTopology: true      //  Abilita il nuovo motore di gestione delle connessioni (Unified Topology Layer), introdotto nel driver MongoDB 3.2.
})
  .then(() => console.log('Connesso a MongoDB!'))
  .catch(err => console.error('Errore di connessione:', err));

const apiKey = '281184eb2c6a2ab868ee200b3284e7a9';
const baseUrl = 'https://api.themoviedb.org/3';
const endpoint = '/movie/popular';

fetch(`${baseUrl}${endpoint}?api_key=${apiKey}&language=it-IT`)
  .then(response => response.json())
  .then(data => {
    console.log('Film popolari:', data.results);
  })
  .catch(error => {
    console.error('Errore nella richiesta:', error);
  });

  
