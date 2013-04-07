using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNet.SignalR;

namespace StarWars.Models {
	
	// To call from client's script
	public class SpaceHub : Hub {
		public override Task OnConnected() {
			int id = int.Parse(Context.Request.Cookies["Ship"].Value);
			return Clients.Others.joined(Context.ConnectionId, id);
		}

		public override Task OnDisconnected() {
			int id = int.Parse(Context.Request.Cookies["Ship"].Value);
			bool disconnected = Game.Instance.DisconnectShip(id);
			return Clients.Others.leave(disconnected, id);
		}

		public void UpdateUserShip(string name, int value) {
			int id = int.Parse(Context.Request.Cookies["Ship"].Value); 
			Game.Instance.UpdateUserShip(id, name, value);
		}

	}

	// To call from server
	public static class Notifier {
		public static void Send(object response) {
			var context = GlobalHost.ConnectionManager.GetHubContext<SpaceHub>();
			context.Clients.All.broadcastMessage(response);
		}
	}
}