const express = require('express');
const router = express.Router();

router.get('/dogs', async (req, res) => {
    try {
        const db = req.app.locals.db;
        const [dogs] = await db.execute('SELECT * FROM Dogs');
        res.json(dogs);
    } catch (err) {
        console.error('Error fetching dogs:', err);
