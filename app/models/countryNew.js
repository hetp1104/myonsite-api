var sql = require('../../config/mysqlconnect');
var sql1 = require('../../config/mysqlconnect1');

var Country = function country()
{
        this.Code = country.Code ;
	this.Name = country.Name ;
	this.IsActive = country.IsActive ;
	this.CreatedBy = country.CreatedBy ;
	this.CreatedWhenDtm = country.CreatedWhenDtm ;
	this.UpdatedBy = country.UpdatedBy ;
	this.UpdatedWhenDtm = country.UpdatedWhenDtm ;
	this.SyncWhenDtm = country.SyncWhenDtm ;
};

Country.getAllCountries = function (result) {
        sql.query("select c.Code as 'CountryCode', c.Name as 'CountryName', s.Code as 'StateCode',s.Name as 'StateName', s.IsActive as 'IsStateActive', ci.SysID as 'CityID',ci.Code as 'CityCode', ci.Name as 'CityName', ci.IsActive as 'IsCityActive' from country c join states s on c.Code = s.CountryCode join cities ci on s.Code = ci.StateCode", function (err, res) {

                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('tasks : ', res);  

                 result(null, res);
                }
            });   
};

Country.getCitiesByState = function (statecode,result) {
        sql.query('select * from cities c where c.StateCode = ?',[statecode], function(err, res) {
                console.log('cities : ', res); 
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('cities : ', res);  

                 result(null, res);
                }
            });   
};

Country.getCountryDetail= function (name,result) {
        sql.query('select * from country c where c.Name = ?',name, function(err, res) {
                console.log('country : ', res); 
                if(err) {
                    console.log("error: ", err);
                    result(null, err);
                }
                else{
                  console.log('country : ', res);  

                 result(null, res);
                }
            });   
};


module.exports = Country;
