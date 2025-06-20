var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// database connection setup
let db;

(async () => {
  try {
    // Connect to the database
    db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'DogWalkService'
    });

    // Optional: Insert sample data here for testing (only if tables are already created)
    const [users] = await db.execute('SELECT COUNT(*) as count FROM Users');
    if (users[0].count === 0) {
      // Insert sample users
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('newwalker', 'new@example.com', 'hashed999', 'walker'),
        ('emilyowner', 'emily@example.com', 'hashed888', 'owner')
      `);
    }

    const [dogs] = await db.execute('SELECT COUNT(*) as count FROM Dogs');
    if (dogs[0].count === 0) {
      await db.execute(`
        INSERT INTO Dogs (name, size, owner_id) VALUES
        ('Max', 'medium', (SELECT user_id FROM Users WHERE username='alice123')),
        ('Bella', 'small', (SELECT user_id FROM Users WHERE username='carol123')),
        ('Rocky', 'large', (SELECT user_id FROM Users WHERE username='alice123'))
      `);
    }

    const [walks] = await db.execute('SELECT COUNT(*) as count FROM WalkRequests');
    if (walks[0].count === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
        ((SELECT dog_id FROM Dogs WHERE name='Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name='Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted')
      `);
    }

  } catch (err) {
    console.error('Database setup error:', err);
  }
})();

// Route 1: /api/dogs
app.get('/api/dogs', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT Dogs.name AS dog_name, Dogs.size, Users.username AS owner_username
      FROM Dogs
      JOIN Users ON Dogs.owner_id = Users.user_id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dogs' });
  }
});

// Route 2: /api/walkrequests/open
app.get('/api/walkrequests/open', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT WalkRequests.request_id, Dogs.name AS dog_name, WalkRequests.requested_time,
             WalkRequests.duration_minutes, WalkRequests.location, Users.username AS owner_username
      FROM WalkRequests
      JOIN Dogs ON WalkRequests.dog_id = Dogs.dog_id
      JOIN Users ON Dogs.owner_id = Users.user_id
      WHERE WalkRequests.status = 'open'
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch open walk requests' });
  }
});

// Route 3: /api/walkers/summary
app.get('/api/walkers/summary', async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT u.username AS walker_username,
             COUNT(r.rating_id) AS total_ratings,
             ROUND(AVG(r.rating), 1) AS average_rating,
             (
               SELECT COUNT(*)
               FROM WalkApplications wa
               JOIN WalkRequests wr ON wa.request_id = wr.request_id
               WHERE wa.walker_id = u.user_id AND wr.status = 'completed'
             ) AS completed_walks
      FROM Users u
      LEFT JOIN WalkRatings r ON u.user_id = r.walker_id
      WHERE u.role = 'walker'
      GROUP BY u.username
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch walker summary' });
  }
});

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

module.exports = app;
