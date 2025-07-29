const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './.env' }); // Carica le variabili d'ambiente

const app = require('./app'); // Importa l'app dal file app.js

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then(() => console.log('Connessione riuscita al database!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App in esecuzione sulla porta ${PORT}...`);
});
