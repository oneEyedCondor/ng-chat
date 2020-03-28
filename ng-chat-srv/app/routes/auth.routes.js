const passport = require('passport');
require('../authentication');

module.exports = (app) => {
    const auth = require('../controllers/auth.controller.js');

    app.post('/api/authentication', passport.authenticate('local'), auth.authentication);
    
    app.post('/api/registration', auth.registration);
}