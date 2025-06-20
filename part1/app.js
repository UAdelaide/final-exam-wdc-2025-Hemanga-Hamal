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
    const 

})();

app.use(express.static(path.join(__dirname, 'public')));

module.exports = app;

module.exports = app;
