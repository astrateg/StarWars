define(['Modules/game', 'Modules/requests', 'Modules/ship', 'Modules/space', 'Modules/utils', 'Prototypes/ships', 'Prototypes/bombs'], function (GAME, REQUESTS, SHIP, SPACE, UTILS, Ship, Bomb) {

    my = {};
    // *** Main start point ***
    my.Init = function () {
        // Синхронные запросы для инициализации
        GAME.Init();
        SPACE.Init();
        SHIP.Init();
        SHIP.Ships = [];    // Обнуляем, т.к. иначе после F5 массив SHIP.Ships не очищается

        var modalWindow = $("#ModalWindow");
        if (modalWindow.css("display") == "none") {
            $("#Sidebar").append($("#SelectShipParameters"));
            LoadGame(-1);
        }
        else {
            var buttonOK = $("#ButtonOK");
            buttonOK.on("click", function () {
                if (buttonOK.hasClass("Active")) {
                    $("#Sidebar").append($("#SelectShipParameters"));
                    modalWindow.css("display", "none");
                    var index = SHIP.MyShip.ImageIndex;
                    var name = $("#UserName").val();
                    LoadGame(index, name);
                }
            });
        }
    }

    // *** END of Main start point***


    function LoadGame(index, name) {
        var request = REQUESTS.InitShips(index, name);

        request.done(function (data) {
            LoadShips(data.ships, data.id);
            GAME.CenterSpaceToShip();
            SPACE.Sun.GetCenter();
            //InitDominators();
        });
    }

    function LoadShips(ships, id) {
        // Загружать все корабли не нужно, только заполнить параметры своего (SHIP.MyShip) - остальные придут через Synchronize
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
                    SHIP.MyShip.State = ships[i].State; // Active | Inactive | ExplodeXXX
                    SHIP.MyShip.X = ships[i].X;         // X, Y - для центрирования карты по кораблю
                    SHIP.MyShip.Y = ships[i].Y;
                    SHIP.MyShip.VectorMove = 0;
                    SHIP.MyShip.VectorRotate = 0;
                    SHIP.MyShip.ImageIndex = ships[i].Image;
                    SHIP.MyShip.ImageBig.src = GAME.ImagePath + "Rangers/Original/ranger" + (ships[i].Image + 1) + ".png";   // При загрузке сразу показываем увеличенную копию
                    SHIP.MyShip.Weapons = ships[i].Weapons;
                    SHIP.MyShip.WeaponActive = ships[i].WeaponActive;
                    SHIP.MyShip.ShowAllWeapons();
                }
            }
        }
    }

    my.DeleteShip = function (id) {
        ship = UTILS.GetElement(SHIP.Ships, "ID", id);
        ship.State = "Inactive";
        GAME.Statistics.DeleteStatRow(ship);
    }

    my.Synchronize = function(data) {
        SynchronizePlanets(data);
        //SynchronizeDominatorShips();
        SynchronizeShips(data);
        ReloadCanvas();
    }

    function SynchronizePlanets(data) {
        SPACE.Sun.Angle = data.sunAngle;
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
                        var zoneX = SHIP.ShipSize * 10;  // цифра 10 - произвольная, чтобы получить "зону вхождения" побольше
                        var zoneY = SHIP.ShipSize * 10;
                        // Сдвигаем карту (если корабль на краю канвы, но не на краю космоса)
                        GAME.ShiftSpace(x, y, dX, dY, zoneX, zoneY);
                        SPACE.Sun.GetCenter();

                        // Обновляем координаты корабля
                        SHIP.MyShip.X = data.ships[i].X; // X, Y - для центрирования карты по кораблю
                        SHIP.MyShip.Y = data.ships[i].Y;
                    }

                    if (data.ships[i].State == "Active" && SHIP.MyShip.State.indexOf("Explode") != -1) {
                        GAME.CenterSpaceToShip();
                        SPACE.Sun.GetCenter();
                    }
                    SHIP.MyShip.State = data.ships[i].State;

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

                    if (SHIP.Ships[j].State == "Inactive") {
                        GAME.Statistics.AddStatRow(SHIP.Ships[j]);
                    }
                    SHIP.Ships[j].State = data.ships[i].State;

                    SHIP.Ships[j].MaxHP = data.ships[i].HPCurrent * SHIP.HPMult;
                    SHIP.Ships[j].HP = data.ships[i].HP;
                    SHIP.Ships[j].MP = data.ships[i].MP;
                    SHIP.Ships[j].X = data.ships[i].X;
                    SHIP.Ships[j].Y = data.ships[i].Y;
                    SHIP.Ships[j].Speed = data.ships[i].Speed;
                    SHIP.Ships[j].SpeedCurrent = data.ships[i].SpeedCurrent;
                    SHIP.Ships[j].Angle = data.ships[i].Angle;
                    SHIP.Ships[j].Image = data.ships[i].Image;
                    SHIP.Ships[j].Kill = data.ships[i].Kill;
                    SHIP.Ships[j].Death = data.ships[i].Death;
                    RefreshBombs(SHIP.Ships[j], data.ships[i].Bombs);   // обнуляем и заполняем массив данными с сервера
                    GAME.Statistics.RefreshStatRow(SHIP.Ships[j]);

                    break;
                }

                if (!isShipFound) {                     // если корабля не было в массиве JS, то добавляем его в в массив
                    data.ships[i].Image = parseInt(data.ships[i].Image);
                    var otherShip = new Ship(data.ships[i]);

                    RefreshBombs(otherShip, data.ships[i].Bombs);
                    GAME.Statistics.AddStatRow(otherShip);
                    SHIP.Ships.push(otherShip);
                }
            }
        }
    }

    function RefreshBombs(ship, bombs) {
        ship.Bombs = [];    // сначала обнуляем массив бомб для каждого рейнджера
        if (bombs != null) {
            for (var k = 0; k < bombs.length; k++) {
                ship.Bombs[k] = new Bomb(bombs[k]);
            }
        }
    }

    function ReloadCanvas() {
        GAME.Context.clearRect(0, 0, GAME.Canvas.width, GAME.Canvas.height);
        SPACE.Sun.Show();

        var i;
        for (i = 0; i < SPACE.Planets.length; i++) {
            SPACE.Planets[i].Show();
        }

        for (i = 0; i < SHIP.Ships.length; i++) {
            SHIP.Ships[i].Show();
            for (var j = 0; j < SHIP.Ships[i].Bombs.length; j++) {
                SHIP.Ships[i].Bombs[j].Show();
            }
        }

        // *** My Bombs ***

        // Функция Array.prototype.filter имеет аналог в jQuery: $.grep
        //SHIP.MyShip.Bombs = SHIP.MyShip.Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все неактивные бомбы (попавшие в корабль (или Солнце) / улетевшие за экран)

    }

    my.OnResize = function () {
        var heightTotal = document.documentElement.clientHeight;
        GAME.Sidebar.style.height = heightTotal + "px";

        GAME.Canvas.width = document.documentElement.clientWidth - GAME.SidebarWidth;
        GAME.Canvas.height = heightTotal;
    };

    my.OnKeyDown = function (key, spaceHub) {
        var vectorMove = SHIP.MyShip.VectorMove;
        if (vectorMove == null) return key;                   // If key was up when MyShip wasn't created yet (i.e. when Ctrl+F5 was pressed in browser)
        var state = SHIP.MyShip.State;
        if (state.indexOf("Explode") != -1) return key;       // If my ship is in the explosion state, it cannot move.

        var actionName = "", actionValue = 0;

        switch (key.keyCode) {
            case 37:    // Left Arrow   (Rotate CCW)
            case 65:    // A
                if (SHIP.MyShip.VectorRotate == -1) {
                    return false;
                }
                SHIP.MyShip.VectorRotate = -1;
                actionName = "VectorRotate";
                actionValue = -1;
                break;

            case 38:    // Up Arrow     (Move Forward)
            case 87:    // W
                if (SHIP.MyShip.VectorMove == 1) {
                    return false;
                }
                SHIP.MyShip.VectorMove = 1;
                actionName = "VectorMove";
                actionValue = 1;
                break;

            case 39:    // Right Arrow  (Rotate CW)
            case 68:    // D
                if (SHIP.MyShip.VectorRotate == 1) {
                    return false;
                }
                SHIP.MyShip.VectorRotate = 1;
                actionName = "VectorRotate";
                actionValue = 1;
                break;

            case 40:    // Down Arrow   (Move Backward)
            case 83:    // S
                if (SHIP.MyShip.VectorMove == -1) {
                    return false;
                }
                SHIP.MyShip.VectorMove = -1;
                actionName = "VectorMove";
                actionValue = -1;
                break;

            case 49:    // 1
            case 50:    // 2
            case 51:    // 3
                if (SHIP.MyShip.WeaponActive == key.keyCode - 49) {
                    return false;
                }
                var weaponDiv = $("#CurrentShipWeapons .weapon").eq(key.keyCode - 49);
                weaponDiv.trigger("click");
                break;

            case 32:    // Space        (Fire)
                if (SHIP.MyShip.VectorShoot == 1) {
                    return false;
                }
                SHIP.MyShip.VectorShoot = 1;
                actionName = "VectorShoot";
                actionValue = 1;
                break;
        }

        // Если сработало какое-то действие, а не просто нажата любая клавиша
        if (actionName.length > 0) {
        	//REQUESTS.UpdateUserShip(actionName, actionValue);
        	spaceHub.server.updateUserShip(actionName, actionValue);
        }

        //return false;
    };

    my.OnKeyUp = function (key, spaceHub) {
        var vectorMove = SHIP.MyShip.VectorMove;
        if (vectorMove == null) return key;                     // If key was up when MyShip wasn't created yet (i.e. when Ctrl+F5 was pressed in browser)

        var state = SHIP.MyShip.State;
        if (state.indexOf("Explode") != -1) return key;       // If my ship is in the explosion state, it cannot move.

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
                SHIP.MyShip.VectorShoot = 0;
                actionName = "VectorShoot";
                actionValue = 0;
                break;
            case 67:    // C (Center map to my ship)
                GAME.CenterSpaceToShip();
                SPACE.Sun.GetCenter();
                break;
        }

        if (actionName.length > 0) {
        	//REQUESTS.UpdateUserShip(actionName, actionValue);
        	spaceHub.server.updateUserShip(actionName, actionValue);
        }

        //return false;
    };

    return my;
});