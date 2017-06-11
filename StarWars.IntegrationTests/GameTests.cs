using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using StarWars.Models;

namespace IntegrationTests
{
  [TestClass]
  public class ProductTests
  {
    private static IntegrationTestRouter Router { get; } = new IntegrationTestRouter();

    [TestMethod]
    public async Task CreateRanger_DeleteRanger_Verify()
    {
      var initGameViewModel = await Router.InitGame();
      Assert.IsNotNull(initGameViewModel);

      // Create new ranger ship
      var id = Guid.NewGuid();
      var name = "ship-test4";
      var ship = await Router.CreateRangerShip(id, name, 4);

      // Get all ships, verify created ranger ship
      var getShipsViewModel = await Router.GetShips();
      var testRanger = getShipsViewModel?.Ships?.FirstOrDefault(r => r.ID == id);

      Assert.IsNotNull(testRanger);
      Assert.AreEqual(name, testRanger.Name);

      // Delete created ranger ship, verify deleted
      await Router.DeleteRangerShip(id);
      getShipsViewModel = await Router.GetShips();
      testRanger = getShipsViewModel?.Ships?.FirstOrDefault(r => r.ID == id);
      Assert.IsNull(testRanger);
    }
  }
}
