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
        public static int SyncRate { get { return 10; } }
        public static int SpaceWidth { get { return 2560; } }
        public static int SpaceHeight { get { return 1600; } }

        private static Timer _timer;
        private static DateTime _startTime;
        private static List<Ship> _ships;
        private static Dictionary<string, DateTime> _timesOfLastActivity = new Dictionary<string, DateTime>();

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
                    .Where(s => s.VectorMove != "Inactive")
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
            _ships.Add(ship);
        }

        public void UpdateShipList(string id, string propertyName, string propertyValue) {
            Ship oldShip = _ships.FirstOrDefault(s => s.ID == id);

            switch (propertyName) {
                case "Name":
                    oldShip.Name = propertyValue;
                    break;
                case "VectorMove":
                    oldShip.VectorMove = propertyValue;
                    break;
                case "VectorRotate":
                    oldShip.VectorRotate = propertyValue;
                    break;
                case "Shoot":
                    oldShip.Shoot = int.Parse(propertyValue);
                    break;
                case "Image":
                    oldShip.Image = int.Parse(propertyValue);
                    break;
                default:
                    break;
            }
            // *** Reflection - отменяется для повышения производительности ***
            //PropertyInfo propertyInfo = oldShip.GetType().GetProperty(propertyName);
            //propertyInfo.SetValue(oldShip, Convert.ChangeType(propertyValue, propertyInfo.PropertyType));   // Конвертируем, т.к. не все свойства имеют тип string (Image - int)

            if (propertyValue != "Inactive") {
                _timesOfLastActivity[id] = DateTime.Now;

                foreach (var ship in _ships) {
                    var delayInMilliseconds = (int)(DateTime.Now - _timesOfLastActivity[ship.ID]).TotalMilliseconds;
                    ship.Delay = delayInMilliseconds;

                    // Если задержка больше 1 сек, останавливаем этот корабль
                    if (delayInMilliseconds > 1000) {
                        ship.VectorMove = "Stop";
                        ship.VectorRotate = "Stop";
                    }

                    // Inactive не делаем - корабль станет неактивным, когда закрыта вкладка браузера (событие window.beforeunload)
                    //if (delayInMilliseconds > 30000) {
                    //    ship.VectorMove = "Inactive";
                    //    ship.VectorMove = "Inactive";
                    //}
                }
            }
        }

        // Timer
        public void UpdateGameState(object state) {
            foreach (Ship ship in _ships) {
                string vectorMove = ship.VectorMove;
                string vectorRotate = ship.VectorRotate;

                switch (vectorMove) {
                    case "MoveForward":
                        ship.MoveForward();
                        break;
                    case "MoveBackward":
                        ship.MoveBackward();
                        break;
                }

                switch (vectorRotate) {
                    case "RotateCW":
                        ship.RotateCW();
                        break;
                    case "RotateCCW":
                        ship.RotateCCW();
                        break;
                }
            }
        }
    }
}