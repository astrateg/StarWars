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
        public static int SyncRate      { get { return 17; } }
        public static int SidebarWidth  { get { return 225; } }
        public static int SpaceWidth    { get { return 2560; } }
        public static int SpaceHeight   { get { return 1600; } }

        private static Timer _timer;
        private static DateTime _startTime;
        private static List<Ship> _ships;
        private Object thisLock = new Object();

        private Game() { 
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
                var ships = _ships
                    .Where(s => s.State != "Inactive")
                    .Select(s => { s.Clone(); return s; });
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

        public void UpdateUserName(int id, string name) {
            Ship oldShip = _ships.FirstOrDefault(s => s.ID == id);
            oldShip.Name = name;
        }

        public void UpdateUserShip(int id, string propertyName, int propertyValue) {
            Ship ship = _ships.FirstOrDefault(s => s.ID == id);
            if (ship != null) {
                ship.LastActivity = DateTime.Now;

                switch (propertyName) {
                    case "VectorMove":
                        ship.VectorMove = propertyValue;
                        break;
                    case "VectorRotate":
                        ship.VectorRotate = propertyValue;
                        break;
                    case "Shoot":
                        ship.Shoot = propertyValue;
                        break;
                    case "Image":
                        ship.Image = propertyValue;
                        break;
                    default:
                        break;
                }
            }
        }

        // Timer
        public void UpdateGameState(object state) {
            lock (thisLock) {
                foreach (Ship ship in _ships) {

                    var delayInMilliseconds = (int)(DateTime.Now - ship.LastActivity).TotalMilliseconds;

                    if (delayInMilliseconds > 60000) {
                        ship.State = "Inactive";
                        continue;
                    }

                    if (ship.State == "Active") {
                        ship.CheckSunAndShip();
                    }

                    ship.GenerateExplodes();

                    if (ship.State == "Active") {
                        if (ship.VectorMove != 0) {
                            ship.ChangeSpeed(ship.VectorMove);
                        }
                        ship.Move();
                        ship.Rotate(ship.VectorRotate);
                        ship.Regenerate();
                    }
                }
            }
        }
    }
}