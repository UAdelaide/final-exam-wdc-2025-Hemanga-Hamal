var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mysql = require('mysql2/promise');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

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
        // connect to the database
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'dogwalks'
    });

    app.locals.db = db;

    //sample data because i am smart and this prac sucks
    const [[{ count: userCount }]] = await db.execute('SELECT COUNT(*) as count FROM Users');
    if (userCount === 0) {
      await db.execute(`
        INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('newwalker', 'new@example.com', 'hashed999', 'walker'),
        ('emilyowner', 'emily@example.com', 'hashed888', 'owner')
      `);
    }

    const [[{ count: dogCount }]] = await db.execute('SELECT COUNT(*) as count FROM Dogs');
    if (dogCount === 0) {
      await db.execute(`
        INSERT INTO Dogs (name, size, owner_id) VALUES
        ('Max', 'medium', (SELECT user_id FROM Users WHERE username='alice123')),
        ('Bella', 'small', (SELECT user_id FROM Users WHERE username='carol123')),
        ('Rocky', 'large', (SELECT user_id FROM Users WHERE username='alice123'))
      `);
    }

  const [[{ count: walkCount }]] = await db.execute('SELECT COUNT(*) as count FROM WalkRequests');
    if (walkCount === 0) {
      await db.execute(`
        INSERT INTO WalkRequests (dog_id, requested_time, duration_minutes, location, status) VALUES
        ((SELECT dog_id FROM Dogs WHERE name='Max'), '2025-06-10 08:00:00', 30, 'Parklands', 'open'),
        ((SELECT dog_id FROM Dogs WHERE name='Bella'), '2025-06-10 09:30:00', 45, 'Beachside Ave', 'accepted')
      `);
    }

  } catch (err) {
        throw new Error('Database connection failed: ' + err.message);
  }
})();


app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

