var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate-v2');
var Schema = mongoose.Schema;
var mongoosePages = require('mongoose-pages');
const { AutoIncrementID } = require('@typegoose/auto-increment');  
var language = new Schema({
    unique_id: Number,
    name:{type: String, default: ""},
    code:{type: String, default: ""},
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }

}, {
    strict: true,
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }

});

language.plugin(mongoosePaginate);
language.plugin(AutoIncrementID, {model: 'language', field: 'unique_id', startAt: 1, incrementBy: 1});
mongoosePages.skip(language);
module.exports = mongoose.model('language', language);

