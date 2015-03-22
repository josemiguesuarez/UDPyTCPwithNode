module.exports = function (StatusModel){

	var PORT = 33333;
	var HOST = '157.253.205.50';

	var dgram = require('dgram');
	var server = dgram.createSocket('udp4');

	server.on('listening', function () {
		var address = server.address();
		console.log('UDP Server listening on ' + address.address + ":" + address.port);
	});

	server.on('message', function (message, remote) {

		try{
			var status = JSON.parse(message.toString())
			status.serviceType = 'UDP';
			status.clientIP = remote.address;
			console.log(remote.address + ':' + remote.port +' - ' + status);
			StatusModel.create( status, function(err, todo) {
				if (err)
					console.log(err);
				var message = new Buffer('ok');
				server.send(message, 0, message.length, remote.port, remote.address, function(err, bytes) {
					if (err) {
						throw err;
						console.log(err);
					}
				});
			});
		}
		catch(err){
			console.log(err);
		}
		
	});

	server.bind(PORT, HOST);
	
}