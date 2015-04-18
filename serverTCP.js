module.exports = function (StatusModel){

	var net = require('net');
	var HOST = '172.20.10.2';
	//var HOST = '157.253.205.50';
	var PORT = 6969;

	net.createServer(function(sock) {

		sock.on('data', function(data) {
			try{
				sock.setEncoding('utf8');
				var status = JSON.parse(data.toString())
				status.serviceType = 'TCP';
				status.clientIP = sock.remoteAddress;
				console.log('DATA ' + sock.remoteAddress + ': ' + JSON.stringify(status));
				StatusModel.create( status, function(err, todo) {
					if (err){
						console.log(err);
						sock.end('err')
					}	
					else{
						sock.end('ok');
					}

				});
			}catch(err){
				console.log(err)
			}


		});

	}).listen(PORT, HOST);

	console.log('TCP Server listening on ' + HOST +':'+ PORT);
	
}