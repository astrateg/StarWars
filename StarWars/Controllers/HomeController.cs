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
		//
		// GET: /Home/

		public ActionResult Index()
		{
			ViewBag.ServerName = Game.Instance.ServerName;  // На всякий случай - для имени корабля
			ViewBag.SessionId = Session.SessionID;          // Для ID корабля (пока что Имя - это то же самое, что и id)
			return View();
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

			//string sessionName = string.Empty;
			//if (Session["Ship"] != null)
			//    sessionName = Session["Ship"].ToString();  // Передается "бортовой" номер корабля (т.е. имя компьютера)
			//else
			//    sessionName = Session.SessionID;
			//    Session["Ship"] = sessionName;

			Game.Instance.UpdateShipList(newShip);
			return Json(new { ships = Game.Instance.GetShipList});
		}

	}
}
