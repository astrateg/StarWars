using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Serialization;
using System.Web;

namespace StarWars.Models
{
    public class Ship
    {
        public string Name { get; set; }
        public string Type { get; set; }
        public double MaxHP { get; set; }
        public double HP { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double Angle { get; set; }
        public int Size { get; set; }
        public int Image { get; set; }
        public string VectorMove { get; set; }
        public string VectorRotate { get; set; }
        public int Delay { get; set; }
        public List<Bomb> Bombs { get; set; }
    }
}