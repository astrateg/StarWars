using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using StarWars.Models;

namespace StarWars.Controllers {
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
            if (Session["Ship"] == null) {
                HttpCookie cookie = Request.Cookies["Ship"];
                if (cookie == null) {
                    cookie = new HttpCookie("Ship");
                    cookie.Value = Session.SessionID;
                    cookie.Expires = DateTime.Now.AddDays(1);
                    this.ControllerContext.HttpContext.Response.Cookies.Add(cookie);
                }
                Session["Ship"] = cookie.Value;
            }

            // Для ID корабля (пока что Имя - это то же самое, что и id)
            var response = new {
                sessionId = Session["Ship"],
                ships = Game.Instance.ShipList
            };
            return Json(response, JsonRequestBehavior.AllowGet);
        }

        [HttpPost]
        public JsonResult Synchronize(Ship newShip) {
            var cheat = Game.Instance.UpdateShipList(newShip);
            var response = new {
                timeFromStart = Game.Instance.TimeFromStart,
                ships = Game.Instance.ShipList,
                c = (cheat) ? 1 : 0
            };
            return Json(response);
        }

    }
}
