const express = require('express');
const router = express.Router();
const db = require('../models/db');

// GET all users (for admin/testing)
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT user_id, username, email, role FROM Users');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST a new user (simple signup)
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    const [result] = await db.query(`
      INSERT INTO Users (username, email, password_hash, role)
      VALUES (?, ?, ?, ?)
    `, [username, email, password, role]);

    res.status(201).json({ message: 'User registered', user_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  res.json(req.session.user);
});

// POST login - Modified to use username and create session
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.query(`
      SELECT user_id, username, email, role FROM Users
      WHERE username = ? AND password_hash = ?
    `, [username, password]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create session for logged-in user
    req.session.user = {
      user_id: rows[0].user_id,
      username: rows[0].username,
      email: rows[0].email,
      role: rows[0].role
    };

    res.json({
      message: 'Login successful',
      user: rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST logout - Added logout functionality
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }

    // Clear cookie with matching options
    res.clearCookie('connect.sid', {
      path: '/',
      httpOnly: false,
      secure: false
    });

    res.json({ message: 'Logged out successfully' });
  });
});

// GET the dogs data where the owner's id matches to their owned dogs
router.get('/dogs', async (req, res) => {
  if (!req.session.user || !req.session.user.user_id) {
    return res.status(401).json({ error: 'Unauthorized: User not logged in' });
  }

  const ownerID = req.session.user.user_id;

  try {
    const [rows] = await db.query('SELECT dog_id, name FROM Dogs WHERE owner_id = ?', [ownerID]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Dogs' });
  }
});




module.exports = router;


