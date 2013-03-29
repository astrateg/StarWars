using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models
{
    public class Space
    {
        public static class Sun
        {
            public static int Size { get { return 220; } }
            public static double RotationAngle { get { return 0.001; } }
            public static double CenterX { get { return Game.SpaceWidth / 2; } }
            public static double CenterY { get { return Game.SpaceHeight / 2; } }
        }

        private static int earthOrbitRadius = 200, marsOrbitRadius = 400, jupiterOrbitRadius = 600;
        private static double earthOrbitAngleStart = 0, marsOrbitAngleStart = Math.PI / 2, jupiterOrbitAngleStart = Math.PI;
        private static double earthMoveAngle = 0.0005, marsMoveAngle = -0.0003, jupiterMoveAngle = 0.0002;
        //private static int earthSize = 50, marsSize = 40, jupiterSize = 95;

        public static List<Planet> Planets = new List<Planet>
        {
            new Planet("earth", earthOrbitRadius, earthOrbitAngleStart, earthMoveAngle),
            new Planet("mars", marsOrbitRadius, marsOrbitAngleStart, marsMoveAngle),
            new Planet("jupiter", jupiterOrbitRadius, jupiterOrbitAngleStart, jupiterMoveAngle)
        };

        public class Planet
        {
            public static int SizeGeneral { get { return 95; } }

            public string Name { get; set; }
            public double OrbitRadius { get; set; }
            public double OrbitAngleStart { get; set; }
            public double MoveAngle { get; set; }
            public int Size { get; set; }

            public Planet(string name, double orbitRadius, double orbitAngleStart, double moveAngle)
            {
                this.Name = name;
                this.OrbitRadius = orbitRadius;
                this.OrbitAngleStart = orbitAngleStart;
                this.MoveAngle = moveAngle;
                this.Size = Planet.SizeGeneral;
            }
        }
    }
}