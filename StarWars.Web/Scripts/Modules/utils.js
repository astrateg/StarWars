define(['Modules/game'], function (GAME) {
  var my = {};

  my.GetElement = function (arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
      if (arr[i][propName] === propValue)
        return arr[i];
  };

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
