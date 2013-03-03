using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using StarWars.Models;

namespace StarWars.Controllers
{
	public class HomeController : Controller
	{
		public ActionResult Index()
		{
			ViewBag.ServerName = Game.Instance.ServerName;
			return View();
		}

		public JsonResult GetSessionAndShips()
		{
			if (Session["Ship"] == null)
			{
				HttpCookie cookie = Request.Cookies["Ship"];
				if (cookie == null)
				{
					cookie = new HttpCookie("Ship");
					cookie.Value = Session.SessionID;
					cookie.Expires = DateTime.Now.AddDays(1);
					this.ControllerContext.HttpContext.Response.Cookies.Add(cookie);
				}
				Session["Ship"] = cookie.Value;
			}

			// Для ID корабля (пока что Имя - это то же самое, что и id)
			var response = new { sessionId = Session["Ship"], ships = Game.Instance.GetShipList };
			return Json(response, JsonRequestBehavior.AllowGet);
		}

		public JsonResult SynchronizePlanets()
		{
			return Json(Game.Instance.TimeFromStart, JsonRequestBehavior.AllowGet);
		}

		[HttpPost]
		public JsonResult SynchronizeShips(string name, string x, string y, string angle, string size, string image, string vectorMove, string vectorRotate, string delay)
		{
			Ship newShip = new Ship
			{
				Name = name,
				X = double.Parse(x, CultureInfo.InvariantCulture),  // Точка/запятая в вещественных числах для ENG/RUS
				Y = double.Parse(y, CultureInfo.InvariantCulture),
				Angle = double.Parse(angle, CultureInfo.InvariantCulture),
				Size = int.Parse(size),
				Image = image,
				VectorMove = vectorMove,
				VectorRotate = vectorRotate,
				Delay = int.Parse(delay)
			};

			Game.Instance.UpdateShipList(newShip);
			return Json(new { ships = Game.Instance.GetShipList});
		}

	}
}
