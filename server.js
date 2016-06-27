var server = require('http').createServer(), 
	url = require('url'),
	WebSocketServer = require('ws').Server,
	socketServer = new WebSocketServer({ server: server }),
	express = require('express'),
	app = express();

var STREAM_MAGIC_BYTES = 'jsmp', // Must be 4 bytes
	width = 320,
	height = 240,
	port = 3000;
	
// Client connecting to the socket
socketServer.on('connection', function(socket) {
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {binary:true});

	console.log('New socket connection ('+socketServer.clients.length+' total)');
	
	socket.on('close', function(code, message){
		console.log('Disconnected socket ('+socketServer.clients.length+' total)');
	});
});

// Broadcast the given data to all the connected clients in the socket
socketServer.broadcast = function(data, opts) {
	for( var i in this.clients ) {
		if (this.clients[i].readyState == 1) {
			this.clients[i].send(data, opts);
		}
		else {
			console.log('Error: client ('+i+') not connected');
		}
	}
};

// default GET API
app.get('/', function (req, res) {
  res.send('IDC video server is up...');
});

// Streaming API to accept incoming stream
app.use("/video", function (req, res) {
	res.connection.setTimeout(0);
	
	console.log(
			'Stream connected: ' + 
			req.socket.remoteAddress + ':' + 
			req.socket.remotePort
		);
		
	// Pass the icoming data to the socket
	req.on('data', function(data){
		socketServer.broadcast(data, {binary:true});
	});
});

// Initialize server on given port
server.on('request', app);
server.listen(port, function () { console.log('Server started on ' + server.address().port) });
