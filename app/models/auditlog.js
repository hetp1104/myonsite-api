var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var auditLogSchema = new Schema({
    expense_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Expense' },
    old_status: { type: Number, required: true },
    new_status: { type: Number, required: true },
    updated_by: { type: String, required: true }, // Store who made the update
    updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
