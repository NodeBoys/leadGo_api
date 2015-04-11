var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var mongojs = require('mongojs');
var Promise = require("bluebird");

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var db = mongojs('127.0.0.1/leadgo');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer({}));

app.get('/', function(req, res) {
    res.send('test');
});

var teams = db.collection('teams');

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
    // teams.insert(req.body, function (err, team){
    //     console.log(team);
    // });

    Promise.resolve(
        teams.insert(req.body)
    )
    .then(function (err, team){
        console.log(2);
        console.log(team);
        res.json({
            data: team
        });
    })
    .error(function (err){
        console.log(3);
        res.json({
            error: err
        });
    })
    .catch(function (e){
        console.log(4);
        res.json({
            error: e
        });
    });
    // console.log(req.body);

    // res.send('create teams');
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