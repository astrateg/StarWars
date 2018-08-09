using System.Configuration;

namespace StarWars.Web.Models
{
  public static class GameConfiguration
  {
    public static bool IsTestingMode
    {
      get { return GetBool("IsTestingMode"); }
    }

    public static bool IsDominator
    {
      get { return GetBool("IsDominator"); }
    }

    public static int DominatorCount
    {
      get { return GetInt("DominatorsCount"); }
    }

    private static bool GetBool(string configName)
    {
      var stringSetting = ConfigurationManager.AppSettings[configName];
      var boolSetting = false;
      bool.TryParse(stringSetting, out boolSetting);

      return boolSetting;
    }

    private static int GetInt(string configName)
    {
      var stringSetting = ConfigurationManager.AppSettings[configName];
      var intSetting = 0;
      int.TryParse(stringSetting, out intSetting);

      return intSetting;
    }
  }
}