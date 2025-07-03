const mongoose = require('mongoose');
const multer = require('multer');
const bodyparser = require('body-parser');
const cookieparser = require('cookie-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const randomstring = require("randomstring");
const moment = require('moment');

// Models
const Settings = mongoose.model('Settings');
const Country = mongoose.model('Country');
const City = mongoose.model('City');
const Card = mongoose.model('Card');
const Type = mongoose.model('Type');
const Providers = mongoose.model('Provider');
const User = mongoose.model('User');
const Trip_Order = mongoose.model('trip_order');
const Trip = mongoose.model('Trip');

// Initialize setting_detail
let setting_detail;

// Initialize settings at startup
const initializeSettings = async () => {
  try {
    const settings = await Settings.findOne({});
    if (settings) {
      setting_detail = settings;
      console.log("Settings initialized with Google Maps key:", setting_detail.web_app_google_key || "NOT SET");
    } else {
      console.error("No settings found in database");
    }
  } catch (error) {
    console.error("Error initializing settings:", error);
  }
};

// Call initialization
initializeSettings();

exports.map = async function(req, res) {
  if (!req.session.userid) {
    return res.redirect('/admin');
  }

  try {
    // Make sure settings are loaded
    if (!setting_detail || !setting_detail.web_app_google_key) {
      console.error("Google Maps API Key not configured!");
      return res.status(500).render('error', {
        message: 'Google Maps API Key not configured',
        error: { status: 500 }
      });
    }

    const query = {
      'providerLocation': { $ne: [0, 0] }
    };

    const mapUrl = `https://maps.googleapis.com/maps/api/js?key=${setting_detail.web_app_google_key}&libraries=places`;
    
    // Using Promise.all to run queries in parallel
    const [types, countResult] = await Promise.all([
      Type.find({}),
      Providers.aggregate([
        { $match: query },
        { $count: 'total' }
      ])
    ]);

    const providersCount = countResult.length > 0 ? countResult[0].total : 0;
    
    if (providersCount === 0) {
      return res.render('maps', {
        detail: [],
        types: types,
        map_url: mapUrl,
        setting_detail: setting_detail, // Pass settings to template
        success: true
      });
    }

    // If we have providers, fetch them
    const providers = await Providers.find(query);
    
    res.render('maps', {
      detail: providers,
      types: types,
      map_url: mapUrl,
      setting_detail: setting_detail, // Pass settings to template
      success: true
    });
  } catch (error) {
    console.error('Error in map function:', error);
    res.status(500).render('error', {
      message: 'Internal Server Error',
      error: {
        status: 500,
        stack: process.env.NODE_ENV === 'development' ? error.stack : ''
      }
    });
  }
};

exports.provider_track = async function(req, res) {
  if (!req.session.userid) {
    return res.redirect('/admin');
  }

  try {
    // Make sure settings are loaded
    if (!setting_detail || !setting_detail.web_app_google_key) {
      return res.status(500).send('Google Maps API Key not configured');
    }

    const url = `https://maps.googleapis.com/maps/api/js?key=${setting_detail.web_app_google_key}&libraries=places`;
    const country = await Country.find({});
    
    res.render('provider_track', { 
      map_url: url, 
      country: country,
      setting_detail: setting_detail // Pass settings to template
    });
  } catch (error) {
    console.error('Error in provider_track:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.fetch_provider_list_of_refresh = async function(req, res) {
  if (!req.session.userid) {
    return res.redirect('/admin');
  }

  try {
    const query = {
      'providerLocation': { $ne: [0, 0] }
    };

    // Using aggregate for count
    const countResult = await Providers.aggregate([
      { $match: query },
      { $count: 'total' }
    ]);

    const providersCount = countResult.length > 0 ? countResult[0].total : 0;

    if (providersCount === 0) {
      return res.json([]);
    }

    const providers = await Providers.find(query);
    res.json(providers);
  } catch (error) {
    console.error('Error fetching provider list:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

exports.provider_track_city = async function(req, res) {
  if (!req.session.userid) {
    return res.redirect('/admin');
  }

  try {
    const query = {
      'providerLocation': { $ne: [0, 0] }
    };

    // Make sure settings are loaded
    if (!setting_detail || !setting_detail.web_app_google_key) {
      return res.status(500).send('Google Maps API Key not configured');
    }

    const providers_count = await Providers.countDocuments(query);
    const url = `https://maps.googleapis.com/maps/api/js?key=${setting_detail.web_app_google_key}&libraries=places&callback=initialize`;
    const country = await Country.find({});

    let providers = [];
    if (providers_count > 0) {
      providers = await Providers.find(query);
    }

    res.render('provider_track', {
      detail: providers,
      map_url: url,
      country: country,
      setting_detail: setting_detail // Pass settings to template
    });
  } catch (error) {
    console.error('Error in provider_track_city:', error);
    res.status(500).send('Internal Server Error');
  }
};

exports.fetch_provider_list = async function(req, res) {
  if (!req.session.userid) {
    return res.redirect('/admin');
  }

  try {
    const cityid = req.body.cityid;
    const countyrid = req.body.countyrid;

    const query = {
      'providerLocation': { $ne: [0, 0] },
      'cityid': cityid,
      'is_active': 1
    };

    const providers_count = await Providers.countDocuments(query);
    if (providers_count > 0) {
      const providers = await Providers.find(query);
      return res.json(providers);
    }

    res.json([]);
  } catch (error) {
    console.error('Error in fetch_provider_list:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

exports.fetch_provider_detail = async function(req, res) {
  if (!req.session.userid) {
    return res.redirect('/admin');
  }

  try {
    const providerid = req.body.providerid;
    
    // Fixed: countD is not a standard Mongoose method
    const provider = await Providers.findById(providerid);
    
    if (provider) {
      return res.json(provider);
    }
    
    res.json(null);
  } catch (error) {
    console.error('Error in fetch_provider_detail:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error'
    });
  }
};

exports.get_all_provider_list = async function(req, res) {
  try {
    const providers = await Providers.find({ admintypeid: req.body.type_id });
    res.json({ success: true, providers: providers });
  } catch (error) {
    console.error("Error fetching providers:", error);
    res.status(500).json({
      success: false,
      error: "Error fetching providers",
      message: error.message
    });
  }
};

exports.getTripData = async function(req, res) {
  try {
    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Set status to 2
    const status = 2;

    const trips = await Trip.find({
      "schedule_start_time": { $gte: today },
      "status": status
    });

    const formattedTrips = trips.map(trip => ({
      labRequisitionID: trip.labRequisitionID || 'N/A',
      user_first_name: trip.user_first_name || '',
      user_last_name: trip.user_last_name || '',
      status: trip.status,
      // Important: Add null check for sourceLocation
      sourceLocation: Array.isArray(trip.sourceLocation) && trip.sourceLocation.length >= 2 
        ? trip.sourceLocation 
        : [0, 0]
    }));

    res.status(200).json(formattedTrips);
  } catch (error) {
    console.error('Error fetching trip data:', error);
    res.status(500).json({
      success: false,
      error: 'Error fetching trip data',
      message: error.message
    });
  }
};