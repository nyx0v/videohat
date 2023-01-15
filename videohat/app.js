
//index.js

// Imports
const express = require('express');
const bodyParser = require('body-parser');
const models = require('./models');
const middleware = require('./middleware');
const crud = require('./crud');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const VideoSeach = require('./video-search');
const Youtube = require('./youtube');
const DailyMotion = require('./dailymotion');

const swaggerDocs = require('./doc/swagger');

const dotenv = require('dotenv');
dotenv.config();


const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes


/**
 * @swagger
 * /api/users/login:
 *   post: 
 *    description: Login
 *    tags: [Users]
 *    requestBody:
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Credentials'
 *    responses:
 *     200:
 *      description: Login successful
 *      content:
 *       application/json:
 *        schema:
 *         $ref: '#/components/schemas/Token'
 *     400:
 *      description: Missing username or password
 *     401:
 *      description: Invalid username or password
 *     500:
 *      description: Error message
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
            const match = await bcrypt.compareSync(password, user.password);
            if(match) {
                const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET);
                res.send({
                    token: token,
                    user: {
                        _id: user._id,
                        username: user.username,
                        email: user.email,
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
app.post('/api/users/register', [middleware.hashPass], userCrud.create);
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
app.put('/api/users/:_id', [middleware.isAuthenticated, middleware.isSelf], userCrud.update); 
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
 * /api/ad:
 *  get:
 *   description : get add
 *   tags: [Ads]
 *   parameters:
 *    -
 *     name: tags
 *     description: filter by tags (add a new query parameter for each tag)
 *     in: query

 * 
 *   responses:
 *    200:
 *     description: ad
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Ad'
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *
 *    500: 
 *     description: Error message
 * 
 */
app.get('/api/ad', middleware.isAuthenticated, async (req, res) => {
    const tags = res.query.tags;
    try {
        const ads = await models.Ads.find({ tags: {$in: tags} });
    } catch(e) {
        return res.status(500).send(e.message);
    }

    if(ads) {
        res.send(ads[Math.floor(Math.random() * ads.length)]);
    } else {
        res.status(404).send('No ads found');
    }

});

//videos

/**
 * @swagger
 * /api/videos/:
 *  get:
 *   description : search for videos
 *   tags: [Videos]
 *   parameters:
 *    -
 *     name: query
 *     description: search query
 *     in: query
 *    -
 *     name: page
 *     description: dailymotion page
 *     in: query
 *    -
 *     name: pageToken
 *     description: youtube pageToken
 *     in: query

 * 
 *   responses:
 *    200:
 *     description: videos
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Videos'
 *    400:
 *     description: Bad request parameters
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *   
 *    500: 
 *     description: Error message
 * 
 */

app.get('/api/videos', middleware.isAuthenticated, async (req, res) => {
    const query= req.query.query;
    let page = req.query.page;
    let pageToken= req.query.pageToken;
  

    
    if(!query) {
        return res.status(400).send('Missing query');
    }
    if(page) {
        if(isNaN(page)) {
            return res.status(400).send('Invalid page');
        }
        else {
            page = parseInt(page);
        }
    }
    if(!pageToken || pageToken.length == 0) {
        pageToken = undefined;
    
        
    }
    const vs = new VideoSeach();
    try {
        const videos = await vs.search(query, page, pageToken);
        res.send(videos);
    } catch(e) {
        res.status(500).send(e.message);
    }
});

/**
 * @swagger
 * /api/video/:
 *  get:
 *   description : get video by id
 *   tags: [Videos]
 *   parameters:
 *    -
 *     name: id
 *     description: id of video
 *     in: query
 *    -
 *     name: source
 *     description: youtube or dailymotion
 *     in: query
 *    -
 *     name: iframe_width
 *     description: width of iframe
 *     in: query
 *    -
 *     name: iframe_height
 *     description: height of iframe
 *     in: query
 *   responses:
 *    200:
 *     description: video
 *     content:
 *      application/json:
 *       schema:
 *        $ref: '#/components/schemas/Video'
 *    400:
 *     description: Bad request parameters
 *    401:
 *     description: Invalid token
 *    403:
 *     description: Unauthorized
 *   
 *    500: 
 *     description: Error message
 * 
 */
app.get('/api/video', async (req, res) => {
    const id = req.query.id;
    const source = req.query.source;
    let iframe_height = req.query.iframe_height;
    let iframe_width = req.query.iframe_width;
    if(!id || !source) {
        return res.status(400).send('Missing id or source');
    }
    if (source === 'youtube') {
        const yt = new Youtube();
        try {
            const video = await yt.getVideo(id, iframe_width, iframe_height);
            res.send(video);
        } catch(e) {
            res.status(500).send(e.message);
        }
    } else if (source === 'dailymotion') {
        const dm = new DailyMotion();
        try {
            const video = await dm.getVideo(id, iframe_width, iframe_height);
            res.send(video);
        } catch(e) {
            res.status(500).send(e.message);
        }
    } else {
        return res.status(400).send('Invalid source');
    }

});

// 
// Server
app.listen(port, () => {
    console.log(`Listening on port ${port}`)
    swaggerDocs(app, port);
});