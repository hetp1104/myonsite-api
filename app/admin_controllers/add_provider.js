var utils = require('../controllers/utils');
var Settings = require('mongoose').model('Settings');
var Country = require('mongoose').model('Country');
var City = require('mongoose').model('City');
var City_type = require('mongoose').model('city_type');
var Providers = require('mongoose').model('Provider');
var Provider = require('mongoose').model('Provider');
var ZoneValue = require('mongoose').model('ZoneValue');
var moment = require('moment');
var CityZone = require('mongoose').model('CityZone');
var tj = require('togeojson');
var fs = require('fs');
var DOMParser = require('xmldom').DOMParser;
var array = [];
var fs = require("fs");
var console = require('../controllers/console');
var mongoose = require('mongoose');
const { isNull } = require('util');
var Schema = new mongoose.Types.ObjectId;
var ObjectId = new mongoose.Types.ObjectId;

exports.add_provider_form = function (req, res) {
    console.log('request:', req);
    if (typeof req.session.userid != "undefined") {
        var utils = require('../controllers/utils');
        var types = utils.PAYMENT_TYPES();

        var city_type_data;

        if (req.method === 'POST') {
            console.log('Form Data Submitted:');
            for (const [key, value] of Object.entries(req.body)) {
                console.log(`${key}: ${value}`);
            }
            console.log('Request Body:', req.body);

            // Create a new Provider instance and include all fields
            var provider = new Provider({
                "email": req.body.email,
               "phone": req.body.phone,
               "last_name": req.body.last_name,
               "first_name": req.body.first_name,
               "service_type": ObjectId("6596625d8d78bc2bdb1486e6"),
               "cityid": ObjectId("5d11e24695bbc03595c12135"),
               "country_id": ObjectId("5d11e21695bbc03595c12134"),
               "admintypeid": null,
               "provider_type": 0,
               "provider_type_id": null,
               "providerLocation": [0,0],
               "zone_queue_no": 0,
               "in_zone_queue": false,
               "total_referrals": 0,
               "referral_code": "",
               "is_use_google_distance": false,
               "domain_name": "Google",
               "country": "United States",
               "city": "Sarasota",
               "bearing": 0,
               "device_timezone": "America/New_York",
               "login_by": "manual",
               "social_unique_id": "",
               "zipcode": "",
               "address": "",
               "bio": "",
               "app_version": "1.0.4",
               "device_type": "ios",
               "car_number": "",
               "car_model": "",
               "token": "",
               "picture": "",
               "password": "",
               "is_vehicle_document_uploaded": false,
       "is_document_uploaded" : 1, 
               "bank_id": "",
               "account_id": "",
               "is_documents_expired": false,
               "country_phone_code": "+1",
               "gender": "",
               "wallet_currency_code": "USD",
               "wallet": 0,
               "is_partner_approved_by_admin": 0,
               "is_approved": 0,
               "is_active": 0,
               "rejected_request": 0,
               "cancelled_request": 0,
               "completed_request": 0,
               "accepted_request": 0,
               "total_request": 0,
               "is_available": 0,
               "providerPreviousLocation": [0, 0],
               "is_referral": 0,
               "referred_by": null,
               "rate_count": 0,
               "rate": 0,
               "device_unique_code": "",
               "is_trip": [],
               "received_trip_from_gender": [],
               "languages": []

                // ... (add the rest of the fields)
            });

            // Save the provider record to the database
            provider.save().then(() => {
                console.log('Data saved successfully');
                // Rest of the save operation...
                return res.json({ success: true, message: 'Data saved successfully' });
            }).catch((err) => {
                console.error('Error saving provider:', err);
                // Rest of the error handling...
                return res.status(500).json({ success: false, error: err.message });
            });
        }
        const phone_number_length = 10;
        Country.find({}).then((country) => {
            var url = "https://maps.googleapis.com/maps/api/js?key=" + setting_detail.web_app_google_key + "&libraries=places,drawing"
            res.render('add_provider_form', { city_type_data: city_type_data, phone_number_length, country_data: country, payment_gateway: types, map_url: url });
        });
    } else {
        res.redirect('/admin');
    }
};
