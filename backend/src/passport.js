const LocalStrategy = require("passport-local").Strategy
const bcrypt = require("bcryptjs")


const User = require('./models/User') //gets the user model


module.exports = (passport) => {
    passport.use( // defines localstrategy used in the post request routes
        new LocalStrategy({usernameField: 'email'}, (email , password , done) => {
            User.findOne({ email:email}) // finds the email on login post request
            .then(user => {
                if (!user) {
                    return done(null, false, {message:"that email is not signed up"})
                }
                bcrypt.compare(password, user.password , (err , isMatch) => { //compares the password with the bycrpt version
                    if(err) throw err;

                    if (isMatch) {
                        return done(null, user) // if the compare is successful it will return the user 
                    } else {
                        return done(null , false , {message : 'Incorrect Password'}) // flages if incorrect 
                    }
                })
            })
            .catch(err => console.log(err))
        })
    )
    passport.serializeUser((user, done) => { //incrypt
        done(null, user.id);
    });
      
    passport.deserializeUser((id, done) => { // decrypt
        User.findById(id , (err , user) => {
            done(err, user)
        })
    })
}






