//models.js
const mongoose = require('mongoose');
const mongo = process.env.MONGO_URL || 'mongodb://localhost:27017/videohat';

// ===============
// Database Config
// ===============
const Schema = mongoose.Schema;
mongoose.connect(mongo, {useNewUrlParser: true});

// =======
// Schemas
// =======

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
  },
  { strict: false }
);



const adsSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true,
        default: []
    },
    priceToPay: {
        type: Number,
        required: true,
        default: .0
    },
    pricePaid: {
        type: Number,
        required: true,
        default: .0
    },
    totalViews: {
        type: Number,
        required: true,
        default: 0
    },
    totalClicks: {
        type: Number,
        required: true,
        default: 0
    },
    content: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'adUsers',
        required: true
    },
});








const models = {};
models.Users = mongoose.model('users', userSchema);
models.Ads = mongoose.model('ads', adsSchema);

module.exports = models;