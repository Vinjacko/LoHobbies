const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DATABASE);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);  //  interrompe l'esecuzione dell'applicazione Node.js con un codice di uscita 1 che indica un errore fatale
  }
};

module.exports = connectDB;