"use strict";

(function (window) {
    var socket;
    var originLog   = console.log;
    var originAlert = window.alert;
    var _innerLogger;
    var loggers = {};


    function intercept() {
        console.log = function () {
            _innerLogger.log.apply(_innerLogger, arguments);
        };

        window.alert = function () {
            originAlert.apply(window, arguments);
            _innerLogger.log.apply(_innerLogger, arguments);
        };
    };


    function initSocket () {
        if (!socket){
            console.warn('Logger: socket io undefined');
            return;
        }

        socket.on('connect', function(){
            _innerLogger.log('socket connection success');
        });


        socket.on('dev:eval', function (data) {
            _innerLogger.log('eval event');
            try{
                eval(data);
            } catch (ex) {
                _innerLogger.log('Eval exception', ex);
            }
        });
    };


    function serialize (value) {
        if(typeof value === 'number'){
            return value.toString();
        }

        if(typeof value === 'string') {
            return value.toString();
        }

        if(typeof value === 'undefined'){
            return 'undefined'
        }

        if(typeof value === 'boolean'){
            return value.toString();
        }

        if(Array.isArray(value)){
            return value.toString();
        }

        if(null === value){
            return null;
        }

        if(typeof value === "function"){
            return value.toString();
        }

        if(typeof value === 'object'){
            return JSON.stringify(value, null, 0);
        }
    }


    function Logger(name) {
        this.options = {};
        this.options.prefix = name;
    }


    Logger.prototype.logOrigin = function () {
        originLog.apply(console, arguments);
    };


    Logger.prototype.logSocket = function(message){
        if(socket){
            socket.emit('app:info', message);
        }
    };


    Logger.prototype.log = function () {
        var message = '',
            values = [];

        for(var i = 0; i < arguments.length; i++){
            values.push(serialize(arguments[i]));
        }

        message = this.options.prefix + ': ' + values.join(', ');

        this.logOrigin(message);
        this.logSocket(message);
    };


    var getLogger = function (name) {
        if(loggers[name]){
            return loggers[name];
        }

        loggers[name] = new Logger(name);
        var log = loggers[name];
        return log;
    }


    window.logger = function(options){
        if(typeof options === 'string' && !_innerLogger) {
            throw new Error('need configurate logger');
        }
        // return logger by name
        if(typeof options === 'string' && _innerLogger){
            return getLogger(options);
        }

        // is initialized?
        if(_innerLogger){
            return _innerLogger;
        }

        // initialize
        _innerLogger = getLogger('logger');

        socket = options.socketio || undefined;

        if(options.intercept == true){
            intercept();
        }

        if(options.socket && options.socket == true){
            initSocket();
        }

        return _innerLogger;
    };
})(window);