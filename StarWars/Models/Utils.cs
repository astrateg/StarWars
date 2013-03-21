using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace StarWars.Models {
    public static class Utils {

        // Generating random int number for fetching random image from array of dominator ships
        public static int GetRandomInt(int min, int max) {
            Random rnd = new Random();
            return rnd.Next(min, max);
        }
    
        // Generating random X-coordinate in one of the 4th corners (i.e. Left or Right)
        public static int RandomStartX() {
            var randomX = GetRandomInt(200, 400);
            var randomLeft = GetRandomInt(0, 1);
            return (randomLeft == 1) ? randomX : (1920 - randomX);   // надо исправить 1920
        }

        // Generating random Y-coordinate in one of the 4th corners (i.e. Top or Bottom)
        public static int RandomStartY() {
            var randomY = GetRandomInt(200, 400);
            var randomTop = GetRandomInt(0, 1);
            return (randomTop == 1) ? randomY : (1920 - randomY);   // надо исправить 1920
        }
    }
}