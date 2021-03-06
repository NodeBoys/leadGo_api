var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var moment = require('moment');
var multer  = require('multer');
var mongojs = require('mongojs');
var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('debug')('leadGo');

var app = express();
var server = http.Server(app);
var io = require('socket.io')(server);
var db = mongojs('127.0.0.1/leadgo');

var mongojs = require('mongojs'),
    db = mongojs('leadGo', ['teams', 'cars']);


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

    // TODO: 之後要用 Promise 改寫
    teams.find({}, function (err, teams){

        debug('error = %j', err);
        debug('teams = %j', teams);

        if(err){
            return res.json({
                error: err
            });
        }

        return res.json({
            data: teams
        });
    });
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

    if(!name) return res.send({status:403, message:'沒名字加入蝦小隊伍'});
    if(!teamId) return res.send({status:403, message:'沒隊伍ID加入蝦小隊伍'});

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

    socket.on('create', function (data){

        debug('create team data = %j', data);

        socket.join(data.room);
    });

    socket.on('join', function (data){

        debug('join team data = %j', data);

        socket.join(data.room);
    });

    socket.on('leave', function (data){

        debug('leave team data = %j', data);

        socket.leave(data.room);
    });

    socket.on('location', function (data) {

        debug('location data = %j', data);

        io.to(data.room).emit('res', data);
    });
});
