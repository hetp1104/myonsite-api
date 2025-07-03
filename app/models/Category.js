var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var categorySchema = new Schema({
    category_name: { type: String, default: "" },
    active: { type: Boolean, default: true },
    // Add other fields for category model as needed
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Create an index if needed
// categorySchema.index({ category_name: 1 }, { background: true });

var Category = mongoose.model('Category', categorySchema);
module.exports = Category;
             