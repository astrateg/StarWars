using System;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.SessionState;
using StarWars.Models;

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
      var response = new
      {
        syncRate = Game.SyncRate,
        sidebarWidth = Game.SidebarWidth,
        spaceWidth = Game.SpaceWidth,
        spaceHeight = Game.SpaceHeight
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
        cookie.Value = Game.Instance.TimeFromStart.ToString();
        cookie.Expires = DateTime.Now.AddDays(1);
        Response.Cookies.Add(cookie);
      }
      else
      {
        myShip = Game.Instance.RangerShipList.FirstOrDefault(s => s.ID == int.Parse(cookie.Value));
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
      RangerShip myShip;
      HttpCookie cookie = Request.Cookies["Ship"];
      if (index > -1)
      {
        myShip = CreateRangerShip(int.Parse(cookie.Value), name, index);
        Game.Instance.AddRangerShip(myShip);
      }

      GenerateRandomDominatorShips(3);

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
      int id = GetIdByCookie();
      Game.Instance.UpdateUserName(id, userName);
    }

    [HttpPost]
    public void UpdateUserShip(string name, int value)
    {
      int id = GetIdByCookie();
      Game.Instance.UpdateUserShip(id, name, value);
    }

    [HttpPost]
    public void ChangeWeapon(int index)
    {
      int id = GetIdByCookie();
      Game.Instance.ChangeWeapon(id, index);
    }

    [HttpPost]
    public void ChangeSkill(string skill)
    {
      int id = GetIdByCookie();
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

    //public JsonResult GetShips() {
    //    Ship myShip = GetShipByCookie();
    //    var response = new {
    //        timeFromStart = Game.Instance.TimeFromStart,
    //        ships = Game.Instance.ShipListActive
    //    };
    //    //Logger.WriteToLogFile(dateBegin, DateTime.Now);
    //    return Json(response, JsonRequestBehavior.AllowGet);
    //}

    [NonAction]
    public RangerShip CreateRangerShip(int id, string name, int index)
    {
      string type = "ranger";
      double X = Utils.RandomStartX();
      double Y = Utils.RandomStartY();
      double angle = 0;
      int size = Ship.ShipSize;
      RangerShip ship = new RangerShip(id, name, type, index, X, Y, angle, size);

      return ship;
    }

    [NonAction]
    public DominatorShip CreateDominatorShip(int id, string name, int typeIndex, int imageIndex, int size)
    {
      string type = "dominator";
      double X = Utils.RandomStartX();
      double Y = Utils.RandomStartY();
      double angle = 0;
      DominatorShip ship = new DominatorShip(id, name + id.ToString(), type, typeIndex, imageIndex, X, Y, angle, size);

      return ship;
    }

    [NonAction]
    public void GenerateRandomDominatorShips(int count)
    {
      for (int i = 0; i < count; i++)
      {
        var id = Utils.RandomInt(100, 1000);
        var dominatorTypeIndex = Utils.RandomInt(0, 4);
        var dominatorType = DominatorShip.DominatorTypes.Type[dominatorTypeIndex];
        var dominatorImageIndex = Utils.RandomInt(0, 3);
        var dominatorSize = DominatorShip.DominatorTypes.Size[dominatorTypeIndex];

        var dominator = CreateDominatorShip(id, "dominator-" + dominatorType, dominatorTypeIndex, dominatorImageIndex, dominatorSize);
        Game.Instance.AddDominatorShip(dominator);
      }
    }

    [NonAction]
    public Ship GetShipByCookie()
    {
      HttpCookie cookie = Request.Cookies["Ship"];
      return Game.Instance.RangerShipList.FirstOrDefault(s => s.ID == int.Parse(cookie.Value));
    }

    [NonAction]
    public int GetIdByCookie()
    {
      HttpCookie cookie = Request.Cookies["Ship"];
      return int.Parse(cookie.Value);
    }
  }
}
