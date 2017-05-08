using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models.Strategies
{
  public class DominatorAttackStrategy: BaseDominatorStrategy
  {
    public DominatorAttackStrategy(DominatorShip dominator)
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

      if (this.Target.DiffAngle > 0 && this.Target.DiffAngle < Math.PI)
      {
        this.Dominator.VectorRotate = 1;
      }
      else
      {
        this.Dominator.VectorRotate = -1;
      }

      if (Math.Abs(this.Target.DiffAngle) < Math.PI / 2)
      {
        this.Dominator.VectorMove = -1;
      }
      else
      {
        this.Dominator.VectorMove = 1;
      }

      if (this.Target.Distance < 500 && this.Dominator.Speed > 0)
      {
        this.Dominator.VectorMove = -1;
      }
    }
  }
}