using System;
using System.Collections.Generic;
using System.Linq;
using StarWars.Models.Strategies;

namespace StarWars.Models
{
  public class DominatorShip : Ship
  {
    public static class DominatorTypes
    {
      public static string[] Type = new string[] { "smersh", "menok", "urgant", "ekventor" };
      public static int[] Size = new int[] { 70, 75, 80, 85 };
      public static int[] HPStart = new int[] { 3, 4, 5, 6 };
      public static int[] HPLimit = new int[] { 3, 4, 5, 6 };
      public static int[] MPStart = new int[] { 3, 4, 5, 6 };
      public static int[] MPLimit = new int[] { 3, 4, 5, 6 };
      public static int[] HPRegen = new int[] { 5, 6, 7, 8 };
      public static int[] MPRegen = new int[] { 5, 6, 7, 8 };
      // Armor = % (4 = 40% etc.)
      public static int[] ArmorStart = new int[] { 2, 3, 4, 5 };
      public static int[] ArmorLimit = new int[] { 2, 3, 4, 5 };

      public static int[] SpeedStart = new int[] { 5, 4, 3, 2 };
      public static int[] SpeedLimit = new int[] { 5, 4, 3, 2 };
      public static int[] AngleSpeedStart = new int[] { 5, 4, 3, 2 };
      public static int[] AngleSpeedLimit = new int[] { 5, 4, 3, 2 };

      public static List<int>[] Weapons = new List<int>[] {
          new List<int> { 6 },
          new List<int> { 6 },
          new List<int> { 6 },
          new List<int> { 6 }
        };
    }

    public DominatorShip(int id, string name, string type, int typeIndex, int imageIndex, double X, double Y, double angle, int size) 
      : base(id, name, type, imageIndex, X, Y, angle, size)
    {
      // HP
      this.HPCurrent = DominatorShip.DominatorTypes.HPStart[typeIndex];
      this.HPLimit = DominatorShip.DominatorTypes.HPLimit[typeIndex];
      this.HPRegen = DominatorShip.DominatorTypes.HPRegen[typeIndex] * Ship.Mult.HPRegenMult;
      this.HP = this.HPCurrent * Ship.Mult.HPMult;
      // MP
      this.MPCurrent = DominatorShip.DominatorTypes.MPStart[typeIndex];
      this.MPLimit = DominatorShip.DominatorTypes.MPLimit[typeIndex];
      this.MPRegen = DominatorShip.DominatorTypes.MPRegen[typeIndex] * Ship.Mult.MPRegenMult;
      this.MP = this.MPCurrent * Ship.Mult.MPMult;
      // Armor
      this.ArmorCurrent = DominatorShip.DominatorTypes.ArmorStart[typeIndex];
      this.ArmorLimit = DominatorShip.DominatorTypes.ArmorLimit[typeIndex];
      // Speed
      this.SpeedCurrent = DominatorShip.DominatorTypes.SpeedStart[typeIndex];
      this.SpeedLimit = DominatorShip.DominatorTypes.SpeedLimit[typeIndex];
      this.Speed = 0.0;

      // AngleSpeed
      this.AngleSpeedCurrent = DominatorShip.DominatorTypes.AngleSpeedStart[typeIndex];
      this.AngleSpeedLimit = DominatorShip.DominatorTypes.AngleSpeedLimit[typeIndex];

      this.VectorMove = 0;
      this.VectorRotate = 0;
      this.VectorShoot = 0;
      this.Kill = 0;
      this.Death = 0;
      this.SkillPoints = 5;

      this.Weapons = DominatorShip.DominatorTypes.Weapons[typeIndex];
      this.WeaponActive = 0;
      this.Bombs = new List<Bomb>();
    }

    public void CalculateNextAction()
    {
      BaseDominatorStrategy strategy;
      if (this.HP < this.HPCurrent * Ship.Mult.HPMult / 2)
      {
        strategy = new DominatorDefenceStrategy(this);
      }
      else
      {
        strategy = new DominatorAttackStrategy(this);
      }

      strategy.GetInitialState();
      strategy.CalculateNextAction();
    }
  }
}