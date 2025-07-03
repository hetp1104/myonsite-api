var providerdocument = require('../../app/controllers/providerdocument'); // include providerdocument controller ////


module.exports = function (app) {
    app.route('/uploaddocument').post(providerdocument.uploaddocument);
    app.route('/getproviderdocument').post(providerdocument.getproviderdocument);
    app.route('/getDocumentList').post(providerdocument.getDocumentList);
    app.route('/uploadPhlebDocument').post(providerdocument.uploadPhlebDocument);


};





