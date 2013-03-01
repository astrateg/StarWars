using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models
{
    public class Ship
    {
        public string Name { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double Angle { get; set; }
        public int Size { get; set; }
        public string Image { get; set; }
        public string VectorMove { get; set; }
        public string VectorRotate { get; set; }
        public int Delay { get; set; }
    }
}