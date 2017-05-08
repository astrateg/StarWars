namespace StarWars.Models
{
  public class DominatorTarget
  {
    public double X { get; set; }

    public double Y { get; set; }

    public double Angle { get; set; }

    public double Distance { get; set; }

    public double DiffAngle { get; internal set; }
  }
}