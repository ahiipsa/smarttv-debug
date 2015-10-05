"use strict";

(function (window) {
    function Logger(options) {
        this.options = options;
        this.options.prefix = options.prefix || options.name || 'Logger';
        this.logContainer = null;
        this.socket = null;
        this.socketio = options.socketio || undefined;
        this.originLog = console.log;
        this.originAlert = window.alert;

        this.initDOM();
        this.initSocket();

        if (this.options.intercept) {
            this.intercept();
        }
    }

    Logger.prototype.intercept = function () {
        var self = this;
        console.log = function () {
            self.log.apply(self, arguments);
        };

        window.alert = function () {
            self.originAlert.apply(window, arguments);
            self.log.apply(self, arguments);
        };
    };


    Logger.prototype.initSocket = function () {
        var self = this;

        var io = window.io || self.options.socketio;
        if (!io){
            console.warn('Logger: socket io undefined');
            return;
        }

        console.info('Logger: socket available');
        this.socket = io(this.options.host);
        this.socket.on('connect', function(){
            this.log('socket connection success');
        }.bind(this));


        this.socket.on('dev:eval', function (data) {
            self.log('eval event');
            try{
                eval(data);
            } catch (ex) {
                self.log('Eval exception', ex);
            }
        });
    };


    Logger.prototype.initDOM = function() {
        var container = document.getElementById(this.options.containerId);

        if(!container){
            console.warn('Logger: DOM container not found: ' + this.options.containerId );
            return;
        }

        this.logContainer = container;
    };


    Logger.prototype.logOrigin = function () {
        this.originLog.apply(console, arguments);
    };


    Logger.prototype.logSocket = function(message){
        if(this.socket){
            this.socket.emit('app:info', message);
        }
    };


    Logger.prototype.logDOM = function (message) {
        if(!this.logContainer){
            return;
        }

        var el = document.createElement('div');
        el.innerHTML = message;

        this.logContainer.appendChild( el );
        this.logContainer.scrollTop = this.logContainer.scrollHeight;
    };


    Logger.prototype.log = function () {
        var message = '',
            values = [];

        for(var i = 0; i < arguments.length; i++){
            var value = arguments[i];
            if(typeof value === 'object'){
                value = JSON.stringify(value, null, 4);
            }
            values.push(value);
        }

        message = this.options.prefix + ': ' + values.join(', ');

        this.logOrigin(message);
        this.logDOM(message);
        this.logSocket(message);
    };

    window.Logger = Logger;
})(window);