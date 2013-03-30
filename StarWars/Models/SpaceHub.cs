using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace StarWars.Models {
    
    // To call from client's script
    public class SpaceHub : Hub {
        //public void Send(int time) {
        //    Clients.All.broadcastMessage(time);
        //}
    }

    // To call from server
    public static class Notifier {
        public static void Send(object response) {
            var context = GlobalHost.ConnectionManager.GetHubContext<SpaceHub>();
            context.Clients.All.broadcastMessage(response);
        }
    }
}