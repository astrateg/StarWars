using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models {
    public sealed class Game {
        //Singleton Pattern
        private static readonly Game _instance = new Game();
        private static DateTime _startTime;
        private static List<Ship> _ships = new List<Ship>();
        private static List<DateTime> _timesOfLastActivity = new List<DateTime>();

        private Game() { 
            _startTime = DateTime.Now; 
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

        public List<Ship> ShipList {
            get { 
                return _ships; 
            }
        }

        public void UpdateShipList(Ship newShip) {
            Ship oldShip = _ships.FirstOrDefault(s => s.Name == newShip.Name);
            if (oldShip == null) {
                _timesOfLastActivity.Add(DateTime.Now);
                _ships.Add(newShip);  // Если корабля в List-е нет, добавляем (Delay = 0)
            }
            else {   // Иначе - обновляем данные для корабля в List-е на пришедшие от клиента. 
                // НЕ удалять старый объект!!! (будет иногда появляться ошибка "Collection was modified; enumeration operation may not execute")
                // (эта ошибка означает, что два потока залезли одновременно в метод UpdateShipList - один зашел в foreach, а второй в это время сделал _ships.Remove)
                var shipIndex = _ships.IndexOf(oldShip);
                _timesOfLastActivity[shipIndex] = DateTime.Now;

                // Можно перебрать свойства через reflection (но это чересчур трудоемко): 
                // GetType().GetProperties() - коллекция свойств объекта
                // GetType().GetProperty(property.Name).SetValue(...) - задает свойству объекта указанное 
                _ships[shipIndex].HP = newShip.HP;
                _ships[shipIndex].X = newShip.X;
                _ships[shipIndex].Y = newShip.Y;
                _ships[shipIndex].Angle = newShip.Angle;
                _ships[shipIndex].Image = newShip.Image;
                _ships[shipIndex].VectorMove = newShip.VectorMove;
                _ships[shipIndex].VectorRotate = newShip.VectorRotate;
                _ships[shipIndex].Bombs = newShip.Bombs;
            }

            for (int i = 0; i < _ships.Count; i++) {
                var delayInMilliseconds = (int)(DateTime.Now - _timesOfLastActivity[i]).TotalMilliseconds;
                _ships[i].Delay = delayInMilliseconds;

                // Если задержка больше 1 сек, останавливаем этот корабль
                if (delayInMilliseconds > 1000) {
                    _ships[i].VectorMove = "Stop";
                    _ships[i].VectorRotate = "Stop";
                }
                // Если задержка больше 10 сек, помечаем корабль как неактивный
                if (delayInMilliseconds > 10000) {
                    _ships[i].VectorMove = "Inactive";
                    _ships[i].VectorMove = "Inactive";
                }
            }
        }
    }
}