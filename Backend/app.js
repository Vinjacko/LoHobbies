const express = require('express');
const cors = require('cors');

const userRouter = require('./routes/user.routes');
const diaryRouter = require('./routes/diary.routes');
const mediaRouter = require('./routes/media.routes');

const app = express();

// Permette al frontend React di comunicare con il backend
app.use(cors());    // cors() permette al browser di sapere che le richieste da altre origini sono autorizzate

// Middleware per parsare il corpo delle richieste in JSON
app.use(express.json());

// Montaggio dei Router
app.use('/api/v1/users', userRouter);
app.use('/api/v1/diary', diaryRouter);
app.use('/api/v1/media', mediaRouter);

module.exports = app;