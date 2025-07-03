//Initialize express app
//Het,saumya 18/08/2022
const express = require('express')

const assetreadings_route = require('../routes/assetreadings')
const assets_route = require('../routes/assets')

//Initialize mongoose
//Het,saumya 18/08/2022
const mongoose = require('mongoose')

Assets = mongoose.model('Assets')
AssetReadings = mongoose.model('AssetReadings')

const bodyParser = require('body-parser');
const assets = require('../models/assets');


//To post asset data in mongodb assets collection
//Het,saumya 18/08/2022

exports.addasset = function(req, res) 
{
    
    var assets = new Assets({
            SysID: req.body.SysID,
            DeviceName: req.body.DeviceName, 
            NickName: req.body.NickName,  
            EmployeeID: req.body.EmployeeID, 
            DeviceIdentifier: req.body.DeviceIdentifier, 
            ProviderID: req.body.ProviderID, 
            AssetStatus: req.body.AssetStatus, 
            DeviceStatus: req.body.DeviceStatus, 
            Type: req.body.Type,  
            Manufacturer: req.body.Manufacturer,  
            Model: req.body.Model, 
            PurchaseDate : req.body.PurchaseDate,  
            MOSAssetID: req.body. MOSAssetID, 
            CreatedBy: req.body.CreatedBy,   
            CreatedWhenDtm: req.body.CreatedWhenDtm,   
            UpdatedBy: req.body.UpdatedBy,  
            UpdatedWhenDtm: req.body.UpdatedWhenDtm,   
            OwnerID: req.body.OwnerID  
    });
    console.log(assets);


    assets.save().then((err, devices) => {
        if(err)
        {
            res.send(err);
            console.log(devices);
        }
        else{

            res.status(200).send('Success');
            console.log(devices);
        }
     
    }
    )
}

// assetreadings
//To post asset readings data in mongodb assetreadings collection
//Het,saumya 18/08/2022

exports.addassetreading = function(req, res) 
{
    console.log(req.body);
    var assetreadings = new AssetReadings({
            SysID: req.body.SysID, 
            OwnerID: req.body.OwnerID, 
            ReadingDateTime: req.body.ReadingDateTime, 
            ProviderID: req.body.ProviderID, 
            ReadingType: req.body.ReadingType, 
            Value1: req.body.Value1, 
            value2: req.body.value2, 
            value3: req.body.value3, 
            value4: req.body.value4, 
            value5: req.body.value5, 
            value6: req.body.value6, 
            value7: req.body.value7, 
            value8: req.body.value8, 
            CreatedBy: req.body.CreatedBy, 
            CreatedWhenDtm: req.body.CreatedWhenDtm, 
            UpdatedBy: req.body.UpdatedBy, 
            UpdatedwhenDtm: req.body.UpdatedWhenDtm

    });
    


    assetreadings.save().then((devices_reading) => {
         res.status(200).send('Success');
        console.log(devices_reading);
        res.send(devices_reading).catch((err) => {
            console.log(err)
        })
    }
    )
}
