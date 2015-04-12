var http = require('http');
var express = require('express');
var bodyParser = require('body-parser');
var multer  = require('multer');
var mongojs = require('mongojs');
var Promise = require('bluebird');
var _ = require('lodash');
var debug = require('debug')('leadGo');

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

    // TODO: 之後要用 Promise 改寫
    if(!req.body.name){
        return res.json({
            error: new Error('需要 team name') + ''
        })
    }

    if(!req.body.leader){
        return res.json({
            error: new Error('需要 leader socket token') + ''
        })
    }

    var options = _.pick(req.body, 'name', 'leader');
    options.members = [];
    options.createdAt = Date.now();
    options.updatedAt = Date.now();

    debug('options is = %j', options);

    teams.insert(options, function (err, team){
        
        debug('error = %j', err);
        debug('create new team = %j', team);

        if(err){
            return res.json({
                error: err
            });
        }

        return res.json({
            data: team
        });
    });
});

app.post('/teams/join', function (req, res){

    /*
     * 某個 socket id 加入 team
     */

    if(!req.body.name){
        return res.json({
            error: new Error('需要 team name') + ''
        })
    }

    if(!req.body.member){
        return res.json({
            error: new Error('需要 member socket token') + ''
        })
    }

    teams.findAndModify({
        query: { name: req.body.name },
        update: { $push: { members: req.body.member } }
    }, function(err, doc, lastErrorObject) {
        if(err){
            return res.json({
                error: err + ''
            });
        }

        return res.json({
            data: doc
        });
    });
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