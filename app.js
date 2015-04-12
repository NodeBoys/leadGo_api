var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var multer  = require('multer');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);

var mongojs = require('mongojs'),
    db = mongojs('leadGo', ['teams', 'cars']);


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

    res.send(data);
});

app.post('/teams', function (req, res){
    /*
     * 將 team 的資料存入資料庫
     */
    if(!req.body.name)  return res.send({status:403, message:'沒錢跟人開蝦小房間'});
    if(!req.body.leader) return res.send({status:403, message:'沒人跟人開蝦小房間'});

    var team = {};
    team.name = req.body.name;
    team.status = true;
    team.create = moment().unix();
    team.leader = req.body.leader;
    team.members = [];

    db.teams.insert(team, function(err, team){
        if(err) res.send({status:500, message:'房間不給你開', errors:err});
        else{
            res.send({status:200, message:'房間開好了', data:team});
        }
    });


});

app.post('/teams/join', function (req, res){

    /*
     * 某個 socket id 加入 team
     */
    var name = req.body.name,
        teamId = req.body.socketId;

    if(!name) res.send({status:403, message:'沒名字加入蝦小隊伍'});
    if(!teamId) res.send({status:403, message:'沒隊伍ID加入蝦小隊伍'});

    db.teams.update({leader:teamId}, {'$push':{members:name}}, function(err, team){
        if(err) res.send({status:500, message:'不給你加勒', errors:err});
        else{
            res.send({status:200, message:'加入成功！謝恩吧！', data:team});
        }
    });
});

app.post('/teams/leave/:teamId', function (req, res){

    /*
     * 離開某個 team
     */
    var name = req.body.name,
        teamId = req.params.teamId;

    if(!name) res.send({status:403, message:'沒名字離開蝦小隊伍'});

    db.teams.update({leader:teamId}, {'$pull':{members:name}}, function(err, team){
        if(err) res.send({status:500, message:'不要走', errors:err});
        else{
            res.send({status:200, message:'離開隊伍成功！滾吧！', data:team});
        }
    });
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
