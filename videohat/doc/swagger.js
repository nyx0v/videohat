const {Express, Request, Response} = require('express');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const {version} = require('../package.json');


const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'VideoHat API',
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
                    type: 'string',
                    format: 'JWT'
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
                        }
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
                    },
                },
                Video: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        },
                        title: {
                            type: 'string'
                        },
                        description: {
                            type: 'string'
                        },
                        thumbnail: {
                            type: 'string',
                            format: 'url'
                        },
                        source: {
                            type: 'string',
                            format: 'Enum(\'youtube\', \'dailymotion\')'
                        },
                        tags:{
                            type: 'array',
                        }
                    }
                },
                Videos: {
                    type: 'object',
                    properties: {
                        nextPageToken: {
                            type: 'string'
                        },
                        nextPage: {
                            type: 'int'
                        },
                        dm_has_more: {
                            type: 'boolean',
                            description: 'wether or not dailymotion has a next page'
                        },
                        videos: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/Video'
                            }
                            
                        }
                    }
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

