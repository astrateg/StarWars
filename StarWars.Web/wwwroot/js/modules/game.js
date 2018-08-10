define(['modules/requests', 'modules/ship'], function (REQUESTS, SHIP) {
  var my = {};
  my.ImagePath = location.href + "/images/";
  my.IntervalID = 0;      // для setInterval

  var totalWidth = document.documentElement.clientWidth;
  var totalHeight = document.documentElement.clientHeight;

  my.Body = $('body').eq(0);  // eq(0) - это замена [0] (чтобы можно было вызывать метод jQuery css - иначе будет элемент DOM вместо объекта jQuery)

  my.Canvas = document.createElement('canvas');
  my.Canvas.height = totalHeight;

  my.Context = my.Canvas.getContext('2d');
  document.body.appendChild(my.Canvas);

  // *** Sidebar ***
  my.Sidebar = document.getElementById("Sidebar");
  my.Sidebar.style.height = my.Canvas.height + "px";
  my.Sidebar.style.cssFloat = "left";
  my.Sidebar.style.backgroundColor = "grey";

  // *** Explosion ***
  my.Explosion = {};
  my.Explosion.imgExplosion = new Image();
  my.Explosion.imgExplosion.src = my.ImagePath + "explosion.png";
  my.Explosion.imgExplosionSizeX = 384;
  my.Explosion.imgExplosionSizeY = 256;                       // Explosion Image size
  my.Explosion.imgExplosionStepX = my.Explosion.imgExplosionSizeX / 3;
  my.Explosion.imgExplosionStepY = my.Explosion.imgExplosionSizeY / 4;     // Image step for "explosion background shift"

  // *** Statistics ***
  var tableStat = document.getElementById("Statistics").children[0];       // !!! (подключаемся к <tbody>, иначе строки в таблицу не добавляются)
  my.Statistics = {};

  // Add row to Statistics table
  my.Statistics.AddStatRow = function (ship) {
    var row, cell, image;

    row = document.createElement('tr');
    row.id = ship.ID;
    if (ship.ID === SHIP.MyShip.ID) {
      $(row).addClass("MyShip");
    }

    // Иконка корабля
    cell = document.createElement('td');
    $(cell).addClass("StatShip");
    image = document.createElement('img');
    image.width = ship.Size;
    image.height = ship.Size;
    image.src = ship.GetImage().src;
    cell.appendChild(image);
    row.appendChild(cell);

    // Имя игрока
    cell = document.createElement('td');
    cell.innerHTML = decodeURIComponent(ship.Name);
    $(cell).addClass("StatPlayer");
    row.appendChild(cell);

    // "Забито голов"
    cell = document.createElement('td');
    cell.innerHTML = ship.Kill;
    $(cell).addClass("StatKill");
    row.appendChild(cell);

    // "Пропущено голов"
    cell = document.createElement('td');
    cell.innerHTML = ship.Death;
    $(cell).addClass("StatDeath");
    row.appendChild(cell);

    tableStat.appendChild(row);
  };

  // Refresh row in Statistics table
  my.Statistics.RefreshStatRow = function (ship) {
    var shipStatRow = document.getElementById(ship.ID);

    // Если корабль активен, и его строка есть в таблице на левой панели - обновляем данные
    if (ship.State !== "Inactive" && shipStatRow != null) {
      var cell = shipStatRow.getElementsByClassName("StatShip")[0].firstChild;    // Ship Image
      cell.src = ship.GetImage().src;

      cell = shipStatRow.getElementsByClassName("StatPlayer")[0];
      cell.innerHTML = ship.Name;

      cell = shipStatRow.getElementsByClassName("StatKill")[0];
      cell.innerHTML = ship.Kill;

      cell = shipStatRow.getElementsByClassName("StatDeath")[0];
      cell.innerHTML = ship.Death;
    }

      // Если корабль неактивен, НО его строка ЕЩЕ есть в таблице на левой панели - удаляем строку
    else if (shipStatRow != null) {
      $(shipStatRow).remove();
    }
  };

  // Delete row in Statistics table
  my.Statistics.DeleteStatRow = function (ship) {
    var shipStatRow = document.getElementById(ship.ID);
    $(shipStatRow).remove();
  };


  // *** Сдвиг карты ***
  my.ShiftSpace = function (x, y, dX, dY, zoneX, zoneY) {
    var backPosition = my.Body.css('background-position').split(' ');
    var backPositionX = +backPosition[0].slice(0, -2);  // "Финт +backPosition... преобразовывает строку ("0") в число (0)
    var backPositionY = +backPosition[1].slice(0, -2);

    // Если работаем по событию mousemove, то dX = dY = step (всегда больше 0)
    // Если работаем по перемещению корабля, то dX и dY может быть меньше/больше 0,
    // и перемещать надо, только если корабль движется К краю, а не ОТ края.

    if (x <= zoneX && my.SpaceShiftX >= dX) {
      my.SpaceShiftX -= dX;
    }

    if ((my.Canvas.width - zoneX) <= x && (my.SpaceWidth - my.Canvas.width - my.SpaceShiftX) >= dX) {
      my.SpaceShiftX += dX;
    }

    if (y < zoneY && my.SpaceShiftY >= dY) {
      my.SpaceShiftY -= dY;
    }

    if ((my.Canvas.height - zoneY) <= y && (my.SpaceHeight - my.Canvas.height - my.SpaceShiftY) >= dY) {
      my.SpaceShiftY += dY;
    }

    backPositionX = -my.SpaceShiftX + my.SidebarWidth;  // К сдвигу по X надо добавлять ширину Sidebar
    backPositionY = -my.SpaceShiftY;

    backPosition = Math.round(backPositionX) + "px " + Math.round(backPositionY) + "px";
    my.Body.css('background-position', backPosition);
  };

  // *** Центрирование/фокусирование карты на корабле ***
  my.CenterSpaceToShip = function () {
    var backPosition = my.Body.css('background-position').split(' ');
    var backPositionX = +backPosition[0].slice(0, -2);  // "Финт +backPosition... преобразовывает строку ("0") в число (0)
    var backPositionY = +backPosition[1].slice(0, -2);

    var shipCenterX = SHIP.MyShip.X + SHIP.ShipSize / 2;
    var shipCenterY = SHIP.MyShip.Y + SHIP.ShipSize / 2;
    var canvasHalfWidth = my.Canvas.width / 2;
    var canvasHalfHeight = my.Canvas.height / 2;

    if (shipCenterX > my.Canvas.width / 2) {
      if (shipCenterX < my.SpaceWidth - canvasHalfWidth) {
        my.SpaceShiftX = shipCenterX - canvasHalfWidth;
      }
      else {
        my.SpaceShiftX = my.SpaceWidth - my.Canvas.width;
      }
    }
    else {
      my.SpaceShiftX = 0;
    }

    if (shipCenterY > canvasHalfHeight) {
      if (shipCenterY < my.SpaceHeight - canvasHalfHeight) {
        my.SpaceShiftY = shipCenterY - canvasHalfHeight;
      }
      else {
        my.SpaceShiftY = my.SpaceHeight - my.Canvas.height;
      }
    }
    else {
      my.SpaceShiftY = 0;
    }

    backPositionX = -my.SpaceShiftX + my.SidebarWidth;  // К сдвигу по X надо добавлять ширину Sidebar
    backPositionY = -my.SpaceShiftY;
    backPosition = Math.round(backPositionX) + "px " + Math.round(backPositionY) + "px";
    my.Body.css('background-position', backPosition);
  };


  my.Init = function () {
    var request = REQUESTS.InitGame();

    request.done(function (data) {
      my.SyncRate = data.SyncRate;            // 10
      my.SidebarWidth = data.SidebarWidth;    // 225
      my.SpaceWidth = data.SpaceWidth;        // 2560   // ширина космоса
      my.SpaceHeight = data.SpaceHeight;      // 1600  // высота космоса

      // *** Константы, связанные с SidebarWidth ***
      my.Sidebar.style.width = my.SidebarWidth + "px";
      my.SpaceShiftX = my.SidebarWidth;   // сдвиг по X
      my.SpaceShiftY = 0;                 // сдвиг по Y

      var backPositionX = my.SidebarWidth;
      var backPositionY = 0;
      var backPosition = backPositionX + "px " + backPositionY + "px";
      my.Body.css('background-position', backPosition);

      my.Canvas.width = totalWidth - my.SidebarWidth;
      // ***
    });
  };

  return my;
});
