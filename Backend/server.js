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
  credentials: true 
}));

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server in esecuzione sulla porta: ${PORT}`)
);

const io = require('socket.io')(server, {
  cors: {
    origin: ['http://34.154.124.100:3001', 'http://localhost:3001'],
    credentials: true
  }
});

// crea un'istanza di socket.io che permette di non importarlo ogni volta
app.use((req,res,next) => {
  req.io = io;
  next();
});

io.on('connection', (socket) => {
  console.log('Utente collegato');
  socket.on('disconnect', () => {
    console.log('Utente scollegato');
  });
});

app.use('/api/v1/media', require('./routes/media'));
app.use('/api/v1/auth', require('./routes/auth'));

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});