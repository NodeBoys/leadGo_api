var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({}));

app.get('/', function(req, res) {
    res.send('test');
});

app.get('/teams', function (req, res){

    /*
     * 去資料庫把所有的 teams 抓出來
     */
    console.log(req.query);

    res.send('get teams');
});

app.post('/teams', function (req, res){

    /*
     * 將 team 的資料存入資料庫
     */
    console.log(req.body);

    res.send('create teams');
});

app.post('/teams/join', function (req, res){

    /*
     * 某個 socket id 加入 team
     */
    console.log(req.body);

    res.send('join teams');
});

app.post('/teams/leave/:teamId', function (req, res){

    /*
     * 離開某個 team
     */
    console.log(req.body);

    res.send('leave teams');
});

app.set('port', 9000);

server.listen(app.get('port'), function() {
    console.log('Listen port ' + app.get('port'));
});

io.on('connection', function(socket) {

    socket.on('location', function(data) {

        
        console.log(data);

        socket.join(data.room);

        io.to(data.room).emit('res', {
            data: 'get your data : ' + data.data,
            room: 'get your data : ' + data.room
        });
    });
});