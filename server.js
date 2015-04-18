// define model =================
var mongoose        = require('mongoose');                     // mongoose for mongodb
mongoose.connect('mongodb://josemigue:josesulo@54.81.180.188:61370/momapp');


var db = mongoose.connection;
db.once('open', function (callback) {
  console.log('Conectado a mongodb');
});
db.on('error', console.error.bind(console, 'connection error:'));

var ObjectId = mongoose.Schema.Types.ObjectId;
var Schema = mongoose.Schema;

var StatusSchema = new Schema({
	serviceType:String, 
	clientID: String,
	clientIP:String,
	lat: Number,
	lng: Number,
	alt: Number,
	vel: Number

})
var StatusModel = mongoose.model('Status', StatusSchema );

var UserSchema = new Schema({ 
	username: String,
	password: String,
	name: String,
	type: String,
	_gerencia: ObjectId
})
var User = mongoose.model('User', UserSchema );


//Run HTTP Server
var HTTPServer = require('./serverHttp.js');
HTTPServer(StatusModel, User);

//Run UDP Server
var UDPServer = require('./serverUDP.js');
UDPServer(StatusModel);

//Run TCP Server
var TCPServer = require('./serverTCP.js');
TCPServer(StatusModel);





