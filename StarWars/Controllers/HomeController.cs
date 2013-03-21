using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;
using StarWars.Models;

namespace StarWars.Controllers {
    [SessionState(SessionStateBehavior.Disabled)]
    public class HomeController : Controller {
        public ActionResult Index() {
            ViewBag.ServerName = Game.Instance.ServerName;
            return View();
        }

        // Разделяем инициализацию для космоса (InitShips) и кораблей (InitSpace)
        // (иначе не получится в Javascript развести их по модулям - SPACE и SHIPS)

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
            var response = new {
                shipMaxHP = Ship.ShipMaxHP,
                shipSize = Ship.ShipSize,
                shipSpeed = Ship.ShipSpeed,
                shipAngleSpeed = Ship.ShipAngleSpeed,
                bombHP = Ship.BombHP,
                bombSize = Ship.BombSize,
                bombSpeed = Ship.BombSpeed,
                sunHP = Ship.SunHP,
                regenerateHP = Ship.RegenerateHP
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
                myShip = CreateShip(cookie.Value);
                Game.Instance.AddShip(myShip);
            }
            else {
                myShip = Game.Instance.ShipList.FirstOrDefault(s => s.ID == cookie.Value);
                if (myShip != null) {
                    myShip.VectorMove = "Stop";
                    myShip.VectorRotate = "Stop";
                }
                else {
                    myShip = CreateShip(cookie.Value);
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
            HttpCookie cookie = Request.Cookies["Ship"];
            string id = cookie.Value;
            Game.Instance.UpdateShipList(id, "Name", userName);
        }

        [HttpPost]
        public void UpdateUserShip(string name, string value) {
            HttpCookie cookie = Request.Cookies["Ship"];
            string id = cookie.Value;
            Game.Instance.UpdateShipList(id, name, value);
        }

        [HttpPost]
        public void DeactivateUserShip() {
            HttpCookie cookie = Request.Cookies["Ship"];
            string id = cookie.Value;
            Game.Instance.UpdateShipList(id, "VectorMove", "Inactive");
            Game.Instance.UpdateShipList(id, "VectorRotate", "Inactive");
        }

        public JsonResult GetShips() {
            var response = new {
                timeFromStart = Game.Instance.TimeFromStart,
                ships = Game.Instance.ShipListActive
            };
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [NonAction]
        public Ship CreateShip(string id) {
            string name = "";
            string type = "ranger";
            double maxHP = Ship.ShipMaxHP;
            double HP = Ship.ShipMaxHP;
            double X = 0;
            double Y = 0;
            int speed = Ship.ShipSpeed;
            double angle = 0;
            double angleSpeed = Ship.ShipAngleSpeed;
            int size = Ship.ShipSize;
            int image = 0;
            string vectorMove = "Stop";
            string vectorRotate = "Stop";
            Ship ship = new Ship(id, name, type, maxHP, HP, X, Y, speed, angle, angleSpeed, size, image, vectorMove, vectorRotate, null, null, null, null);

            return ship;
        }
    }
}
