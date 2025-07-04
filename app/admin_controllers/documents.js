var Document = require('mongoose').model('Document');
var Country = require('mongoose').model('Country');
var Provider = require('mongoose').model('Provider');
var Provider_Document = require('mongoose').model('Provider_Document');
var User = require('mongoose').model('User');
var User_Document = require('mongoose').model('User_Document');
var excelbuilder = require('msexcel-builder');
var fs = require("fs");
var moment = require('moment');
var console = require('../controllers/console');
var utils = require('../controllers/utils');
exports.list = function (req, res, next) {
    var array = [];
    var i = 0;

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
        search_item = 'title';
        search_value = '';
        sort_order = 1;
        sort_field = 'type';
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

    if (typeof req.session.userid != 'undefined') {

        var number_of_rec = 10;
        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');
        value = new RegExp(value, 'i');

        var lookup = {
            $lookup:
            {
                from: "countries",
                localField: "countryid",
                foreignField: "_id",
                as: "country_detail"
            }
        };

        var unwind = {$unwind: "$country_detail"};
        ///// For search string /////
        var search = {"$match": {}};
        search["$match"][search_item] = {$regex: value};
        //var search = { $match : { 'provider_detail.first_name' : { $regex: value } } };
        ////////////////////////////

        ///// For date filter /////
        var filter = {"$match": {}};
        filter["$match"]['created_at'] = {$gte: start_date, $lt: end_date};
        //var filter = { $match : { 'provider_trip_end_time' : { $gte: start_date, $lt: end_date } } };
        ///////////////////////////

        ///// For sort by field /////
        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);


        ///// For Count number of result /////
        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
        /////////////////////////////////////

        //// For skip number of result /////
        var skip = {};
        skip["$skip"] = page * number_of_rec


        ///// For limitation on result /////
        var limit = {};
        limit["$limit"] = number_of_rec


        Document.aggregate([lookup, unwind, search, filter, count]).then((array) => { 
            if (!array || array.length == 0) {
                array = [];
                res.render('documents_provider', {detail: array, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0});
                delete message;
            } else {
                var pages = Math.ceil(array[0].total / number_of_rec);

                Document.aggregate([lookup, unwind, search, filter, sort, skip, limit]).then((array) => { 

                    res.render('documents_provider', {detail: array, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre});
                    delete message;
                });
            }

        });

    } else {
        res.redirect('/admin');
    }
};


exports.generate_document_excel = function (req, res, next) {
    const ExcelJS = require('exceljs');
    const fs = require('fs');
    const path = require('path');
    
    var array = [];
    var i = 0;
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
        search_item = 'title';
        search_value = '';
        sort_order = 1;
        sort_field = 'type';
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

    if (typeof req.session.userid != 'undefined') {

        var number_of_rec = 10;
        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');
        value = new RegExp(value, 'i');

        var lookup = {
            $lookup:
            {
                from: "countries",
                localField: "countryid",
                foreignField: "_id",
                as: "country_detail"
            }
        };

        var unwind = {$unwind: "$country_detail"};
        ///// For search string /////
        var search = {"$match": {}};
        search["$match"][search_item] = {$regex: value};

        ///// For date filter /////
        var filter = {"$match": {}};
        filter["$match"]['created_at'] = {$gte: start_date, $lt: end_date};


        ///// For sort by field /////
        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);


        ///// For Count number of result /////
        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};
        /////////////////////////////////////

        //// For skip number of result /////
        var skip = {};
        skip["$skip"] = page * number_of_rec;


        ///// For limitation on result /////
        var limit = {};
        limit["$limit"] = number_of_rec;

        Document.aggregate([lookup, unwind, search, filter, sort]).then((array) => { 
            // Create a new workbook with ExcelJS
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
            
            // Add headers
            worksheet.columns = [
                { header: config_json.title_id, key: 'id', width: 15 },
                { header: config_json.title_name, key: 'name', width: 25 },
                { header: config_json.title_country, key: 'country', width: 20 },
                { header: config_json.title_type, key: 'type', width: 15 },
                { header: config_json.title_option, key: 'option', width: 15 }
            ];
            
            // Add styling to header row
            worksheet.getRow(1).font = { bold: true };
            
            // Add data rows
            array.forEach((data) => {
                // Determine type and option text values
                let typeText = data.type == 1 ? config_json.title_user : config_json.title_provider;
                let optionText = data.option == 1 ? config_json.title_mandatory : config_json.title_optional;
                
                worksheet.addRow({
                    id: data.unique_id,
                    name: data.title,
                    country: data.country_detail.countryname,
                    type: typeText,
                    option: optionText
                });
            });
            
            // Create directory if it doesn't exist
            const dir = './data/xlsheet';
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir, { recursive: true });
            }
            
            // Generate filename with timestamp
            const timestamp = Date.now();
            const filename = `${timestamp}_document.xlsx`;
            const filepath = path.join(dir, filename);
            
            // Write file to disk
            workbook.xlsx.writeFile(filepath)
                .then(() => {
                    const url = `${req.protocol}://${req.get('host')}/xlsheet/${filename}`;
                    res.json(url);
                    
                    // Delete file after 10 seconds
                    setTimeout(() => {
                        fs.unlink(filepath, (err) => {
                            if (err) console.error(`Error deleting file: ${err}`);
                        });
                    }, 10000);
                })
                .catch(err => {
                    console.error('Excel generation error:', err);
                    res.status(500).json({ error: 'Failed to generate Excel file' });
                });
        }).catch(err => {
            console.error('Database query error:', err);
            res.status(500).json({ error: 'Database query failed' });
        });
    } else {
        res.redirect('/admin');
    }
};


//////////////////////////////

//////////////////// FOR ADD DOCUMENT ////////////////////////

exports.add_document_form = function (req, res, next) {
    Document.find({}).then((document) => {
        Country.find({}).then((Country) => {
            res.render('add_document_form', {country_data: Country});
        });
    });
};


//// ADD DOCUMENT //// 
exports.add_document_detail = function (req, res, next) {
    var documentCount = 1;
    Document.findOne({}, function(error, document_count){

        if (document_count) {
            documentCount = document_count.unique_id + 1;
        }

        var Document1 = new Document({
            unique_id: documentCount,
            countryid: req.body.country,
            title: (req.body.title).trim(),
            type: req.body.type,
            option: req.body.option,
            is_unique_code: req.body.is_unique_code,
            is_expired_date: req.body.is_expired_date

        });
        Country.findOne({_id: Document1.countryid}).then((country_data) => {
            if (country_data) {
                var countryname = (country_data.countryname).trim();

                if (req.body.type == 1)
                {

                    Provider.find({country: countryname}).then((providers) => {

                        providers.forEach(function (provider) {

                            var providerdocument = new Provider_Document({
                                provider_id: provider._id,
                                document_id: Document1._id,
                                name: Document1.title,
                                option: Document1.option,
                                document_picture: "",
                                unique_code: "",
                                expired_date: null,
                                is_unique_code: Document1.is_unique_code,
                                is_expired_date: Document1.is_expired_date,
                                is_uploaded: 0
                            });


                            providerdocument.save().then(() => {
                            }, (err) => {
                                console.log(err);
                            });
                        });
                    });
                } else if (req.body.type == 0)
                {
                    User.find({country: countryname}).then((users) => {
                        users.forEach(function (user) {
                            var userdocument = new User_Document({
                                user_id: user._id,
                                document_id: Document1._id,
                                name: Document1.title,
                                option: Document1.option,
                                document_picture: "",
                                unique_code: "",
                                expired_date: null,
                                is_unique_code: Document1.is_unique_code,
                                is_expired_date: Document1.is_expired_date,
                                is_uploaded: 0
                            });

                            userdocument.save().then(() => {
                            }, (err) => {
                                console.log(err);
                            });
                        });
                    });
                }
            }
        });

        Document1.save().then(() => {
            res.redirect('/documents');
        }, (err) => {
            console.log(err);
        });
    }).sort({_id: -1}).limit(1);
};

//////////////////////////////////////////////////////////////

//////////////// FOR EDIT DOCUMENT /////////////////

exports.edit_document_form = function (req, res) {
    var id = req.body.id;
    Document.findById(id).then((document) => {
        
        Country.findById(document.countryid).then((Country) => {
            
            res.render('add_document_form', {country_data: Country, detail: document});
            
        });
        
    });
};

exports.update_document_detail = function (req, res) {
    var id = req.body.id;
    if (typeof req.body.is_unique_code == 'undefined') {
        req.body.is_unique_code = 'false';
    }
    if (typeof req.body.is_expired_date == 'undefined') {
        req.body.is_expired_date = 'false';
    }
    Document.findByIdAndUpdate(id, req.body).then((document) => {
     
        if (document.type == 1) {
            Provider.find({country_id: document.countryid}).then((providers) => {
                providers.forEach(function (provider) {
                    if (document.option == 1) {
                        provider.is_document_uploaded = 0;
                        provider.save().then(()=>{
                        }, (err) => {
                            console.log(err);
                        });
                    }
                    
                });
            });
        }
        User_Document.update({'document_id': id}, {name: req.body.title, is_expired_date: req.body.is_expired_date, is_unique_code: req.body.is_unique_code}, {multi: true}).then((user_documents) => { 

            Provider_Document.update({'document_id': id}, {name: req.body.title, is_expired_date: req.body.is_expired_date, is_unique_code: req.body.is_unique_code}, {multi: true}).then((provider_documents) => { 

                res.redirect('/documents');
            });
        });
        
    });
};

//////////////////////////////////////////////////