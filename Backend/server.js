const dotenv = require('dotenv');  

dotenv.config({ path: './.env' }); // Carica le variabili d'ambiente

const app = require('./app'); // Importa l'app dal file app.js

require ('./dbconn');      // legge tutto il file dbconn.js e lo esegue

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App in esecuzione sulla porta ${PORT}...`);
});
