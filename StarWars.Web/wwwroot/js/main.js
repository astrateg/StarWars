require.config({
  baseUrl: '..',
  paths: {
    //"jquery": "http://code.jquery.com/jquery-latest",
    "jquery": "lib/jquery-3.3.1.min",
    "knockout": 'lib/knockout-2.2.1.debug',
    //"knockout": 'Libraries/knockout-2.2.1.min',
    //"noext":    "Libraries/noext",
    "sigr": "lib/jquery.signalR-2.3.0",
    "signalr-hubs": "lib/hubs?noext"
  },
  shim: {
    "sigr": { deps: ['jquery'] },
    "signalr-hubs": { deps: ['jquery', 'sigr'] },
    "app": { deps: ['jquery'] }
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
    };

    spaceHub.client.joined = function (connId, id, time) {
      //alert(connId + "\n" + id + " is connected at\n" + time);
    };

    spaceHub.client.leave = function (disconnected, id) {
      if (disconnected) {
        APP.DeleteShip(id);
      }
    };

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