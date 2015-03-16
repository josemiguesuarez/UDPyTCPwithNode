var net = require('net');

var HOST = '127.0.0.1';
var PORT = 6969;

setInterval(function() {
    peticion();
}, 2000);

var peticion = function(){
    var data = {
        clientID: 0,
        lat: 4.617 + Math.round(1000 * Math.random())*0.00001,
        lng: -74.099+ Math.round(1000 * Math.random())*0.00001,
        alt: 3600*Math.round(60 * Math.random()),
        vel: Math.round(60 * Math.random())
    }
    var message = new Buffer(JSON.stringify(data));

    var client = new net.Socket();
    client.setEncoding('utf8');
    client.connect(PORT, HOST, function() {

        console.log('CONNECTED TO: ' + HOST + ':' + PORT);
        client.write(message);
        
    });
    client.on('data', function(message) {
        console.log(message)
        client.destroy();
    });
}

