using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Reflection;
using System.Threading.Tasks;
using System.Web.Script.Serialization;

namespace StarWars.Models
{
  public class Ship : Body
  {
    // Constants
    private object syncLock = new object();

    public static class Mult
    {
      public static int HPMult { get { return 50; } }
      public static int MPMult { get { return 50; } }
      public static double HPRegenMult { get { return 0.02; } }
      public static double MPRegenMult { get { return 0.02; } }
      public static double SpeedMult { get { return 1; } }
      public static double AngleSpeedMult { get { return 0.001; } }
    }

    public static int ShipSize { get { return 64; } }
    public static int SunHP { get { return 1; } }
    public static double DeltaSpeed { get { return 0.1; } }

    // Properties
    public int ID { get; set; }
    public string Name { get; set; }
    public string Type { get; set; }
    public string State { get; set; }

    // HP & Multiplyers
    public double HP { get; set; }
    public int HPCurrent { get; set; }
    public int HPLimit { get; set; }
    public double HPRegen { get; set; }

    // MP & Multiplyers
    public double MP { get; set; }
    public int MPCurrent { get; set; }
    public int MPLimit { get; set; }
    public double MPRegen { get; set; }

    // Armor & Multiplyers
    public int ArmorCurrent { get; set; }
    public int ArmorLimit { get; set; }
    public double Armor { get { return ArmorCurrent / 10.0; } }

    // Speed & Multiplyers
    public double Speed { get; set; }
    public int SpeedCurrent { get; set; }
    public int SpeedLimit { get; set; }

    // AngleSpeed & Multiplyers
    public int AngleSpeedCurrent { get; set; }
    public int AngleSpeedLimit { get; set; }
    public double AngleSpeed { get { return AngleSpeedCurrent * AngleSpeedCurrent * Ship.Mult.AngleSpeedMult; } }

    [ScriptIgnore]
    public int VectorMove { get; set; }      // 1 (Forward) | -1 (Backward) | 0 (Stop)
    [ScriptIgnore]
    public int VectorRotate { get; set; }    // 1 (CW) | -1 (CCW) | 0 (Stop)
    [ScriptIgnore]
    public int VectorShoot { get; set; }              // 1 (Shoot) | 0

    public int Kill { get; set; }
    public int Death { get; set; }
    public int SkillPoints { get; set; }

    public List<int> Weapons { get; set; }
    public int WeaponActive { get; set; }

    public List<Bomb> Bombs { get; set; }

    // *** Ship Constructor ***
    public Ship(int id, string name, string type, int indexShip, double X, double Y, double angle, int size)
      : base(X, Y, angle, size, indexShip)
    {
      this.ID = id;
      this.Name = name;
      this.Type = type;
      this.State = "Active";
    }

    // Speed: (-SpeedCurrent...+SpeedCurrent)
    public void ChangeSpeed(int direction)
    {
      var delta = Ship.DeltaSpeed * this.SpeedCurrent * this.SpeedCurrent / 100;
      if (direction > 0)
      {
        if (this.Speed + delta <= this.SpeedCurrent)
        {
          this.Speed += delta;
        }
        else
        {
          this.Speed = this.SpeedCurrent;
        }
      }
      else
      {
        if (this.Speed - delta >= -this.SpeedCurrent)
        {
          this.Speed -= delta;
        }
        else
        {
          this.Speed = -this.SpeedCurrent;
        }
      }
    }

    // *** Move & Rotate ***
    public void Move()
    {
      // Ship momentum
      var vx = Math.Cos(this.Angle) * this.Speed * Ship.Mult.SpeedMult;
      var vy = Math.Sin(this.Angle) * this.Speed * Ship.Mult.SpeedMult;
      this.GravityCorrection(vx, vy, this.HPCurrent);

      // Check moving
      bool successLeft = (this.X >= 0);
      bool successRight = (this.X <= Game.SpaceWidth - this.Size);
      bool successUp = (this.Y >= 0);
      bool successDown = (this.Y <= Game.SpaceHeight - this.Size);

      // Check X-moving
      if (!successLeft)
      {
        this.X = 0;
      }
      else if (!successRight)
      {
        this.X = Game.SpaceWidth - this.Size;
      }
      else
      {
        this.X = Math.Round(this.X, 3);
      }

      // Check Y-moving
      if (!successUp)
      {
        this.Y = 0;
      }
      else if (!successDown)
      {
        this.Y = Game.SpaceHeight - this.Size;
      }
      else
      {
        this.Y = Math.Round(this.Y, 3);
      }
    }

    public void Rotate(int direction)
    {
      this.Angle += this.AngleSpeed * direction;
      this.Angle = Math.Round(this.Angle, 3);
    }

    // *** Bombs ***
    public double GetNewBombX()
    {
      return (this.X + this.Size / 2) + (Math.Cos(this.Angle)) * (this.Size / 2) - (Bomb.Types.Size[this.WeaponActive] / 2);
    }
    public double GetNewBombY()
    {
      return (this.Y + this.Size / 2) + (Math.Sin(this.Angle)) * (this.Size / 2) - (Bomb.Types.Size[this.WeaponActive] / 2);
    }
    public double GetNewMineX()
    {
      return (this.X + this.Size / 2) - (Math.Cos(this.Angle)) * (this.Size / 2) - (Bomb.Types.Size[this.WeaponActive] / 2);
    }
    public double GetNewMineY()
    {
      return (this.Y + this.Size / 2) - (Math.Sin(this.Angle)) * (this.Size / 2) - (Bomb.Types.Size[this.WeaponActive] / 2);
    }


    public void Shoot()
    {
      // Центрируем бомбу по оси наклона корабля (аналогично планетам) и затем смещаем бомбу на половину ее размера по X и Y (чтобы скомпенсировать "left top" для Image)
      var active = this.Weapons[this.WeaponActive];

      if (this.MP > Bomb.Types.MP[active])
      {
        this.MP -= Bomb.Types.MP[active];

        var type = Bomb.Types.Type[active];
        var rotate = Bomb.Types.Rotate[active];
        var size = Bomb.Types.Size[active];
        double speed = Bomb.Types.Speed[active];
        double bombX, bombY;
        if (type != "mine")
        {
          bombX = this.GetNewBombX();
          bombY = this.GetNewBombY();
          speed += this.Speed;
          this.Speed -= (speed / (this.HPCurrent * this.HPCurrent));
        }
        else
        {
          bombX = this.GetNewMineX();
          bombY = this.GetNewMineY();
        }

        Bomb bomb = new Bomb(type, bombX, bombY, this.Angle, rotate, size, speed, active);
        this.Bombs.Add(bomb);

        if (type == "bomb")
        {
          var t = Task.Run(async () =>
          {
            for (int i = 0; i < 4; i++)
            {
              await Task.Delay(20 * (i + 1));
              // Recount parameters (ship has been definitely moved at the moment)
              bombX = this.GetNewBombX();
              bombY = this.GetNewBombY();
              speed = Bomb.Types.Speed[active] + this.Speed;
              bomb = new Bomb(type, bombX, bombY, this.Angle, rotate, size, speed, active);
              // Add bomb to the concurrent collection (because Task runs asynchronously)
              Game.Instance.BombsBuffer[this.ID].Add(bomb);
            }
          });
        }

        if (type == "shuriken")
        {
          for (int i = 1; i < 3; i++)
          {
            bomb = new Bomb(type, bombX, bombY, this.Angle - (i * 0.05), rotate * 0.1, Bomb.Types.Size[active], speed, active);
            this.Bombs.Add(bomb);
            bomb = new Bomb(type, bombX, bombY, this.Angle + (i * 0.05), rotate * 0.1, Bomb.Types.Size[active], speed, active);
            this.Bombs.Add(bomb);
          }
          return;
        }
      }
    }

    public void Explode()
    {
      this.HP = 0;
      this.MP = 0;
      this.Death++;
      this.SubtractSkill();   // Отнимается 1 пункт у случайного скилла

      this.State = "Explode000";  // Взрыв проверяется только по свойству VectorMove (для определенности)
      Game.Instance.CreateStuff(0, this.GetCenterX, this.GetCenterY);
      Game.Instance.CreateStuff(1, this.GetCenterX, this.GetCenterY);
    }

    public void SubtractSkill()
    {
      List<string> skills = new List<string>();
      if (this.HPCurrent > 1)
      {
        skills.Add("HPCurrent");
      }
      if (this.MPCurrent > 1)
      {
        skills.Add("MPCurrent");
      }
      if (this.ArmorCurrent > 1)
      {
        skills.Add("ArmorCurrent");
      }
      if (this.SpeedCurrent > 1)
      {
        skills.Add("SpeedCurrent");
      }
      if (this.AngleSpeedCurrent > 1)
      {
        skills.Add("AngleSpeedCurrent");
      }

      int rnd = Utils.RandomInt(0, skills.Count);
      PropertyInfo propertyInfo = this.GetType().GetProperty(skills[rnd]);
      int propertyValue = (int)propertyInfo.GetValue(this);
      propertyInfo.SetValue(this, Convert.ChangeType(propertyValue - 1, propertyInfo.PropertyType));

    }

    // Check colliding ship with sun
    public void CheckSunAndShip()
    {
      if (this.State.Contains("Explode"))
      {
        return;
      }

      double distance = Math.Sqrt(Math.Pow(Space.Sun.CenterX - this.GetCenterX, 2) + Math.Pow(Space.Sun.CenterY - this.GetCenterY, 2));
      if (distance < Space.Sun.Size / 2)
      {
        var drain = Ship.SunHP * (1 - this.Armor);
        this.HP -= drain;           // Если да, уменьшаем HP корабля
        if (this.HP <= 0)
        {
          this.Explode();
        }
        else
        {
          this.RegenerateMP(drain);
        }
      }
    }

    // Check colliding ship with bomb
    public void CheckBombAndShip()
    {
      var active = this.Weapons[this.WeaponActive];
      var activeShips = new List<Ship>();
      activeShips.AddRange(Game.Instance.RangerShipListActive);
      activeShips.AddRange(Game.Instance.DominatorShipListActive);

      foreach (var bomb in this.Bombs)
      {
        foreach (var ship in activeShips)
        {
          if (ship.ID == this.ID)
          {
            continue;
          }

          if (ship.State != "Active")
          {
            continue;
          }

          var k = 0.8;
          bool checkX = (bomb.X >= ship.X - bomb.Size * k) && (bomb.X <= ship.X + ship.Size * k - bomb.Size * (1 - k));
          bool checkY = (bomb.Y >= ship.Y - bomb.Size * k) && (bomb.Y <= ship.Y + ship.Size * k - bomb.Size * (1 - k));
          if (checkX && checkY)
          {
            bomb.State = "Inactive";
            ship.HP -= Bomb.Types.HP[active] * (1 - ship.Armor);
            if (ship.HP <= 0)
            {
              this.Kill++;
              this.SkillPoints++;
              ship.Explode();
            }
          }
        }
      }
    }

    public void CheckStuffAndShip()
    {
      foreach (var stuff in Game.Instance.StuffList)
      {
        var k = 0.8;
        bool checkX = (stuff.X >= this.X - stuff.Size * k) && (stuff.X <= this.X + this.Size * k - stuff.Size * (1 - k));
        bool checkY = (stuff.Y >= this.Y - stuff.Size * k) && (stuff.Y <= this.Y + this.Size * k - stuff.Size * (1 - k));
        if (checkX && checkY)
        {
          stuff.State = "Inactive";
          if (stuff.Type == "bonusHP")
          {
            this.HP += Stuff.Types.HP[stuff.Image];
            if (this.HP > this.HPCurrent * Ship.Mult.HPMult)
            {
              this.HP = this.HPCurrent * Ship.Mult.HPMult;
            }
            continue;
          }
          if (stuff.Type == "bonusMP")
          {
            this.MP += Stuff.Types.MP[stuff.Image];
            if (this.MP > this.MPCurrent * Ship.Mult.MPMult)
            {
              this.MP = this.MPCurrent * Ship.Mult.MPMult;
            }
            continue;
          }
        }
      }
    }

    public void Regenerate()
    {
      RegenerateHP(this.HPRegen);
      RegenerateMP(this.MPRegen);
    }

    public void RegenerateHP(double regen)
    {
      var HPMax = this.HPCurrent * Ship.Mult.HPMult;
      if (this.HP < HPMax)
      {
        this.HP += regen;    // Регенерировали
      }
      if (this.HP > HPMax)
      {
        this.HP = HPMax;
      }
      else
      {
        this.HP = Math.Round(this.HP, 3);
      }
    }

    public void RegenerateMP(double regen)
    {
      var MPMax = this.MPCurrent * Ship.Mult.MPMult;
      if (this.MP < MPMax)
      {
        this.MP += regen;    // Регенерировали
      }
      if (this.MP > MPMax)
      {
        this.MP = MPMax;
      }
      else
      {
        this.MP = Math.Round(this.MP, 3);
      }
    }

    // *** Explodes Animation and Changing Explosion State ***
    public void GenerateExplodes()
    {
      string state = this.State;
      if (state.Contains("Explode"))
      {        // If this ship is in the explosion state, increment explosion step (00 -> 01, 01 -> 02, etc.)
        int DelayMax = 50 / Game.SyncRate;  // Result: int
        int Delay = state[9] - '0';
        int X = state[8] - '0';
        int Y = state[7] - '0';             // Converting from Char to Int. Another way: int X = int.Parse(state[0].ToString());

        Delay++;
        if (Delay % DelayMax == 0)
        {
          Delay = 0;
          X++;
          if (X % 3 == 0)
          {
            X = 0; Y++;
            if (Y > 3)
            {
              if (this.Type == "dominator")
              {
                this.State = "Inactive";
                return;
              }

              this.X = Utils.RandomStartX();
              this.Y = Utils.RandomStartY();
              this.HP = this.HPCurrent * Ship.Mult.HPMult;
              this.MP = this.MPCurrent * Ship.Mult.MPMult;
              this.State = "Active";
              this.Speed = 0;
              this.VectorMove = 0;
              this.VectorRotate = 0;
              return;
            }
          }
        }
        this.State = "Explode" + Y + X + Delay;    // Next step of explosion
      }
    }

    public void UpdateState()
    {
      if (this.State == "Active")
      {
        if (this.VectorMove != 0)
        {
          this.ChangeSpeed(this.VectorMove);
        }
        if (this.VectorShoot == 1)
        {
          this.Shoot();
          this.VectorShoot = 0;
        }
        this.Move();
        this.Rotate(this.VectorRotate);
        this.Regenerate();
        this.CheckStuffAndShip();
        this.CheckSunAndShip();
      }

      this.CheckBombAndShip();

      // Don't work with dominator's bombs yet...
      if (this.Type == "dominator")
      {
        return;
      }

      // If bombs buffer isn't empty for this ship, move bombs from buffer to collection "Bombs"
      // Буфер вынесен за пределы объекта Ship, т.к. иначе не работает Hub - ругается метод Notifier.Send(response);
      // Видимо, SignalR не понимает конкурентную коллекцию... даже если она исключена из списка сериализации - [ScriptIgnore]
      Bomb bombFromBuffer;
      ConcurrentBag<Bomb> bombBuffer = Game.Instance.BombsBuffer[this.ID];
      while (!bombBuffer.IsEmpty)
      {
        if (bombBuffer.TryTake(out bombFromBuffer))
        {
          this.Bombs.Add(bombFromBuffer);
        }
      }

      foreach (var bomb in this.Bombs)
      {
        bomb.Move();
        bomb.CheckSunAndPlanets();
      }
      this.Bombs.RemoveAll(b => b.State == "Inactive");
    }
  }
}