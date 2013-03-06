using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using StarWars.Models;
using Newtonsoft.Json.Linq;

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
		public JsonResult SynchronizeShips(Ship newShip)
		{
			Game.Instance.UpdateShipList(newShip);
			return Json(new { ships = Game.Instance.GetShipList});
		}

	}
}
