using System;

namespace StarWars.Web.Models
{
  public class Body
  {
    public double X { get; set; }
    public double Y { get; set; }
    public double Angle { get; set; }
    public int Size { get; set; }
    public int Image { get; set; }

    // Center Coordinates
    public double GetCenterX { get { return this.X + this.Size / 2; } }
    public double GetCenterY { get { return this.Y + this.Size / 2; } }

    public Body(double x, double y, double angle, int size, int index)
    {
      this.X = x;
      this.Y = y;
      this.Angle = angle;
      this.Size = size;
      this.Image = index;
    }

    public void GravityCorrection(double vx, double vy, double mass)
    {
      // Distance from ship to Sun
      var gravityNormK = Space.Sun.Size * 5;
      var rx = (this.GetCenterX - Space.Sun.CenterX) / gravityNormK;
      var ry = (this.GetCenterY - Space.Sun.CenterY) / gravityNormK;
      var rd = Math.Sqrt(rx * rx + ry * ry);

      // The Sun gravity is working everywhere
      var phi = Math.Atan2(-ry, rx);
      var speed = mass / (1 + rd * rd) * 0.2;
      double sx = Math.Cos(phi) * speed;
      double sy = Math.Sin(phi) * speed;
      this.X = this.X + vx - sx;
      this.Y = this.Y + vy + sy;  // opposite sign - because of counting Y-coordinate on the canvas (from top to bottom - vise versa math.)
      if (this is Bomb)
      {
        // (this.Angle + phi) - "rotating" coordinate system for ship in order to use "sinus" for sign calculating (+ or -)
        // (speed) - depends on 1 / (distance^2)
        this.Angle += 0.01 * speed * Math.Sign(Math.Sin(this.Angle + phi));
      }
    }
  }
}