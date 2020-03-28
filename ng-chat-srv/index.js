const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

require('./config/sequelize');

const app = express();
const server = require('./app/websocket')(app);

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, PUT, POST, DELETE, OPTIONS');
    next();
});

const { localStrategy, jwtStrategy } = require('./app/authentication');
passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(passport.initialize());

require('./app/routes/auth.routes')(app);

const port = process.env.PORT || 5005;
server.listen(port, () => console.log(`Server is listening on port ${port}`));