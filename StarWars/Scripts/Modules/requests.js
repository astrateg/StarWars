define([], function () {
  var my = {};
  var path = location.hostname;
  my.InitGame = function () {
    var request = $.ajax({
      url: "http://" + path + "/Home/InitGame/",
      type: "GET",
      dataType: "json",
      async: false,       // !!! (синхронный запрос)
      cache: false
    });

    return request;
  };

  my.InitSpace = function () {
    var request = $.ajax({
      url: "http://" + path + "/Home/InitSpace/",
      type: "GET",
      dataType: "json",
      async: false,       // !!! (синхронный запрос)
      cache: false
    });

    return request;
  };

  my.InitShipConstants = function () {
    var request = $.ajax({
      url: "http://" + path + "/Home/InitShipConstants/",
      type: "GET",
      dataType: "json",
      async: false,       // !!! (синхронный запрос, чтобы выяснить, есть у меня корабль или нет)
      cache: false
    });

    return request;
  };

  // Первый "корабельный" запрос к серверу для получения текущего списка кораблей и заполнения массива SHIP.Ships
  // (если нашего корабля еще нет, то он будет создан)
  my.InitShips = function (index, name) {
    var request = $.ajax({
      url: "http://" + path + "/Home/InitShips/",
      type: "POST",
      data: { index: index, name: name },
      dataType: "json",
      cache: false
    });

    return request;
  };

  // Последующие запросы к серверу на получение пересчитанного списка кораблей для обновления массива SHIP.Ships
  //my.GetShips = function () {
  //    var request = $.ajax({
  //        url: "http://" + path + "/Home/GetShips/",
  //        type: "GET",
  //        dataType: "json",
  //        cache: false,
  //        //async: false,       // !!! (синхронный запрос)
  //        //timeout: 11      // Если запрос тормозит, отменяем его
  //    });
  //    return request;
  //};

  // Обновление имени пользователя на сервере
  my.UpdateUserName = function (userName) {
    var request = $.ajax({
      url: "http://" + path + "/Home/UpdateUserName/",
      type: "POST",
      data: { userName: userName },
      cache: false
    });

    return request;
  };

  // Отключение корабля на сервере
  my.DeactivateUserShip = function () {
    var request = $.ajax({
      url: "http://" + path + "/Home/DeactivateUserShip/",
      type: "POST",
      data: {},
      cache: false
    });

    return request;
  };

  // Обновление на сервере текущих действий корабля - вызывается по нажатию/отжатию клавиш: Left/Right/Up/Down/Space 
  // а также при обновлении вида корабля - вызов этой функции с соотв. параметрами ("Image", index)
  my.UpdateUserShip = function (name, value) {
    // Отправляем только совершенное действие
    $.ajax({
      url: "http://" + path + "/Home/UpdateUserShip/",
      type: "POST",
      data: { name: name, value: value },
      //dataType: "json",
      //contentType: "application/json; charset=utf-8", // !!! (по умолчанию - "application/x-www-form-urlencoded; charset=UTF-8")
      cache: false
    });
  };

  my.ChangeWeapon = function (index) {
    $.ajax({
      url: "http://" + path + "/Home/ChangeWeapon/",
      type: "POST",
      data: { index: index },
      cache: false
    });
  };

  my.ChangeSkill = function (skill) {
    $.ajax({
      url: "http://" + path + "/Home/ChangeSkill/",
      type: "POST",
      data: { skill: skill },
      cache: false
    });
  };

  return my;
});