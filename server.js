'use strict'  

require('dotenv').config();
const express = require('express');
const app = express();
const superagent = require('superagent');
const pg = require('pg');
const PORT = process.env.PORT || 3001;
const ejs = require('ejs');

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

const dbClient = new pg.Client(process.env.DATABASE_URL);
dbClient.connect(err => {
    if(err){
        console.log(err);
    } else {
        console.log('data base connected');
    }
});

// set the view engine for the server
app.use(express.urlencoded({extended: true}));

// static route
app.use(express.static('public'));

app.set('view engine', 'ejs');

//Constructor
function Book(data){
    const placeHolderImage ='https://i.imgur.com?J5LVHEL.jpg';
    let httpRegex = /^(http:\/\/)/g;
    this.title = data.title ? data.title : 'no title here';
    this.author = data.author ? data.author : 'no author here';
    this.description = data.description ? data.description : 'no description here';
    this.isbn = data.industryIdentifiers ? `ISBN_13 ${data.industryIdentifiers[0].indentifier}` : 'no isbn';
    this.imageUrl = data.imageLinks ? data.imageLinks.smallThumbnail.replace(httpRegex, 'https://') : placeHolderImage;
    this.bookshelf = data.bookshelf ? data.bookshelf : 'no bookshelf';
}
// cahnge http to https ?

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
        errorHandler('superagent error', request, response);
   
    });
});

app.get('/', (request, response) =>{
    let selectQuery = `SELECT * FROM books;`;
    return dbClient.query(selectQuery)
        .then(results => {
            if(results.rowCount === 0){
                console.log('RENDER FORM DB');
                response.render('pages/searches/new');
            }else {
                response.render('/pages/index', {books : results.rowCount});
            }
        })
        .catch(error => {
            errorHandler('database error', request, response);
        });
});

//jacob / express/ database?
app.get('/books/id:', (request, response) => {
    const bookId = request.params.id; 

    console.log(request.query);
    console.log(request.body);

    let selectQuery = 'SELECT * FROM books WHERE id=$1;';
    let selectValues = [bookId];
    
    dbClient.query(selectQuery, selectValues)
    .then(data => {
        console.log(data.rows);
        response.send('In Progress');
    });
});

//if no book id
app.get('books', (request, response) => response.send('no id present'));

app.post('/books', (request, response) => {
    const { title, author, description, isbn, image_url, bookshelf} = request.body;

    let addBookSQL = `INSERT INTO books (title, author, description, isbn image_url, bookshelf) VALUES ($1,$2,$3,$4,$5,$6)`;
    let addBookValues = [title, author, description, isbn, image_url, bookshelf];

    dbClient.query(addBookSQL, addBookValues)
    .then(data => {
        console.log(data.rows);
        // response.send('adding book in progress');
        response.render('pages/details', {book: data.rows[0]});
    })
    .catch(error => {
        errorHandler('somethings bad over here', request, response);
    });
});

//update a resource
app.put('/books/:id', (request, response) => {
    const bookId = request.params.id;
    const { title, author, description, image_url, isbn, bookshelf} = request.body;
    console.log(request.body.title);

    //query db for books that have id
    let SQL = `UPDATE book SET title=$1, author=$2, description=$3, image_url=$4, isbn=$5, bookshelf=$6 WHERE id=$7`;
    let values = [title, author, description, image_url, isbn, bookshelf, bookId];

    // use SQL UPDATE WHERE to modify the row record
    dbClient.query(SQL, values)
    .then(data => {
        response.send(data); //render later
    })
    .catch(error => {
        errorHandler('this is an error bad bad bad bad', request, response);
    });

    // send back new row
    //invalidate old thing and replace with new
    response.send(bookId);
});

// app.get('/', (request, response) =>{
//     response.render('./pages/index.ejs')
// });

function errorHandler(error, request, response){
    console.log(error);
    response.render('./pages/error', {error:'Sorry someting wrong' });
}

app.listen(PORT, () => {
console.log('server is running on PORT' + PORT)
});
