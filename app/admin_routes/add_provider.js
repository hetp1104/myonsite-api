var admin = require('../admin_controllers/city');
var City = require('mongoose').model('City');
var admins = require('mongoose').model('admin');
var session = require("express-session");
var providers = require('../admin_controllers/provider'); // include Provider 
var Provider = require('mongoose').model('Provider'); // include Provider model
var admin_new = require('../admin_controllers/add_provider');

module.exports = function (app) {
    app.route('/add_provider_form').get(admin_new.add_provider_form);
    app.route('/add_provider_form').post(admin_new.add_provider_form);
    

}