using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Web.Models.Strategies
{
  public class DominatorDefenceStrategy: BaseDominatorStrategy
  {
    public DominatorDefenceStrategy(DominatorShip dominator)
      : base(dominator)
    {
    }

    public override void CalculateNextAction()
    {
      this.CalculateSun();
      if (this.OnTheSun)
      {
        return;
      }

      if (this.Target == null)
      {
        return;
      }

      this.CalculateEdges();
      if (this.AtTheEdge)
      {
        return;
      }

      // Stop rotating in order to fly further and to omit the Sun
      this.Dominator.VectorRotate = 0;

      // Accelerate
      this.Dominator.VectorMove = (this.Dominator.Speed > 0) ? 1 : -1;

      // Don't fly far away, follow the ranger at a distance
      if (this.Target.Distance > 1000 && this.Dominator.Speed > 0)
      {
        // Slow down
        this.Dominator.VectorMove = (this.Dominator.Speed > 0) ? -1 : 1;
      }
    }
  }
}