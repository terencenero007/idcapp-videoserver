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

// Set root directory for the static files
app.use(express.static(__dirname + "/"))

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
