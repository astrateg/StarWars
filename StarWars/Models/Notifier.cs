using Microsoft.AspNet.SignalR;
using StarWars.Models;

public static class Notifier
{
  // To call from server
  public static void Send(object response)
  {
    var context = GlobalHost.ConnectionManager.GetHubContext<SpaceHub>();
    context.Clients.All.broadcastMessage(response);
  }
}
