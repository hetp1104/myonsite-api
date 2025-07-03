var sql = require('../../config/mysqlconnect');
var sql1 = require('../../config/mysqlconnect1');

var City = function (city)
{
        this.SysID = city.SysID; 
	this.Code = city.Code ;
	this.Name = city.Name ;
	this.StateCode = city.StateCode ;
	this.IsActive = city.IsActive ;
	this.CreatedBy = city.CreatedBy ;
	this.CreatedWhenDtm  = city.CreatedWhenDtm ;
	this.UpdatedBy = city.UpdatedBy ;
	this.UpdatedWhenDtm = city.UpdatedWhenDtm ;
	this.SyncWhenDtm = city.SyncWhenDtm ;
};

City.getAllCities = function (result) {
        sql.query("Select * from cities", function (err, res) {

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

City.getCityDetail= function(name,result) {
        sql.query("Select * from cities c where c.Name = ?",name, function (err, res) {
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



module.exports= City;