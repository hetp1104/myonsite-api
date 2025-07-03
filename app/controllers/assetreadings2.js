const mongoose = require('mongoose')
var AssetReadingModel = require('../models/assetreadings');
var Provider = require('mongoose').model('Provider');
AssetReadings = mongoose.model('AssetReadings')
const axios = require('axios');
var console = require('../controllers/console');
var User = require('mongoose').model('User');
var Trip_Order = require('mongoose').model('trip_order');
var Trip = require('mongoose').model('Trip');

var empty_refrigerator_value_string = "-128" // When -128 in input then consider it as blank value
var empty_refrigerator_value_int = -128 // When -128 in input then consider it as blank value

module.exports.addassetreading = async function (req, res) {
    console.log('Adding asset reading started');
    console.log(req.body);
    for (var i = 0; i < req.body.data.length; i++) {
        console.log('Processing asset reading data index:', i);
        console.log(req.body.data[i]);

        // Assuming Value1 and value2 are latitude and longitude
        const lat = req.body.data[i].Value1;
        const lon = req.body.data[i].value2;

        let address = "";

        try {
            // Send a request to the geocoding API
            console.log(`Fetching address for lat: ${lat}, lon: ${lon}`);
            const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${setting_detail.web_app_google_key}`);
            console.log('Geocoding API response:', response.data);

            // Extract the address from the API response
            if (response.data.results[0]) {
                address = response.data.results[0].formatted_address;
                console.log(`Address fetched: ${address}`);
            } else {
                console.log(`No results for lat: ${lat}, lon: ${lon}`);
            }
        } catch (error) {
            console.error('Error fetching address:', error);
        }
        // Fetch provider from database using provider ID
        const provider = await Provider.findById(req.body.data[i].ProviderID);
        const providerName = provider ? `${provider.first_name} ${provider.last_name}` : '';

        if (req.body.data[i].value5 == empty_refrigerator_value_string || req.body.data[i].value5 == empty_refrigerator_value_int) {
            console.log('value5 is empty, creating new asset reading with empty values');

            var assetreadings = new AssetReadings({
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

        }

        else {
            console.log('value5 is not empty, creating new asset reading with provided values');
            var assetreadings = new AssetReadings({
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
          //  SysID: 0,
            OwnerID: req.body.data[i].OwnerID,
            ReadingDateTime: req.body.data[i].ReadingDateTime,
            ProviderID: req.body.data[i].ProviderID,
            ReadingType: req.body.data[i].ReadingType,
            key1: "",
            key2: "",
            key3: "",
            key4: "",
            value1: req.body.data[i].Value1,
            value2: req.body.data[i].value2,
            value3: "",
            value4: "",
            value5: "",
            value6: "",
            value7: "",
            value8: "",
            createdby: req.body.data[i].CreatedBy,
            createdDateTime: req.body.data[i].CreatedWhenDtm,
            updatedby: req.body.data[i].UpdatedBy,
            updatedDateTime: req.body.data[i].UpdatedWhenDtm,
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
                // axios.post('https://stagingmos2.myonsitehealthcare.com/api/assetreadings/Insertassetreadings', postData, {headers})
                axios.post('https://qaapi.myonsitehealthcare.com/api/assetreadings/Insertassetreadings', jsonData, headers)
                .then(function (response) {
                    console.log("In 140");
                    console.log(response.data);
                  })
                  .catch(function (error) {
                    // handle error
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
}
exports.readassetreading = function(req, res)
{
    console.log("test");
    AssetReadingModel.find((err, docs) => {
    if (!err) {
        var message = '';
        var selected = '';
        var user_detail = '';
        res.render("assetreadings", {
            data: docs,
            message: message,
            selected: selected,
            user_detail: user_detail
        });
    } else {
        console.log('Failed the asset reading data ' + err);
    }
})
}



exports.provider_timeline = function (req, res) {
    Provider.find({}, (err, providers) => {
      AssetReadingModel.find({ Value1: { $ne: null }, value2: { $ne: null } }, (err, assetReadings) => {
        let providerNames = [...new Set(assetReadings.map(reading => reading.ProviderName))];

        // Format the ReadingDateTime in each assetReading in 'yyyy-mm-dd' format
        assetReadings.forEach(assetReading => {
            assetReading.ReadingDateTime = assetReading.ReadingDateTime.toISOString().split('T')[0];
        });

        var url = "https://maps.googleapis.com/maps/api/js?key=" + setting_detail.web_app_google_key + "&libraries=places";
        
        // console.log(assetReadings);

        res.render('provider_timeline', {
          map_url: url,
          assetReadings: assetReadings,
          providerNames: providerNames
        });
      });
    });
};



