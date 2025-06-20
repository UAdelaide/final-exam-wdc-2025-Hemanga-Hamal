const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

const session = require('express-session');

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-here',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));


// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');
const apiRoutes = require('./routes/apiRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);


module.exports = app;
