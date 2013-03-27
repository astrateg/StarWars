require.config({
    baseUrl: 'Game/Scripts',
    paths: {
        //"jquery": "http://code.jquery.com/jquery-latest.min"
        "jquery": "jquery-1.9.1.min"
    }
});

require(['jquery', 'Modules/game', 'Modules/requests', 'Modules/ship', 'Modules/space', 'Modules/utils', 'Prototypes/ships', 'Prototypes/bombs'], function ($, GAME, REQUESTS, SHIP, SPACE, UTILS, Ship, Bomb) {
    // *** Main start of application ***
    // Принудительно ожидаем, чтобы все модули успели сработать (и вернулись все Ajax-запросы, особенно в SHIP !!!)
    // Иначе после Page Refreshing не успевают вернуться Ajax-запросы в SHIP -> карта пустая!
    setTimeout(function () {
        var modalWindow = $("#ModalWindow");
        if (modalWindow.css("display") == "none") {
            //alert(modalWindow.css("display"));
            LoadGame(-1);
        }
        else {
            //alert(modalWindow.css("display"));
            var buttonOK = $("#ButtonOK");
            buttonOK.on("click", function () {
                if (buttonOK.hasClass("Active")) {
                    $("#Sidebar").append($("#SelectShipParameters"));
                    modalWindow.css("display", "none");
                    var index = SHIP.MyShip.ImageIndex;
                    LoadGame(index);
                }
            });
        }
    }, 100);

    function LoadGame(index) {
        //alert("Индекс " + index);
        var request = REQUESTS.InitShips(index);

        request.done(function (data) {
            LoadShips(data.ships, data.id);
            GAME.CenterSpaceToShip();
            SPACE.Sun.GetCenter();
            //InitDominators();

            // Запускаем setInterval
            //GAME.IntervalID = setInterval(function () {
            //    Synchronize();
            //}, GAME.SyncRate);

            // Запускаем синхронизацию (а в ней - зацикливаем setTimeout)
            Synchronize();
        });
    }

    function LoadShips(ships, id) {
        if (ships[0] != null) {
            for (var i = 0; i < ships.length; i++) {
                ships[i].Image = parseInt(ships[i].Image);
                var userName = ships[i].Name;
                if (ships[i].ID == id) {
                    if (userName.length == 0) {
                        userName = prompt("Введите свое имя (не более 8 символов)");
                        if (userName.length > 8) {
                            userName = userName.slice(0, 8);
                        }
                        userName = encodeURIComponent(userName);
                        ships[i].Name = userName;
                        REQUESTS.UpdateUserName(userName);
                    }

                    SHIP.MyShip.ID = id;
                    SHIP.MyShip.Name = userName;
                    SHIP.MyShip.State = ships[i].State; // Active | Inactive | ExplodeXX
                    SHIP.MyShip.X = ships[i].X; // X, Y - для центрирования карты по кораблю
                    SHIP.MyShip.Y = ships[i].Y;
                    SHIP.MyShip.VectorMove = 0;
                    SHIP.MyShip.VectorRotate = 0;
                    SHIP.MyShip.ImageIndex = ships[i].Image;
                    SHIP.MyShip.ImageBig.src = GAME.ImagePath + "Rangers/Original/ranger" + (ships[i].Image + 1) + ".png";   // При загрузке сразу показываем увеличенную копию
                }

                // Добавляем каждый корабль в массив SHIP.Ships (в том числе и свой!)
                // В объекте SHIP.MyShip будет только индекс (SHIP.MyShip.Index) - для большого изображения своего корабля на левой панели
                var otherShip = new Ship(ships[i]);
                SHIP.Ships.push(otherShip);

                if (otherShip.State != "Inactive") {
                    GAME.Statistics.AddStatRow(otherShip);
                }
            }
        }

        // Generating my ship if it isn't found
        //randomIndex = UTILS.GetRandomInt(0, SHIP.Ranger.ImagesMax - 1);
        //if (!isMyShipFound) {
        //    var shipX1 = UTILS.RandomStartX();
        //    var shipY1 = UTILS.RandomStartY();
        //    var shipAngle1 = Math.random(Math.PI);
        //    var userName = prompt("Введите свое имя (не более 8 символов)");
        //    if (userName.length > 8) {
        //        userName = userName.slice(0, 8);
        //    }
        //    userName = encodeURIComponent(userName);
        //    SHIP.MyShip = new Ship(GAME.SessionId, userName, "ranger", SHIP.ShipMaxHP, SHIP.ShipMaxHP, shipX1, shipY1, SHIP.ShipSpeed, shipAngle1, SHIP.ShipAngleSpeed, SHIP.ShipSize, randomIndex, "Stop", "Stop", 0);

        //    GAME.Statistics.AddStatRow(SHIP.MyShip);
        //}

        // Свой корабль НЕ добавляем в общий массив SHIP.Ships
    }

    function Synchronize() {
        function SynchronizePlanets(data) {
            SPACE.Sun.GetAngle(data.timeFromStart);
            for (var i = 0; i < SPACE.Planets.length; i++) {
                SPACE.Planets[i].GetOrbitAngle(data.timeFromStart);
            }
        }

        function SynchronizeShips(data) {
            // Обновляем данные: (Очищать массив нельзя - корабль сильно мельтешит!)
            var serverShipsCount = data.ships.length;
            var clientShipsCount = SHIP.Ships.length;
            var indexes = [];

            // Если с сервера пришел пустой массив, очищаем клиентский массив (и таблицу статистики)
            if (data.ships.length == 0) {
                for (var i = 0; i < clientShipsCount; i++) {
                    GAME.Statistics.DeleteStatRow(SHIP.Ships[i]);
                }
                SHIP.Ships = [];
                SHIP.MyShip.State = "Inactive";
            }
            else {
                for (var i = 0; i < serverShipsCount; i++) {

                    // *** Смещение карты (если это наш корабль) ***
                    if (data.ships[i].ID == SHIP.MyShip.ID) {

                        // Старые координаты ЦЕНТРА корабля
                        var x = SHIP.MyShip.X + SHIP.ShipSize / 2 - GAME.SpaceShiftX;
                        var y = SHIP.MyShip.Y + SHIP.ShipSize / 2 - GAME.SpaceShiftY;
                        // Смещение за последний шаг
                        var dX = Math.abs(data.ships[i].X - SHIP.MyShip.X);
                        var dY = Math.abs(data.ships[i].Y - SHIP.MyShip.Y);

                        if (dX != 0 || dY != 0) {
                            // "Зона вхождения" (аналогия с наведением мыши)
                            var zoneX = SHIP.ShipSize * 5;  // цифра 5 - произвольная, чтобы получить "зону вхождения" побольше
                            var zoneY = SHIP.ShipSize * 5;
                            // Сдвигаем карту (если корабль на краю канвы, но не на краю космоса)
                            GAME.ShiftSpace(x, y, dX, dY, zoneX, zoneY);
                            SPACE.Sun.GetCenter();
                        }

                        // Обновляем координаты корабля
                        SHIP.MyShip.X = data.ships[i].X; // X, Y - для центрирования карты по кораблю
                        SHIP.MyShip.Y = data.ships[i].Y;

                    }

                    var isShipFound = false;

                    // Цикл только по исходному списку (добавленные в ходе проверки корабли не учитываются - они добавляются в конец массива)
                    for (var j = 0; j < clientShipsCount; j++) {

                        if (SHIP.Ships[j].ID != data.ships[i].ID) {     // сравниваем массивы - локальный (Javascript) и пришедший (JSON)
                            continue;                                   // если не одинаковые имена - берем следующий
                        }

                        indexes.push(j);    // запомнили индекс найденного элемента
                        isShipFound = true;

                        // если корабль встретился в массиве JS - обновляем данные (только те, которые изменились)
                        if (SHIP.Ships[j].Name == "") {
                            SHIP.Ships[j].Name = data.ships[i].Name;
                        }
                        SHIP.Ships[j].State = data.ships[i].State;
                        SHIP.Ships[j].MaxHP = data.ships[i].HPCurrent * SHIP.HPMult;
                        SHIP.Ships[j].HP = data.ships[i].HP;
                        SHIP.Ships[j].X = data.ships[i].X;
                        SHIP.Ships[j].Y = data.ships[i].Y;
                        SHIP.Ships[j].Angle = data.ships[i].Angle;
                        SHIP.Ships[j].Image = data.ships[i].Image;
                        SHIP.Ships[j].Kill = data.ships[i].Kill;
                        SHIP.Ships[j].Death = data.ships[i].Death;
                        //RefreshBombs(SHIP.Ships[j], data.ships[i].Bombs);   // обнуляем и заполняем массив данными с сервера
                        GAME.Statistics.RefreshStatRow(SHIP.Ships[j]);

                        break;
                    }

                    if (!isShipFound) {                     // если корабля не было в массиве JS, то добавляем его в в массив
                        data.ships[i].Image = parseInt(data.ships[i].Image);
                        var otherShip = new Ship(data.ships[i]);

                        //RefreshBombs(otherShip, data.ships[i].Bombs);
                        GAME.Statistics.AddStatRow(otherShip);
                        SHIP.Ships.push(otherShip);
                    }
                }

                // Перебираем на клиенте корабли, и те, которые не пришли с сервера, помечаем как "Inactive"
                for (var i = 0; i < clientShipsCount; i++) {
                    if (indexes.indexOf(i) == -1) {
                        SHIP.Ships[i].State = "Inactive";
                        GAME.Statistics.DeleteStatRow(SHIP.Ships[i]);
                    }
                }
                SHIP.Ships.filter(function (obj) { return obj.State != "Inactive"; });
            }
        }

        function RefreshBombs(ship, bombs) {
            ship.Bombs = [];    // сначала обнуляем массив бомб для каждого рейнджера
            if (bombs != null) {
                for (var k = 0; k < bombs.length; k++) {
                    ship.Bombs[k] = new Bomb(
                        bombs[k].Type,
                        bombs[k].X,
                        bombs[k].Y,
                        bombs[k].Angle,
                        bombs[k].Size,
                        bombs[k].Image,
                        bombs[k].Speed
                    );
                }
            }
        }

        //var bombs = SHIP.MyShip.Bombs.filter(function (obj) { return obj.Sync == 0; });   // Берем из массива только бомбы, которые еще не отправлялись на сервер
        //for (var i = 0; i < bombs.length; i++) {
        //    bombs[i].Sync = 1;  // Помечаем бомбы как отправленные (таким образом, каждая бомба посылается на сервер только один раз, а дальше - обрабатывается на клиенте)
        //}

        var request = REQUESTS.GetShips();

        request.done(function (data) {
            SynchronizePlanets(data);
            //SynchronizeDominatorShips();
            SynchronizeShips(data);
            //GenerateExplodes();
            ReloadGame();

            // Зацикливаем setTimeout с интервалом
            //clearTimeout(GAME.TimeoutID);
            setTimeout(Synchronize, GAME.SyncRate);
        });

        //request.fail(function (jqXHR, textStatus, errorThrown) {
        //    for (var i = 0; i < SHIP.Ships.length; i++) {
        //        MoveShip(SHIP.Ships[i]);
        //    }
        //    ReloadGame();
        //})
    }

    function ReloadGame() {
        GAME.Context.clearRect(0, 0, GAME.Canvas.width, GAME.Canvas.height);
        SPACE.Sun.Show();

        var i;
        for (i = 0; i < SPACE.Planets.length; i++) {
            SPACE.Planets[i].Show();
        }

        // *** My Bombs ***
        //for (i = 0; i < SHIP.MyShip.Bombs.length; i++) {
        //    SHIP.MyShip.Bombs[i].Move();
        //    CheckSunAndBomb(SHIP.MyShip.Bombs[i]);
        //}

        // Функция Array.prototype.filter имеет аналог в jQuery: $.grep
        //SHIP.MyShip.Bombs = SHIP.MyShip.Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все неактивные бомбы (попавшие в корабль (или Солнце) / улетевшие за экран)

        //for (i = 0; i < SHIP.MyShip.Bombs.length; i++) {               // Неактивных бомб в массиве нет
        //    SHIP.MyShip.Bombs[i].Show();
        //    for (var j = 0; j < arrDominators.length; j++) {    // А неактивные корабли - есть
        //        CheckBombAndShip(SHIP.MyShip.Bombs[i], arrDominators[j]);       // Проверяем, не встретилась ли наша бомба с доминаторским кораблем
        //    }
        //    if (SHIP.MyShip.Bombs[i].Vector != "Inactive") {
        //        for (var j = 0; j < SHIP.Ships.length; j++) {
        //            // Проверяем, не встретилась ли наша бомба с рейнджерским кораблем (и если да, то не прибила ли его)
        //            if ( CheckBombAndShip(SHIP.MyShip.Bombs[i], SHIP.Ships[j]) ) {
        //                SHIP.MyShip.Kill++;
        //            } 
        //        }
        //    }
        //}

        // *** Rangers bombs ***

        //for (i = 0; i < SHIP.Ships.length; i++) {
        //    if (SHIP.Ships[i].Bombs != null) {
        //        SHIP.Ships[i].Bombs = SHIP.Ships[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
        //    }
        //}

        // Неактивные бомбы пропускаем (пусть каждый вычищает свои бомбы сам)
        //for (i = 0; i < SHIP.Ships.length; i++) {
        //    if (SHIP.Ships[i].Bombs != null) {
        //        for (var j = 0; j < SHIP.Ships[i].Bombs.length; j++) {
        //            if (SHIP.Ships[i].Bombs[j].Vector != "Inactive") {
        //                SHIP.Ships[i].Bombs[j].Show();
        //                // Проверяем, не встретилась ли рейнджерская бомба с нашим кораблем
        //                if (CheckBombAndShip(SHIP.Ships[i].Bombs[j], SHIP.MyShip)) {
        //                    SHIP.MyShip.Death++;
        //                }
        //            }
        //        }
        //    }
        //}

        for (i = 0; i < SHIP.Ships.length; i++) {
            SHIP.Ships[i].Show();
        }

        //// Check colliding bombs with ships
        //function CheckBombAndShip(bomb, ship) {
        //    var state = ship.State;
        //    if (state == "Inactive" || state.indexOf("Explode") != -1) {
        //        return false;
        //    }

        //    var checkX = (bomb.X >= ship.X - bomb.Size / 2) && (bomb.X <= ship.X + ship.Size - bomb.Size / 2);
        //    var checkY = (bomb.Y >= ship.Y - bomb.Size / 2) && (bomb.Y <= ship.Y + ship.Size - bomb.Size / 2);
        //    if (checkX && checkY) {
        //        bomb.Vector = "Inactive";
        //        ship.HP -= SHIP.BombHP;           // Если да, уменьшаем HP корабля
        //        if (ship.HP <= 0) {
        //            ship.HP = 0;
        //            ship.State = "Explode00";              // Взрыв проверяется по свойству State
        //            ship.VectorMove = 0;
        //            ship.VectorRotate = 0;
        //            return true;    // Подбил
        //        }
        //    }
        //    return false;
        //}

        //// Check colliding bombs with sun
        //function CheckSunAndBomb(bomb) {
        //    if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - bomb.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - bomb.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
        //        bomb.Vector = "Inactive";
        //    }
        //}
    }
    
    window.onresize = function () {
        var heightTotal = document.documentElement.clientHeight;
        GAME.Sidebar.style.height = heightTotal + "px";

        GAME.Canvas.width = document.documentElement.clientWidth - GAME.SidebarWidth;
        GAME.Canvas.height = heightTotal;
    };

    window.onkeydown = function (key) {
        var vectorMove = SHIP.MyShip.VectorMove;
        if (vectorMove == null) return false;                   // If key was up when MyShip wasn't created yet (i.e. when Ctrl+F5 was pressed in browser)
        var state = SHIP.MyShip.State;
        if (state.indexOf("Explode") != -1) return false;       // If my ship is in the explosion state, it cannot move.

        var actionName = "", actionValue = 0;

        switch (key.keyCode) {
            case 37:    // Left Arrow   (Rotate CCW)
            case 65:    // A
            case 97:    // a
                if (SHIP.MyShip.VectorRotate == -1) {
                    return false;
                }
                SHIP.MyShip.VectorRotate = -1;
                actionName = "VectorRotate";
                actionValue = -1;
                break;

            case 38:    // Up Arrow     (Move Forward)
            case 87:    // W
            case 119:   // w
                if (SHIP.MyShip.VectorMove == 1) {
                    return false;
                }
                SHIP.MyShip.VectorMove = 1;
                actionName = "VectorMove";
                actionValue = 1;
                break;

            case 39:    // Right Arrow  (Rotate CW)
            case 68:    // D
            case 100:   // d
                if (SHIP.MyShip.VectorRotate == 1) {
                    return false;
                }
                SHIP.MyShip.VectorRotate = 1;
                actionName = "VectorRotate";
                actionValue = 1;
                break;

            case 40:    // Down Arrow   (Move Backward)
            case 83:    // S
            case 115:   // s
                if (SHIP.MyShip.VectorMove == -1) {
                    return false;
                }
                SHIP.MyShip.VectorMove = -1;
                actionName = "VectorMove";
                actionValue = -1;
                break;

            case 32:    // Space        (Fire)
                if (SHIP.MyShip.Shoot == 1) {
                    return false;
                }
                SHIP.MyShip.Shoot = 1;
                actionName = "Shoot";
                actionValue = 1;
                break;
        }

        // Если сработало какое-то действие, а не просто нажата любая клавиша
        if (actionName.length > 0) {
            REQUESTS.UpdateUserShip(actionName, actionValue);
        }

        //return false;
    };

    window.onkeyup = function (key) {
        var vectorMove = SHIP.MyShip.VectorMove;
        if (vectorMove == null) return false;                     // If key was up when MyShip wasn't created yet (i.e. when Ctrl+F5 was pressed in browser)

        var state = SHIP.MyShip.State;
        if (state.indexOf("Explode") != -1) return false;       // If my ship is in the explosion state, it cannot move.

        var actionName = "", actionValue = 0;

        switch (key.keyCode) {
            case 37:    // Left Arrow   (Rotate CCW)
            case 65:    // A
                SHIP.MyShip.VectorRotate = 0;
                actionName = "VectorRotate";
                actionValue = 0;
                break;
            case 38:    // Up Arrow     (Move Forward)
            case 87:    // W
                SHIP.MyShip.VectorMove = 0;
                actionName = "VectorMove";
                actionValue = 0;
                break;
            case 39:    // Right Arrow  (Rotate CW)
            case 68:    // D
                SHIP.MyShip.VectorRotate = 0;
                actionName = "VectorRotate";
                actionValue = 0;
                break;
            case 40:    // Down Arrow   (Move Backward)
            case 83:    // S
                SHIP.MyShip.VectorMove = 0;
                actionName = "VectorMove";
                actionValue = 0;
                break;
            case 32:    // Space        (Fire)
                SHIP.MyShip.Shoot = 0;
                actionName = "Shoot";
                actionValue = 0;
                break;
            case 67:    // C (Center map to my ship)
                GAME.CenterSpaceToShip();
                SPACE.Sun.GetCenter();
                break;
        }

        if (actionName.length > 0) {
            REQUESTS.UpdateUserShip(actionName, actionValue);
        }

        //return false;
    };

    //$(GAME.Canvas).mousemove(function (e) {
    //    var x = e.pageX - GAME.SidebarWidth;
    //    var y = e.pageY;
    //    var step = 10;
    //    var zone = 100; // зона по краю canvas, при наведении на которую карта начинает двигаться

    //    GAME.ShiftSpace(x, y, step, step, zone, zone);
    //    SPACE.Sun.GetCenter();

    //});
});