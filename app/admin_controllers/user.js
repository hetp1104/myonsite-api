var User = require('mongoose').model('User');
var Trip = require('mongoose').model('Trip');
var Provider = require('mongoose').model('Provider');
var moment = require("moment");
var utils = require('../controllers/utils');
var myTrips = require('../controllers/trip');
var allemails = require('../controllers/emails');
var Settings = require('mongoose').model('Settings');
var User_Document = require('mongoose').model('User_Document');
var Country = require('mongoose').model('Country');
var City = require('mongoose').model('City');
var moment = require('moment-timezone');
// var excelbuilder = require('msexcel-builder');
const excelbuilder = require('excel4node');
var fs = require("fs");
var console = require('../controllers/console');
var mongoose = require('mongoose');
 

exports.referral_report = async function (req, res, next) {
    if (typeof req.session.userid === 'undefined') {
        return res.redirect('/admin');
    }

    try {
        // Initialize filter date variables
        let filter_start_date = '';
        let filter_end_date = '';
        
        // Parse dates
        let start_date = req.body.start_date;
        let end_date = req.body.end_date;

        // Handle end date
        if (!end_date) {
            end_date = new Date();
        } else {
            filter_end_date = end_date;
            end_date = new Date(end_date);
            end_date.setHours(23, 59, 59, 999);
        }

        // Handle start date
        if (!start_date) {
            start_date = new Date(0);
            start_date.setHours(0, 0, 0, 0);
        } else {
            filter_start_date = start_date;
            start_date = new Date(start_date);
            start_date.setHours(0, 0, 0, 0);
        }

        // Build aggregation pipeline
        const pipeline = [
            {
                $lookup: {
                    from: "users",
                    localField: "referred_by",
                    foreignField: "_id",
                    as: "referred_user_detail"
                }
            },
            { $unwind: "$referred_user_detail" },
            {
                $match: {
                    'referred_user_detail.created_at': {
                        $gte: start_date,
                        $lt: end_date
                    }
                }
            },
            {
                $group: {
                    _id: '$referred_user_detail._id',
                    referred_user_count: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$referred_user_detail.created_at", start_date] },
                                        { $lt: ["$referred_user_detail.created_at", end_date] }
                                    ]
                                },
                                1,
                                0
                            ]
                        }
                    },
                    unique_id: { $first: '$referred_user_detail.unique_id' },
                    first_name: { $first: '$referred_user_detail.first_name' },
                    last_name: { $first: '$referred_user_detail.last_name' },
                    email: { $first: '$referred_user_detail.email' },
                    phone: { $first: '$referred_user_detail.phone' }
                }
            }
        ];

        // Execute aggregation
        const user_list = await User.aggregate(pipeline);

        // Filter users with referrals
        const new_user_list = user_list.filter(user => user.referred_user_count > 0);

        // Render the view
        res.render('referral_report', {
            user_list: new_user_list,
            user_id: req.body.user_id,
            moment: moment,
            timezone_for_display_date: setting_detail.timezone_for_display_date,
            filter_start_date: filter_start_date,  // Add these to the view context
            filter_end_date: filter_end_date       // Add these to the view context
        });

    } catch (error) {
        console.error('Error in referral report:', error);
        res.render('referral_report', { 
            user_list: [],
            filter_start_date: '',    // Provide defaults in error case
            filter_end_date: ''       // Provide defaults in error case
        });
    }
};

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

        var condition = {$match: {referred_by: new mongoose.Types.ObjectId(req.body.user_id)}};
        var query1 = {};
        query1['created_at'] = {$gte: start_date, $lt: end_date};
        var filter = {"$match": query1};

        User.aggregate([condition, filter])
        .exec() // Execute the aggregate operation and return a Promise
        .then((user_list) => {
            res.render('referral_history', { 
                user_list: user_list, 
                user_id: req.body.user_id, 
                moment: moment, 
                timezone_for_display_date: setting_detail.timezone_for_display_date 
            });
        })
        .catch((error) => {
            console.error("Error in aggregation:", error);
            res.render('referral_history', { user_list: [] });
        });

    } else {
        res.redirect('/admin');
    }
};

exports.list = async function (req, res, next) {
    try {
        if (typeof req.session.userid == 'undefined') {
            return res.redirect('/admin');
        }

        var query = {};
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        var options = {};
        var array = [];

        if (req.body.user_type == undefined) {
            user_type = req.path.split('/')[1];
            search_item = 'first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'Id';
            filter_start_date = '';
            filter_end_date = '';

            var start_date = '';
            var end_date = '';
        } else {
            user_type = req.body.user_type;
            var item = req.body.search_item;
            var value = req.body.search_value;
            var field = req.body.sort_item[0];
            var order = req.body.sort_item[1];

            sort_order = req.body.sort_item[1];
            sort_field = req.body.sort_item[0];
            search_item = item
            search_value = value;
            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;

            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
        }

        if (start_date != '' || end_date != '') {
            if (start_date == '') {
                start_date = new Date(end_date);
                start_date = start_date - 1;
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            } else if (end_date == '') {
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
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            }
        }

        if (user_type == 'users') {
            query['is_approved'] = 1;
        } else if (user_type == 'declined_users') {
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
        } else {
            if (item != undefined) {
                query[item] = new RegExp(value, 'i');
            }
        }

        const userscount = await User.countDocuments({
            $and: [{$or: [query1, query2, query3, query4, query5, query6]}, query]
        });

        if (userscount == 0) {
            return res.render('customers_list', {
                moment: moment,
                detail: array,
                currentpage: '',
                pages: '',
                next: '',
                pre: ''
            });
        }

        let page, next, pre;
        if (req.body.page == undefined) {
            page = 1;
            next = parseInt(page) + 1;
            pre = page - 1;
            
            // Fix: Check if unique_id is a valid field in your User schema
            // If not, use _id instead which is always available
            options = {
                sort: { _id: -1 }, // Changed from unique_id to _id
                page: page,
                limit: 10
            };
        } else {
            page = req.body.page;
            next = parseInt(req.body.page) + 1;
            pre = req.body.page - 1;
            
            // Fix: Verify that the field exists in your schema
            var sort = {};
            
            // Check if field is a valid field name before using it
            if (field && (field === '_id' || field === 'first_name' || field === 'last_name' || 
                field === 'email' || field === 'created_at' || field === 'updated_at')) {
                // Convert order to number if it's a string
                sort[field] = parseInt(order) || -1; // Default to -1 if parsing fails
            } else {
                // Default sort by _id if field is invalid
                sort['_id'] = -1;
            }
            
            options = {
                sort: sort,
                page: page,
                limit: 10
            };
        }

        // Add a try/catch specifically for the paginate operation
        try {
            const users = await User.paginate({
                $and: [{$or: [query1, query2, query3, query4, query5, query6]}, query]
            }, options);

            const settingData = await Settings.findOne({});
            const is_public_demo = settingData.is_public_demo;
            const timezone_for_display_date = settingData.timezone_for_display_date;

            if (users.docs.length <= 0) {
                return res.render('customers_list', {
                    is_public_demo,
                    timezone_for_display_date,
                    detail: [],
                    pages: users.pages,
                    currentpage: users.page,
                    next,
                    pre
                });
            }

            // Process each user sequentially
            for (let i = 0; i < users.docs.length; i++) {
                const user_data = users.docs[i];
                const id = user_data.referred_by;

                if (id != undefined) {
                    const user_val = await User.findOne({ _id: id });
                    user_data.referred_by = user_val ? `${user_val.first_name} ${user_val.last_name}` : "";
                } else {
                    user_data.referred_by = "";
                }
            }

            // Move the sorting logic outside the loop
            if (field === "total_request") {
                users.docs.sort((a, b) => {
                    const aVal = a.total_request || 0;
                    const bVal = b.total_request || 0;
                    return order == 1 ? aVal - bVal : bVal - aVal;
                });
            }

            return res.render('customers_list', {
                moment,
                is_public_demo,
                timezone_for_display_date,
                detail: users.docs,
                pages: users.pages,
                currentpage: users.page,
                next,
                pre
            });
        } catch (paginateError) {
            console.error('Pagination error:', paginateError);
            
            // Fallback to manual pagination if the paginate plugin fails
            const allUsers = await User.find({
                $and: [{$or: [query1, query2, query3, query4, query5, query6]}, query]
            }).sort({ _id: -1 });
            
            const limit = 10;
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const paginatedUsers = allUsers.slice(startIndex, endIndex);
            const totalPages = Math.ceil(allUsers.length / limit);
            
            return res.render('customers_list', {
                moment,
                is_public_demo: true,
                timezone_for_display_date: 'UTC',
                detail: paginatedUsers,
                pages: totalPages,
                currentpage: page,
                next,
                pre
            });
        }
    } catch (error) {
        console.error('Error in list function:', error);
        next(error);
    }
};

exports.generate_user_excel = async function (req, res, next) {
    if (typeof req.session.userid == 'undefined') {
        return res.redirect('/admin');
    }

    try {
        var query = {};
        var query1 = {};
        var query2 = {};
        var query3 = {};
        var query4 = {};
        var query5 = {};
        var query6 = {};
        
        var user_type = req.body.user_type;
        var item = req.body.search_item;
        var value = req.body.search_value;
        var field = req.body.sort_item && req.body.sort_item[0] ? req.body.sort_item[0] : '_id';
        var order = req.body.sort_item && req.body.sort_item[1] ? parseInt(req.body.sort_item[1]) : -1;
        
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        // Your existing date filtering code
        if (start_date != '' || end_date != '') {
            // ... (keep your existing date processing code)
            if (start_date == '') {
                start_date = new Date(end_date);
                start_date = start_date - 1;
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            } else if (end_date == '') {
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
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                query['created_at'] = {$gte: start_date, $lt: end_date};
            }
        }

        // Your existing user type filtering
        if (user_type == 'users') {
            query['is_approved'] = 1;
        } else if (user_type == 'declined_users') {
            query['is_approved'] = 0;
        }

        // Your existing name search processing
        if (item == 'first_name') {
            // ... (keep your existing name search code)
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
        } else {
            if (item != undefined) {
                query[item] = new RegExp(value, 'i');
            }
        }

        // Get users data
        const users = await User.find({
            $and: [{
                $or: [query1, query2, query3, query4, query5, query6]
            }, query]
        }).exec();

        // Get settings data
        const settingData = await Settings.findOne({}).exec();
        const { timezone_for_display_date } = settingData || { timezone_for_display_date: 'UTC' };
        
        // Process each user and update referred_by
        for (let i = 0; i < users.length; i++) {
            const user_data = users[i];
            const id = user_data.referred_by;
            
            if (id) {
                const user_val = await User.findOne({ _id: id }).exec();
                user_data.referred_by = user_val 
                    ? `${user_val.first_name} ${user_val.last_name}`
                    : "";
            } else {
                user_data.referred_by = "";
            }
        }

        // Sort if needed
        if (field === "total_request") {
            users.sort((a, b) => {
                return order === 1 ? 
                    (a.total_request || 0) - (b.total_request || 0) : 
                    (b.total_request || 0) - (a.total_request || 0);
            });
        } else if (field && users[0] && users[0][field] !== undefined) {
            // Sort by other fields if they exist
            users.sort((a, b) => {
                const aVal = a[field];
                const bVal = b[field];
                
                if (typeof aVal === 'string' && typeof bVal === 'string') {
                    return order === 1 ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
                } else {
                    return order === 1 ? aVal - bVal : bVal - aVal;
                }
            });
        }
        
        // Generate Excel with excel4node library
        const timestamp = Date.now();
        const filename = `${timestamp}_user.xlsx`;
        
        // Using excel4node syntax
        const workbook = new excelbuilder.Workbook();
        const worksheet = workbook.addWorksheet('Users');
        
        // Add styling
        const headerStyle = workbook.createStyle({
            font: {
                bold: true,
                color: '#000000',
                size: 12
            },
            fill: {
                type: 'pattern',
                patternType: 'solid',
                fgColor: '#EEEEEE'
            }
        });
        
        const dataStyle = workbook.createStyle({
            font: {
                color: '#333333',
                size: 11
            }
        });
        
        // Set headers
        worksheet.cell(1, 1).string(config_json.title_id || 'ID').style(headerStyle);
        worksheet.cell(1, 2).string(config_json.title_name || 'Name').style(headerStyle);
        worksheet.cell(1, 3).string(config_json.title_email || 'Email').style(headerStyle);
        worksheet.cell(1, 4).string(config_json.title_phone || 'Phone').style(headerStyle);
        worksheet.cell(1, 5).string(config_json.title_total_request || 'Total Requests').style(headerStyle);
        worksheet.cell(1, 6).string(config_json.title_completed_request || 'Completed Requests').style(headerStyle);
        worksheet.cell(1, 7).string(config_json.title_cancelled_request || 'Cancelled Requests').style(headerStyle);
        worksheet.cell(1, 8).string(config_json.title_city || 'City').style(headerStyle);
        worksheet.cell(1, 9).string(config_json.title_referral_code || 'Referral Code').style(headerStyle);
        worksheet.cell(1, 10).string(config_json.title_wallet || 'Wallet').style(headerStyle);
        worksheet.cell(1, 11).string(config_json.title_app_version || 'App Version').style(headerStyle);
        worksheet.cell(1, 12).string(config_json.title_registered_date || 'Registered Date').style(headerStyle);
        
        // Add data rows
        users.forEach((data, index) => {
            const rowIndex = index + 2;
            
            worksheet.cell(rowIndex, 1).string(String(data.unique_id || '')).style(dataStyle);
            worksheet.cell(rowIndex, 2).string(`${data.first_name || ''} ${data.last_name || ''}`).style(dataStyle);
            worksheet.cell(rowIndex, 3).string(data.email || '').style(dataStyle);
            worksheet.cell(rowIndex, 4).string(`${data.country_phone_code || ''} ${data.phone || ''}`).style(dataStyle);
            worksheet.cell(rowIndex, 5).number(data.total_request || 0).style(dataStyle);
            worksheet.cell(rowIndex, 6).number(data.completed_request || 0).style(dataStyle);
            worksheet.cell(rowIndex, 7).number(data.cancelled_request || 0).style(dataStyle);
            worksheet.cell(rowIndex, 8).string(data.city || '').style(dataStyle);
            worksheet.cell(rowIndex, 9).string(data.referral_code || '').style(dataStyle);
            worksheet.cell(rowIndex, 10).number(parseFloat(data.wallet || 0)).style(dataStyle);
            
            const appVersion = data.device_type ? `${data.device_type}-${data.app_version || ''}` : '';
            worksheet.cell(rowIndex, 11).string(appVersion).style(dataStyle);
            
            const dateStr = data.created_at ? 
                moment(data.created_at).tz(timezone_for_display_date).format("DD MMM 'YY hh:mm a") : '';
            worksheet.cell(rowIndex, 12).string(dateStr).style(dataStyle);
        });
        
        // Make sure directory exists
        const fs = require('fs');
        const path = require('path');
        const xlDir = path.join(__dirname, '../data/xlsheet');
        if (!fs.existsSync(xlDir)) {
            fs.mkdirSync(xlDir, { recursive: true });
        }
        
        // Save the file
        const filePath = path.join(xlDir, filename);
        workbook.write(filePath, function(err) {
            if (err) {
                console.error('Excel generation error:', err);
                return res.status(500).json({ error: 'Error generating Excel file' });
            }
            
            const url = `${req.protocol}://${req.get('host')}/xlsheet/${filename}`;
            
            // Set timeout to delete the file after 30 seconds
            setTimeout(function() {
                fs.unlink(filePath, function(err) {
                    if (err) console.error('Error deleting Excel file:', err);
                });
            }, 30000);
            
            res.json(url);
        });
    } catch (error) {
        console.error('Error generating users report:', error);
        res.status(500).send('Error generating report');
    }
};

async function generateExcel(req, array, timezone) {
    // Create a folder for excel files if it doesn't exist
    const xlDir = path.join(__dirname, '../data/xlsheet');
    if (!fs.existsSync(xlDir)) {
        fs.mkdirSync(xlDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `${timestamp}_user.xlsx`;
    const filepath = path.join(xlDir, filename);
    
    // Create a new workbook and add a worksheet
    const workbook = new excel.Workbook();
    const worksheet = workbook.addWorksheet('Users');
    
    // Add styles
    const headerStyle = workbook.createStyle({
        font: {
            bold: true,
            color: '#000000',
            size: 12
        },
        fill: {
            type: 'pattern',
            patternType: 'solid',
            fgColor: '#EEEEEE'
        }
    });
    
    const dataStyle = workbook.createStyle({
        font: {
            color: '#333333',
            size: 11
        }
    });
    
    // Set headers
    const headers = [
        'ID', 'Name', 'Email', 'Phone', 
        'Total Requests', 'Completed Requests', 'Cancelled Requests',
        'City', 'Referral Code', 'Wallet', 'App Version', 'Registered Date'
    ];
    
    headers.forEach((header, index) => {
        worksheet.cell(1, index + 1).string(header).style(headerStyle);
    });
    
    // Add data rows
    array.forEach((data, index) => {
        const rowIndex = index + 2;
        
        worksheet.cell(rowIndex, 1).string(String(data.unique_id || '')).style(dataStyle);
        worksheet.cell(rowIndex, 2).string(`${data.first_name || ''} ${data.last_name || ''}`).style(dataStyle);
        worksheet.cell(rowIndex, 3).string(data.email || '').style(dataStyle);
        worksheet.cell(rowIndex, 4).string(`${data.country_phone_code || ''} ${data.phone || ''}`).style(dataStyle);
        worksheet.cell(rowIndex, 5).number(data.total_request || 0).style(dataStyle);
        worksheet.cell(rowIndex, 6).number(data.completed_request || 0).style(dataStyle);
        worksheet.cell(rowIndex, 7).number(data.cancelled_request || 0).style(dataStyle);
        worksheet.cell(rowIndex, 8).string(data.city || '').style(dataStyle);
        worksheet.cell(rowIndex, 9).string(data.referral_code || '').style(dataStyle);
        worksheet.cell(rowIndex, 10).number(parseFloat(data.wallet || 0)).style(dataStyle);
        worksheet.cell(rowIndex, 11).string(`${data.device_type || ''}-${data.app_version || ''}`).style(dataStyle);
        
        const dateStr = data.created_at ? 
            moment(data.created_at).tz(timezone).format("DD MMM 'YY hh:mm a") : '';
        worksheet.cell(rowIndex, 12).string(dateStr).style(dataStyle);
    });
    
    // Write to file
    return new Promise((resolve, reject) => {
        workbook.write(filepath, (err) => {
            if (err) {
                console.error('Excel write error:', err);
                reject(err);
                return;
            }
            
            const url = `${req.protocol}://${req.get('host')}/xlsheet/${filename}`;
            
            // Set timeout to delete the file after 10 seconds
            setTimeout(() => {
                fs.unlink(filepath, (err) => {
                    if (err) console.error('Error deleting excel file:', err);
                });
            }, 30000); // Increased timeout to 30 seconds
            
            resolve(url);
        });
    });
}

//UPDATED BY RAJ SAHOO

exports.edit = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        query = {};
        query['_id'] = id;

        User.find(query)
            .then((users) => {
                if (!users || users.length === 0) {
                    throw new Error('User not found');
                }
                
                return Promise.all([
                    users,
                    Country.findOne({"countryname": users[0].country}),
                    City.find({"countryname": users[0].country, isBusiness: config_json.YES}),
                    Settings.findOne({})
                ]);
            })
            .then(([users, country_detail, city_list, settingData]) => {
                var phone_number_length = 12;
                var phone_number_min_length = 8;
                
                if (country_detail) {
                    phone_number_length = country_detail.phone_number_length;
                    phone_number_min_length = country_detail.phone_number_min_length;
                }
                
                var is_public_demo = settingData ? settingData.is_public_demo : false;
                
                res.render('customer_detail_edit', {
                    city_list: city_list,
                    is_public_demo: is_public_demo,
                    phone_number_min_length: phone_number_min_length,
                    phone_number_length: phone_number_length,
                    detail: users
                });
                
                delete message;
            })
            .catch((err) => {
                console.error("Error in user edit:", err);
                res.status(500).send("Error retrieving user details");
            });
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO
exports.update = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var gender = req.body.gender;
        if (gender != undefined) {
            req.body.gender = ((gender).trim()).toLowerCase();
        }
        if(req.body.password){
            var crypto = require('crypto');
            var hash = crypto.createHash('md5').update(req.body.password).digest('hex');
            req.body.password = hash;
        }
        
        // First check if email is already in use
        User.findOne({email: req.body.email, _id: {$ne: id}})
            .then((user_detail) => {
                if(user_detail){
                    message = admin_messages.error_message_email_already_used;
                    exports.edit(req, res, next);
                    return Promise.reject('email_in_use'); // Skip next steps
                }
                
                // Then check if phone is already in use
                return User.findOne({
                    phone: req.body.phone, 
                    country_phone_code: req.body.country_phone_code, 
                    _id: {$ne: id}
                });
            })
            .then((user_detail) => {
                if(user_detail){
                    message = admin_messages.error_message_mobile_no_already_used;
                    exports.edit(req, res, next);
                    return Promise.reject('phone_in_use'); // Skip next steps
                }
                
                // Update the user
                return User.findByIdAndUpdate(id, req.body, {new: true});
            })
            .then(() => {
                message = admin_messages.success_message_user_update;
                res.redirect('/users');
            })
            .catch((err) => {
                if(err !== 'email_in_use' && err !== 'phone_in_use') {
                    console.error("Error updating user:", err);
                    message = admin_messages.error_message_something_went_wrong;
                    res.redirect('/users');
                }
            });
    } else {
        res.redirect('/admin');
    }
};

//UPDATED BY RAJ SAHOO
exports.history = async function (req, res, next) {
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
            search_item = 'provider_detail.first_name';
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

        //var unwind1 = {$unwind: "$provider_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');

        if (search_item == "provider_detail.first_name") {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['provider_detail.last_name'] = {$regex: new RegExp(value, 'i')};

                var search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['provider_detail.last_name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(full_name[0], 'i')};
                query4['provider_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(full_name[1], 'i')};
                query6['provider_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};

                var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        } else {

            var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }

        //query1['provider_trip_start_time'] = {$gte: start_date, $lt: end_date};
        //query2['provider_trip_end_time'] = {$gte: start_date, $lt: end_date};
        //var filter = {"$match": {$or: [query1, query2]}};

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
         
        var condition = {"$match": {'user_id': {$eq: new mongoose.Types.ObjectId(id)}}};
        var trip_condition = {"$match": {$or: [{is_trip_completed: 1}, {is_trip_cancelled: 1}, {is_trip_cancelled_by_user: 1}]}};

        try {
            const countResult = await Trip.aggregate([condition, trip_condition, lookup, unwind, lookup1, search, filter, count]);
            
            if (countResult.length == 0) {
                res.render('customers_history', {detail: [], 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment, id: id});
            } else {
                var pages = Math.ceil(countResult[0].total / number_of_rec);
                const tripResult = await Trip.aggregate([condition, trip_condition, lookup, unwind, lookup1, search, filter, sort, skip, limit]);
                
                res.render('customers_history', {detail: tripResult, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment, id: id});
            }
        } catch (err) {
            next(err);
        }
    } else {
        res.redirect('/admin');
    }
};


// Updated by Raj 6 March
exports.profile_is_approved = function (req, res, next) {
    if (typeof req.session.userid == 'undefined') {
        return res.redirect('/admin');
    }

    const id = req.body.id;
    const is_approved = req.body.is_approved;
    const change = is_approved == 0 ? 1 : 0;
    const user_type = req.body.user_type || 'users';  // Default value if user_type is undefined
    
    // Process approval
    if (change == 1) { // Approving the user
        User.findByIdAndUpdate(id, {is_approved: change}, {new: true})
            .then((customer) => {
                if (!customer) {
                    throw new Error('User not found');
                }
                
                const device_token = customer.device_token;
                const device_type = customer.device_type;
                
                // Send notification email if enabled
                return Settings.findOne({})
                    .then((settingData) => {
                        if (settingData && settingData.email_notification == true) {
                            console.log("mail sent Approved user");
                            allemails.sendUserApprovedEmail(req, customer);
                        }
                        
                        // Send push notification
                        utils.sendPushNotification(
                            constant_json.USER_UNIQUE_NUMBER, 
                            device_type, 
                            device_token, 
                            push_messages.PUSH_CODE_FOR_USER_APPROVED, 
                            constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                        );
                        
                        // Store success message in session
                        req.session.success = admin_messages.success_message_user_approved;
                        return res.redirect('/' + user_type);
                    });
            })
            .catch((err) => {
                console.error("Error approving user:", err);
                req.session.error = "Error approving user: " + (err.message || "Unknown error");
                return res.redirect('/' + user_type);
            });
    } else { // Declining the user
        console.log("Decline process started");
        
        // Check if user has ongoing trips
        Trip.findOne({
            user_id: id,
            is_trip_completed: 0, 
            is_trip_cancelled: 0
        })
        .then((trip_data) => {
            if (trip_data && trip_data.is_provider_status > 4) {
                // Trip is running, can't decline
                req.session.error = admin_messages.error_trip_running;
                return res.redirect('/' + user_type);
            }
            
            // Either no trip or trip can be cancelled
            return User.findByIdAndUpdate(id, {is_approved: change}, {new: true})
                .then((customer) => {
                    if (!customer) {
                        throw new Error('User not found');
                    }
                    
                    const device_token = customer.device_token;
                    const device_type = customer.device_type;
                    
                    // Send decline email
                    allemails.sendUserDeclineEmail(req, customer);
                    
                    // Send push notification
                    utils.sendPushNotification(
                        constant_json.USER_UNIQUE_NUMBER, 
                        device_type, 
                        device_token, 
                        push_messages.PUSH_CODE_FOR_USER_DECLINED, 
                        constant_json.PUSH_NOTIFICATION_SOUND_FILE_IN_IOS
                    );
                    
                    // If trip exists, set up trip cancellation
                    if (trip_data) {
                        const tripCancelData = {
                            user_id: String(customer._id),
                            token: customer.token,
                            trip_id: String(trip_data._id),
                            cancel_reason: "Declined By Admin",
                            type: "Admin"
                        };
                        
                        // Uncomment this if you need to cancel the trip
                        // myTrips.trip_cancelbyuser(tripCancelData);
                    }
                    
                    req.session.success = admin_messages.success_message_user_declined;
                    return res.redirect('/' + user_type);
                });
        })
        .catch((err) => {
            console.error("Error during user decline process:", err);
            req.session.error = "Error: " + (err.message || "Unknown error during user decline");
            return res.redirect('/' + user_type);
        });
    }
};
exports.add_wallet_amount = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        User.findById(req.body.user_id)
            .then((user_data) => {
                if (user_data) {
                    var wallet = utils.precisionRoundTwo(Number(req.body.wallet));
                    var status = constant_json.DEDUCT_WALLET_AMOUNT;
                    if (wallet > 0) {
                        status = constant_json.ADD_WALLET_AMOUNT;
                    }

                    var total_wallet_amount = utils.addWalletHistory(
                        constant_json.USER_UNIQUE_NUMBER,
                        user_data.unique_id,
                        user_data._id,
                        user_data.country_id,
                        user_data.wallet_currency_code,
                        user_data.wallet_currency_code,
                        1,
                        Math.abs(wallet),
                        user_data.wallet,
                        status,
                        constant_json.ADDED_BY_ADMIN,
                        "By Admin"
                    );

                    user_data.wallet = total_wallet_amount;
                    return user_data.save()
                        .then(() => {
                            res.json({
                                success: true, 
                                wallet: user_data.wallet, 
                                message: admin_messages.success_message_add_wallet
                            });
                        });
                } else {
                    res.json({
                        success: false, 
                        error_code: admin_messages.errpr_message_add_wallet_failed
                    });
                }
            })
            .catch((err) => {
                console.error("Error adding wallet amount:", err);
                res.json({
                    success: false, 
                    error_code: admin_messages.errpr_message_add_wallet_failed
                });
            });
    } else {
        res.json({
            success: false, 
            error_code: admin_messages.errpr_message_add_wallet_failed
        });
    }
};

exports.user_documents = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var query = {};
        query['user_id'] = id;

        User_Document.find(query)
            .then((array) => {
                res.render('user_documents', {
                    detail: array, 
                    moment: moment, 
                    id: id
                });
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send("Error retrieving documents");
            });
    } else {
        res.redirect('/admin');
    }
};

// generate_user_history_excel
exports.generate_user_history_excel = function (req, res, next) {

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
            search_item = 'provider_detail.first_name';
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

        //var unwind1 = {$unwind: "$provider_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');

        if (search_item == "provider_detail.first_name") {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['provider_detail.last_name'] = {$regex: new RegExp(value, 'i')};

                var search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['provider_detail.last_name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(full_name[0], 'i')};
                query4['provider_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(full_name[1], 'i')};
                query6['provider_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};

                var search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        } else {

            var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }

        //query1['provider_trip_start_time'] = {$gte: start_date, $lt: end_date};
        //query2['provider_trip_end_time'] = {$gte: start_date, $lt: end_date};
        //var filter = {"$match": {$or: [query1, query2]}};

        query1['provider_trip_end_time'] = {$gte: start_date, $lt: end_date};
        var filter = {"$match": query1};

        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        

        var mongoose = require('mongoose');
         
        var condition = {"$match": {'user_id': {$eq: new mongoose.Types.ObjectId(id)}}};
        var trip_condition = {"$match": {$or: [{is_trip_completed: 1}, {is_trip_cancelled: 1}, {is_trip_cancelled_by_user: 1}]}};




        Trip.aggregate([condition, trip_condition,lookup, unwind, lookup1, search, filter, sort], function (err, array) {

            var date = new Date()
            var time = date.getTime()
            var workbook = excelbuilder.createWorkbook('./data/xlsheet', time + '_user_history.xlsx');

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
                            var url = req.protocol + '://' + req.get('host') + "/xlsheet/" + time + "_user_history.xlsx"
                            res.json(url);
                            setTimeout(function () {
                                fs.unlink('data/xlsheet/' + time + '_user_history.xlsx', function (err, file) {
                                });
                            }, 10000)
                        }
                    });
                }

            })

        });

    } else {
        res.redirect('/admin');
    }

};

/*** 
 * Update patient/user city/country and Timezone of all trips 
 * Crated By: Mayursinh Zala
 * Created Date: 30-12-2021
 * ***/

async function updateuserpatientdetails(req_data) {
    //updtate patient/user 
    //{'_id':"6135bdcf33fb745b2e8c107e"}
    await User.find().then((userPatients) => {
        
        userPatients.forEach(async function (userPatient) {
            
            console.log(userPatient.address);
            var text = userPatient.address;
            
//{'_id':ObjectId('6135bdcf33fb745b2e8c107e')}
//{ longitude: null,  latitude: null,  zip: '90041',  countrycode: 'USA',  country: 'USA',  statecode: 'CA',  state: 'California',  citysysid: 15517,  citycode: 'LosAngeles',  city: 'Los Angeles',  street: '1536 YOSEMITE DR' }
            var checkLengthofCity = ((text.indexOf("street:")-11) - (text.indexOf("city:")))
            
            console.log("checkLengthofCity");
            console.log(checkLengthofCity);
            var checkSubStringCity = await findsubstr(text, text.indexOf("city:")+7, checkLengthofCity-1);
            console.log("checkSubStringCity : "+checkSubStringCity)
            // console.log("checkLengthofCity : "+checkLengthofCity)
            var checkLengthofCountry = ((text.indexOf("statecode:")-15) - (text.indexOf("country:")))
            var checkSubStringCountry = await findsubstr(text, text.indexOf("country:")+10, checkLengthofCountry);
            // console.log("checkSubStringCountry : "+checkSubStringCountry)

            var checkLengthofCityCode = ((text.indexOf("city:")-14) - (text.indexOf("citycode:")))
            var checkSubStringCityCode = await findsubstr(text, text.indexOf("citycode:")+11, checkLengthofCityCode-2);
            console.log("checkLengthofCityCode : "+checkLengthofCityCode)
            console.log("checkSubStringCityCode ::: "+checkSubStringCityCode)
// return false;
            // text.indexOf("welcome")
            // const ptinetObj = JSON.parse(userPatient.address);
            // console.log("ptinetObj is printed below ")
            // console.log(ptinetObj)
            // console.log("ptinetObj city is printed below ")
            // console.log(ptinetObj.city)

            User.findOneAndUpdate({ '_id': userPatient._id}, { $set: { country: checkSubStringCountry,city:checkSubStringCity } }, { new: true }).then(updatedProviderDetails => {
                console.log("------------------------------------ updatedPatientDetails data ------------------------------------ 934");
                console.log(updatedProviderDetails);
                
            }).catch((error) => {
                console.log("------------------------------------ findOneAndUpdate error ------------------------------------ 944");
                console.log(error);
            }); 

           // trip_order.phlebotomistid = req.body.provider_id;
        //    userPatient.country = checkSubStringCountry//userPatient.address.country
        //    userPatient.city = checkSubStringCity
        //    userPatient.save();
        //    return false;
          //update user trip data 
         await Trip.find({"user_id":userPatient._id}).then(async (userTrips) => {
            userTrips.forEach(async function (userTrip) {
                console.log(" timezone before update")
                console.log(userTrip.timezone)
                // console.log(" address ")
                // console.log(userPatient.address)
                if(userPatient.address){
                   await City.find({"cityname":checkSubStringCity}).then( async (userTripCitys) => {
                        console.log(" city userTripCitys  ")
                        console.log(userTripCitys)
                        if(userTripCitys.length > 0){

                            console.log(" if userTripCitys  exists ")
                            userTripCitys.forEach(async function (userTripCity) {
                                if(userTripCity.timezone){
                                    console.log(" userTripCity  ",userTripCity.timezone)
                                    userTrip.timezone = userTripCity.timezone
                                    userTrip.save();
                                    console.log(userTrip.timezone)
                                    console.log(" timezone after update")
                                }
                            })
                    }
                    else{
                        console.log(" city name not exists ",userPatient.address.city)
                        var ccupObj = {city:checkSubStringCity,country:checkSubStringCountry,citycode:checkSubStringCityCode};
                        var tripOrderpatientCity = create_city_userpatinet(ccupObj);
                        
                       
                        console.log(" timezone after update")
                        
                    }


                    })
                }
            })
          })
       });
   });   
}
async function create_city_userpatinet(req_data) {
    console.log("req_data.city create_city_userpatinet");    
    // console.log(req_data);
    if(req_data.city!=""){

        
    await City.find({"cityname":req_data.city}).then( async (checkTripCitys) => {
        console.log(checkTripCitys);
        if(checkTripCitys.length){

        }
    }); 
    Country.findOne({_id: "5d11e21695bbc03595c12134"}, function (err, c_data) {
        array=[]
        console.log("in create city address of user is ")
        console.log(req_data.city)
        var countryname = (c_data.countryname).trim();
                var add_city = new City({
                    countryid: "5d11e21695bbc03595c12134",
                    city_locations: array,
                    countryname: countryname,
                    cityname: (req_data.city),
                    full_cityname: (req_data.city),
                    citycode: req_data.citycode,
                    timezone: "America/New_York",
                // destination_city: req.body.destination_city
            });

            add_city.save().then((citySaves) => { 
                console.log(" citySaves citySaves add ")
                // console.log(citySaves)
            }, (err) => {
                console.log(err)
                console.log(" errerr err ")

            });
                
            });
    }
}
async function findsubstr(str, index, length) {
    // console.log("length of string"+ length)
    var substring = str.substr(index, length);
    
    //  console.log("findsubstr :::: ") 
    console.log(substring);
    return substring
}
  
