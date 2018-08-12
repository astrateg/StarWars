"use strict";
console.log("index: init0");

var signalR = require('../lib/signalr/signalr');
var APP = require('./app');

APP.Init();

var connection = new signalR.HubConnectionBuilder().withUrl("/spaceHub").build();

connection.on("BroadcastMessage", function (data) {
    APP.Synchronize(data);
});

connection.start().then(function () {
    window.onresize = function () {
        APP.OnResize();
    };

    window.onkeydown = function (key) {
        APP.OnKeyDown(key, connection);
    };

    window.onkeyup = function (key) {
        APP.OnKeyUp(key, connection);
    };
});

connection.onclose(function (e) {
    console.log('Connection Closed');
});