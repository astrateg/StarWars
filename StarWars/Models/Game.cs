using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Collections.Concurrent;

namespace StarWars.Models
{
  public sealed class Game
  {
    //Singleton Pattern
    private static readonly Game _instance = new Game();
    public static int SyncRate { get { return 10; } }
    public static int SidebarWidth { get { return 225; } }
    public static int SpaceWidth { get { return 2560; } }
    public static int SpaceHeight { get { return 1600; } }

    public Dictionary<int, ConcurrentBag<Bomb>> BombsBuffer { get; set; } // буфер для бомб (тип "bomb"), из которого бомбы перемещаются в коллекцию Bombs

    private static Timer _timer;
    private static DateTime _startTime;
    private static List<RangerShip> _rangers;
    private static List<DominatorShip> _dominators;
    private static List<Stuff> _stuffs;

    private Game()
    {
      Space.Sun.Angle = 0;
      BombsBuffer = new Dictionary<int, ConcurrentBag<Bomb>>();

      _startTime = DateTime.Now;
      _rangers = new List<RangerShip>();
      _dominators = new List<DominatorShip>();
      _stuffs = new List<Stuff>();

      _timer = new Timer(new TimerCallback(UpdateGameState), null, 0, Game.SyncRate);     // запускаем таймер, обновляющий все объекты
    }

    public static Game Instance
    {
      get { return _instance; }
    }

    public int TimeFromStart
    {
      get { return (int)((DateTime.Now - _startTime).TotalMilliseconds); }
    }

    public IEnumerable<RangerShip> RangerShipListActive
    {
      get
      {
        var rangers = _rangers.Where(s => s.State != "Inactive");
        return rangers;
      }
    }

    public IEnumerable<DominatorShip> DominatorShipListActive
    {
      get
      {
        var dominators = _dominators.Where(s => s.State != "Inactive");
        return dominators;
      }
    }

    //public bool IsDominatorGenerated = false;

    public List<Stuff> StuffList
    {
      get { return _stuffs; }
    }

    public List<RangerShip> RangerShipList
    {
      get { return _rangers; }
    }

    public List<DominatorShip> DominatorShipList
    {
      get { return _dominators; }
    }

    public void AddRangerShip(RangerShip ranger)
    {
      _rangers.Add(ranger);
      BombsBuffer.Add(ranger.ID, new ConcurrentBag<Bomb>());  // Key: ship.id;	Value: bombs concurrent collection
    }

    public void AddDominatorShip(DominatorShip dominator)
    {
      _dominators.Add(dominator);
      //BombsBuffer.Add(dominator.ID, new ConcurrentBag<Bomb>());  // Key: ship.id;	Value: bombs concurrent collection
    }

    public bool DisconnectShip(int id)
    {
      RangerShip ranger = _rangers.FirstOrDefault(s => s.ID == id);
      if (ranger != null)
      {
        ranger.State = "Inactive";
        return true;
      }
      return false;
    }

    public void UpdateUserName(int id, string name)
    {
      RangerShip oldRanger = _rangers.FirstOrDefault(s => s.ID == id);
      oldRanger.Name = name;
    }

    public void UpdateUserShip(int id, string propertyName, int propertyValue)
    {
      RangerShip ranger = _rangers.FirstOrDefault(s => s.ID == id);
      if (ranger != null && ranger.State == "Active")
      {
        switch (propertyName)
        {
          case "VectorMove": ranger.VectorMove = propertyValue; break;
          case "VectorRotate": ranger.VectorRotate = propertyValue; break;
          case "VectorShoot": ranger.VectorShoot = propertyValue; break;
          case "Image": ranger.Image = propertyValue; break;
        }
      }
    }

    public void ChangeWeapon(int id, int index)
    {
      RangerShip ranger = _rangers.FirstOrDefault(s => s.ID == id);
      if (ranger != null && ranger.State == "Active")
      {
        ranger.WeaponActive = index;
      }
    }

    public void ChangeSkill(int id, string skill)
    {
      RangerShip ranger = _rangers.FirstOrDefault(s => s.ID == id);
      if (ranger != null && ranger.State == "Active")
      {
        switch (skill)
        {
          case "HP":
            ranger.HPCurrent++;
            ranger.HPRegen += Ship.Mult.HPRegenMult;
            break;
          case "MP":
            ranger.MPCurrent++;
            ranger.MPRegen += Ship.Mult.MPRegenMult;
            break;
          case "Armor":
            ranger.ArmorCurrent++;
            break;
          case "Speed":
            ranger.SpeedCurrent++;
            break;
          case "AngleSpeed":
            ranger.AngleSpeedCurrent++;
            break;
        }
        ranger.SkillPoints--;
      }
    }

    public void CreateStuff(int index, double X, double Y)
    {
      var type = Stuff.Types.Type[index];
      var angle = Utils.RandomSpaceAngle();
      var rotate = Stuff.Types.Rotate[index];
      var size = Stuff.Types.Size[index];
      var speed = Stuff.Types.Speed[index];

      Stuff stuff = new Stuff(type, X, Y, angle, rotate, size, speed, index);
      _stuffs.Add(stuff);
    }

    // Timer
    public void UpdateGameState(object state)
    {
      // Sun and planets
      Space.Sun.Rotate();

      foreach (var stuff in _stuffs)
      {
        stuff.Move();
      }
      _stuffs.RemoveAll(s => s.State == "Inactive");

      // Ships
      foreach (RangerShip ranger in _rangers)
      {
        ranger.GenerateExplodes();
        ranger.UpdateState();
      }

      // Ships
      foreach (DominatorShip dominator in _dominators)
      {
        dominator.GenerateExplodes();
        dominator.CalculateNextAction();
        dominator.UpdateState();
      }
      _dominators.RemoveAll(s => s.State == "Inactive");

      var response = new
      {
        timeFromStart = Game.Instance.TimeFromStart,
        ships = Game.Instance.RangerShipListActive,
        dominators = Game.Instance.DominatorShipListActive,
        stuffs = Game.Instance.StuffList,
        sunAngle = Math.Round(Space.Sun.Angle, 3),
      };

      Notifier.Send(response);
    }
  }
}