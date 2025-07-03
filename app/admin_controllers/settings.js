const utils = require('../controllers/utils');
const { model } = require('mongoose');
const multer = require('multer');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const nodemailer = require('nodemailer');
const twilio = require('twilio');
const randomstring = require("randomstring");
const Settings = model('Settings');
const Country = model('Country');
const City = model('City');
const moment = require('moment');
const Card = model('Card');
const console = require('../controllers/console');
const { admin_messages, constant_json, success_messages } = require('../controllers/constant');
const fs = require('fs');

exports.installation_settings = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                const app_name = constant_json.app_name;
                const partner_panel_name = constant_json.partner_panel_name;
                const dispatcher_panel_name = constant_json.dispatcher_panel_name;
                const hotel_panel_name = constant_json.hotel_panel_name;
                
                res.render('admin_installation_settings', {
                    setting,
                    app_name,
                    partner_panel_name,
                    dispatcher_panel_name,
                    hotel_panel_name
                });
                delete message;
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

exports.terms_and_privacy_setting = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                res.render('terms_and_privacy_setting', { setting });
                delete message;
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

exports.update_provider_terms_and_condition = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                setting.provider_terms_and_condition = req.body.provider_terms_and_condition;
                await setting.save();
                setting_detail = setting;
                message = admin_messages.success_message_update;
                res.redirect('terms_and_privacy_setting');
            }
        } catch (error) {
            console.error('Error updating provider terms:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

exports.update_provider_privacy_policy = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                setting.provider_privacy_policy = req.body.provider_privacy_policy;
                await setting.save();
                setting_detail = setting;
                message = admin_messages.success_message_update;
                res.redirect('terms_and_privacy_setting');
            }
        } catch (error) {
            console.error('Error updating provider privacy policy:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

exports.update_user_terms_and_condition = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                setting.user_terms_and_condition = req.body.user_terms_and_condition;
                await setting.save();
                setting_detail = setting;
                message = admin_messages.success_message_update;
                res.redirect('terms_and_privacy_setting');
            }
        } catch (error) {
            console.error('Error updating user terms:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

exports.update_user_privacy_policy = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                setting.user_privacy_policy = req.body.user_privacy_policy;
                await setting.save();
                setting_detail = setting;
                message = admin_messages.success_message_update;
                res.redirect('terms_and_privacy_setting');
            }
        } catch (error) {
            console.error('Error updating user privacy policy:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

////// APP key 
exports.update_app_key = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.hotline_app_id = (req.body.hotline_app_id).trim();
        setting.hotline_app_key = (req.body.hotline_app_key).trim();
        await setting.save();
        setting_detail = setting;
        message = admin_messages.success_message_update;
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating app key:', error);
        res.redirect('installation_settings');
    }
};

exports.twilio_settings_update = async function (req, res) {
    try {
        const setting = await Settings.findOne({});
        setting.twilio_account_sid = (req.body.twilio_account_sid).trim();
        setting.twilio_auth_token = (req.body.twilio_auth_token).trim();
        setting.twilio_number = req.body.twilio_number;
        setting.twiml_url = req.body.twiml_url;
        await setting.save();
        setting_detail = setting;
        message = "update successfully";
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating twilio settings:', error);
        res.redirect('installation_settings');
    }
};

////// THEME SETTING IMAGES
exports.upload_logo_images = function (req, res, next) {
    if (req.session.userid) {
        const files_details = req.files;

        if (files_details && files_details.length > 0) {
            for (let i = 0; i < files_details.length; i++) {
                const file_data = files_details[i];
                const file_id = file_data.fieldname;
                let file_name = "";

                if (file_id === 'logo_image') {
                    file_name = constant_json.LOGO_IMAGE_NAME;
                } else if (file_id === 'title_image') {
                    file_name = constant_json.TITLE_IMAGE_NAME;
                } else if (file_id === 'mail_title_image') {
                    file_name = constant_json.MAIL_TITLE_IMAGE_NAME;
                } else if (file_id === 'authorised_image') {
                    file_name = constant_json.AUTHORISED_IMAGE_NAME;
                } else if (file_id === 'user_logo') {
                    file_name = constant_json.USER_LOGO;
                }

                if (file_name !== '') {
                    utils.saveImageFromBrowser(req.files[0].path, file_name, 6);
                }
            }
        }
        
        message = "update successfully";
        res.redirect('/settings');
    } else {
        res.redirect('/admin');
    }
};

/////// IOS CERTIFICATE UPLOAD ////////
exports.upload_ios_push_certificate = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.user_passphrase = (req.body.user_passphrase).trim();
        setting.provider_passphrase = (req.body.provider_passphrase).trim();
        setting.ios_certificate_mode = (req.body.ios_certificate_mode).trim();
        await setting.save();
        setting_detail = setting;

        if (req.session.userid) {
            const files_details = req.files;

            if (files_details && files_details.length > 0) {
                for (let i = 0; i < files_details.length; i++) {
                    const file_data = files_details[i];
                    const file_id = file_data.fieldname;
                    let file_name = "";

                    if (file_id === 'ios_user_cert_file') {
                        file_name = constant_json.IOS_USER_CERT_FILE_NAME;
                    } else if (file_id === 'ios_user_key_file') {
                        file_name = constant_json.IOS_USER_KEY_FILE_NAME;
                    } else if (file_id === 'ios_provider_cert_file') {
                        file_name = constant_json.IOS_PROVIDER_CERT_FILE_NAME;
                    } else if (file_id === 'ios_provider_key_file') {
                        file_name = constant_json.IOS_PROVIDER_KEY_FILE_NAME;
                    }

                    if (file_name !== '') {
                        utils.saveIosCertiFromBrowser(file_data.path, file_name, 1);
                    }
                }
            }

            message = "update successfully";
            res.redirect('/settings');
        } else {
            res.redirect('/admin');
        }
    } catch (error) {
        console.error('Error uploading iOS certificate:', error);
        res.redirect('/settings');
    }
};

////////// GOOGLE KEY////////
exports.google_api_key_settings_update = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.android_user_app_google_key = (req.body.android_user_app_google_key).trim();
        setting.android_provider_app_google_key = (req.body.android_provider_app_google_key).trim();
        setting.ios_user_app_google_key = (req.body.ios_user_app_google_key).trim();
        setting.ios_provider_app_google_key = (req.body.ios_provider_app_google_key).trim();
        setting.web_app_google_key = (req.body.web_app_google_key).trim();
        setting.road_api_google_key = (req.body.road_api_google_key).trim();
        await setting.save();
        setting_detail = setting;
        message = admin_messages.success_message_update;
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating Google API settings:', error);
        res.redirect('installation_settings');
    }
};

////////// GCM KEY////////
exports.gcm_api_key_settings_update = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.android_user_app_gcm_key = (req.body.android_user_app_gcm_key).trim();
        setting.android_provider_app_gcm_key = (req.body.android_provider_app_gcm_key).trim();
        await setting.save();
        setting_detail = setting;
        message = admin_messages.success_message_update;
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating GCM API settings:', error);
        res.redirect('installation_settings');
    }
};

////////// ANDROID API URL////////
exports.android_app_url_settings_update = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.android_client_app_url = (req.body.android_client_app_url).trim();
        setting.android_driver_app_url = (req.body.android_driver_app_url).trim();
        await setting.save();
        setting_detail = setting;
        message = "update successfully";
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating Android URL settings:', error);
        res.redirect('installation_settings');
    }
};

//////// IOS API URL ///
exports.ios_app_url_settings_update = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.ios_client_app_url = (req.body.ios_client_app_url).trim();
        setting.ios_driver_app_url = (req.body.ios_driver_app_url).trim();
        await setting.save();
        setting_detail = setting;
        message = "update successfully";
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating iOS URL settings:', error);
        res.redirect('installation_settings');
    }
};

// AWS Settings API
exports.admin_aws_settings_update = async function(req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.access_key_id = req.body.access_key_id.trim();
        setting.secret_key_id = req.body.secret_key_id.trim();
        setting.aws_bucket_name = req.body.aws_bucket_name.trim();
        await setting.save();
        setting_detail = setting;
        message = "update successfully";
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating AWS settings:', error);
        res.redirect('installation_settings');
    }
};

/////////// PAYMENT GATEWAY - STRIPE//////////
exports.payment_gate_way_settings_update = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        if (setting.stripe_secret_key !== req.body.stripe_secret_key || 
            setting.stripe_publishable_key !== req.body.stripe_publishable_key) {
            await Card.deleteMany({});
        }
        setting.stripe_secret_key = (req.body.stripe_secret_key).trim();
        setting.stripe_publishable_key = (req.body.stripe_publishable_key).trim();
        await setting.save();
        setting_detail = setting;
        message = "update successfully";
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating payment gateway settings:', error);
        res.redirect('installation_settings');
    }
};

exports.email_settings_update = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.email = (req.body.u_email).trim();
        setting.password = (req.body.email_psw).trim();
        setting.domain = req.body.domain;
        setting.smtp_host = (req.body.smtp_host).trim();
        setting.smtp_port = (req.body.smtp_port).trim();
        await setting.save();
        setting_detail = setting;
        message = "update successfully";
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating email settings:', error);
        res.redirect('installation_settings');
    }
};

exports.settings = async function (req, res) {
    if (req.session.userid) {
        try {
            const moment = require('moment-timezone');
            const countryList = require('country-data').callingCountries;
            const timezoneList = require('timezone-list').getTimezones();

            const settingCount = await Settings.countDocuments({});
            if (settingCount === 0) {
                res.render('admin_settings', {detail: [], country: countryList.all});
                delete message;
            } else {
                const settings = await Settings.find({});
                res.render('admin_settings', {
                    detail: settings, 
                    timezoneList: timezoneList, 
                    country: countryList.all
                });
                delete message;
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('/admin');
    }
};

exports.admin_settings_update = async function (req, res) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findByIdAndUpdate(
                req.body.id, 
                req.body, 
                {new: true}
            );

            let countryname = "";
            if (req.body.countryname) {
                countryname = req.body.countryname.replace(/'/g, '');
            }
            setting.countryname = countryname;
            setting.location = [req.body.latitude, req.body.longitude];
            setting.zoom_level = req.body.zoom_level;
            setting.record_per_page = req.body.record_per_page;
            await setting.save();
            setting_detail = setting;
            message = "update successfully";
            res.redirect('/settings');
        } catch (error) {
            console.error('Error updating admin settings:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('admin');
    }
};

exports.update_notification_setting = async function (req, res) {
    if (req.session.userid) {
        try {
            // Set boolean fields that might be undefined to false
            const booleanFields = [
                'sms_notification', 'email_notification', 'userPath', 'providerPath',
                'get_referral_profit_on_card_payment', 'get_referral_profit_on_cash_payment',
                'userEmailVerification', 'providerEmailVerification', 'userSms',
                'providerSms', 'is_tip', 'is_toll', 'twilio_call_masking',
                'android_user_app_force_update', 'android_provider_app_force_update',
                'ios_user_app_force_update', 'ios_provider_app_force_update',
                'is_provider_initiate_trip'
            ];

            booleanFields.forEach(field => {
                if (req.body[field] === undefined) {
                    req.body[field] = 'false';
                }
            });

            const setting = await Settings.findByIdAndUpdate(
                req.body.id, 
                req.body, 
                {new: true}
            );
            
            message = "update successfully";
            setting_detail = setting;
            res.redirect('/settings');
        } catch (error) {
            console.error('Error updating notification settings:', error);
            res.redirect('/admin');
        }
    } else {
        res.redirect('admin');
    }
};

exports.update_app_name = async function (req, res, next) {
    try {
        const app_name = constant_json.app_name;
        const partner_panel_name = constant_json.partner_panel_name;
        const dispatcher_panel_name = constant_json.dispatcher_panel_name;
        const hotel_panel_name = constant_json.hotel_panel_name;

        const new_app_name = req.body.app_name;
        const new_partner_panel_name = req.body.partner_panel_name;
        const new_dispatcher_panel_name = req.body.dispatcher_panel_name;
        const new_hotel_panel_name = req.body.hotel_panel_name;

        const setting = await Settings.findOne({});
        setting.app_name = req.body.app_name;
        setting.partner_panel_name = req.body.partner_panel_name;
        setting.dispatcher_panel_name = req.body.dispatcher_panel_name;
        setting.hotel_panel_name = req.body.hotel_panel_name;
        await setting.save();
        setting_detail = setting;

        fs.readFile('constants.env', 'utf8', function (err, data) {
            if (err) {
                console.error('Error reading constants.env:', err);
                res.redirect('installation_settings');
                return;
            }
            
            const result = data
                .replace('app_name' + '=' + app_name, 'app_name' + '=' + new_app_name)
                .replace('partner_panel_name' + '=' + partner_panel_name, 'partner_panel_name' + '=' + new_partner_panel_name)
                .replace('dispatcher_panel_name' + '=' + dispatcher_panel_name, 'dispatcher_panel_name' + '=' + new_dispatcher_panel_name)
                .replace('hotel_panel_name' + '=' + hotel_panel_name, 'hotel_panel_name' + '=' + new_hotel_panel_name);

            fs.writeFile('constants.env', result, 'utf8', function (err) {
                if (err) {
                    console.error('Error writing constants.env:', err);
                    res.redirect('installation_settings');
                    return;
                }
                
                constant_json.app_name = new_app_name;
                constant_json.partner_panel_name = new_partner_panel_name;
                constant_json.dispatcher_panel_name = new_dispatcher_panel_name;
                constant_json.hotel_panel_name = new_hotel_panel_name;

                message = success_messages.success_message_update;
                res.redirect('installation_settings');
            });
        });
    } catch (error) {
        console.error('Error updating app name:', error);
        res.redirect('installation_settings');
    }
};

exports.update_app_version = async function (req, res, next) {
    try {
        const setting = await Settings.findOne({});
        setting.android_user_app_version_code = (req.body.android_user_app_version_code).trim();
        setting.android_provider_app_version_code = (req.body.android_provider_app_version_code).trim();
        setting.ios_user_app_version_code = (req.body.ios_user_app_version_code).trim();
        setting.ios_provider_app_version_code = (req.body.ios_provider_app_version_code).trim();
        await setting.save();
        setting_detail = setting;
        message = success_messages.success_message_update;
        res.redirect('installation_settings');
    } catch (error) {
        console.error('Error updating app version:', error);
        res.redirect('installation_settings');
    }
};

exports.update_firebase_key = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const setting = await Settings.findOne({});
            if (setting) {
                setting.firebase_apiKey = (req.body.firebase_apiKey).trim();
                setting.firebase_authDomain = (req.body.firebase_authDomain).trim();
                setting.firebase_databaseURL = (req.body.firebase_databaseURL).trim();
                setting.firebase_projectId = (req.body.firebase_projectId).trim();
                setting.firebase_storageBucket = (req.body.firebase_storageBucket).trim();
                setting.firebase_messagingSenderId = (req.body.firebase_messagingSenderId).trim();
                await setting.save();
                res.redirect('installation_settings');
            }
        } catch (error) {
            console.error('Error updating firebase key:', error);
            res.redirect('installation_settings');
        }
    } else {
        res.redirect('/admin');
    }
};