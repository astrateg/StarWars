using System;

namespace StarWars.Web.Models
{
  public static class Utils
  {
    public static Random rnd = new Random();
    // Generating random X-coordinate in one of the 4th corners (i.e. Left or Right)
    public static int RandomStartX()
    {
      int randomX = rnd.Next(300, 600);
      double randomLeft = rnd.NextDouble();
      return (randomLeft < 0.5) ? randomX : (Game.SpaceWidth - randomX);
    }

    // Generating random Y-coordinate in one of the 4th corners (i.e. Top or Bottom)
    public static int RandomStartY()
    {
      int randomY = rnd.Next(300, 600);
      double randomTop = rnd.NextDouble();
      return (randomTop < 0.5) ? randomY : (Game.SpaceHeight - randomY);
    }

    public static int RandomSpaceX()
    {
      double randomX = rnd.NextDouble();
      return (int)(Game.SpaceWidth * randomX);
    }

    public static int RandomSpaceY()
    {
      double randomY = rnd.NextDouble();
      return (int)(Game.SpaceHeight * randomY);
    }

    public static double RandomSpaceAngle()
    {
      double randomAngle = rnd.NextDouble();
      return randomAngle * 2 * Math.PI;
    }

    public static int RandomInt(int min, int max)
    {
      return rnd.Next(min, max);
    }
  }
}