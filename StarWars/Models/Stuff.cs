using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Script.Serialization;

namespace StarWars.Models {
    public class Stuff : Bomb {
        public static new class Types {
            public static string[] Type = new string[] { "bonusHP", "bonusMP" };
            public static int[] HP = new int[] { 100, 0 };
            public static int[] MP = new int[] { 0, 100 };
            public static double[] Rotate = new double[] { 0.01, 0.01 };
            public static int[] Size = new int[] { 50, 50 };
            public static int[] Speed = new int[] { 1, 1 };
        }

        public Stuff(string type, double x, double y, double angle, double rotate, int size, double speed, int index) 
            : base(type, x, y, angle, rotate, size, speed, index) {
        }
    }

}