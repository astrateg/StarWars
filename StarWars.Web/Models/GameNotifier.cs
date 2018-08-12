using Microsoft.AspNetCore.SignalR;
using StarWars.Web.Models;
using System.Threading;

public class GameNotifier
{
  private readonly IHubContext<SpaceHub> _hubContext;
  private readonly GameConfiguration _gameConfiguration;
  private readonly Timer _timer;

  public GameNotifier(IHubContext<SpaceHub> hubContext, GameConfiguration gameConfiguration)
  {
    _hubContext = hubContext;
    _gameConfiguration = gameConfiguration;

    if (_gameConfiguration.IsTestingMode)
    {
      return;
    }

    _timer = new Timer(new TimerCallback(UpdateGameState), null, 0, Game.SyncRate);     // запускаем таймер, обновляющий все объекты
  }

  // To call from server
  public void UpdateGameState(object state)
  {
    Game.Instance.UpdateGameState();
    var response = Game.Instance.GetGameState();
    _hubContext.Clients.All.SendAsync("broadcastMessage", response).Wait();
  }
}
