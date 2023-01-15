const models = require('./models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

function isAdmin(req, res, next) {
    console.log("isAdmin")
    if(req.isAdmin) {
        return next();
    } else {
        res.status(401).send('Unauthorized');
    }
}
function isSuperAdmin(req, res, next) {
    if(req.isSuperAdmin) {
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
            console.log(decoded)
            req.userid = decoded.id;
            req.isAdmin = decoded.isAdmin;
            req.isSuperAdmin = decoded.isSuperAdmin;
            console.log("going to isAdmin")
            return next();
        }
        catch(e) {
            res.status(401).send('Invalid token');
        }
    } else {
        res.status(401).send('Unauthorized');
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
    res.password= "hidden"

    next();

}

function isValidUserType(userType) {
   return (req, res, next) => {
        if(!req.body.type){
            req.body.type = userType;
            next();
        }
        else if(req.body.type === userType ) {
            next();
        } else {
            res.status(401).send('Unauthorized');
        }
    }

}

function noPrivilegeEscalation(req, res, next) {
    if(req.isAdmin && req.body.type === 'admin') {
        next();
    } if(!req.isAdmin && !req.isSuperAdmin && req.body.type === 'advertiser'){
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

async function isOwner(req, res, next) {
    console.log("isOwner")
    if(req.params._id){
        const ad = await models.Ads.findById(req.params._id);
        if(ad && (ad.owner == req.userid)) {
            return next();
        } else if (!ad) {
            res.status(404).send('Ad not found');
        } else {
            res.status(401).send('Unauthorized');
        }
    }
}

async function isAdminOrOwner(req, res, next) {
    if(req.params._id){
        const ad = await models.Ads.findById(req.params._id);
        if(ad && (ad.owner === req.userid || req.isAdmin)) {
            next();
        } else {
            res.status(401).send('Unauthorized');
        }
    }
}

function filterNonVerifiedAds(req, res) {
    //get body of response
    const body = res.body;
    //filter out non-verified ads
    const filteredBody = body.filter(ad => !ad.isVerified);
    //set body of response to filtered body
    res.body = filteredBody;
    //send response
    res.send(res.body);
}

async function verifyAd(req, res, next) {
    if(req.params._id){
        const ad = await models.Ads.findById(req.params._id);
        if(ad) {
            ad.isVerified = true;
            await ad.save();
            res.send(ad);
        } else {
            res.status(404).send('Ad not found');
        }
    }
}





module.exports.hidePass = hidePass;
module.exports.hashPass = hashPass;
module.exports.isAuthenticated = isAuthenticated;
module.exports.isAdmin = isAdmin;
module.exports.isSuperAdmin = isSuperAdmin;
module.exports.removeAndReplacePass = removeAndReplacePass;
module.exports.isSelf = isSelf;
module.exports.isOwner = isOwner;
module.exports.isAdminOrOwner = isAdminOrOwner;
module.exports.isValidUserType = isValidUserType;
module.exports.noPrivilegeEscalation = noPrivilegeEscalation;
module.exports.filterNonVerifiedAds = filterNonVerifiedAds;
module.exports.verifyAd = verifyAd;