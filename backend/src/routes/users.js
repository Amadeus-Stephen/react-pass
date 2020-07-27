const router = require('express').Router();
const bcrypt = require('bcryptjs')
const passport = require('passport')
const User = require('../models/User')
const bodyParser = require('body-parser')
const jsonParser = bodyParser.json()
// You can require and use your routes here ;)
router.get("/" , (req, res ) => { // i used this for getting the list of users 
    User.find() // remove this function in post production
    .then(data => {res.json(data)})
    .catch(err => {console.log(err)})
})
router.post('/signup', (req,res) => { // once a http post is made to this route it will check if there is any errors
    const {name , email , password , password2} = req.body // with each of the if statements
                                                        // it adds each error to a list then 
                                                //return that lists with a error key object 
                                                // i did that last part to make disginshing errors and actual data easier in the
                                                // react frontend 
    let errors = [] 

    if (!name || !email || !password || !password2) {
        errors.push({msg: 'Please fill in all fields'})
    }

    if (password !== password2) {
        errors.push({msg : " Passwords do not match"})
    }

    if (password.length < 6) {
        errors.push({msg: "Password should be atleast 6 characters long"})
    }
    
    if (errors.length > 0 ) {
        res.json({"errors":errors})
    } else {
        User.findOne({ email })
        .then( user => {
            if (user) {
                errors.push({msg: "email is already signed up"})
                res.json({"errors":errors})
            }
            else {
                const newUser = new User({
                    name,
                    email,
                    password,
                })
                bcrypt.genSalt(10 , (err, salt) => bcrypt.hash(newUser.password, salt, (err, hash) => { // uses a bcrypt hash to incrypt  the password
                    if (err) throw err  
                    newUser.password = hash
                    console.log(newUser)
                    newUser.save()
                    .then(user => {
                        res.json({userdata:user})
                    })
                    .catch(err => console.log(err))
                }))
            }
        })
        .catch(err => {console.log("error", err)})
    }
})

router.delete('/:id' , jsonParser, (req, res) => { // i used this for production again remove in your post
    User.findByIdAndDelete(req.params.id)
      .then(() => res.json('User deleted.'))
      .catch(err => res.status(400).json('Error: ' + err));
});

router.post('/login', //authenticates the user on a post request (takes in email and password **)
  passport.authenticate('local'),
  (req, res) => {
    res.json(req.user)
});
// logout
router.get('/logout', (req, res) => {
    req.logout()
    res.json('you are logged out')
})

module.exports = router;