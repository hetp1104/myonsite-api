var utils = require('../controllers/utils');
require('../controllers/constant');
var allemails = require('../controllers/emails');
var Providers = require('mongoose').model('Provider');
var Provider = require('mongoose').model('Provider');
var Trip = require('mongoose').model('Trip');
var TripOrder = require('mongoose').model('trip_order');
var User = require('mongoose').model('User');
var TripLocation = require('mongoose').model('trip_location');
var Document = require('mongoose').model('Document');
var Provider_Document = require('mongoose').model('Provider_Document');
var Country = require('mongoose').model('Country');
var moment = require('moment-timezone');
var City = require('mongoose').model('City');
var Type = require('mongoose').model('Type');
var Settings = require('mongoose').model('Settings');
const { MongoClient } = require('mongodb');
var nodemailer = require('nodemailer');
var console = require('../controllers/console');
var Citytype = require('mongoose').model('city_type');
var mongoose = require('mongoose');
const XLSX = require('xlsx');
const ExcelJS = require('exceljs');
var City_type = require('mongoose').model('city_type');
var Provider_Vehicle_Document = require('mongoose').model('Provider_Vehicle_Document');
var myProviders = require('./provider');
express = require('express');
var app = express();
var excelbuilder = require('msexcel-builder');
var fs = require("fs");
const path = require('path');
var console = require('../controllers/console');
var Expense = require('mongoose').model('Expense');
var UserRating = require('../models/userratings'); // Import the UserRating model
let setting_detail = {};

//UPDATED BY RAJ SAHOO
function initializeSettings() {
    Settings.findOne({})
        .then(settings => {
            if (settings) {
                setting_detail = settings;
            } else {
                console.error("No settings found in database");
            }
        })
        .catch(err => {
            console.error("Error loading settings:", err);
        });
}

initializeSettings();

exports.referral_report = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;
        filter_start_date = '';
        filter_end_date = '';

        if (end_date == '' || end_date == undefined) {
            end_date = new Date();
        } else {
            filter_end_date = end_date;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
        }
        if (start_date == '' || start_date == undefined) {
            start_date = new Date(0);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
        } else {
            filter_start_date = start_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
        }

        var query1 = {};
        query1['referred_user_detail.created_at'] = {$gte: start_date, $lt: end_date};
        var filter = {"$match": query1};

        var lookup = {
            $lookup:
            {
                from: "providers",
                localField: "referred_by",
                foreignField: "_id",
                as: "referred_user_detail"
            }
        };

        var unwind = {$unwind: "$referred_user_detail"}

        var group = {
            $group: {
                _id: '$referred_user_detail._id',
                referred_user_count: {$sum: {$cond: [{$and: [{$gte: ["$referred_user_detail.created_at",start_date]}, {$lt: ["$referred_user_detail.created_at", end_date]}]}, 1, 0]}},
                unique_id: {$first: '$referred_user_detail.unique_id'},
                first_name: {$first: '$referred_user_detail.first_name'},
                last_name: {$first: '$referred_user_detail.last_name'},
                email: {$first: '$referred_user_detail.email'},
                phone: {$first: '$referred_user_detail.phone'}
            }
        }

        Provider.aggregate([lookup, unwind, group], function(error, provider_list){
            if(error){
                console.log(error)
                res.render('provider_referral_report', { provider_list: [] });
            } else {
               
                var new_provider_list = provider_list.filter(function(user){
                    return user.referred_user_count > 0
                })
                setTimeout(function(){
                    res.render('provider_referral_report', { provider_list: new_provider_list, provider_id: req.body.provider_id, moment: moment, timezone_for_display_date: setting_detail.timezone_for_display_date });
                },100)
            }
        });
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO

exports.referral_history = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;
        
        if (end_date == '' || end_date == undefined) {
            end_date = new Date();
        } else {
            filter_end_date = end_date;
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
        }
        if (start_date == '' || start_date == undefined) {
            start_date = new Date(0);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
        } else {
            filter_start_date = start_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
        }

        var condition = {$match: {referred_by: new mongoose.Types.ObjectId(req.body.provider_id)}};
        var query1 = {};
        query1['created_at'] = {$gte: start_date, $lt: end_date};
        var filter = {"$match": query1};
        console.log(condition);
        
        // Use Promise-based approach instead of callback
        Provider.aggregate([condition, filter])
            .then((provider_list) => {
                res.render('provider_referral_history', { 
                    provider_list: provider_list, 
                    provider_id: req.body.provider_id, 
                    moment: moment, 
                    timezone_for_display_date: setting_detail.timezone_for_display_date 
                });
            })
            .catch((error) => {
                console.error("Error in referral_history:", error);
                res.render('provider_referral_history', { provider_list: [] });
            });
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO

exports.list = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {

        var query = {};
        var sort = {};
        array = [];
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        if (req.body.provider_page_type == undefined) {
            provider_page_type = req.path.split('/')[1];
            sort['_id'] = -1;

            search_item = 'first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'Id';
            filter_start_date = '';
            filter_end_date = '';

            var start_date = '';
            var end_state = '';
        } else {
            provider_page_type = req.body.provider_page_type;

            var field = req.body.sort_item[0];
            var order = req.body.sort_item[1];
            var item = req.body.search_item;
            var value = req.body.search_value;
            
            
            if (field && order) {
                sort[field] = parseInt(order);
            } else {
                // Default sort
                sort['_id'] = -1;
            }

            sort_order = req.body.sort_item[1];
            sort_field = req.body.sort_item[0];
            search_item = item
            search_value = value;
            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;

            var start_date = req.body.start_date;
            var end_state = req.body.end_date;
        }
        if (start_date != '' || end_state != '') {
            if (start_date == '') {
                start_date = new Date(end_state);
                start_date = start_date - 1;
                end_date = new Date(end_state);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            } else if (end_state == '') {
                end_date = new Date(start_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                start_date = new Date(start_date);
                start_date = start_date - 1;
                query['created_at'] = {$gte: start_date, $lt: end_date};
            } else {
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_state);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            }
        }

        if (provider_page_type == 'online_providers') {
            query['is_active'] = 1;
            query['is_approved'] = 1;
        } else if (provider_page_type == 'approved_providers') {
            query['is_approved'] = 1;
        } else if (provider_page_type == 'pending_for_approvel') {
            query['is_approved'] = 0;
        }

        if (item == 'first_name') {
            value = value.replace(/^\s+|\s+$/g, '');
            value = value.replace(/ +(?= )/g, '');

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {

                query1[item] = new RegExp(value, 'i');
                query2['last_name'] = new RegExp(value, 'i');
                query3[''] = '';
                query4[''] = '';
                query5[''] = '';
                query6[''] = '';
            } else {
                query1[item] = new RegExp(value, 'i');
                query2['last_name'] = new RegExp(value, 'i');
                query3[item] = new RegExp(full_name[0], 'i');
                query4['last_name'] = new RegExp(full_name[0], 'i');
                query5[item] = new RegExp(full_name[1], 'i');
                query6['last_name'] = new RegExp(full_name[1], 'i');
            }
        } else if (item == 'unique_id')
        {
            if (value !== "")
            {
                value = Number(value);
                query[item] = value
            }
        } else {
            if (item != undefined) {
                query[item] = new RegExp(value, 'i');
            }
        }
        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
            }
        }

        const combinedQuery = {$and: [{$or: [query1, query2, query3, query4, query5, query6]}, query]};
        
        Providers.countDocuments(combinedQuery)
    .then((provider_count) => { 
        if (provider_count == 0) {
            var is_public_demo = setting_detail.is_public_demo;
            var timezone_for_display_date = setting_detail.timezone_for_display_date || 'UTC';
            
            if (provider_page_type == "pending_for_approvel") {
                res.render('pending_for_approval_provider_list', {
                    is_public_demo: is_public_demo, 
                    moment: moment, 
                    timezone_for_display_date: timezone_for_display_date,
                    detail: [], 
                    provider_page_type: provider_page_type, 
                    currentpage: '', 
                    pages: '',
                    next: '', 
                    pre: '',
                    search_item: search_item,
                    search_value: search_value,
                    sort_order: sort_order,
                    sort_field: sort_field,
                    filter_start_date: filter_start_date,
                    filter_end_date: filter_end_date
                });
            } else {
                res.render('providers_list', {
                    is_public_demo: is_public_demo, 
                    moment: moment, 
                    timezone_for_display_date: timezone_for_display_date,
                    detail: [], 
                    provider_page_type: provider_page_type, 
                    currentpage: '', 
                    pages: '',
                    next: '', 
                    pre: '',
                    search_item: search_item,
                    search_value: search_value,
                    sort_order: sort_order,
                    sort_field: sort_field,
                    filter_start_date: filter_start_date,
                    filter_end_date: filter_end_date
                });
            }
            return;
        }
        
        // Calculate number of pages
        var pages = Math.ceil(provider_count / number_of_rec);
        
        // Set up pagination
        let page, next, pre;
        
        if (req.body.page == undefined) {
            page = 1;
            next = parseInt(page) + 1;
            pre = page - 1;
        } else {
            page = parseInt(req.body.page);
            next = parseInt(req.body.page) + 1;
            pre = parseInt(req.body.page) - 1;
        }
        
        // Calculate skip value
        const skip = (page - 1) * number_of_rec;
        
        // Now perform the paginated query
        Providers.find(combinedQuery)
            .sort(sort)
            .skip(skip)
            .limit(number_of_rec)
            .then((providers) => { 
                var is_public_demo = setting_detail.is_public_demo;
                var timezone_for_display_date = setting_detail.timezone_for_display_date || 'UTC';

                if (provider_page_type == "pending_for_approvel") {
                    res.render('pending_for_approval_provider_list', {
                        is_public_demo: is_public_demo, 
                        timezone_for_display_date: timezone_for_display_date, 
                        moment: moment,
                        detail: providers, 
                        currentpage: page, 
                        provider_page_type: provider_page_type, 
                        pages: pages,
                        next: next, 
                        pre: pre,
                        search_item: search_item,
                        search_value: search_value,
                        sort_order: sort_order,
                        sort_field: sort_field,
                        filter_start_date: filter_start_date,
                        filter_end_date: filter_end_date
                    });
                } else {
                    res.render('providers_list', {
                        is_public_demo: is_public_demo, 
                        timezone_for_display_date: timezone_for_display_date, 
                        moment: moment,
                        detail: providers, 
                        currentpage: page, 
                        provider_page_type: provider_page_type, 
                        pages: pages,
                        next: next, 
                        pre: pre,
                        search_item: search_item,
                        search_value: search_value,
                        sort_order: sort_order,
                        sort_field: sort_field,
                        filter_start_date: filter_start_date,
                        filter_end_date: filter_end_date
                    });
                }
            }).catch(error => {
                console.error("Error retrieving providers:", error);
                res.status(500).send("Internal Server Error");
            });
    }).catch(error => {
        console.error("Error counting providers:", error);
        res.status(500).send("Internal Server Error");
    });
    } else {
        res.redirect('/admin');
    }
}

//UPDATED BY RAJ SAHOO
exports.generate_provider_excel = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var query = {};
        var sort = {};
        array = [];
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};

        provider_page_type = req.body.provider_page_type;

        var field = req.body.sort_item[0];
        var order = req.body.sort_item[1];
        var item = req.body.search_item;
        var value = req.body.search_value;

        sort_order = req.body.sort_item[1];
        sort_field = req.body.sort_item[0];
        search_item = item
        search_value = value;
        filter_start_date = req.body.start_date;
        filter_end_date = req.body.end_date;

        var start_date = req.body.start_date;
        var end_state = req.body.end_date;

        if (start_date != '' || end_state != '') {
            if (start_date == '') {
                start_date = new Date(end_state);
                start_date = start_date - 1;
                end_date = new Date(end_state);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            } else if (end_state == '') {
                end_date = new Date(start_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                start_date = new Date(start_date);
                start_date = start_date - 1;
                query['created_at'] = {$gte: start_date, $lt: end_date};
            } else {
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_state);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            }
        }

        if (provider_page_type == 'online_providers') {
            query['is_active'] = 1;
            query['is_approved'] = 1;
        } else if (provider_page_type == 'approved_providers') {
            query['is_approved'] = 1;
        } else if (provider_page_type == 'pending_for_approvel') {
            query['is_approved'] = 0;
        }

        if (item == 'first_name') {
            value = value.replace(/^\s+|\s+$/g, '');
            value = value.replace(/ +(?= )/g, '');

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {
                query1[item] = new RegExp(value, 'i');
                query2['last_name'] = new RegExp(value, 'i');
                query3[''] = '';
                query4[''] = '';
                query5[''] = '';
                query6[''] = '';
            } else {
                query1[item] = new RegExp(value, 'i');
                query2['last_name'] = new RegExp(value, 'i');
                query3[item] = new RegExp(full_name[0], 'i');
                query4['last_name'] = new RegExp(full_name[0], 'i');
                query5[item] = new RegExp(full_name[1], 'i');
                query6['last_name'] = new RegExp(full_name[1], 'i');
            }
        } else if (item == 'unique_id') {
            if (value !== "") {
                value = Number(value);
                query[item] = value;
            }
        } else {
            if (item != undefined) {
                query[item] = new RegExp(value, 'i');
            }
        }

        // Proper sort object creation
        if (field && order) {
            sort[field] = parseInt(order);
        } else {
            // Default sort
            sort['_id'] = -1;
        }

        // Combine query properly
        const combinedQuery = {$and: [{$or: [query1, query2, query3, query4, query5, query6]}, query]};

        // Execute find with the combined query and sort options
        Providers.find(combinedQuery).sort(sort).then((providers) => { 
            var is_public_demo = setting_detail.is_public_demo;
            var timezone_for_display_date = setting_detail.timezone_for_display_date;

            // Count providers that need processing
            let totalProviders = providers.length;
            let processedCount = 0;
            
            // Handle empty result
            if (totalProviders === 0) {
                return generate_excel(req, res, providers, timezone_for_display_date);
            }

            providers.forEach(function (data) {
                if (data.service_type == null) {
                    data.service_type_name = "Unknown";
                    processedCount++;
                    
                    if (processedCount === totalProviders) {
                        generate_excel(req, res, providers, timezone_for_display_date);
                    }
                } else {
                    Citytype.findOne({_id: data.service_type})
                        .then((city_type_data) => {
                            if (!city_type_data) {
                                // Handle null city_type_data
                                data.service_type_name = "Unknown Service";
                                processedCount++;
                                
                                if (processedCount === totalProviders) {
                                    generate_excel(req, res, providers, timezone_for_display_date);
                                }
                            } else {
                                Type.findOne({_id: city_type_data.typeid})
                                    .then((type_data) => {
                                        if (type_data) {
                                            data.service_type_name = type_data.typename;
                                        } else {
                                            data.service_type_name = "Unknown Type";
                                        }
                                        
                                        processedCount++;
                                        
                                        if (processedCount === totalProviders) {
                                            generate_excel(req, res, providers, timezone_for_display_date);
                                        }
                                    })
                                    .catch((error) => {
                                        console.error("Error finding type:", error);
                                        data.service_type_name = "Error";
                                        processedCount++;
                                        
                                        if (processedCount === totalProviders) {
                                            generate_excel(req, res, providers, timezone_for_display_date);
                                        }
                                    });
                            }
                        })
                        .catch((error) => {
                            console.error("Error finding city type:", error);
                            data.service_type_name = "Error";
                            processedCount++;
                            
                            if (processedCount === totalProviders) {
                                generate_excel(req, res, providers, timezone_for_display_date);
                            }
                        });
                }
            });
        }).catch(error => {
            console.error("Error in provider listing:", error);
            res.status(500).send("Internal Server Error");
        });
    } else {
        res.redirect('/admin');
    }
}

//UPDATED BY RAJ SAHOO
function generate_excel(req, res, array, timezone) {
    try {
        console.log("Starting Excel generation with ExcelJS...");
        // Create data/xlsheet directory if it doesn't exist
        var dir = './data/xlsheet';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        var date = new Date();
        var time = date.getTime();
        var filename = time + '_provider.xlsx';
        var filepath = 'D:/admin_panel2/myonsite_api-4/data/xlsheet/' + filename;
        
        // Initialize ExcelJS
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Providers');
        
        // Add headers
        sheet.columns = [
            { header: config_json.title_id, key: 'id', width: 15 },
            { header: config_json.title_name, key: 'name', width: 20 },
            { header: config_json.title_email, key: 'email', width: 25 },
            { header: config_json.title_phone, key: 'phone', width: 15 },
            { header: config_json.title_total_request, key: 'total_request', width: 15 },
            { header: config_json.title_completed_request, key: 'completed_request', width: 15 },
            { header: config_json.title_cancelled_request, key: 'cancelled_request', width: 15 },
            { header: config_json.title_accepted_request, key: 'accepted_request', width: 15 },
            { header: config_json.title_city, key: 'city', width: 15 },
            { header: config_json.title_car, key: 'car', width: 15 },
            { header: config_json.title_app_version, key: 'app_version', width: 15 },
            { header: config_json.title_registered_date, key: 'registered_date', width: 20 }
        ];
        
        // Style the header row
        sheet.getRow(1).font = { bold: true };
        sheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        
        // If no data, create empty file
        if (!array || array.length === 0) {
            console.log("No data provided, creating empty Excel file");
            return workbook.xlsx.writeFile(filepath)
                .then(() => {
                    var url = req.protocol + '://' + req.get('host') + "/xlsheet/" + filename;
                    console.log("Empty Excel file created:", url);
                    res.json(url);
                    
                    setTimeout(() => {
                        fs.unlink(filepath, err => {
                            if (err) console.error("Error deleting temp file:", err);
                        });
                    }, 60000);
                })
                .catch(err => {
                    console.error("Error saving empty workbook:", err);
                    res.status(500).json({ error: "Failed to create Excel file" });
                });
        }
        
        console.log(`Adding ${array.length} rows to Excel`);
        
        // Add data rows
        array.forEach(data => {
            try {
                // Format date
                let formattedDate = '';
                if (data.created_at) {
                    formattedDate = moment(data.created_at).tz(timezone || 'UTC')
                        .format("DD MMM 'YY") + ' ' + moment(data.created_at).tz(timezone || 'UTC').format("hh:mm a");
                }
                
                // Add row with safety checks
                sheet.addRow({
                    id: data.employee_id || data.unique_id || '',
                    name: (data.first_name || '') + ' ' + (data.last_name || ''),
                    email: data.email || '',
                    phone: (data.country_phone_code || '') + (data.phone || ''),
                    total_request: data.total_request || 0,
                    completed_request: data.completed_request || 0,
                    cancelled_request: data.cancelled_request || 0,
                    accepted_request: data.accepted_request || 0,
                    city: data.city || '',
                    car: data.service_type_name || '',
                    app_version: (data.device_type || '') + '-' + (data.app_version || ''),
                    registered_date: formattedDate
                });
            } catch (err) {
                console.error("Error adding row:", err);
                // Continue to next row
            }
        });
        
        // Apply some styling to improve readability
        sheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Skip header row
                row.alignment = { vertical: 'middle' };
            }
            // Add border to all cells
            row.eachCell(cell => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        
        // Auto-fit columns (optional)
        sheet.columns.forEach(column => {
            const values = sheet.getColumn(column.key).values;
            const maxLength = Math.max(...values.map(v => v ? v.toString().length : 0));
            column.width = Math.min(30, Math.max(10, maxLength + 2)); // Width between 10 and 30
        });
        
        console.log("Writing Excel file to:", filepath);
        
        // Write the file
        return workbook.xlsx.writeFile(filepath)
            .then(() => {
                var url = req.protocol + '://' + req.get('host') + "/xlsheet/" + filename;
                console.log("Excel file created successfully:", url);
                res.json(url);
                
                setTimeout(() => {
                    fs.unlink(filepath, err => {
                        if (err) console.error("Error deleting temp file:", err);
                    });
                }, 60000); // Keep file for 1 minute
            })
            .catch(err => {
                console.error("Error saving workbook:", err);
                res.status(500).json({ error: "Failed to create Excel file: " + err.message });
            });
    } catch (err) {
        console.error("Critical error in generate_excel:", err);
        res.status(500).json({ error: "Failed to create Excel file: " + err.message });
    }
}


exports.edit = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var provider_page_type = req.body.provider_page_type;
        Providers.findById(id).then((providers) => { 
            
            var is_public_demo = setting_detail.is_public_demo;
            var timezone_for_display_date = setting_detail.timezone_for_display_date;

            var lookup = {
                $lookup:
                        {
                            from: "types",
                            localField: "typeid",
                            foreignField: "_id",
                            as: "type_detail"
                        }
            };
            var unwind = {$unwind: "$type_detail"};
            Country.findOne({"countryname": providers.country}).then((country_detail) => { 
                City.find({"countryname": providers.country, isBusiness: constant_json.YES}).then((city_list) => { 

                    var mongoose = require('mongoose');
                    
                    var cityid_condition = {$match: {'cityid': {$eq: new mongoose.Types.ObjectId(providers.cityid)}}};

                    Citytype.aggregate([cityid_condition, lookup, unwind]).then((type_available) => { 

                        res.render('provider_detail_edit', {city_list: city_list, timezone_for_display_date: timezone_for_display_date, phone_number_min_length: country_detail.phone_number_min_length, phone_number_length: country_detail.phone_number_length, is_public_demo: is_public_demo, data: providers, provider_page_type: provider_page_type, service_type: type_available, 'moment': moment});
                        delete message;
                    }, (err) => {
                        utils.error_response(err, res)
                    });

                });
            });
        });
    } else {
        res.redirect('/admin');
    }
}

//UPDATED BY RAJ SAHOO
exports.update = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {

        var id = req.body.id;
        var gender = req.body.gender;
        if (gender != undefined) {
            req.body.gender = ((gender).trim()).toLowerCase();
        }
        var files_details = req.files;

        if(req.body.password){
            var crypto = require('crypto');
            var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
            req.body.password = hash;
        } else {
            delete req.body.password;
        }

        // Using Promise-based approach
        City.findOne({cityname: req.body.city})
            .then((city) => { 
                if (city) {
                    req.body.cityid = city._id;
                }

                // Check if email already exists
                return Provider.findOne({email: req.body.email, _id: {$ne: id}});
            })
            .then((provider_detail) => {
                if (provider_detail) {
                    message = admin_messages.error_message_email_already_used;
                    exports.edit(req, res, next);
                    return Promise.reject('email_already_used'); // Skip remaining chain
                }
                
                // Check if phone already exists
                return Provider.findOne({
                    phone: req.body.phone, 
                    country_phone_code: req.body.country_phone_code, 
                    _id: {$ne: id}
                });
            })
            .then((provider_detail) => {
                if (provider_detail) {
                    message = admin_messages.error_message_mobile_no_already_used;
                    exports.edit(req, res, next);
                    return Promise.reject('phone_already_used'); // Skip remaining chain
                }
                
                // Handle files and update provider
                if (files_details == '' || files_details == 'undefined') {
                    return Providers.findByIdAndUpdate(id, req.body, {new: true});
                } else {
                    return Providers.findById(id)
                        .then((provider) => {
                            utils.deleteImageFromFolder(provider.picture, 2);
                            var image_name = provider._id + utils.tokenGenerator(4);
                            var url = utils.getImageFolderPath(req, 2) + image_name + '.jpg';
                            utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 2);

                            req.body.picture = url;
                            return Providers.findByIdAndUpdate(id, req.body, {new: true});
                        });
                }
            })
            .then((provider) => {
                if (!provider) return; // Skip if promise was rejected earlier
                
                // Insert/update phlebotomist in lis with api call
                console.log("Insert/Update phlebotomist API Called from update profile");
                var req_para = {
                    providerid: id,
                    loginusername: req.session.userid,
                    isVerified: provider.is_approved
                };
                insert_update_phlebotomist(req_para);

                message = admin_messages.success_message_provider_update;
                res.redirect(req.body.provider_page_type);
            })
            .catch((error) => {
                // Only handle unexpected errors here
                if (error !== 'email_already_used' && error !== 'phone_already_used') {
                    console.error("Error updating provider:", error);
                    message = admin_messages.error_message_something_went_wrong;
                    res.redirect(req.body.provider_page_type);
                }
            });

    } else {
        res.redirect('/admin');
    }
};
// end CHANGED BY Raj Sahoo 6 march //

exports.profile_is_approved = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var is_approved = parseInt(req.body.is_approved);
        var is_document_uploaded = req.body.is_document_uploaded;
        var service_type = req.body.service_type;
        var provider_page_type = req.body.provider_page_type;

        // Check if service_type is empty or undefined for approval
        if (is_approved === 0 && (!service_type || service_type === '')) {
            message = admin_messages.error_message_service_type_required;
            res.redirect(provider_page_type);
            return;
        }

        // Determine the new approval status (opposite of current)
        var new_approval_status = is_approved === 0 ? 1 : 0;

        if (new_approval_status === 1) {
            // APPROVING THE PROVIDER
            if (is_document_uploaded == 1) {
                Citytype.findOne({_id: service_type}).then((citytype) => { 
                    if (!citytype && new_approval_status === 1) {
                        message = admin_messages.error_message_citytype_not_found;
                        res.redirect(provider_page_type);
                        return;
                    }
                    
                    var admintypeid = citytype ? citytype.typeid : null;
                    
                    Providers.findByIdAndUpdate(id, {is_approved: new_approval_status}, {new: true})
                        .then((providers) => { 
                            // Insert/update phlebotomist in LIS
                            var req_para = {
                                providerid: id,
                                loginusername: req.session.userid,
                                isVerified: true
                            };
                            insert_update_phlebotomist(req_para);

                            if (req.body.vehicle_id !== '' && req.body.vehicle_id !== undefined) {
                                var index = providers.vehicle_detail.findIndex(x => 
                                    (x._id).toString() == (req.body.vehicle_id).toString());
                                
                                if (index !== -1) {
                                    providers.vehicle_detail[index].service_type = citytype._id;
                                    providers.vehicle_detail[index].admin_type_id = admintypeid;
                                    providers.vehicle_detail[index].is_selected = true;
                                    providers.is_vehicle_document_uploaded = 
                                        providers.vehicle_detail[index].is_document_uploaded;
                                    
                                    Providers.findByIdAndUpdate(id, {
                                        vehicle_detail: providers.vehicle_detail, 
                                        is_vehicle_document_uploaded: providers.vehicle_detail[index].is_document_uploaded, 
                                        service_type: service_type, 
                                        admintypeid: admintypeid
                                    }).then(() => {
                                        // Optional: Handle success
                                    }).catch(err => {
                                        console.log('Error updating provider vehicle details:', err);
                                    });
                                }
                            }
                            
                            var device_token = providers.device_token;
                            var device_type = providers.device_type;
                            
                            // Handle notifications
                            if (providers.provider_type != 0) {
                                if (providers.is_partner_approved_by_admin == 1) {
                                    var email_notification = setting_detail.email_notification;
                                    if (email_notification == true) {
                                        allemails.sendProviderApprovedEmail(req, providers);
                                    }
                                    utils.sendPushNotification(
                                        constant_json.PROVIDER_UNIQUE_NUMBER, 
                                        device_type, 
                                        device_token, 
                                        push_messages.PUSH_CODE_FOR_PROVIDER_APPROVED, 
                                        constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                                    );
                                }
                            } else {
                                var email_notification = setting_detail.email_notification;
                                if (email_notification == true) {
                                    allemails.sendProviderApprovedEmail(req, providers);
                                }
                                utils.sendPushNotification(
                                    constant_json.PROVIDER_UNIQUE_NUMBER, 
                                    device_type, 
                                    device_token, 
                                    push_messages.PUSH_CODE_FOR_PROVIDER_APPROVED, 
                                    constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                                );
                            }
                            
                            message = admin_messages.success_message_provider_approved;
                            res.redirect(provider_page_type);
                        })
                        .catch(err => {
                            console.log('Error finding provider:', err);
                            message = admin_messages.error_message_something_went_wrong;
                            res.redirect(provider_page_type);
                        });
                }).catch(err => {
                    console.log('Error finding city type:', err);
                    message = admin_messages.error_message_something_went_wrong;
                    res.redirect(provider_page_type);
                });
            } else {
                message = admin_messages.error_message_document_not_uploaded;
                res.redirect(provider_page_type);
            }
        } else {
            // DECLINING THE PROVIDER
            Providers.findById(id)
                .then((providers) => { 
                    if (!providers) {
                        message = admin_messages.error_message_provider_not_found;
                        res.redirect(provider_page_type);
                        return;
                    }
                    
                    if (!providers.is_trip || providers.is_trip.length == 0) {
                        // Update is_approved status
                        Providers.findOneAndUpdate(
                            { '_id': id }, 
                            { $set: { is_approved: new_approval_status, is_active: constant_json.NO } }, 
                            { new: true }
                        ).then(() => {
                            // Remove from zone queue
                            utils.remove_from_zone_queue(providers);
                            
                            // Send notifications
                            var device_token = providers.device_token;
                            var device_type = providers.device_type;
                            
                            if (providers.provider_type != 0) {
                                if (providers.is_partner_approved_by_admin != 0) {
                                    allemails.sendProviderDeclineEmail(req, providers);
                                    utils.sendPushNotification(
                                        constant_json.PROVIDER_UNIQUE_NUMBER, 
                                        device_type, 
                                        device_token, 
                                        push_messages.PUSH_CODE_FOR_PROVIDER_DECLINED, 
                                        constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                                    );
                                }
                            } else {
                                allemails.sendProviderDeclineEmail(req, providers);
                                utils.sendPushNotification(
                                    constant_json.PROVIDER_UNIQUE_NUMBER, 
                                    device_type, 
                                    device_token, 
                                    push_messages.PUSH_CODE_FOR_PROVIDER_DECLINED, 
                                    constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                                );
                            }
                            
                            message = admin_messages.success_message_provider_declined;
                            res.redirect(provider_page_type);
                        }).catch((error) => {
                            console.log("findOneAndUpdate error:", error);
                            message = admin_messages.error_message_something_went_wrong;
                            res.redirect(provider_page_type);
                        });
                    } else {
                        message = admin_messages.error_message_provider_in_trip;
                        res.redirect(provider_page_type);
                    }
                })
                .catch(err => {
                    console.log('Error finding provider:', err);
                    message = admin_messages.error_message_something_went_wrong;
                    res.redirect(provider_page_type);
                });
        }
    } else {
        res.redirect('/admin');
    }
};
/*** 
 * Update Provider details using insertupdate api for phlebotomist
 * Crated By: Ripal Patel
 * Created Date: 19-5-2021
 * ***/
var config = require('../../config/config');

//exports.insert_update_phlebotomist = functio n (req, res) {
 function insert_update_phlebotomist (req, res) {
   // console.log(req.session.userid);
    //var id="5d120f6dce06c1551e91da16";

    var providerid=req.providerid;
   // providerid=id;
    var loginusername=req.loginusername;  
    var isVerified=req.isVerified;    

    Providers.findById(providerid).then((provider) =>{
      if(!provider)
      {
        console.log(admin_messages.error_provider_not_found);
      }
      else
      {
        var apipath = config.PathPrefix + '/Phlebotomist/InsertUpdatePhlebotomist';
        var checkUserIDExists = provider.employee_id;
        var userEmailId="";
        if(checkUserIDExists && checkUserIDExists!=""){
            userEmailId = checkUserIDExists
        }
        else{
            userEmailId = provider.email
        }
        
        var data = JSON.stringify({
            //  UserID: provider.email.split("@")[0], 
            UserID: userEmailId,//changed by mayursinh zala on 23-11-2021 as userID generation logic is changed from .net so we send the generated unique userID
            UserEmail: provider.email,
            UserName: provider.email, 
            FirstName: provider.first_name, 
            LastName: provider.last_name, 
            Password: 'Welcome123',
            IsClientAdmin: false,
            ClientID: config.ClientID,
            ClientName: config.ClientName,
            UserType: '1',
            IsActive: true,
            IsVerified: true,
            CreatedBy: "SuperAdmin",
            CreatedDtm: new Date(Date.now()),
            UpdatedBy: "SuperAdmin", 
            UpdatedDtm: new Date(Date.now()),
            VerifiedBy: null, 
            VerifyDtm: new Date(Date.now()),
            ActivateDtm: new Date(Date.now()),
            DeactivateDtm: new Date(Date.now()),
            Street: provider.address,
            Street1: null,
            City: provider.city,
            State: null,
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
        console.log(" -------------- data.length data.length data.length  -------------- ",data.length)
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
            
            var data= JSON.parse(response);
            console.log("------------------------------------ parse response ------------------------------------ 937");
            console.log(data);

            console.log("provider.email provider.email ")
            // console.log(provider)
            Providers.findOneAndUpdate({ 'email': provider.email}, { $set: { userSysID: data.SysID,employee_id:data.UserID } }, { new: true }).then(updatedProviderDetails => {
                console.log("------------------------------------ updatedProviderDetails data ------------------------------------ 934");
                console.log(updatedProviderDetails);
                
            }).catch((error) => {
                console.log("------------------------------------ findOneAndUpdate error ------------------------------------ 944");
                console.log(error);
            }); 
             
            // res.json({
            //     success: true,
            //     response: data
            // });
    
        }).catch((err) => {
            console.log(err);
        });
        
      }

    });
};


exports.available_type = function (req, res, next) {
    var city_id = req.body.city;
    var lookup = {
        $lookup:
                {
                    from: "types",
                    localField: "typeid",
                    foreignField: "_id",
                    as: "type_detail"
                }
    };
    var mongoose = require('mongoose');
    
    var unwind = {$unwind: "$type_detail"};
    var cityid_condition = {$match: {'cityid': {$eq: new mongoose.Types.ObjectId(req.body.city)}}};
    var buiesness_condotion = {$match: {'is_business': {$eq: 1}}};

    City_type.aggregate([cityid_condition, buiesness_condotion, lookup, unwind]).then((type_available) => { 
        res.json(type_available);
    }, (err) => {
            utils.error_response(err, res)
    });
};

exports.history = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        var array = [];
        var i = 0;
        var id = req.body.id;
        if (req.body.page == undefined) {
            page = 0;
            next = 1;
            pre = 0;
        } else {
            page = req.body.page;
            next = parseInt(req.body.page) + 1;
            pre = req.body.page - 1;
        }
        if (req.body.search_item == undefined) {
            search_item = 'user_detail.first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'unique_id';
            filter_start_date = '';
            filter_end_date = '';
        } else {
            search_item = req.body.search_item;
            search_value = req.body.search_value;
            sort_order = req.body.sort_item[1];
            sort_field = req.body.sort_item[0];
            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;
        }

        if (req.body.start_date == '' || req.body.end_date == '') {
            if (req.body.start_date == '' && req.body.end_date == '') {
                var date = new Date(Date.now());
                date = date.setHours(0, 0, 0, 0);
                start_date = new Date(0);
                end_date = new Date(Date.now());
            } else if (req.body.start_date == '') {
                start_date = new Date(0);
                var end_date = req.body.end_date;
                end_date = new Date(end_date);
                end_date = end_date.setHours(23, 59, 59, 999);
                end_date = new Date(end_date);
            } else {
                var start_date = req.body.start_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(Date.now());
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {
            start_date = new Date(0);
            end_date = new Date(Date.now());
        } else {
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
        }
        var number_of_rec = 10;


        var lookup = {
            $lookup:
                    {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user_detail"
                    }
        };
        var unwind = {$unwind: "$user_detail"};

        var lookup1 = {
            $lookup:
                    {
                        from: "providers",
                        localField: "current_provider",
                        foreignField: "_id",
                        as: "provider_detail"
                    }
        };

        var unwind1 = {$unwind: "$provider_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');

        if (search_item == "user_detail.first_name") {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['user_detail.last_name'] = {$regex: new RegExp(value, 'i')};

                var search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['user_detail.last_name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(full_name[0], 'i')};
                query4['user_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(full_name[1], 'i')};
                query6['user_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};

                var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        } else {
            var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }

        query1['provider_trip_end_time'] = {$gte: start_date, $lt: end_date};
        var filter = {"$match": query1};

        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};

        var skip = {};
        skip["$skip"] = page * number_of_rec;

        var limit = {};
        limit["$limit"] = number_of_rec;

        var mongoose = require('mongoose');
        
        var condition = {"$match": {'provider_id': {$eq: new mongoose.Types.ObjectId(id)}}};
        var trip_condition = {"$match": {$or: [{is_trip_completed: 1}, {is_trip_cancelled: 1}, {is_trip_cancelled_by_provider: 1}]}};

        Trip.aggregate([condition, trip_condition, lookup, unwind, lookup1, unwind1, search, filter, count]).then((array) => { 
            if (array.length == 0) {
                res.render('providers_history', {detail: array, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment, id: id});
            } else {
                var pages = Math.ceil(array[0].total / number_of_rec);
                Trip.aggregate([condition, trip_condition, lookup, unwind, lookup1, unwind1, search, filter, sort, skip, limit]).then((array) => { 

                    res.render('providers_history', {detail: array, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment, id: id});
                }, (err) => {
                    utils.error_response(err, res)
                });
            }
        }, (err) => {
            utils.error_response(err, res)
        });
    } else {
        res.redirect("/admin");
    }

};

exports.documents = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var array = [];
        var i = 0;
        var j = 0;
        query = {};
        query['provider_id'] = id;

        Provider_Document.find(query).then((array) => { 
                res.render('provider_documents', {detail: array, moment: moment, id: id});
        });
    } else {
        res.redirect('/admin');
    }
};

exports.provider_documents_edit = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        Provider_Document.findById(req.body.id).then((provider_document) => { 
            
                res.render('admin_provider_documents_edit', {detail: provider_document, moment: moment});

        });
    } else {
        res.redirect('/admin');
    }
};


//UPDATED BY RAJ SAHOO
exports.provider_documents_update = function (req, res, next) {
    // exports.provider_documents_edit(req, res, next)
    if (typeof req.session.userid != 'undefined') {
        Provider_Document.findById(req.body.id).then((provider_document) => { 
            
            var id = provider_document.provider_id;
            provider_document.expired_date = req.body.expired_date;
            provider_document.unique_code = req.body.unique_code;
            provider_document.save().then(() => { 
                // Handle successful save
                if (req.files.length > 0) {
                    var image_name = provider_document.provider_id + utils.tokenGenerator(4);
                    var path = require('path');
                    var extension = path.extname(req.files[0].originalname);

                    var url = utils.getImageFolderPath(req, 3) + image_name + extension;
                    utils.saveImageFromBrowser(req.files[0].path, image_name + extension, 3);

                    provider_document.document_picture = url;
                    provider_document.is_uploaded = 1;
                    
                    // Use promise-based approach instead of callback
                    provider_document.save().then(() => {
                        req.url = '/proivder_documents';
                        req.body = {id: provider_document.provider_id};
                        exports.documents(req, res, next);
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).send("Error saving document");
                    });
                } else {
                    req.url = '/proivder_documents';
                    req.body = {id: provider_document.provider_id};
                    exports.documents(req, res, next);
                }
            }).catch((err) => {
                console.log(err);
                res.status(500).send("Error saving document");
            });
        }).catch((err) => {
            console.log(err);
            res.status(500).send("Error finding document");
        });
    } else {
        res.redirect('/admin');
    }
};


exports.provider_documents_delete = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        Provider_Document.findById(req.body.id).then((provider_document) => { 

            if (provider_document)
            {
                provider_document.is_uploaded = 0;
                provider_document.document_picture = "";
                provider_document.is_document_expired = false;token
                provider_document.expired_date = "";
                provider_document.unique_code = "";
                provider_document.save();

                var id = provider_document.provider_id;
                if (provider_document.option == 1)
                {
                    Provider.findById(provider_document.provider_id).then((provider_data) => { 

                        provider_data.is_document_uploaded = 0;
                        provider_data.save();
                        var device_type = provider_data.device_type;
                        var device_token = provider_data.device_token;

                        utils.sendPushNotification(constant_json.PROVIDER_UNIQUE_NUMBER, device_type, device_token, push_messages.PUSH_CODE_FOR_DOCUMENT_UPLOAD, constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS);
                        message = admin_messages.success_message_provider_document_delete;
                        req.body = {id: provider_document.provider_id}
                        exports.documents(req, res, next)
                    })
                } else
                {
                    message = admin_messages.success_message_provider_document_delete;
                    req.body = {id: provider_document.provider_id}
                    exports.documents(req, res, next)
                }
            } else
            {
                message = admin_messages.success_message_provider_document_delete;
                exports.documents(req, res, next)
            }
        })
    } else {
        res.redirect('/admin');
    }
};

exports.documents_search = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var item = req.body.search_item;
        var value = req.body.search_value;

        value = value.replace(/^\s+|\s+$/g, '');//Trim space within string
        value = value.replace(/ +(?= )/g, '');//trim starting & ending space
        query = {};
        query[item] = new RegExp(value, 'i');
        query['provider_id'] = id;

        Provider_Document.find(query).then((array) => { 
                res.render('provider_documents', {detail: array, id: id});
        });
    } else {
        res.redirect('/admin');
    }
};


//UPDATED BY RAJ SAHOO
exports.documents_sort = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var field = req.body.sort_item[0];
        var order = req.body.sort_item[1];
        
        // Create proper sort object
        var sort = {};
        sort[field] = parseInt(order); // Ensure order is parsed as integer

        var query = {};
        query['provider_id'] = id;

        // Execute the find with proper sort
        Provider_Document.find(query)
            .sort(sort) // Apply the sort before the query executes
            .then((documents) => { 
                res.render('provider_documents', {
                    detail: documents, 
                    id: id
                });
            })
            .catch(error => {
                console.error("Error sorting documents:", error);
                res.status(500).send("Internal Server Error");
            });
    } else {
        res.redirect('/admin');
    }
};

exports.provider_vehicle_list = function (req, res) {
    if (typeof req.session.userid != 'undefined') {

        console.log(req.body)
        var condition = {$match: {"_id": new mongoose.Types.ObjectId(req.body.provider_id)}};
        var vunwind = {$unwind: "$vehicle_detail"}

        var lookup = {
            $lookup:
                    {
                        from: "types",
                        localField: "vehicle_detail.admin_type_id",
                        foreignField: "_id",
                        as: "type_detail"
                    }
        };
        var unwind = {$unwind: {
                path: "$type_detail",
                preserveNullAndEmptyArrays: true
            }
        };
        var group = {$group: {
                _id: null,
                "vehicle_detail": {$push: {
                        is_selected: "$vehicle_detail.is_selected",
                        passing_year: "$vehicle_detail.passing_year",
                        color: "$vehicle_detail.color",
                        model: "$vehicle_detail.model",
                        plate_no: "$vehicle_detail.plate_no",
                        name: "$vehicle_detail.name",
                        accessibility: "$vehicle_detail.accessibility",
                        _id: "$vehicle_detail._id",
                        provider_id: "$_id",
                        type_image_url: '$type_detail.type_image_url',
                        typename: '$type_detail.typename'
                    }}
            }
        }
        Provider.aggregate([condition, vunwind, lookup, unwind, group]).then((provider) => { 
            if (provider.length == 0) {
                res.render('provider_vehicle_list', {provider_id: req.body.provider_id, vehicle_list: [], type: req.body.type})
            } else {
                res.render('provider_vehicle_list', {provider_id: req.body.provider_id, vehicle_list: provider[0].vehicle_detail, type: req.body.type})

            }
        }, (err) => {
            utils.error_response(err, res)
        })
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO 6 march
exports.add_provider_vehicle = function (req, res) {
    if (typeof req.session.userid != 'undefined' || typeof req.session.partner != 'undefined') {
        var vehicle_accesibility = VEHICLE_ACCESIBILITY;
        
        // Using Promise-based approach instead of callbacks
        Provider.findOne({_id: req.body.provider_id})
            .then((provider) => {
                if (!provider) {
                    throw new Error('Provider not found');
                }
                
                var lookup = {
                    $lookup: {
                        from: "types",
                        localField: "typeid",
                        foreignField: "_id",
                        as: "type_detail"
                    }
                };
                var unwind = {$unwind: "$type_detail"};
                
                // Make sure to convert cityid to ObjectId properly
                var cityid_condition = {
                    $match: {
                        'cityid': {
                            $eq: new mongoose.Types.ObjectId(provider.cityid)
                        }
                    }
                };

                // Return a promise from aggregate
                return Citytype.aggregate([cityid_condition, lookup, unwind]).exec();
            })
            .then((type_available) => {
                // Render the view with the data
                res.render('edit_vehicle_detail', {
                    type_available: type_available,
                    vehicle_accesibility: vehicle_accesibility,
                    type: req.body.type,
                    provider_id: req.body.provider_id
                });
            })
            .catch((err) => {
                console.error('Error in add_provider_vehicle:', err);
                res.status(500).send('An error occurred: ' + err.message);
            });
    } else {
        res.redirect('/admin');
    }
};
//UPDATED BY RAJ SAHOO
exports.add_provider_vehicle_data = function (req, res) {
    if (typeof req.session.userid != 'undefined' || typeof req.session.partner != 'undefined') {
        // Start of Promise chain
        Provider.findOne({_id: req.body.provider_id})
            .then((provider) => {
                if (!provider) {
                    throw new Error('Provider not found');
                }
                
                return Citytype.findOne({_id: req.body.service_type})
                    .then((citytype) => {
                        if (!citytype) {
                            throw new Error('City type not found');
                        }
                        
                        var is_selected = false;
                        if(provider.vehicle_detail.length==0){
                            is_selected = true;
                        }
                        if(provider.vehicle_detail.length == 0){
                            provider.service_type = null;
                            provider.admintypeid = null;
                        }
                        
                        var mongoose = require('mongoose');
                        var x = new mongoose.Types.ObjectId();
                        var vehicel_json = {
                            _id: x,
                            name: req.body.name,
                            plate_no: req.body.plate_no,
                            model: req.body.model,
                            color: req.body.color,
                            passing_year: req.body.passing_year,
                            service_type: citytype._id,
                            admin_type_id: citytype.typeid,
                            is_selected: is_selected,
                            is_document_uploaded: false,
                            is_selected: false,
                            is_document_expired: false
                        }
                        
                        // Continue with Country lookup
                        return Country.findOne({countryname: provider.country})
                            .then((country) => {
                                if (!country) {
                                    throw new Error('Country not found');
                                }
                                
                                return Document.find({countryid: country._id, type: 2})
                                    .then((document) => {
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

                                            // Use Promise.all to handle multiple document saves
                                            const documentSavePromises = document.map((entry, index) => {
                                                var providervehicledocument = new Provider_Vehicle_Document({
                                                    vehicle_id: x,
                                                    provider_id: provider._id,
                                                    document_id: entry._id,
                                                    name: entry.title,
                                                    option: entry.option,
                                                    document_picture: "",
                                                    unique_code: entry.unique_code,
                                                    is_show_expiry_date: entry.is_show_expiry_date,
                                                    expired_date: "",
                                                    is_unique_code: entry.is_unique_code,
                                                    is_expired_date: entry.is_expired_date,
                                                    is_expired_time: entry.is_expired_time,
                                                    is_document_expired: false,
                                                    is_uploaded: 0
                                                });
                                                
                                                return providervehicledocument.save();
                                            });
                                            
                                            vehicel_json.is_document_uploaded = is_document_uploaded;
                                            provider.vehicle_detail.push(vehicel_json);
                                            
                                            return Promise.all([provider.save(), ...documentSavePromises])
                                                .then(() => {
                                                    message = process.env.success_add_vehicle_detail;
                                                    myProviders.provider_vehicle_list(req, res);
                                                });
                                        } else {
                                            vehicel_json.is_document_uploaded = true;
                                            provider.vehicle_detail.push(vehicel_json);
                                            
                                            return provider.save()
                                                .then(() => {
                                                    myProviders.provider_vehicle_list(req, res);
                                                });
                                        }
                                    });
                            });
                    });
            })
            .catch((err) => {
                console.error('Error in add_provider_vehicle_data:', err);
                res.status(500).send('An error occurred: ' + err.message);
            });
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO

exports.delete_vehicle_detail = function (req, res) {
    Provider.findOne({_id: req.body.provider_id})
        .then((provider) => {
            if (!provider) {
                throw new Error('Provider not found');
            }
            
            var index = provider.vehicle_detail.findIndex(x => (x._id).toString() == req.body.vehicle_id);
            if(index != -1) {
                if (provider.vehicle_detail[index].is_selected == true) {
                    provider.service_type = null;
                    provider.admintypeid = null;
                    if (provider.vehicle_detail.length == 1) {
                        provider.is_vehicle_document_uploaded = false;
                    }
                }
                provider.vehicle_detail.splice(index, 1);
            }
            
            provider.markModified('vehicle_detail');
            return provider.save();
        })
        .then(() => {
            myProviders.provider_vehicle_list(req, res);
        })
        .catch((err) => {
            console.error('Error in delete_vehicle_detail:', err);
            res.status(500).send('An error occurred: ' + err.message);
        });
};


//UPDATED BY RAJ SAHOO
exports.edit_vehicle_detail = function (req, res) {
    var vehicle_accesibility = VEHICLE_ACCESIBILITY;

    if (typeof req.session.userid != 'undefined') {
        Provider.findOne({_id: req.body.provider_id})
            .then((provider) => {
                if (!provider) {
                    throw new Error('Provider not found');
                }
                
                var index = provider.vehicle_detail.findIndex(x => (x._id).toString() == req.body.vehicle_id);
                if (index === -1) {
                    throw new Error('Vehicle not found in provider details');
                }
                
                return Provider_Vehicle_Document.find({
                    provider_id: req.body.provider_id, 
                    vehicle_id: req.body.vehicle_id
                }).then((provider_vehicle_document) => {
                    var lookup = {
                        $lookup: {
                            from: "types",
                            localField: "typeid",
                            foreignField: "_id",
                            as: "type_detail"
                        }
                    };
                    var unwind = {$unwind: "$type_detail"};
                    var cityid_condition = {
                        $match: {
                            'cityid': {
                                $eq: new mongoose.Types.ObjectId(provider.cityid)
                            }
                        }
                    };

                    return Citytype.aggregate([cityid_condition, lookup, unwind]).exec()
                        .then((type_available) => {
                            res.render('edit_vehicle_detail', {
                                provider_id: req.body.provider_id, 
                                type: 'admin', 
                                type_available: type_available, 
                                vehicle_accesibility: vehicle_accesibility, 
                                provider_vehicle_document: provider_vehicle_document, 
                                vehicle_detail: provider.vehicle_detail[index]
                            });
                        });
                });
            })
            .catch((err) => {
                console.error('Error in edit_vehicle_detail:', err);
                utils.error_response(err, res);
            });
    } else {
        res.redirect('/admin');
    }
};

exports.update_vehicle_detail = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {

        Provider.findOne({_id: req.body.provider_id}).then((provider) => { 

            var index = provider.vehicle_detail.findIndex(x => (x._id).toString() == req.body.vehicle_id);

            Citytype.findOne({_id: req.body.service_type}).then((citytype) => { 

                provider.vehicle_detail[index].service_type = citytype._id;
                provider.vehicle_detail[index].admin_type_id = citytype.typeid;
                provider.vehicle_detail[index].name = req.body.name;
                provider.vehicle_detail[index].plate_no = req.body.plate_no;
                provider.vehicle_detail[index].model = req.body.model;
                provider.vehicle_detail[index].color = req.body.color;
                provider.vehicle_detail[index].accessibility = req.body.accessibility;

                provider.vehicle_detail[index].passing_year = req.body.passing_year;

                if(provider.vehicle_detail[index].is_selected == true){
                    provider.service_type=citytype._id;
                    provider.admintypeid=citytype.typeid;
                }
                provider.markModified('vehicle_detail');
                provider.save().then(() => { 
                    myProviders.provider_vehicle_list(req, res);
                });
            });
        });
    } else {
        res.redirect('/admin');
    }
};


exports.vehicle_document_list = function (req, res) {
    if (typeof req.session.userid != 'undefined') {
        Provider_Vehicle_Document.find({provider_id: req.body.provider_id, vehicle_id: req.body.vehicle_id}).then((provider_vehicle_document) => { 

            res.render('vehicle_document_list', {provider_id: req.body.provider_id, vehicle_id: req.body.vehicle_id, moment: moment, detail: provider_vehicle_document})

        });
    } else {
        res.redirect('/admin');
    }
};


exports.provider_vehicle_documents_edit = function (req, res) {

    if (typeof req.session.userid != 'undefined') {

        Provider_Vehicle_Document.findById(req.body.id).then((provider_document) => { 
                res.render('admin_provider_vehicle_documents_edit', {detail: provider_document, moment: moment});
        });
    } else {
        res.redirect('/admin');
    }
};

exports.provider_vehicle_documents_update = function (req, res) {

    if (typeof req.session.userid != 'undefined') {
        Provider_Vehicle_Document.findById(req.body.id).then((provider_document) => { 
            
                var id = provider_document.provider_id;
                provider_document.expired_date = req.body.expired_date;
                provider_document.unique_code = req.body.unique_code;

                if (req.files.length > 0)
                {
                    var image_name = provider_document.provider_id + utils.tokenGenerator(4);
                    var path = require('path');
                    var extension = path.extname(req.files[0].originalname);
                    var url = utils.getImageFolderPath(req, 3) + image_name + extension;
                    utils.saveImageFromBrowser(req.files[0].path, image_name + extension, 3);
                    provider_document.document_picture = url;
                    provider_document.is_uploaded = 1;
                }
                provider_document.save().then(() => { 
                    req.body = {provider_id: provider_document.provider_id, vehicle_id: provider_document.vehicle_id}
                    myProviders.vehicle_document_list(req, res);
                    Provider_Vehicle_Document.find({
                        vehicle_id: provider_document.vehicle_id,
                        option: 1,
                        provider_id: provider_document.provider_id,
                        is_uploaded: 0
                    }).then((providervehicledocumentuploaded) => {
                        Provider.findOne({_id: provider_document.provider_id}).then((provider) => {
                            var index = provider.vehicle_detail.findIndex((x) => (x._id).toString() == (provider_document.vehicle_id)).toString();

                            if (providervehicledocumentuploaded.length == 0) {
                                provider.vehicle_detail[index].is_document_uploaded = true;
                            } else {
                                provider.vehicle_detail[index].is_document_uploaded = false;
                            }
                            provider.markModified('vehicle_detail');
                            if(provider.vehicle_detail[index].is_selected){
                                if (providervehicledocumentuploaded.length == 0) {
                                    provider.is_vehicle_document_uploaded = true;
                                } else {
                                    provider.is_vehicle_document_uploaded = false;
                                }
                            }
                            provider.save();
                        });
                    });
                });
        });
    } else {
        res.redirect('/admin');
    }
};

// admin_add_provider_wallet
//UPDATED BY RAJ SAHOO
exports.admin_add_provider_wallet = function (req, res, next) {
    if (typeof req.session.userid == 'undefined') {
        return res.json({
            success: false, 
            error_code: admin_messages.errpr_message_add_wallet_failed
        });
    }

    // Validate provider_id and wallet amount
    if (!req.body.provider_id || req.body.wallet === undefined) {
        return res.json({
            success: false,
            error_code: admin_messages.errpr_message_add_wallet_failed,
            message: 'Missing required parameters'
        });
    }

    Provider.findById(req.body.provider_id)
        .then((provider_data) => {
            if (!provider_data) {
                return res.json({
                    success: false, 
                    error_code: admin_messages.errpr_message_add_wallet_failed,
                    message: 'Provider not found'
                });
            }
            
            var wallet = utils.precisionRoundTwo(Number(req.body.wallet));
            var status = constant_json.DEDUCT_WALLET_AMOUNT;
            
            if (wallet > 0) {
                status = constant_json.ADD_WALLET_AMOUNT;
            }
            
            var total_wallet_amount = utils.addWalletHistory(
                constant_json.PROVIDER_UNIQUE_NUMBER, 
                provider_data.unique_id, 
                provider_data._id, 
                provider_data.country_id, 
                provider_data.wallet_currency_code, 
                provider_data.wallet_currency_code,
                1, 
                Math.abs(wallet), 
                provider_data.wallet, 
                status, 
                constant_json.ADDED_BY_ADMIN, 
                "By Admin"
            );

            provider_data.wallet = total_wallet_amount;
            
            return provider_data.save();
        })
        .then((updated_provider) => {
            if (!updated_provider) {
                throw new Error('Failed to update provider wallet');
            }
            
            res.json({
                success: true, 
                wallet: updated_provider.wallet, 
                message: admin_messages.success_message_add_wallet
            });
        })
        .catch((error) => {
            console.error('Error updating provider wallet:', error);
            res.json({
                success: false, 
                error_code: admin_messages.errpr_message_add_wallet_failed,
                message: error.message
            });
        });
};

// generate_provider_history_excel
exports.generate_provider_history_excel = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
         var array = [];
        var i = 0;
        var id = req.body.id;
        if (req.body.page == undefined) {
            page = 0;
            next = 1;
            pre = 0;
        } else {
            page = req.body.page;
            next = parseInt(req.body.page) + 1;
            pre = req.body.page - 1;
        }
        if (req.body.search_item == undefined) {
            search_item = 'user_detail.first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'unique_id';
            filter_start_date = '';
            filter_end_date = '';
        } else {
            search_item = req.body.search_item;
            search_value = req.body.search_value;
            sort_order = req.body.sort_item[1];
            sort_field = req.body.sort_item[0];
            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;
        }

        if (req.body.start_date == '' || req.body.end_date == '') {
            if (req.body.start_date == '' && req.body.end_date == '') {
                var date = new Date(Date.now());
                date = date.setHours(0, 0, 0, 0);
                start_date = new Date(0);
                end_date = new Date(Date.now());
            } else if (req.body.start_date == '') {
                start_date = new Date(0);
                var end_date = req.body.end_date;
                end_date = new Date(end_date);
                end_date = end_date.setHours(23, 59, 59, 999);
                end_date = new Date(end_date);
            } else {
                var start_date = req.body.start_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(Date.now());
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {
            start_date = new Date(0);
            end_date = new Date(Date.now());
        } else {
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date = end_date.setHours(23, 59, 59, 999);
            end_date = new Date(end_date);
        }
        var number_of_rec = 10;


        var lookup = {
            $lookup:
                    {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user_detail"
                    }
        };
        var unwind = {$unwind: "$user_detail"};

        var lookup1 = {
            $lookup:
                    {
                        from: "providers",
                        localField: "current_provider",
                        foreignField: "_id",
                        as: "provider_detail"
                    }
        };

        var unwind1 = {$unwind: "$provider_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');

        if (search_item == "user_detail.first_name") {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['user_detail.last_name'] = {$regex: new RegExp(value, 'i')};

                var search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['user_detail.last_name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(full_name[0], 'i')};
                query4['user_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(full_name[1], 'i')};
                query6['user_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};

                var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        } else {

            var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }

        query1['provider_trip_end_time'] = {$gte: start_date, $lt: end_date};
        var filter = {"$match": query1};

        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        Trip.aggregate([lookup, unwind, lookup1, search, filter, sort]).then((array) => { 

            var date = new Date()
            var time = date.getTime()
            var workbook = excelbuilder.createWorkbook('./data/xlsheet', time + '_provider_history.xlsx');

            var sheet1 = workbook.createSheet('sheet1', 10, array.length + 1);

            sheet1.set(1, 1, config_json.title_id);
            sheet1.set(2, 1, config_json.title_user_id);
            sheet1.set(3, 1, config_json.title_user);
            sheet1.set(4, 1, config_json.title_provider_id);
            sheet1.set(5, 1, config_json.title_provider);
            sheet1.set(6, 1, config_json.title_date);
            sheet1.set(7, 1, config_json.title_status);
            sheet1.set(8, 1, config_json.title_amount);
            sheet1.set(9, 1, config_json.title_payment);
            sheet1.set(10, 1, config_json.title_payment_status);

            array.forEach(function (data, index) {

                sheet1.set(1, index + 2, data.unique_id);
                sheet1.set(2, index + 2, data.user_detail.unique_id);
                sheet1.set(3, index + 2, data.user_detail.first_name + ' ' + data.user_detail.last_name);
                if (data.provider_detail.length > 0) {
                    sheet1.set(4, index + 2, data.provider_detail[0].unique_id);
                    sheet1.set(5, index + 2, data.provider_detail[0].first_name + ' ' + data.provider_detail[0].last_name);
                }
                sheet1.set(6, index + 2, moment(data.created_at).format("DD MMM 'YY") + ' ' + moment(data.created_at).format("hh:mm a"));



                if (data.is_trip_cancelled == 1) {
                    if (data.is_trip_cancelled_by_provider == 1) {
                        sheet1.set(7, index + 2, config_json.title_total_cancelled_by_provider);

                    } else if (data.is_trip_cancelled_by_user == 1) {
                        sheet1.set(7, index + 2, config_json.title_total_cancelled_by_user);
                    } else {
                        sheet1.set(7, index + 2, config_json.title_total_cancelled);

                    }
                } else {

                    if (data.is_provider_status == 2) {
                        sheet1.set(7, index + 2, config_json.title_trip_status_coming);

                    } else if (data.is_provider_status == 4) {
                        sheet1.set(7, index + 2, config_json.title_trip_status_arrived);

                    } else if (data.is_provider_status == 6) {
                        sheet1.set(7, index + 2, config_json.title_trip_status_started);

                    } else if (data.is_provider_status == 9) {
                        sheet1.set(7, index + 2, config_json.title_trip_status_completed);

                    } else if (data.is_provider_status == 1 || data.is_provider_status == 0) {
                        if (data.is_provider_accepted == 1) {
                            sheet1.set(7, index + 2, config_json.title_trip_status_accepted);
                        } else {
                            sheet1.set(7, index + 2, config_json.title_trip_status_waiting);

                        }
                    }
                }
                sheet1.set(8, index + 2, data.total);

                if (data.payment_mode == 1) {
                    sheet1.set(9, index + 2, config_json.title_pay_by_cash);
                } else {
                    sheet1.set(9, index + 2, config_json.title_pay_by_card);
                }

                if (data.is_pending_payments == 1) {

                    sheet1.set(10, index + 2, config_json.title_pending);
                } else {

                    if (data.is_paid == 1) {
                        sheet1.set(10, index + 2, config_json.title_paid);
                    } else {
                        sheet1.set(10, index + 2, config_json.title_not_paid);
                    }
                }

                if (index == array.length - 1) {
                    workbook.save(function (err) {
                        if (err)
                        {
                            workbook.cancel();
                        } else {
                            var url = req.protocol + '://' + req.get('host') + "/xlsheet/" + time + "_provider_history.xlsx"
                            res.json(url);
                            setTimeout(function () {
                                fs.unlink('data/xlsheet/' + time + '_provider_history.xlsx', function (err, file) {
                                });
                            }, 10000)
                        }
                    });
                }
            });
        }, (err) => {
            utils.error_response(err, res)
        });
    } else {
        res.redirect('/admin');
    }

};


//added by Mayursinh for Document Status change on 10-11-2021
//UPDATED BY RAJ SAHOO
exports.approve_provider_document = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        Provider_Document.findById(req.body.id)
            .then((provider_document) => {
                if (!provider_document) {
                    console.log("Document not found for ID: " + req.body.id);
                    message = admin_messages.error_message_document_not_found;
                    res.redirect('/admin');
                    return;
                }
                
                var id = provider_document.provider_id;
                provider_document.document_status = "approved";
                
                return provider_document.save()
                    .then(() => {
                        // Check if all required documents are approved
                        return Provider_Document.find({
                            provider_id: id, 
                            option: 1, // Required documents
                            document_status: {$ne: "approved"}
                        });
                    })
                    .then((pendingDocs) => {
                        if (pendingDocs.length === 0) {
                            // All required documents are approved, update provider status
                            return Provider.findByIdAndUpdate(
                                id, 
                                {is_document_uploaded: 1},
                                {new: true}
                            );
                        }
                        return null;
                    })
                    .then(() => {
                        // Redirect to documents page
                        req.body = {id: id};
                        exports.documents(req, res, next);
                    });
            })
            .catch((error) => {
                console.error("Error in approve_provider_document:", error);
                message = admin_messages.error_message_something_went_wrong;
                res.redirect('/admin');
            });
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO
exports.reject_provider_document = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        Provider_Document.findById(req.body.id)
            .then((provider_document) => {
                if (!provider_document) {
                    console.log("Document not found for ID: " + req.body.id);
                    message = admin_messages.error_message_document_not_found;
                    res.redirect('/admin');
                    return;
                }
                
                var id = provider_document.provider_id;
                provider_document.document_status = "declined";
                
                return provider_document.save()
                    .then(() => {
                        // If this was a required document, update provider status
                        if (provider_document.option === 1) {
                            return Provider.findByIdAndUpdate(
                                id, 
                                {is_document_uploaded: 0},
                                {new: true}
                            );
                        }
                        return null;
                    })
                    .then(() => {
                        // Redirect to documents page
                        req.body = {id: id};
                        exports.documents(req, res, next);
                    });
            })
            .catch((error) => {
                console.error("Error in reject_provider_document:", error);
                message = admin_messages.error_message_something_went_wrong;
                res.redirect('/admin');
            });
    } else {
        res.redirect('/admin');
    }
};

// exports.submitExpense = function(req, res) {
//     console.log('Request body:', req.body);
//     utils.check_request_params(req.body, [
//         { name: 'description', type: 'string' },
//         { name: 'amount', type: 'string' },
//         { name: 'provider_id', type: 'string' },
//         { name: 'date', type: 'string' }
//     ], function(response) {
//         if (response.success) {
//             console.log('Parameters check successful');
//             var description = req.body.description;
//             var amount = req.body.amount;
//             var providerId = req.body.provider_id;
//             var date = req.body.date;

//             var newExpense = new Expense({
//                 description: description,
//                 amount: amount,
//                 provider_id: providerId,
//                 date: date
//             });

//             // Check if there are files uploaded
//             if (req.files && req.files.length > 0) {
//                 const file = req.files[0];

//                 // Define the document path on the server
//                 const documentPath = 'C:/API/newProdMyWork/src/data/expense_document';

//                 const image_name = newExpense._id + utils.tokenGenerator(4);
//                 const extension = path.extname(file.originalname);
//                 const photoUrl = path.join(documentPath, image_name + extension);

//                 // Move the uploaded file to the destination folder on server
//                 fs.renameSync(file.path, photoUrl);

//                 // Save photoUrl in the Expense model
//                 newExpense.photo = photoUrl;

//                 newExpense.save(function(err) {
//                     if (err) {
//                         console.error("Error saving expense:", err);
//                         return res.json({ success: false, error_code: 'ErrorSavingExpense', error_description: 'Failed to save expense' });
//                     }

//                     // Send back a response indicating the submission was successful
//                     res.json({
//                         success: true,
//                         message: "Expense submitted successfully",
//                         description: description,
//                         amount: amount,
//                         provider_id: providerId,
//                         date: date,
//                         photo: photoUrl // Add the photo URL to the response
//                     });
//                 });
//             } else {
//                 // No file uploaded, submit expense without a picture
//                 newExpense.save(function(err) {
//                     if (err) {
//                         console.error("Error saving expense:", err);
//                         return res.json({ success: false, error_code: 'ErrorSavingExpense', error_description: 'Failed to save expense' });
//                     }

//                     // Send back a response indicating the submission was successful
//                     res.json({
//                         success: true,
//                         message: "Expense submitted successfully",
//                         description: description,
//                         amount: amount,
//                         provider_id: providerId,
//                         date: date 
//                     });
//                 });
//             }
//         } else {
//             res.json({
//                 success: false,
//                 error_code: response.error_code,
//                 error_description: response.error_description
//             });
//         }
//     });
// };

//UPDATED BY RAJ SAHOO 
// Add this to your controllers file where you handle provider documents
exports.download_provider_document = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        Provider_Document.findById(req.body.id).then((provider_document) => {
            if (provider_document && provider_document.document_picture) {
                try {
                    console.log('Document picture path:', provider_document.document_picture);
                    
                    // Try multiple path resolution approaches
                    const possiblePaths = [
                        // Absolute path as stored in DB
                        provider_document.document_picture,
                        
                        // Relative to project root
                        path.join(process.cwd(), provider_document.document_picture),
                        
                        // Remove any leading slash if present
                        path.join(process.cwd(), provider_document.document_picture.replace(/^\//, '')),
                        
                        // Try with public directory
                        path.join(process.cwd(), 'public', provider_document.document_picture)
                    ];
                    
                    // Try to find a valid path
                    let validPath = null;
                    for (const testPath of possiblePaths) {
                        console.log('Testing path:', testPath);
                        if (fs.existsSync(testPath)) {
                            validPath = testPath;
                            console.log('Found valid path:', validPath);
                            break;
                        }
                    }
                    
                    if (validPath) {
                        // Get filename from path
                        const fileName = path.basename(validPath);
                        
                        // Set headers for download
                        res.setHeader('Content-Disposition', 'attachment; filename=' + fileName);
                        res.setHeader('Content-Type', 'application/octet-stream');
                        
                        // Stream the file
                        const fileStream = fs.createReadStream(validPath);
                        fileStream.on('error', (error) => {
                            console.error('Error streaming file:', error);
                            res.status(500).send('Error streaming file: ' + error.message);
                        });
                        fileStream.pipe(res);
                    } else {
                        // If direct file access fails, try redirecting to URL
                        if (setting_detail && setting_detail.image_base_url) {
                            const imageUrl = setting_detail.image_base_url + provider_document.document_picture;
                            console.log('Redirecting to URL:', imageUrl);
                            res.redirect(imageUrl);
                        } else {
                            console.error('All file paths failed and no image_base_url available');
                            res.status(404).send('Document file not found');
                        }
                    }
                } catch (error) {
                    console.error('Error in download process:', error);
                    res.status(500).send('Error processing document: ' + error.message);
                }
            } else {
                res.status(404).send('Document not found or no document picture available');
            }
        }).catch((error) => {
            console.error('Error finding document:', error);
            res.status(500).send('Error finding document: ' + error.message);
        });
    } else {
        res.redirect('/admin');
    }
};
// Function to send error email
function sendErrorEmail(errorDetails) {
    const email = setting_detail.email;
    const password = setting_detail.password;

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: email,
            pass: password
        },
        logger: true,
        debug: true
    });

    const mailOptions = {
        from: email,
        to: 'raj.sahoo@myonsitehealthcare.com',
        subject: 'MongoDB Server Down Alert',
        text: `An error occurred at ${new Date().toISOString()} : ${errorDetails}`,
        html: `<p>An error occurred at ${new Date().toISOString()}:</p><p>${errorDetails}</p>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            console.error('Error code:', error.code);
            console.error('SMTP response:', error.response);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
}

// // Function to check MongoDB server status
// async function checkMongoDBStatus() {
//     const mongoConnectionString = 'mongodb://user1:Kl20fl4G2gad44gal23kgadg@10.158.17.186:27017/prodMyOnSite?retryWrites=false&connectTimeoutMS=10000&authSource=prodMyOnSite&authMechanism=SCRAM-SHA-1';

//     let client;
//     try {
//         // Try connecting to MongoDB
//         client = await MongoClient.connect(mongoConnectionString, {
//             useUnifiedTopology: true,
//             serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
//         });
//         console.log(`${new Date().toISOString()}: MongoDB server is responding.`);
//     } catch (error) {
//         console.error(`${new Date().toISOString()}: MongoDB server is not responding. Error:`, error.message);
//         sendErrorEmail(error.message); // Send email alert
//     } finally {
//         // Close the client connection if established
//         if (client) {
//             await client.close();
//         }
//     }
// }

// // Start monitoring
// async function monitorMongoDB() {
//     console.log('Starting MongoDB monitoring...');
//     while (true) {
//         await checkMongoDBStatus();
//         // Wait for 1 minute before checking again
//         await new Promise(resolve => setTimeout(resolve, 900000));
//     }
// }

// // Execute the monitoring function
// monitorMongoDB().catch(error => {
//     console.error('Monitoring script encountered an error:', error);
// });
/**
 * Submit user rating (submitting user ratings)
 * Created By: Krina Shah
 * Created Date: 30-Oct-2024
 */
exports.submit_user_rating = function (req, res) {
    // Validate request body for necessary fields
    utils.check_request_params(req.body, [
        { name: 'RequisitionSysID', type: 'number' },
        { name: 'UserID', type: 'string' },
        { name: 'Comments', type: 'string' },
        { name: 'RatingValue', type: 'number' },
        { name: 'PatientName', type: 'string' },
        { name: 'PatientSysID', type: 'number' }
    ], async function (response) {
        if (response.success) {
            const { RequisitionSysID, UserID, Comments, RatingValue, PatientName, PatientSysID } = req.body;

            try {
                // Fetch the TripOrder document using the RequisitionSysID
                const tripOrder = await TripOrder.findOne({ requisitionsysid: RequisitionSysID });
                if (!tripOrder) {
                    const errorDetails = `Trip order with RequisitionSysID ${RequisitionSysID} not found.`;
                    sendErrorEmail(errorDetails); // Call sendErrorEmail
                    return res.status(404).json({
                        success: false,
                        message: 'Trip order not found'
                    });
                }

                // Check if UserID exists in the provider table
                const provider = await Provider.findOne({ UserID });
                if (!provider) {
                    const errorDetails = `Provider with UserID ${UserID} not found.`;
                    sendErrorEmail(errorDetails); // Call sendErrorEmail
                    return res.status(404).json({
                        success: false,
                        message: 'Provider not found'
                    });
                }

                // Check if PatientSysID exists in the TripOrder's results array
                const patientExists = tripOrder.order.orderlist.some(orderItem => 
                    orderItem.results.some(result => result.patientsysid === PatientSysID)
                );

                if (!patientExists) {
                    const errorDetails = `PatientSysID ${PatientSysID} not found in trip order results.`;
                    sendErrorEmail(errorDetails); // Call sendErrorEmail
                    return res.status(404).json({
                        success: false,
                        message: 'PatientSysID not found in trip order results'
                    });
                }

                // Check if a rating already exists for this user and requisition
                const existingRating = await UserRating.findOne({ RequisitionSysID, UserID });
                if (existingRating) {
                    return res.json({
                        success: false,
                        message: 'Rating already submitted for this trip',
                        ratingDisabled: true // Indicate that the stars should be disabled for this trip
                    });
                }

                // Create a new UserRating object
                const newUserRating = new UserRating({
                    RequisitionSysID,
                    UserID,
                    Comments,
                    RatingValue,
                    PatientName,
                    PatientSysID
                });

                // Save the user rating to the database
                await newUserRating.save();

                // Send success response
                res.json({
                    success: true,
                    message: 'User rating successfully saved',
                    ratingDisabled: false // Stars are enabled for future submissions
                });
            } catch (error) {
                console.error('Error saving user rating:', error);
                sendErrorEmail(error.message); // Call sendErrorEmail
                res.status(500).json({
                    success: false,
                    message: 'Error saving user rating',
                    error: error.message
                });
            }
        } else {
            res.status(400).json({
                success: false,
                message: response.error_description
            });
        }
    });
};


/**
 * Retrieving user rating (Retrieving user ratings)
 * Created By: Krina Shah
 * Created Date: 30-Oct-2024
 */
// Function to fetch total ratings and average rating for a specific UserID
// Function to fetch total ratings and average rating for a specific UserID
exports.fetch_rating = async function (req, res) {
    const { UserID } = req.body; // Expecting UserID in the request body

    try {
        let ratings;

        if (UserID === "all") {
            // Fetch ratings for all providers
            ratings = await UserRating.find({});
        } else {
            // Fetch ratings for a specific provider
            ratings = await UserRating.find({ UserID });

            if (ratings.length === 0) {
                return res.json({
                    success: false,
                    message: `No ratings found for UserID: ${UserID}.`,
                    data: null
                });
            }
        }

        // Group ratings by UserID
        const groupedRatings = ratings.reduce((acc, rating) => {
            const { UserID, RatingValue } = rating;

            if (!acc[UserID]) {
                acc[UserID] = {
                    totalRatings: 0,
                    ratingSum: 0,
                    ratingCount: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
                    ratings: []  // Store individual rating details
                };
            }

            acc[UserID].totalRatings += 1;
            acc[UserID].ratingSum += RatingValue;

            if (RatingValue >= 1 && RatingValue <= 5) {
                acc[UserID].ratingCount[RatingValue] += 1;
            }

            // Push the individual rating details
            acc[UserID].ratings.push({
                _id: rating._id,
                RequisitionSysID: rating.RequisitionSysID,
                UserID: rating.UserID,
                RatingValue: rating.RatingValue,
                PatientName: rating.PatientName,
                PatientSysID: rating.PatientSysID,
                RatingDate: rating.RatingDate,
                Comments: rating.Comments
            });

            return acc;
        }, {});

        // Format response data
        const result = Object.entries(groupedRatings).map(([userID, data]) => {
            const { totalRatings, ratingSum, ratingCount, ratings } = data;
            const overallAverageRating = totalRatings > 0
                ? (ratingSum / totalRatings).toFixed(1)
                : "0.0";

            return {
                UserID: userID,
                totalRatings,
                overallAverageRating,
                ratingDetails: {
                    1: `${ratingCount[1]}/${totalRatings} (${((ratingCount[1] / totalRatings) * 100).toFixed(2)}%)`,
                    2: `${ratingCount[2]}/${totalRatings} (${((ratingCount[2] / totalRatings) * 100).toFixed(2)}%)`,
                    3: `${ratingCount[3]}/${totalRatings} (${((ratingCount[3] / totalRatings) * 100).toFixed(2)}%)`,
                    4: `${ratingCount[4]}/${totalRatings} (${((ratingCount[4] / totalRatings) * 100).toFixed(2)}%)`,
                    5: `${ratingCount[5]}/${totalRatings} (${((ratingCount[5] / totalRatings) * 100).toFixed(2)}%)`
                },
                ratings // Include the individual rating details
            };
        });

        // Send response
        res.json({
            success: true,
            message: UserID === "all"
                ? "Ratings fetched successfully for all providers."
                : `Ratings fetched successfully for UserID: ${UserID}.`,
            data: result
        });
    } catch (error) {
        // Handle errors
        res.status(500).json({
            success: false,
            error_code: 'DB_ERROR',
            error_description: 'Error fetching ratings: ' + error.message,
        });
    }
};
