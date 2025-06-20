var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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
        //connect to the database
        db = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'dogwalks'
    });

    app.locals.db = db;

    //sample data because i am smart and this prac sucks
    const [[{count;userCount}]] = await db.query('SELECT COUNT(*) AS userCount FROM Users');
    if (userCount === 0) {'
        'INSERT INTO Users (username, email, password_hash, role) VALUES
        ('alice123', 'alice@example.com', 'hashed123', 'owner'),
        ('bobwalker', 'bob@example.com', 'hashed456', 'walker'),
        ('carol123', 'carol@example.com', 'hashed789', 'owner'),
        ('newwalker', 'new@example.com', 'hashed999', 'walker'),
        ('emilyowner', 'emily@example.com', 'hashed888', 'owner')
      `

})();

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

module.exports = app;
