var sql = require('../../config/mysqlconnect');
var sql1 = require('../../config/mysqlconnect1');
var utils = require('../controllers/utils');
require('../controllers/constant');

var Provider = function provider()
{
        this.SysID = provider.SysID;
	this.UserID = provider.UserID; 
        this.UserEmail = provider.UserEmail  ;	
        this.UserName = provider.UserName ;
	this.Password = provider.Password  ;
	this.IsClientAdmin= provider.IsClientAdmin ;
	this.ClientID = provider.ClientID  ;
	this.DOB = provider.DOB ;
	this.UserType = provider.UserType ;
	this.IsActive = provider.IsActive ;
	this.IsVerified = provider.IsVerified  ;
	this.LabUserType = provider.LabUserType ;
	this.DefaultLab = provider.DefaultLab ;
	this.LabClinicID = provider.LabClinicID ;
	this.LabPhysicianID = provider.LabPhysicianID ;
	this.CreatedBy = provider.CreatedBy ;
	this.CreatedDtm = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
	this.UpdatedBy = provider.UpdatedBy ;
	this.UpdatedDtm = provider.UpdatedDtm ;
	this.ActivateDtm = provider.ActivateDtm ;
	this.DeactivateDtm = provider.DeactivateDtm ;
	this.VerifiedBy = provider.VerifiedBy ;
	this.VerifyDtm = provider.VerifyDtm ;
	this.Street = provider.Street ;
	this.Street1 = provider.Street1 ;
	this.City = provider.City ;
	this.State = provider.State ;
	this.Zip = provider.Zip ;
	this.PhoneNumber = provider.PhoneNumber ;
	this.FaxNo = provider.FaxNo ;
	this.Latitude = provider.Latitude ;
	this.Longitude = provider.Longitude ;
	this.GeocodeValidated = provider.GeocodeValidated ;
	this.GeocodeUpdateDtm = provider.GeocodeUpdateDtm ;
	this.Notes = provider.Notes ;
	this.VerificationCount = provider.VerificationCount ;
	this.ErrorFlag = provider.ErrorFlag ;
        this.FirstName = provider.FirstName ;
        this.LastName = provider.LastName ;
        this.Country = provider.Country ;
        this.CountryPhoneCode = provider.CountryPhoneCode ;
        this.Picture = provider.Picture ;
        this.DrawStatus = provider.DrawStatus ;
        this.LoginType = provider.LoginType ;
        this.LoginID = provider.LoginID ;
        this.SocialID = provider.SocialID ;
        this.DeviceTokenID = provider.DeviceTokenID ;
        this.AuthenticationToken = provider.AuthenticationToken ;
        this.IsDocumentUploaded = provider.IsDocumentUploaded ;
        this.Gender = provider.Gender ;
};

Provider.createProvider = function (newProvider, result) {
        var unique = utils.tokenGenerator(32);    
        var userid = "PB"+unique;
        sql1.query('select * from users u join phlebotomist p on u.UserEmail = p.UserEmail where u.UserEmail = "'+newProvider.UserEmail+'" OR p.SocialID = "'+newProvider.SocialID+'" OR u.PhoneNumber = "'+newProvider.PhoneNumber+'"', (err,rows,fields) =>
        {
        if(!rows)
        {
        sql1.query('INSERT INTO users (UserID,UserEmail,UserName,Password,IsClientAdmin,ClientID,UserType,IsActive,IsVerified,CreatedBy,CreatedDtm,Street,Street1,City,State,Zip,PhoneNumber,GeocodeValidated,VerificationCount) values ("'+userid+'","'+newProvider.UserEmail+'","'+newProvider.FirstName+newProvider.LastName+'","'+newProvider.Password+'",0,"indralok",5,1,0,"DEMO","'+newProvider.CreatedDtm+'","'+newProvider.Street+'","'+newProvider.Street1+'","'+newProvider.City+'","'+newProvider.State+'","'+newProvider.Zip+'","'+newProvider.PhoneNumber+'",0,0)', function (err, res) {
                
                if(err) {
                    var dat = {
                       success: 'false',
                       message: err.sqlMessage
                               };
                    console.log("error: ", err);
                    result(dat, null);
                }
                else{
                    console.log("user");
                   // result(null, res);

                    sql1.query('INSERT INTO phlebotomist (UserID,FirstName,LastName,Country,CountryPhoneCode,Picture,DrawStatus,LoginType,LoginID,SocialID,DeviceTokenID,AuthenticationToken ,IsDocumentUploaded,Gender) values ("'+userid+'","'+newProvider.FirstName+'","'+newProvider.LastName+'","'+newProvider.Country+'","'+newProvider.CountryPhoneCode+'","'+newProvider.Picture+'",'+newProvider.DrawStatus+',"'+newProvider.LoginType+'","'+newProvider.LoginID+'","'+newProvider.SocialID+'","'+newProvider.DeviceTokenID+'","'+newProvider.AuthenticationToken+'",'+newProvider.IsDocumentUploaded+',"'+newProvider.Gender+'")', function (err, res) {
                
                        if(err) {
                            console.log("error: ", err);
                            result(err, null);
                        }
                        else{
                            console.log(res);
                            result(null, res);
                        }
                    });
                }
            }); 
           }
          else
           {
             var jsondata = JSON.stringify(rows);
             var data = JSON.parse(jsondata);
             console.log(data);
             
             if(data.UserEmail == newProvider.UserEmail || data.SocialID == newProvider.UserEmail)
              {
                 res.json({success: false, error_code: error_message.ERROR_CODE_EMAIL_ID_ALREADY_REGISTERED});
              }
             if(data.PhoneNumber == newProvider.PhoneNumber)
              {
                 res.json({success: false, error_code: error_message.ERROR_CODE_PHONE_NUMBER_ALREADY_USED});
              }
           }
           });          
};

Provider.checkProviderPhone = function (phone, result) {    
        sql1.query('select * from users where PhoneNumber = ?',phone,function (err, res) {
             
                if(result != null) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log("___2"+res);
                    result(null, res);
                }
            });           
};


Provider.checkProviderSocialID = function (email, result) {    
        sql1.query('SELECT * from users u join phlebotomist p on u.UserID = p.UserID where p.SocialID = "'+email+'"', function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log(res);
                    result(null, res);
                }
            });           
};


Provider.checkProviderEmail = function (email, result) {    
        sql1.query('SELECT * from users u join phlebotomist p on u.UserID = p.UserID where u.UserEmail = "'+email+'"', function (err, res) {
                
                if(err) {
                    console.log("error: ", err);
                    result(err, null);
                }
                else{
                    console.log("______1"+res);
                    result(null, res);
                }
            });           
};

Provider.updateProvider = function (token,id,email,result) {    
        sql1.query('UPDATE phlebotomist p join users u on p.UserID = u.UserID SET p.AuthenticationToken = "'+token+'",p.DeviceTokenID = "'+id+'" WHERE u.UserEmail = "'+email+'" OR SocialID = "'+email+'"', function(err, res) {
             
                if(err) {
                            console.log("error: ", err);
                            result(err, null);
                        }
                        else{
                            console.log(res);
                            result(null, res);
                        }
            });           
};
module.exports = Provider;