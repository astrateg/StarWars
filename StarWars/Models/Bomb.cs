using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace StarWars.Models
{
    public class Bomb
    {
        //public static int BombHP { get { return 50; } }
        //public static int BombMP { get { return 10; } }
        //public static int BombSize { get { return 24; } }
        //public static int BombSpeed { get { return 10; } }

        public static class Types {
            public static string[] Type = new string[] { "bomb", "shuriken" };
            public static int[] HP = new int[] { 50, 20 };
            public static int[] MP = new int[] { 20, 30 };
            public static int[] Rotate = new int[] { 0, 1 };
            public static int[] Size = new int[] { 24, 35 };
            public static int[] Speed = new int[] { 10, 12 };
        }

        public string Type { get; set; }
        public int Image { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double Angle { get; set; }
        public double RotateAngle { get; set; }
        [ScriptIgnore]
        public double Rotate { get; set; }
        [ScriptIgnore]
        public int Size { get; set; }
        [ScriptIgnore]
        public string State { get; set; }
        [ScriptIgnore]
        public double Speed { get; set; }

        public Bomb(string type, double x, double y, double angle, double rotate, int size, double speed, int index) {
            this.Type = type;
            this.X = x;
            this.Y = y;
            this.Angle = angle;
            this.RotateAngle = 0;
            this.Rotate = rotate;
            this.Size = size;
            this.State = "Active";
            this.Speed = speed;
            this.Image = index;
        }

        public void Move() {
            var vx = Math.Cos(this.Angle) * this.Speed;
            var vy = Math.Sin(this.Angle) * this.Speed;
            this.X += vx;
            this.Y += vy;
            this.X = Math.Round(this.X, 3);
            this.Y = Math.Round(this.Y, 3);

            // If the bomb reaches any border of the GAME, it disappears
            if ((this.X < -this.Size) || (this.X > Game.SpaceWidth) || (this.Y < -this.Size) || (this.Y > Game.SpaceHeight + this.Size)) {
                this.State = "Inactive";
                return;
            }
            // If this kind of weapon rotates
            if (this.Rotate > 0) {
                this.RotateAngle += this.Rotate;
                if (this.RotateAngle > 2 * Math.PI) {
                    this.RotateAngle -= 2 * Math.PI;
                }
            }
        }

        public double GetCenterX() {
            return this.X + this.Size / 2;
        }

        public double GetCenterY() {
            return this.Y + this.Size / 2;
        }

        // Check colliding bombs with sun
        public void CheckSunAndPlanets() {
            if (Math.Sqrt(Math.Pow(Space.Sun.CenterX - this.GetCenterX(), 2) + Math.Pow(Space.Sun.CenterY - this.GetCenterY(), 2)) < Space.Sun.Size / 2) {
                this.State = "Inactive";
                return;
            }

            // Add checking collisions for the bomb and planets
            // ...
        }

    }
}