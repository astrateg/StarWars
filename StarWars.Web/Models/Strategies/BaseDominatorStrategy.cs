using System;
using System.Linq;

namespace StarWars.Web.Models.Strategies
{
  public abstract class BaseDominatorStrategy
  {
    protected DominatorShip Dominator { get; set; }
    protected DominatorTarget Target { get; set; }
    protected bool OnTheSun { get; set; }
    protected bool InTheLeft { get; set; }
    protected bool InTheRight { get; set; }
    protected bool InTheTop { get; set; }
    protected bool InTheBottom { get; set; }

    protected bool AtTheEdge
    {
      get { return this.InTheLeft || this.InTheRight || this.InTheTop || this.InTheBottom; }
    }

    protected bool ReadyToShoot
    {
      // TODO: Add checking the Sun on the trajectory
      get
      { return 
          this.Target != null 
          && this.Target.Distance < 500 
          && Math.Abs(Math.PI - this.Target.DiffAngle) < Ship.Mult.AngleSpeedMult * 2;
      }
    }

    public BaseDominatorStrategy(DominatorShip dominator)
    {
      this.Dominator = dominator;
    }

    public void GetInitialState()
    {
      GetTargetCoordinates();
    }

    protected void CalculateSun()
    {
      var sunCenterDistance = Math.Sqrt(Math.Pow(this.Dominator.GetCenterY - Space.Sun.CenterY, 2) + Math.Pow(this.Dominator.GetCenterX - Space.Sun.CenterX, 2));
      // Counted with a little margin: Space.Sun.Size/2
      this.OnTheSun = (sunCenterDistance - this.Dominator.Size / 2) < Space.Sun.Size;

      if (!this.OnTheSun)
      {
        return;
      }

      // Fly straight ahead and accelerate
      this.Dominator.VectorMove = (this.Dominator.Speed > 0) ? 1 : -1;
      this.Dominator.VectorRotate = 0;
    }

    protected void CalculateEdges()
    {
      // If the dominator is flying into a corner (ShipSize), it should fly away from it
      // Keeping in mind the ranger's position, and selected strategy
      this.InTheLeft = this.Dominator.X < this.Dominator.Size;
      this.InTheTop = this.Dominator.Y < this.Dominator.Size;
      this.InTheRight = this.Dominator.X > (Game.SpaceWidth - this.Dominator.Size);
      this.InTheBottom = this.Dominator.Y > (Game.SpaceHeight - this.Dominator.Size);

      if (this.AtTheEdge)
      {
        this.Dominator.VectorRotate = 1;
        this.Dominator.VectorMove = (this.Dominator.Speed > 0) ? 1 : -1;
      }
    }

    public virtual void CalculateNextAction()
    {
      throw new NotImplementedException();
    }

    private void GetTargetCoordinates()
    {
      double distance = 0.0;
      var ranger = GetNearestRanger(out distance);
      if (ranger == null)
      {
        return;
      }

      this.Target = new DominatorTarget();
      this.Target.X = ranger.GetCenterX;
      this.Target.Y = ranger.GetCenterY;
      this.Target.Angle = Math.Atan2(this.Dominator.GetCenterY - this.Target.Y, this.Dominator.GetCenterX - this.Target.X);
      this.Target.Distance = distance;
      this.Target.DiffAngle = (this.Dominator.Angle - this.Target.Angle) % (2 * Math.PI);
    }

    private RangerShip GetNearestRanger(out double nearestDistance)
    {
      var rangers = Game.Instance.RangerShipListActive;
      RangerShip nearestRanger = null;
      nearestDistance = double.MaxValue;

      foreach (var ranger in rangers)
      {
        if (ranger.Stealth == 1)
        {
          continue;
        }

        var currentDistance = CalculateDistanceToRanger(ranger);
        if (currentDistance < nearestDistance)
        {
          nearestDistance = currentDistance;
          nearestRanger = ranger;
        }
      }

      return nearestRanger;
    }

    private double CalculateDistanceToRanger(RangerShip ranger)
    {
      var distance = Math.Sqrt(Math.Pow(this.Dominator.GetCenterY - ranger.Y, 2) + Math.Pow(this.Dominator.GetCenterX - ranger.X, 2));
      return distance;
    }
  }
}