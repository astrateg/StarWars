using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;

namespace StarWars.Web.Models
{

  // To call from client's script
  public class SpaceHub : Hub
  {
    private readonly GameConfiguration _gameConfiguration;

    public SpaceHub(GameConfiguration gameConfiguration)
    {
      _gameConfiguration = gameConfiguration;
    }

    public override async Task OnConnectedAsync()
    {
      Guid id;
      if (!Guid.TryParse(Context.GetHttpContext().Request.Cookies["Ship"], out id))
      {
        throw new ArgumentException("cookie");
      }

      await Groups.AddToGroupAsync(Context.ConnectionId, id.ToString());
      await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception exception)
    {
      Guid id;
      if (!Guid.TryParse(Context.GetHttpContext().Request.Cookies["Ship"], out id))
      {
        throw new ArgumentException("cookie");
      }

      bool disconnected = Game.Instance.DisconnectShip(id);
      if (disconnected)
      {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, id.ToString());
        await base.OnDisconnectedAsync(exception);
      }
    }

    public void UpdateUserShip(string name, int value)
    {
      Guid id;
      if (!Guid.TryParse(Context.GetHttpContext().Request.Cookies["Ship"], out id))
      {
        throw new ArgumentException("cookie");
      }

      Game.Instance.UpdateUserShip(id, name, value);
    }

    public void UpdateGameState()
    {
      if (_gameConfiguration.IsTestingMode)
      {
        Game.Instance.UpdateGameState();
        var response = Game.Instance.GetGameState();
        Clients.All.SendAsync("broadcastMessage", response);
      }
    }
  }
}
