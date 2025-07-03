var assets = require('../controllers/assets');
var asset = require('mongoose').model('Assets');
 
/* GET home page. */
module.exports = function(app){
    app.route('/assetsdata').get(assets.readasset);
    app.route('/assetsdata').post(assets.addasset);
}
