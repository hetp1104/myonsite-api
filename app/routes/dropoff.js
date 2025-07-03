var dropoff = require('../controllers/dropoff');
var dropoff = require('mongoose').model('dropoff');
///const swaggerJsDocs = require('swagger-jsdoc');
const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');
const mongoose = require('mongoose')
var DropOffModel = require('../models/dropoff');
DropOff = mongoose.model('DropOff')

//const port = process.env.port || 5000
 
module.exports = function(app){
    const options = {
    
        definition :{
            info:{
            title: 'DropOff API',
            description:'Information',
            contact:{
                name:'my OnSite Healthcare'
            },
            servers: ["http://localhost:5001"]
        }
     },
        apis:[".routes/dropoff.js"]
    };

    app.get(app.route('/dropoff').get(dropoff.readdropoff));

    app.route('/dropoff').post(dropoff.adddropoff);
}