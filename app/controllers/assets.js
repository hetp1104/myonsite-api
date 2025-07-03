const mongoose = require('mongoose')
var AssetModel = require('../models/assets');
Assets = mongoose.model('Assets')

module.exports.addasset = function(req, res) 
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

exports.readasset = function(req, res) {
    AssetModel.find()
      .then(docs => {
        var message = '';
        res.render("assets", {
          data: docs,
          message: message
        });
      })
      .catch(err => {
        console.log('Failed to get asset data: ' + err);
        res.status(500).send("Database error occurred");
      });
}