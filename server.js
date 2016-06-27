// Load express and websocket modules
var express = require('express'),
	SocketServer = require('ws').Server;

// Initialize port from environment
// Let 3000 by default
var PORT = process.env.PORT || 3000;

// Initialize express on given port
var app = express();
	server = app.listen(PORT, () => console.log(`Listening on ${ PORT }`));

// Initialize web socket
var socketServer = new SocketServer({ server });

// Initialize connection from socket client	
socketServer.on('connection', (socket) => {
  	var STREAM_MAGIC_BYTES = 'jsmp', // Must be 4 bytes
		width = 320,
		height = 240;
	
	// Send magic bytes and video size to the newly connected socket
	// struct { char magic[4]; unsigned short width, height;}
	var streamHeader = new Buffer(8);
	streamHeader.write(STREAM_MAGIC_BYTES);
	streamHeader.writeUInt16BE(width, 4);
	streamHeader.writeUInt16BE(height, 6);
	socket.send(streamHeader, {binary:true});

	console.log('New socket connection ('+socketServer.clients.length+' total)');
	
	// Client is closing
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
