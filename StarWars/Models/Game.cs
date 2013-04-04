using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Reflection;
using System.Threading;

namespace StarWars.Models {
	public sealed class Game {
		//Singleton Pattern
		private static readonly Game _instance = new Game();
		public static int SyncRate      { get { return 10; } }
		public static int SidebarWidth  { get { return 225; } }
		public static int SpaceWidth    { get { return 2560; } }
		public static int SpaceHeight   { get { return 1600; } }

		private static Timer _timer;
		private static DateTime _startTime;
		private static List<Ship> _ships;
		private Object thisLock = new Object();

		private Game() {
            Space.Sun.Angle = 0;

            _startTime = DateTime.Now;
			_ships = new List<Ship>();
			_timer = new Timer(new TimerCallback(UpdateGameState), null, 0, Game.SyncRate);     // запускаем таймер, обновляющий все объекты
		}

		public static Game Instance {
			get {
				return _instance;
			}
		}

		public int TimeFromStart {
			get { 
				return (int)((DateTime.Now - _startTime).TotalMilliseconds); 
			}
		}

		public string ServerName {
			get { 
				return Environment.MachineName; 
			}
		}

		public IEnumerable<Ship> ShipListActive {
			get {
				var ships = _ships.Where(s => s.State != "Inactive");
				return ships;
			}
		}

		public List<Ship> ShipList {
			get {
				return _ships;
			}
		}

		public void AddShip(Ship ship) {
			lock (thisLock) {
				_ships.Add(ship);
			}
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
			if (ship != null) {
				switch (propertyName) {
					case "VectorMove":
						ship.VectorMove = propertyValue;
						break;
					case "VectorRotate":
						ship.VectorRotate = propertyValue;
						break;
                    case "VectorShoot":
						ship.VectorShoot = propertyValue;
						break;
					case "Image":
						ship.Image = propertyValue;
						break;
					default:
						break;
				}
			}
		}

        public void ChangeWeapon(int id, int index) {
            Ship ship = _ships.FirstOrDefault(s => s.ID == id);
            if (ship != null) {
                ship.WeaponActive = index;
            }
        }

		// Timer
		public void UpdateGameState(object state) {
            // Sun and planets
            Space.Sun.Rotate();
            
            // Ships
			foreach (Ship ship in _ships) {
				ship.GenerateExplodes();
                ship.UpdateState();
			}

			var response = new {
				timeFromStart = Game.Instance.TimeFromStart,
				ships = Game.Instance.ShipListActive,
                sunAngle = Math.Round(Space.Sun.Angle, 3),
			};


			Notifier.Send(response);
		}
    }
}