﻿using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;
using StarWars.Models;
using StarWars.Models.ApiModels;

namespace StarWars.Controllers
{
  [SessionState(SessionStateBehavior.Disabled)]
  public class HomeController : Controller
  {
    public ActionResult Index()
    {
      return View();
    }

    // Разделяем инициализацию для космоса (InitShips) и кораблей (InitSpace)
    // (иначе не получится в Javascript развести их по модулям - SPACE и SHIPS)

    public JsonResult InitGame()
    {
      var response = new InitGameViewModel
      {
        SyncRate = Game.SyncRate,
        SidebarWidth = Game.SidebarWidth,
        SpaceWidth = Game.SpaceWidth,
        SpaceHeight = Game.SpaceHeight
      };

      return Json(response, JsonRequestBehavior.AllowGet);
    }

    public JsonResult InitSpace()
    {
      var response = new
      {
        Sun = new
        {
          Size = Space.Sun.Size,
          Angle = Space.Sun.Angle,
        },
        Planets = Space.Planets
      };

      return Json(response, JsonRequestBehavior.AllowGet);
    }

    public JsonResult InitShipConstants()
    {
      RangerShip myShip;
      HttpCookie cookie = Request.Cookies["Ship"];
      int MyShipExists = 0;
      int MyShipImageIndex = -1;

      if (cookie == null)
      {
        cookie = new HttpCookie("Ship");
        cookie.Value = Guid.NewGuid().ToString();
        cookie.Expires = DateTime.Now.AddDays(1);
        Response.Cookies.Add(cookie);
      }
      else
      {
        myShip = Game.Instance.RangerShipList.FirstOrDefault(s => s.ID == Guid.Parse(cookie.Value));
        if (myShip != null)
        {
          myShip.VectorMove = 0;
          myShip.VectorRotate = 0;
          myShip.State = "Active";
          MyShipExists = 1;
          MyShipImageIndex = myShip.Image;
        }
      }

      var response = new
      {
        MyShipExists = MyShipExists,
        MyShipImageIndex = MyShipImageIndex,
        Types = new
        {
          Type = RangerShip.RangerTypes.Type,
          HPStart = RangerShip.RangerTypes.HPStart,
          HPLimit = RangerShip.RangerTypes.HPLimit,
          MPStart = RangerShip.RangerTypes.MPStart,
          MPLimit = RangerShip.RangerTypes.MPLimit,
          ArmorStart = RangerShip.RangerTypes.ArmorStart,
          ArmorLimit = RangerShip.RangerTypes.ArmorLimit,
          SpeedStart = RangerShip.RangerTypes.SpeedStart,
          SpeedLimit = RangerShip.RangerTypes.SpeedLimit,
          AngleSpeedStart = RangerShip.RangerTypes.AngleSpeedStart,
          AngleSpeedLimit = RangerShip.RangerTypes.AngleSpeedLimit,
          Weapons = RangerShip.RangerTypes.Weapons
        },
        DominatorTypes = new
        {
          Type = DominatorShip.DominatorTypes.Type,
          HPStart = DominatorShip.DominatorTypes.HPStart,
          HPLimit = DominatorShip.DominatorTypes.HPLimit,
          MPStart = DominatorShip.DominatorTypes.MPStart,
          MPLimit = DominatorShip.DominatorTypes.MPLimit,
          ArmorStart = DominatorShip.DominatorTypes.ArmorStart,
          ArmorLimit = DominatorShip.DominatorTypes.ArmorLimit,
          SpeedStart = DominatorShip.DominatorTypes.SpeedStart,
          SpeedLimit = DominatorShip.DominatorTypes.SpeedLimit,
          AngleSpeedStart = DominatorShip.DominatorTypes.AngleSpeedStart,
          AngleSpeedLimit = DominatorShip.DominatorTypes.AngleSpeedLimit,
          Weapons = DominatorShip.DominatorTypes.Weapons
        },
        HPMult = Ship.Mult.HPMult,
        MPMult = Ship.Mult.MPMult,
        SpeedMult = Ship.Mult.SpeedMult,
        AngleSpeedMult = Ship.Mult.AngleSpeedMult,
        ShipSize = Ship.ShipSize,
        BombSize = Bomb.Types.Size,
        SyncRate = Game.SyncRate,
      };

      return Json(response, JsonRequestBehavior.AllowGet);
    }

    [HttpPost]
    public JsonResult InitShips(int index, string name)
    {
      HttpCookie cookie = Request.Cookies["Ship"];
      if (index > -1)
      {
        CreateRangerShip(Guid.Parse(cookie.Value), name, index);
      }

      if (GameConfiguration.IsDominator)
      {
        GenerateRandomDominatorShips(GameConfiguration.DominatorCount);
      }

      var response = new
      {
        id = cookie.Value,
        ships = Game.Instance.RangerShipListActive,
        dominators = Game.Instance.DominatorShipListActive
      };

      return Json(response);
    }

    [HttpPost]
    public void UpdateUserName(string userName)
    {
      Guid id = GetIdByCookie();
      Game.Instance.UpdateUserName(id, userName);
    }

    [HttpPost]
    public void UpdateUserShip(string name, int value)
    {
      Guid id = GetIdByCookie();
      Game.Instance.UpdateUserShip(id, name, value);
    }

    [HttpPost]
    public void ChangeWeapon(int index)
    {
      Guid id = GetIdByCookie();
      Game.Instance.ChangeWeapon(id, index);
    }

    [HttpPost]
    public void ChangeSkill(string skill)
    {
      Guid id = GetIdByCookie();
      Game.Instance.ChangeSkill(id, skill);
    }

    [HttpPost]
    public void DeactivateUserShip()
    {
      Ship myShip = GetShipByCookie();
      myShip.VectorMove = 0;
      myShip.VectorRotate = 0;
      myShip.State = "Inactive";
    }

    [HttpGet]
    public JsonResult GetShips()
    {
      var response = new GetShipsViewModel
      {
        TimeFromStart = Game.Instance.TimeFromStart,
        Ships = Game.Instance.RangerShipListActive,
        Dominators = Game.Instance.DominatorShipListActive
      };

      return Json(response, JsonRequestBehavior.AllowGet);
    }

    [HttpPost]
    public JsonResult CreateRangerShip(Guid id, string name, int index)
    {
      string type = "ranger";
      double X = Utils.RandomStartX();
      double Y = Utils.RandomStartY();
      double angle = 0;
      int size = Ship.ShipSize;
      RangerShip ship = new RangerShip(id, name, type, index, X, Y, angle, size);
      Game.Instance.AddRangerShip(ship);

      return Json(ship);
    }

    [HttpPost]
    public JsonResult CreateDominatorShip(Guid id, string name, int typeIndex, int imageIndex, int size)
    {
      string type = "dominator";
      double X = Utils.RandomStartX();
      double Y = Utils.RandomStartY();
      double angle = 0;
      DominatorShip ship = new DominatorShip(id, name + id.ToString().Substring(0, 3).ToUpper(), type, typeIndex, imageIndex, X, Y, angle, size);
      Game.Instance.AddDominatorShip(ship);

      return Json(ship);
    }

    [NonAction]
    public void GenerateRandomDominatorShips(int count)
    {
      for (int i = 0; i < count; i++)
      {
        var id = Guid.NewGuid();
        var dominatorTypeIndex = Utils.RandomInt(0, 4);
        var dominatorType = DominatorShip.DominatorTypes.Type[dominatorTypeIndex];
        var dominatorImageIndex = Utils.RandomInt(0, 3);
        var dominatorSize = DominatorShip.DominatorTypes.Size[dominatorTypeIndex];

        CreateDominatorShip(id, "dominator-" + dominatorType, dominatorTypeIndex, dominatorImageIndex, dominatorSize);
      }
    }

    [NonAction]
    public Ship GetShipByCookie()
    {
      HttpCookie cookie = Request.Cookies["Ship"];

      return Game.Instance.RangerShipList.FirstOrDefault(s => s.ID == Guid.Parse(cookie.Value));
    }

    [NonAction]
    public Guid GetIdByCookie()
    {
      HttpCookie cookie = Request.Cookies["Ship"];

      return Guid.Parse(cookie.Value);
    }
  }
}
