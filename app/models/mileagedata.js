var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

// Creating schema for mileagedata collection
var mileagedataSchema = new Schema({
    ProviderName: { type: String, required: true },
    CreatedBy: { type: String, required: true },
    ProviderID: { type: String, required: true },
    LatitudeA: { type: String, required: true },
    LongitudeA: { type: String, required: true },
    AddressA: { type: String, required: true },
    ReadingDateTimeA: { type: Date, required: true },
    LatitudeB: { type: String, required: true },
    LongitudeB: { type: String, required: true },
    AddressB: { type: String, required: true },
    ReadingDateTimeB: { type: Date, required: true },
    Mileage: { type: Number, default: 0 },
    Kilometer: { type: Number, default: 0 }
}, { collection: 'mileagedata' }); // Specify the collection name here

module.exports = mongoose.model('MileageData', mileagedataSchema);
