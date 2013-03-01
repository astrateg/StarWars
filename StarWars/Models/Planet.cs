using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models
{
    public class Planet
    {
        public string Name { get; set; }
        public int OrbitRadius { get; set; }
        public int OrbitAngle { get; set; }
        public int Size { get; set; }

        public Planet(string name, int orbitRadius, int orbitAngle) {
            this.Name = name;
            this.OrbitRadius = orbitRadius;
            this.OrbitAngle = orbitAngle;
            this.Size = 95;
        }
    }
}