var mongoose = require('mongoose'),
        Schema = mongoose.Schema;


var tripsdocumentSchema = new Schema({
    trip_id: { type: Schema.Types.ObjectId },
    collection_document_picture: { type: String, default: "" },
    dropoff_document_picture: { type: String, default: "" },
    drawstarted_document_picture: { type: String, default: "" }, // New field
    digital_signature: { type: String, default: "" }, // New field for digital signature
    documentType: { type: String, default: "" },
    labRequisitionID: { type: String, default: "" },
    is_uploaded: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
    });
        
tripsdocumentSchema.index({ trip_id: 1, is_uploaded: 1 }, { background: true });
        
var TripsDocument = mongoose.model('TripsDocument', tripsdocumentSchema, 'trips_document');
        
module.exports = TripsDocument;