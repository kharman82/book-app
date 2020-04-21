'use strict'  
require('dotenv').config();
const express = require('express');
const app = express;
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 3001;
const ejs = require('ejs');

app.use(express.urlencoded({ extended: true}));
// set the view engine for the server
app.set('view engine', 'ejs');
// static route
app.use(express.static('public'));

app.get('/hello', (request, response) =>{
    response.send('hello from ejs')
});

app.get('/hello', (request, response) =>{
    response.send('./pages/index.ejs', )
});

app.listen(PORT, () => {
console.log('server is running on PORT' + PORT)
});
