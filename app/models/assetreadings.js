var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

    //creating schema for asset readings collection
    //Het,saumya 18/08/2022

var assetreadingsSchema = new Schema({
    SysID:  { type: Number, default: 0 },
    OwnerID: { type: String, default: "" },
    ReadingDateTime: { type: Date, default: Date.now },
    ProviderID: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider'},
    ProviderName: { type: String,default: "" },
    ReadingType: { type: String, default: "" },
    key1: { type: String, default: "" },
	key2: { type: String, default: "" },
	key3: { type: String, default: "" },
	key4: { type: String, default: "" },
	Value1: { type: String, default: "" },
    value2: { type: String, default: "" },
    value3: { type: String, default: "" },
    value4: { type: String, default: "" },
    value5: { type: String, default: "" },
    value6: { type: String, default: "" },
    value7: { type: String, default: "" },
    value8: { type: String, default: "" },
    value9: { type: String, default: "" },
	value10: { type: String, default: "" },
    CreatedBy: { type: String, default: "" },
    CreatedWhenDtm: { type: Date, default: Date.now },
    longtitude: { type: String, default: "" },
    UpdatedBy: { type: String, default: "" },
    UpdatedwhenDtm: { type: Date, default: Date.now },
    Address: { type: String, default: "" },
    Mileage: { type: String, default:"" }
    
},
);


  
module.exports = mongoose.model('AssetReadings', assetreadingsSchema);

