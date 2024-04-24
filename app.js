require('dotenv').config();
const express = require('express');
const app = express();
const ErrorHandler = require('./utils/ErrorHandler');
const {generatedErrors} = require('./middlewares/error');
const path = require('path');



// Database connection
require('./models/database').connectDatabase();


app.set('views', path.join(__dirname, 'views'));

// Set view engine as ejs
app.set('view engine', 'ejs');

// Logger
const logger = require('morgan');
app.use(logger('dev'));

// Body parser
app.use(express.json());
app.use(express.urlencoded({extended:true}));

// routes
app.use('/', require('./routes/indexRoutes'))

// error handling
app.all('*', (req, res, next) => {
    next(new ErrorHandler(`Requested URL Not Found ${req.url}`,404))
})
app.use(generatedErrors);

app.listen(process.env.PORT,()=>{
    console.log(`Server running on PORT ${process.env.PORT}`)
})