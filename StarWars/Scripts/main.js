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

        spaceHub.client.broadcastMessage = function (data) {
            APP.Synchronize(data);
        }

        $.connection.hub.start();
    });
});