using System.Collections.Generic;

namespace StarWars.Models
{
  public class RangerShip : Ship
  {
    // Constants
    private object syncLock = new object();

    public static class RangerTypes
    {
      public static string[] Type = new string[] { "obiwan", "anakin", "naboo", "assault", "gunship", "jedi", "droid", "wasp", "dragon" };
      public static int[] HPStart = new int[] { 5, 6, 3, 4, 4, 3, 6, 5, 5 };
      public static int[] HPLimit = new int[] { 9, 10, 6, 7, 7, 6, 10, 9, 9 };
      public static int[] MPStart = new int[] { 5, 6, 4, 4, 4, 4, 6, 5, 5 };
      public static int[] MPLimit = new int[] { 9, 10, 7, 7, 7, 7, 10, 9, 9 };
      public static int[] HPRegen = new int[] { 6, 5, 8, 7, 7, 8, 5, 6, 6 };
      public static int[] MPRegen = new int[] { 6, 5, 8, 7, 7, 8, 5, 6, 6 };
      // Armor = % (4 = 40% etc.)
      public static int[] ArmorStart = new int[] { 3, 4, 2, 3, 3, 2, 4, 3, 3 };
      public static int[] ArmorLimit = new int[] { 6, 8, 5, 6, 6, 5, 8, 6, 6 };

      public static int[] SpeedStart = new int[] { 4, 3, 6, 5, 5, 6, 3, 4, 4 };
      public static int[] SpeedLimit = new int[] { 6, 5, 10, 9, 9, 10, 5, 6, 6 };
      public static int[] AngleSpeedStart = new int[] { 3, 3, 6, 5, 6, 5, 3, 4, 4 };
      public static int[] AngleSpeedLimit = new int[] { 5, 5, 10, 9, 10, 9, 5, 6, 6 };

      public static List<int>[] Weapons = new List<int>[] {
        new List<int> {0, 1, 2},
        new List<int> {0, 1, 2},
        new List<int> {2, 3, 4},
        new List<int> {0, 2, 3},
        new List<int> {0, 1, 2},
        new List<int> {2, 3, 5},
        new List<int> {1, 2, 3},
        new List<int> {1, 2, 3},
        new List<int> {1, 2, 3}
      };
    }

    // *** Ship Constructor ***
    public RangerShip(int id, string name, string type, int indexRanger, double X, double Y, double angle, int size) 
      : base(id, name, type, indexRanger, X, Y, angle, size)
    {
      if (indexRanger < 0 || 9 < indexRanger)
      {
        indexRanger = 0;
      }

      // HP
      this.HPCurrent = RangerShip.RangerTypes.HPStart[indexRanger];
      this.HPLimit = RangerShip.RangerTypes.HPLimit[indexRanger];
      this.HPRegen = RangerShip.RangerTypes.HPRegen[indexRanger] * Ship.Mult.HPRegenMult;
      this.HP = this.HPCurrent * Ship.Mult.HPMult;
      // MP
      this.MPCurrent = RangerShip.RangerTypes.MPStart[indexRanger];
      this.MPLimit = RangerShip.RangerTypes.MPLimit[indexRanger];
      this.MPRegen = RangerShip.RangerTypes.MPRegen[indexRanger] * Ship.Mult.MPRegenMult;
      this.MP = this.MPCurrent * Ship.Mult.MPMult;
      // Armor
      this.ArmorCurrent = RangerShip.RangerTypes.ArmorStart[indexRanger];
      this.ArmorLimit = RangerShip.RangerTypes.ArmorLimit[indexRanger];
      // Speed
      this.SpeedCurrent = RangerShip.RangerTypes.SpeedStart[indexRanger];
      this.SpeedLimit = RangerShip.RangerTypes.SpeedLimit[indexRanger];
      this.Speed = 0.0;

      // AngleSpeed
      this.AngleSpeedCurrent = RangerShip.RangerTypes.AngleSpeedStart[indexRanger];
      this.AngleSpeedLimit = RangerShip.RangerTypes.AngleSpeedLimit[indexRanger];

      this.VectorMove = 0;
      this.VectorRotate = 0;
      this.VectorShoot = 0;
      this.Kill = 0;
      this.Death = 0;
      this.SkillPoints = 5;

      this.Weapons = RangerShip.RangerTypes.Weapons[indexRanger];
      this.WeaponActive = 0;
      this.Bombs = new List<Bomb>();
    }
  }
}