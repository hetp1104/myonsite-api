var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

    var trip_orders = new Schema({
        trip_id:  { type: Number, default: 0 },
        user_id:  { type: Number, default: 0 },
        clinic:  { type: String, default: "" },
        source_address:  { type: String, default: ""},
        destination_address:  { type: String, default: ""},
        requisitionsysid:  { type: Number, default: "" },
        scheduledate: { type: Date, default: Date.now },
        status:  { type: String, default: ""},
        patient:  { type: String, default: ""},
        physician:  { type: String, default: ""},
    },
    );
    
    
    module.exports = mongoose.model('TripOrders', trip_orders);