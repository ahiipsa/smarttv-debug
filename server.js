"use strict";

var app     = require('express')(),
    http    = require('http').Server(app),
    io      = require('socket.io')(http),
    util    = require('util'),
    minimist= require('minimist');

var log = function () {
    util.log.apply(util.log, arguments);
    return;
};

var opt = minimist(process.argv.slice(2));

var config = {
    port: 3000
};

if(typeof opt.port !== 'undefined'){
    config.port = opt.port
}

app.get('/', function(req, res){
    res.send('server run');
    return;
});


io.on('connection', function(socket){
    log('client connection');
    
    socket.on('app:info', function (info) {
        log('app:info', info);
        io.sockets.emit('app:info', info);
    });

    socket.on('disconnect', function () {
        log('client disconnect');
    });

    socket.on('dev:eval', function (source) {
        log('eval', source);
        io.sockets.emit('dev:eval', source);
    });
});

http.listen(config.port, function(){
    log('listening on *:' + config.port);
});