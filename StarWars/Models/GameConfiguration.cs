using System.Configuration;

namespace StarWars.Models
{
  public static class GameConfiguration
  {
    public static bool IsTestingMode
    {
      get
      {
        var stringSetting = ConfigurationManager.AppSettings["IsTestingMode"];
        var boolSetting = false;
        bool.TryParse(stringSetting, out boolSetting);

        return boolSetting;
      }
    }
  }
}