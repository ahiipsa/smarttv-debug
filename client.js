"use strict";

var socket      = require('socket.io-client'),
    util        = require('util'),
    fs          = require('fs'),
    minimist    = require('minimist');

var log = function () {
    util.log.apply(util.log, arguments);
    return;
};

var opt = minimist(process.argv.slice(2));

var config = {
    host: 'http://localhost:3000',
    sourceFile: __dirname + '/eval.js'
};

// set config
if(typeof opt.h !== 'undefined'){
    config.host = opt.h
}

if(typeof opt.f !== 'undefined'){
    config.sourceFile = process.cwd() + '/' + opt.f;
}

// start
log('client start');
log('host:', config.host);
log('watch file for eval:', config.sourceFile);

var client = socket(config.host);

client.on('connect', function () {
    log('connect success');
});

client.on('connect_error', function (error) {
    log('connection error', error);
});

client.on('app:info', function (data) {
    log(data);
});

client.on('disconnect', function () {
    log('disconnect');
});

fs.watchFile(config.sourceFile, {persistent: false, interval: 200}, function () {
    fs.readFile(config.sourceFile, {encoding: 'utf8'}, function (err, data) {
        if (err) throw err;
        log('dev:eval', data);
        client.emit('dev:eval', data);
    });
});