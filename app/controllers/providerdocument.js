var Provider_Document = require('mongoose').model('Provider_Document');
var Provider = require('mongoose').model('Provider');
var utils = require('./utils');
var console = require('./console');
//////////////// GET PROVIDER DOCUMENT /////////////
var utils = require('./utils');
var sql = require('../../config/mysqlconnect');
var sql1 = require('../../config/mysqlconnect1');
var path = require('path');


exports.getDocumentList = function(req,res)
{
  if(req.body.UserID != null && req.body.AuthenticationToken!= null)
    {
         sql1.query('select * from users u where u.UserID = "'+req.body.USerID+'" and u.AuthenticationToken = "'+req.body.AuthenticationToken+'"',(err,rows,fields) => 
         {
            if(err) 
              {
                  res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN});
              }
            else
              {
                   sql.query('select * from documentmaster',(err,rows,fields) => 
                     {
                      if(err) 
                       {
                        res.json({success: false, error_code: error_message.ERROR_CODE_DOCUMENT_NOT_FOUND});
                       }
                      else
                       {
                           var jsondata = JSON.stringify(rows);
                           var data = JSON.parse(jsondata);

                           res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_DOCUMENT_LIST_SUCCESSFULLY,
                                    providerdocument: data
                                });

                       }
                     });
              }
         }); 
    }
  else
    {
         res.json({
                success: false,
                error_code: response.error_code,
                error_description: response.error_description
            });

    }
};

exports.getproviderdocument = function (req, res) {

    utils.check_request_params(req.body, [{name: 'provider_id', type: 'string'}], function (response) {
        if (response.success) {
            Provider.findOne({_id: req.body.provider_id}).then((provider) => {
                if (provider) {
                    // if (req.body.token != null && !utils.validate_token(req.body.token)) {
                    //     res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN});
                    // } else {

                        Provider_Document.find({provider_id: req.body.provider_id}).then((providerdocument) => {

                            if (providerdocument.length == 0) {
                                res.json({success: false, error_code: error_message.ERROR_CODE_DOCUMENT_NOT_FOUND});
                            } else {
                                res.json({
                                    success: true,
                                    message: success_messages.MESSAGE_CODE_FOR_PROVIDER_GET_DOCUMENT_LIST_SUCCESSFULLY,
                                    providerdocument: providerdocument
                                });

                            }

                        });
                   // }
                } else {
                    res.json({success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND});

                }
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


// upload  document image

exports.uploadPhlebDocument = function(req,res)
{
   if(req.body.UserID != null && req.body.AuthenticationToken!= null)
   {
    console.log(req.body.UserID);
    sql1.query('select * from users u join phlebotomist p on u.UserID = p.UserID where u.UserID = "'+req.body.UserID+'" and p.AuthenticationToken = "'+req.body.AuthenticationToken+'"',(err,rows,fields) => 
    {
       if(err) 
         {
             console.log(err);
             res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN});
         }
       else
         {
                      var url = "";
                      var pictureData = req.body.FilePath;
                      if (pictureData != "" && pictureData != undefined) {
                          //utils.deleteImageFromFolder(providerdocument.document_picture, 3);
                          var image_name = req.body.DocMasterID + utils.tokenGenerator(4);
                          url = utils.getImageFolderPath(req, 6) + image_name + '.jpg';
                         // providerdocument.document_picture = url;
                          utils.saveImageAndGetURL(image_name + '.jpg', req, res, 3);
                      }

                      if (req.files != undefined && req.files.length > 0) {
                         // utils.deleteImageFromFolder(providerdocument.document_picture, 3);
                          var image_name = req.body.DocMasterID + utils.tokenGenerator(4);
                          url = utils.getImageFolderPath(req, 6) + image_name + '.jpg';
                         // providerdocument.document_picture = url;

                          utils.saveImageFromBrowser(req.files[0].path, image_name + '.jpg', 3);

                      }
              sql.query('insert into phleb_document (DocMasterID,PhlebotomistID,FileName,FIlePath) values ('+req.body.DocMasterID+',"'+req.body.PhlebotomistID+'","'+req.body.FileName+'","'+url+'")',(err,rows,fields) => 
                {
                 if(err) 
                  {
                   res.json({success: false, error_code: error_message.ERROR_CODE_DOCUMENT_NOT_FOUND});
                  }
                 else
                  {
                      var jsondata = JSON.stringify(rows);
                      var data = JSON.parse(jsondata);
                      
                      var response = {};
                      response.UserID = req.body.UserID;
                      response.DocMasterID = req.body.DocMasterID;
                      response.PhlebotomistID = req.body.PhlebotomistID;
                      response.FileName = req.body.FileName;
                      response.FilePath = url;
                      response.DocumentDattus = 1;

                      res.json({
                               success: true,
                               message: success_messages.MESSAGE_CODE_USER_DOCUMENT_IMAGE_UPLOAD_SUCCESSFULLY,
                               providerdocument: response
                           });
                  }
                });
         }
    }); 
   }
   else
   {
    console.log("error____");
    res.json({
        success: false,
        error_code: response.error_code,
        error_description: response.error_description
    });
   }
};

exports.uploaddocument = function (req, res) {

    utils.check_request_params(req.body, [{name: 'document_id', type: 'string'},{name: 'provider_id', type: 'string'}], function (response) {
        if (response.success) {
            Provider.findOne({_id: req.body.provider_id}).then((provider_detail) => {
                if (provider_detail) {
                    // if (req.body.token != null && !utils.validate_token(req.body.token)) {
                    //     res.json({success: false, error_code: error_message.ERROR_CODE_INVALID_TOKEN});
                    // } else {
                        Provider_Document.findOne({
                            document_id: req.body.document_id,
                            provider_id: req.body.provider_id
                        }).then((providerdocument) => {
                            if (providerdocument) {
                                var pictureData = req.body.pictureData;
                                if (pictureData != "" && pictureData != undefined) {
                                    //utils.deleteImageFromFolder(providerdocument.document_picture, 3); //HArsh
                                    var image_name = providerdocument._id + utils.tokenGenerator(4);
                                    var url = utils.getImageFolderPath(req, 3) + image_name + '.jpg';
                                    providerdocument.document_picture = url;
                                    utils.saveImageAndGetURL(image_name + '.jpg', req, res, 3);
                                }

                                if (req.files != undefined && req.files.length > 0) {
                                    //utils.deleteImageFromFolder(providerdocument.document_picture, 3); //HArsh
                                    
                                    /*Start: Get Original File Extension to Store - Ketan*/
                                    var extension = path.extname(req.files[0].originalname);
                                    /*End: Get Original File Extension to Store - Ketan*/

                                    var image_name = providerdocument._id + utils.tokenGenerator(4);
                                    var url = utils.getImageFolderPath(req, 3) + image_name + extension;  //Instead Jpg, added actual extension - Ketan
                                    providerdocument.document_picture = url;

                                    utils.saveImageFromBrowser(req.files[0].path, image_name + extension, 3);

                                }

                                providerdocument.is_uploaded = 1;
                                providerdocument.unique_code = req.body.unique_code;
                                providerdocument.expired_date = req.body.expired_date;
                                providerdocument.is_document_expired = false;
                                providerdocument.save().then(() => {
                                    Provider_Document.find({
                                        provider_id: req.body.provider_id,
                                        option: 1,
                                        is_uploaded: 0
                                    }).then((document_list) => {

                                        Provider_Document.find({
                                            provider_id: req.body.provider_id,
                                            option: 1,
                                            is_document_expired: true
                                        }).then((expired_document_list) => {

                                            if (expired_document_list.length == 0) {
                                                provider_detail.is_documents_expired = false;
                                            } else {
                                                provider_detail.is_documents_expired = true;
                                            }
                                            if (document_list.length == 0) {
                                                provider_detail.is_document_uploaded = 1;
                                            } else {
                                                provider_detail.is_document_uploaded = 0;
                                            }

                                            provider_detail.save().then(() => {
                                                res.json({
                                                    success: true,
                                                    message: success_messages.MESSAGE_CODE_USER_DOCUMENT_IMAGE_UPLOAD_SUCCESSFULLY,
                                                    document_picture: providerdocument.document_picture,
                                                    unique_code: providerdocument.unique_code,
                                                    expired_date: providerdocument.expired_date,
                                                    is_uploaded: providerdocument.is_uploaded,
                                                    is_document_uploaded: provider_detail.is_document_uploaded,
                                                    is_documents_expired: provider_detail.is_documents_expired
                                                });

                                            });
                                        });
                                    });
                                }, (err) => {
                                    console.log(err);
                                    res.json({
                                        success: false,
                                        error_code: error_message.ERROR_CODE_SOMETHING_WENT_WRONG
                                    });
                                });

                            } else {
                                res.json({success: false, error_code: error_message.ERROR_CODE_PROVIDER_DOCUMENT_LIST_NOT_FOUND});

                            }

                        });
                   // }
                } else {
                    res.json({success: false, error_code: error_message.ERROR_CODE_PROVIDER_DETAIL_NOT_FOUND});

                }
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