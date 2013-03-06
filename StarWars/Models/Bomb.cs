using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models
{
    public class Bomb
    {
        public string Type { get; set; }
        public double X { get; set; }
        public double Y { get; set; }
        public double Angle { get; set; }
        public int Size { get; set; }
        public int Image { get; set; }
        public string Vector { get; set; }
        public double Speed { get; set; }
        public int Sync { get; set; }
    }
}