var utils = require('./utils');
require('./constant');
var myAnalytics = require('./provider_analytics');
var allemails = require('./emails');
var Provider = require('mongoose').model('Provider');
var Trip = require('mongoose').model('Trip');
var TripOrder = require('mongoose').model('trip_order');
var TripLocation = require('mongoose').model('trip_location');
var Document = require('mongoose').model('Document');
var Provider_Document = require('mongoose').model('Provider_Document');
var Country = require('mongoose').model('Country');
var moment = require('moment');
var City = require('mongoose').model('City');
var Type = require('mongoose').model('Type');
var Settings = require('mongoose').model('Settings');
var console = require('./console');
var Citytype = require('mongoose').model('city_type');
var Partner = require('mongoose').model('Partner');
var Provider_Vehicle_Document = require('mongoose').model('Provider_Vehicle_Document');
var utils = require('./utils');
var CityZone = require('mongoose').model('CityZone');
var User = require('mongoose').model('User');
var mongoose = require('mongoose');
var Wallet_history = require('mongoose').model('Wallet_history');
var ProviderNew = require('../models/providerNew');
var CityNew = require('../models/cityNew');
var countryNew = require('../models/countryNew');
var Schema = new mongoose.Types.ObjectId;
// var sql = require('../../config/mysqlconnect');
// var sql1 = require('../../config/mysqlconnect1');
var sql = "";
var sql1 = "";
var Promise = require('promise');
var path = require('path');
const USER_TYPE_PATIENT_APP = '21'

exports.provider_registerNew = function (req, res) {
    if (req.body != null) {
        console.log(req.body);
        var newProvider = new ProviderNew(req.body);
        console.log(newProvider);
        ProviderNew.checkProviderEmail(((req.body.UserEmail).trim()).toLowerCase(), function (err, prov) {
            if (err) {
                res.send(err);
                //console.log("__");
                res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED });
            }
            else {
                ProviderNew.checkProviderPhone(req.body.PhoneNumber, function (err, prov) {
                    if (err) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_PHONE_NUMBER_ALREADY_USED });
                    }
                    else {
                        var query = {};
                        if (req.body.City) {
                            query['cityname'] = req.body.City;
                        }
                        CityNew.getCityDetail(req.body.City, function (err, city) {
                            console.log(city);
                            if (city != null) {
                                // City.findOne(query).then((city) => {                           
                                // var city_id = city._id;
                                // var city_name = city.cityname;
                                // var country_id = city.countryid;
                                var token = utils.tokenGenerator(32);

                                var Gender = req.body.Gender;
                                if (Gender != undefined) {
                                    Gender = ((Gender).trim()).toLowerCase();
                                }
                                var first_name = req.body.FirstName;
                                //first_name = (req.body.FirstName).charAt(0).toUpperCase() + first_name.slice(1);

                                var last_name = req.body.LastLname;
                                //last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
                                //var referral_code = (utils.tokenGenerator(8)).toUpperCase();

                                var pictureData = req.body.Picture;
                                if (pictureData != undefined && pictureData != "") {
                                    var image_name = newProvider.UserEmail + utils.tokenGenerator(4);
                                    var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                                    newProvider.Picture = url;

                                    utils.saveImageAndGetURL(image_name + '.jpg', req, res, 2);
                                }
                                /*if (req.files != undefined && req.files.length > 0) {
                                   var image_name = provider._id + utils.tokenGenerator(4);
                                   var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                                   provider.picture = url;
                                   utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 2);
                                }*/

                                if (req.body.LoginType == "manual") {
                                    var crypto = require('crypto');
                                    var password = req.body.Password;
                                    var hash = crypto.createHash('md5').update(password).digest('hex');
                                    //req.body.Password = hash;
                                    newProvider.SocialID = "";

                                    countryNew.getCountryDetail(req.body.Country, function (err, country) {
                                        // console.log(country);
                                        if (country != null) {
                                            // Country.findOne({countryname: newProvider.Country}).then((country) => {
                                            // if (country) {
                                            // var country_id = country._id;
                                            //var wallet_currency_code = country.currencycode;
                                            //provider.wallet_currency_code = wallet_currency_code;
                                            // utils.insert_documets_for_new_providers(newProvider,1, country_id, function(document_response){
                                            // newProvider.is_document_uploaded = document_response.is_document_uploaded;
                                            req.body.IsDocumentUploaded = 0;
                                            req.body.CreatedDtm = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                                            req.body.AuthenticationToken = token;

                                            ProviderNew.createProvider(req.body, function (err, prov) {
                                                if (err) { res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED }); }
                                                else {
                                                    // var email_notification = setting_detail.email_notification;
                                                    // if (email_notification == true) 
                                                    {
                                                        allemails.sendProviderRegisterEmail(req, newProvider, newProvider.FirstName + " " + newProvider.LastName);
                                                    }
                                                    var response = {};
                                                    response.FirstName = newProvider.FirstName;
                                                    response.LastName = newProvider.LastName;
                                                    response.UserEmail = newProvider.UserEmail;
                                                    response.CountryPhoneCode = newProvider.CountryPhoneCode;
                                                    response.IsDocumentUploaded = newProvider.IsDocumentUploaded;
                                                    response.City = newProvider.City;
                                                    response.IsActive = newProvider.IsActive;
                                                    response._id = "PHLEB" + newProvider.FirstName + newProvider.LastName;
                                                    response.SocialId = newProvider.SocialId;
                                                    response.PhoneNumber = newProvider.PhoneNumber;
                                                    response.LoginType = newProvider.LoginType;
                                                    response.LoginID = newProvider.LoginID;
                                                    response.AuthenticationToken = token;
                                                    response.Picture = newProvider.Picture;

                                                    res.json({
                                                        success: true,
                                                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                                        provider_detail: req.body
                                                        // data: req.body
                                                        // phone_number_min_length: country.phone_number_min_length,
                                                        // phone_number_length: country.phone_number_length
                                                    });
                                                }
                                            }, (err) => {
                                                console.log(err);
                                                res.json({
                                                    success: false,
                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                });
                                            });
                                            //  });// });
                                        }
                                        else {
                                            res.json({
                                                success: false,
                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                            });
                                        }
                                        // });
                                    });
                                }
                                else {
                                    newProvider.password = "";
                                    // Country.findOne({countryname: newProvider.Country}).then((country) => {
                                    countryNew.getCountryDetail(req.body.Country, function (err, country) {
                                        if (country) {
                                            var country_id = country._id;
                                            //var wallet_currency_code = country.currencycode;
                                            //provider.wallet_currency_code = wallet_currency_code;
                                            // utils.insert_documets_for_new_providers(newProvider, 1, country_id, function(document_response)
                                            // {
                                            newProvider.IsDocumentUploaded = 0;
                                            req.body.IsDocumentUploaded = 0;
                                            req.body.CreatedDtm = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
                                            req.body.AuthenticationToken = token;

                                            ProviderNew.createProvider(req.body, function (err, prov) {
                                                if (err) { res.send(err); }
                                                else {
                                                    // var email_notification = setting_detail.email_notification;
                                                    // if (email_notification == true) {
                                                    allemails.sendProviderRegisterEmail(req, newProvider, newProvider.FirstName + " " + newProvider.LastName);
                                                    // }  
                                                    var response = {};
                                                    response.FirstName = newProvider.FirstName;
                                                    response.LastName = newProvider.LastName;
                                                    response.UserEmail = newProvider.UserEmail;
                                                    response.CountryPhoneCode = newProvider.CountryPhoneCode;
                                                    response.IsDocumentUploaded = newProvider.IsDocumentUploaded;
                                                    response.City = newProvider.City;
                                                    response.IsActive = newProvider.IsActive;
                                                    response._id = "PHLEB" + newProvider.FirstName + newProvider.LastName;
                                                    response.SocialId = newProvider.SocialId;
                                                    response.PhoneNumber = newProvider.PhoneNumber;
                                                    response.LoginType = newProvider.LoginType;
                                                    response.LoginID = newProvider.LoginID;
                                                    response.AuthenticationToken = token;
                                                    response.Picture = newProvider.Picture;

                                                    res.json({
                                                        success: true,
                                                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                                        provider_detail: req.body
                                                        // phone_number_min_length: country.phone_number_min_length,
                                                        // phone_number_length: country.phone_number_length

                                                    });
                                                }
                                            }, (err) => {
                                                console.log(err);
                                                res.json({
                                                    success: false,
                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                });
                                            });

                                            // });
                                        }

                                    });

                                }
                            }
                            else {
                                console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            }
                        });

                    }
                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            }
        });
    }
    else {
        res.json({
            success: false,
            error_code: response.error_code,
            error_description: response.error_description
        });
    }
};


exports.providerlogin = function (req, res) {
    if (req.body != null) {
        if (req.body.LoginType = 'manual') {
            if (req.body.UserEmail != null && req.body.Password != null) {
                var email = req.body.UserEmail;
                var pw = req.body.Password;
                console.log(req.body);
                sql1.query('SELECT * from users u join phlebotomist p on u.UserID = p.UserID where u.UserEmail = "' + req.body.UserEmail + '"', (err, rows, fields) => {
                    if (err) {
                        console.log(err);
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    }
                    else {
                        console.log("______1" + rows[0]);
                        var jsondata = JSON.stringify(rows);
                        var data = JSON.parse(jsondata);

                        console.log("tset val= " + jsondata);

                        if (data[0].Password != req.body.Password) {
                            res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_PASSWORD });
                        }
                        else {
                            if (req.body.DeviceTokenID == null) { res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN, message: "Missing Or Invalid Device Token" }); }
                            else {
                                var token = utils.tokenGenerator(32);
                                // if (data[0].DeviceTokenID != "" && data[0].DeviceTokenID != req.body.DeviceTokenID) {
                                //device_token = tokan;

                                sql1.query('UPDATE phlebotomist p join users u on p.UserID = u.UserID SET p.AuthenticationToken = "' + token + '",p.DeviceTokenID = "' + req.body.DeviceTokenID + '" WHERE u.UserEmail = "' + email + '" OR SocialID = "' + email + '"', (err, rows, fields) => {
                                    if (err) { res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER }); }
                                    else { console.log("______1"); }
                                });
                                var response = {};
                                response.FirstName = data[0].FirstName;
                                response.LastName = data[0].LastName;
                                response.UserEmail = data[0].UserEmail;
                                response.CountryPhoneCode = data[0].CountryPhoneCode;
                                response.IsDocumentUploaded = data[0].IsDocumentUploaded;
                                response.City = data[0].City;
                                response.IsActive = data[0].IsActive;
                                response.UserID = data[0].UserID;
                                response.SocialId = data[0].SocialId;
                                response.PhoneNumber = data[0].PhoneNumber;
                                response.LoginType = data[0].LoginType;
                                response.LoginID = data[0].LoginID;
                                response.AuthenticationToken = token;
                                response.DeviceTokenID = req.body.DeviceTokenID;

                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                    provider_detail: response
                                });
                                //  }                             
                            }
                        }
                    }
                });
            }
            else {
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_PARAMETER_MISSING
                    //error_description: response.error_description
                });
            }
        }
        else {
            if (req.body.SocialID != null) {
                var email = req.body.SocialID;
                sql1.query('SELECT * from users u join phlebotomist p on u.UserID = p.UserID where p.SocialID = "' + req.body.SocialID + '"', (err, rows, fields) => {
                    if (err) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    }
                    else {
                        var jsondata = JSON.stringify(rows);
                        var data = JSON.parse(jsondata);

                        console.log("tset val= " + jsondata);

                        if (req.body.DeviceTokenID == null) { res.json({ success: false, error_code: ERROR_CODE_INVALID_TOKEN, message: 'MissingOr Invalid Device Token' }); }
                        else {
                            var token = utils.tokenGenerator(32);
                            /* if (provider.device_token != "" && provider.device_token != req.body.device_token) {
                                   device_token = resp.DeviceTokenID;
                                 }*/
                            sql1.query('UPDATE phlebotomist p join users u on p.UserID = u.UserID SET p.AuthenticationToken = "' + token + '",p.DeviceTokenID = "' + req.body.DeviceTokenID + '" WHERE p.SocialID = "' + req.body.SocialID + '"', (err, rows, fields) => {
                                if (err) { res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER }); }
                                else { console.log("______1" + rows); }
                            });
                            var response = {};
                            response.FirstName = data[0].FirstName;
                            response.LastName = data[0].LastName;
                            response.UserEmail = data[0].UserEmail;
                            response.CountryPhoneCode = data[0].CountryPhoneCode;
                            response.IsDocumentUploaded = data[0].IsDocumentUploaded;
                            response.City = data[0].City;
                            response.IsActive = data[0].IsActive;
                            response.UserID = data[0].UserID;
                            response.SocialId = data[0].SocialId;
                            response.PhoneNumber = data[0].PhoneNumber;
                            response.LoginType = data[0].LoginType;
                            response.LoginID = data[0].LoginID;
                            response.AuthenticationToken = token;
                            response.DeviceTokenID = req.body.DeviceTokenID;
                            res.json({
                                success: true,
                                message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                provider_detail: response
                            });
                        }
                    }

                });
            }
            else {
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_PARAMETER_MISSING,
                    error_description: response.error_description
                });
            }
        }
    }
    else {
        console.log(err);
        res.json({
            success: false,
            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
        });
    }
};

exports.providerlogout = function (req, res) {
    if (req.body.UserID != null && req.body.AuthenticationToken != null) {
        var id = req.body.UserID;
        sql1.query('select * from users u join phlebotomist p on u.UserID = p.UserID where u.UserID = "' + id + '"', (err, rows, fields) => {
            if (err) { res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND }); }
            else {
                console.log("______1", rows);
                var jsondata = JSON.stringify(rows);
                var data = JSON.parse(jsondata);
                if (req.body.AuthenticationToken != data[0].AuthenticationToken || req.body.AuthenticationToken == null) {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                }
                else {
                    data[0].DeviceTokenID = "";
                    var isactive = data[0].IsActive = 0;
                    sql1.query('UPDATE phlebotomist p join users u on p.UserID = u.UserID SET p.DeviceTokenID = null,u.IsActive = "' + isactive + '" WHERE p.UserID = "' + req.body.UserID + '"', (err, rows, fields) => {
                        if (err) { res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER }); }
                        else { console.log("______1" + rows); }
                    });

                    res.json({
                        success: true,
                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_LOGOUT_SUCCESSFULLY
                    });
                }
            }
        });
    }
    else {
        res.json({
            success: false,
            error_code: response.error_code,
            error_description: response.error_description
        });
    }
};


exports.GetPhlebSchedule = function (req, res) {
    if (req.body.UserID != null && req.body.ScheduleDate != null) {
        var dt = req.body.ScheduleDate;
        var startdate = dt + " " + "00:00:00";
        var enddate = dt + " " + "23:59:59";
        console.log(startdate, enddate);
        sql.query('select p.SysID,p.PhlebotomistID,p.ScheduleDtm,pt.UserPatientID,pt.FirstName,pt.MiddleName,pt.LastName,pt.DOB,pt.Gender,pt.PatientPictureID,pt.Living,p.OwnerID,p.schestimatetraveldistance,p.schestimatetraveltime,p.Notes,r.DoctorID,r.OrderingClinicID,r.ReportingClinicID,r.CreatedDtm,r.STATTesting,r.`Status`,r.CollectionCenter,r.Fasting,r.HomeBound,r.Notes as Requisitionnotes,r.BillingStatus,r.IsSpecialCondition,r.DrivingDistance from phlebschedules p join requisitions r on r.SysID = p.RequisitionSysID join patients pt on pt.SysID = r.PatientSysID where p.PhlebotomistID = "' + req.body.UserID + '" and cast(p.ScheduleDtm AS DATE) = "' + req.body.ScheduleDate + '"', (err, rows, fields) => {
            if (err) {
                res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
            }
            else {
                console.log("______1" + rows);
                var jsondata = JSON.stringify(rows);
                var data = JSON.parse(jsondata);
                console.log("______1" + data);
                res.json({
                    success: true,
                    Schedule: data
                });
            }
        });
    }
    else {
        res.json({
            success: false,
            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG,
            error_description: "ERROR_CODE_SOMETHING_WENT_WRONG"
        });

    }
};

exports.GetPhlebScheduleHistory = function (req, res) {
    if (req.body.UserID != null && req.body.StartDate != null && req.body.EndDate != null) {

        sql.query('select p.SysID,p.PhlebotomistID,p.ScheduleDtm,pt.UserPatientID,pt.FirstName,pt.MiddleName,pt.LastName,pt.DOB,pt.Gender,pt.PatientPictureID,pt.Living,p.OwnerID,p.schestimatetraveldistance,p.schestimatetraveltime,p.Notes,r.DoctorID,r.OrderingClinicID,r.ReportingClinicID,r.CreatedDtm,r.STATTesting,r.`Status`,r.CollectionCenter,r.Fasting,r.HomeBound,r.Notes as Requisitionnotes,r.BillingStatus,r.IsSpecialCondition,r.DrivingDistance from phlebschedules p join requisitions r on r.SysID = p.RequisitionSysID join patients pt on pt.SysID = r.PatientSysID where p.PhlebotomistID = "' + req.body.UserID + '" and  cast(p.ScheduleDtm AS DATE) between cast("' + req.body.StartDate + '" AS DATE)  and cast("' + req.body.EndDate + '" AS DATE)', (err, rows, fields) => {
            if (err) {
                res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
            }
            else {
                console.log("______1" + rows);
                var jsondata = JSON.stringify(rows);
                var data = JSON.parse(jsondata);
                console.log("______1" + data);
                res.json({
                    success: true,
                    Schedule: data
                });
            }
        });
    }
    else {
        res.json({
            success: false,
            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG,
            error_description: "ERROR_CODE_SOMETHING_WENT_WRONG"
        });

    }
};


exports.providerlogin1 = function (req, res) {
    if (req.body != null) {
        if (req.body.LoginType == "manual") {
            var email = req.body.UserEmail;

            exports.checkProviderEmail(((req.body.UserEmail).trim()).toLowerCase(), function (err, prov) {
                if (err) {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED });
                }
                else {
                    var crypto = require('crypto');
                    var password = req.body.Password;
                    var hash = crypto.createHash('md5').update(password).digest('hex');
                    console.log("____" + prov);
                    if (prov.Password != req.body.Password) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_PASSWORD });
                    }
                    else {
                        var token = utils.tokenGenerator(32);
                        //provider.AuthenticationToken = token;
                        var device_token = "";
                        var device_type = "";
                        //provider.token = token;
                        var email = "";
                        if (req.body.UserEmail != null) { email = req.body.UserEmail; }
                        else { email = req.body.SocialID }
                        ProviderNew.updateProvider(token, req.body.DeviceTokenID, email, function (err, pr) {
                            if (prov.DeviceTokenID != "" && prov.DeviceTokenID != req.body.DeviceTokenID) {
                                device_token = req.body.DeviceTokenID;
                                device_type = req.body.LoginType;
                            }
                            if (device_token != "") {
                                utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                            }

                            var response = {};
                            response.FirstName = prov.FirstName;
                            response.LastName = prov.LastName;
                            response.UserEmail = prov.UserEmail;
                            response.CountryPhoneCode = prov.CountryPhoneCode;
                            response.IsDocumentUploaded = prov.IsDocumentUploaded;
                            response.City = prov.City;
                            response.IsActive = prov.IsActive;
                            response.UserID = prov.UserID;
                            response.SocialId = prov.SocialId;
                            response.PhoneNumber = prov.PhoneNumber;
                            response.LoginType = device_type;
                            response.LoginID = prov.LoginID;
                            response.AuthenticationToken = token;
                            // response.DeviceTokenID = device_token;
                            response.Picture = prov.Picture;

                            res.json({
                                success: true,
                                message: "success",
                                provider_detail: response
                                // phone_number_min_length: country.phone_number_min_length,
                                // phone_number_length: country.phone_number_length
                            });
                        });
                    }

                }
            });
        }
        else {
            var socialid = req.body.SocialId;
            ProviderNew.checkProviderSocialID(socialid, function (err, prov) {
                if (err) {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED });
                }
                else {
                    /* var crypto = require('crypto');
                     var password = req.body.Password;
                     var hash = crypto.createHash('md5').update(password).digest('hex');
                     console.log("__________________________"+prov.Password);
                     if (prov.Password != hash)
                      {
                         res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_PASSWORD});
                      }
                      else 
                      {*/
                    var token = utils.tokenGenerator(32);
                    //provider.AuthenticationToken = token;
                    var device_token = "";
                    var device_type = "";
                    //provider.token = token;

                    var email = "";
                    if (req.body.UserEmail != null) { email = req.body.UserEmail; }
                    else { email = req.body.SocialID }
                    ProviderNew.updateProvider(token, req.body.DeviceTokenID, email, function (err, pr) {
                        // if (prov.DeviceTokenID != "" && prov.DeviceTokenID != req.body.DeviceTokenID) {
                        device_token = req.body.DeviceTokenID;
                        device_type = req.body.LoginType;
                        // }
                        if (device_token != "") {
                            utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        }

                        var response = {};
                        response.FirstName = prov.FirstName;
                        response.LastName = prov.LastName;
                        response.UserEmail = prov.UserEmail;
                        response.CountryPhoneCode = prov.CountryPhoneCode;
                        response.IsDocumentUploaded = prov.IsDocumentUploaded;
                        response.City = prov.City;
                        response.IsActive = prov.IsActive;
                        response.UserID = prov.UserID;
                        response.SocialId = prov.SocialId;
                        response.PhoneNumber = prov.PhoneNumber;
                        response.LoginType = device_type;
                        response.LoginID = prov.LoginID;
                        response.AuthenticationToken = token;
                        response.Picture = prov.Picture;

                        res.json({
                            success: true,
                            message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                            provider_detail: response
                            // phone_number_min_length: country.phone_number_min_length,
                            // phone_number_length: country.phone_number_length
                        });
                    });
                    // }

                }
            });

        }
    }
    else {
        res.json({
            success: false,
            error_code: response.error_code,
            error_description: response.error_description
        });
    }
};


exports.checkProviderEmail = function (req, res) {
    if (req) {
        ProviderNew.checkProviderEmail(req.body.UserEmail, function (err, resp) {
            console.log(req.body.PhoneNumber);
            if (err)
                res.json({ success: false, error_code: error_message.ERROR_CODE_PHONE_NUMBER_ALREADY_USED });
            console.log('res', resp);
            res.json(resp);
        });
    }
    else {
        res.json({
            success: false,
            error_code: response.error_code,
            error_description: response.error_description
        });
    }

};

exports.updateProvider = function (req, res) {
    console.log(req.body);
    if (req.body != null) {
        var email = "";
        if (req.body.UserEmail != null) { email = req.body.UserEmail; }
        else { email = req.body.SocialID }
        ProviderNew.updateProvider(req.body.AuthenticationToken, req.body.DeviceTokenID, email, function (err, resp) {
            console.log(req.body);
            if (err) {
                res.json({ success: false, error_code: error_message.ERROR_CODE_PHONE_NUMBER_ALREADY_USED });
            }
            else {
                console.log('res', resp);
                res.json(resp);
            }
        });
    }
    else {
        res.json({
            success: false,
            error_code: response.error_code,
            error_description: response.error_description
        });
    }

};



//// PROVIDER REGISTER USING POST SERVICE ///////
exports.provider_register = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }, { name: 'country_phone_code', type: 'string' }, { name: 'phone', type: 'string' },
    { name: 'first_name', type: 'string' }, { name: 'last_name', type: 'string' },
    { name: 'country', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ email: ((req.body.email).trim()).toLowerCase() }).then((provider) => {
                if (provider) {
                    if (provider.login_by == 'manual') {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED });
                    } else {
                        res.json({
                            success: false,
                            error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED_WITH_SOCIAL
                        });
                    }
                } else {

                    Provider.findOne({
                        phone: req.body.phone,
                        country_phone_code: req.body.country_phone_code
                    }).then((provider) => {

                        if (provider) {
                            res.json({ success: false, error_code: error_message.ERROR_CODE_PHONE_NUMBER_ALREADY_USED });
                        } else {
                            var query = {};
                            if (req.body.city_id) {
                                query['_id'] = req.body.city_id;
                            } else {
                                query['cityname'] = req.body.city;
                            }

                            City.findOne(query).then((city) => {
                                console.log(city)
                                var city_id = city._id;
                                var city_name = city.cityname;
                                var country_id = city.countryid;
                                var token = utils.tokenGenerator(32);

                                var gender = req.body.gender;
                                if (gender != undefined) {
                                    gender = ((gender).trim()).toLowerCase();
                                }


                                var first_name = req.body.first_name;
                                first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);

                                var last_name = req.body.last_name;
                                last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
                                var referral_code = (utils.tokenGenerator(8)).toUpperCase();

                                var provider = new Provider({
                                    first_name: first_name,
                                    last_name: last_name,
                                    country_phone_code: req.body.country_phone_code,
                                    email: ((req.body.email).trim()).toLowerCase(),
                                    phone: req.body.phone,
                                    gender: gender,
                                    service_type: null,
                                    car_model: req.body.car_model,
                                    car_number: req.body.car_number,
                                    device_token: req.body.device_token,
                                    device_type: req.body.device_type,
                                    bio: req.body.bio,
                                    address: req.body.address,
                                    zipcode: req.body.zipcode,
                                    social_unique_id: req.body.social_unique_id,
                                    login_by: req.body.login_by,
                                    device_timezone: req.body.device_timezone,
                                    city: city_name,
                                    cityid: city_id,
                                    country_id: country_id,
                                    country: req.body.country,
                                    wallet_currency_code: "",
                                    token: token,
                                    referral_code: referral_code,
                                    is_available: 1,
                                    is_document_uploaded: 0,
                                    is_referral: 0,
                                    is_partner_approved_by_admin: 1,
                                    is_active: 0,
                                    is_approved: 0,
                                    rate: 0,
                                    rate_count: 0,
                                    is_trip: [],
                                    received_trip_from_gender: [],
                                    languages: [],
                                    admintypeid: null,
                                    wallet: 0,
                                    bearing: 0,
                                    picture: "",
                                    provider_type: Number(constant_json.PROVIDER_TYPE_NORMAL),
                                    provider_type_id: null,
                                    providerLocation: [0, 0],
                                    providerPreviousLocation: [0, 0],
                                    app_version: req.body.app_version

                                });
                                /////////// FOR IMAGE /////////

                                var pictureData = req.body.pictureData;
                                if (pictureData != undefined && pictureData != "") {
                                    var image_name = provider._id + utils.tokenGenerator(4);
                                    var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                                    provider.picture = url;

                                    utils.saveImageAndGetURL(image_name + '.jpg', req, res, 2);
                                }

                                if (req.files != undefined && req.files.length > 0) {
                                    var image_name = provider._id + utils.tokenGenerator(4);
                                    var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                                    provider.picture = url;
                                    utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 2);
                                }
                                ///////////////////////////


                                if (req.body.login_by == "manual") {
                                    var crypto = require('crypto');
                                    var password = req.body.password;
                                    var hash = crypto.createHash('md5').update(password).digest('hex');
                                    provider.password = hash;
                                    provider.social_unique_id = ""
                                    Country.findOne({ countryname: provider.country }).then((country) => {
                                        if (country) {
                                            var country_id = country._id;
                                            var wallet_currency_code = country.currencycode;
                                            provider.wallet_currency_code = wallet_currency_code;

                                            utils.insert_documets_for_new_providers(provider, 1, country._id, function (document_response) {
                                                provider.is_document_uploaded = document_response.is_document_uploaded;
                                                provider.save().then(() => {
                                                    var email_notification = setting_detail.email_notification;
                                                    if (email_notification == true) {
                                                        allemails.sendProviderRegisterEmail(req, provider, provider.first_name + " " + provider.last_name);
                                                    }
                                                    var response = {};
                                                    response.first_name = provider.first_name;
                                                    response.last_name = provider.last_name;
                                                    response.email = provider.email;
                                                    response.country_phone_code = provider.country_phone_code;
                                                    response.is_document_uploaded = provider.is_document_uploaded;
                                                    response.address = provider.address;
                                                    response.is_approved = provider.is_approved;
                                                    response._id = provider._id;
                                                    response.social_ids = provider.social_ids;
                                                    response.social_unique_id = provider.social_unique_id;
                                                    response.phone = provider.phone;
                                                    response.login_by = provider.login_by;
                                                    response.is_documents_expired = provider.is_documents_expired;
                                                    response.account_id = provider.account_id;
                                                    response.bank_id = provider.bank_id;
                                                    response.city = provider.city;
                                                    response.country = provider.country;
                                                    response.rate = provider.rate;
                                                    response.rate_count = provider.rate_count;
                                                    response.is_referral = provider.is_referral;
                                                    response.token = provider.token;
                                                    response.referral_code = provider.referral_code;
                                                    response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                                    response.service_type = provider.service_type;
                                                    response.admintypeid = provider.admintypeid;
                                                    response.is_available = provider.is_available;
                                                    response.is_active = provider.is_active;
                                                    response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                                    response.picture = provider.picture;
                                                    response.wallet_currency_code = provider.wallet_currency_code;
                                                    response.country_detail = { "is_referral": country.is_provider_referral }

                                                    //function call 

                                                    var req_para = {};
                                                    req_para = {
                                                        providerid: provider._id,
                                                        loginusername: provider.email,
                                                        isVerified: false,
                                                        tempupdate:"no"
                                                    }
                                                    exports.insert_update_phlebotomist(req_para);

                                                    res.json({
                                                        success: true,
                                                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                                        provider_detail: response,
                                                        phone_number_min_length: country.phone_number_min_length,
                                                        phone_number_length: country.phone_number_length
                                                    });
                                                }, (err) => {
                                                    console.log(err);
                                                    res.json({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });
                                                });

                                            });
                                        }

                                    });
                                } else {
                                    provider.password = "";
                                    Country.findOne({ countryname: provider.country }).then((country) => {

                                        if (country) {
                                            var country_id = country._id;
                                            var wallet_currency_code = country.currencycode;
                                            provider.wallet_currency_code = wallet_currency_code;
                                            utils.insert_documets_for_new_providers(provider, 1, country._id, function (document_response) {
                                                provider.is_document_uploaded = document_response.is_document_uploaded;
                                                provider.save().then(() => {
                                                    var email_notification = setting_detail.email_notification;
                                                    if (email_notification == true) {
                                                        allemails.sendProviderRegisterEmail(req, provider, provider.first_name + " " + provider.last_name);
                                                    }
                                                    var response = {};
                                                    response.first_name = provider.first_name;
                                                    response.last_name = provider.last_name;
                                                    response.email = provider.email;
                                                    response.country_phone_code = provider.country_phone_code;
                                                    response.is_document_uploaded = provider.is_document_uploaded;
                                                    response.address = provider.address;
                                                    response.is_approved = provider.is_approved;
                                                    response._id = provider._id;
                                                    response.social_ids = provider.social_ids;
                                                    response.social_unique_id = provider.social_unique_id;
                                                    response.phone = provider.phone;
                                                    response.login_by = provider.login_by;
                                                    response.is_documents_expired = provider.is_documents_expired;
                                                    response.account_id = provider.account_id;
                                                    response.bank_id = provider.bank_id;
                                                    response.referral_code = provider.referral_code;
                                                    response.city = provider.city;
                                                    response.is_referral = provider.is_referral;
                                                    response.country = provider.country;
                                                    response.rate = provider.rate;
                                                    response.rate_count = provider.rate_count;
                                                    response.token = provider.token;
                                                    response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                                    response.service_type = provider.service_type;
                                                    response.admintypeid = provider.admintypeid;
                                                    response.is_available = provider.is_available;
                                                    response.is_active = provider.is_active;
                                                    response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                                    response.picture = provider.picture;
                                                    response.wallet_currency_code = provider.wallet_currency_code;
                                                    response.country_detail = { "is_referral": country.is_provider_referral }

                                                    var req_para = {};
                                                    req_para = {
                                                        providerid: provider._id,
                                                        loginusername: provider.email,
                                                        isVerified: false,
                                                        tempupdate:"no"
                                                    }
                                                    exports.insert_update_phlebotomist(req_para);

                                                    res.json({
                                                        success: true,
                                                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                                        provider_detail: response,
                                                        phone_number_min_length: country.phone_number_min_length,
                                                        phone_number_length: country.phone_number_length

                                                    });
                                                }, (err) => {
                                                    console.log(err);
                                                    res.json({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });
                                                });

                                            });
                                        }

                                    });

                                }


                            }, (err) => {
                                console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });

                        }
                    }, (err) => {
                        console.log(err);
                        res.json({
                            success: false,
                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                        });
                    });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

/*** 
 * Update Provider details using insertupdate api for phlebotomist
 * Crated By: Ripal Patel
 * Created Date: 30-5-2021
 * ***/
 var config = require('../../config/config');

 exports.insert_update_phlebotomist = function (req, res) {
 // function insert_update_phlebotomist (req, res) {
    // console.log(req.session.userid);
     //var id="5d120f6dce06c1551e91da16";
 
     var providerid=req.providerid;
    // providerid=id;
     var loginusername=req.loginusername;  
     var isVerified=req.isVerified;    
     var checktempupdate=req.tempupdate;    
 
     Provider.findById(providerid).then((provider) =>{
       if(!provider)
       {
         console.log(admin_messages.error_provider_not_found);
       }
       else
       {
         var apipath = config.PathPrefix + '/Phlebotomist/InsertUpdatePhlebotomist';
            
            if(checktempupdate=="yes"){
                var checkUserIDExists = provider.UserID;
                var userEmailId="";
                if(checkUserIDExists && checkUserIDExists!=""){
                    userEmailId = checkUserIDExists
                }
                else{
                    userEmailId = provider.email
                }
                var data = JSON.stringify({
                    UserID: userEmailId,
                    UserEmail: provider.email,
                    // HetP - 12/6/2022 - for the change of concat of the first name and last name as username
                    UserName: provider.first_name + ' ' + provider.last_name, 
                    FirstName: provider.first_name, 
                    LastName: provider.last_name,
                    IsActive: true,
                    IsVerified: true,
                    ClientID:config.ClientID,
                    ClientName: config.ClientName,
                    City: provider.city,
                    Street: provider.address,
                    Country: provider.country,
                    Zip: provider.zipcode,
                    PhoneNumber: provider.country_phone_code+provider.phone,
                    Type: 0,
                    VerificationCount: 0,
                    ErrorFlag: 0,
                    LoginSource: provider.login_by=='manual'?0:1, 
                    SocialUniqueId: provider.social_unique_id
                })
            }
            else{
                var checkUserIDExists = provider.UserID;
                var userEmailId="";
                if(checkUserIDExists && checkUserIDExists!=""){
                    userEmailId = checkUserIDExists
                }
                else{
                    userEmailId = provider.email
                }

                var data = JSON.stringify({
                    //  UserID: provider.email.split("@")[0], 
                    UserID: provider.UserID,//changed by mayursinh zala on 23-11-2021 as userID generation logic is changed from .net so we send the generated unique userID
                    UserEmail: provider.email,
                    // HetP - 12/6/2022 - for the change of concat of the first name and last name as username
                    UserName: provider.first_name + ' ' + provider.last_name, 
                    FirstName: provider.first_name, 
                    LastName: provider.last_name, 
                    Password:'Welcome123',
                    IsClientAdmin: false,
                    ClientID:config.ClientID,
                    ClientName: config.ClientName,
                    UserType:'1',
                    IsActive: true,
                    IsVerified: true,
                    CreatedBy: "SuperAdmin",
                    CreatedDtm:new Date(Date.now()),
                    UpdatedBy: "SuperAdmin", 
                    UpdatedDtm: new Date(Date.now()),
                    VerifiedBy: null, 
                    VerifyDtm: new Date(Date.now()),
                    ActivateDtm:new Date(Date.now()),
                    DeactivateDtm:new Date(Date.now()),
                    Street: null,
                    Street1: null,
                    City: provider.city,
                    Street: provider.address,
                    Country: provider.country,
                    Zip: provider.zipcode,
                    PhoneNumber: provider.country_phone_code+provider.phone, 
                    FaxNo: null, 
                    Latitude: null,
                    Longitude: null,
                    GeocodeValidated: false,
                    GeocodeUpdateDtm: null,
                    Notes: null,
                    DOB: null,
                    Type: 0,
                    VerificationCount: 0,
                    ErrorFlag: 0,
                    LoginSource: provider.login_by=='manual'?0:1,
                    AuthenticationToken: "",
                    IsVerified: isVerified,
                    SocialUniqueId: provider.social_unique_id
                })
            }
 
            var options = {
                hostname: config.apiurl,
                path: apipath,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                    'X-IndralokWebAPIKey': config.AuthHeaderValue
                }
            }
     
         utils.httpRequest(options, data).then(response => {
            console.log('create new provider--------------------1124-----------------------------------'); 
            console.log(response);
             var data= JSON.parse(response);
            //  provider.userSysID=data;
            provider.userSysID=data.SysID //changed by mayursinh zala on 12-11-2021 as net api sending complete object of user
            provider.UserID=data.UserID //changed by mayursinh zala on 23-11-2021 as userID generation logic is changed from .net so we store the generated unique userID
             provider.save();
            //  res({
            //      success: true,
            //      response: data
            //  });
     
         }).catch((err) => {
             console.log(err);
         });
       }
 
     });
 };




exports.provider_login = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }, { name: 'password', type: 'string' }], function (response) {
        if (response.success) {
            if (req.body.login_by == "manual") {
                var email = req.body.email;
                Provider.findOne({ email: email }).then((provider) => {

                    if (!provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    } else if (provider) {

                        var crypto = require('crypto');
                        var password = req.body.password;
                        var hash = crypto.createHash('md5').update(password).digest('hex');
                        if (provider.password != hash) {
                            res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_PASSWORD });
                        } else {
                            Country.findOne({ countryname: provider.country }).then((country) => {
                                Provider_Document.find({
                                    provider_id: provider._id,
                                    option: 1,
                                    is_uploaded: 0
                                }).then((providerdocument) => {

                                    if (providerdocument.length > 0) {
                                        provider.is_document_uploaded = 0;
                                    } else {
                                        provider.is_document_uploaded = 1;
                                    }

                                    var token = utils.tokenGenerator(32);
                                    provider.token = token;
                                    var device_token = "";
                                    var device_type = "";
                                    provider.token = token;
                                    if (provider.device_token != "" && provider.device_token != req.body.device_token) {
                                        device_token = provider.device_token;
                                        device_type = provider.device_type;
                                    }


                                    provider.app_version = req.body.app_version;
                                    provider.device_token = req.body.device_token;
                                    provider.device_type = req.body.device_type;
                                    provider.login_by = req.body.login_by;
                                    Partner.findOne({ _id: provider.provider_type_id }, function (err, partnerdata) {

                                        var partner_email = "";
                                        if (partnerdata) {
                                            partner_email = partnerdata.email;
                                        }
                                        provider.save().then(() => {
                                            if (device_token != "") {
                                                utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                            }
                                            var response = {};
                                            response.first_name = provider.first_name;
                                            response.last_name = provider.last_name;
                                            response.email = provider.email;
                                            response.country_phone_code = provider.country_phone_code;
                                            response.is_document_uploaded = provider.is_document_uploaded;
                                            response.address = provider.address;
                                            response.is_approved = provider.is_approved;
                                            response._id = provider._id;
                                            response.social_ids = provider.social_ids;
                                            response.social_unique_id = provider.social_unique_id;
                                            response.phone = provider.phone;
                                            response.login_by = provider.login_by;
                                            response.is_documents_expired = provider.is_documents_expired;
                                            response.account_id = provider.account_id;
                                            response.bank_id = provider.bank_id;
                                            response.is_referral = provider.is_referral;
                                            response.referral_code = provider.referral_code;
                                            response.city = provider.city;
                                            response.country = provider.country;
                                            response.rate = provider.rate;
                                            response.rate_count = provider.rate_count;
                                            response.token = provider.token;
                                            response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                            response.service_type = provider.service_type;
                                            response.admintypeid = provider.admintypeid;
                                            response.is_available = provider.is_available;
                                            response.is_active = provider.is_active;
                                            response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                            response.picture = provider.picture;
                                            response.wallet_currency_code = provider.wallet_currency_code;
                                            response.zipcode = provider.zipcode;

                                            Country.findOne({ countryphonecode: provider.country_phone_code }).then((country) => {
                                                if (country) {
                                                    response.country_detail = { "is_referral": country.is_provider_referral }
                                                } else {
                                                    response.country_detail = { "is_referral": false }
                                                }

                                                if (provider.is_trip.length > 0) {
                                                    Trip.findOne({ _id: provider.is_trip[0] }).then((trip_detail) => {
                                                        if (trip_detail) {
                                                            var start_time = trip_detail.updated_at;
                                                            var end_time = new Date();
                                                            var res_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
                                                            var provider_timeout = setting_detail.provider_timeout;
                                                            var time_left_to_responds_trip = provider_timeout - res_sec;
                                                            User.findOne({ _id: trip_detail.user_id }, function (error, user_detail) {
                                                                var trip_details = {
                                                                    trip_id: provider.is_trip[0],
                                                                    user_id: trip_detail.user_id,
                                                                    is_provider_accepted: trip_detail.is_provider_accepted,
                                                                    is_provider_status: trip_detail.is_provider_status,
                                                                    trip_type: trip_detail.trip_type,
                                                                    source_address: trip_detail.source_address,
                                                                    destination_address: trip_detail.destination_address,
                                                                    sourceLocation: trip_detail.sourceLocation,
                                                                    destinationLocation: trip_detail.destinationLocation,
                                                                    is_trip_end: trip_detail.is_trip_end,
                                                                    time_left_to_responds_trip: time_left_to_responds_trip,
                                                                    user: {
                                                                        first_name: user_detail.first_name,
                                                                        last_name: user_detail.last_name,
                                                                        phone: user_detail.phone,
                                                                        country_phone_code: user_detail.country_phone_code,
                                                                        rate: user_detail.rate,
                                                                        rate_count: user_detail.rate_count,
                                                                        picture: user_detail.picture
                                                                    }
                                                                }
                                                                res.json({
                                                                    success: true, provider_detail: response, trip_detail: trip_details,
                                                                    phone_number_min_length: country.phone_number_min_length,
                                                                    phone_number_length: country.phone_number_length
                                                                });
                                                            });
                                                        } else {
                                                            res.json({
                                                                success: true, provider_detail: response,
                                                                phone_number_min_length: country.phone_number_min_length,
                                                                phone_number_length: country.phone_number_length
                                                            });
                                                        }
                                                    });
                                                } else {
                                                    res.json({
                                                        success: true, provider_detail: response,
                                                        phone_number_min_length: country.phone_number_min_length,
                                                        phone_number_length: country.phone_number_length
                                                    });
                                                }
                                            });

                                        }, (err) => {
                                            console.log(err);
                                            res.json({
                                                success: false,
                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                            });
                                        });
                                    });
                                });
                            });
                        }

                    }

                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            } else {

                Provider.findOne({ social_unique_id: req.body.social_unique_id }).then((provider) => {

                    if (!provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    } else if (provider) {

                        Country.findOne({ countryname: provider.country }).then((country) => {
                            Provider_Document.find({
                                provider_id: provider._id,
                                option: 1,
                                is_uploaded: 0
                            }).then((providerdocument) => {

                                if (providerdocument.length > 0) {
                                    provider.is_document_uploaded = 0;
                                } else {
                                    provider.is_document_uploaded = 1;
                                }

                                var token = utils.tokenGenerator(32);
                                provider.token = token;
                                var device_token = "";
                                var device_type = "";
                                provider.token = token;
                                if (provider.device_token != "" && provider.device_token != req.body.device_token) {
                                    device_token = provider.device_token;
                                    device_type = provider.device_type;
                                }


                                provider.app_version = req.body.app_version;
                                provider.device_token = req.body.device_token;
                                provider.device_type = req.body.device_type;
                                provider.login_by = req.body.login_by;
                                Partner.findOne({ _id: provider.provider_type_id }, function (err, partnerdata) {

                                    var partner_email = "";
                                    if (partnerdata) {
                                        partner_email = partnerdata.email;
                                    }
                                    provider.save().then(() => {
                                        if (device_token != "") {
                                            utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                        }
                                        var response = {};
                                        response.first_name = provider.first_name;
                                        response.last_name = provider.last_name;
                                        response.email = provider.email;
                                        response.country_phone_code = provider.country_phone_code;
                                        response.is_document_uploaded = provider.is_document_uploaded;
                                        response.address = provider.address;
                                        response.is_approved = provider.is_approved;
                                        response._id = provider._id;
                                        response.social_ids = provider.social_ids;
                                        response.social_unique_id = provider.social_unique_id;
                                        response.phone = provider.phone;
                                        response.login_by = provider.login_by;
                                        response.is_referral = provider.is_referral;
                                        response.referral_code = provider.referral_code;
                                        response.is_documents_expired = provider.is_documents_expired;
                                        response.account_id = provider.account_id;
                                        response.bank_id = provider.bank_id;
                                        response.city = provider.city;
                                        response.country = provider.country;
                                        response.rate = provider.rate;
                                        response.rate_count = provider.rate_count;
                                        response.token = provider.token;
                                        response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                        response.service_type = provider.service_type;
                                        response.admintypeid = provider.admintypeid;
                                        response.is_available = provider.is_available;
                                        response.is_active = provider.is_active;
                                        response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                        response.picture = provider.picture;
                                        response.wallet_currency_code = provider.wallet_currency_code;
                                        if (country) {
                                            response.country_detail = { "is_referral": country.is_provider_referral }
                                        } else {
                                            response.country_detail = { "is_referral": false }
                                        }

                                        if (provider.is_trip.length > 0) {
                                            Trip.findOne({ _id: provider.is_trip[0] }).then((trip_detail) => {
                                                if (trip_detail) {
                                                    var start_time = trip_detail.updated_at;
                                                    var end_time = new Date();
                                                    var res_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
                                                    var provider_timeout = setting_detail.provider_timeout;
                                                    var time_left_to_responds_trip = provider_timeout - res_sec;
                                                    User.findOne({ _id: trip_detail.user_id }, function (error, user_detail) {
                                                        var trip_details = {
                                                            trip_id: provider.is_trip[0],
                                                            user_id: trip_detail.user_id,
                                                            is_provider_accepted: trip_detail.is_provider_accepted,
                                                            is_provider_status: trip_detail.is_provider_status,
                                                            trip_type: trip_detail.trip_type,
                                                            source_address: trip_detail.source_address,
                                                            destination_address: trip_detail.destination_address,
                                                            sourceLocation: trip_detail.sourceLocation,
                                                            destinationLocation: trip_detail.destinationLocation,
                                                            is_trip_end: trip_detail.is_trip_end,
                                                            time_left_to_responds_trip: time_left_to_responds_trip,
                                                            user: {
                                                                first_name: user_detail.first_name,
                                                                last_name: user_detail.last_name,
                                                                phone: user_detail.phone,
                                                                country_phone_code: user_detail.country_phone_code,
                                                                rate: user_detail.rate,
                                                                rate_count: user_detail.rate_count,
                                                                picture: user_detail.picture
                                                            }
                                                        }
                                                        res.json({
                                                            success: true, provider_detail: response, trip_detail: trip_details,
                                                            phone_number_min_length: country.phone_number_min_length,
                                                            phone_number_length: country.phone_number_length
                                                        });
                                                    });
                                                } else {
                                                    res.json({
                                                        success: true, provider_detail: response,
                                                        phone_number_min_length: country.phone_number_min_length,
                                                        phone_number_length: country.phone_number_length
                                                    });
                                                }
                                            });
                                        } else {
                                            res.json({
                                                success: true, provider_detail: response,
                                                phone_number_min_length: country.phone_number_min_length,
                                                phone_number_length: country.phone_number_length
                                            });
                                        }

                                    }, (err) => {
                                        console.log(err);
                                        res.json({
                                            success: false,
                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                        });
                                    });
                                });
                            });
                        });
                    }
                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            }
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


//Provider login From Website//

exports.provider_login_website = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }, { name: 'password', type: 'string' }], function (response) {
        if (response.success) {
            if (req.body.login_by == "manual") {
                var email = req.body.email;
                Provider.findOne({ email: email }).then((provider) => {

                    if (!provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    } else if (provider) {

                        // var crypto = require('crypto');
                        // var password = req.body.password;
                        // var hash = crypto.createHash('md5').update(password).digest('hex');
                        // if (provider.password != hash) {
                        //     res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_PASSWORD});
                        // } else {
                        Country.findOne({ countryname: provider.country }).then((country) => {
                            Provider_Document.find({
                                provider_id: provider._id,
                                option: 1,
                                is_uploaded: 0
                            }).then((providerdocument) => {

                                if (providerdocument.length > 0) {
                                    provider.is_document_uploaded = 0;
                                } else {
                                    provider.is_document_uploaded = 1;
                                }

                                var token = utils.tokenGenerator(32);
                                provider.token = token;
                                var device_token = "";
                                var device_type = "";
                                provider.token = token;
                                if (provider.device_token != "" && provider.device_token != req.body.device_token) {
                                    device_token = provider.device_token;
                                    device_type = provider.device_type;
                                }


                                // provider.app_version = req.body.app_version;
                                // provider.device_token = req.body.device_token;
                                // provider.device_type = req.body.device_type;
                                // provider.login_by = req.body.login_by;
                                Partner.findOne({ _id: provider.provider_type_id }, function (err, partnerdata) {

                                    var partner_email = "";
                                    if (partnerdata) {
                                        partner_email = partnerdata.email;
                                    }
                                    provider.save().then(() => {
                                        if (device_token != "") {
                                            utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                        }
                                        var response = {};
                                        response.first_name = provider.first_name;
                                        response.last_name = provider.last_name;
                                        response.email = provider.email;
                                        response.country_phone_code = provider.country_phone_code;
                                        response.is_document_uploaded = provider.is_document_uploaded;
                                        response.address = provider.address;
                                        response.is_approved = provider.is_approved;
                                        response._id = provider._id;
                                        response.social_ids = provider.social_ids;
                                        response.social_unique_id = provider.social_unique_id;
                                        response.phone = provider.phone;
                                        response.login_by = provider.login_by;
                                        response.is_documents_expired = provider.is_documents_expired;
                                        response.account_id = provider.account_id;
                                        response.bank_id = provider.bank_id;
                                        response.is_referral = provider.is_referral;
                                        response.referral_code = provider.referral_code;
                                        response.city = provider.city;
                                        response.country = provider.country;
                                        response.rate = provider.rate;
                                        response.rate_count = provider.rate_count;
                                        response.token = provider.token;
                                        response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                        response.service_type = provider.service_type;
                                        response.admintypeid = provider.admintypeid;
                                        response.is_available = provider.is_available;
                                        response.is_active = provider.is_active;
                                        response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                        response.picture = provider.picture;
                                        response.wallet_currency_code = provider.wallet_currency_code;
                                        response.zipcode = provider.zipcode;

                                        Country.findOne({ countryphonecode: provider.country_phone_code }).then((country) => {
                                            if (country) {
                                                response.country_detail = { "is_referral": country.is_provider_referral }
                                            } else {
                                                response.country_detail = { "is_referral": false }
                                            }

                                            if (provider.is_trip.length > 0) {
                                                Trip.findOne({ _id: provider.is_trip[0] }).then((trip_detail) => {
                                                    if (trip_detail) {
                                                        var start_time = trip_detail.updated_at;
                                                        var end_time = new Date();
                                                        var res_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
                                                        var provider_timeout = setting_detail.provider_timeout;
                                                        var time_left_to_responds_trip = provider_timeout - res_sec;
                                                        User.findOne({ _id: trip_detail.user_id }, function (error, user_detail) {
                                                            var trip_details = {
                                                                trip_id: provider.is_trip[0],
                                                                user_id: trip_detail.user_id,
                                                                is_provider_accepted: trip_detail.is_provider_accepted,
                                                                is_provider_status: trip_detail.is_provider_status,
                                                                trip_type: trip_detail.trip_type,
                                                                source_address: trip_detail.source_address,
                                                                destination_address: trip_detail.destination_address,
                                                                sourceLocation: trip_detail.sourceLocation,
                                                                destinationLocation: trip_detail.destinationLocation,
                                                                is_trip_end: trip_detail.is_trip_end,
                                                                time_left_to_responds_trip: time_left_to_responds_trip,
                                                                user: {
                                                                    first_name: user_detail.first_name,
                                                                    last_name: user_detail.last_name,
                                                                    phone: user_detail.phone,
                                                                    country_phone_code: user_detail.country_phone_code,
                                                                    rate: user_detail.rate,
                                                                    rate_count: user_detail.rate_count,
                                                                    picture: user_detail.picture
                                                                }
                                                            }
                                                            res.json({
                                                                success: true, provider_detail: response, trip_detail: trip_details,
                                                                phone_number_min_length: country.phone_number_min_length,
                                                                phone_number_length: country.phone_number_length
                                                            });
                                                        });
                                                    } else {
                                                        res.json({
                                                            success: true, provider_detail: response,
                                                            phone_number_min_length: country.phone_number_min_length,
                                                            phone_number_length: country.phone_number_length
                                                        });
                                                    }
                                                });
                                            } else {
                                                res.json({
                                                    success: true, provider_detail: response,
                                                    phone_number_min_length: country.phone_number_min_length,
                                                    phone_number_length: country.phone_number_length
                                                });
                                            }
                                        });

                                    }, (err) => {
                                        console.log(err);
                                        res.json({
                                            success: false,
                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                        });
                                    });
                                });
                            });
                        });
                    }

                    //}

                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            } else {

                Provider.findOne({ social_unique_id: req.body.social_unique_id }).then((provider) => {

                    if (!provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    } else if (provider) {

                        Country.findOne({ countryname: provider.country }).then((country) => {
                            Provider_Document.find({
                                provider_id: provider._id,
                                option: 1,
                                is_uploaded: 0
                            }).then((providerdocument) => {

                                if (providerdocument.length > 0) {
                                    provider.is_document_uploaded = 0;
                                } else {
                                    provider.is_document_uploaded = 1;
                                }

                                var token = utils.tokenGenerator(32);
                                provider.token = token;
                                var device_token = "";
                                var device_type = "";
                                provider.token = token;
                                if (provider.device_token != "" && provider.device_token != req.body.device_token) {
                                    device_token = provider.device_token;
                                    device_type = provider.device_type;
                                }


                                provider.app_version = req.body.app_version;
                                provider.device_token = req.body.device_token;
                                provider.device_type = req.body.device_type;
                                provider.login_by = req.body.login_by;
                                Partner.findOne({ _id: provider.provider_type_id }, function (err, partnerdata) {

                                    var partner_email = "";
                                    if (partnerdata) {
                                        partner_email = partnerdata.email;
                                    }
                                    provider.save().then(() => {
                                        if (device_token != "") {
                                            utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                                        }
                                        var response = {};
                                        response.first_name = provider.first_name;
                                        response.last_name = provider.last_name;
                                        response.email = provider.email;
                                        response.country_phone_code = provider.country_phone_code;
                                        response.is_document_uploaded = provider.is_document_uploaded;
                                        response.address = provider.address;
                                        response.is_approved = provider.is_approved;
                                        response._id = provider._id;
                                        response.social_ids = provider.social_ids;
                                        response.social_unique_id = provider.social_unique_id;
                                        response.phone = provider.phone;
                                        response.login_by = provider.login_by;
                                        response.is_referral = provider.is_referral;
                                        response.referral_code = provider.referral_code;
                                        response.is_documents_expired = provider.is_documents_expired;
                                        response.account_id = provider.account_id;
                                        response.bank_id = provider.bank_id;
                                        response.city = provider.city;
                                        response.country = provider.country;
                                        response.rate = provider.rate;
                                        response.rate_count = provider.rate_count;
                                        response.token = provider.token;
                                        response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                        response.service_type = provider.service_type;
                                        response.admintypeid = provider.admintypeid;
                                        response.is_available = provider.is_available;
                                        response.is_active = provider.is_active;
                                        response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                        response.picture = provider.picture;
                                        response.wallet_currency_code = provider.wallet_currency_code;
                                        if (country) {
                                            response.country_detail = { "is_referral": country.is_provider_referral }
                                        } else {
                                            response.country_detail = { "is_referral": false }
                                        }

                                        if (provider.is_trip.length > 0) {
                                            Trip.findOne({ _id: provider.is_trip[0] }).then((trip_detail) => {
                                                if (trip_detail) {
                                                    var start_time = trip_detail.updated_at;
                                                    var end_time = new Date();
                                                    var res_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
                                                    var provider_timeout = setting_detail.provider_timeout;
                                                    var time_left_to_responds_trip = provider_timeout - res_sec;
                                                    User.findOne({ _id: trip_detail.user_id }, function (error, user_detail) {
                                                        var trip_details = {
                                                            trip_id: provider.is_trip[0],
                                                            user_id: trip_detail.user_id,
                                                            is_provider_accepted: trip_detail.is_provider_accepted,
                                                            is_provider_status: trip_detail.is_provider_status,
                                                            trip_type: trip_detail.trip_type,
                                                            source_address: trip_detail.source_address,
                                                            destination_address: trip_detail.destination_address,
                                                            sourceLocation: trip_detail.sourceLocation,
                                                            destinationLocation: trip_detail.destinationLocation,
                                                            is_trip_end: trip_detail.is_trip_end,
                                                            time_left_to_responds_trip: time_left_to_responds_trip,
                                                            user: {
                                                                first_name: user_detail.first_name,
                                                                last_name: user_detail.last_name,
                                                                phone: user_detail.phone,
                                                                country_phone_code: user_detail.country_phone_code,
                                                                rate: user_detail.rate,
                                                                rate_count: user_detail.rate_count,
                                                                picture: user_detail.picture
                                                            }
                                                        }
                                                        res.json({
                                                            success: true, provider_detail: response, trip_detail: trip_details,
                                                            phone_number_min_length: country.phone_number_min_length,
                                                            phone_number_length: country.phone_number_length
                                                        });
                                                    });
                                                } else {
                                                    res.json({
                                                        success: true, provider_detail: response,
                                                        phone_number_min_length: country.phone_number_min_length,
                                                        phone_number_length: country.phone_number_length
                                                    });
                                                }
                                            });
                                        } else {
                                            res.json({
                                                success: true, provider_detail: response,
                                                phone_number_min_length: country.phone_number_min_length,
                                                phone_number_length: country.phone_number_length
                                            });
                                        }

                                    }, (err) => {
                                        console.log(err);
                                        res.json({
                                            success: false,
                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                        });
                                    });
                                });
                            });
                        });
                    }
                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            }
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

/////// get  provider Info  /////////////
exports.get_provider_info = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (!provider) {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_GET_YOUR_DETAIL });
                } else {

                    var index = provider.vehicle_detail.findIndex((x) => x.is_selected == true)

                    provider.car_model = provider.vehicle_detail[index].model;
                    provider.car_number = provider.vehicle_detail[index].plate_no;
                    res.json({
                        success: true,
                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_YOUR_DETAIL, provider: provider
                    });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};
exports.get_provider_detail = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).lean().then(async (provider) => {
                if (provider) {
                    // if (req.body.token != null && !utils.validate_token(req.body.token)) {
                    //     res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    // } else {
                        var partner_detail = {
                            wallet: 0,
                        };

                        //for pending(new), schedule, completed appointment count add on 01-03-2022 by Monika Patel
                        var getTotalNewTripCount = await getTripCount(req.body.provider_id,'new')
                        var getTotalScheduleTripCount = await getTripCount(req.body.provider_id,'schedule')
                        var getTotalCompletedTripCount = await getTripCount(req.body.provider_id,'completed')
                        console.log("getTotalNewTripCount--"+ getTotalNewTripCount+ '====getTotalScheduleTripCount====='+getTotalScheduleTripCount+"-----getTotalCompletedTripCount----"+getTotalCompletedTripCount)
                        provider['pending_appt_count'] = getTotalNewTripCount
                        provider['schedule_appt_count'] = getTotalScheduleTripCount
                        provider['completed_appt_count'] = getTotalCompletedTripCount
                        //end 01-03-2022 by Monika Patel

                        Citytype.findOne({ _id: provider.service_type }).then((type_detail) => {
                            Partner.findOne({ _id: provider.provider_type_id }).then((partner) => {
                                if (partner) {
                                    partner_detail = {
                                        wallet: partner.wallet,
                                    };
                                }

                                if (type_detail) {

                                    Country.findOne({ _id: type_detail.countryid }).then((country_data) => {
                                        City.findOne({ _id: type_detail.cityid }).then((city_data) => {
                                            Type.findOne({ _id: type_detail.typeid }).then((type_data) => {
                                                var type_image_url = type_data.type_image_url;
                                                var currency = country_data.currencysign;
                                                var country_id = country_data._id;
                                                var is_auto_transfer = country_data.is_auto_transfer;
                                                var unit = city_data.unit;
                                                var is_check_provider_wallet_amount_for_received_cash_request = city_data.is_check_provider_wallet_amount_for_received_cash_request;
                                                var provider_min_wallet_amount_set_for_received_cash_request = city_data.provider_min_wallet_amount_set_for_received_cash_request;


                                                var type_details = {
                                                    typeid: type_data._id,
                                                    typename: type_data.typename,
                                                    base_price: type_detail.base_price,
                                                    type_image_url: type_image_url,
                                                    map_pin_image_url: type_data.map_pin_image_url,
                                                    base_price_distance: type_detail.base_price_distance,
                                                    distance_price: type_detail.price_per_unit_distance,
                                                    time_price: type_detail.price_for_total_time,
                                                    currency: currency,
                                                    is_auto_transfer: is_auto_transfer,
                                                    country_id: country_id,
                                                    unit: unit,
                                                    is_check_provider_wallet_amount_for_received_cash_request: is_check_provider_wallet_amount_for_received_cash_request,
                                                    provider_min_wallet_amount_set_for_received_cash_request: provider_min_wallet_amount_set_for_received_cash_request,
                                                    server_time: new Date(),
                                                    is_surge_hours: type_detail.is_surge_hours,
                                                    surge_start_hour: type_detail.surge_start_hour,
                                                    surge_end_hour: type_detail.surge_end_hour,
                                                    timezone: city_data.timezone
                                                }
                                                provider.country_detail = { is_referral: country_data.is_provider_referral }

                                                res.json({
                                                    success: true,
                                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_YOUR_DETAIL,
                                                    provider: provider,
                                                    type_details: type_details,
                                                    partner_detail: partner_detail
                                                });

                                            });
                                        });
                                    });


                                } else {
                                    res.json({
                                        success: true,
                                        partner_detail: partner_detail,
                                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_YOUR_DETAIL,
                                        provider: provider
                                    });
                                }
                            });

                        });
                    //}
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


exports.get_provider_detailByMail = function (req, res, next) {

    // utils.check_request_params(req.body, [{name: 'email', type: 'string'}], function (response) {
    // if (response.success)
    if (req.body != null) {
        Provider.findOne({ email: req.body.email }).then((provider) => {
            if (provider) {
                // if (provider.token != req.body.token) {
                //     res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN});
                // } else {
                var partner_detail = {
                    wallet: 0,
                };



                var response = {};
                response.first_name = provider.first_name;
                response.last_name = provider.last_name;
                response.email = provider.email;
                response.last_online_time = provider.last_online_time == undefined ? "" : provider.last_online_time;
                response._id = provider._id;
                response.token = provider.token;
                response.is_active = provider.is_active;
                //response.usersysid = provider.userSysId==undefined?"":provider.userSysId;
                const today = new Date();
                let yesterday = new Date(today);
                yesterday.setDate(yesterday.getDate() - 1);

                //   if(provider.last_online_time!=undefined && new Date(provider.last_online_time)>yesterday && new Date(provider.last_online_time)<=today ){
                //     provider.save().then(() => {
                //         utils.remove_from_zone_queue(provider);
                //         console.log(provider.last_online_time);
                //         res.json({
                //             success: true,
                //             message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_YOUR_DETAIL,
                //             provider: response
                //         });
                //     }, (err) => {
                //         console.log(err);
                //         res.json({
                //                 success: false,
                //                 error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                //             });
                //     });
                //   }else{
                res.json({
                    success: true,
                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_YOUR_DETAIL,
                    provider: response

                });

                //}
            } else {
                res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

            }
        }, (err) => {
            console.log(err);
            res.json({
                success: false,
                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
            });
        });
    } else {
        // res.json({
        //     success: false,
        //     error_code: response.error_code,
        //     error_description: response.error_description
        // });
        console.log(err);
        res.json({
            success: false,
            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
        });
    }
    // });
};


exports.update_provider_usersys = function (req, res, next) {

    // utils.check_request_params(req.body, [{name: 'email', type: 'string'}], function (response) {
    // if (response.success)
    if (req.body != null) {
        Provider.findOne({ email: req.body.email }).then((provider) => {
            if (provider) {
                //  if (provider.token != req.body.token) {
                //      res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN});
                //  } else {
                var partner_detail = {
                    wallet: 0,
                };
                provider.userSysID = req.body.usersysid;
                provider.save().then(() => {
                    var response = {};
                    response.first_name = provider.first_name;
                    response.last_name = provider.last_name;
                    response.email = provider.email;
                    response.is_approved = provider.is_approved;
                    response._id = provider._id;
                    response.token = provider.token;
                    response.usersysid = provider.userSysID;
                    res.json({
                        success: true,
                        message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_YOUR_DETAIL,
                        provider: response

                    });

                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });

            } else {
                res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

            }
        }, (err) => {
            console.log(err);
            res.json({
                success: false,
                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
            });
        });
    } else {
        // res.json({
        //     success: false,
        //     error_code: response.error_code,
        //     error_description: response.error_description
        // });
        console.log(err);
        res.json({
            success: false,
            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
        });
    }
    // });
};




exports.provider_heat_map = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {

                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {

                        var now = new Date();
                        now.setHours(now.getHours() - 1);

                        Trip.find({
                            service_type_id: provider.service_type,
                            is_trip_completed: 1,
                            created_at: { $gte: now }
                        }, { _id: 0, sourceLocation: 1 }).then((trip_data) => {

                            if (trip_data && trip_data.length > 0) {
                                res.json({ success: true, pickup_locations: trip_data });
                            } else {
                                res.json({ success: false })
                            }
                        }, (err) => {
                            console.log(err);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        })
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

// update provider
exports.provider_update = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'first_name', type: 'string' }, { name: 'last_name', type: 'string' },
    { name: 'phone', type: 'string' }, { name: 'country_phone_code', type: 'string' },], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {

                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        // if (provider.login_by !== "manual") {
                            if (req.files != undefined && req.files.length > 0) {
                                utils.deleteImageFromFolder(provider.picture, 2);
                                var image_name = provider._id + utils.tokenGenerator(4);
                                var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                                provider.picture = url;

                                utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 2);

                            }

                            var first_name = req.body.first_name;
                            first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
                            var last_name = req.body.last_name;
                            last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
                            provider.first_name = first_name;
                            provider.last_name = last_name;
                            provider.country_phone_code = req.body.country_phone_code;
                            provider.phone = req.body.phone;
                            provider.bio = req.body.bio;
                            provider.gender = req.body.gender;
                            provider.address = req.body.address;

                            //Harsh Add country and city in Profile
                            //provider.country = req.body.country; //Harsh
                            provider.city = req.body.city;		//Harsh

                            provider.zipcode = req.body.zipcode;
                            provider.languages = req.body.languages;
                            provider.received_trip_from_gender = req.body.received_trip_from_gender;
                            provider.save().then(() => {

                                var response = {};
                                response.first_name = provider.first_name;
                                response.last_name = provider.last_name;
                                response.email = provider.email;
                                response.country_phone_code = provider.country_phone_code;
                                response.is_document_uploaded = provider.is_document_uploaded;
                                response.address = provider.address;

                                response.zipcode = provider.zipcode;
                                response.is_approved = provider.is_approved;
                                response._id = provider._id;
                                response.social_ids = provider.social_ids;
                                response.social_unique_id = provider.social_unique_id;
                                response.phone = provider.phone;
                                response.login_by = provider.login_by;
                                response.is_documents_expired = provider.is_documents_expired;
                                response.account_id = provider.account_id;
                                response.bank_id = provider.bank_id;
                                response.city = provider.city;
                                response.country = provider.country;
                                response.rate = provider.rate;
                                response.referral_code = provider.referral_code;
                                response.rate_count = provider.rate_count;
                                response.is_referral = provider.is_referral;
                                response.token = provider.token;
                                response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                response.service_type = provider.service_type;
                                response.admintypeid = provider.admintypeid;
                                response.is_available = provider.is_available;
                                response.is_active = provider.is_active;
                                response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                response.picture = provider.picture;

                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOUR_PROFILE_UPDATED_SUCCESSFULLY,
                                    provider_detail: response
                                });
                            }, (err) => {
                                console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });
                            //commented old password related variable n condition on 07-02-2022 as not getting old password para from APP side n done by monika
                        // } else {
                        //     //commented old password related variable n condition on 07-02-2022 as not getting old password para from APP side n done by monika
                        //     // var crypto = require('crypto');
                        //     // var old_password = req.body.old_password;
                        //     // var hash_old = crypto.createHash('md5').update(old_password).digest('hex');
                        //     // var crypto = require('crypto');
                        //     // var new_password = req.body.new_password;

                        //     // if (provider.password == hash_old) {

                        //         // if (new_password != '') {
                        //         //     var hash_new = crypto.createHash('md5').update(new_password).digest('hex');
                        //         //     provider.password = hash_new;
                        //         // }
                        //         if (req.files != undefined && req.files.length > 0) {
                        //             utils.deleteImageFromFolder(provider.picture, 2);
                        //             var image_name = provider._id + utils.tokenGenerator(4);
                        //             var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                        //             provider.picture = url;

                        //             utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 2);

                        //         }

                        //         var first_name = req.body.first_name;
                        //         first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);
                        //         var last_name = req.body.last_name;
                        //         last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);


                        //         provider.first_name = first_name;
                        //         provider.last_name = last_name;
                        //         provider.country_phone_code = req.body.country_phone_code;
                        //         provider.phone = req.body.phone;
                        //         provider.bio = req.body.bio;
                        //         provider.gender = req.body.gender;
                        //         provider.address = req.body.address;

                        //         //Harsh Add country and city in Profile
                        //         //provider.country = req.body.country; //Harsh
                        //         provider.city = req.body.city;		//Harsh

                        //         provider.zipcode = req.body.zipcode;
                        //         provider.languages = req.body.languages;
                        //         provider.received_trip_from_gender = req.body.received_trip_from_gender;
                        //         provider.save().then(() => {
                        //             var response = {};
                        //             response.zipcode = provider.zipcode;
                        //             response.first_name = provider.first_name;
                        //             response.last_name = provider.last_name;
                        //             response.email = provider.email;
                        //             response.country_phone_code = provider.country_phone_code;
                        //             response.is_document_uploaded = provider.is_document_uploaded;
                        //             response.address = provider.address;
                        //             response.is_approved = provider.is_approved;
                        //             response._id = provider._id;
                        //             response.social_ids = provider.social_ids;
                        //             response.social_unique_id = provider.social_unique_id;
                        //             response.phone = provider.phone;
                        //             response.login_by = provider.login_by;
                        //             response.is_documents_expired = provider.is_documents_expired;
                        //             response.account_id = provider.account_id;
                        //             response.bank_id = provider.bank_id;
                        //             response.city = provider.city;
                        //             response.country = provider.country;
                        //             response.rate = provider.rate;
                        //             response.rate_count = provider.rate_count;
                        //             response.token = provider.token;
                        //             response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                        //             response.service_type = provider.service_type;
                        //             response.admintypeid = provider.admintypeid;
                        //             response.is_available = provider.is_available;
                        //             response.is_active = provider.is_active;
                        //             response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                        //             response.picture = provider.picture;

                        //             res.json({
                        //                 success: true,
                        //                 message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOUR_PROFILE_UPDATED_SUCCESSFULLY,
                        //                 provider_detail: response
                        //             });
                        //         }, (err) => {
                        //             console.log(err);
                        //             res.json({
                        //                 success: false,
                        //                 error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                        //             });
                        //         });
                        //     //commented old password related variable n condition on 07-02-2022 as not getting old password para from APP side n done by monika
                        //     // } else {
                        //     //     res.json({
                        //     //         success: false,
                        //     //         error_code: error_message.ERROR_CODE_YOUR_PASSWORD_IS_NOT_MATCH_WITH_OLD_PASSWORD
                        //     //     });
                        //     // }
                        // }


                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


exports.update_location = function (req, res) {
    console.log('provider update_location : 2372')

    utils.check_request_params(req.body, [], function (response) {

        if (response.success && req.body.location && req.body.location.length > 0) {
            
            var location_unique_id = 0;
            if (req.body.location_unique_id != undefined) {
                location_unique_id = req.body.location_unique_id;
            }

            //req.body.location=JSON.parse(req.body.location)
            // req.body.latitude = req.body.location[0][0];
            //req.body.longitude = req.body.location[0][1];
            req.body.location[0][0] = req.body.latitude;
            req.body.location[0][1] = req.body.longitude;
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({
                            success: false,
                            error_code: error_message.ERROR_CODE_INVALID_TOKEN
                        });
                    } else {

                        var trip_id = Number(req.body.trip_id);
                        var now = new Date();
                        if (!trip_id) {
                            trip_id = null;
                        }
                        Trip.findOne({
                            //_id: trip_id,
                            requsitionSysID: trip_id,
                            confirmed_provider: req.body.provider_id,
                            is_trip_completed: 0,
                            is_trip_cancelled: 0,
                            is_trip_end: 0
                        }).then((trip) => {

                            if (!trip) {

                                Citytype.findOne({ _id: provider.service_type }, function (error, city_type) {
                                    if (city_type) {
                                        if (!provider.in_zone_queue) {
                                            CityZone.find({ cityid: provider.cityid, city_type: { $in: city_type.zone_ids } }).then((city_zone_list) => {
                                                if (city_zone_list && city_zone_list.length > 0) {
                                                    var i = 0;
                                                    city_zone_list.forEach(function (city_zone_data) {
                                                        var geo = geolib.isPointInside(
                                                            { latitude: req.body.latitude, longitude: req.body.longitude },
                                                            city_zone_data.kmlzone
                                                        );


                                                        i++;
                                                        if (i == city_zone_list.length) {

                                                            if (geo) {
                                                                provider.in_zone_queue = true;
                                                                provider.zone_queue_id = city_zone_data._id;
                                                                var index = city_type.total_provider_in_zone_queue.findIndex((x) => (x.zone_queue_id).toString() == (city_zone_data._id).toString())
                                                                if (index == -1) {
                                                                    city_type.total_provider_in_zone_queue.push({ zone_queue_id: city_zone_data._id, total_provider_in_zone_queue: 1 })
                                                                    provider.zone_queue_no = 1;

                                                                } else {
                                                                    city_type.total_provider_in_zone_queue[index].total_provider_in_zone_queue++;
                                                                    provider.zone_queue_no = city_type.total_provider_in_zone_queue[index].total_provider_in_zone_queue;
                                                                }
                                                                city_type.markModified('total_provider_in_zone_queue');
                                                                city_type.save();
                                                            }

                                                            provider.providerPreviousLocation = provider.providerLocation;
                                                            provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                            provider.bearing = req.body.bearing;
                                                            provider.location_updated_time = now;
                                                            provider.save().then(() => {
                                                                res.json({
                                                                    success: true,
                                                                    in_zone_queue: provider.in_zone_queue,
                                                                    zone_queue_no: provider.zone_queue_no,
                                                                    location_unique_id: location_unique_id,
                                                                    providerLocation: provider.providerLocation

                                                                });
                                                            }, (err) => {
                                                                console.log('provider update_location : 2459')
                                                                console.log(err);
                                                                res.json({
                                                                    success: false,
                                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                                });
                                                            });
                                                        }

                                                    })
                                                } else {
                                                    provider.providerPreviousLocation = provider.providerLocation;
                                                    provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                    provider.bearing = req.body.bearing;
                                                    provider.location_updated_time = now;
                                                    provider.save().then(() => {
                                                        res.json({
                                                            success: true,
                                                            in_zone_queue: provider.in_zone_queue,
                                                            zone_queue_no: provider.zone_queue_no,
                                                            location_unique_id: location_unique_id,
                                                            providerLocation: provider.providerLocation

                                                        });
                                                    }, (err) => {
                                                        console.log('provider update_location : 2484')
                                                        console.log(err);
                                                        res.json({
                                                            success: false,
                                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                                }
                                            }, (err) => {
                                                console.log('provider update_location : 2493')
                                                provider.providerPreviousLocation = provider.providerLocation;
                                                provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                provider.bearing = req.body.bearing;
                                                provider.location_updated_time = now;
                                                provider.save().then(() => {
                                                    res.json({
                                                        success: true,
                                                        in_zone_queue: provider.in_zone_queue,
                                                        zone_queue_no: provider.zone_queue_no,
                                                        location_unique_id: location_unique_id,
                                                        providerLocation: provider.providerLocation

                                                    });
                                                }, (err) => {
                                                    console.log('provider update_location : 2508')
                                                    console.log(err);
                                                    res.json({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });
                                                });
                                            });

                                        } else {
                                            CityZone.findOne({ _id: provider.zone_queue_id }, function (error, city_zone_data) {
                                                if (city_zone_data) {
                                                    var geo = geolib.isPointInside(
                                                        { latitude: req.body.latitude, longitude: req.body.longitude },
                                                        city_zone_data.kmlzone
                                                    );
                                                    if (!geo) {
                                                        var index = city_type.total_provider_in_zone_queue.findIndex((x) => (x.zone_queue_id).toString() == (city_zone_data._id).toString())
                                                        if (index == -1) {
                                                            city_type.total_provider_in_zone_queue.push({ zone_queue_id: zone_queue_list._id, total_provider_in_zone_queue: 0 })

                                                        } else {
                                                            city_type.total_provider_in_zone_queue[index].total_provider_in_zone_queue--;

                                                        }
                                                        city_type.markModified('total_provider_in_zone_queue');
                                                        city_type.save();
                                                        Provider.update({ zone_queue_id: provider.zone_queue_id, zone_queue_no: { $gt: provider.zone_queue_no }, _id: { $ne: provider._id } }, { '$inc': { zone_queue_no: -1 } }, { multi: true }, function (error, providers) {
                                                            console.log(providers)
                                                        });
                                                        provider.zone_queue_no = 0;
                                                        provider.in_zone_queue = false;
                                                        provider.zone_queue_id = null;

                                                        provider.providerPreviousLocation = provider.providerLocation;
                                                        provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                        provider.bearing = req.body.bearing;
                                                        provider.location_updated_time = now;
                                                        provider.save().then(() => {
                                                            res.json({
                                                                success: true,
                                                                in_zone_queue: provider.in_zone_queue,
                                                                zone_queue_no: provider.zone_queue_no,
                                                                location_unique_id: location_unique_id,
                                                                providerLocation: provider.providerLocation

                                                            });
                                                        }, (err) => {
                                                            console.log('provider update_location : 2556')
                                                            console.log(err);
                                                            res.json({
                                                                success: false,
                                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                            });
                                                        });

                                                    } else {
                                                        provider.providerPreviousLocation = provider.providerLocation;
                                                        provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                        provider.bearing = req.body.bearing;
                                                        provider.location_updated_time = now;
                                                        provider.save().then(() => {
                                                            res.json({
                                                                success: true,
                                                                in_zone_queue: provider.in_zone_queue,
                                                                zone_queue_no: provider.zone_queue_no,
                                                                location_unique_id: location_unique_id,
                                                                providerLocation: provider.providerLocation

                                                            });
                                                        }, (err) => {
                                                            console.log('provider update_location : 2579')
                                                            console.log(err);
                                                            res.json({
                                                                success: false,
                                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                            });
                                                        });
                                                    }

                                                } else {
                                                    provider.providerPreviousLocation = provider.providerLocation;
                                                    provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                    provider.bearing = req.body.bearing;
                                                    provider.location_updated_time = now;
                                                    provider.save().then(() => {
                                                        res.json({
                                                            success: true,
                                                            in_zone_queue: provider.in_zone_queue,
                                                            zone_queue_no: provider.zone_queue_no,
                                                            location_unique_id: location_unique_id,
                                                            providerLocation: provider.providerLocation

                                                        });
                                                    }, (err) => {
                                                        console.log('provider update_location : 2603')
                                                        console.log(err);
                                                        res.json({
                                                            success: false,
                                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                                }
                                            })
                                        }
                                    } else {
                                        console.log('providerLocation' + req.body.latitude);
                                        provider.providerPreviousLocation = provider.providerLocation;
                                        provider.providerLocation = [Number(req.body.latitude), Number(req.body.longitude)];
                                        provider.bearing = req.body.bearing;
                                        provider.location_updated_time = now;
                                        console.log('providerLocation_2' + provider.providerLocation)

                                        provider.save().then(() => {
                                            res.json({
                                                success: true,
                                                in_zone_queue: provider.in_zone_queue,
                                                zone_queue_no: provider.zone_queue_no,
                                                location_unique_id: location_unique_id,
                                                providerLocation: provider.providerLocation

                                            });
                                        }, (err) => {
                                            console.log('provider update_location : 2631')
                                            console.log(err);
                                            res.json({
                                                success: false,
                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                            });
                                        });
                                    }
                                });
                            } else {
                                var unit_set = trip.unit;
                                var is_provider_status = trip.is_provider_status

                                if (provider.providerLocation[0] == undefined || provider.providerLocation[1] == undefined || provider.providerLocation[0] == 0 || provider.providerLocation[1] == 0) {
                                    var location = req.body.location;
                                    provider.providerPreviousLocation = provider.providerLocation;
                                    provider.providerLocation = [Number(req.body.location[location.length - 1][0]), Number(req.body.location[location.length - 1][1])];
                                    provider.bearing = req.body.bearing;
                                    provider.location_updated_time = now;
                                    trip.provider_providerPreviousLocation = provider.providerPreviousLocation;
                                    trip.providerLocation = [Number(req.body.location[location.length - 1][0]), Number(req.body.location[location.length - 1][1])];
                                    trip.bearing = req.body.bearing;
                                    Trip.findByIdAndUpdate(trip._id, trip, (trip_detail) => {

                                    });
                                    provider.save().then(() => {
                                        res.json({
                                            success: true,
                                            location_unique_id: location_unique_id,
                                            providerLocation: provider.providerLocation,
                                            total_distance: trip.total_distance,
                                            total_time: trip.total_time

                                        });
                                    }, (err) => {
                                        console.log('provider update_location : 2666')
                                        console.log(err);
                                        res.json({
                                            success: false,
                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                        });

                                    });
                                } else {

                                    console.log('trip.total_time: ' + trip.total_time)

                                    var all_temp_locations = req.body.location;
                                    var all_locations = [];
                                    var locations = [];
                                    TripLocation.findOne({ tripID: trip_id }).then((tripLocation) => {

                                        if (trip.is_provider_status == 6) {

                                            if (trip.provider_trip_start_time != null) {
                                                var minutes = utils.getTimeDifferenceInMinute(now, trip.provider_trip_start_time);
                                                trip.total_time = minutes;
                                                Trip.findByIdAndUpdate(trip._id, { total_time: minutes }, (trip_detail) => {

                                                });
                                            }

                                            var store_locations = tripLocation.startTripToEndTripLocations;
                                            var store_locations_size = store_locations.length;
                                            var locations_size = all_temp_locations.length;

                                            if (locations_size > 1) {

                                                for (var i = 0; i < locations_size; i++) {
                                                    is_add = true;
                                                    for (var j = i + 1; j < locations_size; j++) {
                                                        if (Number(all_temp_locations[i][0]) == Number(all_temp_locations[j][0]) && Number(all_temp_locations[i][1]) == Number(all_temp_locations[j][1])) {
                                                            is_add = false;
                                                            break;
                                                        }
                                                    }
                                                    if (is_add) {
                                                        all_locations.push(all_temp_locations[i]);
                                                    }
                                                }
                                            } else {
                                                all_locations = all_temp_locations;
                                            }

                                            locations_size = all_locations.length;

                                            var is_add = false;
                                            for (var i = 0; i < locations_size; i++) {
                                                is_add = true;
                                                for (var j = 0; j < store_locations_size; j++) {
                                                    if (Number(all_locations[i][0]) == Number(store_locations[j][0]) && Number(all_locations[i][1]) == Number(store_locations[j][1])) {
                                                        is_add = false;
                                                        break;
                                                    }
                                                }
                                                if (is_add) {
                                                    locations.push(all_locations[i]);
                                                }
                                            }
                                        } else {
                                            locations = all_temp_locations;
                                        }


                                        if (locations.length > 0) {
                                            var providerPreviousLocation = provider.providerPreviousLocation;
                                            var providerLocation = provider.providerLocation;

                                            var total_distance = trip.total_distance;
                                            var location_updated_time = provider.location_updated_time;
                                            var temp_location_updated_time = 0;
                                            var temp_diff = 0;
                                            var now = null;
                                            var max_distance = 0.05;
                                            var distance_diff = 0;
                                            var time_diff = 0;
                                            var location = [];

                                            for (var i = 0; i < locations.length; i++) {
                                                now = new Date(Number(locations[i][2]));

                                                providerPreviousLocation = providerLocation;
                                                providerLocation = [locations[i][0], locations[i][1]];

                                                distance_diff = Math.abs(utils.getDistanceFromTwoLocation(providerPreviousLocation, providerLocation));
                                                time_diff = Math.abs(utils.getTimeDifferenceInSecond(location_updated_time, now));

                                                if (temp_location_updated_time > 0) {
                                                    temp_diff = (Number(locations[i][2]) - temp_location_updated_time) / 1000;
                                                }
                                                temp_location_updated_time = Number(locations[i][2]);

                                                if ((distance_diff < max_distance * time_diff && distance_diff > 0.005) || time_diff == 0) {

                                                    location = [Number(providerLocation[0]), Number(providerLocation[1]), time_diff, Number(locations[i][2]), temp_diff];
                                                    switch (trip.is_provider_status) {
                                                        case 2:
                                                            tripLocation.providerStartToStartTripLocations.push(location);
                                                            break;
                                                        case 6:
                                                            tripLocation.startTripToEndTripLocations.push(location);
                                                            break;
                                                        default:
                                                            break;
                                                    }

                                                    location_updated_time = now;
                                                    if (trip.is_provider_status == 6) {
                                                        var td = distance_diff; // km                                                    
                                                        if (unit_set == 0) { /// 0 = mile
                                                            td = td * 0.621371;
                                                        }
                                                        total_distance = +total_distance + +td;
                                                    }
                                                }
                                            }

                                            trip.providerPreviousLocation = providerPreviousLocation;
                                            trip.providerLocation = providerLocation;
                                            trip.total_distance = Number(total_distance.toFixed(2));
                                            Trip.findByIdAndUpdate(trip._id, trip, (trip_detail) => {

                                                // })
                                                // trip.save().then(() => {

                                                tripLocation.save().then(() => {
                                                    res.json({
                                                        success: true,
                                                        location_unique_id: location_unique_id,
                                                        providerLocation: provider.providerLocation,
                                                        total_distance: trip.total_distance,
                                                        total_time: trip.total_time

                                                    });

                                                    if (is_provider_status == 6) {
                                                        utils.set_google_road_api_locations(tripLocation);
                                                    }
                                                }, (err) => {
                                                    res.json({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });

                                                });
                                            }, (err) => {
                                                res.json({
                                                    success: false,
                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                });

                                            });

                                            provider.providerPreviousLocation = providerPreviousLocation;
                                            provider.providerLocation = providerLocation;
                                            provider.location_updated_time = now;
                                            provider.bearing = req.body.bearing;
                                            provider.save();

                                        } else {
                                            res.json({
                                                success: true,
                                                location_unique_id: location_unique_id,
                                                providerLocation: provider.providerLocation,
                                                total_distance: trip.total_distance, total_time: trip.total_time

                                            });
                                        }
                                    });

                                }

                            }
                        }, (err) => {
                            provider.providerPreviousLocation = provider.providerLocation;
                            provider.providerLocation = [req.body.latitude, req.body.longitude];
                            provider.bearing = req.body.bearing;
                            provider.location_updated_time = now;
                            provider.save().then(() => {
                                res.json({
                                    success: true,
                                    location_unique_id: location_unique_id,
                                    providerLocation: provider.providerLocation

                                });
                            }, (err) => {
                                console.log('provider update_location : 2857')
                                console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });
                        });

                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            });

        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};



exports.update_location_socket = function (req, res) {
    console.log('update location : ' + new Date().toString())
    utils.check_request_params(req.body, [], function (response) {
        console.log('response update location : ' + response.success)
        if (response.success && req.body.location && req.body.location.length > 0) {
            console.log('response req body : 2879 ')
            console.log(JSON.stringify(req.body))
            var location_unique_id = 0;
            if (req.body.location_unique_id != undefined) {
                location_unique_id = req.body.location_unique_id;
            }
            req.body.latitude = req.body.location[0][0]
            req.body.longitude = req.body.location[0][1]

            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    console.log('response Provider findOne : 2890')
                    console.log(JSON.stringify(provider))
                    if (req.body.token != null && provider.token != req.body.token) {
                        console.log('response Provider findOne token empty : 2892')
                        res({
                            success: false,
                            error_code: error_message.ERROR_CODE_INVALID_TOKEN
                        });
                    } else {
                        console.log('response Provider findOne token not empty : 2898')
                        var trip_id = req.body.trip_id;
                        var now = new Date();
                        if (!trip_id || trip_id == 0) {
                            trip_id = null;
                        }
                        console.log("trip id ---------------2929-------------------"+trip_id)
                        Trip.findOne({
                            _id: trip_id,
                            confirmed_provider: req.body.provider_id,
                            is_trip_completed: 0,
                            is_trip_cancelled: 0,
                            is_trip_end: 0
                        }).then((trip) => {
                            console.log('response Provider findOne token not empty  fineone trip : 2911')
                            if (!trip) {

                                Citytype.findOne({ _id: provider.service_type }, function (error, city_type) {
                                    if (city_type) {
                                        if (!provider.in_zone_queue) {
                                            CityZone.find({ cityid: provider.cityid, city_type: { $in: city_type.zone_ids } }).then((city_zone_list) => {
                                                if (city_zone_list && city_zone_list.length > 0) {
                                                    var i = 0;
                                                    city_zone_list.forEach(function (city_zone_data) {
                                                        var geo = geolib.isPointInside(
                                                            { latitude: req.body.latitude, longitude: req.body.longitude },
                                                            city_zone_data.kmlzone
                                                        );


                                                        i++;
                                                        if (i == city_zone_list.length) {

                                                            if (geo) {
                                                                provider.in_zone_queue = true;
                                                                provider.zone_queue_id = city_zone_data._id;
                                                                var index = city_type.total_provider_in_zone_queue.findIndex((x) => (x.zone_queue_id).toString() == (city_zone_data._id).toString())
                                                                if (index == -1) {
                                                                    city_type.total_provider_in_zone_queue.push({ zone_queue_id: city_zone_data._id, total_provider_in_zone_queue: 1 })
                                                                    provider.zone_queue_no = 1;

                                                                } else {
                                                                    city_type.total_provider_in_zone_queue[index].total_provider_in_zone_queue++;
                                                                    provider.zone_queue_no = city_type.total_provider_in_zone_queue[index].total_provider_in_zone_queue;
                                                                }
                                                                city_type.markModified('total_provider_in_zone_queue');
                                                                city_type.save();
                                                            }

                                                            provider.providerPreviousLocation = provider.providerLocation;
                                                            provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                            provider.bearing = req.body.bearing;
                                                            provider.location_updated_time = now;
                                                            provider.save().then(() => {
                                                                res({
                                                                    success: true,
                                                                    in_zone_queue: provider.in_zone_queue,
                                                                    zone_queue_no: provider.zone_queue_no,
                                                                    location_unique_id: location_unique_id,
                                                                    providerLocation: provider.providerLocation

                                                                });
                                                            }, (err) => {
                                                                console.log('response err : 2961')
                                                                console.log(err);
                                                                res({
                                                                    success: false,
                                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                                });
                                                            });
                                                        }

                                                    })
                                                } else {
                                                    provider.providerPreviousLocation = provider.providerLocation;
                                                    provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                    provider.bearing = req.body.bearing;
                                                    provider.location_updated_time = now;
                                                    provider.save().then(() => {
                                                        res({
                                                            success: true,
                                                            in_zone_queue: provider.in_zone_queue,
                                                            zone_queue_no: provider.zone_queue_no,
                                                            location_unique_id: location_unique_id,
                                                            providerLocation: provider.providerLocation

                                                        });
                                                    }, (err) => {
                                                        console.log('response err : 2985')
                                                        console.log(err);
                                                        res({
                                                            success: false,
                                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                                }
                                            }, (err) => {
                                                console.log('response err : 2993')
                                                provider.providerPreviousLocation = provider.providerLocation;
                                                provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                provider.bearing = req.body.bearing;
                                                provider.location_updated_time = now;
                                                provider.save().then(() => {
                                                    res({
                                                        success: true,
                                                        in_zone_queue: provider.in_zone_queue,
                                                        zone_queue_no: provider.zone_queue_no,
                                                        location_unique_id: location_unique_id,
                                                        providerLocation: provider.providerLocation

                                                    });
                                                }, (err) => {
                                                    console.log('response err : 3007')
                                                    console.log(err);
                                                    res({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });
                                                });
                                            });

                                        } else {
                                            CityZone.findOne({ _id: provider.zone_queue_id }, function (error, city_zone_data) {
                                                if (city_zone_data) {
                                                    var geo = geolib.isPointInside(
                                                        { latitude: req.body.latitude, longitude: req.body.longitude },
                                                        city_zone_data.kmlzone
                                                    );
                                                    if (!geo) {
                                                        var index = city_type.total_provider_in_zone_queue.findIndex((x) => (x.zone_queue_id).toString() == (city_zone_data._id).toString())
                                                        if (index == -1) {
                                                            city_type.total_provider_in_zone_queue.push({ zone_queue_id: zone_queue_list._id, total_provider_in_zone_queue: 0 })

                                                        } else {
                                                            city_type.total_provider_in_zone_queue[index].total_provider_in_zone_queue--;

                                                        }
                                                        city_type.markModified('total_provider_in_zone_queue');
                                                        city_type.save();
                                                        Provider.update({ zone_queue_id: provider.zone_queue_id, zone_queue_no: { $gt: provider.zone_queue_no }, _id: { $ne: provider._id } }, { '$inc': { zone_queue_no: -1 } }, { multi: true }, function (error, providers) {
                                                            console.log(providers)
                                                        });
                                                        provider.zone_queue_no = 0;
                                                        provider.in_zone_queue = false;
                                                        provider.zone_queue_id = null;

                                                        provider.providerPreviousLocation = provider.providerLocation;
                                                        provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                        provider.bearing = req.body.bearing;
                                                        provider.location_updated_time = now;
                                                        provider.save().then(() => {
                                                            res({
                                                                success: true,
                                                                in_zone_queue: provider.in_zone_queue,
                                                                zone_queue_no: provider.zone_queue_no,
                                                                location_unique_id: location_unique_id,
                                                                providerLocation: provider.providerLocation

                                                            });
                                                        }, (err) => {
                                                            console.log('response err : 3054')
                                                            console.log(err);
                                                            res({
                                                                success: false,
                                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                            });
                                                        });

                                                    } else {
                                                        provider.providerPreviousLocation = provider.providerLocation;
                                                        provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                        provider.bearing = req.body.bearing;
                                                        provider.location_updated_time = now;
                                                        provider.save().then(() => {
                                                            res({
                                                                success: true,
                                                                in_zone_queue: provider.in_zone_queue,
                                                                zone_queue_no: provider.zone_queue_no,
                                                                location_unique_id: location_unique_id,
                                                                providerLocation: provider.providerLocation

                                                            });
                                                        }, (err) => {
                                                            console.log('response err : 3077')
                                                            console.log(err);
                                                            res({
                                                                success: false,
                                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                            });
                                                        });
                                                    }

                                                } else {
                                                    provider.providerPreviousLocation = provider.providerLocation;
                                                    provider.providerLocation = [req.body.latitude, req.body.longitude];
                                                    provider.bearing = req.body.bearing;
                                                    provider.location_updated_time = now;
                                                    provider.save().then(() => {
                                                        res({
                                                            success: true,
                                                            in_zone_queue: provider.in_zone_queue,
                                                            zone_queue_no: provider.zone_queue_no,
                                                            location_unique_id: location_unique_id,
                                                            providerLocation: provider.providerLocation

                                                        });
                                                    }, (err) => {
                                                        console.log('response err : 3099')
                                                        console.log(err);
                                                        res({
                                                            success: false,
                                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                        });
                                                    });
                                                }
                                            })
                                        }
                                    } else {
                                        provider.providerPreviousLocation = provider.providerLocation;
                                        provider.providerLocation = [req.body.latitude, req.body.longitude];
                                        provider.bearing = req.body.bearing;
                                        provider.location_updated_time = now;
                                        provider.save().then(() => {
                                            res({
                                                success: true,
                                                in_zone_queue: provider.in_zone_queue,
                                                zone_queue_no: provider.zone_queue_no,
                                                location_unique_id: location_unique_id,
                                                providerLocation: provider.providerLocation

                                            });
                                        }, (err) => {
                                            console.log('response err : 3123')
                                            console.log(err);
                                            res({
                                                success: false,
                                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                            });
                                        });
                                    }
                                });
                            } else {
                                console.log('trip found : 2912')
                                var unit_set = trip.unit;
                                var is_provider_status = trip.is_provider_status

                                if (provider.providerLocation[0] == undefined || provider.providerLocation[1] == undefined || provider.providerLocation[0] == 0 || provider.providerLocation[1] == 0) {
                                    var location = req.body.location;
                                    provider.providerPreviousLocation = provider.providerLocation;
                                    provider.providerLocation = [Number(req.body.location[location.length - 1][0]), Number(req.body.location[location.length - 1][1])];
                                    provider.bearing = req.body.bearing;
                                    provider.location_updated_time = now;
                                    trip.provider_providerPreviousLocation = provider.providerPreviousLocation;
                                    trip.providerLocation = [Number(req.body.location[location.length - 1][0]), Number(req.body.location[location.length - 1][1])];
                                    trip.bearing = req.body.bearing;
                                    Trip.findByIdAndUpdate(trip._id, trip, (trip_detail) => {

                                    });
                                    provider.save().then(() => {
                                        res({
                                            success: true,
                                            location_unique_id: location_unique_id,
                                            providerLocation: provider.providerLocation,
                                            total_distance: trip.total_distance,
                                            total_time: trip.total_time

                                        });
                                    }, (err) => {
                                        console.log('response err : 3158')
                                        console.log(err);
                                        res({
                                            success: false,
                                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                        });

                                    });
                                } else {
                                    console.log('---------------------------log tracking--------------------------------3201--------------'+ provider.first_name)
                                    if (trip.provider_trip_start_time != null) {
                                        var minutes = utils.getTimeDifferenceInMinute(now, trip.provider_trip_start_time);
                                        trip.total_time = minutes;
                                        Trip.findByIdAndUpdate(trip._id, { total_time: minutes }, (trip_detail) => {

                                        });
                                    }

                                    var all_temp_locations = req.body.location;
                                    var all_locations = [];
                                    var locations = [];
                                    TripLocation.findOne({ tripID: trip_id }).then((tripLocation) => {
                                        console.log('---------------------------log tracking--------------------------------3214--------------'+ provider.first_name)
                                        if (trip.is_provider_status == 6) {
                                            console.log('---------------------------log tracking--------------------------------3216--------------'+ provider.first_name)
                                            var store_locations = tripLocation.startTripToEndTripLocations;
                                            var store_locations_size = store_locations.length;
                                            var locations_size = all_temp_locations.length;

                                            if (locations_size > 1) {

                                                for (var i = 0; i < locations_size; i++) {
                                                    is_add = true;
                                                    for (var j = i + 1; j < locations_size; j++) {
                                                        if (Number(all_temp_locations[i][0]) == Number(all_temp_locations[j][0]) && Number(all_temp_locations[i][1]) == Number(all_temp_locations[j][1])) {
                                                            is_add = false;
                                                            break;
                                                        }
                                                    }
                                                    if (is_add) {
                                                        all_locations.push(all_temp_locations[i]);
                                                    }
                                                }
                                            } else {
                                                all_locations = all_temp_locations;
                                            }

                                            locations_size = all_locations.length;

                                            var is_add = false;
                                            for (var i = 0; i < locations_size; i++) {
                                                is_add = true;
                                                for (var j = 0; j < store_locations_size; j++) {
                                                    if (Number(all_locations[i][0]) == Number(store_locations[j][0]) && Number(all_locations[i][1]) == Number(store_locations[j][1])) {
                                                        is_add = false;
                                                        break;
                                                    }
                                                }
                                                if (is_add) {
                                                    locations.push(all_locations[i]);
                                                }
                                            }
                                        } else {
                                            console.log('---------------------------log tracking--------------------------------3255--------------'+ provider.first_name)
                                            locations = all_temp_locations;
                                        }


                                        if (locations.length > 0) {
                                            console.log('---------------------------log tracking--------------------------------3261--------------'+ provider.first_name)
                                            var providerPreviousLocation = provider.providerPreviousLocation;
                                            var providerLocation = provider.providerLocation;

                                            var total_distance = trip.total_distance;
                                            var location_updated_time = provider.location_updated_time;
                                            var temp_location_updated_time = 0;
                                            var temp_diff = 0;
                                            var now = null;
                                            var max_distance = 0.05;
                                            var distance_diff = 0;
                                            var time_diff = 0;
                                            var location = [];

                                            for (var i = 0; i < locations.length; i++) {
                                                now = new Date(Number(locations[i][2]));

                                                providerPreviousLocation = providerLocation;
                                                providerLocation = [locations[i][0], locations[i][1]];

                                                distance_diff = Math.abs(utils.getDistanceFromTwoLocation(providerPreviousLocation, providerLocation));
                                                time_diff = Math.abs(utils.getTimeDifferenceInSecond(location_updated_time, now));

                                                if (temp_location_updated_time > 0) {
                                                    temp_diff = (Number(locations[i][2]) - temp_location_updated_time) / 1000;
                                                }
                                                temp_location_updated_time = Number(locations[i][2]);

                                                if ((distance_diff < max_distance * time_diff && distance_diff > 0.005) || time_diff == 0) {

                                                    location = [Number(providerLocation[0]), Number(providerLocation[1]), time_diff, Number(locations[i][2]), temp_diff];
                                                    switch (trip.is_provider_status) {
                                                        case 2:
                                                            tripLocation.providerStartToStartTripLocations.push(location);
                                                            break;
                                                        case 6:
                                                            tripLocation.startTripToEndTripLocations.push(location);
                                                            break;
                                                        default:
                                                            break;
                                                    }

                                                    location_updated_time = now;
                                                    if (trip.is_provider_status == 6) {
                                                        var td = distance_diff; // km                                                    
                                                        if (unit_set == 0) { /// 0 = mile
                                                            td = td * 0.621371;
                                                        }
                                                        total_distance = +total_distance + +td;
                                                    }
                                                }
                                            }

                                            trip.providerPreviousLocation = providerPreviousLocation;
                                            trip.providerLocation = providerLocation;
                                            trip.total_distance = Number(total_distance.toFixed(2));
                                            Trip.findByIdAndUpdate(trip._id, trip, (trip_detail) => {
                                                console.log('---------------------------log tracking--------------------------------3318--------------'+ provider.first_name)
                                                // })
                                                // trip.save().then(() => {

                                                tripLocation.save().then(() => {
                                                    res({
                                                        success: true,
                                                        location_unique_id: location_unique_id,
                                                        providerLocation: provider.providerLocation,
                                                        total_distance: trip.total_distance,
                                                        total_time: trip.total_time

                                                    });
                                                    console.log('---------------------------log tracking--------------------------------3331--------------'+ provider.first_name)
                                                    if (is_provider_status == 6) {
                                                        console.log('---------------------------log tracking--------------------------------3333--------------'+ provider.first_name)
                                                        utils.set_google_road_api_locations(tripLocation);
                                                    }
                                                }, (err) => {
                                                    console.log('response err : 3297')
                                                    res({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });

                                                });
                                            }, (err) => {
                                                console.log('response err : 3304')
                                                res({
                                                    success: false,
                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                });

                                            });
                                            
                                            provider.providerPreviousLocation = providerPreviousLocation;
                                            provider.providerLocation = providerLocation;
                                            provider.location_updated_time = now;
                                            provider.bearing = req.body.bearing;
                                            provider.save();
                                            console.log('---------------------------log tracking--------------------------------3358--------------'+ provider.first_name)
                                        } else {
                                            console.log('---------------------------log tracking--------------------------------3360--------------'+ provider.first_name)
                                            res({
                                                success: true,
                                                location_unique_id: location_unique_id,
                                                providerLocation: provider.providerLocation,
                                                total_distance: trip.total_distance, total_time: trip.total_time

                                            });
                                        }
                                    });

                                }

                            }
                        }, (err) => {
                            console.log('response err : 3332')
                            provider.providerPreviousLocation = provider.providerLocation;
                            provider.providerLocation = [req.body.latitude, req.body.longitude];
                            provider.bearing = req.body.bearing;
                            provider.location_updated_time = now;
                            provider.save().then(() => {
                                res({
                                    success: true,
                                    location_unique_id: location_unique_id,
                                    providerLocation: provider.providerLocation

                                });
                            }, (err) => {
                                console.log('response err : 3345')
                                console.log(err);
                                res({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });
                        });

                    }
                } else {
                    console.log('response req provider : 3349')
                    res({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            });

        } else {
            console.log('response req provider : 3356')
            res({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

/*** 
 * get phlebotomist/provider location using socket 
 * Crated By: Monika Patel
 * Created Date: 16-Mar-2022
 * ***/
 exports.get_trip_location_socket = function (req, res) {

    console.log('get_trip_location_socket : ' + new Date().toString())
    utils.check_request_params(req.body, [], function (response) {
        console.log('get_trip_location_socket 1 : ==========' + response.success)
        if (response.success && req.body.user_id && req.body.trip_id != '') {
            console.log('get_trip_location_socket response req body : 3413 ')
            console.log(JSON.stringify(req.body))
            var location_unique_id = 0;
            var trip_id = req.body.trip_id
            var user_id = req.body.user_id
            
            var lookup = {
                $lookup:
                        {
                            from: "trip_locations",
                            localField: "_id",
                            foreignField: "tripID",
                            as: "triplocation"
                        }
            };
            var lookup1 = {
                $lookup:
                        {
                            from: "providers",
                            localField: "current_provider",
                            foreignField: "_id",
                            as: "providerDetailData"
                        }
            };
            var mongoose = require('mongoose');
            var Schema = new mongoose.Types.ObjectId;

            var ObjectId = new mongoose.Types.ObjectId;
            var condition = {
                _id: Schema(trip_id),
                user_id: ObjectId(user_id),
                is_trip_completed: 0,
                is_trip_cancelled: 0,
                is_trip_end: 0
            }

            var selectLookup = {
                $project: {
                    "_id": 1,
                    "status": 1,
                    "user_id": 1,
                    "labRequisitionID": 1,
                    "total_distance": 1,
                    "total_time": 1,
                    "timezone": 1,
                    "status": 1,
                    "current_provider":1,
                    "is_provider_status": 1,
                    "providerDetailData.providerLocation": 1,
                    "triplocation.trip_unique_id": 1,
                    "triplocation.startTripToEndTripLocations": 1,
                }
            }

            var trip_condition = {$match: condition }
            Trip.aggregate([trip_condition, lookup, lookup1, selectLookup]).then((trip) => {
                console.log('trip ------3447-------')
                console.log(trip)
                trip = trip[0]
                var providerLocation = []
                var trip_location_data = {}
                if(trip.providerDetailData.length > 0){
                    providerLocation = trip.providerDetailData[0].providerLocation
                }
                if(trip.triplocation.length > 0){
                    trip_location_data = trip.triplocation[0]
                }
                res({
                    success: true,
                    trip_id: trip._id,
                    location_unique_id: location_unique_id,
                    total_distance: trip.total_distance,
                    total_time: trip.total_time,
                    provider_id: trip.current_provider,
                    providerLocation: providerLocation,
                    trip_location_data: trip_location_data,
                    trip: trip
                });
            })

        } else {
            console.log('response req user(patient) : 3356')
            res({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
}

//// LOGOUT PROVIDER  SERVICE //
exports.logout = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        provider.device_token = "";
                        provider.is_active = 0;

                        provider.save().then(() => {
                            res.json({
                                success: true,
                                message: success_messages.MESSAGE_CODE_FOR_PROVIDER_LOGOUT_SUCCESSFULLY
                            });
                            utils.remove_from_zone_queue(provider);
                        }, (err) => {
                            console.log(err);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        });


                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });

            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

////PROVIDER STATE change_provider_status 
exports.change_provider_status = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    // if (req.body.token != null && !utils.validate_token(req.body.token)) {
                    //     res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    // } else {
                        City.findOne({ _id: provider.cityid }).then((city_detail) => {
                            var city_timezone = city_detail.timezone;
                            var state = Number(req.body.is_active);
                            var start_time = null;
                            var dateNow = new Date();
                            var date1 = moment(dateNow);
                            var tagDate = date1.format(constant_json.DATE_FORMAT_MMDDYYYY);
                            var todayFormat = date1.format(constant_json.DATE_FORMAT_MMM_D_YYYY);


                            var start_time = null;
                            if (provider.is_active != state) {

                                if (state == 1) {
                                    provider.start_online_time = dateNow;
                                    provider.location_updated_time = dateNow;

                                } else {

                                    start_time = provider.start_online_time;
                                    provider.last_online_time = start_time;
                                    provider.start_online_time = null;

                                }
                                provider.is_active = state;

                                myAnalytics.insert_daily_provider_analytics(city_timezone, provider._id, 0, start_time);


                            }



                            provider.save().then(() => {
                                utils.remove_from_zone_queue(provider);
                                console.log(provider.last_online_time);
                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_ACTIVE_SUCCESSFULLY,
                                    is_active: provider.is_active
                                });
                            }, (err) => {
                                console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });
                        });


                    //}
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};
//////////////////////////////


/////////// update city type////////////

exports.provider_updatetype = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'typeid', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {

                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        utils.remove_from_zone_queue(provider);
                        var typeid = req.body.typeid;
                        provider.service_type = typeid;

                        Citytype.findOne({ _id: typeid }).then((city_type) => {
                            if (city_type) {
                                provider.cityid = city_type.cityid;
                                provider.city = city_type.cityname;

                                // start 2 april //
                                provider.admintypeid = city_type.typeid;
                                // end 2 april //
                                provider.save();
                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_TYPE_UPDATE_SUCCESSFULLY
                                });

                            } else {
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND
                                });
                            }

                        });
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

exports.getproviderequipment = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'trip_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {

                        Trip.findOne({ _id: req.body.trip_id, confirmed_provider: req.body.provider_id }).then((trip) => {

                            if (!trip) {
                                res.json({ success: false, error_code: error_message.ERROR_CODE_NO_TRIP });
                            } else {
                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_GET_LATLONG,
                                    providerLocation: provider.providerLocation,
                                    required_docs: provider.required_docs,
                                    equipments: provider.equipments,
                                    bearing: provider.bearing,
                                    total_distance: trip.total_distance,
                                    total_time: trip.total_time
                                });
                            }

                        });
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


exports.getproviderlatlong = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'trip_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {

                        Trip.findOne({ _id: req.body.trip_id, confirmed_provider: req.body.provider_id }).then((trip) => {

                            if (!trip) {
                                res.json({ success: false, error_code: error_message.ERROR_CODE_NO_TRIP });
                            } else {
                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_GET_LATLONG,
                                    providerLocation: provider.providerLocation,
                                    bearing: provider.bearing,
                                    total_distance: trip.total_distance,
                                    total_time: trip.total_time
                                });
                            }

                        });
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

///////////////   UPDATE DEVICE TOKEN///////
exports.update_device_token = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        provider.device_token = req.body.device_token;
                        provider.save().then(() => {
                            res.json({
                                success: true,
                                message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOUR_DEVICE_TOKEN_UPDATE_SUCCESSFULLY
                            });
                        }, (err) => {
                            console.log(err);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        });
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

exports.get_provider_vehicle_list = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            var mongoose = require('mongoose');
            var Schema = new mongoose.Types.ObjectId;
            var condition = { $match: { "_id": Schema(req.body.provider_id) } };
            var vunwind = { $unwind: "$vehicle_detail" }

            var lookup = {
                $lookup:
                {
                    from: "types",
                    localField: "vehicle_detail.admin_type_id",
                    foreignField: "_id",
                    as: "type_detail"
                }
            };
            var unwind = {
                $unwind: {
                    path: "$type_detail",
                    preserveNullAndEmptyArrays: true
                }
            };

            var group = {
                $group: {
                    _id: null,
                    "vehicle_detail": {
                        $push: {
                            is_selected: "$vehicle_detail.is_selected",
                            admin_type_id: "$vehicle_detail.admin_type_id",
                            service_type: "$vehicle_detail.service_type",
                            passing_year: "$vehicle_detail.passing_year",
                            color: "$vehicle_detail.color",
                            model: "$vehicle_detail.model",
                            plate_no: "$vehicle_detail.plate_no",
                            name: "$vehicle_detail.name",
                            _id: "$vehicle_detail._id",
                            is_documents_expired: "$vehicle_detail.is_documents_expired",
                            is_document_uploaded: "$vehicle_detail.is_document_uploaded",
                            is_selected: "$vehicle_detail.is_selected",
                            type_image_url: '$type_detail.type_image_url'
                        }
                    }
                }
            }
            Provider.aggregate([condition, vunwind, lookup, unwind, group]).then((provider) => {

                if (provider.length == 0) {
                    res.json({ success: true, vehicle_list: [] })
                } else {
                    res.json({ success: true, vehicle_list: provider[0].vehicle_detail })
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            })
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

exports.change_current_vehicle = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        // res.json({success: true, vehicle_list:provider.vehicle_detail})
                        var index = provider.vehicle_detail.findIndex((x) => x.is_selected == true)
                        provider.vehicle_detail[index].is_selected = false;
                        var new_index = provider.vehicle_detail.findIndex((x) => (x._id).toString() == (req.body.vehicle_id).toString())

                        if (provider.vehicle_detail[new_index].service_type == null) {
                            res.json({ success: false })
                        } else {

                            provider.vehicle_detail[new_index].is_selected = true;
                            provider.service_type = provider.vehicle_detail[new_index].service_type;
                            provider.admintypeid = provider.vehicle_detail[new_index].admin_type_id;
                            provider.is_vehicle_document_uploaded = provider.vehicle_detail[new_index].is_document_uploaded;
                            provider.markModified('vehicle_detail');
                            provider.save().then(() => {
                                utils.remove_from_zone_queue(provider)
                                res.json({ success: true })
                            });

                        }

                    }
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

exports.get_provider_vehicle_detail = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    // if (req.body.token != null && !utils.validate_token(req.body.token)) {
                    //     res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    // } else {
                        var index = provider.vehicle_detail.findIndex((x) => (x._id).toString() == (req.body.vehicle_id).toString())

                        if (index == -1) {
                            res.json({ success: false })
                        } else {
                            Provider_Vehicle_Document.find({ vehicle_id: req.body.vehicle_id }).then((provider_vehicle_document) => {

                                Type.findOne({ _id: provider.vehicle_detail[index].admin_type_id }).then((type) => {
                                    if (type) {
                                        provider.vehicle_detail[index].type_image_url = type.type_image_url;
                                        res.json({
                                            success: true,
                                            vehicle_detail: provider.vehicle_detail[index],
                                            document_list: provider_vehicle_document
                                        })

                                    } else {
                                        provider.vehicle_detail[index].type_image_url = '';
                                        res.json({
                                            success: true,
                                            vehicle_detail: provider.vehicle_detail[index],
                                            document_list: provider_vehicle_document
                                        })

                                    }
                                }, (err) => {
                                    console.log(err);
                                    res.json({
                                        success: false,
                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                    });
                                })
                            });
                        }
                    //}
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

exports.upload_vehicle_document = function (req, res, next) {
    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_id', type: 'string' }, { name: 'document_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        Provider_Vehicle_Document.findOne({
                            _id: req.body.document_id,
                            vehicle_id: req.body.vehicle_id,
                            provider_id: req.body.provider_id
                        }).then((providervehicledocument) => {

                            if (providervehicledocument) {
                                if (req.files != undefined && req.files.length > 0) {
                                    utils.deleteImageFromFolder(providervehicledocument.document_picture, 3);
                                    var image_name = providervehicledocument._id + utils.tokenGenerator(4);
                                    var url = utils.getImageFolderPath(req, 3) + image_name + '.jpg';
                                    providervehicledocument.document_picture = url;
                                    utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 3);
                                    providervehicledocument.save();
                                }
                                providervehicledocument.is_uploaded = 1;
                                providervehicledocument.unique_code = req.body.unique_code;
                                providervehicledocument.expired_date = req.body.expired_date;
                                providervehicledocument.is_document_expired = false;


                                providervehicledocument.save().then(() => {
                                    // if (provider.is_vehicle_document_uploaded == false) {
                                    Provider_Vehicle_Document.find({
                                        vehicle_id: req.body.vehicle_id,
                                        option: 1,
                                        provider_id: req.body.provider_id,
                                        is_uploaded: 0
                                    }).then((providervehicledocumentuploaded) => {
                                        Provider_Vehicle_Document.find({
                                            vehicle_id: req.body.vehicle_id,
                                            option: 1,
                                            provider_id: req.body.provider_id,
                                            is_document_expired: true
                                        }).then((expired_providervehicledocumentuploaded) => {
                                            var index = provider.vehicle_detail.findIndex((x) => x._id == req.body.vehicle_id);

                                            if (expired_providervehicledocumentuploaded.length == 0) {
                                                provider.vehicle_detail[index].is_documents_expired = false;
                                            } else {
                                                provider.vehicle_detail[index].is_documents_expired = true;
                                            }
                                            if (providervehicledocumentuploaded.length == 0) {
                                                provider.vehicle_detail[index].is_document_uploaded = true;
                                            } else {
                                                provider.vehicle_detail[index].is_document_uploaded = false;
                                            }
                                            provider.markModified('vehicle_detail');
                                            if (provider.vehicle_detail[index].is_selected) {
                                                if (providervehicledocumentuploaded.length == 0) {
                                                    provider.is_vehicle_document_uploaded = true;
                                                } else {
                                                    provider.is_vehicle_document_uploaded = false;
                                                }
                                            }
                                            provider.save();
                                        });

                                    });
                                    // }
                                    res.json({ success: true, document_detail: providervehicledocument })
                                }, (err) => {
                                    console.log(err);
                                    res.json({
                                        success: false,
                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                    });
                                });

                            } else {
                                res.json({ success: false })
                            }
                        });
                    }
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

exports.provider_update_vehicle_detail = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_name', type: 'string' }, { name: 'plate_no', type: 'string' },
    { name: 'model', type: 'string' }, { name: 'color', type: 'string' }, { name: 'passing_year', type: 'string' }], function (response) {
         if (response.success) {
           Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        var index = provider.vehicle_detail.findIndex((x) => (x._id).toString() == (req.body.vehicle_id).toString())

                        if (index == -1) {
                            res.json({ success: false })
                        } else {
                            provider.vehicle_detail[index].name = req.body.vehicle_name;
                            provider.vehicle_detail[index].plate_no = req.body.plate_no;
                            provider.vehicle_detail[index].model = req.body.model;
                            provider.vehicle_detail[index].color = req.body.color;
                            provider.vehicle_detail[index].accessibility = req.body.accessibility;
                            provider.vehicle_detail[index].passing_year = req.body.passing_year;
                            Provider.findOneAndUpdate({ _id: req.body.provider_id }, { vehicle_detail: provider.vehicle_detail }, { new: true }).then((providerupdate) => {
                                res.json({ success: true, vehicle_detail: providerupdate.vehicle_detail[index] })
                            })
                        }
                    }
                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
}

exports.provider_add_vehicle = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_name', type: 'string' },
    { name: 'passing_year', type: 'string' }, { name: 'model', type: 'string' }, { name: 'color', type: 'string' },
    { name: 'plate_no', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {

                        if (provider.vehicle_detail.length == 0) {
                            provider.service_type = null;
                            provider.admintypeid = null;
                        }
                        var mongoose = require('mongoose');
                        var ObjectId = new mongoose.Types.ObjectId;
                        var x = new ObjectId();
                        var vehicel_json = {
                            _id: x,
                            name: req.body.vehicle_name,
                            accessibility: req.body.accessibility,
                            plate_no: req.body.plate_no,
                            model: req.body.model,
                            color: req.body.color,
                            passing_year: req.body.passing_year,
                            service_type: null,
                            admin_type_id: null,
                            is_documents_expired: false,
                            is_selected: true,
                            is_document_uploaded: false
                        }

                        var files = req.files;
                        Country.findOne({ countryname: provider.country }).then((country) => {

                            Document.find({ countryid: country._id, type: 2 }).then((document) => {

                                var is_document_uploaded = false;

                                var document_size = document.length;

                                if (document_size !== 0) {

                                    var count = 0;
                                    for (var i = 0; i < document_size; i++) {

                                        if (document[i].option == 0) {
                                            count++;
                                        } else {
                                            break;
                                        }
                                        if (count == document_size) {
                                            is_document_uploaded = true;
                                        }
                                    }

                                    document.forEach(function (entry, index) {
                                        var providervehicledocument = new Provider_Vehicle_Document({
                                            vehicle_id: x,
                                            provider_id: provider._id,
                                            document_id: entry._id,
                                            name: entry.title,
                                            option: entry.option,
                                            document_picture: "",
                                            unique_code: entry.unique_code,
                                            expired_date: "",
                                            is_unique_code: entry.is_unique_code,
                                            is_expired_date: entry.is_expired_date,
                                            is_document_expired: false,
                                            is_uploaded: 0
                                        });
                                        providervehicledocument.save().then(() => {
                                        });
                                    });
                                    vehicel_json.is_document_uploaded = is_document_uploaded;
                                } else {
                                    vehicel_json.is_document_uploaded = true;
                                }
                                provider.vehicle_detail.push(vehicel_json);
                                provider.save().then(() => {
                                    Provider_Vehicle_Document.find({ vehicle_id: x }, function (err, provider_vehicle_document) {
                                        res.json({
                                            success: true,
                                            vehicle_detail: vehicel_json,
                                            document_list: provider_vehicle_document
                                        })
                                    });
                                }, (err) => {
                                    console.log(err);
                                    res.json({
                                        success: false,
                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                    });
                                });
                            });

                        });
                    }
                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });

};

/*** 
 * Add Vehicle with Document 
 * Crated By: Ketan Prajapati
 * Created Date: 15-Mar-2021
 * Update By: Monika Patel
 * Created Date: 16-Feb-2022
 * ***/
exports.provider_add_vehicle_with_document = async function (req, res, next) {
    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_name', type: 'string' },
    { name: 'passing_year', type: 'string' }, { name: 'model', type: 'string' }, { name: 'color', type: 'string' },
    { name: 'plate_no', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    // if (req.body.token != null && !utils.validate_token(req.body.token)) {
                    //     res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    // } else {
                        if (provider.vehicle_detail.length == 0) {
                            provider.service_type = null;
                            provider.admintypeid = null;
                        }
                        var mongoose = require('mongoose');
                        var ObjectId = new mongoose.Types.ObjectId;
                        var x = new ObjectId();
                        var vehicel_json = {
                            _id: x,
                            name: req.body.vehicle_name,
                            accessibility: req.body.accessibility,
                            plate_no: req.body.plate_no,
                            model: req.body.model,
                            color: req.body.color,
                            passing_year: req.body.passing_year,
                            service_type: null,
                            admin_type_id: null,
                            is_documents_expired: false,
                            is_selected: true,
                            is_document_uploaded: false
                        }
                        
                        //start on 15-02-2022
                        var ObjectIdIns = new mongoose.Types.ObjectId;
                        var xIns = new ObjectIdIns();
                        var vehicel_insurance_json = {
                            _id: xIns,
                            service_type: null,
                            admin_type_id: null,
                            is_insurance_documents_expired: false,
                            is_selected: true,
                            is_insurance_document_uploaded: false
                        }
                        //end 15-02-2022
                        let promise;
                        let inspromise;
                        Country.findOne({ countryname: provider.country }).then((country) => {


                            // add this below login on 15-02-2022 by monika patel
                            var vehical_files = []
                            var vehical_insurance_file = []
                            if (req.files.length > 0) {
                                for(var i=0; i < req.files.length; i++){
                                    if(req.files[i].fieldname == 'insurance_file'){
                                        vehical_insurance_file.push(req.files[i])
                                    }else{
                                        vehical_files.push(req.files[i])
                                    }
                                }
                            }
                            //end
                            
                            Document.find({ countryid: country._id, type: 2 }).then((document) => {
                                var is_document_uploaded = false;
                                var is_documents_expired = false;

                                var document_size = document.length;

                                if (document_size !== 0) {

                                    var count = 0;
                                    for (var i = 0; i < document_size; i++) {

                                        if (document[i].option == 0) {
                                            count++;
                                        } else {
                                            break;
                                        }
                                        if (count == document_size) {
                                            is_document_uploaded = true;
                                        }
                                    }

                                    document.forEach(function (entry, index) {

                                        /* Start: Code Added to Update Document Details And Save Document */
                                        var docid = new ObjectId();
                                        var uniquecode = req.body.unique_code;
                                        var expireddate = req.body.expired_date;
                                        var isuploaded = 0;
                                        var isdocumentexpired = false;

                                        var url = "";
                                        if (vehical_files.length > 0) {
                                            provider.is_document_uploaded=true;
                                            provider.is_vehicle_document_uploaded=true;
                                            var image_name = docid + utils.tokenGenerator(4);
                                            var extension = path.extname(vehical_files[index].originalname);

                                            url = utils.getImageFolderPath(req, 3) + image_name + extension;
                                            utils.saveImageFromBrowser(vehical_files[index].path, image_name + extension, 3);
                                            console.log('---4765---')
                                            console.log(url)
                                            isuploaded = 1;
                                            isdocumentexpired = true;
                                            is_documents_expired = true;
                                            is_document_uploaded = true;
                                        }
                                        /* End: Code Added to Update Document Details And Save Document */

                                        var providervehicledocument = new Provider_Vehicle_Document({
                                            _id: docid,
                                            vehicle_id: x,
                                            provider_id: provider._id,
                                            document_id: entry._id,
                                            name: entry.title,
                                            option: entry.option,
                                            document_picture: url,
                                            unique_code: uniquecode,
                                            expired_date: expireddate,
                                            is_unique_code: entry.is_unique_code,
                                            is_expired_date: entry.is_expired_date,
                                            is_document_expired: isdocumentexpired,
                                            is_uploaded: isuploaded,
                                            is_insurance: 0
                                        });
                                        /* Start: Promise implemenation done to wait while retrieving document record */
                                        promise = new Promise((resolve, reject) => {
                                            providervehicledocument.save().then(() => {
                                                resolve(true);
                                            })
                                        });
                                    });
                                    vehicel_json.is_document_uploaded = is_document_uploaded;
                                    vehicel_json.is_documents_expired = is_documents_expired;
                                } else {
                                    vehicel_json.is_document_uploaded = true;
                                }
                                provider.vehicle_detail.push(vehicel_json);
                                provider.save().then(async () => {
                                    /* Start: Promise implemenation done - Wait for document saved */
                                    if (promise != null) {
                                        var waitToComlete = await promise;
                                    }
                                    /* End: Promise implemenation done - Wait for document saved */
                                    //add below vehicle insurance doc upload on 15-02-2022 by monika
                                    if (vehical_insurance_file != undefined && vehical_insurance_file.length > 0) {
                                        Document.find({ countryid: country._id, type: 4 }).then((insurance_document) => {
                                            console.log('insurance_document length--- 12')
                                            console.log(insurance_document.length)
                                            var is_insurance_document_uploaded = false;
                                            var is_insurance_documents_expired = false;

                                            var insurance_document_size = insurance_document.length;

                                            if (insurance_document_size !== 0) {

                                                var count_ins = 0;
                                                for (var i = 0; i < insurance_document_size; i++) {

                                                    if (insurance_document[i].option == 0) {
                                                        count_ins++;
                                                    } else {
                                                        break;
                                                    }
                                                    if (count_ins == insurance_document_size) {
                                                        is_insurance_document_uploaded = true;
                                                    }
                                                }

                                                insurance_document.forEach(function (entry, index) {

                                                    /* Start: Code Added to Update Document Details And Save Document */
                                                    var insdocid = new ObjectId();
                                                    var uniquecode = req.body.unique_code;
                                                    var expireddate = req.body.expired_date;
                                                    var isinsuploaded = 0;
                                                    var isinsurancedocumentexpired = false;

                                                    var insurl = "";
                                                    console.log('req.insurance_file-----')
                                                    console.log(vehical_insurance_file.length)
                                                    if (vehical_insurance_file != undefined && vehical_insurance_file.length > 0) {
                                                        console.log('---4862---')
                                                        // provider.is_insurance_document_uploaded=true;
                                                        // provider.is_vehicle_document_uploaded=true;
                                                        var image_name = insdocid + utils.tokenGenerator(4);
                                                        var extension = path.extname(vehical_insurance_file[index].originalname);

                                                        insurl = utils.getImageFolderPath(req, 3) + image_name + extension;
                                                        utils.saveImageFromBrowser(vehical_insurance_file[index].path, image_name + extension, 3);
                                                        console.log('---4870---')
                                                        console.log(insurl)
                                                        isinsuploaded = 1;
                                                        isinsurancedocumentexpired = true;
                                                        is_insurance_documents_expired = true;
                                                        is_insurance_document_uploaded = true;
                                                    }
                                                    /* End: Code Added to Update Document Details And Save Document */

                                                    var providervehicledocument = new Provider_Vehicle_Document({
                                                        _id: insdocid,
                                                        vehicle_id: x,
                                                        provider_id: provider._id,
                                                        document_id: entry._id,
                                                        name: entry.title,
                                                        option: entry.option,
                                                        document_picture: insurl,
                                                        unique_code: uniquecode,
                                                        expired_date: expireddate,
                                                        is_unique_code: entry.is_unique_code,
                                                        is_expired_date: entry.is_expired_date,
                                                        is_document_expired: isinsurancedocumentexpired,
                                                        is_uploaded: isinsuploaded,
                                                        is_insurance: 1
                                                    });
                                                    /* Start: Promise implemenation done to wait while retrieving document record */
                                                    inspromise = new Promise((resolve, reject) => {
                                                        providervehicledocument.save().then(() => {
                                                            resolve(true);
                                                        })
                                                    });
                                                });
                                                vehicel_insurance_json.is_insurance_document_uploaded = is_insurance_document_uploaded;
                                                vehicel_insurance_json.is_insurance_documents_expired = is_insurance_documents_expired;
                                            } else {
                                                vehicel_insurance_json.is_insurance_document_uploaded = true;
                                            }
                                            provider.vehicle_detail.push(vehicel_insurance_json);
                                            provider.save().then(async () => {
                                                /* Start: Promise implemenation done - Wait for document saved */
                                                if (inspromise != null) {
                                                    var waitToComlete = await inspromise;
                                                }
                                                /* End: Promise implemenation done - Wait for document saved */
                                                Provider_Vehicle_Document.find({ vehicle_id: x }, function (err, provider_vehicle_document) {
                                                    res.json({
                                                        success: true,
                                                        vehicle_detail: vehicel_json,
                                                        vehicle_insurance_detail: vehicel_insurance_json,
                                                        document_list: provider_vehicle_document
                                                    })
                                                });
                                            }, (err) => {
                                                console.log("Invalid Error 4218");
                                                console.log(err);
                                                console.log("Invalid Error 4220");
                                                res.json({
                                                    success: false,
                                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                });
                                            });
                                        });
                                    }else{
                                        Provider_Vehicle_Document.find({ vehicle_id: x }, function (err, provider_vehicle_document) {
                                            res.json({
                                                success: true,
                                                vehicle_detail: vehicel_json,
                                                vehicle_insurance_detail: vehicel_insurance_json,
                                                document_list: provider_vehicle_document
                                            })
                                        });
                                    }
                                    //end 15-02-2022
                                }, (err) => {
                                    console.log("Invalid Error 4218");
                                    console.log(err);
                                    console.log("Invalid Error 4220");
                                    res.json({
                                        success: false,
                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                    });
                                });
                            }); 


                        });
                    //}
                } else {
                    console.log("Invalid Provider");
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG,
                        error_description: "Invalid Provider"
                    });
                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });

};

/*** 
 * Update Vehicle Details with Document 
 * Crated By: Ripal Patel
 * Created Date: 16-Mar-2021
 * Update By: Monika Patel
 * Created Date: 16-Feb-2022
 * ***/
exports.provider_update_vehicle_detail_with_document = async function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_name', type: 'string' }, { name: 'plate_no', type: 'string' },
    { name: 'model', type: 'string' }, { name: 'color', type: 'string' }, { name: 'passing_year', type: 'string' }, { name: 'vehicle_id', type: 'string' },{ name: 'token', type: 'string' }], function (response) {
        if (response.success) {
            console.log("Log1", req.Files);
            var jwt = utils.validate_token(req.body.token);

            if (jwt) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    // if (req.body.token != null && provider.token != req.body.token) {
                    //     res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    // } else {
                        var index = provider.vehicle_detail.findIndex((x) => (x._id).toString() == (req.body.vehicle_id).toString())

                        if (index == -1) {
                            res.json({ success: false })
                        } else {
                            provider.vehicle_detail[index].name = req.body.vehicle_name;
                            provider.vehicle_detail[index].plate_no = req.body.plate_no;
                            provider.vehicle_detail[index].model = req.body.model;
                            provider.vehicle_detail[index].color = req.body.color;
                            provider.vehicle_detail[index].accessibility = req.body.accessibility;
                            provider.vehicle_detail[index].passing_year = req.body.passing_year;

                            var provider_vehicle_documentRes = "";
                            let promise;
                            Provider.findOneAndUpdate({ _id: req.body.provider_id }, { vehicle_detail: provider.vehicle_detail }, { new: true }).then((providerupdate) => {
                                /* Start: Code Added to Update vehicle Document Details And Save Document, change below function on 16-02-2022 by monika */
                                Provider_Vehicle_Document.find({
                                    vehicle_id: req.body.vehicle_id,
                                    provider_id: req.body.provider_id
                                }).then((providervehicledocument) => {

                                    if (providervehicledocument) {
                                        //add this below login on 16-02-2022 by monika patel for find vehicle registern insursnce doc 
                                        var vehicle_Index = providervehicledocument.findIndex(function(vehicle) {
                                            return vehicle.is_insurance == 0
                                        });
                                        if(providervehicledocument.length == 1){
                                            vehicle_Index = 0
                                        }
                                        var vehicle_ins_Index = providervehicledocument.findIndex(function(vehicle_ins) {
                                            return vehicle_ins.is_insurance == 1
                                        });

                                        var vehicleDocData = providervehicledocument[vehicle_Index]
                                        var vehicleInsDocData = providervehicledocument[vehicle_ins_Index]

                                        if(vehicleDocData == undefined){
                                            vehicle_Index = providervehicledocument.findIndex(function(vehicle) {
                                                return vehicle.name == 'Vehicle Registration Document'
                                            });
                                            vehicleDocData = providervehicledocument[vehicle_Index]
                                        }

                                        if(vehicleInsDocData == undefined){
                                            vehicle_ins_Index = providervehicledocument.findIndex(function(vehicle_ins) {
                                                return vehicle_ins.name == 'Vehicle Insurance Document'
                                            });
                                            vehicleInsDocData = providervehicledocument[vehicle_ins_Index]
                                        }
                                        
                                        var vehical_files = []
                                        var vehical_insurance_file = []
                                        if (req.files != undefined && req.files.length > 0) {
                                            for(var i=0; i < req.files.length; i++){
                                                if(req.files[i].fieldname == 'insurance_file'){
                                                    vehical_insurance_file.push(req.files[i])
                                                }else{
                                                    vehical_files.push(req.files[i])
                                                }
                                            }
                                        }
                                        //end 16-02-2022

                                        if (vehical_files.length > 0) {
                                            utils.deleteImageFromFolder(vehicleDocData.document_picture, 3);
                                            var image_name = vehicleDocData._id + utils.tokenGenerator(4);
                                            var path = require('path');
                                            var extension = path.extname(vehical_files[0].originalname);
                                            var url = utils.getImageFolderPath(req, 3) + image_name + extension;
                                            vehicleDocData.document_picture = url;
                                            utils.saveImageFromBrowser(vehical_files[0].path, image_name + extension, 3);
                                            vehicleDocData.save();
                                        }
                                        vehicleDocData.is_uploaded = 1;
                                        vehicleDocData.unique_code = req.body.unique_code;
                                        vehicleDocData.expired_date = req.body.expired_date;
                                        vehicleDocData.is_document_expired = false;
                                        vehicleDocData.is_insurance = 0
    
                                        vehicleDocData.save();
                                        /* Start: Promise implemenation done to wait while retrieving document record */
                                        promise = new Promise((resolve, reject) => {
                                            vehicleDocData.save().then(() => {
                                                resolve(true);
                                            })
                                        });
                                        provider_vehicle_documentRes = vehicleDocData;
                                        Provider_Vehicle_Document.find({
                                            vehicle_id: req.body.vehicle_id,
                                            option: 1,
                                            provider_id: req.body.provider_id,
                                            is_uploaded: 0,
                                            is_insurance: 0
                                        }).then((providervehicledocumentuploaded) => {
                                            Provider_Vehicle_Document.find({
                                                vehicle_id: req.body.vehicle_id,
                                                option: 1,
                                                provider_id: req.body.provider_id,
                                                is_document_expired: true,
                                                is_insurance: 0
                                            }).then((expired_providervehicledocumentuploaded) => {
                                                var index = provider.vehicle_detail.findIndex((x) => x._id == req.body.vehicle_id);
    
                                                if (expired_providervehicledocumentuploaded.length == 0) {
                                                    provider.vehicle_detail[index].is_documents_expired = false;
                                                } else {
                                                    provider.vehicle_detail[index].is_documents_expired = true;
                                                }
                                                if (providervehicledocumentuploaded.length == 0) {
                                                    provider.vehicle_detail[index].is_document_uploaded = true;
                                                } else {
                                                    provider.vehicle_detail[index].is_document_uploaded = false;
                                                }
                                                provider.markModified('vehicle_detail');
                                                if (provider.vehicle_detail[index].is_selected) {
                                                    if (providervehicledocumentuploaded.length == 0) {
                                                        provider.is_vehicle_document_uploaded = true;
                                                    } else {
                                                        provider.is_vehicle_document_uploaded = false;
                                                    }
                                                }
                                                provider.save().then(async () => {
                                                    if (vehical_insurance_file.length > 0) {
                                                        // add on 16-02-2022 by monika as update vehicle insurance
                                                        if(vehicleInsDocData == undefined){
                                                            var mongoose = require('mongoose');
                                                            var ObjectId = new mongoose.Types.ObjectId;
                                                            var ObjectIdIns = new mongoose.Types.ObjectId;
                                                            var xIns = new ObjectIdIns();
                                                            var vehicel_insurance_json = {
                                                                _id: xIns,
                                                                service_type: null,
                                                                admin_type_id: null,
                                                                is_insurance_documents_expired: false,
                                                                is_selected: true,
                                                                is_insurance_document_uploaded: false
                                                            }
                                                            
                                                            Document.find({ countryid: provider.country_id, type: 4 }).then((insurance_document) => {
                                                                
                                                                var is_insurance_document_uploaded = false;
                                                                var is_insurance_documents_expired = false;
                    
                                                                var insurance_document_size = insurance_document.length;
                    
                                                                if (insurance_document_size !== 0) {
                    
                                                                    var count_ins = 0;
                                                                    for (var i = 0; i < insurance_document_size; i++) {
                    
                                                                        if (insurance_document[i].option == 0) {
                                                                            count_ins++;
                                                                        } else {
                                                                            break;
                                                                        }
                                                                        if (count_ins == insurance_document_size) {
                                                                            is_insurance_document_uploaded = true;
                                                                        }
                                                                    }
                    
                                                                    insurance_document.forEach(function (entry, index) {
                    
                                                                        /* Start: Code Added to Update Document Details And Save Document */
                                                                        var insdocid = new ObjectId();
                                                                        var uniquecode = req.body.unique_code;
                                                                        var expireddate = req.body.expired_date;
                                                                        var isinsuploaded = 0;
                                                                        var isinsurancedocumentexpired = false;
                    
                                                                        var insurl = "";
    
                                                                        if (vehical_insurance_file != undefined && vehical_insurance_file.length > 0) {
                                                                            
                                                                            var image_name = insdocid + utils.tokenGenerator(4);
                                                                            var path = require('path');
                                                                            var extension = path.extname(vehical_insurance_file[index].originalname);
                    
                                                                            insurl = utils.getImageFolderPath(req, 3) + image_name + extension;
                                                                            utils.saveImageFromBrowser(vehical_insurance_file[index].path, image_name + extension, 3);
                                                                            isinsuploaded = 1;
                                                                            isinsurancedocumentexpired = true;
                                                                            is_insurance_documents_expired = true;
                                                                            is_insurance_document_uploaded = true;
                                                                        }
                                                                        /* End: Code Added to Update Document Details And Save Document */
                    
                                                                        var providervehicledocument = new Provider_Vehicle_Document({
                                                                            _id: insdocid,
                                                                            vehicle_id: req.body.vehicle_id,
                                                                            provider_id: req.body.provider_id,
                                                                            document_id: entry._id,
                                                                            name: entry.title,
                                                                            option: entry.option,
                                                                            document_picture: insurl,
                                                                            unique_code: uniquecode,
                                                                            expired_date: expireddate,
                                                                            is_unique_code: entry.is_unique_code,
                                                                            is_expired_date: entry.is_expired_date,
                                                                            is_document_expired: isinsurancedocumentexpired,
                                                                            is_uploaded: isinsuploaded,
                                                                            is_insurance: 1
                                                                        });
                                                                        /* Start: Promise implemenation done to wait while retrieving document record */
                                                                        inspromise = new Promise((resolve, reject) => {
                                                                            providervehicledocument.save().then(() => {
                                                                                resolve(true);
                                                                            })
                                                                        });
                                                                    });
                                                                    vehicel_insurance_json.is_insurance_document_uploaded = is_insurance_document_uploaded;
                                                                    vehicel_insurance_json.is_insurance_documents_expired = is_insurance_documents_expired;
                                                                } else {
                                                                    vehicel_insurance_json.is_insurance_document_uploaded = true;
                                                                }
                                                                provider.vehicle_detail.push(vehicel_insurance_json);
                                                                provider.save().then(async () => {
                                                                    /* Start: Promise implemenation done - Wait for document saved */
                                                                    if (inspromise != null) {
                                                                        var waitToComlete = await inspromise;
                                                                    }
                                                                    /* End: Promise implemenation done - Wait for document saved */
                                                                    Provider_Vehicle_Document.find({ vehicle_id: req.body.vehicle_id }, function (err, provider_vehicle_document) {
                                                                        res.json({
                                                                            success: true,
                                                                            vehicle_detail: providerupdate.vehicle_detail[index],
                                                                            document_list: provider_vehicle_document
                                                                        })
                                                                    }); 
                                                                }, (err) => {
                                                                    console.log("Invalid Error 4218");
                                                                    console.log(err);
                                                                    console.log("Invalid Error 4220");
                                                                    res.json({
                                                                        success: false,
                                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                                    });
                                                                });
                                                            });
                                                        }else{
                                                            if (vehical_insurance_file.length > 0) {
                                                                utils.deleteImageFromFolder(vehicleInsDocData.document_picture, 3);
                                                                var image_name = vehicleInsDocData._id + utils.tokenGenerator(4);
                                                                var path = require('path');
                                                                var extension = path.extname(vehical_insurance_file[0].originalname);
                                                                var url = utils.getImageFolderPath(req, 3) + image_name + extension;
                                                                vehicleInsDocData.document_picture = url;
                                                                utils.saveImageFromBrowser(vehical_insurance_file[0].path, image_name + extension, 3);
                                                                vehicleInsDocData.save();
                                                            }
                                                            vehicleInsDocData.is_uploaded = 1;
                                                            vehicleInsDocData.unique_code = req.body.unique_code;
                                                            vehicleInsDocData.expired_date = req.body.expired_date;
                                                            vehicleInsDocData.is_document_expired = false;
                                                            vehicleInsDocData.is_insurance = 1
                        
                                                            vehicleInsDocData.save();
                                                            /* Start: Promise implemenation done to wait while retrieving document record */
                                                            promise = new Promise((resolve, reject) => {
                                                                vehicleInsDocData.save().then(() => {
                                                                    resolve(true);
                                                                })
                                                            });  
    
                                                            Provider_Vehicle_Document.find({ vehicle_id: req.body.vehicle_id }, function (err, provider_vehicle_document) {
                                                                res.json({
                                                                    success: true,
                                                                    vehicle_detail: providerupdate.vehicle_detail[index],
                                                                    document_list: provider_vehicle_document
                                                                })
                                                            });     
                                                            //end
                                                        }
                                                    }else{    
                                                        Provider_Vehicle_Document.find({ vehicle_id: req.body.vehicle_id }, function (err, provider_vehicle_document) {
                                                            res.json({
                                                                success: true,
                                                                vehicle_detail: providerupdate.vehicle_detail[index],
                                                                document_list: provider_vehicle_document
                                                            })
                                                        });
                                                    }
                                                }, (err) => {
                                                    console.log(err);
                                                    res.json({
                                                        success: false,
                                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                                    });
                                                });
                                            });
    
                                        });

                                    }
                                });

                                /* End: Code Added to Update vehicle Document Details And Save Document */

                            })

                        }
                    //}
                }
            });}
            else
            {
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_INVALID_TOKEN
                });
            }
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
}

exports.provider_delete_vehicle_detail = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'vehicle_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        var index = provider.vehicle_detail.findIndex((x) => (x._id).toString() == (req.body.vehicle_id).toString());
                        if (index == -1) {
                            res.json({ success: false })
                        } else {
                            if (provider.vehicle_detail[index].is_selected == true) {
                                provider.service_type = null;
                                provider.admintypeid = null;
                                if (provider.vehicle_detail.length == 1) {
                                    provider.is_vehicle_document_uploaded = false;
                                }
                            }
                            provider.vehicle_detail.splice(index, 1);
                            Provider.findOneAndUpdate({ _id: req.body.provider_id }, { vehicle_detail: provider.vehicle_detail }, { new: true }).then((providerupdate) => {
                                res.json({ success: true, vehicle_detail: providerupdate.vehicle_detail[index] })
                            });
                        }
                    }
                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

//update_provider_setting
exports.update_provider_setting = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        provider.languages = req.body.languages;
                        provider.received_trip_from_gender = req.body.received_trip_from_gender;

                        provider.save().then(() => {
                            res.json({
                                success: true, languages: provider.languages,
                                received_trip_from_gender: provider.received_trip_from_gender
                            })
                        }, (err) => {
                            console.log(err);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        });
                    }

                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_GET_YOUR_DETAIL });

                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
}

exports.my_schedules = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'token', type: 'string' }], function (response) {
        if (response.success) {
            Trip.findOne({ provider_id: req.body.provider_id }).then((provider) => {
                var jwt = utils.validate_token(req.body.token);
                var jwt = true;
                if (provider) {
                    if (jwt) {
                        console.log("req");
                        console.log(req.body.provider_id);
                        console.log("_id");
                        console.log(provider._id);
                        console.log("requisitionsysid");
                        console.log(provider.requisitionsysid);
                        console.log("provider_id");
                        console.log(provider.provider_id);
                        TripOrder.findOne({ trip_id: provider._id }).then((trip) => {
                            console.log("ordering clinic");
                            console.log(trip.order.clinic.name);
                        });
                        if (provider) {
                            Trip.aggregate([condition, lookup1, unwind1, group]).then((array) => {
                                var trips = [];
                                if (array.length > 0) {
                                    var promises = [];
                                    array.forEach(function (trip) {
                                        promises.push(TripOrder.findOne({ trip_id: trip._id }).then((tripOrder) => {

                                            if (tripOrder) {

                                                //add on 13/9/21
                                                var physician = null;
                                                var clinic = null;
                                                var results = [];
                                                var provider_id = '';
                                                var order = [];
                                                var preCheck = config.PrePostUrl + '?procedureCode=PRECHK&requisitionSysID=' + trip.requsitionSysID + '&token=@token';
                                                var postCheck = config.PrePostUrl + '?procedureCode=POSTCHK&requisitionSysID=' + trip.requsitionSysID + '&token=@token';
                                                var ResultPostingUrl = config.ResultPostingUrl + '?procedureCode=PTP&requisitionSysID=' + trip.requsitionSysID + '&token=' + req.body.token;
                                                var faxUrl = config.FaxUrl + '?requisitionSysID=' + trip.requsitionSysID + '&token=@token';//changed by Het on 04-11-2022 for changing FaxUrl 
                                                var printRequisitionUrl = config.PrintRequisitionUrl + '?requisitionSysID=' + trip.requsitionSysID + '&token=@token';//changed by Het on 04-11-2022 for changing PrintRequisitionUrl 
                                                var receiveSpecimenUrl = config.ReceiveSpecimenUrl + '?requisitionSysID=' + trip.requsitionSysID + '&token=@token';//changed by Het on 04-11-2022 for changing ReceiveSpecimenUrl
                                                console.log(faxUrl);
                                                console.log(printRequisitionUrl);
                                                console.log(receiveSpecimenUrl);
                                                //end 13/9/21

                                                var patient = null;
                                                var specimens = [];
                                                // if (tripOrder != null && tripOrder.order != null) {
                                                //     patient = tripOrder.order.patient;
                                                //     for (var j = 0; j < tripOrder.order.orderlist.length; j++) {
                                                //         specimens.push(tripOrder.order.orderlist[j].specimens);
                                                //     }
                                                // }
                                                //add on 13/9/21
                                                if (tripOrder != null && tripOrder.order != null) {
                                                    provider_id = tripOrder.provide_id;
                                                    patient = tripOrder.order.patient;
                                                    physician = tripOrder.order.physician;
                                                    var age = getAge(patient.dob);
                                                    patient.age = age;
                                                    clinic = tripOrder.order.clinic;
                                                    for (var j = 0; j < tripOrder.order.orderlist.length; j++) {
                                                        //orderids.push(tripOrder.order.orderlist[j].id);
                                                        //stats.push(tripOrder.order.orderlist[j].stat);
                                                        order.push({
                                                            status: tripOrder.order.orderlist[j].status,
                                                            stat: tripOrder.order.orderlist[j].stat,
                                                            processseq: tripOrder.order.orderlist[j].processseq,
                                                            print_seq: tripOrder.order.orderlist[j].print_seq,
                                                            procedure_loincode: tripOrder.order.orderlist[j].procedure_loincode,
                                                            testname: tripOrder.order.orderlist[j].testname,
                                                            testcode: tripOrder.order.orderlist[j].testcode,
                                                            iswaived: tripOrder.order.orderlist[j].iswaived,
                                                            proceduretype: tripOrder.order.orderlist[j].proceduretype,
                                                            proceduresysid: tripOrder.order.orderlist[j].proceduresysid,
                                                        });

                                                        var tripOrderListOrder = tripOrder.order.orderlist[j];
                                                        for (var k = 0; j < tripOrderListOrder.specimens.length; k++) {
                                                            if (tripOrder.order.orderlist[j].specimens[k] == null) {
                                                                break;
                                                            }
                                                            specimens.push(tripOrder.order.orderlist[j].specimens[k]);
                                                        }
                                                        for (var k = 0; j < tripOrderListOrder.results.length; k++) {
                                                            if (tripOrder.order.orderlist[j].results[k] == null) {
                                                                break;
                                                            }
                                                            results.push(tripOrder.order.orderlist[j].results[k]);
                                                        }
                                                    }
                                                }

                                                // end 13/9/21
                                                var origins = [];
                                                var destinations = [];
                                                if (trip.sourceLocation != null && trip.sourceLocation.length > 0) {
                                                    origins.push(trip.sourceLocation[0] + "," + trip.sourceLocation[1]);
                                                }
                                                else {
                                                    origins.push(trip.source_address);
                                                }

                                                if (trip.destinationLocation != null && trip.destinationLocation.length > 0) {
                                                    destinations.push(trip.destinationLocation[0] + "," + trip.destinationLocation[1]);
                                                }
                                                else {
                                                    destinations.push(trip.destination_address);
                                                }
                                                return calcDistances({ origins: origins, destinations: destinations }).then(result => {
                                                    // trip.duration = result.duration;
                                                    // trip.distance = result.distance;
                                                    // trips.push({
                                                    //     trip: trip,
                                                    //     patient: patient,
                                                    //     specimens: specimens
                                                    // console.log(trip);
                                                    trips.push({
                                                        triptype: trip.triptype,
                                                        tripDrive: {
                                                            sourcelocation: provider.providerLocation,
                                                            destinationlocation: trip.sourceLocation
                                                        },
                                                        trip: trip,
                                                        notes: '',
                                                        precheck: preCheck,
                                                        postcheck: postCheck,
												        // HetP - 9/2/2022 - Result Entry
												        ResultPostingUrl:ResultPostingUrl,
                                                        faxUrl:faxUrl,
                                                        printRequisitionUrl:printRequisitionUrl,
                                                        receiveSpecimenUrl:receiveSpecimenUrl,
                                                        //stats: stats,
                                                        provider_id: provider_id,
                                                        //orderids: orderids,
                                                        order: order,
                                                        patient: patient,
                                                        physician: physician,
                                                        specimens: specimens,
                                                        results: results,
                                                        clinic: clinic,
                                                        totalMiles: result[0].distanceValue != 0 ? (result[0].distanceValue / 1609).toFixed(2) + " mi" : '',
                                                        ETA: result[0].duration,
                                                        status:trip.status

                                                    });
                                                }).catch(() => {
                                                    // trips.push({
                                                    //     trip: trip,
                                                    //     patient: patient,
                                                    //     specimens: specimens

                                                    trips.push({
                                                        triptype: trip.triptype,
                                                        tripDrive: {
                                                            sourcelocation: provider.providerLocation,
                                                            destinationlocation: trip.sourceLocation
                                                        },
                                                        trip: trip,
                                                        notes: '',
                                                        precheck: preCheck,
                                                        postcheck: postCheck,
                                                        //stats: stats,
                                                        provider_id: provider_id,
                                                        //orderids: orderids,
                                                        order: order,
                                                        patient: patient,
                                                        physician: physician,
                                                        specimens: specimens,
                                                        results: results,
                                                        clinic: clinic,
                                                        //change this as not getting result array on 16-03-2022
                                                        // totalMiles: result[0].distanceValue != 0 ? (result[0].distanceValue / 1609).toFixed(2) + " mi" : '',
                                                        totalMiles: '',
                                                        // ETA: result[0].duration,
                                                        ETA: '',
                                                        status:trip.status

                                                    });
                                                });
                                            }
                                            else {
                                                trips.push({
                                                    trip: trip
                                                })
                                            }
                                        }));
                                    });
                                    //change on 13/9/21

                                    // Promise.all(promises).then(() => {
                                    //     res.json({
                                    //         success: true,
                                    //         trips: trips
                                    //     })
                                    // });

                                }
                                else {
                                    res.json({ success: false, error_code: error_message.ERROR_CODE_NO_TRIP_FOUND });
                                }
                            }, (err) => {
                                // console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });
                        } else {
                            res.json({ success: false, error_code: error_message.ERROR_CODE_NO_TRIP_FOUND });
                        }
                    }
                    else {
                        res.json({
                            success: false,
                            error_code: error_message.ERROR_CODE_INVALID_TOKEN
                        });
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
                }
            }, (err) => {
                // console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};



exports.get_provider_setting_detail = function (req, res) {

    var terms_and_condition_url = req.protocol + '://' + req.get('host') + "/terms";
    var privacy_policy_url = req.protocol + '://' + req.get('host') + "/support";

    var setting_response = {};
    setting_response.terms_and_condition_url = terms_and_condition_url
    setting_response.privacy_policy_url = privacy_policy_url
    setting_response.admin_phone = setting_detail.admin_phone;
    setting_response.contactUsEmail = setting_detail.contactUsEmail;
    setting_response.is_tip = setting_detail.is_tip;
    setting_response.is_toll = setting_detail.is_toll;
    setting_response.scheduled_request_pre_start_minute = setting_detail.scheduled_request_pre_start_minute;
    setting_response.providerEmailVerification = setting_detail.providerEmailVerification;
    setting_response.stripe_publishable_key = setting_detail.stripe_publishable_key;
    setting_response.providerSms = setting_detail.providerSms;
    setting_response.twilio_call_masking = setting_detail.twilio_call_masking;
    setting_response.is_provider_initiate_trip = setting_detail.is_provider_initiate_trip;
    setting_response.providerPath = setting_detail.providerPath;
    setting_response.image_base_url = setting_detail.image_base_url;

    if (req.body.device_type == 'android') {
        setting_response.android_provider_app_google_key = setting_detail.android_provider_app_google_key;
        setting_response.android_provider_app_version_code = setting_detail.android_provider_app_version_code;
        setting_response.android_provider_app_force_update = setting_detail.android_provider_app_force_update;
    } else {
        setting_response.ios_provider_app_google_key = setting_detail.ios_provider_app_google_key;
        setting_response.ios_provider_app_version_code = setting_detail.ios_provider_app_version_code;
        setting_response.ios_provider_app_force_update = setting_detail.ios_provider_app_force_update;
    }

    var provider_id = req.body.provider_id;
    if (provider_id == '') {
        provider_id = null;
    }
    Provider.findOne({ _id: provider_id }).then((provider_detail) => {
        // if (provider_detail && provider_detail.token !== req.body.token) {
        //     res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN, setting_detail: setting_response });
        // } else {
            var response = {};
            if (provider_detail) {
                Country.findOne({ countryname: provider_detail.country }).then((country) => {
                    response.first_name = provider_detail.first_name;
                    response.last_name = provider_detail.last_name;
                    response.email = provider_detail.email;
                    response.country_phone_code = provider_detail.country_phone_code;
                    response.is_document_uploaded = provider_detail.is_document_uploaded;
                    response.address = provider_detail.address;
                    response.is_approved = provider_detail.is_approved;
                    response._id = provider_detail._id;
                    response.social_ids = provider_detail.social_ids;
                    response.social_unique_id = provider_detail.social_unique_id;
                    response.phone = provider_detail.phone;
                    response.login_by = provider_detail.login_by;
                    response.is_documents_expired = provider_detail.is_documents_expired;
                    response.account_id = provider_detail.account_id;
                    response.bank_id = provider_detail.bank_id;
                    response.city = provider_detail.city;
                    response.country = provider_detail.country;
                    response.rate = provider_detail.rate;
                    response.rate_count = provider_detail.rate_count;
                    response.token = provider_detail.token;
                    response.is_vehicle_document_uploaded = provider_detail.is_vehicle_document_uploaded;
                    response.service_type = provider_detail.service_type;
                    response.admintypeid = provider_detail.admintypeid;
                    response.is_available = provider_detail.is_available;
                    response.is_active = provider_detail.is_active;
                    response.is_partner_approved_by_admin = provider_detail.is_partner_approved_by_admin;
                    response.picture = provider_detail.picture;
                    response.wallet_currency_code = provider_detail.wallet_currency_code;
                    response.is_referral = provider_detail.is_referral;
                    response.referral_code = provider_detail.referral_code;
                    response.country_detail = { "is_referral": country.is_provider_referral }
                    //send employeeID autogenerated in LIS 
                    response.employee_id="";
                    if(provider_detail.UserID){
                        response.employee_id=provider_detail.UserID;
                    }
                    //send ssn number 
                    response.ssn_no = ""
                    if(provider_detail.ssn_no){
                        response.ssn_no = data.ssn_no
                    }
                    //send body_temprature 
                    response.body_temprature = ""
                    if(provider_detail.body_temprature){
                        response.body_temprature = provider_detail.body_temprature
                    }
                    
                    if (provider_detail.is_trip.length > 0) {
                        Trip.findOne({ _id: provider_detail.is_trip[0] }).then((trip_detail) => {
                            if (trip_detail) {
                                var start_time = trip_detail.updated_at;
                                var end_time = new Date();
                                var res_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
                                var provider_timeout = setting_detail.provider_timeout;
                                var time_left_to_responds_trip = provider_timeout - res_sec;
                                User.findOne({ _id: trip_detail.user_id }, function (error, user_detail) {
                                    var trip_details = {
                                        trip_id: provider_detail.is_trip[0],
                                        user_id: trip_detail.user_id,
                                        is_provider_accepted: trip_detail.is_provider_accepted,
                                        is_provider_status: trip_detail.is_provider_status,
                                        trip_type: trip_detail.trip_type,
                                        source_address: trip_detail.source_address,
                                        destination_address: trip_detail.destination_address,
                                        sourceLocation: trip_detail.sourceLocation,
                                        destinationLocation: trip_detail.destinationLocation,
                                        is_trip_end: trip_detail.is_trip_end,
                                        time_left_to_responds_trip: time_left_to_responds_trip,
                                        user: {
                                            first_name: user_detail.first_name,
                                            last_name: user_detail.last_name,
                                            phone: user_detail.phone,
                                            country_phone_code: user_detail.country_phone_code,
                                            rate: user_detail.rate,
                                            rate_count: user_detail.rate_count,
                                            picture: user_detail.picture
                                        }
                                    }
                                    res.json({
                                        success: true, setting_detail: setting_response, phone_number_min_length: country.phone_number_min_length,
                                        phone_number_length: country.phone_number_length,
                                        provider_detail: response, trip_detail: trip_details
                                    });
                                });
                            } else {
                                res.json({
                                    success: true, setting_detail: setting_response, phone_number_min_length: country.phone_number_min_length,
                                    phone_number_length: country.phone_number_length, provider_detail: response
                                });
                            }
                        });
                    } else {
                        res.json({
                            success: true, setting_detail: setting_response, phone_number_min_length: country.phone_number_min_length,
                            phone_number_length: country.phone_number_length, provider_detail: response
                        });
                    }
                });

            } else {
                res.json({ success: true, setting_detail: setting_response })
            }
        //}
    })
};



exports.get_provider_privacy_policy = function (req, res) {
    res.send(setting_detail.provider_privacy_policy)
};

exports.get_provider_terms_and_condition = function (req, res) {
    res.send(setting_detail.provider_terms_and_condition)
};



exports.apply_provider_referral_code = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'referral_code', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }, function (err, provider) {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        var is_skip = req.body.is_skip;

                        if (is_skip == 0) {
                            var referral_code = req.body.referral_code;
                            Provider.findOne({ referral_code: referral_code }).then((providerData) => {
                                if (!providerData) {
                                    res.json({ success: false, error_code: error_message.ERROR_CODE_REFERRAL_CODE_INVALID });
                                } else if (providerData.country != provider.country) {
                                    res.json({
                                        success: false,
                                        error_code: error_message.ERROR_CODE_YOUR_FRIEND_COUNTRY_NOT_MATCH_WITH_YOU
                                    });
                                } else {

                                    if (provider.is_referral == 1) {
                                        res.json({
                                            success: false,
                                            error_code: error_message.ERROR_CODE_YOU_HAVE_ALREADY_APPLY_REFERRAL_CODE
                                        });
                                    } else {
                                        Country.findOne({ countryphonecode: provider.country_phone_code }).then((country) => {

                                            var providerRefferalCount = providerData.total_referrals;

                                            if (providerRefferalCount < country.providerreferral) {

                                                var total_wallet_amount = utils.addWalletHistory(constant_json.PROVIDER_UNIQUE_NUMBER, providerData.unique_id, providerData._id, null,
                                                    providerData.wallet_currency_code, providerData.wallet_currency_code,
                                                    1, country.bonus_to_providerreferral, providerData.wallet, constant_json.ADD_WALLET_AMOUNT, constant_json.ADDED_BY_REFERRAL, " provider used your referral code, provider id : " + provider.unique_id);

                                                providerData.total_referrals = +providerData.total_referrals + 1;
                                                providerData.wallet = total_wallet_amount;
                                                providerData.save().then(() => {
                                                });

                                                provider.is_referral = 1;
                                                provider.referred_by = providerData._id;

                                                total_wallet_amount = utils.addWalletHistory(constant_json.PROVIDER_UNIQUE_NUMBER, provider.unique_id, provider._id, null,
                                                    provider.wallet_currency_code, provider.wallet_currency_code,
                                                    1, country.referral_bonus_to_provider, provider.wallet, constant_json.ADD_WALLET_AMOUNT, constant_json.ADDED_BY_REFERRAL, "Using refferal code : " + referral_code + " of provider id : " + providerData.unique_id);

                                                provider.wallet = total_wallet_amount;
                                                provider.save().then(() => {
                                                    res.json({
                                                        success: true,
                                                        message: success_messages.MESSAGE_CODE_REFERRAL_PROCESS_SUCCESSFULLY_COMPLETED
                                                    });
                                                });

                                            } else {

                                                res.json({
                                                    success: false,
                                                    error_code: error_message.ERROR_CODE_REFERRAL_CODE_EXPIRED
                                                });
                                            }

                                        });
                                    }


                                }

                            });
                        } else {
                            provider.is_referral = 1;
                            provider.save().then(() => {
                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_YOU_HAVE_SKIPPED_FOR_REFERRAL_PROCESS
                                });


                            });
                        }
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_USER_DETAIL_NOT_FOUND });

                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


exports.get_provider_referal_credit = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {

                        var condition = { $match: { user_id: { $eq: Schema(req.body.provider_id) } } }
                        var referral_condition = { $match: { wallet_comment_id: { $eq: Number(constant_json.ADDED_BY_REFERRAL) } } }
                        var group = {
                            $group: {
                                _id: null,
                                total_referral_credit: { $sum: '$added_wallet' }
                            }
                        }

                        Wallet_history.aggregate([condition, referral_condition, group]).then((wallet_history_count) => {
                            if (wallet_history_count.length > 0) {
                                res.json({ success: true, total_referral_credit: wallet_history_count[0].total_referral_credit })
                            } else {
                                res.json({ success: true, total_referral_credit: 0 });
                            }
                        })
                    }

                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });

                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


//// PROVIDER REGISTER USING POST SERVICE ///////
exports.phlebotomist_register = function (req, res, next) {

    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }, { name: 'country_phone_code', type: 'string' }, { name: 'phone', type: 'string' },
    { name: 'first_name', type: 'string' }, { name: 'last_name', type: 'string' },
    { name: 'country', type: 'string' }], function (response) {
        if (response.success) {
            if (req.body.login_by == 'manual') {
                Provider.findOne({
                    email: ((req.body.email).trim()).toLowerCase(),
                    login_by: 'manual'
                }).then((provider) => {
                    if (provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED });
                    }
                    else {
                        Provider.findOne({
                            phone: req.body.phone,
                            country_phone_code: req.body.country_phone_code
                        }).then((provider) => {
                            if (provider) {
                                res.json({ success: false, error_code: error_message.ERROR_CODE_PHONE_NUMBER_ALREADY_USED });
                            }
                        }, (err) => {
                            console.log(err);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        });
                    }
                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            }
            else {
                Provider.findOne({
                    email: ((req.body.email).trim()).toLowerCase(),
                    login_by: req.body.login_by
                }).then((provider) => {
                    if (provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED_WITH_SOCIAL });
                    }
                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            }

            var query = {};
            if (req.body.city_id) {
                query['_id'] = req.body.city_id;
            } else {
                query['cityname'] = req.body.city;
            }

            City.findOne(query).then((city) => {
                console.log(city)
                var city_id = city._id;
                var city_name = city.cityname;
                var country_id = city.countryid;

                var token = utils.tokenGenerator(32);

                var gender = req.body.gender;
                if (gender != undefined) {
                    gender = ((gender).trim()).toLowerCase();
                }


                var first_name = req.body.first_name;
                first_name = first_name.charAt(0).toUpperCase() + first_name.slice(1);

                var last_name = req.body.last_name;
                last_name = last_name.charAt(0).toUpperCase() + last_name.slice(1);
                var referral_code = (utils.tokenGenerator(8)).toUpperCase();

                var provider = new Provider({
                    first_name: first_name,
                    last_name: last_name,
                    country_phone_code: req.body.country_phone_code,
                    email: ((req.body.email).trim()).toLowerCase(),
                    phone: req.body.phone,
                    gender: gender,
                    service_type: null,
                    car_model: req.body.car_model,
                    car_number: req.body.car_number,
                    device_token: req.body.device_token,
                    device_type: req.body.device_type,
                    bio: req.body.bio,
                    address: req.body.address,
                    zipcode: req.body.zipcode,
                    social_unique_id: req.body.social_unique_id,
                    login_by: req.body.login_by,
                    device_timezone: req.body.device_timezone,
                    city: city_name,
                    cityid: city_id,
                    country_id: country_id,
                    country: req.body.country,
                    wallet_currency_code: "",
                    token: token,
                    referral_code: referral_code,
                    is_available: 1,
                    is_document_uploaded: 0,
                    is_referral: 0,
                    is_partner_approved_by_admin: 1,
                    is_active: 0,
                    is_approved: 0,
                    rate: 0,
                    rate_count: 0,
                    is_trip: [],
                    received_trip_from_gender: [],
                    languages: [],
                    admintypeid: null,
                    wallet: 0,
                    bearing: 0,
                    picture: "",
                    provider_type: Number(constant_json.PROVIDER_TYPE_NORMAL),
                    provider_type_id: null,
                    providerLocation: [0, 0],
                    providerPreviousLocation: [0, 0],
                    app_version: req.body.app_version
                });


                if (req.body.login_by == "manual") {
                    var crypto = require('crypto');
                    var password = req.body.password;
                    var hash = crypto.createHash('md5').update(password).digest('hex');
                    provider.password = hash;
                    provider.social_unique_id = ""

                } else {
                    provider.password = "";
                }
                Country.findOne({ countryname: provider.country }).then((country) => {

                    if (country) {
                        var country_id = country._id;
                        var wallet_currency_code = country.currencycode;
                        provider.wallet_currency_code = wallet_currency_code;
                        utils.insert_documets_for_new_providers(provider, 1, country._id, function (document_response) {
                            provider.is_document_uploaded = document_response.is_document_uploaded;
                            provider.save().then(() => {
                                var email_notification = setting_detail.email_notification;
                                if (email_notification == true) {
                                    allemails.sendProviderRegisterEmail(req, provider, provider.first_name + " " + provider.last_name);
                                }
                                var response = {};
                                response.first_name = provider.first_name;
                                response.last_name = provider.last_name;
                                response.email = provider.email;
                                response.country_phone_code = provider.country_phone_code;
                                response.is_document_uploaded = provider.is_document_uploaded;
                                response.address = provider.address;
                                response.is_approved = provider.is_approved;
                                response._id = provider._id;
                                response.social_ids = provider.social_ids;
                                response.social_unique_id = provider.social_unique_id;
                                response.phone = provider.phone;
                                response.login_by = provider.login_by;
                                response.is_documents_expired = provider.is_documents_expired;
                                response.account_id = provider.account_id;
                                response.bank_id = provider.bank_id;
                                response.referral_code = provider.referral_code;
                                response.city = provider.city;
                                response.is_referral = provider.is_referral;
                                response.country = provider.country;
                                response.rate = provider.rate;
                                response.rate_count = provider.rate_count;
                                response.token = provider.token;
                                response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                                response.service_type = provider.service_type;
                                response.admintypeid = provider.admintypeid;
                                response.is_available = provider.is_available;
                                response.is_active = provider.is_active;
                                response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                                response.picture = provider.picture;
                                response.wallet_currency_code = provider.wallet_currency_code;
                                response.country_detail = { "is_referral": country.is_provider_referral }

                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_YOU_REGISTERED_SUCCESSFULLY,
                                    provider_detail: response,
                                    phone_number_min_length: country.phone_number_min_length,
                                    phone_number_length: country.phone_number_length

                                });
                            }, (err) => {
                                console.log(err);
                                res.json({
                                    success: false,
                                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                });
                            });

                        });
                    }

                });

            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};





/*** 
 * Get Phlebotomist Login Url 
 * This method return hard code URL for login 
 * Crated By: Ripal Patel
 * Created Date: 3-May-2021
 * ***/
 const http = require('http');
 const https = require('https');
 var config = require('../../config/config');
 exports.get_phlebotomist_loginurl = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }], function (response) {
        if (response.success) {
            //var doman_url='https://myonsitehealthcare.auth.us-east-2.amazoncognito.com/oauth2/authorize?client_id=4qi1prvf41n2eugvnu0pos16uf&identity_provider=Google&response_type=code&scope=openid+email+profile';

            var UserType = req.body.UserType;
            var email = req.body.email;
            if (UserType != undefined && UserType == USER_TYPE_PATIENT_APP) {
                //this part of patient app login add this on 21-1-2022
                var domain_apiurl = config.apiurl;
                var auth_headerkey = config.AuthHeaderKey.toString();
                var auth_headervalue = config.AuthHeaderValue.toString();
                var apipath = config.PathPrefix+'/Phlebotomist/GetPhlebotomistloginurl';

                var data = JSON.stringify({
                    email: email,
                    UserType: UserType
                })

                var options = {
                    hostname: config.apiurl,
                // port: 443,
                    path: apipath,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': data.length,
                        'X-IndralokWebAPIKey': config.AuthHeaderValue
                    // auth_headerkey : auth_headervalue
                    }
                }

                var postreq = https.request(options, postreq => {
                    console.log(`statusCode: ${res.statusCode}`)

                    postreq.on('data', resdata => {
                        var domaindata = JSON.parse(resdata);
                        console.log('domaindata response 5242----')
                        console.log(domaindata)
                        if(domaindata.success == true){

                            // User.findOne({ email: email }).then((userData) => {
                            //     if(userData){

                            //     }else{

                            //     }
                            // })
                            res.json({
                                success: true,
                                user_domain: domaindata
                            });
                        }else{
                            var resultobj = error_message.ERROR_CODE_API_RETURN_FALSE;
                                resultobj.message = domaindata.message;
                            res.json({
                                success: false,
                                error_code: resultobj
                            });
                        }

                    })
                })

                postreq.on('error', error => {
                    console.log(error);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                })

                postreq.write(data)
                postreq.end();
            }else{
               
                //this part of phlebotomist app login
                Provider.findOne({ email: email }).then((provider) => {

                    

                    if (!provider) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                    } else if (provider) {
                        console.log(provider._id);
                        var response = {};
                        if(provider.is_approved==1){
                            //Insert andupdate phlebotomist in lis  with api call
                            var req_para={};
                            req_para={
                                providerid:provider._id,
                                loginusername:provider.email,
                                isVerified: true,
                                tempupdate:"yes"
                            }
                            exports.insert_update_phlebotomist(req_para);
                        }
                        var domain_apiurl = config.apiurl;
                        var auth_headerkey = config.AuthHeaderKey.toString();
                        var auth_headervalue = config.AuthHeaderValue.toString();
                        var apipath = config.PathPrefix+'/Phlebotomist/GetPhlebotomistloginurl';

                        var data = JSON.stringify({
                            email: email
                        })

                        var options = {
                            hostname: config.apiurl,
                        // port: 443,
                            path: apipath,
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Content-Length': data.length,
                                'X-IndralokWebAPIKey': config.AuthHeaderValue
                            // auth_headerkey : auth_headervalue
                            }
                        }

                        var postreq = https.request(options, postreq => {
                            console.log(`statusCode: ${res.statusCode}`)

                            postreq.on('data', resdata => {
                                var domaindata = JSON.parse(resdata);
                                res.json({
                                    success: true,
                                    user_domain: domaindata
                                });

                            })
                        })

                        postreq.on('error', error => {
                            console.log(error);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        })

                        postreq.write(data)
                        postreq.end();

                    }

                }, (err) => {
                    console.log(err);
                    res.json({
                        success: false,
                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                    });
                });
            }

        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
  };





/*** 
 * Get User Detials
 * Crated By: Ripal Patel
 * Created Date: 16-Apr-2021
 * Modified on 11/12-may for auth impli..
 * ***/
exports.get_userdetail = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'email', type: 'string' },{ name: 'device_token', type: 'string' }], function (response) {
        if (response.success) {

            var email = req.body.email;
            Provider.findOne({ email: email }).then((provider) => {

                if (!provider) {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                } else if (provider) {
                    //update User FCM token in mongoDB
                    provider.device_token=req.body.device_token;
                    provider.save();

                    var apipath = config.PathPrefix+'/Phlebotomist/ValidatePhlebotomist';
                    var data = JSON.stringify({
                        email: email
                    })
                    var options = {
                        hostname: config.apiurl,
                       // port: 80,
                        path: apipath,
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Content-Length': data.length,
                            'X-IndralokWebAPIKey': config.AuthHeaderValue
                        }
                    }

                    utils.httpRequest(options, data).then(response => {
                        console.log(response);
                        var data= JSON.parse(response);

                        if (data.isValidPhleb) {
                            var response = {};
                            response.first_name = provider.first_name;
                            response.last_name = provider.last_name;
                            response.email = provider.email;
                            response.country_phone_code = provider.country_phone_code;
                            response.is_document_uploaded = provider.is_document_uploaded;
                            response.address = provider.address;
                            response.is_approved = provider.is_approved;
                            response._id = provider._id;
                            response.social_ids = provider.social_ids;
                            response.social_unique_id = provider.social_unique_id;
                            response.phone = provider.phone;
                            response.login_by = provider.login_by;
                            response.is_documents_expired = provider.is_documents_expired;
                            response.account_id = provider.account_id;
                            response.bank_id = provider.bank_id;
                            response.is_referral = provider.is_referral;
                            response.referral_code = provider.referral_code;
                            response.city = provider.city;
                            response.country = provider.country;
                            response.rate = provider.rate;
                            response.rate_count = provider.rate_count;
                            response.token = provider.token;
                            response.is_vehicle_document_uploaded = provider.is_vehicle_document_uploaded;
                            response.service_type = provider.service_type;
                            response.admintypeid = provider.admintypeid;
                            response.is_available = provider.is_available;
                            response.is_active = provider.is_active;
                            response.is_partner_approved_by_admin = provider.is_partner_approved_by_admin;
                            response.picture = provider.picture;
                            response.wallet_currency_code = provider.wallet_currency_code;
                            response.zipcode = provider.zipcode;
                            response.domain_name = provider.domain_name;
                            response.token=data.token;
                            
                            //send employeeID autogenerated in LIS 
                            response.employee_id="";
                            if(provider.UserID){
                                response.employee_id=provider.UserID;
                            }

                            //send ssn number 
                            response.ssn_no = ""
                            if(provider.ssn_no){
                                response.ssn_no = data.ssn_no
                            }
                            //send body_temprature 
                            response.body_temprature = ""
                            if(data.body_temprature){
                                response.body_temprature = data.body_temprature
                            }
                            //Save provider token
                            provider.token=data.token;
                            provider.save();

                            Country.findOne({ countryphonecode: provider.country_phone_code }).then((country) => {
                                if (country) {
                                    response.country_detail = { "is_referral": country.is_provider_referral }
                                } else {
                                    response.country_detail = { "is_referral": false }
                                }

                                if (provider.is_trip.length > 0) {
                                    Trip.findOne({ _id: provider.is_trip[0] }).then((trip_detail) => {
                                        if (trip_detail) {
                                            var start_time = trip_detail.updated_at;
                                            var end_time = new Date();
                                            var res_sec = utils.getTimeDifferenceInSecond(end_time, start_time);
                                            var provider_timeout = setting_detail.provider_timeout;
                                            var time_left_to_responds_trip = provider_timeout - res_sec;
                                            User.findOne({ _id: trip_detail.user_id }, function (error, user_detail) {
                                                var trip_details = {
                                                    trip_id: provider.is_trip[0],
                                                    user_id: trip_detail.user_id,
                                                    is_provider_accepted: trip_detail.is_provider_accepted,
                                                    is_provider_status: trip_detail.is_provider_status,
                                                    trip_type: trip_detail.trip_type,
                                                    source_address: trip_detail.source_address,
                                                    destination_address: trip_detail.destination_address,
                                                    sourceLocation: trip_detail.sourceLocation,
                                                    destinationLocation: trip_detail.destinationLocation,
                                                    is_trip_end: trip_detail.is_trip_end,
                                                    time_left_to_responds_trip: time_left_to_responds_trip,
                                                    user: {
                                                        first_name: user_detail.first_name,
                                                        last_name: user_detail.last_name,
                                                        phone: user_detail.phone,
                                                        country_phone_code: user_detail.country_phone_code,
                                                        rate: user_detail.rate,
                                                        rate_count: user_detail.rate_count,
                                                        picture: user_detail.picture
                                                    }
                                                }
                                                res.json({
                                                    success: true, provider_detail: response, trip_detail: trip_details,
                                                    phone_number_min_length: country.phone_number_min_length,
                                                    phone_number_length: country.phone_number_length
                                                });
                                            });
                                        } else {
                                            res.json({
                                                success: true, provider_detail: response,
                                                phone_number_min_length: country.phone_number_min_length,
                                                phone_number_length: country.phone_number_length
                                            });
                                        }
                                    });
                                } else {
                                    res.json({
                                        success: true, provider_detail: response,
                                        phone_number_min_length: country.phone_number_min_length,
                                        phone_number_length: country.phone_number_length
                                    });
                                }
                            });
                        }
                        else {
                            res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_A_REGISTERED_PROVIDER });
                        }
                    }).catch((err) => {
                        console.log(err);
                        res.json({
                            success: false,
                            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                        });
                    });
                }
            }, (err) => {
                console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });

        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};


/*** 
 * test Notification
 * Crated By: Ripal Patel
 * Created Date: 13-5-2021
 * method is created to test the ios and android notification
 * ***/
 exports.notification_test = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'email', type: 'string' }, { name: 'device_token', type: 'string' }], function (response) {
        if (response.success) {

            var email = req.body.email;
            var dtoken = req.body.device_token;
            //send notification
             

             utils.sendPushNotification('11', 'android', dtoken, push_messages.PUSH_CODE_FOR_PROVIDER_LOGIN_IN_OTHER_DEVICE, 'default');
            res.json({
                success: true,
                message: "Notification send"
            });

        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

/*** 
 * Update provider details
 * Crated By: Mayursinh Zala
 * Created Date: 25-10-2021
 * method is created to update details for providers 
 * ***/


//provider_update_details
exports.provider_update_details = function (req, res) {

    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' },{ name: 'ssn_no', type: 'string' },{ name: 'body_temperature', type: 'string' }], function (response) {
        if (response.success) {
            Provider.findOne({ _id: req.body.provider_id }).then((provider) => {
                if (provider) {
                    if (req.body.token != null && provider.token != req.body.token) {
                        res.json({ success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN });
                    } else {
                        if(req.body.ssn_no){
                            if(req.body.ssn_no!=""){
                                provider.ssn_no = req.body.ssn_no;
                            }

                            var apipath = config.PathPrefix+'/Phlebotomist/SavePhlebotomistSsn';
                            
                            var data = JSON.stringify({
                                UserID: provider.email.split("@")[0], 
                                UserEmail: provider.email,
                                email: provider.email,
                                ssn: provider.ssn_no
                            })
                    
                            var options = {
                                hostname: config.apiurl,
                                path: apipath,
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Content-Length': data.length,
                                    'X-IndralokWebAPIKey': config.AuthHeaderValue
                                }
                            }
                        
                            utils.httpRequest(options, data).then(response => {
                                console.log(" response  for Phlebotomist/SavePhlebotomistSsn ",response);
                                var data= JSON.parse(response);
                                // provider.userSysID=data;
                                // provider.save();
                        
                            }).catch((err) => {
                                console.log(err);
                            });

                        }
 
                        if(req.body.body_temperature){
                            if(req.body.body_temperature!=""){
                                provider.body_temperature = req.body.body_temperature;
                            }
                        }
                        provider.save().then(() => {
                            res.json({
                                success: true, languages: provider.languages,
                                body_temperature: provider.body_temperature,
                                ssn_no: provider.ssn_no
                            })
                        }, (err) => {
                            console.log(err);
                            res.json({
                                success: false,
                                error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                            });
                        });
                    }

                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_NOT_GET_YOUR_DETAIL });

                }
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
}

/*** 
 * Temperary API for IOS APP only
 * Created By: Monika Patel
 * Created Date: 21-02-2022
 * ***/
 exports.apple_review = function (req, res) {

    res.json({
        success: true,
        Reviewstatus: 0 //commented this line after ios approved by APP store
        // Reviewstatus: 1 //uncommented this line after ios approved by APP store
    })
}

/*** 
 * Function for get new(pending), schedule and completed trip count
 * Created By: Monika Patel
 * Created Date: 1-03-2022
 * ***/
 async function getTripCount(providerId, countType) {
    try{    
            var todaydate = new Date();
            todaydate.setUTCHours(0,0,0,0);
            todaydate.toISOString()

            var todayenddate = new Date();
            todayenddate.setUTCHours(23, 59, 59, 999);
            todayenddate.toISOString()

            var condition = { 
                'is_trip_cancelled' : {$eq: 0}
              }
            if(countType == 'schedule'){
                condition.current_provider = providerId
                condition.is_trip_cancelled_by_provider = 0
                condition.is_trip_cancelled_by_user = 0
                condition.is_schedule_trip = true
                condition.status = { $gte: 4 }
                condition.is_provider_status = { $lt: 9 }
                condition.schedule_start_time = { $gte: todaydate }
            }else if(countType == 'completed'){
                condition.current_provider = providerId
                condition.is_trip_cancelled_by_provider = 0
                condition.is_trip_cancelled_by_user = 0
                condition.is_schedule_trip = true
                condition.is_provider_status = { $gte: 9 }
                condition.schedule_start_time = { $lte: todayenddate }
            }else{
                var tripstatus=[2,3];

                condition.provider_id = providerId
                condition.is_provider_invoice_show = { $eq: 0 }
                condition.is_trip_completed = {$eq : 0}
                condition.status = { $in: tripstatus }
            }
           
        var totoalNewTripCount = 0;
        await Trip.countDocuments(condition)
             .then(async (newtripcount) => {
               totoalNewTripCount = newtripcount
               return parseInt(totoalNewTripCount)
           });
           return parseInt(totoalNewTripCount);
       }
       catch (err) {
           return parseInt(0);
       }
}

/*** 
 * API for sync provider/phlebotomist from LIS
 * Created By: Monika Patel
 * Created Date: 14-03-2022
 * ***/
 exports.provider_sync = function (req, res, next) {

    var page = req.body.page;
    if(page == undefined || page == 0){
        page == 1
    }
    var apipath = config.PathPrefix+'/Requisition/GetAllPhlebDeatils';
    var data = JSON.stringify({
        page: page,
        OwnerID: "HCS"
    })
    var options = {
        hostname: config.apiurl,
        // port: 80,
        path: apipath,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'X-IndralokWebAPIKey': config.AuthHeaderValue
        }
    }
    console.log(data)
    utils.httpRequest(options, data).then(response => {
        console.log('response------6512--------------------------------------------Phlebotomist/GetAllPhlebDeatils')
        // console.log(response)
        var data= JSON.parse(response);
        console.log('*******************'+ data.length)
        var updatedData = []
        var insertedData =[]
        if(data.length > 0){
            for(i=0; i < data.length; i++){
                var providerDetail = data[i]
                console.log(i + '-------6637------- '+providerDetail.City+'--------email-------'+providerDetail.UserEmail)
                Provider.findOne({"userSysID": providerDetail.SysID}).then((existProvider)=>{
                    if(existProvider){
                        updatedData.push({'email': providerDetail.UserEmail, 'userSysID': providerDetail.SysID})
                    }else{
                        console.log(i + 'providerDetail -------6641------- '+providerDetail.City)
                        if(providerDetail.City != null ){
                            console.log('-------if-----'+i)
                            City.findOne({"cityname": providerDetail.City }).then((cityData) => {
                                var city_name = providerDetail.City
                                var city_id = ''
                                var country_id = ''
                                var country = ''
                                if(cityData){
                                    city_id = cityData._id
                                    country_id = cityData.countryid
                                    country = cityData.countryname
                                }
                                var provider_location = []
                                provider_location.push(providerDetail.Latitude)
                                provider_location.push(providerDetail.Longitude)
                                // var provider = new Provider({
                                //     first_name: ((providerDetail.Name).trim()).toLowerCase(),
                                //     last_name: '',
                                //     country_phone_code: "",
                                //     email: ((providerDetail.UserEmail).trim()).toLowerCase(),
                                //     phone: providerDetail.Phone,
                                //     gender: "",
                                //     service_type: null,
                                //     car_model: "",
                                //     car_number: "",
                                //     device_token: "",
                                //     device_type: "",
                                //     bio: "",
                                //     address: req.body.address,
                                //     zipcode: providerDetail.Zip,
                                //     social_unique_id: "",
                                //     login_by: "",
                                //     device_timezone: "",
                                //     city: city_name,
                                //     cityid: city_id,
                                //     country_id: country_id,
                                //     country: country,
                                //     wallet_currency_code: "",
                                //     token: "",
                                //     referral_code: '',
                                //     is_available: 0,
                                //     is_document_uploaded: 0,
                                //     is_referral: 0,
                                //     is_partner_approved_by_admin: 0,
                                //     is_active: 0,
                                //     is_approved: 0,
                                //     rate: 0,
                                //     rate_count: 0,
                                //     is_trip: [],
                                //     received_trip_from_gender: [],
                                //     languages: [],
                                //     admintypeid: null,
                                //     wallet: 0,
                                //     bearing: 0,
                                //     picture: "",
                                //     provider_type: Number(constant_json.PROVIDER_TYPE_NORMAL),
                                //     provider_type_id: null,
                                //     providerLocation: provider_location,
                                //     providerPreviousLocation: [0, 0],
                                //     app_version: ""
            
                                // });
                                // provider.save()
                            })
                        }else{
                            console.log('-------else-----'+i)
                            var provider_location = []
                                provider_location.push(providerDetail.Latitude)
                                provider_location.push(providerDetail.Longitude)
                                // var provider = new Provider({
                                //     first_name: ((providerDetail.Name).trim()).toLowerCase(),
                                //     last_name: '',
                                //     country_phone_code: "",
                                //     email: ((providerDetail.UserEmail).trim()).toLowerCase(),
                                //     phone: providerDetail.Phone,
                                //     gender: "",
                                //     service_type: null,
                                //     car_model: "",
                                //     car_number: "",
                                //     device_token: "",
                                //     device_type: "",
                                //     bio: "",
                                //     address: req.body.address,
                                //     zipcode: providerDetail.Zip,
                                //     social_unique_id: "",
                                //     login_by: "",
                                //     device_timezone: "",
                                //     city: '',
                                //     cityid: '',
                                //     country_id: '',
                                //     country: '',
                                //     wallet_currency_code: "",
                                //     token: "",
                                //     referral_code: '',
                                //     is_available: 0,
                                //     is_document_uploaded: 0,
                                //     is_referral: 0,
                                //     is_partner_approved_by_admin: 0,
                                //     is_active: 0,
                                //     is_approved: 0,
                                //     rate: 0,
                                //     rate_count: 0,
                                //     is_trip: [],
                                //     received_trip_from_gender: [],
                                //     languages: [],
                                //     admintypeid: null,
                                //     wallet: 0,
                                //     bearing: 0,
                                //     picture: "",
                                //     provider_type: Number(constant_json.PROVIDER_TYPE_NORMAL),
                                //     provider_type_id: null,
                                //     providerLocation: provider_location,
                                //     providerPreviousLocation: [0, 0],
                                //     app_version: ""
            
                                // });
                                // provider.save()
                        }
                    }

                })
            }
        }
        res.json({
            success: true,
            updatedData: updatedData,
            insertedData: insertedData,
            data: data
        });
        
    }).catch((err) => {
        res.json({
            success: false,
            error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
        });
    });

};