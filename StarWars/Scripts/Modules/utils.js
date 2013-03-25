define(['Modules/game'], function (GAME) {
    var my = {};

    // Generating random int number for fetching random image from array of dominator ships
    my.GetRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Generating random X-coordinate in one of the 4th corners (i.e. Left or Right)
    my.RandomStartX = function () {
        var randomX = my.GetRandomInt(200, 400);
        var randomLeft = my.GetRandomInt(0, 1);
        return (randomLeft) ? randomX : (GAME.Canvas.width - randomX);
    }

    // Generating random Y-coordinate in one of the 4th corners (i.e. Top or Bottom)
    my.RandomStartY = function () {
        var randomY = my.GetRandomInt(200, 400);
        var randomTop = my.GetRandomInt(0, 1);
        return (randomTop) ? randomY : (GAME.Canvas.height - randomY);
    }

    //// Throttling function calls (this function helps to delay user key-typing for any period, e.g. 20 ms)
    //my.Throttle = function (fn, delay) {
    //    var timer = null;
    //    return function () {
    //        var context = this, args = arguments;
    //        clearTimeout(timer);
    //        timer = setTimeout(function () {
    //            fn.apply(context, args);
    //        }, delay);
    //    };
    //}

    return my;
});
