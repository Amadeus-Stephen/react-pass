const express = require('express');
const mongoose = require("mongoose")
const passport = require('passport')
const session = require('express-session')
const cors = require("cors");
require('./passport')(passport) // get all need dependencies and requires passport
const  PORT  = process.env.PORT || 5000; // for auth


// Instantiate an Express Application
const app = express();

// Configure Express App Instance
app.use(express.urlencoded( { extended: false } ));
app.use(express.json()); // need to parse the json get and post requests
app.use(cors()) // need to make the http requests
app.use(passport.initialize())
app.use(passport.session())

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

// Assign Routes
app.use('/users', require('./routes/users.js')); 


// Handle errors

app.listen( 
    PORT,
    () => console.info('Server listening on port ', PORT)
);

async function run() { //connects to the local mongo db database (you can use atlas just replace
    // the first arg in the connect string)
    try {
        await mongoose.connect("mongodb://localhost:27017/authData", {
            useCreateIndex:true,
            useNewUrlParser:true,
            useUnifiedTopology:true
        })
        console.log("connected correctly to server")
    } catch(err) {
        console.log(err.stack)
    }
}

run().catch(console.dir)
