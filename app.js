var http = require('http');
var express = require('express');
var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);


app.get('/', function(req, res) {
    res.send('test');
});


app.set('port', 9000);

server.listen(app.get('port'), function() {
    console.log('Listen port ' + app.get('port'));
});

io.on('connection', function(socket) {

    var token = 'myRoom';
    console.log('token', token);
    socket.join(token);

    socket.on('location', function(data) {

        console.log(data);

        io.to(token).emit('res', {
            data: 'get your room : ' + token
        });
    });
});