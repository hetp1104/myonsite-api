// location_tracker.js
const mongoose = require('mongoose');

// Define a schema for storing location history
const LocationHistorySchema = new mongoose.Schema({
  provider_id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Provider'
  },
  trip_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    default: null
  },
  locations: [{
    latitude: Number,
    longitude: Number,
    bearing: Number,
    timestamp: {
      type: Date,
      default: Date.now
    },
    trip_status: Number // Store the trip status at this location point
  }],
  created_at: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create the model
const LocationHistory = mongoose.model('LocationHistory', LocationHistorySchema);

// Set up interval for location tracking
let locationTrackers = {};

// Start location tracking for a provider
const startTracking = function(provider_id, initialLocation, trip_id = null, trip_status = null) {
  // Stop any existing tracker for this provider
  if (locationTrackers[provider_id]) {
    clearInterval(locationTrackers[provider_id]);
  }
  
  // Initialize a new document or find existing one for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  LocationHistory.findOneAndUpdate(
    { 
      provider_id: provider_id,
      created_at: { $gte: today }
    },
    {
      $push: { 
        locations: {
          latitude: initialLocation[0],
          longitude: initialLocation[1],
          bearing: initialLocation[2] || 0,
          timestamp: new Date(),
          trip_status: trip_status
        }
      },
      trip_id: trip_id
    },
    { upsert: true, new: true }
  ).exec();

  // Set up interval to track location every minute
  locationTrackers[provider_id] = setInterval(() => {
    // Fetch latest provider location from the database
    mongoose.model('Provider').findById(provider_id).then(provider => {
      if (provider && provider.providerLocation) {
        // Find the active trip if any
        mongoose.model('Trip').findOne({
          confirmed_provider: provider_id,
          is_trip_completed: 0,
          is_trip_cancelled: 0,
          is_trip_end: 0
        }).then(trip => {
          const tripId = trip ? trip._id : null;
          const tripStatus = trip ? trip.is_provider_status : null;
          
          // Add new location point
          LocationHistory.findOneAndUpdate(
            { 
              provider_id: provider_id,
              created_at: { $gte: today }
            },
            {
              $push: { 
                locations: {
                  latitude: provider.providerLocation[0],
                  longitude: provider.providerLocation[1],
                  bearing: provider.bearing || 0,
                  timestamp: new Date(),
                  trip_status: tripStatus
                }
              },
              trip_id: tripId
            },
            { upsert: true, new: true }
          ).exec();
        });
      }
    });
  }, 60000); // 1 minute interval
  
  return locationTrackers[provider_id];
};

// Stop tracking a provider
const stopTracking = function(provider_id) {
  if (locationTrackers[provider_id]) {
    clearInterval(locationTrackers[provider_id]);
    delete locationTrackers[provider_id];
    return true;
  }
  return false;
};

// Track location update for trip status change
const trackStatusChange = function(provider_id, location, trip_id, trip_status) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return LocationHistory.findOneAndUpdate(
    { 
      provider_id: provider_id,
      created_at: { $gte: today }
    },
    {
      $push: { 
        locations: {
          latitude: location[0],
          longitude: location[1],
          bearing: location[2] || 0,
          timestamp: new Date(),
          trip_status: trip_status
        }
      },
      trip_id: trip_id
    },
    { upsert: true, new: true }
  ).exec();
};

// Get location history for a provider within a time range
const getLocationHistory = function(provider_id, start_date, end_date) {
  return LocationHistory.find({
    provider_id: provider_id,
    created_at: {
      $gte: start_date,
      $lte: end_date
    }
  }).exec();
};

// Get location history for a specific trip
const getTripLocationHistory = function(trip_id) {
  return LocationHistory.find({
    trip_id: trip_id
  }).exec();
};

module.exports = {
  LocationHistory,
  startTracking,
  stopTracking,
  trackStatusChange,
  getLocationHistory,
  getTripLocationHistory
};