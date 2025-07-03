require('dotenv').config();

setting_detail = {};

const path = require('path');
const express = require('express')

if (process.env.NODE_ENV === 'production') {
    const cluster = require('cluster');
    
    if (cluster.isMaster) {
        const cpuCount = require('os').cpus().length;
        console.log(`Master cluster setting up ${cpuCount} workers`);

        for (let i = 0; i < cpuCount; i++) {
            cluster.fork();
        }

        cluster.on('exit', (worker, code, signal) => {
            console.log(`Worker ${worker.process.pid} died with code ${code} and signal ${signal}`);
            console.log('Starting a new worker...');
            cluster.fork();
        });
    } else {
        console.log(`Worker ${process.pid} started`);
        init();
    }
} else {
    init();
}

function init() {
    // Load environment specific configuration
    const config = require('./config/config');
    console.log(`Starting server with ${process.env.NODE_ENV} configuration`);

    var port = process.env.PORT || 5001;
    var mongoose = require('./config/mongoose');
    var express = require('./config/express');
    const packageInfo = require('./package.json');
    var db = mongoose(config), // Pass the database URL from config
    app = express();
    app.locals.packageInfo = packageInfo;


    // Load all JSON configurations
    try {
        config_json = require('config.json')('./admin_panel_string.json');
        admin_messages = require('config.json')('./admin_panel_message.json');
        constant_json = require('config.json')('./constants.json');
        push_messages = require('config.json')('./pushMessages.json');
        error_message = require('config.json')('./errorMessages.json');
        installation_setting_message = require('config.json')('./installation_settings_config.json');
        setting_message = require('config.json')('./settings.json');
        success_messages = require('config.json')('./successMessages.json');
        tooltip_json = require('config.json')('./tooltip.json');
    } catch (error) {
        console.error('Error loading JSON configurations:', error);
        process.exit(1);
    }

    const http = require('http');
    const socketIO = require('socket.io');
    const server = http.Server(app);
    const io = socketIO(server);
    
    // Use Redis adapter for Socket.IO in all environments
    const redis = require('socket.io-redis');
    
    // Redis configuration - can be modified based on environment if needed
    const redisHost = process.env.REDIS_HOST || 'localhost';
    const redisPort = process.env.REDIS_PORT || 6379;
    
    try {
        io.adapter(redis({ host: redisHost, port: redisPort }));
        console.log(`Connected to Redis at ${redisHost}:${redisPort}`);
    } catch (error) {
        console.error('Failed to connect to Redis:', error);
        console.error('Redis is required for this application to function. Exiting...');
        process.exit(1);
    }
    
    server.listen(port);
    console.log(`Server listening on port ${port}`);

    var Providers = require('./app/controllers/providers');
    var Trips = require('./app/controllers/trip');

    // Socket.IO event handlers
    io.on('connection', socket => {
        console.log('New client connected');

        socket.on('trip_detail_notify', function (data, ackFn) {
            var trip_id ="'"+data.trip_id+"'";
            io.emit(trip_id, {
                is_trip_updated: true, 
                trip_id: trip_id
            });
        });

        socket.on('update_location', function (data, ackFn) {
            var trip_id ="'"+data.trip_id+"'";
            var provider_id ="'"+data.provider_id+"'";
            
            Providers.update_location_socket({body: data}, function(response){
                ackFn(response);
                if(data.trip_id && response.success){
                    io.emit(trip_id, {
                        is_trip_updated: false,
                        trip_id: trip_id,
                        bearing: data.bearing,
                        location: response.providerLocation,
                        total_time: response.total_time,
                        total_distance: response.total_distance
                    });
                } else {
                    io.emit(provider_id, {
                        bearing: data.bearing,
                        location: response.providerLocation,
                        provider_id: data.provider_id
                    });
                }
            });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected');
        });
    });

    // Language handling routes
    app.post('/check_language', function (req, res) {
        var cookieOptions = {
            httpOnly: true,
            expires: new Date(new Date().getTime()+86409000),
            maxAge: 86409000
        }

        require('./app/controllers/constant');

        if(req.body.type == 'admin'){
            if(LANGUAGES.arebic == req.cookies.language){
                config_json = require('config.json')('./admin_panel_string_arabic.json');
                res.cookie('language', 'Arebic', cookieOptions); 
                res.json({success: true});
            } else {
                config_json = require('config.json')('./admin_panel_string.json');
                res.cookie('language', 'English', cookieOptions);
                res.json({success: true});
            }
        } else {
            config_json = require('config.json')('./admin_panel_string.json');
        }
    });

    app.post('/change_language', function (req, res) {
        require('./app/controllers/constant');

        var cookieOptions = {
            httpOnly: true,
            expires: new Date(new Date().getTime()+86409000),
            maxAge: 86409000
        }

        if(LANGUAGES.arebic == req.body.language){
            config_json = require('config.json')('./admin_panel_string_arabic.json');
            res.cookie('language', 'Arebic', cookieOptions); 
            res.json({success: true});
        } else {
            config_json = require('config.json')('./admin_panel_string.json');
            res.cookie('language', 'English', cookieOptions);
            res.json({success: true});
        }
    });

    // Catch-all route for errors
    app.get('*', function (req, res) {
        res.render('errorPage');
    });

    // Initialize settings
    var Settings = require('mongoose').model('Settings');
    let setting_detail = Settings;

    async function initializeSettings() {
        try {
            const setting = await Settings.findOne({});
            setting_detail = setting;
            console.log(`Worker ${process.pid} listening on port ${port}`);
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    }

    initializeSettings();

    // Export app for testing
    module.exports = app;
}