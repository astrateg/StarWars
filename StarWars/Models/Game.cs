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

        public bool UpdateShipList(Ship newShip) {
            var cheat = false;  // Проверка на читерство
            Ship oldShip = _ships.FirstOrDefault(s => s.Name == newShip.Name);
            if (oldShip == null) {
                _timesOfLastActivity.Add(DateTime.Now);
                _ships.Add(newShip);  // Если корабля в List-е нет, добавляем (Delay = 0)
            }

            // Иначе - обновляем данные для корабля в List-е на пришедшие от клиента. 
            // НЕ удалять старый объект!!! (будет иногда появляться ошибка "Collection was modified; enumeration operation may not execute")
            // (эта ошибка означает, что два потока залезли одновременно в метод UpdateShipList - один зашел в foreach, а второй в это время сделал _ships.Remove)
            else {   
                var shipIndex = _ships.IndexOf(oldShip);
                _timesOfLastActivity[shipIndex] = DateTime.Now;

                // Можно перебрать свойства через reflection (но это чересчур трудоемко): 
                // GetType().GetProperties() - коллекция свойств объекта
                // GetType().GetProperty(property.Name).SetValue(...) - задает свойству объекта указанное 
                
                if (newShip.CheckHP()) {
                    _ships[shipIndex].HP = newShip.HP;
                }
                else { cheat = true; }

                if (newShip.CheckSpeed()) {
                    _ships[shipIndex].Speed = newShip.Speed;
                }
                else { cheat = true; }

                _ships[shipIndex].X = newShip.X;
                _ships[shipIndex].Y = newShip.Y;
                _ships[shipIndex].Angle = newShip.Angle;
                _ships[shipIndex].Image = newShip.Image;
                _ships[shipIndex].VectorMove = newShip.VectorMove;
                _ships[shipIndex].VectorRotate = newShip.VectorRotate;
                
                if (newShip.CheckKill(oldShip)) {
                    _ships[shipIndex].Kill = newShip.Kill;
                }
                else { cheat = true; }

                if (newShip.CheckDeath(oldShip)) {
                    _ships[shipIndex].Death = newShip.Death;
                }
                else { cheat = true; }

                if (newShip.Bombs != null) {
                    if (newShip.CheckBombs()) {
                        _ships[shipIndex].Bombs = newShip.Bombs;
                    }
                    else { 
                        cheat = true;
                        _ships[shipIndex].Bombs.Clear();
                    }
                }

                else if (oldShip.Bombs != null) {
                    _ships[shipIndex].Bombs.Clear();
                }

                // Читеру снижаем все параметры (и передаем "флажок" через JSON, чтобы обновить на компьютере у читера данные о его собственном корабле)
                if (cheat) {
                    _ships[shipIndex].HP = 1;
                    _ships[shipIndex].Speed = 1;
                    _ships[shipIndex].Kill = 0;
                    _ships[shipIndex].Death = 99;
                }
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

            return cheat;
        }

    }
}