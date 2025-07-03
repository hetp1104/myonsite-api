var assetreadings = require('../controllers/assetreadings');
var assetreading = require('mongoose').model('AssetReadings');
const express = require('express');
const app = express();
const swaggerJsDocs = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

///const port = process.env.port || 5001
 
module.exports = function(app){
const swaggerOptions = {

    swaggerDefination :{
        info:{
        title: 'AssetReadings API',
        description:'Information',
        contact:{
            name:'my OnSite Healthcare'
        },
        ///servers: ["http://localhost:5001"]
    }
 },
    apis:["./assetreadings.js"]
};
const swaggerDocs = swaggerJSDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/* GET home page. */
// For routing of Get and Post request
// Het,saumya 09/16/2022

    /**
     *@swagger
     * /assetreadings:
     * get:
     *      description: Use to request of all assetreadings
     *      responses:
     *          '200':
     *           description: Success

     */
    app.route('/assetreadings').get(assetreadings.readassetreading);

     /**
     *@swagger
     * /assetreadings:
     * Post:
     *      description: Use to post data in assetreadings
     * responses:
     *          '20':
     *           description: Success

     */
    app.route('/assetreadings').post(assetreadings.addassetreading);
}
