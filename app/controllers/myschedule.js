



var TripOrder = require('mongoose').model('trip_order');

controllers/providers.js

exports.my_schedules = function (req, res) {
    utils.check_request_params(req.body, [{ name: 'provider_id', type: 'string' }, { name: 'token', type: 'string' }], function (response) {
        if (response.success) {
            Trip.findOne({ provider_id: req.body.provider_id }).then((provider) => {
                var jwt = utils.validate_token(req.body.token);
                var jwt = true;
                if (provider) {
                    if (jwt) {
                        console.log("req");
                        console.log(req.body.provider_id);
                        console.log("_id");
                        console.log(provider._id);
                        console.log("requisitionsysid");
                        console.log(provider.requisitionsysid);
                        console.log("provider_id");
                        console.log(provider.provider_id);
                        TripOrder.findOne({ trip_id: provider._id }).then((trip) => {
                            console.log("ordering clinic");
                            console.log(trip.order.clinic.name);
                        });

                    }
                    else {
                        res.json({
                            success: false,
                            error_code: error_message.ERROR_CODE_INVALID_TOKEN
                        });
                    }
                } else {
                    res.json({ success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND });
                }
            }, (err) => {
                // console.log(err);
                res.json({
                    success: false,
                    error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                });
            });
        } else {
            res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });
        }
    });
};

