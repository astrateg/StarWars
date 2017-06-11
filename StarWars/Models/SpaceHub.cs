using System;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace StarWars.Models
{

  // To call from client's script
  public class SpaceHub : Hub
  {
    public override Task OnConnected()
    {
      Guid id;
      if (!Guid.TryParse(Context.Request.Cookies["Ship"]?.Value, out id))
      {
        throw new ArgumentException("cookie");
      }

      return Clients.Others.joined(Context.ConnectionId, id);
    }

    public override Task OnDisconnected()
    {
      Guid id;
      if (!Guid.TryParse(Context.Request.Cookies["Ship"]?.Value, out id))
      {
        throw new ArgumentException("cookie");
      }

      bool disconnected = Game.Instance.DisconnectShip(id);

      return Clients.Others.leave(disconnected, id);
    }

    public void UpdateUserShip(string name, int value)
    {
      Guid id;
      if (!Guid.TryParse(Context.Request.Cookies["Ship"]?.Value, out id))
      {
        throw new ArgumentException("cookie");
      }

      Game.Instance.UpdateUserShip(id, name, value);
    }

    public void UpdateGameState()
    {
      if (GameConfiguration.IsTestingMode)
      {
        Game.Instance.UpdateGameState(null);
      }
    }
  }
}
