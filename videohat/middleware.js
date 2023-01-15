const models = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function isAdmin(req, res, next) {
    if(req.isAdmin) {
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}

function isSelf(req, res, next) {
    if(req.params._id === req.userid) {
        delete req.body.isAdmin;
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
}


function isAuthenticated(req, res, next) {
    if(req.headers.authorization) {
        const token = req.headers.authorization.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userid = decoded.id;
            req.isAdmin = decoded.isAdmin;
            next();
        }
        catch(e) {
            res.status(401).send('Invalid token');
        }
    } else {
        res.status(403).send('Unauthorized');
    }
}

async function hashPass(req, res, next) {

    const salt = await bcrypt.genSaltSync(10);
    req.body.password = await bcrypt.hashSync(req.body.password, salt);

    

    next();
}

async function removeAndReplacePass(req, res, next) {
    delete req.password;
    let user;
    try {
        user = await models.Users.findOne({
            _id: req.params._id
        });
        if(!user) {
            res.status(404).send('User not found');
        } else {
            req.password = user.password;
            next();
        }
    }catch(e) {
        res.status(500).send(e.message);
    }

}

function hidePass(req, res, next) {
    delete res.password;

    next();

}

function log(req, res) {
    models.Logs.create({
        action: req.action,
        target: req.params._id,
        actor: req.userid
    }, (e, result) => {
        if(e) {
            console.log(e);
        }
    });
}



module.exports.hidePass = hidePass;
module.exports.hashPass = hashPass;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isSelf = isSelf;
module.exports.isAdmin = isAdmin;
module.exports.removeAndReplacePass = removeAndReplacePass;
module.exports.log = log;