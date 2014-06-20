var static = require('node-static');
var https = require('https');
var fs = require('fs');
var file = new(static.Server)();
var privateKey = fs.readFileSync('fakekeys/privatekey.pem').toString(),
    certificate = fs.readFileSync('fakekeys/certificate.pem').toString();
var app = https.createServer({key: privateKey, cert:certificate},function (req, res) {
  file.serve(req, res);
}).listen(9000);

var io = require('socket.io').listen(app);

// var SerialPort = require("serialport").SerialPort;
// var serialPort = new SerialPort("/dev/ttyUSB0", {
//       baudrate: 9600
//     }, false); 

// This will make all the files in the current folder
// accessible from the web

	
// This is the port for our web server.
// you will need to go to http://localhost:8080 to see it

// If the URL of the socket server is opened in a browser


// var SerialPort = require("serialport").SerialPort;
// var serialPort = new SerialPort("/dev/ttyUSB0", {
//       baudrate: 9600
//     }, false);

// Delete this row if you want to see debug messages
io.set('log level', 1);



// Listen for incoming connections from clients
io.sockets.on('connection', function (socket) {



	socket.on('time', function (data){
		socket.broadcast.emit('time', data);
	});




	socket.on('message', function (message) {
		console.log((new Date()) + ' Received Message, broadcasting: ' + message);
      socket.broadcast.emit('message', message);
	});


	

	socket.on('logined',function(data)
    {
        socket.broadcast.emit('logNow',data);
    });

	
	socket.on('catching', function (data) {
		socket.broadcast.emit('color', data); // Broadcasts event to everyone except originating client
	});

	
	// Listen for mouse move events
	socket.on('mousemove', function (data) {
		socket.broadcast.emit('mousemoving', data);
	});

	socket.on('touchmove', function (data) {
		socket.broadcast.emit('touchmoving', data); // Broadcasts event to everyone except originating client
	});
	

	socket.on('note', function (data){
		socket.broadcast.emit('note', data);
	});


	socket.on('disconnect', function(){
		socket.broadcast.emit('disconnect');
	});


	socket.on('serial', function (data){
		socket.broadcast.emit('drawing', data);
	});

	// serialPort.open(function () {
	//   console.log('open');
	//   serialPort.on('data', function(data) {
	//     console.log('data received: ' + data);
	//     socket.emit('drawing',data);
	//     socket.broadcast.emit('drawing')
	//     // socket.broadcast.emit('remote', data);
	//   });   
	// });
	


});



