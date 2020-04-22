'use strict'  

require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 3001;
const ejs = require('ejs');

// set the view engine for the server
app.use(express.urlencoded({extended: true}));

// static route
app.use(express.static('public'));

app.set('view engine', 'ejs');

//Constructor
function Book(data){
    this.image= data.image;
    this.title = data.title;
    this.author = data.author;
    this.description = data.description;
    this.isbn = data.isbn;
    this.bookshelf =data.bookshelf;
}

app.get('/hello', (request, response) => {
    response.send('hello from ejs')
});


app.get('/searches/new', (request, response) => {
    response.render('./pages/searches/new');
});

//Superagent
app.post('/searches', (request, response) => {
    let queryType = request.body.search[0];
    let queryTerms = request.body.search[1];
    let url = `https://www.googleapis.com/books/v1/volumes?q=+in${queryTerms}:${queryType}`;
    superagent.get(url) // returns promise
    .then(results => results.body.items.map(book => new Book(book.volumeInfo)))
    .then(book => response.render('./pages/searches/show', {book: book}))
    .catch(error => {
        console.log('superagent error', request, response);
   
    });
});

app.get('/', (request, response) =>{
    response.render('./pages/index.ejs')
});

app.listen(PORT, () => {
console.log('server is running on PORT' + PORT)
});
