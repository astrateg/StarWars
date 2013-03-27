using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Script.Serialization;
using System.Web.SessionState;
using StarWars.Models;

namespace StarWars.Controllers {
    [SessionState(SessionStateBehavior.Disabled)]
    public class HomeController : Controller {
        public ActionResult Index() {
            //ViewBag.ServerName = Game.Instance.ServerName;
            return View();
        }

        // Разделяем инициализацию для космоса (InitShips) и кораблей (InitSpace)
        // (иначе не получится в Javascript развести их по модулям - SPACE и SHIPS)

        public JsonResult InitGame() {
            var response = new {
                syncRate = Game.SyncRate,
                sidebarWidth = Game.SidebarWidth,
                spaceWidth = Game.SpaceWidth,
                spaceHeight = Game.SpaceHeight
            };

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult InitSpace() {
            var response = new {
                Sun = new {
                    Size = Space.Sun.Size,
                    RotationAngle = Space.Sun.RotationAngle,
                },
                Planets = Space.Planets
            };

            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult InitShipConstants() {
            var serializer = new JavaScriptSerializer();
            var response = new {
                Types = new {
                    Type = serializer.Serialize(Ship.Ranger.Types.Type),
                    HPStart = serializer.Serialize(Ship.Ranger.Types.HPStart),
                    HPLimit = serializer.Serialize(Ship.Ranger.Types.HPLimit),
                    SpeedStart = serializer.Serialize(Ship.Ranger.Types.SpeedStart),
                    SpeedLimit = serializer.Serialize(Ship.Ranger.Types.SpeedLimit),
                    AngleSpeedStart = serializer.Serialize(Ship.Ranger.Types.AngleSpeedStart),
                    AngleSpeedLimit = serializer.Serialize(Ship.Ranger.Types.AngleSpeedLimit)
                },
                HPMult = Ship.Ranger.Mult.HPMult,
                SpeedMult = Ship.Ranger.Mult.SpeedMult,
                AngleSpeedMult = Ship.Ranger.Mult.AngleSpeedMult,
                shipSize = Ship.ShipSize,

                //bombHP = Ship.BombHP,
                //bombSize = Ship.BombSize,
                //bombSpeed = Ship.BombSpeed,

                sunHP = Ship.SunHP,
                regenerateHP = Ship.RegenerateHP,
                syncRate = Game.SyncRate,
            };
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        public JsonResult InitShips() {
            Ship myShip;
            HttpCookie cookie = Request.Cookies["Ship"];

            if (cookie == null) {
                cookie = new HttpCookie("Ship");
                cookie.Value = Game.Instance.TimeFromStart.ToString();
                cookie.Expires = DateTime.Now.AddDays(1);
                Response.Cookies.Add(cookie);
                myShip = CreateShip(int.Parse(cookie.Value));
                Game.Instance.AddShip(myShip);
            }
            else {
                myShip = Game.Instance.ShipList.FirstOrDefault(s => s.ID == int.Parse(cookie.Value));
                if (myShip != null) {
                    myShip.VectorMove = 0;
                    myShip.VectorRotate = 0;
                    myShip.State = "Active";
                    myShip.LastActivity = DateTime.Now;
                }
                else {
                    myShip = CreateShip(int.Parse(cookie.Value));
                    Game.Instance.AddShip(myShip);
                }
            }

            var response = new {
                id = cookie.Value,
                ships = Game.Instance.ShipListActive,
            };
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public void UpdateUserName(string userName) {
            int id = GetIdByCookie();
            Game.Instance.UpdateUserName(id, userName);
        }

        [HttpPost]
        public void UpdateUserShip(string name, int value) {
            int id = GetIdByCookie();
            Game.Instance.UpdateUserShip(id, name, value);
        }

        [HttpPost]
        public void DeactivateUserShip() {
            Ship myShip = GetShipByCookie();
            myShip.VectorMove = 0;
            myShip.VectorRotate = 0;
            myShip.State = "Inactive";
        }

        public JsonResult GetShips() {
            Ship myShip = GetShipByCookie();
            myShip.LastActivity = DateTime.Now;

            var response = new {
                timeFromStart = Game.Instance.TimeFromStart,
                ships = Game.Instance.ShipListActive
            };
            //Logger.WriteToLogFile(dateBegin, DateTime.Now);
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [NonAction]
        public Ship CreateShip(int id) {
            string name = "";
            string type = "ranger";
            int indexRanger = (new Random()).Next(9);
            double X = 0;
            double Y = 0;
            double angle = 0;
            int size = Ship.ShipSize;
            Ship ship = new Ship(id, name, type, indexRanger, X, Y, angle, size);

            return ship;
        }

        [NonAction]
        public Ship GetShipByCookie() {
            HttpCookie cookie = Request.Cookies["Ship"];
            return Game.Instance.ShipList.FirstOrDefault(s => s.ID == int.Parse(cookie.Value));
        }

        [NonAction]
        public int GetIdByCookie() {
            HttpCookie cookie = Request.Cookies["Ship"];
            return int.Parse(cookie.Value);
        }
    }
}
