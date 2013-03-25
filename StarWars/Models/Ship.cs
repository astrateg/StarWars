using System;
using System.Collections.Generic;
using System.Linq;
//using System.Runtime.Serialization;
using System.Web;
using System.Web.Script.Serialization;

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
		public static int BombSpeed { get { return 5;} }
		public static int BombMaxCount { get { return 5; } }

		public static int SunHP { get { return 1;} }
		public static double RegenerateHP { get { return 0.1;} }

		// Properties
		public int ID { get; set; }
		public string Name { get; set; }
		public string Type { get; set; }
        public string State { get; set; }
		public double MaxHP { get; set; }
		public double HP { get; set; }
		public double X { get; set; }
		public double Y { get; set; }
        [ScriptIgnore]
        public int Speed { get; set; }
        public double Angle { get; set; }
        [ScriptIgnore]
        public double AngleSpeed { get; set; }
		//public double Start { get; set; }
		public int Size { get; set; }
		public int Image { get; set; }
        [ScriptIgnore]
        public int VectorMove { get; set; }      // 1 (Forward) | -1 (Backward) | 0 (Stop)
        [ScriptIgnore]
        public int VectorRotate { get; set; }    // 1 (CW) | -1 (CCW) | 0 (Stop)
        [ScriptIgnore]
        public DateTime LastActivity { get; set; }
        [ScriptIgnore]
        public int Shoot { get; set; }              // 1 (Shoot) | 0
		public int Kill { get; set; }
		public int Death { get; set; }
		public List<Bomb> Bombs { get; set; }

        // *** Ship Center Coordinates ***
        [ScriptIgnore]
        public double GetCenterX { get { return this.X + this.Size / 2; } }
        [ScriptIgnore]
        public double GetCenterY { get { return this.Y + this.Size / 2; } }

        public Ship(int id, string name, string type, double maxHP, double HP, double X, double Y, int speed, double angle, double angleSpeed, int size, int image) {
			this.ID = id;
			this.Name = name;
			this.Type = type;
            this.State = "Active";
            this.MaxHP = maxHP;
			this.HP = HP;
			this.X = X;
			this.Y = Y;
			this.Speed = speed;
			this.Angle = angle;
			this.AngleSpeed = angleSpeed;
			this.Size = size;
			this.Image = image;                     // Индекс имени файла-изображения (для массива imgShipShortName)
			this.VectorMove = 0;
			this.VectorRotate = 0;
			this.LastActivity = DateTime.Now;
			this.Shoot = 0;
			this.Kill = 0;
			this.Death = 0;
			this.Bombs = new List<Bomb>();
		}

		// *** Move & Rotate ***
		public void Move(int direction) {
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

        public void Rotate(int direction) {
            this.Angle += this.AngleSpeed * direction;
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

		// Check colliding ships with sun
		public void CheckSunAndShip() {
			if (this.State.Contains("Explode")) {
				return;
			}

			double distance = Math.Sqrt(Math.Pow(Space.Sun.CenterX - this.GetCenterX, 2) + Math.Pow(Space.Sun.CenterY - this.GetCenterY, 2));
			if (distance < Space.Sun.Size / 2) {
				this.HP -= Ship.SunHP;           // Если да, уменьшаем HP корабля
				if (this.HP <= 0) {
					this.HP = 0;
					this.Death++;
					this.State = "Explode000";              // Взрыв проверяется только по свойству VectorMove (для определенности)
                    this.VectorMove = 0;
                    this.VectorRotate = 0;
				}
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
			//    this = new Ship(GAME.SessionId, userName, "ranger", SHIP.ShipMaxHP, SHIP.ShipMaxHP, shipX1, shipY1, SHIP.ShipSpeed, shipAngle1, SHIP.ShipAngleSpeed, SHIP.ShipSize, randomIndex, "Stop", "Stop", 0);

			//}

		public object Clone() {
			return this.MemberwiseClone();
		}

		public void Regenerate() {
			if (this.HP < this.MaxHP) {
				this.HP += Ship.RegenerateHP;    // Регенерировали
			}
			if (this.HP > this.MaxHP) {
				this.HP = this.MaxHP;
			}
			else {
				this.HP = Math.Round(this.HP, 2);
			}
		}

        // *** Explodes Animation and Changing Explosion State ***
        public void GenerateExplodes() {
            string state = this.State;
            if (state.Contains("Explode")) {    // If this ship is in the explosion state, increment explosion step (00 -> 01, 01 -> 02, etc.)
                int Delay = state[9] - '0';
                int X = state[8] - '0';
                int Y = state[7] - '0';         // Converting from Char to Int. Another way: int X = int.Parse(state[0].ToString());

                Delay++;
                int DelayMax = 40 / Game.SyncRate;  // Result: int
                if (Delay % DelayMax == 0) {
                    X++;
                    if (X % 3 == 0) {
                        X = 0; Y++;
                        if (Y > 3) {
                            //this.X = UTILS.RandomStartX();
                            //this.Y = UTILS.RandomStartY();
                            this.X = 0;
                            this.Y = 0;
                            this.HP = this.MaxHP;
                            this.State = "Start0";
                            return;
                        }
                    }
                }
                this.State = "Explode" + Y + X + Delay;    // Next step of explosion
            }
            else if (state.Contains("Start")) {
                int step = int.Parse(state.Substring(5));   // (00 -> 0, 01 -> 1, etc.)
                step++;
                if (step < 20) {
                    this.State = "Start" + step;       // Next step of reloading
                }
                else {
                    this.State = "Active";               // Reloading is finished
                }
            }
        }


	}
}