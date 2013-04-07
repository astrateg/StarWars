require.config({
    baseUrl: 'Game/Scripts',
    paths: {
        //"jquery": "http://code.jquery.com/jquery-latest",
        "jquery":   "Libraries/jquery-1.9.1.min",
        //"noext":    "Libraries/noext",
        "sigr":  "Libraries/jquery.signalR-1.0.1",
        "signalr-hubs": "../signalr/hubs?noext",
    },
    shim: {
        "sigr": { deps: ['jquery'] },
        "signalr-hubs": { deps: ['jquery', 'sigr'] },
        "app": { deps: ['jquery'] },
    }
});

require(['jquery', 'app', 'sigr', 'signalr-hubs'], function ($, APP) {
    $(function () {
        APP.Init();

        var spaceHub = $.connection.spaceHub;
        spaceHub.client.connected = function () { };
        spaceHub.client.disconnected = function () { };


        spaceHub.client.broadcastMessage = function (data) {
            APP.Synchronize(data);
        }

        spaceHub.client.joined = function (connId, id, time) {
            //alert(connId + "\n" + id + " is connected at\n" + time);
        }

        spaceHub.client.leave = function (disconnected, id) {
            if (disconnected) {
                APP.DeleteShip(id);
            }
        }

        $.connection.hub.start().done(function () {
        	window.onresize = function () {
        		APP.OnResize();
        	};

        	window.onkeydown = function (key) {
        		APP.OnKeyDown(key, spaceHub);
        	};

        	window.onkeyup = function (key) {
        		APP.OnKeyUp(key, spaceHub);
        	};
        });
    });
});