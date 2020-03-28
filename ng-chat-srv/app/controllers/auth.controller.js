const jwt = require('jsonwebtoken');
const { secretKey } = require('../authentication');

const { User, checkBody } = require('../models/user');

exports.authentication = (req, res) => {
        const user = {
            id: req.user.id,
            name: req.user.name,
            login: req.user.login,
        };
    res.json({ message: 'authenticated', user, token: req.user.token });
};

exports.registration = (req, res) => {
    const error = checkBody(req.body);
    if(error) return res.status(500).send(error);

    User.findOne({ where: {login: req.body.login} })
        .then( user => {
            if(!user) {
                User.create(req.body)
                    .then(user => {
                        token = jwt.sign({ id: user.id }, secretKey);
                        user = {
                            id: user.id,
                            name: user.name,
                            login: user.login,
                        };
                        res.json({message: 'registered', user, token });
                    })
                    .catch(err => {
                        res.status(500).send({ message: err })
                    });
            } else {
                res.status(500).send({ message: `user '${user.login}' already exist` });
            }
        })
        .catch(err => res.status(500).send({ message: err }));
};