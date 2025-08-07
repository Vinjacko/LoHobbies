const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

dotenv.config({ path: './.env' });

connectDB();

const app = express();

app.use(express.json());

app.use(cookieParser());

app.use(cors({
  origin: ['http://34.154.124.100:3001', 'http://localhost:3001'], 
  credentials: true // permette di inviare i cookies
}));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1/media', require('./routes/media'));
app.use('/api/v1/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server in esecuzione sulla porta: ${PORT}`)
);

// codice per la gestione di errori imprevisti di operazioni asincrone
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});