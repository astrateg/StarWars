using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using System.Threading;
using System.Collections.Concurrent;

namespace StarWars.Models {
	public sealed class Game {
		//Singleton Pattern
		private static readonly Game _instance = new Game();
		public static int SyncRate      { get { return 10; } }
		public static int SidebarWidth  { get { return 225; } }
		public static int SpaceWidth    { get { return 2560; } }
		public static int SpaceHeight   { get { return 1600; } }
		public Dictionary<int, ConcurrentBag<Bomb>> BombsBuffer { get; set; }	// буфер для бомб (тип "bomb"), из которого бомбы перемещаются в коллекцию Bombs

		private static Timer _timer;
		private static DateTime _startTime;
		private static List<Ship> _ships;
		private static List<Stuff> _stuffs;

		private Game() {
			Space.Sun.Angle = 0;
			BombsBuffer = new Dictionary<int, ConcurrentBag<Bomb>>();

			_startTime = DateTime.Now;
			_ships = new List<Ship>();
			_stuffs = new List<Stuff>();

			_timer = new Timer(new TimerCallback(UpdateGameState), null, 0, Game.SyncRate);     // запускаем таймер, обновляющий все объекты
		}

		public static Game Instance {
			get { return _instance; }
		}

		public int TimeFromStart {
			get { return (int)((DateTime.Now - _startTime).TotalMilliseconds); }
		}

		public string ServerName {
			get { return Environment.MachineName; }
		}

		public IEnumerable<Ship> ShipListActive {
			get {
				var ships = _ships.Where(s => s.State != "Inactive");
				return ships;
			}
		}

		public List<Stuff> StuffList {
			get { return _stuffs; }
		}

		public List<Ship> ShipList {
			get { return _ships; }
		}

		public void AddShip(Ship ship) {
			_ships.Add(ship);
			BombsBuffer.Add(ship.ID, new ConcurrentBag<Bomb>());	// Key: ship.id;	Value: bombs concurrent collection
		}

		public bool DisconnectShip(int id) {
			Ship ship = _ships.FirstOrDefault(s => s.ID == id);
			if (ship != null) {
				ship.State = "Inactive";
				return true;
			}
			return false;
		}

		public void UpdateUserName(int id, string name) {
			Ship oldShip = _ships.FirstOrDefault(s => s.ID == id);
			oldShip.Name = name;
		}

		public void UpdateUserShip(int id, string propertyName, int propertyValue) {
			Ship ship = _ships.FirstOrDefault(s => s.ID == id);
			if (ship != null && ship.State == "Active") {
				switch (propertyName) {
					case "VectorMove":		ship.VectorMove = propertyValue; break;
					case "VectorRotate":	ship.VectorRotate = propertyValue; break;
					case "VectorShoot":		ship.VectorShoot = propertyValue; break;
					case "Image":			ship.Image = propertyValue; break;
				}
			}
		}

		public void ChangeWeapon(int id, int index) {
			Ship ship = _ships.FirstOrDefault(s => s.ID == id);
			if (ship != null && ship.State == "Active") {
				ship.WeaponActive = index;
			}
		}

		public void ChangeSkill(int id, string skill) {
			Ship ship = _ships.FirstOrDefault(s => s.ID == id);
			if (ship != null && ship.State == "Active") {
				switch (skill) {
					case "HP": 
						ship.HPCurrent++; 
						ship.HPRegen += Ship.Ranger.Mult.HPRegenMult; 
						break;
					case "MP":		
						ship.MPCurrent++; 
						ship.MPRegen += Ship.Ranger.Mult.MPRegenMult; 
						break;
					case "Armor":	
						ship.ArmorCurrent++; 
						break;
					case "Speed":	
						ship.SpeedCurrent++; 
						break;
					case "AngleSpeed": 
						ship.AngleSpeedCurrent++; 
						break;
				}
				ship.SkillPoints--;
			}
		}

		public void CreateStuff(int index, double X, double Y) {
			var type = Stuff.Types.Type[index];
			//var stuffX = Utils.RandomSpaceX();
			//var stuffY = Utils.RandomSpaceY();
			var angle = Utils.RandomSpaceAngle();
			var rotate = Stuff.Types.Rotate[index];
			var size = Stuff.Types.Size[index];
			var speed = Stuff.Types.Speed[index];

			Stuff stuff = new Stuff(type, X, Y, angle, rotate, size, speed, index);
			_stuffs.Add(stuff);
		}

		// Timer
		public void UpdateGameState(object state) {
			// Sun and planets
			Space.Sun.Rotate();

			foreach (var stuff in _stuffs) {
				stuff.Move();
			}
			_stuffs.RemoveAll(s => s.State == "Inactive");

			//var checkTimerHP = TimeFromStart % 6000 < Game.SyncRate;
			//var checkTimerMP = TimeFromStart % 7000 < Game.SyncRate;
			//if (checkTimerHP) { CreateStuff(0); }
			//if (checkTimerMP) { CreateStuff(1); }

			// Ships
			foreach (Ship ship in _ships) {
				ship.GenerateExplodes();
				ship.UpdateState();
			}

			var response = new {
				timeFromStart = Game.Instance.TimeFromStart,
				ships = Game.Instance.ShipListActive,
				stuffs = Game.Instance.StuffList,
				sunAngle = Math.Round(Space.Sun.Angle, 3),
			};


			Notifier.Send(response);
		}
	}
}