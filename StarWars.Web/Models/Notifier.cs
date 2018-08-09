using Microsoft.AspNetCore.SignalR;
using StarWars.Web.Models;

public static class Notifier
{
  // To call from server
  public static void Send(object response)
  {
    var context = GlobalHost.ConnectionManager.GetHubContext<SpaceHub>();
    context.Clients.All.broadcastMessage(response);
  }
}
