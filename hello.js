const express = require('express');
const path = require('path')
const app = express();
const cors = require('cors')
app.use(cors())

const mysql = require('mysql');
const session = require('express-session')
const MySQLStore = require('express-mysql-session');
const Router = require('./Router');


const root = require('path').join(__dirname, 'client', 'build')
app.use(express.static(root));

app.use (express.json());

const db = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'password',
    database:'users'
});

db.connect(function(err){
    if(err){
        console.log('DB error'+err);
        throw err;
    }
})

const sessionStore = new MySQLStore({
    expiration: (1825 *86400*1000),
    endConnectionOnClose: false,
},db);

app.use(session({
    key:'dewfwded',
    secret:'acwrvwc',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie:{
        maxAge: (1825 *86400*1000),
        httpOnly: false
    }
}))

new Router(app,db);

require('dotenv').config()
app.use(express.static(path.join(__dirname,'public')))

app.use(express.static('public'));  
app.use('/api/images', express.static('images')); 
const PORT = process.env.PORT || 3000

app.listen(PORT,()=>{
    console.log("listening on port "+ PORT)
});




