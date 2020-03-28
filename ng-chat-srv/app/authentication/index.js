const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const jwt = require('jsonwebtoken');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user').User;

const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'vv31h2nb23j4'
};

passport.serializeUser((user, cb) => {
    cb(null, user.name);
});
passport.deserializeUser((username, cb) => {
    findUser(username, cb);
});

const findUser = (login, cb) => {
    User.findOne({ where: {login} })
        .then(user => cb(null, user))
        .catch(err => cb(err));
}
        
const localStrategy = new LocalStrategy({ usernameField: 'login' }, (username, password, done) => {
    findUser(username, (err, user) => {
        if (err) { return done(err); }
        if (!user) {
            return done(null, false, { message: 'Incorrect login.' });
        }
        if (password !== user.password ) {
            return done(null, false, { message: 'Incorrect password.' });
        }
        user.token = jwt.sign({ id: user.id }, jwtOptions.secretOrKey);
        return done(null, user);
    });
});

const jwtStrategy = new JwtStrategy(jwtOptions, (jwt_payload, next) => {
    User.findByPk(jwt_payload.id)
        .then(user => next(null, user))
        .catch(err => res.status(500).send({ message: err }));
});

module.exports = {
    localStrategy,
    jwtStrategy,
    secretKey: jwtOptions.secretOrKey
};