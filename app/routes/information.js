var information = require('../controllers/information');

module.exports = function (app) {
	app.route('/getallinformationpage').post(information.list);
	app.route('/getinformationpage').post(information.page_detail);
	app.get('/terms', information.render); // checked this route on 21-02-2022 and it is not working 
	app.get('/development_company', information.render);
};



