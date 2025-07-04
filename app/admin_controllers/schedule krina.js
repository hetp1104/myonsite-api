var utils = require('../controllers/utils');
var Trip = require('mongoose').model('Trip');
var Settings = require('mongoose').model('Settings');
var User = require('mongoose').model('User');
var moment = require("moment");
var fs = require("fs");
var excelbuilder = require('msexcel-builder');
var console = require('../controllers/console');

exports.Schedules_list = function (req, res, next) {
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
        // console.log("req.body.search_item :::: ",req.body.search_item)
        if (req.body.search_item == undefined)
        {

            search_item = 'user_detail.first_name';
            search_value = '';
            sort_order = -1;
            sort_field = 'unique_id';
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
            console.log("schedule trip req.body.start_date or req.body.end_date blank");
            if (req.body.start_date == '' && req.body.end_date == '') {
                console.log("schedule trip req.body.start_date and req.body.end_date blank 1");
                date = new Date(Date.now());
                filter["$match"]['schedule_start_time'] = {$gte: date};
            } else if (req.body.start_date == '') {
                console.log("schedule trip req.body.start_date blank 2 ");
                var start_date = req.body.end_date;
                var end_date = req.body.end_date;
                start_date = new Date(start_date);
                //change start n end date logic on 28-02-2022 by Monika patel
                // start_date = start_date.setHours(0, 0, 0, 0);
                // start_date = new Date(start_date);
                start_date.setUTCHours(0,0,0,0);
                start_date.toISOString()
                end_date = new Date(end_date);
                // end_date = end_date.setHours(11, 59, 59, 999);
                // end_date = new Date(end_date);
                end_date.setUTCHours(23, 59, 59, 999);
                end_date.toISOString()
                filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            } else {
                console.log("schedule trip else blank 3 ");
                var start_date = req.body.start_date;
                var end_date = req.body.start_date;
                start_date = new Date(start_date);
                //change start n end date logic on 28-02-2022 by Monika patel
                // start_date = start_date.setHours(0, 0, 0, 0);
                // start_date = new Date(start_date);
                start_date.setUTCHours(0,0,0,0);
                start_date.toISOString()
                end_date = new Date(end_date);
                // end_date = end_date.setHours(11, 59, 59, 999);
                // end_date = new Date(end_date);
                end_date.setUTCHours(23, 59, 59, 999);
                end_date.toISOString()
                filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {
            console.log("schedule trip else if dates undefined 4-8 ");
            
             // date = new Date(Date.now());
            // filter["$match"]['schedule_start_time'] = {$gte: date};

            // var start_date = req.body.start_date;
            // var end_date = req.body.start_date;
            // start_date = new Date(start_date);
            // start_date = start_date.setHours(0, 0, 0, 0);
            // start_date = new Date(start_date);
            // end_date = new Date(end_date);
            // end_date = end_date.setHours(11, 59, 59, 999);
            // end_date = new Date(end_date);

            // console.log("schedule trip start date ");
            // console.log(start_date)
            // console.log("schedule trip end date ");
            // console.log(end_date)
            // filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            // filter["$match"]['schedule_start_time'] = {};
        } else {
            console.log("schedule trip else dates 5 ");
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            //change start n end date logic on 28-02-2022 by Monika patel
            // start_date = start_date.setHours(0, 0, 0, 0);
            // start_date = new Date(start_date);
            start_date.setUTCHours(0,0,0,0);
            start_date.toISOString()
            end_date = new Date(end_date);
            // end_date = end_date.setHours(11, 59, 59, 999);
            // end_date = new Date(end_date);
            end_date.setUTCHours(23, 59, 59, 999);
            end_date.toISOString()
            filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
        }
        console.log('filter ************ ')
        console.log(filter)
        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
            }
        }

        var lookup = {
            $lookup:
                    {
                        from: "users",
                        localField: "user_id",
                        foreignField: "_id",
                        as: "user_detail"
                    },
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
                        from: "trip_orders",
                        localField: "_id",
                        foreignField: "trip_id",
                        as: "order_detail"
                    },
        };
        var unwind2 = {$unwind: "$order_detail"};

        value = search_value;
        value = value.replace(/^\s+|\s+$/g, '');
        value = value.replace(/ +(?= )/g, '');
        console.log("search_item search_item schedule trip ")
        console.log(search_item)
        if (search_item == ""){
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};
            var search = {"$match": {}};
        }
        else if (search_item == "user_detail.first_name")
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
        } 
        else
        {

            // var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
            var query1 = {};
            if (value != "")
            {
                // value = Number(value)
                // query1[search_item] = {$eq: value};
                query1[search_item] = {$regex: new RegExp(value, 'i')};
                var search = {"$match": query1};
            } else
            {
                search = {$match: {}};
            }
        }



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
        var condition = {$match: {}};
        var condition1 = {$match: {}};
        var condition2 = {$match: {}};
        var condition3 = {$match: {}};
        var condition4 = {$match: {}};
        // var condition4 = {$match: {'provider_id': {$ne: null}}};
//        var condition5 = {$match: {'is_provider_status': {$ne: 9}}};
	    var condition5  = {$match: {'status': {$eq: 4}}}
        // var condition5 = {$match: {'current_provider': {$eq: null}}};
        
        // console.log("array data to be printed here for schedule trip ");
        Trip.aggregate([condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind,lookup1, unwind1,lookup2, unwind2, search, filter, count]).then((array) => { 
            // console.log(array);
            if (!array || array.length == 0)
            {
                array = [];
                total_count = array[0].total;
                res.render('schedules_list', {detail: array, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment, common_utils:utils, total_count: total_count});
            } else
            {
                console.log("array.length");
                total_count = array[0].total;
                console.log(array[0].total);
                var pages = Math.ceil(array[0].total / number_of_rec);
                Trip.aggregate([condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind,lookup1, unwind1,lookup2, unwind2, search, filter, sort, skip, limit]).then((array) => { 
                    res.render('schedules_list', {detail: array, scheduled_request_pre_start_minute: setting_detail.scheduled_request_pre_start_minute, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment, common_utils:utils, total_count: total_count});
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

exports.Schedules_list_bckup = function (req, res, next) {
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
            sort_field = 'unique_id';
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
            if(req.body.search_item=="created_at" || req.body.search_item=="created_at"){
                search_value = req.body.search_value;
            }
            else{
                search_value = req.body.search_value;
            }

            filter_start_date = req.body.start_date;
            filter_end_date = req.body.end_date;

            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            status = Number(req.body.status);
        }
        var filter = {"$match": {}};

        if (req.body.start_date == '' || req.body.end_date == '') {
            if (req.body.start_date == '' && req.body.end_date == '') {
                date = new Date(Date.now());
                filter["$match"]['schedule_start_time'] = {$gte: date};
            } else if (req.body.start_date == '') {
                var start_date = req.body.end_date;
                var end_date = req.body.end_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            } else {
                var start_date = req.body.start_date;
                var end_date = req.body.start_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                filter["$match"]['schedule_start_time'] = {$gte: start_date, $lt: end_date};
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {

            date = new Date(Date.now());
            filter["$match"]['schedule_start_time'] = {$gte: date};
        } else {
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date = end_date.setHours(11, 59, 59, 999);
            end_date = new Date(end_date);
            if(req.body.search_item=="created_at"){
                filter["$match"]['created_at'] = {$gte: start_date, $lte: end_date};
            }
            else if(req.body.search_item=="schedule_start_time"){
                filter["$match"]['schedule_start_time'] = {$gte: start_date, $lte: end_date};
            }
            else{
                
                
            }
            
        }

        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
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
        }
        else if (search_item == "labRequisitionID")
        {
            
            var query1 = {};
            var query2 = {};
            var query3 = {};
            var query4 = {};
            var query5 = {};
            var query6 = {};
            query1[search_item] = {$regex: new RegExp(value, 'i')};
            search = {"$match": {$or: [query1]}};
            


        } else
        {
            var query1 = {};
            query1[search_item] = {$regex: new RegExp(value, 'i')};
            var search = {"$match": query1};
            // var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }



        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};

        var skip = {};
        skip["$skip"] = page * number_of_rec;

        var limit = {};
        limit["$limit"] = number_of_rec;

        var condition = {$match: {'is_schedule_trip': {$eq: true}}};
        var condition1 = {$match: {'is_trip_cancelled': {$eq: 0}}};
        var condition2 = {$match: {'is_trip_completed': {$eq: 0}}};
        var condition3 = {$match: {'is_trip_end': {$eq: 0}}};
        var condition4 = {$match: {'provider_id': {$eq: null}}};
        var condition5 = {$match: {'current_provider': {$eq: null}}};
        // console.log("array data to be printed here ");
        Trip.aggregate([condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind, search, filter, count]).then((array) => { 
            // console.log(array);
            if (!array || array.length == 0)
            {
                array = [];
                res.render('schedules_list', {detail: array, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment, common_utils:utils});
            } else
            {
                var pages = Math.ceil(array[0].total / number_of_rec);
                Trip.aggregate([condition, condition1, condition2, condition3, condition4, condition5, lookup, unwind, search, filter, sort, skip, limit]).then((array) => { 
                    res.render('schedules_list', {detail: array, scheduled_request_pre_start_minute: setting_detail.scheduled_request_pre_start_minute, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment, common_utils:utils});
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

exports.Schedules_list_old = function (req, res, next) {

    if (typeof req.session.userid != 'undefined') {
        var Schedule = require('mongoose').model('scheduled_trip');
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
            sort_field = 'unique_id';
            filter_start_date = '';
            filter_end_date = '';

            var start_date = '';
            var end_date = '';
            status = 3;
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
                date = new Date(Date.now());
                filter["$match"]['server_start_time'] = {$gte: date};
            } else if (req.body.start_date == '') {
                var start_date = req.body.end_date;
                var end_date = req.body.end_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                filter["$match"]['server_start_time'] = {$gte: start_date, $lt: end_date};
            } else {
                var start_date = req.body.start_date;
                var end_date = req.body.start_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                filter["$match"]['server_start_time'] = {$gte: start_date, $lt: end_date};
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {

            date = new Date(Date.now());
            filter["$match"]['server_start_time'] = {$gte: date};
        } else {
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date = end_date.setHours(11, 59, 59, 999);
            end_date = new Date(end_date);
            filter["$match"]['server_start_time'] = {$gte: start_date, $lt: end_date};
        }

        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
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
                        from: "trips",
                        localField: "trip_id",
                        foreignField: "_id",
                        as: "trip_detail"
                    }
        };
        var unwind1 = {$unwind: {
                path: "$trip_detail",
                preserveNullAndEmptyArrays: true
            }
        };

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

            var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }



        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};

        var skip = {};
        skip["$skip"] = page * number_of_rec;

        var limit = {};
        limit["$limit"] = number_of_rec;

        var status_condition = {$match: {}};
        if (status == 1) {
            status_condition['$match']['is_trip_created'] = {$eq: 1}
        } else if (status == 2) {
            status_condition['$match']['is_schedule_trip_cancelled'] = {$eq: 1}
        } else if (status == 0) {
            status_condition['$match']['is_trip_created'] = {$eq: 0}
            status_condition['$match']['is_schedule_trip_cancelled'] = {$eq: 0}
        }

            Schedule.aggregate([status_condition, lookup, unwind, search, filter, count], function (err, array) {
                if (!array || array.length == 0)
                {
                    array = [];
                    res.render('schedules_list', {detail: array, 'current_page': 1, 'pages': 0, 'next': 1, 'pre': 0, moment: moment, common_utils:utils});
                } else
                {
                    var pages = Math.ceil(array[0].total / number_of_rec);
                    Schedule.aggregate([status_condition, lookup, unwind, search, filter, sort, skip, limit], function (err, array) {

                        res.render('schedules_list', {detail: array, scheduled_request_pre_start_minute: setting_detail.scheduled_request_pre_start_minute, 'current_page': page, 'pages': pages, 'next': next, 'pre': pre, moment: moment, common_utils:utils});
                        delete message;
                    });
                }
            });
    } else {
        res.redirect('/admin');
    }

};


exports.genetare_schedules_request_excel = function (req, res, next) {
    if (typeof req.session.userid != 'undefined') {
        var Schedule = require('mongoose').model('scheduled_trip');
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
            sort_field = 'unique_id';
            filter_start_date = '';
            filter_end_date = '';

            var start_date = '';
            var end_date = '';
            status = 3;
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
                date = new Date(Date.now());
                filter["$match"]['server_start_time'] = {$gte: date};
            } else if (req.body.start_date == '') {
                var start_date = req.body.end_date;
                var end_date = req.body.end_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                filter["$match"]['server_start_time'] = {$gte: start_date, $lt: end_date};
            } else {
                var start_date = req.body.start_date;
                var end_date = req.body.start_date;
                start_date = new Date(start_date);
                start_date = start_date.setHours(0, 0, 0, 0);
                start_date = new Date(start_date);
                end_date = new Date(end_date);
                end_date = end_date.setHours(11, 59, 59, 999);
                end_date = new Date(end_date);
                filter["$match"]['server_start_time'] = {$gte: start_date, $lt: end_date};
            }
        } else if (req.body.start_date == undefined || req.body.end_date == undefined) {

            date = new Date(Date.now());
            filter["$match"]['server_start_time'] = {$gte: date};
        } else {
            var start_date = req.body.start_date;
            var end_date = req.body.end_date;
            start_date = new Date(start_date);
            start_date = start_date.setHours(0, 0, 0, 0);
            start_date = new Date(start_date);
            end_date = new Date(end_date);
            end_date = end_date.setHours(11, 59, 59, 999);
            end_date = new Date(end_date);
            filter["$match"]['server_start_time'] = {$gte: start_date, $lt: end_date};
        }

        var number_of_rec = Number(constant_json.PAGE_PER_RECORD_TMP);
        //added by Mayursinh Zala for making dynamic page per records on 03-12-2021
        if(setting_detail){
            if(setting_detail.record_per_page){
                number_of_rec = setting_detail.record_per_page;
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
                        from: "trips",
                        localField: "trip_id",
                        foreignField: "_id",
                        as: "trip_detail"
                    }
        };
        var unwind1 = {$unwind: {
                path: "$trip_detail",
                preserveNullAndEmptyArrays: true
            }
        };

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

            var search = {"$match": {search_item: {$regex: new RegExp(value, 'i')}}};
        }



        var sort = {"$sort": {}};
        sort["$sort"][sort_field] = parseInt(sort_order);

        var count = {$group: {_id: null, total: {$sum: 1}, data: {$push: '$data'}}};

        var skip = {};
        skip["$skip"] = page * number_of_rec;

        var limit = {};
        limit["$limit"] = number_of_rec;

        var status_condition = {$match: {}};
        if (status == 1) {
            status_condition['$match']['is_trip_created'] = {$eq: 1}
        } else if (status == 2) {
            status_condition['$match']['is_schedule_trip_cancelled'] = {$eq: 1}
        } else if (status == 0) {
            status_condition['$match']['is_trip_created'] = {$eq: 0}
            status_condition['$match']['is_schedule_trip_cancelled'] = {$eq: 0}
        }

            Schedule.aggregate([status_condition, lookup, unwind, search, filter, sort]).then((array) => { 
            
                var date = new Date();
                var time = date.getTime();
                var workbook = excelbuilder.createWorkbook('./data/xlsheet', time + '_schedule_trip.xlsx');

                var sheet1 = workbook.createSheet('sheet1', 10, array.length + 1);

                sheet1.set(1, 1, "ID");
                sheet1.set(2, 1, "USER");
                sheet1.set(3, 1, "PICKUP ADDRESS");
                sheet1.set(4, 1, "DESTINATION ADDRESS");
                sheet1.set(5, 1, "TIME ZONE");
                sheet1.set(6, 1, "REQUEST CREATION TIME");
                sheet1.set(7, 1, "STATUS");
                sheet1.set(8, 1, "PAYMENT");

                array.forEach(function (data, index) {

                    sheet1.set(1, index + 2, data.unique_id);
                    sheet1.set(2, index + 2, data.user_detail.first_name + ' ' + data.user_detail.last_name);
                    sheet1.set(3, index + 2, data.source_address);
                    sheet1.set(4, index + 2, data.destination_address);
                    sheet1.set(5, index + 2, data.timezone);
                    sheet1.set(6, index + 2, moment(data.created_at).format("DD MMM 'YY") + ' ' + moment(data.created_at).format("hh:mm a"));



                    if (data.is_trip_created == 1) {
                        sheet1.set(7, index + 2, "Created");
                    } else {
                        sheet1.set(7, index + 2, "Pending");
                    }

                    if (data.payment_mode == 1) {
                        sheet1.set(8, index + 2, config_json.title_pay_by_cash);
                    } else {
                        sheet1.set(8, index + 2, config_json.title_pay_by_card);
                    }

                    if (index == array.length - 1) {
                        workbook.save(function (err) {
                            if (err)
                            {
                                workbook.cancel();
                            } else {
                                var url = req.protocol + '://' + req.get('host') + "/xlsheet/" + time + "_schedule_trip.xlsx"
                                res.json(url);
                                setTimeout(function () {
                                    fs.unlink('data/xlsheet/' + time + '_schedule_trip.xlsx', function (err, file) {
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
