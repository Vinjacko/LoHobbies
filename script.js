const mongoose = require('mongoose');

// Connessione al database
mongoose.connect('mongodb://localhost:27017/MoviesSeries', {
  useNewUrlParser: true,        //  Dice a Mongoose di usare il nuovo parser dell’URL di connessione di MongoDB (introdotto a partire dalla versione 3.1.0 del driver).
  useUnifiedTopology: true      //  Abilita il nuovo motore di gestione delle connessioni (Unified Topology Layer), introdotto nel driver MongoDB 3.2.
})
.then(() => console.log('Connesso a MongoDB!'))
.catch(err => console.error('Errore di connessione:', err));

