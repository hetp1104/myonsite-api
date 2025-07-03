var mongoose = require('mongoose'),
        Schema = mongoose.Schema;

//creating schema for assets collection
//Het,saumya 18/08/2022

var assetsSchema = new Schema({
    SysID: { type: Number, default: 0 },
    DeviceName: { type: String, default: "" },
    NickName: { type: String, default: "" },
    EmployeeID: { type: Number, default: 0 },
    DeviceIdentifier: { type: String, default: "" },
    ProviderID: { type: Number, default: 0 },
    AssetStatus: { type: Number, default:  0},
    DeviceStatus: { type: Number, default: 0 },
    Type: { type: String, default: 0 },
    Manufacturer: { type: String, default: "" },
    Model: { type: String, default: "" },
    PurchaseDate: { type: Date, default: Date.now },
    MOSAssetID: { type: String, default: "" },
    CreatedBy: { type: String, default: "" },
    CreatedWhenDtm: { type: Date, default: Date.now },
    OwnerID: { type: String, default: "" },
    UpdatedBy: { type: String, default: "" },
    UpdatedwhenDtm: { type: Date, default: Date.now }
    
    },
);


module.exports = mongoose.model('Assets', assetsSchema);

