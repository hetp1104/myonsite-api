const mongoose = require('mongoose')
var AssetReadingModel = require('../models/assetreadings');
// var MileageData = require('../models/mileagedata');
var Provider = require('mongoose').model('Provider');
AssetReadings = mongoose.model('AssetReadings')
const axios = require('axios');
var console = require('../controllers/console');
var User = require('mongoose').model('User');
var Trip_Order = require('mongoose').model('trip_order');
var Trip = require('mongoose').model('Trip');
const redis = require('redis');
// Initialize Redis client
// Initialize Redis client
const redisClient = redis.createClient({
    host: 'localhost',  // Set Redis server hostname if needed
    port: 6379,  // Default Redis port
});

var empty_refrigerator_value_string = "-128" // When -128 in input then consider it as blank value
var empty_refrigerator_value_int = -128 // When -128 in input then consider it as blank value


module.exports.addassetreading = async function (req, res) {
    console.log('Adding asset reading started');

    for (var i = 0; i < req.body.data.length; i++) {
        console.log('Processing asset reading data index:', i);

        const lat = req.body.data[i].Value1;
        const lon = req.body.data[i].value2;
        let address = "";

        try {
            // Log the current time when checking Redis
            console.log(`Checking Redis cache for lat: ${lat}, lon: ${lon} at ${new Date().toISOString()}`);

            // First, check Redis cache for the address
            const cacheKey = `address:${lat}:${lon}`;
            address = await new Promise((resolve, reject) => {
                redisClient.get(cacheKey, (err, data) => {
                    if (err) return reject(err);
                    if (data) {
                        console.log(`Found address in Redis cache: ${data} at ${new Date().toISOString()}`);
                        resolve(data ? JSON.parse(data) : null);  // Return the cached address if available
                    } else {
                        console.log(`Address not found in Redis cache for lat: ${lat}, lon: ${lon} at ${new Date().toISOString()}`);
                        resolve(null);
                    }
                });
            });

            if (address) {
                console.log('Using address from Redis cache.');
            } else {
                // If not found in Redis, check the database
                console.log(`Checking MongoDB for lat: ${lat}, lon: ${lon} at ${new Date().toISOString()}`);
                let assetReading = await AssetReadingModel.findOne({ Value1: lat, value2: lon });

                if (assetReading && assetReading.Address) {
                    console.log(`Found address in MongoDB: ${assetReading.Address} at ${new Date().toISOString()}`);
                    address = assetReading.Address;
                } else {
                    console.log(`Address not found in MongoDB for lat: ${lat}, lon: ${lon} at ${new Date().toISOString()}`);

                    // Address does not exist, call the Google Geocoding API
                    console.log(`Fetching address for lat: ${lat}, lon: ${lon} from Google API at ${new Date().toISOString()}`);
                    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${setting_detail.web_app_google_key}`);
                    if (response.data.results && response.data.results.length > 0) {
                        address = response.data.results[0].formatted_address;
                        console.log(`Address fetched from Google API: ${address} at ${new Date().toISOString()}`);
                    } else {
                        console.log(`No results found for lat: ${lat}, lon: ${lon} at ${new Date().toISOString()}`);
                    }
                }

                // Save the fetched address in Redis for future use
                redisClient.setex(cacheKey, 3600, JSON.stringify(address));  // Cache the address for 1 hour
                console.log(`Address cached in Redis for lat: ${lat}, lon: ${lon} at ${new Date().toISOString()}`);
            }
        } catch (error) {
            console.error('Error fetching or finding address:', error);
            res.status(500).send('Error processing your request: ' + error.message);
            return;
        }

        // Fetch provider from database using provider ID
        const provider = await Provider.findById(req.body.data[i].ProviderID);
        const providerName = provider ? `${provider.first_name} ${provider.last_name}` : '';

        let assetreadings;

        if (req.body.data[i].value5 == empty_refrigerator_value_string || req.body.data[i].value5 == empty_refrigerator_value_int) {
            console.log('value5 is empty, creating new asset reading with empty values');
            assetreadings = new AssetReadings({
                SysID: req.body.data[i].SysID,
                OwnerID: req.body.data[i].OwnerID,
                ReadingDateTime: req.body.data[i].ReadingDateTime,
                ProviderID: req.body.data[i].ProviderID,
                ProviderName: providerName,
                ReadingType: req.body.data[i].ReadingType,
                Value1: req.body.data[i].Value1,
                value2: req.body.data[i].value2,
                value3: req.body.data[i].value3,
                value4: req.body.data[i].value4,
                value5: "",
                value6: "",
                value7: "",
                value8: "",
                CreatedBy: req.body.data[i].CreatedBy,
                CreatedWhenDtm: req.body.data[i].CreatedWhenDtm,
                UpdatedBy: req.body.data[i].UpdatedBy,
                UpdatedwhenDtm: req.body.data[i].UpdatedWhenDtm,
                Address: address
            });
        } else {
            console.log('value5 is not empty, creating new asset reading with provided values');
            assetreadings = new AssetReadings({
                SysID: req.body.data[i].SysID,
                OwnerID: req.body.data[i].OwnerID,
                ReadingDateTime: req.body.data[i].ReadingDateTime,
                ProviderID: req.body.data[i].ProviderID,
                ProviderName: providerName,
                ReadingType: req.body.data[i].ReadingType,
                Value1: req.body.data[i].Value1,
                value2: req.body.data[i].value2,
                value3: req.body.data[i].value3,
                value4: req.body.data[i].value4,
                value5: req.body.data[i].value5,
                value6: req.body.data[i].value6,
                value7: req.body.data[i].value7,
                value8: req.body.data[i].value8,
                CreatedBy: req.body.data[i].CreatedBy,
                CreatedWhenDtm: req.body.data[i].CreatedWhenDtm,
                UpdatedBy: req.body.data[i].UpdatedBy,
                UpdatedwhenDtm: req.body.data[i].UpdatedWhenDtm,
                Address: address
            });
        }

        console.log("req.body.data[i]");
        console.log(req.body.data[i]);
        const postData = {
            // SysID: 0,
            OwnerID: req.body.data[i].OwnerID,
            ReadingDateTime: req.body.data[i].ReadingDateTime,
            ProviderID: req.body.data[i].ProviderID,
            ReadingType: req.body.data[i].ReadingType,
            key1: "",
            key2: "",
            key3: "",
            key4: "",
            Value1: req.body.data[i].Value1,
            value2: req.body.data[i].value2,
            value3: req.body.data[i].value3,
            value4: req.body.data[i].value4,
            value5: req.body.data[i].value5,
            value6: req.body.data[i].value6,
            value7: req.body.data[i].value7,
            value8: req.body.data[i].value8,
            value9: "",
            value10: "",
            createdBy: req.body.data[i].CreatedBy,
            createdDateTime: "",
            updatedby: "",
            updatedDateTime: "",
            Address: address,
            ProviderName: providerName,
        };

        console.log('Saving asset reading to database');
        assetreadings.save()
            .then((devices_reading) => {
                console.log('Successfully saved asset reading');
                console.log(devices_reading);
                console.log("postData");
                console.log(postData);
                const jsonData = JSON.stringify(postData);

                // Define your headers
                const headers = {
                    'Content-Type': 'application/json'
                };

                // Send POST request to external API
                axios.post('https://api.myonsitehealthcare.com/api/assetreadings/Insertassetreadings', postData, { headers })
                    .then(function (response) {
                        console.log("In 140");
                        console.log(response.data);
                    })
                    .catch(function (error) {
                        // Handle error
                        console.log("In 145");
                        console.log(error);
                    })
                    .finally(function () {
                        console.log("In 149");
                    });

                console.log("In 200 Res --------151");
                res.status(200).send(devices_reading);
            })
            .catch((err) => {
                console.error(err);
                console.log("In 157 -- ");
                res.status(500).send(err);
            });
    }
};

exports.readassetreading = function(req, res) {
    console.log("test");
    AssetReadingModel.find()
        .then(docs => {
            var message = '';
            var selected = '';
            var user_detail = '';
            res.render("assetreadings", {
                data: docs,
                message: message,
                selected: selected,
                user_detail: user_detail
            });
        })
        .catch(err => {
            console.log('Failed the asset reading data ' + err);
            res.status(500).render("error", {
                error: 'Failed to fetch asset reading data'
            });
        });
};

exports.provider_timeline = async function (req, res) {
    try {
        const providers = await Provider.find({});
        const assetReadings = await AssetReadingModel.find({ 
            Value1: { $ne: null }, 
            value2: { $ne: null } 
        });

        let providerNames = [...new Set(assetReadings.map(reading => reading.ProviderName))];

        // Format the ReadingDateTime in each assetReading in 'yyyy-mm-dd' format
        assetReadings.forEach(assetReading => {
            assetReading.ReadingDateTime = assetReading.ReadingDateTime.toISOString().split('T')[0];
        });

        const url = "https://maps.googleapis.com/maps/api/js?key=" + setting_detail.web_app_google_key + "&libraries=places";

        res.render('provider_timeline', {
            map_url: url,
            assetReadings: assetReadings,
            providerNames: providerNames
        });
    } catch (error) {
        console.error('Error in provider_timeline:', error);
        res.status(500).render('error', { 
            message: 'Error loading provider timeline'
        });
    }
};

module.exports.save_distance = async function (req, res) {
    try {
        console.log('save distance started');
        console.log(req.body);
        
        // Extract distancemiles and distancekilometers from the request body
        const distancemiles = req.body.distanceMiles;
        const distancekilometers = req.body.distanceKilometers;
        
        console.log("Distancemiles:", distancemiles);
        console.log("Distancekilometers:", distancekilometers);
        
          // Create a new AssetReadings instance and set the value9 and value10 fields
          const assetreadings = new AssetReadings({
            // ...other fields...
            value9: distancemiles,
            value10: distancekilometers,
            // ...other fields...
        });

        // Save the assetreadings object to the database
        await assetreadings.save();

        // Send a success response if needed
        res.status(200).json({ message: 'Data received successfully' });
    } catch (error) {
        console.error('Error processing data:', error);
        res.status(500).json({ error: 'An error occurred while processing the data' });
    }
}

// function getPatientTripData(providerID, callback) {
  
//     // Get today's date
//     const today = new Date();a
//     today.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0 for accurate comparison

//     const endOfToday = new Date();
//     endOfToday.setHours(23, 59, 59, 999);

//     // Set status to 3
//     // const status = 3;

//     // Use the providerID parameter to filter trips associated with the specified provider
//     Trip.find({ "ProviderID": providerID, "schedule_start_time": { $gte: today, $lte: endOfToday } }, (err, trips) => {
//         if (err) {
//             console.error('Error fetching trip data:', err);
//             return callback(err, null);
//         }

//         const formattedTrips = trips.map(trip => ({
//             labRequisitionID: trip.labRequisitionID,
//             user_first_name: trip.user_first_name,
//             user_last_name: trip.user_last_name,
//             status: trip.status,
//             sourceLocation: trip.sourceLocation,
//             provider_id: trip.provider_id,
//             country_id: trip.country_id,
//             city_id: trip.city_id,
//             lis_created_time: trip.lis_created_time,
//             triptype: trip.triptype,
//             created_at: trip.created_at,
//             provider_trip_end_time: trip.provider_trip_end_time,
//             provider_trip_start_time: trip.provider_trip_start_time,
//             provider_arrived_time: trip.provider_arrived_time,
//             accepted_time: trip.accepted_time,
//             schedule_start_time: trip.schedule_start_time,
//             user_create_time: trip.user_create_time,
//         }));

//         // Log the formattedTrips for debugging purposes
//         console.log(formattedTrips);

//         // Call the callback function with the fetched trip data
//         callback(null, formattedTrips);
//     });
// }

exports.getprovidermileage = function (req, res) {
    console.log("API Request Received");

    const CreatedBy = req.query.CreatedBy || req.body.CreatedBy;
    // Get the `ReadingDateTime` value from the request, either from the query parameters or the payload
    let readingDateTime = req.query.ReadingDateTime || req.body.ReadingDateTime;

    // If `ReadingDateTime` is not provided, set it to today's date
    if (!readingDateTime) {
        const today = new Date();
        readingDateTime = today.toISOString(); // Format as an ISO string
    }

    // Convert the `ReadingDateTime` to a Date object
    const readingDate = new Date(readingDateTime);

    // Define start and end points for the day
    const startOfDay = new Date(readingDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(readingDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Build a query object to filter the asset readings by `CreatedBy` and date range
    const query = {
        CreatedBy: CreatedBy,
        ReadingDateTime: {
            $gte: startOfDay,  // greater than or equal to start of day
            $lte: endOfDay     // less than or equal to end of day
        }
    };

    // Define the fields you want to select from the "asstreadings" table
    const projection = {
        Value1: 1,
        value2: 1,
        ProviderID: 1,
        Address: 1,
        ProviderName: 1,
        ReadingDateTime: 1,
        CreatedBy: 1,
    };

    // Sort the results by ReadingDateTime in descending order to get the latest record first
    const sort = { ReadingDateTime: -1 };

    // Limit the result to only one record (the latest)
    const limit = 1;

    // Query the "asstreadings" table, select the specified fields, filter by `CreatedBy` and date range, sort in descending order, and limit the result to one record
    AssetReadingModel.find(query, projection, { sort, limit }, (err, assetReadings) => {
        if (err) {
            console.error('Error fetching asset readings:', err);
            return res.status(500).json({ error: err.message });
        }

        console.log('Fetched latest asset reading:', assetReadings);

        // Return the selected data (latest record) in the API response
        res.json({ data: assetReadings });
    });
};


exports.getPatientTripData = function (req, res) {
    console.log("---- 263");
    console.log(req.query);
    let selectedProvider = req.query.provider;
    console.log("Trips Data");

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    if (selectedProvider == "undefined") {
        selectedProvider = "";
    }

    AssetReadingModel.findOne({ "ProviderName": selectedProvider + " " })
        .then(assetreading => {
            if (!assetreading) {
                console.log("Asset reading not found for provider:", selectedProvider);
                // Don't return the response here, throw an error instead
                throw new Error('Asset reading not found');
            }

            console.log("assetreading.ProviderID --------- 275");
            console.log(assetreading);
            console.log(assetreading.ProviderID);

            const selectedProviderID = assetreading.ProviderID;

            console.log("Looking for provider_id");
            console.log(selectedProviderID);

            return Trip.find({
                "provider_id": selectedProviderID,
                "schedule_start_time": {
                    $gte: today,
                    $lte: endOfToday
                }
            });
        })
        .then(trips => {
            const formattedTrips = trips.map(trip => ({
                labRequisitionID: trip.labRequisitionID,
                user_first_name: trip.user_first_name,
                user_last_name: trip.user_last_name,
                status: trip.status,
                sourceLocation: trip.sourceLocation,
                provider_id: trip.provider_id,
                country_id: trip.country_id,
                city_id: trip.city_id,
                lis_created_time: trip.lis_created_time,
                triptype: trip.triptype,
                created_at: trip.created_at,
                provider_trip_end_time: trip.provider_trip_end_time,
                provider_trip_start_time: trip.provider_trip_start_time,
                provider_arrived_time: trip.provider_arrived_time,
                accepted_time: trip.accepted_time,
                schedule_start_time: trip.schedule_start_time,
                user_create_time: trip.user_create_time,
            }));

            console.log(formattedTrips);
            return res.status(200).json(formattedTrips);
        })
        .catch(err => {
            console.error('Error in getPatientTripData:', err);
            // Check the type of error to send appropriate status code
            if (err.message === 'Asset reading not found') {
                return res.status(404).json({ error: 'Asset reading not found' });
            }
            return res.status(500).json({ error: 'Error fetching data' });
        });
};

exports.getAssetReadings = async function (req, res) {
    console.log("API Request Received");

    try {
        let readingDateTime = req.body.ReadingDateTime;

        if (!readingDateTime) {
            const today = new Date();
            readingDateTime = today.toISOString();
            console.log("ReadingDateTime not provided. Setting to today:", readingDateTime);
        }

        const readingDate = new Date(readingDateTime);
        const startOfDay = new Date(new Date(readingDate).setHours(0, 0, 0, 0));
        const endOfDay = new Date(new Date(readingDate).setHours(23, 59, 59, 999));

        const createdBy = req.body.CreatedBy || "PS7"; // Default for testing
        const providerId = req.body.ProviderId || "63beb17a256112296f5edf10"; // Default for testing

        const query = [
            { $match: { CreatedBy: createdBy, ReadingDateTime: { $gte: startOfDay, $lte: endOfDay } } },
            {
                $lookup: {
                    from: "trips",
                    let: { provider_id: new mongoose.Types.ObjectId(providerId) },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$provider_id", "$$provider_id"] },
                                        { $gte: ["$provider_trip_start_time", startOfDay] },
                                        { $lte: ["$provider_trip_start_time", endOfDay] }
                                    ]
                                }
                            }
                        },
                        {
                            $lookup: {
                                from: "trip_orders",
                                localField: "_id",
                                foreignField: "trip_id",
                                as: "tripOrders"
                            }
                        }
                    ],
                    as: "tripDetails"
                }
            }
        ];

        // Use Promise/async-await pattern instead of callback
        const results = await AssetReadingModel.aggregate(query);

        if (results.length < 2) {
            return res.status(200).json({
                message: "Not enough data to calculate a full route. Here are the available readings.",
                readings: results
            });
        }

        const apiKey = 'AIzaSyB73UNyK6qIfJFf1aSFU-10pgDYGLSbx8Q'; // Replace with your Google Maps API Key

        const assetRouteDetails = await calculateDistancesUsingGoogleMaps(results, apiKey);
        const tripRouteDetails = await calculateTripRouteUsingGoogleMaps(results[0].tripDetails, apiKey);

        const enhancedRouteDetails = assetRouteDetails.map((detail, index) => ({
            ...detail,
            providerId: results[index].ProviderID,
            readingDateTime: results[index].ReadingDateTime,
            address: results[index].Address,
            id: results[index]._id,
            createdBy: results[index].CreatedBy
        }));

        const response = {
            assetRoutes: enhancedRouteDetails,
            tripRoutes: tripRouteDetails
        };

        res.json(response);
    } catch (error) {
        console.error('Error in getAssetReadings:', error);
        res.status(500).json({ error: error.message });
    }
};

async function calculateDistancesUsingGoogleMaps(readings, apiKey) {
    const baseUrl = "https://maps.googleapis.com/maps/api/directions/json";
    const origin = `${readings[0].Value1},${readings[0].value2}`;
    const destination = `${readings[readings.length - 1].Value1},${readings[readings.length - 1].value2}`;
    const waypoints = readings.slice(1, -1).map(reading => `${reading.Value1},${reading.value2}`);

    const maxWaypoints = 23; // Maximum allowed waypoints per request (including origin and destination)
    const batches = [];

    // Split waypoints into smaller batches
    for (let i = 0; i < waypoints.length; i += maxWaypoints) {
        batches.push(waypoints.slice(i, i + maxWaypoints));
    }

    // Make API calls for each batch
    const routeDetails = [];
    for (const batch of batches) {
        const waypointsParam = batch.join('|');
        const url = `${baseUrl}?origin=${origin}&destination=${destination}&waypoints=optimize:true|${waypointsParam}&key=${apiKey}`;
        
        try {
            const response = await axios.get(url);

            if (response.data.status === 'OK') {
                const batchRouteDetails = response.data.routes[0].legs.map((leg, index) => ({
                    route: `${getMarkerAlphabet(index)} to ${getMarkerAlphabet(index + 1)}`,
                    distanceMiles: (leg.distance.value / 1609.34).toFixed(2),
                    distanceKilometers: (leg.distance.value / 1000).toFixed(2),
                    duration: leg.duration.text,
                    startAddress: leg.start_address,
                    endAddress: leg.end_address
                }));
                routeDetails.push(...batchRouteDetails);
            } else {
                console.error('Google Maps API error:', response.data.status);
            }
        } catch (error) {
            console.error('Error fetching route:', error);
        }
    }

    return routeDetails;
}

async function calculateTripRouteUsingGoogleMaps(tripDetails, apiKey) {
    const baseUrl = "https://maps.googleapis.com/maps/api/directions/json";
    const geocodeBaseUrl = "https://maps.googleapis.com/maps/api/geocode/json";
    const routes = [];

    for (let i = 0; i < tripDetails.length - 1; i++) {
        const sourceLocation = tripDetails[i].sourceLocation;
        const destinationLocation = tripDetails[i + 1].sourceLocation;

        const sourceLatLng = `${sourceLocation[0]},${sourceLocation[1]}`;
        const destinationLatLng = `${destinationLocation[0]},${destinationLocation[1]}`;

        const directionsUrl = `${baseUrl}?origin=${encodeURIComponent(sourceLatLng)}&destination=${encodeURIComponent(destinationLatLng)}&key=${apiKey}`;
        console.log(`Fetching route from ${sourceLatLng} to ${destinationLatLng}`);

        try {
            const directionsResponse = await axios.get(directionsUrl);

            let sourceAddress = "N/A";
            let destinationAddress = "N/A";

            if (directionsResponse.data.status === 'OK') {
                const routeDetails = directionsResponse.data.routes[0].legs[0];
                
                // Fetch addresses for source and destination locations
                const sourceGeocodeUrl = `${geocodeBaseUrl}?latlng=${sourceLatLng}&key=${apiKey}`;
                const destinationGeocodeUrl = `${geocodeBaseUrl}?latlng=${destinationLatLng}&key=${apiKey}`;

                const [sourceGeocodeResponse, destinationGeocodeResponse] = await Promise.all([
                    axios.get(sourceGeocodeUrl),
                    axios.get(destinationGeocodeUrl)
                ]);

                if (sourceGeocodeResponse.data.status === 'OK' && sourceGeocodeResponse.data.results.length > 0) {
                    sourceAddress = sourceGeocodeResponse.data.results[0].formatted_address;
                }

                if (destinationGeocodeResponse.data.status === 'OK' && destinationGeocodeResponse.data.results.length > 0) {
                    destinationAddress = destinationGeocodeResponse.data.results[0].formatted_address;
                }

                routes.push({
                    route: `${getMarkerAlphabet(i)} to ${getMarkerAlphabet(i + 1)}`,
                    sourceLocation,
                    sourceAddress,
                    destinationLocation,
                    destinationAddress,
                    distanceMiles: (routeDetails.distance.value / 1609.34).toFixed(2),
                    distanceKilometers: (routeDetails.distance.value / 1000).toFixed(2),
                    duration: routeDetails.duration.text
                });
            } else {
                console.error(`Google Maps API error between ${sourceLatLng} and ${destinationLatLng}: ${directionsResponse.data.status}`);
                routes.push({
                    route: `${getMarkerAlphabet(i)} to ${getMarkerAlphabet(i + 1)}`,
                    sourceLocation,
                    sourceAddress,
                    destinationLocation,
                    destinationAddress,
                    distanceMiles: "0.00",
                    distanceKilometers: "0.00",
                    duration: "N/A"
                });
            }
        } catch (error) {
            console.error(`Error fetching route between ${sourceLatLng} and ${destinationLatLng}: ${error.message}`);
            routes.push({
                route: `${getMarkerAlphabet(i)} to ${getMarkerAlphabet(i + 1)}`,
                sourceLocation,
                sourceAddress,
                destinationLocation,
                destinationAddress,
                distanceMiles: "0.00",
                distanceKilometers: "0.00",
                duration: "N/A"
            });
        }
    }

    return routes;
}

function getMarkerAlphabet(index) {
    return String.fromCharCode(65 + index);
}

// const PORT = process.env.PORT || 3000;
// app.listen(PORT, () => {
//     console.log(`Server is running on port ${PORT}`);
// });

exports.renderRouteCalculationPage = async function(req, res) {
    res.render("route_calculation", {
        data: []
    });
};