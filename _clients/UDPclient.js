var PORT = 33333;
var HOST = '127.0.0.1';

var dgram = require('dgram');
var client = dgram.createSocket('udp4');

var data = {
	clientID: 0,
	lat: 4 + Math.random(),
	lng: -74 + Math.random(),
	alt: 3600*Math.round(60 * Math.random()),
	vel: Math.round(60 * Math.random())
}
var message = new Buffer(JSON.stringify(data));
client.send(message, 0, message.length, PORT, HOST, function(err, bytes) {
    if (err) {
    	throw err;
    	console.log(err);
    }
    console.log('UDP message sent to ' + HOST +':'+ PORT);
    
});

client.on('message', function (message, remote) {
    console.log(remote.address + ':' + remote.port +' - ' + message);
    client.close();
});