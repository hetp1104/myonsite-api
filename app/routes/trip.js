var trip = require('../../app/controllers/trip'); // include trip controller ////
var Trip = require('mongoose').model('Trip'); // include trip model ////
var providers = require('../../app/controllers/providers'); // include Provider controller ////
var users = require('../../app/controllers/users'); // include user controller /////////
var xmlparser = require('express-xml-bodyparser');

module.exports = function (app) {
    
    app.route('/createtrip').post(trip.create);
    app.route('/provider_createtrip').post(trip.provider_create);
    app.route('/send_request').post(trip.send_request_from_dispatcher);

    app.route('/importtrip').post(trip.import_trip, xmlparser({trim: false, explicitArray: false}));
    app.route('/calculatedistance').post(trip.calculateDistance);
    app.route('/myschedules').post(trip.myschedules);
    app.route('/collectspecimens').post(trip.collectspecimens);
    
    app.route('/gettrips').post(trip.provider_get_trips);
    app.route('/usergettripstatus').post(trip.user_get_trip_status);
    app.route('/respondstrip').post(trip.responds_trip);
    app.route('/canceltrip').post(trip.trip_cancel_by_user);
    app.route('/tripcancelbyprovider').post(trip.trip_cancel_by_provider);
    app.route('/tripcancelbyadmin').post(trip.trip_cancel_by_admin);
    app.route('/settripstatus').post(trip.provider_set_trip_status);
    app.route('/completetrip').post(trip.provider_complete_trip);
    app.route('/gettriparray').post(trip.provider_get_trip_array);
    app.route('/gettripschedule').post(trip.provider_get_trip_schedule);
    app.route('/get_equipments').post(trip.get_providerequipment);
    app.route('/getprovidersummary').post(trip.provider_get_summary);
    app.route('/pay_payment').post(trip.pay_payment);
    app.route('/userhistory').post(trip.user_history);
    app.route('/usertripdetail').post(trip.user_tripdetail);
    app.route('/providertripdetail').post(trip.provider_tripdetail);
    app.route('/providergettripstatus').post(trip.providergettripstatus);
    
    app.route('/providerhistory').post(trip.provider_history);
    app.route('/usergiverating').post(trip.user_rating);
    app.route('/providergiverating').post(trip.provider_rating);
    app.route('/getuserinvoice').post(trip.user_invoice);
    app.route('/GetProviderReview').post(trip.getProviderReview);

    app.route('/getproviderinvoice').post(trip.provider_invoice);
    app.route('/usersetdestination').post(trip.user_setdestination);
    app.route('/getgooglemappath').post(trip.getgooglemappath);
    app.route('/setgooglemappath').post(trip.setgooglemappath);
    app.route('/check_destination').post(trip.check_destination);
    app.route('/pay_pending_payment').post(trip.pay_pending_payment);
    app.route('/user_submit_invoice').post(trip.user_submit_invoice);
    app.route('/provider_submit_invoice').post(trip.provider_submit_invoice);
    app.route('/getnearbyprovider').post(trip.get_near_by_provider);
    app.route('/twilio_voice_call').post(trip.twilio_voice_call);
    app.route('/GetRequisitionDetails').post(trip.getRequisitionDetails);
    app.route('/GetNotes').post(trip.getNotes);
    app.route('/AddNotes').post(trip.addNotes);
    app.route('/GetRequisitionResult').post(trip.getRequisitionResult);
    app.route('/GetTestDetails').post(trip.get_PatientTest_Details);
    app.route('/AddTestResults').post(trip.add_PatientTest_Details);
    app.route('/PrePostChecklist').get(trip.getPreAndPostChecklist);
    app.route('/RescheduleAppointment').post(trip.rescheduleTrip);
    app.route('/GetUserDetails').post(trip.getUserDetails);
    app.route('/CurrentAppointmentData').post(trip.currentAppointmentData);
    app.route('/StartAppointment').post(trip.startAppointment);
    app.route('/getPhlebTrips').post(trip.getPhlebTrips);

    app.route('/get_equipment_list').post(trip.get_equipment_list);
    app.route('/end_trip').post(trip.end_trip);
    app.route('/reschedule_trip').post(trip.reschedule_trip);

    app.route('/newtrips').post(trip.new_trips);

    app.route('/print_lable').post(trip.print_lable);

    app.route('/get_req_note').post(trip.get_req_note);
    app.route('/add_req_note').post(trip.add_req_note);

    app.route('/get_req_result').post(trip.get_req_result);
    app.route('/add_req_result').post(trip.add_req_result);
    app.route('/phleb_assignment').post(trip.phleb_assignment);
    app.route('/get_trip_byid').post(trip.get_trip_byid);

    app.route('/post_req_result').post(trip.post_req_result);
    app.route('/get_req_collection').post(trip.get_req_collection);
    app.route('/get_req_collection').post(trip.get_req_collection);
    app.route('/uploadTripDocument').post(trip.uploadTripDocument);
    app.route('/get_patient_data').post(trip.get_patient_data);
    app.route('/updatePatient').post(trip.updatePatient);

    // Add the get and update checklist routes
    app.route('/updateChecklist').post(trip.update_checklist);
    
};



