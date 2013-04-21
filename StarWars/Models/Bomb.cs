using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace StarWars.Models
{
	public class Bomb : Body
	{
		public static class Types {
			public static string[] Type = new string[] { "bomb", "shuriken", "orb", "sphere", "mine", "mine" };
			public static int[] HP = new int[] { 20, 10, 100, 80, 200, 150 };
			public static int[] MP = new int[] { 30, 20, 40, 35, 50, 35 };
			public static int[] Rotate = new int[] { 0, 10, 5, 0, 0, 0 };
			public static int[] Size = new int[] { 24, 35, 50, 30, 32, 24 };
			public static int[] Speed = new int[] { 10, 12, 9, 11, 2, 3 };
		}

		public string Type { get; set; }
		// *** Inherit from class Body ***
		//public double X { get; set; }
		//public double Y { get; set; }
		//public double Angle { get; set; }
		//public int Size { get; set; }
		//public int Image { get; set; }
		//[ScriptIgnore]
		//public double GetCenterX() { return this.X + this.Size / 2; }
		//[ScriptIgnore]
		//public double GetCenterY() { return this.Y + this.Size / 2; }

		public double RotateAngle { get; set; }
		[ScriptIgnore]
		public double Rotate { get; set; }
		[ScriptIgnore]
		public string State { get; set; }
		[ScriptIgnore]
		public double Speed { get; set; }

		public Bomb(string type, double x, double y, double angle, double rotate, int size, double speed, int index)
			: base(x, y, angle, size, index) 
		{
			this.Type = type;
			//this.X = x;
			//this.Y = y;
			//this.Angle = angle;
			//this.Size = size;
			//this.Image = index;
			this.RotateAngle = 0;
			this.Rotate = rotate;
			this.State = "Active";
			this.Speed = speed;
		}

		public void Move() {
			var vx = Math.Cos(this.Angle) * this.Speed;
			var vy = Math.Sin(this.Angle) * this.Speed;
			this.GravityCorrection(vx, vy, this.Size / 10);

			this.X = Math.Round(this.X, 3);
			this.Y = Math.Round(this.Y, 3);

			if (this.Type == "sphere" && this.Size < 100) {
				this.Size++;
			}

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

		// Check colliding bombs with sun
		public void CheckSunAndPlanets() {
			if (Math.Sqrt(Math.Pow(Space.Sun.CenterX - this.GetCenterX, 2) + Math.Pow(Space.Sun.CenterY - this.GetCenterY, 2)) < Space.Sun.Size / 2) {
				this.State = "Inactive";
				return;
			}

			// Add checking collisions for the bomb and planets
			// ...
		}

	}
}