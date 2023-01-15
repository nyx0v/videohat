
//index.js

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const middleware = require('./middleware');
const crud = require('./crud');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');

const uuidv4 = require('uuid');



const swaggerDocs = require('./doc/swagger');

const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = process.env.PORT || 4000;

const upload = multer({ dest: multer.memoryStorage() });

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//create superadmin if no users exist
models.Users.find({}, async (e, result) => {
    if(result.length === 0) {
        const user = new models.Users({
            username: 'superadmin',
            password: bcrypt.hashSync('superadmin12345', 10),
            type: 'superadmin',
            email: 'superadmin',
            balance: 0
        });
        await user.save();
    }
});

//routes


/**
 * @swagger
 * /api/users/login:
 *  post: 
 *   description: Login
 *   tags: [Users]
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Credentials'
 *   responses:
 *    200:
 *     description: Login successful
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Token'
 *    400:
 *     description: Missing username or password
 *    401:
 *     description: Invalid username or password
 *    500:
 *     description: Error message
 *     
 *       
 *      
 */
app.post('/api/users/login', async (req, res) => {
    const { username, password } = req.body;
    if(!username || !password) {
        return res.status(400).send('Missing username or password');
    }
    let user;
    try {
        user = await models.Users.findOne({ username: username });
        if(!user) {
            res.status(401).send('Invalid username');
        } else {
            const match = bcrypt.compareSync(password, user.password);
            if(match) {
                const token = jwt.sign({ id: user._id, isAdmin: user.type=='admin', isSuperAdmin: user.type=='superadmin' }, process.env.JWT_SECRET);
                res.send({
                    token: token,
                    user: {
                        _id: user._id,
                        username: user.username,
                        type: user.type
                    }
                });
            } else {
                res.status(401).send('Invalid password');
            }
        }

    } catch(e) {
        res.status(500).send(e.message);
    }

});

const userCrud = crud(models.Users);
//users
/**
 * @swagger
 * /api/users/{_id}:
 *  get:
 *   description : get user info
 *   tags: [Users]
 *   parameters:
 *    -
 *     name: _id
 *     in: path
 *     description: user id
 *   responses:
 *    200:
 *     description: User data
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/UserWithoutPassword'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    404:
 *     description: User not found
 *    500: 
 *     description: Error message
 * 
 */
app.get('/api/users/:_id', [middleware.isAuthenticated, middleware.isSelf, userCrud.readOne, middleware.hidePass]);
/**
 * @swagger
 * /api/users/register:
 *  post:
 *   description : register new user
 *   tags: [Users]
 *   requestBody:
 *    content: 
 *     application/json:
 *      schema: 
 *       $ref: '#/components/schemas/User'
 *   responses:
 *    200:
 *     description: User creater
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/UserWithoutPassword'

 *    500: 
 *     description: Error message
 * 
 */
app.post('/api/users/register', [middleware.isValidUserType('advertiser'), middleware.hashPass], userCrud.create); //create admin blocker
/**
 * @swagger
 * /api/admins/register:
 *  post:
 *   description : register new admin
 *   tags: [Users]
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/User'
 *   responses:
 *    200:
 *     description: Admin created
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/UserWithoutPassword'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    500:
 *     description: Error message
 * 
 */
app.post('/api/admins/register', [middleware.isAuthenticated, middleware.isSuperAdmin, middleware.hashPass], userCrud.create); //create admin blocker

/**
 * @swagger
 * /api/users/{_id}:
 *  put:
 *   description : update user
 *   tags: [Users]
 *   parameters:
 *    -
 *     name: _id
 *     desciption: id of user to update
 *     in: path
 *   requestBody:
 *    content:
 *     application/json: 
 *      schema:
 *       $ref: '#/components/schemas/User'
 * 
 *   responses:
 *    200:
 *     description: User updated
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *
 *    500: 
 *     description: Error message
 * 
 */
app.put('/api/users/:_id', [middleware.isAuthenticated, middleware.isAdminOrOwner, middleware.noPrivilegeEscalation], userCrud.update); 
/**
 * @swagger
 * /api/users/{_id}:
 *  delete:
 *   description : delete user
 *   tags: [Users]
 *   parameters:
 *    -
 *     name: _id
 *     desciption: id of user to update
 *     in: path
 *   responses:
 *    200:
 *     description: User deleted
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *
 *    500: 
 *     description: Error message
 * 
 */
app.delete('/api/users/:_id', [middleware.isAuthenticated, middleware.isSelf], userCrud.remove);


//ads
/**
 * @swagger
 * /api/ads/upload/{_ad}:
 *  post:
 *   description : upload image for ad
 *   tags: [Ads]
 *   parameters:
 *    -
 *     name: _ad
 *     in: path
 *     description: ad id
 *   requestBody:
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       properties:
 *        file:
 *         type: string
 *         format: binary
 *   responses:
 *    200:
 *     description: Image uploaded
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Ad'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    404:
 *     description: Ad not found
 *    500:
 *     description: Error message
 *  
 */
app.post('/api/ads/upload/:_ad', [middleware.isAuthenticated], upload.single('file'), (req, res) => {
    // read ad from mongo db
    models.Ads.findOne({ _id: req.params._ad }, (err, ad) => {
        if(err) {
            console.log(err);
            res.status(500).send(err.message);
        } else {
            //create uuid for file
            const uuid = uuidv4();
            //create file name
            const fileName = `${uuid}.${req.file.originalname.split('.').pop()}`;
            // save file to ./uploads
            fs.writeFile(`./uploads/${fileName}`, req.file.buffer, (err) => {
                if(err) {
                    console.log(err);
                    res.status(500).send(err.message);
                } else {
                    // add fileName to content in ad
                    ad.content = fileName;
                    // save ad to mongo db
                    ad.save((err, ad) => {
                        if(err) {
                            console.log(err);
                            res.status(500).send(err.message);
                        } else {
                            res.status(200).send(ad);
                        }
                    
                    });
                }
            });
        }
    });  
});

/**
 * @swagger
 * /api/ads/non-verified:
 *  get:
 *   description : get all non-verified ads
 *   tags: [Ads]
 *   responses:
 *    200:
 *     description: Ads found
 *     content:
 *      application/json:
 *       schema:
 *        type: array
 *        items:
 *         $ref: '#/components/schemas/Ad'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    404:
 *     description: Ads not found
 *    500:
 *     description: Error message
 *    
 */
app.get('/api/ads/non-verified', [middleware.isAuthenticated, middleware.isAdmin, crud(models.Ads, true).readMany], middleware.filterNonVerifiedAds);

/**
 * @swagger
 * /api/ads:
 *  post:
 *   description : create ad
 *   tags: [Ads]
 *   requestBody:
 *    content:
 *     application/json:
 *      schema:
 *       $ref: '#/components/schemas/Ad'
 *   responses:
 *    200:
 *     description: Ad created
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Ad'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    500:
 *     description: Error message
 * 
 */
app.post('/api/ads', [middleware.isAuthenticated], crud(models.Ads).create);

/**
 * @swagger
 * /api/ads/{_id}:
 *  get:
 *   description : get ad
 *   tags: [Ads]
 *   parameters:
 *    -
 *     name: _id
 *     desciption: id of ad to get
 *     in: path
 *   responses:
 *    200:
 *     description: Ad found
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Ad'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    404:
 *     description: Ad not found
 *    500:
 *     description: Error message
 * 
 * 
 */
app.get('/api/ads/:_id', [middleware.isAuthenticated, middleware.isOwner], crud(models.Ads).readOne);


/**
 * @swagger
 * /api/ads/{_id}/verify:
 *  post:
 *   description : verify ad
 *   tags: [Ads]
 *   parameters:
 *    -
 *     name: _id
 *     desciption: id of ad to verify
 *     in: path
 *   responses:
 *    200:
 *     description: Ad verified
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Ad'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    404:
 *     description: Ad not found
 *    500:
 *     description: Error message
 * 
 */
app.post('/api/ads/:_id/verify', [middleware.isAuthenticated, middleware.isAdmin, middleware.verifyAd]);

/**
 * @swagger
 * /api/ads/{_id}:
 *  delete:
 *   description : delete ad
 *   tags: [Ads]
 *   parameters:
 *    -
 *     name: _id
 *     desciption: id of ad to delete
 *     in: path
 *   responses:
 *    200:
 *     description: Ad deleted
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *    404:
 *     description: Ad not found
 *    500:
 *     description: Error message
 *      
 *  
 */
app.delete('/api/ads/:_id', [middleware.isAuthenticated, middleware.isAdminOrOwner], crud(models.Ads).remove);



// 
// Server
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
    swaggerDocs(app, port);
});