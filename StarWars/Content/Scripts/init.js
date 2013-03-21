// ***** Initialization *****
var syncRateDominatorBombs = 2000;       // ms

// Image for ship explosion
var imgExplosion = new Image();
imgExplosion.src = GAME.ImagePath + "explosion.png";
var imgExplosionSizeX = 384, imgExplosionSizeY = 256;   // Explosion Image size
var imgExplosionStepX = imgExplosionSizeX / 3, imgExplosionStepY = imgExplosionSizeY / 4;   // Image step for "background shift"

// *** Dominators ***
var arrDominators = [];         // Array of Dominators
var dominatorTimer;

function InitDominators() {
    var dominatorsMax = 5;
    var XStart = 1200, YStart = 100;
    var randomIndexType, randomIndexImage;
    var dominator, type, maxHP, speed, size, randomAngle;
    for (var i = 0; i < dominatorsMax; i++) {
        randomIndexType = UTILS.GetRandomInt(0, SHIP.DominatorTypesMax - 1);
        randomIndexImage = UTILS.GetRandomInt(0, SHIP.DominatorImagesMax - 1);

        type = SHIP.DominatorTypes.Type[randomIndexType];
        maxHP = SHIP.DominatorTypes.MaxHP[randomIndexType];
        size = SHIP.DominatorTypes.Size[randomIndexType];
        randomAngle = Math.random() * (2 * Math.PI);
        speed = SHIP.DominatorTypes.Speed[randomIndexType];

        dominator = new Ship(
            type,
            type,
            "dominator-" + type,
            maxHP,
            maxHP,
            XStart + randomIndexType * randomIndexImage * 10,
            YStart + i * 100,
            speed,
            randomAngle,
            0,      // скорость вращения (пока 0)
            size,
            randomIndexImage,
            "MoveForward",
            "Stop",
            0
        );
        arrDominators.push(dominator);
    }
}

// Ship construstor: Ship(id, name, type, maxHP, HP, X, Y, speed, angle, angleSpeed, size, image, vectorMove, vectorRotate, delay, shoot, kill, death)
// delay, shoot, kill, death - not required parameters

function LoadShips(ships, id) {
    if (ships[0] != null) {
        for (var i = 0; i < ships.length; i++) {
            // Если корабль неактивен, пропускаем его - не показываем на карте и на левой панели
            //if (ships[i].VectorMove == "Inactive") {
            //    continue;
            //}
            var imageIndex = parseInt(ships[i].Image);
            var userName = ships[i].Name;
            if (ships[i].ID == id) {
                if (userName.length == 0) {
                    userName = prompt("Введите свое имя (не более 8 символов)");
                    if (userName.length > 8) {
                        userName = userName.slice(0, 8);
                    }
                    userName = encodeURIComponent(userName);
                    REQUESTS.UpdateUserName(userName);
                }

                SHIP.MyShip.ID = id;
                SHIP.MyShip.Name = userName;
                SHIP.MyShip.X = ships[i].X; // X, Y - для центрирования карты по кораблю
                SHIP.MyShip.Y = ships[i].Y;
                SHIP.MyShip.VectorMove = ships[i].VectorMove;       // "Флаги" для событий клавиш
                SHIP.MyShip.VectorRotate = ships[i].VectorRotate;
                SHIP.MyShip.Image = imageIndex;
                SHIP.MyShipImageFull.src = GAME.ImagePath + "Rangers/Original/ranger" + (imageIndex + 1) + ".png";   // При загрузке сразу показываем увеличенную копию
            }

            // Добавляем каждый корабль в массив SHIP.Ships (в том числе и свой!)
            // В объекте SHIP.MyShip будет только индекс (SHIP.MyShip.Index) - для большого изображения своего корабля на левой панели
            var otherShip = new Ship(ships[i].ID, userName, ships[i].Type, ships[i].MaxHP, ships[i].HP, ships[i].X, ships[i].Y, ships[i].Speed, ships[i].Angle, ships[i].AngleSpeed, ships[i].Size, imageIndex, ships[i].VectorMove, ships[i].VectorRotate, ships[i].Delay, ships[i].Shoot, ships[i].Kill, ships[i].Death);
            SHIP.Ships.push(otherShip);

            if (otherShip.VectorMove != "Inactive") {
                GAME.Statistics.appendChild(CreateStatRow(otherShip));
            }
        }
    }

    // Generating my ship if it isn't found
    //randomIndex = UTILS.GetRandomInt(0, SHIP.RangerImagesMax - 1);
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

    //    GAME.Statistics.appendChild(CreateStatRow(SHIP.MyShip));
    //}

    // Свой корабль НЕ добавляем в общий массив SHIP.Ships
}

// *** Statistics ***
function CreateStatRow(ship) {
    var row, cell, image;

    row = document.createElement('tr');
    row.id = ship.ID;
    if (ship.ID == SHIP.MyShip.ID) {
        //row.classList.add("MyShip");        // Помечаем строку таблицы row, если это наш корабль
        $(row).addClass("MyShip");
    }

    // Иконка корабля
    cell = document.createElement('td');
    //cell.classList.add("StatShip");
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
    //cell.classList.add("StatPlayer");
    $(cell).addClass("StatPlayer");
    row.appendChild(cell);

    // "Забито голов"
    cell = document.createElement('td');
    cell.innerHTML = ship.Kill;
    //cell.classList.add("StatKill");
    $(cell).addClass("StatKill");
    row.appendChild(cell);

    // "Пропущено голов"
    cell = document.createElement('td');
    cell.innerHTML = ship.Death;
    //cell.classList.add("StatDeath");
    $(cell).addClass("StatDeath");
    row.appendChild(cell);

    return row;
}

function RefreshStatRow(ship) {
    var shipStatRow = document.getElementById(ship.ID);

    // Если корабль активен, и его строка есть в таблице на левой панели - обновляем данные
    if (ship.VectorMove != "Inactive" && shipStatRow != null) {
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
                    ShiftSpace(x, y, dX, dY, zoneX, zoneY);
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

                // Если корабль неактивен, то не обновляем его (пока так, а вообще надо фильтровать "Inactive" на сервере)
                //if (data.ships[i].VectorMove == "Inactive") {
                //    break;
                //}

                // если корабль встретился в массиве JS - обновляем данные (только те, которые изменились)
                if (SHIP.Ships[j].Name == "") {
                    SHIP.Ships[j].Name = data.ships[i].Name;
                }
                SHIP.Ships[j].HP = data.ships[i].HP;
                SHIP.Ships[j].X = data.ships[i].X;
                SHIP.Ships[j].Y = data.ships[i].Y;
                SHIP.Ships[j].Angle = data.ships[i].Angle;
                SHIP.Ships[j].Image = data.ships[i].Image;
                SHIP.Ships[j].VectorMove = data.ships[i].VectorMove;
                SHIP.Ships[j].VectorRotate = data.ships[i].VectorRotate;
                SHIP.Ships[j].Delay = data.ships[i].Delay;
                SHIP.Ships[j].Shoot = data.ships[i].Shoot;
                SHIP.Ships[j].Kill = data.ships[i].Kill;
                SHIP.Ships[j].Death = data.ships[i].Death;
                //RefreshBombs(SHIP.Ships[j], data.ships[i].Bombs);   // обнуляем и заполняем массив данными с сервера
                RefreshStatRow(SHIP.Ships[j]);

                break;
            }

            if (!isShipFound) {                     // если корабля не было в массиве JS, то добавляем его в в массив
                var imageIndex = parseInt(data.ships[i].Image);
                var otherShip = new Ship(
                    data.ships[i].ID,
                    data.ships[i].Name,
                    data.ships[i].Type,
                    data.ships[i].MaxHP,
                    data.ships[i].HP,
                    data.ships[i].X,
                    data.ships[i].Y,
                    data.ships[i].Speed,
                    data.ships[i].Angle,
                    data.ships[i].AngleSpeed,
                    data.ships[i].Size,
                    imageIndex,
                    data.ships[i].VectorMove,
                    data.ships[i].VectorRotate,
                    data.ships[i].Delay,
                    data.ships[i].Shoot,
                    data.ships[i].Kill,
                    data.ships[i].Death
                );

                //RefreshBombs(otherShip, data.ships[i].Bombs);
                GAME.Statistics.appendChild(CreateStatRow(otherShip));
                SHIP.Ships.push(otherShip);
            }
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

    function MoveShip(ship) {
        vectorMove = ship.VectorMove;
        vectorRotate = ship.VectorRotate;

        if ((vectorMove).slice(0, 4) == "Move") {
            ship[vectorMove](ship.Speed);
        }
        if ((vectorRotate).slice(0, 6) == "Rotate") {
            ship[vectorRotate](ship.AngleSpeed);
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
        //GAME.TimeoutID = setTimeout(Synchronize, GAME.SyncRate);
    });

    //request.fail(function (jqXHR, textStatus, errorThrown) {
    //    for (var i = 0; i < SHIP.Ships.length; i++) {
    //        MoveShip(SHIP.Ships[i]);
    //    }
    //    ReloadGame();
    //})
}

function SynchronizeDominatorShips() {
    var type, indexTyp;
    for (var i = 0; i < arrDominators.length; i++) {
        // Cheching state
        var state = arrDominators[i].VectorMove;
        if (state == "Inactive" || state.indexOf("Explode") != -1) {
            continue;
        }

        arrDominators[i].MoveForward();
    }
}

function GenerateDominatorBombs() {
    for (var i = 0; i < arrDominators.length; i++) {
        // Cheching state
        var state = arrDominators[i].VectorMove;
        if (state == "Inactive" || state.indexOf("Explode") != -1) {
            continue;
        }

        var bombX = GetNewBombX(arrDominators[i]);
        var bombY = GetNewBombY(arrDominators[i]);
        var bomb = new Bomb("dominator", bombX, bombY, arrDominators[i].Angle, SHIP.BombSize, 0, SHIP.BombSpeed);
        arrDominators[i].Bombs.push(bomb);
    }
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

    //CheckSunAndShip(SHIP.MyShip);           // Проверяем, не налетели ли на Солнце
    //if (SHIP.MyShip.HP < SHIP.MyShip.MaxHP) {
    //    SHIP.MyShip.HP += SHIP.RegenerateHP;    // Регенерировали
    //}
    //if (SHIP.MyShip.HP > SHIP.MyShip.MaxHP) {
    //    SHIP.MyShip.HP = SHIP.MyShip.MaxHP;
    //}
    //else {
    //    SHIP.MyShip.HP = Math.round(SHIP.MyShip.HP * 10) / 10;
    //}
    //SHIP.MyShip.Show();

    for (i = 0; i < SHIP.Ships.length; i++) {
        SHIP.Ships[i].Show();
    }

    //for (i = 0; i < arrDominators.length; i++) {
    //    if (arrDominators[i].VectorMove == "Inactive") {
    //        continue;
    //    }
    //    CheckSunAndShip(arrDominators[i]);  // Проверяем, не налетел ли доминатор на Солнце
    //    arrDominators[i].Show();
    //}

    //// *** Dominator Bombs ***
    //for (i = 0; i < arrDominators.length; i++) {
    //    for (var j = 0; j < arrDominators[i].Bombs.length; j++) {
    //        arrDominators[i].Bombs[j].Move();
    //        CheckSunAndBomb(arrDominators[i].Bombs[j]);
    //    }
    //    arrDominators[i].Bombs = arrDominators[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
    //}

    //for (i = 0; i < arrDominators.length; i++) {
    //    for (var j = 0; j < arrDominators[i].Bombs.length; j++) {
    //        arrDominators[i].Bombs[j].Show();
    //        CheckBombAndShip(arrDominators[i].Bombs[j], SHIP.MyShip);            // Проверяем, не встретилась ли вражеская бомба с нашим кораблем
    //    }
    //}

    //// Check colliding bombs with ships
    //function CheckBombAndShip(bomb, ship) {
    //    var state = ship.VectorMove;
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
    //            ship.VectorMove = "Explode00";              // Взрыв проверяется только по свойству VectorMove (для определенности)
    //            ship.VectorRotate = "Stop";
    //            return true;    // Подбил
    //        }
    //    }
    //    return false;
    //}

    //// Check colliding ships with sun
    //function CheckSunAndShip(ship) {
    //    if (ship.VectorMove.indexOf("Explode") != -1) {
    //        return;
    //    }

    //    if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - ship.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - ship.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
    //        ship.HP -= SHIP.SunHP;           // Если да, уменьшаем HP корабля
    //        if (ship.HP <= 0) {
    //            ship.HP = 0;
    //            ship.Death++;
    //            ship.VectorMove = "Explode00";              // Взрыв проверяется только по свойству VectorMove (для определенности)
    //            ship.VectorRotate = "Stop";
    //        }
    //    }
    //}

    //// Check colliding bombs with sun
    //function CheckSunAndBomb(bomb) {
    //    if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - bomb.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - bomb.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
    //        bomb.Vector = "Inactive";
    //    }
    //}
}

// *** Explodes Animation and Changing Explosion State ***
function GenerateExplodes() {
    for (var i = 0; i < arrDominators.length; i++) {
        if (arrDominators[i].VectorMove != "Inactive") {
            Generate(arrDominators[i]);
        }
    }

    Generate(SHIP.MyShip);

    function Generate(ship) {
        var state = ship.VectorMove;
        if (state.indexOf("Explode") != -1) {   // If this ship is in the explosion state, increment explosion step (00 -> 01, 01 -> 02, etc.)
            var X = state[8];
            var Y = state[7];
            X++;
            if (X % 3 == 0) {
                X = 0; Y++;
            }
            if (Y > 3) {
                if (ship.ID == SHIP.MyShip.ID) {  // If it's my ship, reload it after exploding.
                    ship.X = UTILS.RandomStartX();
                    ship.Y = UTILS.RandomStartY();
                    ship.HP = ship.MaxHP;
                    ship.VectorMove = "Start0";
                }
                else {
                    ship.VectorMove = "Inactive";
                }
                return;
            }
            ship.VectorMove = "Explode" + Y + X;    // Next step of explosion
        }
        else if (state.indexOf("Start") != -1) {
            var step = parseInt(state.slice(5));   // (00 -> 0, 01 -> 1, etc.)
            step++;
            if (step < 20) {
                ship.VectorMove = "Start" + step;       // Next step of reloading
            }
            else {
                ship.VectorMove = "Stop";               // Reloading is finished
            }
        }
    }
}

// *** Window Events ***
window.onload = function () {
    var request = REQUESTS.InitShips();

    request.done(function (data) {
        LoadShips(data.ships, data.id);
        CenterSpaceToShip();
        //InitDominators();

        // Запускаем setInterval
        GAME.IntervalID = setInterval(function () {
            Synchronize();
        }, GAME.SyncRate);

        // Запускаем синхронизацию (а в ней - зацикливаем setTimeout)
        //Synchronize();
    });
};

window.onbeforeunload = function () {
    REQUESTS.DeactivateUserShip();
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
    if (vectorMove.indexOf("Explode") != -1) return false;  // If my ship is in the explosion state, it cannot move.

    var actionName = "", actionValue = "";

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            if (SHIP.MyShip.VectorRotate == "RotateCCW") {
                return false;
            }
            SHIP.MyShip.VectorRotate = "RotateCCW";
            actionName = "VectorRotate";
            actionValue = "RotateCCW";
            break;

        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            if (SHIP.MyShip.VectorMove == "MoveForward") {
                return false;
            }
            SHIP.MyShip.VectorMove = "MoveForward";
            actionName = "VectorMove";
            actionValue = "MoveForward";
            break;

        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            if (SHIP.MyShip.VectorRotate == "RotateCW") {
                return false;
            }
            SHIP.MyShip.VectorRotate = "RotateCW";
            actionName = "VectorRotate";
            actionValue = "RotateCW";
            break;

        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
            if (SHIP.MyShip.VectorMove == "MoveBackward") {
                return false;
            }
            SHIP.MyShip.VectorMove = "MoveBackward";
            actionName = "VectorMove";
            actionValue = "MoveBackward";
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

    REQUESTS.UpdateUserShip(actionName, actionValue);

    //return false;
};

window.onkeyup = function (key) {
    var vectorMove = SHIP.MyShip.VectorMove;
    if (vectorMove == null) return false;                     // If key was up when MyShip wasn't created yet (i.e. when Ctrl+F5 was pressed in browser)
    if (vectorMove.indexOf("Explode") != -1) return false;    // If my ship is in the explosion state, it cannot move.

    var actionName = "", actionValue = "";

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
            SHIP.MyShip.VectorRotate = "Stop";
            actionName = "VectorRotate";
            actionValue = "Stop";
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
            SHIP.MyShip.VectorMove = "Stop";
            actionName = "VectorMove";
            actionValue = "Stop";
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
            SHIP.MyShip.VectorRotate = "Stop";
            actionName = "VectorRotate";
            actionValue = "Stop";
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
            SHIP.MyShip.VectorMove = "Stop";
            actionName = "VectorMove";
            actionValue = "Stop";
            break;
        case 32:    // Space        (Fire)
            SHIP.MyShip.Shoot = 0;
            actionName = "Shoot";
            actionValue = 0;
            break;
        case 67:    // C (Center map to my ship)
            CenterSpaceToShip();
            break;
    }

    REQUESTS.UpdateUserShip(actionName, actionValue);

    //return false;
};

//$(GAME.Canvas).mousemove(function (e) {
//    var x = e.pageX - GAME.SidebarWidth;
//    var y = e.pageY;
//    var step = 10;
//    var zone = 100; // зона по краю canvas, при наведении на которую карта начинает двигаться

//    ShiftSpace(x, y, step, step, zone, zone);
//});

// *** Сдвиг карты ***
function ShiftSpace(x, y, dX, dY, zoneX, zoneY) {
    var backPosition = GAME.Body.css('background-position').split(' ');
    var backPositionX = +backPosition[0].slice(0, -2);  // "Финт +backPosition... преобразовывает строку ("0") в число (0)
    var backPositionY = +backPosition[1].slice(0, -2);

    // Если работаем по событию mousemove, то dX = dY = step (всегда больше 0)
    // Если работаем по перемещению корабля, то dX и dY может быть меньше/больше 0,
    // и перемещать надо, только если корабль движется К краю, а не ОТ края.

    if (x <= zoneX && GAME.SpaceShiftX >= dX) {
        GAME.SpaceShiftX -= dX;
    }

    if ((GAME.Canvas.width - zoneX) <= x && (GAME.SpaceWidth - GAME.Canvas.width - GAME.SpaceShiftX) >= dX) {
        GAME.SpaceShiftX += dX;
    }

    if (y < zoneY && GAME.SpaceShiftY >= dY) {
        GAME.SpaceShiftY -= dY;
    }

    if ((GAME.Canvas.height - zoneY) <= y && (GAME.SpaceHeight - GAME.Canvas.height - GAME.SpaceShiftY) >= dY) {
        GAME.SpaceShiftY += dY;
    }

    backPositionX = -GAME.SpaceShiftX + GAME.SidebarWidth;  // К сдвигу по X надо добавлять ширину Sidebar
    backPositionY = -GAME.SpaceShiftY;

    backPosition = backPositionX + "px " + backPositionY + "px";
    GAME.Body.css('background-position', backPosition);

    SPACE.Sun.GetCenter();
}

// *** Центрирование/фокусирование карты на корабле ***
function CenterSpaceToShip() {
    var backPosition = GAME.Body.css('background-position').split(' ');
    var backPositionX = +backPosition[0].slice(0, -2);  // "Финт +backPosition... преобразовывает строку ("0") в число (0)
    var backPositionY = +backPosition[1].slice(0, -2);

    var shipCenterX = SHIP.MyShip.X + SHIP.ShipSize / 2;
    var shipCenterY = SHIP.MyShip.Y + SHIP.ShipSize / 2;
    var canvasHalfWidth = GAME.Canvas.width / 2;
    var canvasHalfHeight = GAME.Canvas.height / 2;

    if (shipCenterX > GAME.Canvas.width / 2) {
        if (shipCenterX < GAME.SpaceWidth - canvasHalfWidth) {
            GAME.SpaceShiftX = shipCenterX - canvasHalfWidth;
        }
        else {
            GAME.SpaceShiftX = GAME.SpaceWidth - GAME.Canvas.width;
        }
    }
    else {
        GAME.SpaceShiftX = 0;
    }

    if (shipCenterY > canvasHalfHeight) {
        if (shipCenterY < GAME.SpaceHeight - canvasHalfHeight) {
            GAME.SpaceShiftY = shipCenterY - canvasHalfHeight;
        }
        else {
            GAME.SpaceShiftY = GAME.SpaceHeight - GAME.Canvas.height;
        }
    }
    else {
        GAME.SpaceShiftY = 0;
    }

    backPositionX = -GAME.SpaceShiftX + GAME.SidebarWidth;  // К сдвигу по X надо добавлять ширину Sidebar
    backPositionY = -GAME.SpaceShiftY;
    backPosition = backPositionX + "px " + backPositionY + "px";
    GAME.Body.css('background-position', backPosition);

    SPACE.Sun.GetCenter();
}