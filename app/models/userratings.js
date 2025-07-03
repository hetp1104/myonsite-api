var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Define the schema for user ratings
var userRatingSchema = new Schema({
    RequisitionSysID: { type: Number, required: true }, // Foreign key reference to requisition
    UserID: { type: String, required: true }, // Using UserID instead of PhlebotomistID
    Comments: { type: String, default: "" }, // Comments field
    RatingValue: { type: Number, required: true }, // Rating value (DECIMAL equivalent)
    PatientName: { type: String, required: true }, // Patient's name
    PatientSysID: { type: Number, required: true }, // Patient's system ID
    RatingDate: { type: Date, default: Date.now } // Date of the rating
});

// Create the model from the schema
var UserRating = mongoose.model('UserRating', userRatingSchema);
module.exports = UserRating;
