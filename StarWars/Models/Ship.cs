using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace StarWars.Models
{
	public class Ship : ICloneable
	{
		// Constants
		public static int ShipMaxHP { get { return 200;} }
		public static int ShipSize { get { return 64;} }
		public static int ShipSpeed { get { return 5;} }
		public static double ShipAngleSpeed { get { return 0.02;} }

		public static int BombHP { get { return 50;} }
		public static int BombSize { get { return 24;} }
		public static int BombSpeed { get { return 10;} }
		public static int BombMaxCount { get { return 5; } }

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
		public int Shoot { get; set; }
		public int Kill { get; set; }
		public int Death { get; set; }
		public List<Bomb> Bombs { get; set; }

		public Ship(string id, string name, string type, double maxHP, double HP, double X, double Y, int speed, double angle, double angleSpeed, 
					int size, int image, string vectorMove, string vectorRotate, int? delay, int? shoot, int? kill, int? death) {
			this.ID = id;
			this.Name = name;
			this.Type = type;
			this.MaxHP = maxHP;
			this.HP = HP;
			this.X = X;
			this.Y = Y;
			this.Speed = speed;
			this.Angle = angle;
			this.AngleSpeed = angleSpeed;
			this.Size = size;
			this.Image = image;                     // Индекс имени файла-изображения (для массива imgShipShortName)
			this.VectorMove = vectorMove;
			this.VectorRotate = vectorRotate;
			this.Delay = (delay != null) ? (int)delay : 0;
			this.Shoot = (shoot != null) ? (int)shoot : 0;
			this.Kill = (kill != null) ? (int)kill : 0;
			this.Death = (death != null) ? (int)death : 0;
			this.Bombs = new List<Bomb>();
		}

		// *** Move & Rotate ***
		public void MoveForward() {
			this.TryMove(1);
		}

		public void MoveBackward() {
			this.TryMove(-1);
		}

		public void TryMove(int direction) {
			var vx = Math.Cos(this.Angle) * this.Speed;
			var vy = Math.Sin(this.Angle) * this.Speed;
			
			// Try moving
			this.X += vx * direction;
			this.Y += vy * direction;
			
			// Check moving
			bool successLeft = (this.X >= 0);
			bool successRight = (this.X <= Game.SpaceWidth - this.Size);  // Sidebar.width = 225px
			bool successUp = (this.Y >= 0);
			bool successDown = (this.Y <= Game.SpaceHeight - this.Size);

			// Check X-moving
			if (!successLeft) {
				this.X = 0;
			}
			else if (!successRight) {
				this.X = Game.SpaceWidth - this.Size;
			}
			else {
				this.X = Math.Round(this.X, 2);
			}

			// Check Y-moving
			if (!successUp) {
				this.Y = 0;
			}
			else if (!successDown) {
				this.Y = Game.SpaceHeight - this.Size;
			}
			else {
				this.Y = Math.Round(this.Y, 2);
			}
		}

		public void RotateCW() {
			this.Angle += this.AngleSpeed;
			this.Angle = Math.Round(this.Angle, 2);
		}

		public void RotateCCW() {
			this.Angle -= this.AngleSpeed;
			this.Angle = Math.Round(this.Angle, 2);
		}

		// *** Bombs ***
		public double GetNewBombX() {
			return (this.X + this.Size / 2) + (Math.Cos(this.Angle)) * (this.Size / 2) - (Ship.BombSize / 2);
		}
		public double GetNewBombY() {
			return (this.Y + this.Size / 2) + (Math.Sin(this.Angle)) * (this.Size / 2) - (Ship.BombSize / 2);
		}

		public void CreateBomb() {
			// Центрируем бомбу по оси наклона корабля (аналогично планетам) и затем смещаем бомбу на половину ее размера по X и Y (чтобы скомпенсировать "left top" для Image)
			var bombX = this.GetNewBombX();
			var bombY = this.GetNewBombY();
			if (this.Bombs.Count < Ship.BombMaxCount) {
				var bomb = new Bomb("ranger", bombX, bombY, this.Angle, Ship.BombSize, Ship.BombSpeed);
				this.Bombs.Add(bomb);
			}
		}



			// Generating my ship if it isn't found
			//randomIndex = UTILS.GetRandomInt(0, SHIP.RangerImagesMax - 1);
			//if (!isMyShipFound) {
			//    var shipX1 = UTILS.RandomStartX();
			//    var shipY1 = UTILS.RandomStartY();
			//    var shipAngle1 = Math.random(Math.PI);
			//    var userName = prompt("Введите свое имя (не более 8 символов)");
			//    if (userName.length > 8) {
			//        userName = userName.slice(0, 8);
			//    }
			//    userName = encodeURIComponent(userName);
			//    SHIP.MyShip = new Ship(GAME.SessionId, userName, "ranger", SHIP.ShipMaxHP, SHIP.ShipMaxHP, shipX1, shipY1, SHIP.ShipSpeed, shipAngle1, SHIP.ShipAngleSpeed, SHIP.ShipSize, randomIndex, "Stop", "Stop", 0);

			//}

        public object Clone() {
            return this.MemberwiseClone();
        }
	}
}