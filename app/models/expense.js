var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var expenseSchema = new Schema({
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    provider_id: { type: String, required: true },
    date: { type: Date, required: true }, // Adding the date field
    photo: { type: String, default: "" }, // Assuming the photo URL will be stored
    status:{type: Number, default: 0},
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    category: { type: String, required: true }
});

expenseSchema.index({ provider_id: 1 }, { background: true }); // Indexing for faster queries

module.exports = mongoose.model('Expense', expenseSchema);
