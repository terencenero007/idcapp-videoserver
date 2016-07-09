// Load express and websocket modules
var express = require('express'),
	SocketServer = require('ws').Server;

// Initialize the port from the environment variable
// Let 3000 by default
var PORT = process.env.PORT || 3000;

// Initialize the server on the given port
var app = express();
server = app.listen(PORT, () => console.log(`Listening on ${PORT}`));

// Initialize web socket on the server
var socketServer = new SocketServer({ server });

// Initialize connection request from a socket client	
socketServer.on('connection', (socket) => {
	console.log('New socket connection (' + socketServer.clients.length + ' total)');

	// Close notification from a client
	socket.on('close', function (code, message) {
		console.log('Disconnected socket (' + socketServer.clients.length + ' total)');
	});
});

// Broadcast the given data to all the connected clients
socketServer.broadcast = function (data, opts) {
	for (var i in this.clients) {
		if (this.clients[i].readyState == 1) {
			this.clients[i].send(data, opts);
		}
		else {
			console.log('Error: client (' + i + ') not connected');
		}
	}
};

// Set root directory for the static files
app.use(express.static(__dirname + "/"))

// default GET API
app.get('/', function (req, res) {
	res.send('IDC video server is up...');
});

// Streaming API to accept incoming video stream and broadcast to all the connected clients
app.post("/video", function (req, res) {
	// console.log('Stream connected: ' + req.socket.remoteAddress + ':' + req.socket.remotePort);

	// Read stream from the incoming request
	// Append each chunks while streaming
	var dataBuffer = null, newBuffer, bufferLength;
	req.on('data', function (data) {
		if (dataBuffer == null) {
			dataBuffer = data;
		}
		else {
			bufferLength = data.length + dataBuffer.length;
			newBuffer = Buffer.concat([dataBuffer, data], bufferLength);
			dataBuffer = newBuffer;
		}
	});

	// Broadcast data to the connected clients after reading the stream
	req.on('end', function () {
		console.log("Stream completed " + dataBuffer.length);
		socketServer.broadcast(dataBuffer, { binary: true });
		res.sendStatus(200);
	});
});