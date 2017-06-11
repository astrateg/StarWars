using System.Collections.Generic;

namespace StarWars.Models.ApiModels
{
  public class GetShipsViewModel
  {
    public int TimeFromStart { get; set; }
    public IEnumerable<RangerShip> Ships { get; set; }
    public IEnumerable<DominatorShip> Dominators { get; set; }
  }
}