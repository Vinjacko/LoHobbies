const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config({ path: './.env' });

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Enable CORS
app.use(cors({
  origin: 'http://34.154.124.100:3001', // Allow only the frontend origin
  credentials: true // Allow cookies to be sent
}));

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));


// Mount routers
app.use('/api/v1/media', require('./routes/media'));
app.use('/api/v1/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

const server = app.listen(
  PORT,
  console.log(`Server running on port ${PORT}`)
);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
// Restarting server