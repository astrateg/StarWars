using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace StarWars.Models
{
    public class Ship
    {
        // Constants
        public static int ShipMaxHP { get { return 200;} }
        public static int ShipSize { get { return 64;} }
        public static int ShipSpeed { get { return 7;} }
        public static double ShipAngleSpeed { get { return 0.05;} }

        public static int BombHP { get { return 50;} }
        public static int BombSize { get { return 24;} }
        public static int BombSpeed { get { return 9;} }

        public static int SunHP { get { return 1;} }
        public static double RegenerateHP { get { return 0.1;} }

        // Properties
        public string ID { get; set; }
        public string Name { get; set; }
        public string Type { get; set; }
        public double MaxHP { get; set; }
        public double HP { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public int Speed { get; set; }
        public double Angle { get; set; }
        public double AngleSpeed { get; set; }
        public double Start { get; set; }
        public int Size { get; set; }
        public int Image { get; set; }
        public string VectorMove { get; set; }
        public string VectorRotate { get; set; }
        public int Delay { get; set; }
        public int Kill { get; set; }
        public int Death { get; set; }
        public List<Bomb> Bombs { get; set; }

        // Проверки на читерство (false означает наличие чита).
        public bool CheckHP() {
            if (this.HP > this.MaxHP) {
                return false;
            }
            return true;
        }

        public bool CheckMaxHP() {
            if (this.MaxHP > ShipMaxHP) {
                return false;
            }
            return true;
        }

        public bool CheckSpeed() {
            if (this.Speed > ShipSpeed) {
                return false;
            }
            return true;
        }

        public bool CheckKill(Ship serverShip) {
            if (this.Kill > serverShip.Kill + 5) {
                return false;
            }
            return true;
        }

        public bool CheckDeath(Ship serverShip) {
            if (this.Death < serverShip.Death - 5) {
                return false;
            }
            return true;
        }

        public bool CheckBombs() {
            if (this.Bombs[0].Speed > BombSpeed) {
                return false;
            }
            return true;
        }
    }
}