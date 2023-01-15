const {Express, Request, Response} = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {version} = require('../package.json');


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VideoHat Ads API',
            description: 'API Documentation',
            version,
        },
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                Credentials : {
                    type: 'object',
                    properties : {
                        username: {
                            type: String,
                            required: true
                        },
                        password: {
                            type: String,
                            required: true
                        }
                    }
                },
                Token : {
                    type: 'object',
                    format: 'json',
                    properties: {
                        token: {
                            type: 'string',
                            format: 'JWT'
                        },
                        user: {
                            $ref: '#/components/schemas/UserWithoutPassword'
                        }
                    }
                },
                UserWithoutPassword: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'MongoDB ObjectId'
                        },
                        username: {
                            type: 'string',

                        },
                        email: {
                            type: 'string',
                            format: 'email'
                        },
                        type: {
                            type: 'enum',
                            enum: ['advertiser', 'admin', 'superadmin']
                        },
                    }
                },
                User: {
                    
                    type: 'object',
                    properties: {
                        username : {
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
                        balance: {
                            type: Number,
                            required: true,
                            default: 0
                        },
                        type: {
                            type: String,
                            enum: ['advertiser', 'admin', 'superadmin'],
                            required: true,
                            default: 'advertiser'
                        }
                    },
                },
                
                Ad: {
                    type: 'object',
                    properties: {
                        _id: {
                            type: 'string',
                            format: 'MongoDB ObjectId'
                        },
                        title: {
                            type: String,
                            required: true
                        },
                        description: {
                            type: String,
                            required: false
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
                            type: String,
                            format: 'MongoDB ObjectId',
                            required: true
                        },
                        isVerified: {
                            type: Boolean,
                            required: true,
                            default: false
                        },
                        link: {
                            type: String,
                            required: true,
                            format: 'url'
                        }
                    },
                },
            
            
            
            },



            
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./app.js'],
};


const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app, port) {
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
    app.get('/api/docs.json', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
}

module.exports = swaggerDocs;

