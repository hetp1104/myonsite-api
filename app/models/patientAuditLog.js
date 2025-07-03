const mongoose = require('mongoose');

const patientAuditLogSchema = new mongoose.Schema({
    trip_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TripOrder' },
    provider_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' },
    field: String, // The field that was updated (e.g., 'secondaryAddress', 'primaryPhone')
    old_value: String, // Old value before update
    new_value: String, // New value after update
    updated_by: { type: mongoose.Schema.Types.ObjectId, ref: 'Provider' }, // Phlebotomist or Provider who made the change
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PatientAuditLog', patientAuditLogSchema);
