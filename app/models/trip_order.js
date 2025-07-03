/*** 
 * Trip Order Model 
 * Crated By: Ketan Prajapati
 * Created Date: 11-May-2021
 * ***/
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TripOrder = new Schema({
    trip_id:{ type: Schema.Types.ObjectId },
    user_id:{ type: Schema.Types.ObjectId },
    provider_id: { type: Schema.Types.ObjectId },
    phlebotomistid: {type: String, default: ""},
    service_type_id: { type: Schema.Types.ObjectId },
    latitude: { type: Number },
    longitude: { type: Number },
    trip_type: {type: String, default: ""},
    start_time: {type: Date, default: null},
    source_address: {type: String, default: ""},
    destination_address: {type: String, default: ""},
    d_longitude: { type: Number },
    d_latitude: { type: Number },
    requisitionsysid: {type: String, default: ""},
    destination: {
        labsysid:{type: String, default: ""},
        code:{type: String, default: ""},
        street:{type: String, default: ""},
        street1:{type: String, default: ""},
        city:{type: String, default: ""},
        state:{type: String, default: ""},
        zip:{type: String, default: ""},
        country:{type: String, default: ""}
    },
    order: {
        patient: {
            user_id: {type: String, default: ""},
            external_patient_id: {type: String, default: ""},
            user_patient_id: {type: String, default: ""},
            firstname: {type: String, default: ""},
            lastname: {type: String, default: ""},
            email: {type: String, default: ""},
            primaryphone: {type: String, default: ""},
            gender: {type: String, default: ""},
            dob:{type: Date, default: null},
            mrn: {type: String, default: ""},
            age: {type: String, default: ""},
            patientprofilepicture: {type: String, default: ""},
            phid: { type: String, default: "" }, // New field
            patient_type: { type: String, default: "" }, // New field
            address:{
                street: {type: String, default: ""},
                city: {type: String, default: ""},
                citycode: {type: String, default: ""},
                citysysid: {type: Number, default: 0},
                state: {type: String, default: ""},
                statecode: {type: String, default: ""},
                country: {type: String, default: ""},
                countrycode: {type: String, default: ""},
                zip: {type: String, default: ""},
                latitude: {type: Number, default: 0},
                longitude: {type: Number, default: 0},
            }
        },
        clinic:{
            sysid: {type: String, default: ""},
            code: {type: String, default: ""},
            name: {type: String, default: ""}
        },
        physician: {
            sysid: {type: String, default: ""},
            code: {type: String, default: ""},
            name: {type: String, default: ""}
        },
        orderlist: [{
            id: {type: String, default: ""},
            proceduresysid: {type: String, default: ""},
            proceduretype: {type: String, default: ""},
            testcode: {type: String, default: ""},
            testname: {type: String, default: ""},
            procedure_loincode: {type: String, default: ""},
            print_seq: {type: String, default: ""},
            processseq: {type: String, default: ""},
            stat: {type: Boolean, default: false},
            iswaived: {type: Boolean, default: false},
            status: {type: String, default: ""},
            scheduledate: {type: Date, default: null},
            results: [{
                id: {type: String, default: ""},
                requisitionsysid: {type: Number, default: 0},
                patientsysid: {type: Number, default: 0},
                proceduresysid: {type: Number, default: 0},
                procedurecode: {type: String, default: ""},
                procedurename:  {type: String, default: ""},
                status:  {type: String, default: ""},
                operationstatus: {type: String, default: ""},
                resulttype: {type: String, default: ""},
                resalpha: {type: String, default: ""}
            }],
            specimens:[{
                id:  {type: String, default: ""},
                requisitionsysid:  {type: Number, default: 0},
                specimenid:  {type: String, default: ""},
                parentspecid:  {type: String, default: ""},
                ownerid:  {type: String, default: ""},
                sequencenumber: {type: Number, default: 0},
                operationstatus: {type: String, default: ""},
                specimenuserid: {type: String, default: ""},
                scheduledate:  {type: Date, default: null},
                collectiondate: {type: Date, default: null},
                receiveddate: {type: Date, default: null},
                expiredate:  {type: Date, default: null},
                status: {type: String, default: ""},
                shipmentstatus: {type: String, default: ""},
                isactive: {type: String, default: ""},
                specimencode: {type: String, default: ""},
                specimenname: {type: String, default: ""},
                studyid: {type: Number, default: 0},
                noofaliquot: {type: Number, default: 0},
                isspecimenhandlingnotes: {type: String, default: ""}
            }]
        }],
        diagcodes:[{
            sysid: {type: Date, default: null},
            code: {type: String, default: ""},
            name: {type: String, default: ""},
            type: {type: String, default: ""}
        }],
        lis_created_time:{
            type: Date,
            default: Date.now
        }
    },
    drop_off_location: {type: String, default: ""}, // New field for DROP_OFF_LOCATION
    location_account_number: {type: String, default: ""} // New field for LOCATION_ACCOUNT_NUMBER
});

TripOrder.index({trip_id: 1}, {background: true});
module.exports = mongoose.model('trip_order', TripOrder);