var Trip = require('mongoose').model('Trip');
var Provider = require('mongoose').model('Provider');
var Trip_Location = require('mongoose').model('trip_location');
var Trip_Order = require('mongoose').model('trip_order');
var moment = require('moment-timezone');
var Settings = require('mongoose').model('Settings');
var excelbuilder = require('msexcel-builder');
var fs = require("fs");
var console = require('../controllers/console');
var utils = require('../controllers/utils');

exports.list = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        var j = 1;
        var array = [];
        if (req.body.page == undefined)
        {
            page = 0;
            next = 1;
            pre = 0;
        } else
        {
            page = req.body.page;
            next = parseInt(req.body.page) + 1;
            pre = req.body.page - 1;
        }

        if (req.body.search_item == undefined)
        {
            
            var request = req.path.split('/')[1];
            search_item = 'user_detail.first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'labRequisitionID'; //change key "unique_id" on 11-03-2022 by monika patel
            filter_start_date = '';
            filter_end_date = '';
            payment = 2;
            status = 1000;

        } else
        {
            var request = req.body.request;
            var item = req.body.search_item;
            var value = req.body.search_value;
            value = value.replace(/^\s+|\s+$/g, '');
            value = value.replace(/ +(?= )/g, '');
            value = new RegExp(value, 'i');

            var field = req.body.sort_item[0];
            var order = req.body.sort_item[1];

            sort_order = req.body.sort_item[1];
            sort_field = req.body.sort_item[0];
            search_item = req.body.search_item
            search_value = req.body.search_value;
            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;
            payment = Number(req.body.payment);
            status = Number(req.body.status);
            
        }
        
        var condition = {};
        var start_date = req.body.start_date;
        var end_date = req.body.end_date;

        if (request == 'today_requests')
        {
            // var date = new Date(Date.now());
            
            // date = date.setHours(0, 0, 0, 0);
            // startdate = new Date(date);

            //start new on 28-02-2022 by Monika Patel
                var date = new Date(new Date().toLocaleString('en-US', {
                        timeZone: setting_detail.timezone_for_display_date
                    }));

                var diff = new Date().getTime() - date.getTime();

                var startdate = new Date(new Date().getTime() - diff);
                startdate.setUTCHours(0,0,0,0);
                startdate.toISOString()
            //end 28-02-2022
            
            //commented below line n add new one on 07-02-2022 as some today's request not showing in list
            // enddate = new Date(Date.now());
            var enddiff = new Date().getTime() - date.getTime();

            var enddate = new Date(new Date().getTime() - enddiff);
            enddate.setUTCHours(23, 59, 59, 999);
            enddate.toISOString()
            
            // var condition = {$match: {'created_at': {$gte: startdate, $lt: enddate}}};//commented by Mayursinh zala on 5th Jan 2022 to display the scheduled trip 
            var condition = {$match: {'schedule_start_time': {$gte: startdate, $lte: enddate}}};
            // console.log("Todays Request")
        } else
        {
            // var condition = {$match: {}}; //commented by Mayursinh Zala on 08-12-2021 for showing completed trip status condition
            // var condition = {$match: {'is_provider_status': {$gte: 9}}};
            var condition  = {$match: {'status': {$gte: 11}, 'is_trip_cancelled' : {$eq: 0}}} // add cancel trip condition on 08-02-2022 by monika patel
        }        
        
        if (end_date == '' || end_date == undefined) {
            
            end_date = new Date();
            //add below code n add new on 28-02-2022 by Monika patel
            end_date.setUTCHours(23, 59, 59, 999);
            end_date.toISOString()
        } else {
            end_date = new Date(end_date);
            //add below code n add new on 28-02-2022 by Monika patel
            // end_date = end_date.setHours(23, 59, 59, 999);
            // end_date = new Date(end_date);
            end_date.setUTCHours(23, 59, 59, 999);
            end_date.toISOString()
        }

        if (start_date == '' || start_date == undefined) {
            start_date = new Date(end_date.getTime() - (6 * 24 * 60 * 60 * 1000));
            //add below code n add new on 28-02-2022 by Monika patel
            // start_date = start_date.setHours(0, 0, 0, 0);
            // start_date = new Date(start_date);
            start_date.setUTCHours(0,0,0,0);
            start_date.toISOString()
        } else {
            start_date = new Date(start_date);
            //add below code n add new on 28-02-2022 by Monika patel
            // start_date = start_date.setHours(0, 0, 0, 0);
            // start_date = new Date(start_date);
            start_date.setUTCHours(0,0,0,0);
            start_date.toISOString()
        }


        
        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
                
            }
            {
                allowDiskUse: true;
            }
        }
        

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

        var lookup2 = {
            $lookup:
                    {
                        from: "city_types",
                        localField: "service_type_id",
                        foreignField: "_id",
                        as: "city_type_detail"
                    }
        };

        var unwind2 = {$unwind: "$city_type_detail"};

        var lookup3 = {
            $lookup:
                    {
                        from: "types",
                        localField: "city_type_detail.typeid",
                        foreignField: "_id",
                        as: "type_detail"
                    }
        };

        var unwind3 = {$unwind: "$type_detail"};

        
        var lookup4 = {
            $lookup:
                    {
                        from: "trip_orders",
                        localField: "_id",
                        foreignField: "trip_id",
                        as: "order_detail"
                    }
        };

        var unwind4 = {$unwind: "$order_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');
        
        var search = {$match: {}};
        if (search_item == "user_detail.first_name")
        {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};

            var full_name = value.split(' ');
            if (typeof full_name[0] == 'undefined' || typeof full_name[1] == 'undefined') {

                query1['user_detail.first_name'] = {$regex: new RegExp(value, 'i')};
                query2['user_detail.last_name'] = {$regex: new RegExp(value, 'i')};

                search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['user_detail.last_name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(full_name[0], 'i')};
                query4['user_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(full_name[1], 'i')};
                query6['user_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};

                search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        } else if (search_item == "provider_detail.first_name")
        {
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

                search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['provider_detail.last_name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(full_name[0], 'i')};
                query4['provider_detail.last_name'] = {$regex: new RegExp(full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(full_name[1], 'i')};
                query6['provider_detail.last_name'] = {$regex: new RegExp(full_name[1], 'i')};

                search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        }
        else if (search_item == "order_detail.order.clinic.name")
        {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};
            // console.log("here in order_detail.order.clinic.name ")
            var clinic_full_name = value.split(' ');
            if (typeof clinic_full_name[0] == 'undefined' || typeof clinic_full_name[1] == 'undefined') {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['order_detail.order.clinic.name'] = {$regex: new RegExp(value, 'i')};

                search = {"$match": {$or: [query1, query2]}};
            } else {

                query1[search_item] = {$regex: new RegExp(value, 'i')};
                query2['order_detail.order.clinic.name'] = {$regex: new RegExp(value, 'i')};
                query3[search_item] = {$regex: new RegExp(clinic_full_name[0], 'i')};
                query4['order_detail.order.clinic.name'] = {$regex: new RegExp(clinic_full_name[0], 'i')};
                query5[search_item] = {$regex: new RegExp(clinic_full_name[1], 'i')};
                query6['order_detail.order.clinic.name'] = {$regex: new RegExp(clinic_full_name[1], 'i')};

                search = {"$match": {$or: [query1, query2, query3, query4, query5, query6]}};
            }
        }
        else if (search_item == "type_detail.typename")
        {
            var query1 = {};
            query1[search_item] = {$regex: new RegExp(value, 'i')};
            search = {"$match": {$or: [query1]}};

        }
        else if (search_item == "labRequisitionID")
        {
            // console.log("Here search for labRequisitionID ")            
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};
            query1[search_item] = {$regex: new RegExp(value, 'i')};
            query2['labRequisitionID'] = {$regex: new RegExp(value, 'i')};
            // var search = {"$match": query1};
            var search = {"$match": {$or: [query1, query2]}};

        }
        else
        {
            // console.log("Else Here search for labRequisitionID ")   
            var query1 = {};
            if (value != "")
            {
                query1[search_item] = {$regex: new RegExp(value, 'i')};
                var search = {"$match": query1};
            } else
            {
                search = {$match: {}};
            }
        }

        var payment_condition = {$match: {}};
        
        if (payment !== 2) {
            payment_condition['$match']['payment_mode'] = {$eq: payment}
        }
        
        var status_condition = {$match: {}};

        // if (status == 1) {
        //     status_condition['$match']['is_trip_completed'] = {$eq: 1}
        // } else if (status == 2) {
        //     status_condition['$match']['is_trip_cancelled'] = {$eq: 1}
        // } else if (status == 0) {
        //     status_condition['$match']['is_trip_cancelled'] = {$eq: 0}
        //     status_condition['$match']['is_trip_completed'] = {$eq: 0}
        // }
        // console.log(" search_item search_item search_item search_item :::: ")
        // console.log(search_item)
        if(status != 1000)
        {
            status_condition['$match']['status'] = {$eq: status}
            console.log(status_condition)
        }
        // var filter = {"$match": {'created_at': {$gte: start_date, $lt: end_date} } };
        var filter = {$match: {}};
        if(req.body.search_item=="created_at"){
            //change below condition on 11-03-2022  by Monika patel 
            // filter["$match"]['created_at'] = {$gte: start_date, $lte: end_date};
            filter["$match"]['lis_created_time'] = {$gte: start_date, $lte: end_date};
        }
        else if(req.body.search_item=="schedule_start_time"){
            filter["$match"]['schedule_start_time'] = {$gte: start_date, $lte: end_date};
        }
        else{
            
            
        }

        // add on 11-03-2022 by Monika Patel
        if((req.body.search_item=="created_at" || req.body.search_item=="schedule_start_time") && request == 'today_requests'){
            condition = {$match: {}};
        }
        //end
        
        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};

        var skip = {};
        skip["$skip"] = page * number_of_rec;
        
        var limit = {};
        limit["$limit"] = number_of_rec;
        // var trip_condition = {$match: {is_schedule_trip: {$eq: false}}}
        // var trip_condition = {$match: {is_schedule_trip: {$eq: false}}}
        // var trip_condition = {$match: {}};
        if (request == 'today_requests')
        {
            //change below condition on 10-03-2022 by monika as hardinp wants to show today's requition list with all status
            // var trip_condition = {$match: {status: {$gte: 4}}}
            var trip_condition = {$match: {}}
        }
        else{
            var trip_condition = {$match: {status: {$gte:9}}}
        }
        // console.log(condition)
        // console.log('request-----370-------'+request)
        // console.log(filter)
        Trip.aggregate([condition, trip_condition, payment_condition, status_condition, lookup, unwind,lookup1,unwind1, search, filter, count]).then((array) => { 
        // Trip.aggregate([condition, trip_condition, payment_condition, status_condition, lookup, unwind, lookup1, lookup2, unwind2, lookup3, unwind3,lookup4,unwind4, search, filter, count]).then((array) => { 
            console.log('total data count---------'+array.length)
            if (!array || array.length == 0)
            {
                array = [];
                res.render('request_list', {detail: array, request: request, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment,common_utils:utils});
            } else
            {
                var pages = Math.ceil(array[0].total / number_of_rec);
                Trip.aggregate([condition, trip_condition, payment_condition, status_condition, lookup, unwind, lookup1, lookup2, unwind2, lookup3, unwind3, unwind3,lookup4,unwind4, search, filter, sort, skip, limit]).then((array) => { 

                    res.render('request_list', {detail: array, timezone_for_display_date: setting_detail.timezone_for_display_date, request: request, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment,common_utils:utils});
                    delete message;
                }, (err) => {
                    utils.error_response(err, res)
                });
            }
        }, (err) => {
            utils.error_response(err, res)
        });
    } else {
        res.redirect('/admin');
    }
};


exports.genetare_request_excel = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        var j = 1;
        var array = [];

        var request = req.body.request;
        var item = req.body.search_item;
        var value = req.body.search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');
        value = new RegExp(value, 'i');

        var field = req.body.sort_item[0];
        var order = req.body.sort_item[1];

        sort_order = req.body.sort_item[1];
        sort_field = req.body.sort_item[0];
        search_item = req.body.search_item
        search_value = req.body.search_value;
        filter_start_date = req.body.start_date;
        filter_end_date = req.body.end_date;

        if (request == 'today_requests')
        {
            var date = new Date(Date.now());
            date = date.setHours(0, 0, 0, 0);
            startdate = new Date(date);
            enddate = new Date(Date.now());

            var start_date = '';
            var end_date = '';
            //change below condition on 11-03-2022  by Monika patel
            // var condition = {$match: {'created_at': {$gte: startdate, $lt: enddate}}};
            var condition = {$match: {'lis_created_time': {$gte: startdate, $lt: enddate}}};

        } else
        {
            var condition = {$match: {}};
        }

        if (req.body.start_date == '' || req.body.end_date == '') {
            if (req.body.start_date == '' && req.body.end_date == '') {
                end_date = new Date(Date.now());
                var start_date = new Date(end_date.getTime() - (6 * 24 * 60 * 60 * 1000));
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
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
            end_date = new Date(Date.now());
            var start_date = new Date(end_date.getTime() - (6 * 24 * 60 * 60 * 1000));
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
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

        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
            }
            {
                allowDiskUse: true;
            }
        }

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
                        localField: "confirmed_provider",
                        foreignField: "_id",
                        as: "provider_detail"
                    }
        };

        var unwind1 = {$unwind: "$provider_detail"};

        var lookup2 = {
            $lookup:
                    {
                        from: "city_types",
                        localField: "service_type_id",
                        foreignField: "_id",
                        as: "city_type_detail"
                    }
        };

        var unwind2 = {$unwind: "$city_type_detail"};

        var lookup3 = {
            $lookup:
                    {
                        from: "types",
                        localField: "city_type_detail.typeid",
                        foreignField: "_id",
                        as: "type_detail"
                    }
        };

        var unwind3 = {$unwind: "$type_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');
        
        if (search_item == "user_detail.first_name")
        {
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
        } else if (search_item == "provider_detail.first_name")
        {
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
        }
        else if (search_item == "labrequisitionid")
        {
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};


            query1[search_item] = {$regex: new RegExp(value, 'i')};
            query2['labRequisitionID'] = {$regex: new RegExp(value, 'i')};

            var search = {"$match": {$or: [query1, query2]}}; 
            
        } else
        {
            var query1 = {};
            if (value != "")
            {
                //value = Number(value)
                // query1[search_item] = {$eq: value};
                query1[search_item] = {$regex: new RegExp(value, 'i')};
                var search = {"$match": query1};
            } else
            {
                var search = {$match: {}};
            }
        }
        //change below condition on 09-03-2022  by Monika patel
        // var filter = {"$match": {'created_at': {$gte: start_date, $lt: end_date} }};
        var filter = {"$match": {'lis_created_time': {$gte: start_date, $lt: end_date} }};

        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var trip_condition = {$match: {is_schedule_trip: {$eq: false}}}
        Trip.aggregate([condition, trip_condition, lookup, unwind, lookup1, lookup2, unwind2, lookup3, unwind3, search, filter, sort]).then((array) => { 

            var date = new Date()
            var time = date.getTime()
            var workbook = excelbuilder.createWorkbook('./data/xlsheet', time + '_trip.xlsx');

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
                            var url = req.protocol + '://' + req.get('host') + "/xlsheet/" + time + "_trip.xlsx"
                            res.json(url);
                            setTimeout(function () {
                                fs.unlink('data/xlsheet/' + time + '_trip.xlsx', function (err, file) {
                                });
                            }, 10000)
                        }
                    });
                }

            })
        }, (err) => {
            utils.error_response(err, res)
        });

    } else {
        res.redirect('/admin');
    }

};


exports.requsest_status_ajax = function (req, res, next) {

    var array = req.body.trip_id_array;
    var i = 0;
    var tripDetailArray = [];
    Trip.find({_id: {$in: array}}).then((result) => { 

        result.forEach(function (trip_data) {

            var provider_id = '';
            if (trip_data.confirmed_provider != null)
            {
                provider_id = trip_data.confirmed_provider
            } else if (trip_data.current_provider != null)
            {
                provider_id = trip_data.current_provider
            }
            if (provider_id != "")
            {
                Provider.findById(provider_id).then((provider_detail) => { 
                    if(provider_detail){
                        i++;

                        tripDetailArray.push({trip_detail: trip_data, provider: provider_detail.first_name + ' ' + provider_detail.last_name});
                        if (result.length == i)
                        {
                            res.json(tripDetailArray)
                        }
                    }
                })
            } else
            {
                i++;

                tripDetailArray.push({trip_detail: trip_data, provider: ''});
                if (result.length == i)
                {
                    res.json(tripDetailArray)
                }
            }
        })
    })
}

exports.trip_map = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var user_name = req.body.u_name;
        var provider_name = req.body.pr_name;
        var query = {};
        query['tripID'] = id;
        Trip.findById(id).then((trips) => { 
           
            Trip_Location.findOne(query).then((locations) => { 
                var url = "https://maps.googleapis.com/maps/api/js?key=" + setting_detail.web_app_google_key + "&libraries=places&callback=initialize"
                if (!locations)
                {
                    res.render('trip_map', {'data': trips, timezone_for_display_date: setting_detail.timezone_for_display_date, 'url': url, 'user_name': user_name, 'provider_name': provider_name, 'moment': moment});
                } else
                {
                    res.render('trip_map', {'data': trips, timezone_for_display_date: setting_detail.timezone_for_display_date, 'url': url, 'trip_path_data': locations, 'user_name': user_name, 'provider_name': provider_name, 'moment': moment});
                }   
            });
            
        });
    } else {
        res.redirect('/admin');
    }
};
exports.trip_detail = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var user_name = req.body.u_name;
        var provider_name = req.body.pr_name;
        var query = {};
        query['tripID'] = id;
        /*
        var lookup1 = {
            $lookup:
                    {
                        from: "trip_orders",
                        localField: "_id",
                        foreignField: "trip_id",
                        as: "order_detail"
                    },
        };
        var unwind1 = {$unwind: "$order_detail"};
        */
        // Trip.findById(id)
        Trip.findOne({"_id":id})
            // .populate("trip_orders") // key to populate
            .then((trips) => { 
                // Trip
                trips.trip_id = {}
                Trip_Order.findOne({ "trip_id": trips._id }).then((trip_order_detail) => {
                    if(trip_order_detail){
                        trips.trip_id = trip_order_detail
                    }
                Trip_Location.findOne(query).then((locations) => { 
                    var url = "https://maps.googleapis.com/maps/api/js?key=" + setting_detail.web_app_google_key + "&libraries=places&callback=initialize"
                    if (!locations)
                    {
                        res.render('trip_detail', {'data': trips, timezone_for_display_date: setting_detail.timezone_for_display_date, 'url': url, 'user_name': user_name, 'provider_name': provider_name, 'moment': moment,common_utils:utils});
                    } else
                    {
                        res.render('trip_detail', {'data': trips, timezone_for_display_date: setting_detail.timezone_for_display_date, 'url': url, 'trip_path_data': locations, 'user_name': user_name, 'provider_name': provider_name, 'moment': moment,common_utils:utils});
                    }   
                });
            })
            
        });
    } else {
        res.redirect('/admin');
    }
};



//  REFUND AMOUNT //
//////////////////////////////
exports.trip_refund_amount = function (req, res, next) {
    
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;

        Trip.findOne({_id: req.body.id}).then((trip) => { 
           
            var stripe = require("stripe")(setting_detail.stripe_secret_key);
            var charge_id = "";
            if (trip.payment_transaction.length > 0) {
                charge_id = trip.payment_transaction[0].transaction_info.id;
            }

            stripe.refunds.create({
                charge: charge_id
            }, function (err, refund) {
                if (refund) {
                    trip.refund_amount = refund.amount / 100;
                    trip.is_amount_refund = true;
                    trip.save();
                    message = admin_messages.success_message_refund;
                    res.redirect('/requests');
                } else
                {
                    res.redirect('/requests');
                }
            });
               
        });

    } else {
        res.redirect('/admin');
    }
};

var mongoose = require('mongoose');
var Schema = new mongoose.Types.ObjectId;
exports.chat_history = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {

        var condition = {$match:{_id: Schema(req.body.id)}}
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
        var unwind1 = {$unwind: {
                path: "$provider_detail",
                preserveNullAndEmptyArrays: true
            }
        };

        Trip.aggregate([condition, lookup, unwind, lookup1, unwind1], function(error, trip_data){
            if(error || trip_data.length==0){
                res.redirect('/requests');
            } else {
                res.render('chat_history', {trip_data: trip_data[0]})
            }
        })
    } else {
        res.redirect('/admin');
    }

};
exports.trip_detail_old = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var id = req.body.id;
        var user_name = req.body.u_name;
        var provider_name = req.body.pr_name;
        var query = {};
        var url = "https://maps.googleapis.com/maps/api/js?key=" + setting_detail.web_app_google_key + "&libraries=places&callback=initialize"
        query['tripID'] = id;
        Trip_Order.findOne({ trip_id: id })
        .populate({
            path: 'trip_id',
            model: 'Trip'
        })
        .then(trips => {
            res.render('trip_detail', {'data': trips, timezone_for_display_date: setting_detail.timezone_for_display_date, 'url': url, 'user_name': user_name, 'provider_name': provider_name, 'moment': moment,common_utils:utils});
        });
    } else {
        res.redirect('/admin');
    }
};

/* request all trips */

exports.list_all = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        
        var j = 1;
        var array = [];
        var query = {};
        query['is_trip_created'] = 0;

        if (req.body.page == undefined)
        {
            page = 0;
            next = 1;
            pre = 0;
        } else
        {
            page = req.body.page;
            next = parseInt(req.body.page) + 1;
            pre = req.body.page - 1;
        }

        if (req.body.search_item == undefined)
        {

            search_item = 'user_detail.first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'labRequisitionID';
            filter_start_date = '';
            filter_end_date = '';

            var start_date = '';
            var end_date = '';
            status = 0;
        } else
        {
            var item = req.body.search_item;
            var value = req.body.search_value;
            value = value.replace(/^\s+|\s+$/g, '');
            value = value.replace(/ +(?= )/g, '');
            value = new RegExp(value, 'i');

            var field = req.body.sort_item[0];
            var order = req.body.sort_item[1];

            sort_order = req.body.sort_item[1];
            sort_field = req.body.sort_item[0];
            search_item = req.body.search_item
            search_value = req.body.search_value;
            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;

            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            status = Number(req.body.status);
        }
        var filter = {"$match": {}};

        if (req.body.start_date == '' || req.body.end_date == '') {
            
            if (req.body.start_date == '' && req.body.end_date == '') {
                
                // date = new Date(Date.now());
                // filter["$match"]['server_start_time_for_schedule'] = {$gte: date};
                // filter["$match"]['schedule_start_time'] = {$gte: date};
                var filter = {"$match": {}};
            } else if (req.body.start_date == '') {
                
                var start_date = req.body.end_date;
                var end_date = req.body.end_date;
                start_date = new Date(start_date);
                //add below code n add new on 28-02-2022 by Monika patel
                // start_date = start_date.setHours(0, 0, 0, 0);
                // start_date = new Date(start_date);
                start_date.setUTCHours(0,0,0,0);
                start_date.toISOString()
                end_date = new Date(end_date);
                // end_date = end_date.setHours(11, 59, 59, 999);
                // end_date = new Date(end_date);
                end_date.setUTCHours(23, 59, 59, 999);
                end_date.toISOString()
                filter["$match"]['server_start_time_for_schedule'] = {$gte: start_date, $lt: end_date};
                // filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            } else {
                
                var start_date = req.body.start_date;
                var end_date = req.body.start_date;
                start_date = new Date(start_date);
                //add below code n add new on 28-02-2022 by Monika patel
                // start_date = start_date.setHours(0, 0, 0, 0);
                // start_date = new Date(start_date);
                start_date.setUTCHours(0,0,0,0);
                start_date.toISOString()
                end_date = new Date(end_date);
                // end_date = end_date.setHours(11, 59, 59, 999);
                // end_date = new Date(end_date);
                end_date.setUTCHours(23, 59, 59, 999);
                end_date.toISOString()
                // filter["$match"]['server_start_time_for_schedule'] = {$gte: start_date, $lt: end_date};
                // filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {
            
            // date = new Date(Date.now());
            // filter["$match"]['server_start_time_for_schedule'] = {$gte: date};
            // filter["$match"]['schedule_start_time'] = {$gte: date};
        } else {
            
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            //add below code n add new on 28-02-2022 by Monika patel
            // start_date = start_date.setHours(0, 0, 0, 0);
            // start_date = new Date(start_date);
            start_date.setUTCHours(0,0,0,0);
            start_date.toISOString()
            end_date = new Date(end_date);
            // end_date = end_date.setHours(11, 59, 59, 999);
            // end_date = new Date(end_date);
            end_date.setUTCHours(23, 59, 59, 999);
            end_date.toISOString()
            // filter["$match"]['server_start_time_for_schedule'] = {$gte: start_date, $lt: end_date};
            // filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
        }

        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
            }
            {
                allowDiskUse: true;
            }
        }

        // var lookup = {
        //     $lookup:
        //             {
        //                 from: "users",
        //                 localField: "user_id",
        //                 foreignField: "_id",
        //                 as: "user_detail"
        //             },
        // };
        // var unwind = {$unwind: "$user_detail"};

        
        // var lookup1 = {
        //     $lookup:
        //             {
        //                 from: "trip_orders",
        //                 localField: "_id",
        //                 foreignField: "trip_id",
        //                 as: "order_detail"
        //             },
        // };
        // var unwind1 = {$unwind: "$order_detail"};

        // var lookup2 = {
        //     $lookup:
        //             {
        //                 from: "providers",
        //                 localField: "current_provider",
        //                 foreignField: "_id",
        //                 as: "provider_detail"
        //             }
        // };

        // var unwind2 = {$unwind: "$provider_detail"};

        
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

        var lookup2 = {
            $lookup:
                    {
                        from: "city_types",
                        localField: "service_type_id",
                        foreignField: "_id",
                        as: "city_type_detail"
                    }
        };

        var unwind2 = {$unwind: "$city_type_detail"};

        var lookup3 = {
            $lookup:
                    {
                        from: "types",
                        localField: "city_type_detail.typeid",
                        foreignField: "_id",
                        as: "type_detail"
                    }
        };

        var unwind3 = {$unwind: "$type_detail"};

        var lookup4 = {
            $lookup:
                    {
                        from: "trip_orders",
                        localField: "_id",
                        foreignField: "trip_id",
                        as: "order_detail"
                    }
        };

        var unwind4 = {$unwind: "$order_detail"};


        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');

        if (search_item == "user_detail.first_name")
        {
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
        } else
        {
            
            // console.log("else ALL REQUEST  search_item search_item search_item ")
            // var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
            // query1[search_item] = {$regex: new RegExp(value, 'i')};
            // var search = {"$match": query1};
            var query1 = {};
            var query2 = {}; 


            query1[search_item] = {$regex: new RegExp(value, 'i')};
            query2['labRequisitionID'] = {$regex: new RegExp(value, 'i')};

            var search = {"$match": {$or: [query1, query2]}}; 
        }

        var payment_condition = {$match: {}};
        
        if (payment !== 2) {
            payment_condition['$match']['payment_mode'] = {$eq: payment}
        }
        
        var status_condition = {$match: {}};

        // if (status == 1) {
        //     status_condition['$match']['is_trip_completed'] = {$eq: 1}
        // } else if (status == 2) {
        //     status_condition['$match']['is_trip_cancelled'] = {$eq: 1}
        // } else if (status == 0) {
        //     status_condition['$match']['is_trip_cancelled'] = {$eq: 0}
        //     status_condition['$match']['is_trip_completed'] = {$eq: 0}
        // }
        // console.log(" search_item search_item search_item search_item :::: ")
        // console.log(search_item)
        if(status != 1000)
        {
            status_condition['$match']['status'] = {$eq: status}
            console.log(status_condition)
        }
        
        // console.log("ALL REQUEST  search_item search_item search_item ")
        // console.log(search_item);
        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};

        var skip = {};
        skip["$skip"] = page * number_of_rec;

        var limit = {};
        limit["$limit"] = number_of_rec;

        // var condition = {$match: {'is_schedule_trip': {$eq: true}}};
        // var condition1 = {$match: {'is_trip_cancelled': {$eq: 0}}};
        // var condition2 = {$match: {'is_trip_completed': {$eq: 0}}};
        // var condition3 = {$match: {'is_trip_end': {$eq: 0}}};
        // var condition4 = {$match: {'provider_id': {$eq: null}}};
        // var condition5 = {$match: {'current_provider': {$eq: null}}};

        var condition = {$match: {}};
        var condition1 = {$match: {}};
        var condition2 = {$match: {}};
        var condition3 = {$match: {}};
        var condition4 = {$match: {}};
        var condition5 = {$match: {}};

        if(req.body.search_item=="created_at"){
            //change this condition value on 11-03-2022 By monika
            // filter["$match"]['created_at'] = {$gte: start_date, $lte: end_date};
            filter["$match"]['lis_created_time'] = {$gte: start_date, $lte: end_date};
        }
        else if(req.body.search_item=="schedule_start_time"){
            filter["$match"]['schedule_start_time'] = {$gte: start_date, $lte: end_date};
        }
        console.log('-------filter------')
        console.log(filter)
        // Trip.aggregate([condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind,lookup1, unwind1,lookup2, unwind2, search, filter, count]).then((array) => { 
            Trip.aggregate([status_condition, condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind,lookup1,unwind1, lookup2,unwind2, lookup3,unwind3,lookup4,unwind4, search, filter, count]).then((array) => { 
                if (!array || array.length == 0)
                {
                    array = [];
                    total_count = array[0].total;
                    res.render('all_request_list', {detail: array, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment,common_utils:utils, total_count: total_count});
                } else
                {
                console.log("array.length");
                total_count = array[0].total;
                console.log(array[0].total);
                var pages = Math.ceil(array[0].total / number_of_rec);
                Trip.aggregate([status_condition, condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind,lookup1,unwind1, lookup2,unwind2, lookup3,unwind3,lookup4,unwind4, search, filter, sort, skip, limit]).then((array) => { 
                    res.render('all_request_list', {detail: array, scheduled_request_pre_start_minute: setting_detail.scheduled_request_pre_start_minute, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment,common_utils:utils, total_count: total_count});
                    delete message;
                }, (err) => {
                    utils.error_response(err, res)
                });
            }
        }, (err) => {
            utils.error_response(err, res)
        });
    } else {
        res.redirect('/admin');
    }
    
};