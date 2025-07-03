const mongoose = require('mongoose')
var DropOffModel = require('../models/dropoff');
DropOff = mongoose.model('DropOff')


module.exports.adddropoff = function(req, res) 
{
      var dropoff = new dropoffs({

        trip_id: req.body.data[i].trip_id, 
        user_id: req.body.data[i].user_id, 
        clinic: req.body.data[i].clinic, 
        source_address: req.body.data[i].source_address, 
        destination_address: req.body.data[i].destination_address, 
        requisitionsysid: req.body.data[i].requisitionsysid, 
        scheduledate: req.body.data[i].scheduledate, 
        status: req.body.data[i].status, 
        patient: req.body.data[i].patient, 
        physician: req.body.data[i].physician, 
    });
    
}
exports.readdropoff = function(req, res)
{
    DropOffModel.find((err, docs) => {
    if (!err) {
        var message = '';
        var selected = '';
        var user_detail = '';
        res.render("dropoff", {
            data: docs,
            message: message,
            selected: selected,
            user_detail: user_detail
        });
    } else {
        console.log('Failed the asset reading data ' + err);
    }
 })
}