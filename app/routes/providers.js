var providers = require('../../app/controllers/providers'); // include Provider controller ////


module.exports = function (app) {
    app.route('/GetPhlebScheduleHistory').post(providers.GetPhlebScheduleHistory);                                          
    app.route('/GetPhlebSchedule').post(providers.GetPhlebSchedule);
    //app.route('/providerlogout').post(providers.providerlogout);
    app.route('/updateProvider').post(providers.updateProvider);
    app.route('/checkProviderEmail').post(providers.checkProviderEmail);
    app.route('/providerlogin').post(providers.providerlogin);
    app.route('/providerregisternew').post(providers.provider_registerNew);
    app.route('/providerregister').post(providers.provider_register);
    app.route('/providerupdatedetail').post(providers.provider_update);
    app.route('/provider_location').post(providers.update_location);
    app.route('/provider_location_socket').post(providers.update_location_socket);
    app.route('/providerslogin').post(providers.provider_login);
    app.route('/provider_login_website').post(providers.provider_login_website);
    app.route('/providerlogout').post(providers.logout);
    app.route('/togglestate').post(providers.change_provider_status);
    app.route('/get_provider_detail').post(providers.get_provider_detail);
    app.route('/get_provider_detailbymail').post(providers.get_provider_detailByMail);
    app.route('/update_provider_user').post(providers.update_provider_usersys);
    app.route('/get_provider_info').post(providers.get_provider_info);
    app.route('/getproviderlatlong').post(providers.getproviderlatlong);
    app.route('/providerupdatetype').post(providers.provider_updatetype);
    app.route('/updateproviderdevicetoken').post(providers.update_device_token);
    app.route('/provider_heat_map').post(providers.provider_heat_map);
    app.route('/get_providerequipment').post(providers.getproviderequipment);
    app.route('/apply_provider_referral_code').post(providers.apply_provider_referral_code);
    
    app.route('/update_provider_setting').post(providers.update_provider_setting);
    app.route('/get_provider_referal_credit').post(providers.get_provider_referal_credit);

    app.route('/get_provider_terms_and_condition').get(providers.get_provider_terms_and_condition);
    app.route('/get_provider_privacy_policy').get(providers.get_provider_privacy_policy);

// Route for getting user terms and conditions
app.route('/get_user_terms_and_condition').get(providers.get_user_terms_and_condition);

// Route for getting user privacy policy
app.route('/get_user_privacy_policy').get(providers.get_user_privacy_policy);

    app.route('/provider_add_vehicle').post(providers.provider_add_vehicle);
    app.route('/provider_add_vehicle_with_document').post(providers.provider_add_vehicle_with_document);
    app.route('/upload_vehicle_document').post(providers.upload_vehicle_document);
    app.route('/get_provider_vehicle_detail').post(providers.get_provider_vehicle_detail);
    app.route('/get_provider_vehicle_list').post(providers.get_provider_vehicle_list);
    app.route('/change_current_vehicle').post(providers.change_current_vehicle);
    app.route('/provider_update_vehicle_detail').post(providers.provider_update_vehicle_detail);
    app.route('/provider_update_vehicle_detail_with_document').post(providers.provider_update_vehicle_detail_with_document);
    app.route('/provider_delete_vehicle_detail').post(providers.provider_delete_vehicle_detail);
    app.route('/get_provider_setting_detail').post(providers.get_provider_setting_detail);

    app.route('/phlebotomist_register').post(providers.phlebotomist_register);
    
    app.route('/get_userdetail').post(providers.get_userdetail);
    app.route('/get_phlebotomist_loginurl').post(providers.get_phlebotomist_loginurl);
    app.route('/notification_test').post(providers.notification_test);

    
    //add temp route n API only for IOS APP on 21-02-2022 by monika
    app.route('/apple_review').get(providers.apple_review);
    // New route for GetProviderLocationAndImage API
    app.route('/getProviderLocationAndImage').post(providers.getProviderLocationAndImage);
};