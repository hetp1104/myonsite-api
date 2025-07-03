var assetreadings = require('../controllers/assetreadings');
var assetreading = require('mongoose').model('AssetReadings');
var session = require("express-session");
var admins = require('mongoose').model('admin');
 
/* GET home page. */
module.exports = function(app){
    app.route('/assetreadings').get(assetreadings.readassetreading);
    app.route('/assetreadings').post(assetreadings.addassetreading);
    app.route('/provider_timeline').get(assetreadings.provider_timeline);
    app.route('/provider_timeline').post(assetreadings.provider_timeline);
   app.route('/getPatientTripData').get(assetreadings.getPatientTripData);
   app.route('/save_distance').post(assetreadings.save_distance);
   app.route('/getprovidermileage').get(assetreadings.getprovidermileage);
   app.route('/getAssetReadings').post(assetreadings.getAssetReadings);
    // Add this line for route calculation page
    app.route('/route_calculation').get(assetreadings.renderRouteCalculationPage);  
   
   
    
}

