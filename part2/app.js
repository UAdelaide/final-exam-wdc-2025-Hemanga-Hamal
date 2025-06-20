const express = require('express');
const path = require('path');

// added question 17
const db = require('./models/db');


require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '/public')));

const session = require('express-session');

app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Routes
const walkRoutes = require('./routes/walkRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api/walks', walkRoutes);
app.use('/api/users', userRoutes);

// added question 17
// GET /api/dogs
app.get('/api/dogs', async (req, res) => {
      try {
        const [rows] = await db.query(`
          SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username, Dog
          FROM Dogs
          JOIN Users ON Dogs.owner_id = Users.user_id
        `);
        res.json(rows);
      } catch (err) {
        res.status(500).json({ error: 'Failed to fetch dogs' });
    }
});


module.exports = app;
