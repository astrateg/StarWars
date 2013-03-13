// *** MODULE for Game ***
var GAME = (function () {
    var my = {};
    my.ServerName = $('body').attr('data-server');
    my.SessionId = "";
    my.ImagePath = "http://" + my.ServerName + "/Game/Content/Images/";
    my.SyncRate = 20;

    var totalWidth = document.documentElement.clientWidth;
    var totalHeight = document.documentElement.clientHeight;
    my.SidebarWidth = 225;

    my.Sidebar = document.createElement('div');
    my.Sidebar.id = "Sidebar";
    my.Sidebar.style.width = my.SidebarWidth + "px";
    my.Sidebar.style.height = totalHeight + "px";
    my.Sidebar.style.cssFloat = "left";
    my.Sidebar.style.backgroundColor = "grey";
    document.body.appendChild(my.Sidebar);

    my.Statistics = {};

    my.Canvas = document.createElement('canvas');
    my.Canvas.width = totalWidth - my.SidebarWidth;
    my.Canvas.height = totalHeight;

    my.Context = my.Canvas.getContext('2d');
    document.body.appendChild(my.Canvas);

    return my;
})();

var UTILS = (function () {
    var my = {};

    // Generating random int number for fetching random image from array of dominator ships
    my.GetRandomInt = function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    // Generating random X-coordinate in one of the 4th corners (i.e. Left or Right)
    my.RandomStartX = function () {
        var randomX = UTILS.GetRandomInt(200, 400);
        var randomLeft = UTILS.GetRandomInt(0, 1);
        return (randomLeft) ? randomX : (GAME.Canvas.width - randomX);
    }

    // Generating random Y-coordinate in one of the 4th corners (i.e. Top or Bottom)
    my.RandomStartY = function () {
        var randomY = UTILS.GetRandomInt(200, 400);
        var randomTop = UTILS.GetRandomInt(0, 1);
        return (randomTop) ? randomY : (GAME.Canvas.height - randomY);
    }

    // Throttling function calls (this function helps to delay user key-typing for any period, e.g. 20 ms)
    my.Throttle = function (fn, delay) {
        var timer = null;
        return function () {
            var context = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () {
                fn.apply(context, args);
            }, delay);
        };
    }

    return my;
})();

// *** MODULE for Space ***
var SPACE = (function () {
    var my = {};

    // Images for planets
    var imgPlanets = {};
    imgPlanets["sun"] = new Image();
    imgPlanets["earth"] = new Image();
    imgPlanets["mars"] = new Image();
    imgPlanets["jupiter"] = new Image();

    // Objects "Image" are used as properties of the appropriate "Planet" objects (planets.js).
    imgPlanets["sun"].src = GAME.ImagePath + "sun.png";
    imgPlanets["earth"].src = GAME.ImagePath + "earth.png";
    imgPlanets["mars"].src = GAME.ImagePath + "mars.png";
    imgPlanets["jupiter"].src = GAME.ImagePath + "jupiter.png";

    $.ajax({
        url: "http://" + GAME.ServerName + "/game/Home/InitSpace/",
        type: "GET",
        dataType: "json",
        cache: false,
    }).done(function (data) {
        my.Sun = new Sun('sun', data.Sun.Size, imgPlanets["sun"], data.Sun.RotationAngle);
        my.Planets = [];

        for (var i = 0; i < data.Planets.length; i++) {
            var planetName = data.Planets[i].Name;
            var planet = new Planet(
                planetName,
                data.Planets[i].OrbitRadius,
                data.Planets[i].OrbitAngleStart,
                data.Planets[i].MoveAngle,
                data.Planets[i].Size,
                imgPlanets[planetName]
            );
            my.Planets.push(planet);
        }
    });

    return my;
})();

// *** MODULE for Ships & Bombs ***
var SHIP = (function () {
    var my = {};

    var request = $.ajax({
        url: "http://" + GAME.ServerName + "/game/Home/InitShipConstants/",
        type: "GET",
        dataType: "json",
        cache: false
    });

    request.done(function (data) {
        my.ShipMaxHP = data.shipMaxHP;
        my.ShipSize = data.shipSize;
        my.ShipSpeed = data.shipSpeed;
        my.ShipAngleSpeed = data.shipAngleSpeed;

        my.BombHP = data.bombHP;  // Ударная сила бомбы (1 столкновение)
        my.BombSize = data.bombSize;
        my.BombSpeed = data.bombSpeed;

        my.SunHP = data.sunHP;    // Ударная сила Солнца (1 tick = GAME.SyncRate = 20ms)
        my.RegenerateHP = data.regenerateHP;    // Регенерация (1 tick = GAME.SyncRate = 20ms)
    });


    // *** Ships ***
    // Rangers
    my.MyShip = {};   // Ship's speed & rotating angle
    my.Ships = [];    // Array of Ships

    my.RangerImages = [];
    my.RangerImagesMax = 9;

    // Ranger ship types
    var selectShip = document.createElement('div');
    selectShip.id = "SelectShip";
    GAME.Sidebar.appendChild(selectShip);

    for (var i = 0; i < my.RangerImagesMax; i++) {
        my.RangerImages[i] = new Image();
        my.RangerImages[i].src = GAME.ImagePath + "Rangers/ranger" + (i + 1) + ".png";

        my.RangerImages[i].addEventListener("click", function (index) {
            return function () {
                my.RangerImages[index].classList.add("Selected");               // Добавляем класс "Selected" к выделенному
                my.RangerImages[my.MyShip.Image].classList.remove("Selected");  // И убираем "Selected" у предыдущего

                my.MyShip.Image = index;
                my.MyShipImageFull.src = GAME.ImagePath + "Rangers/Original/ranger" + (index + 1) + ".png";
            }
        }(i));

        selectShip.appendChild(my.RangerImages[i]);
    }

    // My ship (image, HP)
    var currentShip = document.createElement('div');
    currentShip.id = "CurrentShip";
    GAME.Sidebar.appendChild(currentShip);

    my.MyShipImageFull = new Image();
    currentShip.appendChild(my.MyShipImageFull);

    var currentShipHP = document.createElement('div');
    currentShipHP.id = "CurrentShipHP";
    currentShip.appendChild(currentShipHP);

    var currentShipHPValue = document.createElement('div');
    currentShipHPValue.id = "CurrentShipHPValue";
    currentShipHP.appendChild(currentShipHPValue);

    // Statistics
    var tableStat = document.createElement('table');
    tableStat.id = "Statistics";

    var tbo = document.createElement('tbody');
    var row, cell;

    // Header
    row = document.createElement('tr');
    row.id = "StatHeader";

    cell = document.createElement('td');
    cell.innerHTML = "Ship";
    cell.classList.add("StatShip");
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = "Player";
    cell.classList.add("StatPlayer");
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = "+";
    cell.classList.add("StatKill");
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = "-";
    cell.classList.add("StatDeath");
    row.appendChild(cell);

    tbo.appendChild(row);
    tableStat.appendChild(tbo);

    GAME.Sidebar.appendChild(tableStat);
    GAME.Statistics = tbo;                  // GAME.Statistics - это tbody внутри table, чтобы удобнее было обращаться

    // Dominators
    my.DominatorTypesMax = 4;
    my.DominatorTypes = {
        Type: ["smersh", "menok", "urgant", "ekventor"],
        MaxHP: [150, 200, 250, 300],
        Speed: [5, 4, 3, 2],
        Angle: [0.05, 0.04, 0.03, 0.02],
        Size: [70, 75, 85, 85],
        Images: new Array(my.DominatorTypesMax)
    };

    my.DominatorImagesMax = 3;
    for (var i = 0; i < my.DominatorTypesMax; i++) {   // ["smersh", "menok", "urgant", "ekventor"]
        my.DominatorTypes.Images[i] = new Array(my.DominatorImagesMax);
        for (var j = 0; j < my.DominatorImagesMax; j++) {
            my.DominatorTypes.Images[i][j] = new Image();
            my.DominatorTypes.Images[i][j].src = GAME.ImagePath + "Dominators/dominator-" + my.DominatorTypes.Type[i] + "0" + (j + 1) + ".png";
        }
    }

    // *** Bombs ***
    my.RangerBombImages = [];
    my.RangerBombImages[0] = new Image();
    my.RangerBombImages[0].src = GAME.ImagePath + "Weapons/weapon-bomb02-green.png";

    my.DominatorBombImages = [];
    my.DominatorBombImages[0] = new Image();
    my.DominatorBombImages[0].src = GAME.ImagePath + "Weapons/weapon-bomb02-blue.png";

    return my;
})();

// ***** Initialization *****
var syncRateDominatorBombs = 2000;       // ms

// Timers for "setInterval" function
var globalSpaceTimer = null;    // Timers for the sun and planets (server)
var globalShipTimer = null;     // Timers for server ships

//var TO_RADIANS = Math.PI / 180;

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

        // Ship construstor: Ship(id, name, type, maxHP, HP, X, Y, speed, angle, angleSpeed, size, image, vectorMove, vectorRotate, delay, kill, death)
        // kill, death - not required parameters
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

function GetShips(ships) {
    var isMyShipFound = false;
    if (ships[0] != null) {
        for (var i = 0; i < ships.length; i++) {
            var imageIndex = parseInt(ships[i].Image);
            if (ships[i].ID == GAME.SessionId) {
                isMyShipFound = true;
                SHIP.MyShip = new Ship(ships[i].ID, ships[i].Name, "ranger", ships[i].MaxHP, ships[i].HP, ships[i].X, ships[i].Y, ships[i].Speed, ships[i].Angle, ships[i].AngleSpeed, ships[i].Size, imageIndex, "Stop", "Stop", 0, ships[i].Kill, ships[i].Death);

                GAME.Statistics.appendChild(CreateStatRow(SHIP.MyShip));  // Добавляем строку в таблицу статистики
            }
            else {
                imageIndex = parseInt(ships[i].Image);
                var otherShip = new Ship(ships[i].ID, ships[i].Name, ships[i].Type, ships[i].MaxHP, ships[i].HP, ships[i].X, ships[i].Y, ships[i].Speed, ships[i].Angle, ships[i].AngleSpeed, ships[i].Size, imageIndex, ships[i].VectorMove, ships[i].VectorRotate, ships[i].Delay, ships[i].Kill, ships[i].Death);
                SHIP.Ships.push(otherShip);

                if (otherShip.VectorMove != "Inactive") {
                    GAME.Statistics.appendChild(CreateStatRow(otherShip));
                }
            }
        }
    }

    // Generating my ship if it isn't found
    randomIndex = UTILS.GetRandomInt(0, SHIP.RangerImagesMax - 1);
    if (!isMyShipFound) {
        var shipX1 = UTILS.RandomStartX();
        var shipY1 = UTILS.RandomStartY();
        var shipAngle1 = Math.random(Math.PI);
        // Заменить 2-й параметр на введенное имя
        var userName = prompt("Введите свое имя");
        userName = encodeURIComponent(userName);
        SHIP.MyShip = new Ship(GAME.SessionId, userName, "ranger", SHIP.ShipMaxHP, SHIP.ShipMaxHP, shipX1, shipY1, SHIP.ShipSpeed, shipAngle1, SHIP.ShipAngleSpeed, SHIP.ShipSize, randomIndex, "Stop", "Stop", 0);

        GAME.Statistics.appendChild(CreateStatRow(SHIP.MyShip));
    }

    SHIP.MyShipImageFull.src = GAME.ImagePath + "Rangers/Original/ranger" + (SHIP.MyShip.Image + 1) + ".png";   // При загрузке сразу показываем увеличенную копию

    // Свой корабль НЕ добавляем в общий массив SHIP.Ships! (нет смысла корректировать его положение - мы его и так знаем).
    // Но с сервера получаем весь список кораблей (включая и свой), т.к. удалять корабль на сервере (перед отправкой) из коллекции List будет, вероятно, дороже.
}

// *** Statistics ***
function CreateStatRow(ship) {
    var row, cell, image;

    row = document.createElement('tr');
    row.id = ship.ID;
    if (ship.ID == SHIP.MyShip.ID) {
        row.classList.add("MyShip");        // Помечаем строку таблицы row, если это наш корабль
    }

    // Иконка корабля
    cell = document.createElement('td');
    cell.classList.add("StatShip");
    image = document.createElement('img');
    image.width = ship.Size;
    image.height = ship.Size;
    image.src = ship.GetImage().src;
    cell.appendChild(image);
    row.appendChild(cell);

    // Имя игрока
    cell = document.createElement('td');
    cell.innerHTML = decodeURIComponent(ship.Name);
    cell.classList.add("StatPlayer");
    row.appendChild(cell);

    // "Забито голов"
    cell = document.createElement('td');
    cell.innerHTML = ship.Kill;
    cell.classList.add("StatKill");
    row.appendChild(cell);

    // "Пропущено голов"
    cell = document.createElement('td');
    cell.innerHTML = ship.Death;
    cell.classList.add("StatDeath");
    row.appendChild(cell);

    return row;
}

function RefreshStatRow(ship) {
    if (ship.VectorMove != "Inactive") {
        var shipStatRow = document.getElementById(ship.ID);
        var cell = shipStatRow.getElementsByClassName("StatShip")[0].firstChild;    // Ship Image
        cell.src = ship.GetImage().src;

        cell = shipStatRow.getElementsByClassName("StatKill")[0];
        cell.innerHTML = ship.Kill;

        cell = shipStatRow.getElementsByClassName("StatDeath")[0];
        cell.innerHTML = ship.Death;
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
        var i, vectorMove, vectorRotate;
        for (i = 0; i < data.ships.length; i++) {
            var isShipFound = false;
            if (SHIP.MyShip.ID != data.ships[i].ID) {   // если не наш корабль - добавляем в массив (или обновляем)
                for (var j = 0; j < SHIP.Ships.length; j++) {
                    if (SHIP.Ships[j].ID != data.ships[i].ID) {   // сравниваем массивы - локальный (Javascript) и пришедший (JSON)
                        continue;                                   // если не одинаковые имена - берем следующий
                    }
                    else {                                          // если корабль встретился в массиве JS - обновляем данные (только те, которые изменились)
                        SHIP.Ships[j].HP = data.ships[i].HP;
                        SHIP.Ships[j].X = data.ships[i].X;
                        SHIP.Ships[j].Y = data.ships[i].Y;
                        SHIP.Ships[j].Angle = data.ships[i].Angle;
                        SHIP.Ships[j].Image = data.ships[i].Image;
                        SHIP.Ships[j].VectorMove = data.ships[i].VectorMove;
                        SHIP.Ships[j].VectorRotate = data.ships[i].VectorRotate;
                        SHIP.Ships[j].Delay = data.ships[i].Delay;
                        SHIP.Ships[j].Kill = data.ships[i].Kill;
                        SHIP.Ships[j].Death = data.ships[i].Death;
                        RefreshBombs(SHIP.Ships[j], data.ships[i].Bombs);   // обнуляем и заполняем массив данными с сервера
                        RefreshStatRow(SHIP.Ships[j]);

                        isShipFound = true;
                        break;
                    }
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
                        data.ships[i].Kill,
                        data.ships[i].Death
                    );

                    RefreshBombs(otherShip, data.ships[i].Bombs);
                    if (otherShip.VectorMove != "Inactive") {
                        GAME.Statistics.appendChild(CreateStatRow(otherShip));
                    }

                    SHIP.Ships.push(otherShip);
                }
            }
            else {  // если наш корабль - проверяем на читерство (и обновляем, если читер)
                if (data.c) {
                    SHIP.MyShip.MaxHP = data.ships[i].MaxHP;
                    SHIP.MyShip.HP = data.ships[i].HP;
                    SHIP.MyShip.Speed = data.ships[i].Speed;
                    SHIP.MyShip.Kill = data.ships[i].Kill;
                    SHIP.MyShip.Death = data.ships[i].Death;
                    SHIP.MyShip.Bombs = [];
                }
                RefreshStatRow(SHIP.MyShip);
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

    function MoveMyShip() {
        vectorMove = SHIP.MyShip.VectorMove;
        vectorRotate = SHIP.MyShip.VectorRotate;
        // Именно здесь перемещаем наш корабль! (нажатые клавиши задают векторы, а движение выполняется здесь)
        if ((vectorMove).slice(0, 4) == "Move") {
            SHIP.MyShip[vectorMove](SHIP.MyShip.Speed);
        }
        if ((vectorRotate).slice(0, 6) == "Rotate") {
            SHIP.MyShip[vectorRotate](SHIP.MyShip.AngleSpeed);
        }
    }

    var bombs = SHIP.MyShip.Bombs.filter(function (obj) { return obj.Sync == 0; });   // Берем из массива только бомбы, которые еще не отправлялись на сервер
    for (var i = 0; i < bombs.length; i++) {
        bombs[i].Sync = 1;  // Помечаем бомбы как отправленные (таким образом, каждая бомба посылается на сервер только один раз, а дальше - обрабатывается на клиенте)
    }

    var stringified = JSON.stringify(SHIP.MyShip);
    var request = $.ajax({
        url: "http://" + GAME.ServerName + "/game/Home/Synchronize/",
        type: "POST",
        data: stringified,
        dataType: "json",                               // !!!
        contentType: "application/json; charset=utf-8", // !!! (по умолчанию - "application/x-www-form-urlencoded; charset=UTF-8")
        cache: false,
        timeout: GAME.SyncRate
    });

    request.done(function (data) {
        SynchronizePlanets(data);
        SynchronizeShips(data);
        GenerateExplodes();
        MoveMyShip();
    });
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
    for (i = 0; i < SHIP.MyShip.Bombs.length; i++) {
        SHIP.MyShip.Bombs[i].Move();
        CheckSunAndBomb(SHIP.MyShip.Bombs[i]);
    }

    // Функция Array.prototype.filter имеет аналог в jQuery: $.grep
    SHIP.MyShip.Bombs = SHIP.MyShip.Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все неактивные бомбы (попавшие в корабль (или Солнце) / улетевшие за экран)

    for (i = 0; i < SHIP.MyShip.Bombs.length; i++) {               // Неактивных бомб в массиве нет
        SHIP.MyShip.Bombs[i].Show();
        for (var j = 0; j < arrDominators.length; j++) {    // А неактивные корабли - есть
            CheckBombAndShip(SHIP.MyShip.Bombs[i], arrDominators[j]);       // Проверяем, не встретилась ли наша бомба с доминаторским кораблем
        }
        if (SHIP.MyShip.Bombs[i].Vector != "Inactive") {
            for (var j = 0; j < SHIP.Ships.length; j++) {
                // Проверяем, не встретилась ли наша бомба с рейнджерским кораблем (и если да, то не прибила ли его)
                if ( CheckBombAndShip(SHIP.MyShip.Bombs[i], SHIP.Ships[j]) ) {
                    SHIP.MyShip.Kill++;
                } 
            }
        }
    }

    // *** Rangers bombs ***

    //for (i = 0; i < SHIP.Ships.length; i++) {
    //    if (SHIP.Ships[i].Bombs != null) {
    //        SHIP.Ships[i].Bombs = SHIP.Ships[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
    //    }
    //}

    // Неактивные бомбы пропускаем (пусть каждый вычищает свои бомбы сам)
    for (i = 0; i < SHIP.Ships.length; i++) {
        if (SHIP.Ships[i].Bombs != null) {
            for (var j = 0; j < SHIP.Ships[i].Bombs.length; j++) {
                if (SHIP.Ships[i].Bombs[j].Vector != "Inactive") {
                    SHIP.Ships[i].Bombs[j].Show();
                    // Проверяем, не встретилась ли рейнджерская бомба с нашим кораблем
                    if (CheckBombAndShip(SHIP.Ships[i].Bombs[j], SHIP.MyShip)) {
                        SHIP.MyShip.Death++;
                    }
                }
            }
        }
    }

    CheckSunAndShip(SHIP.MyShip);           // Проверяем, не налетели ли на Солнце
    if (SHIP.MyShip.HP < SHIP.MyShip.MaxHP) {
        SHIP.MyShip.HP += SHIP.RegenerateHP;    // Регенерировали
    }
    if (SHIP.MyShip.HP > SHIP.MyShip.MaxHP) {
        SHIP.MyShip.HP = SHIP.MyShip.MaxHP;
    }
    else {
        SHIP.MyShip.HP = Math.round(SHIP.MyShip.HP * 10) / 10;
    }
    SHIP.MyShip.Show();

    for (i = 0; i < SHIP.Ships.length; i++) {
        SHIP.Ships[i].Show();
    }

    for (i = 0; i < arrDominators.length; i++) {
        if (arrDominators[i].VectorMove == "Inactive") {
            continue;
        }
        CheckSunAndShip(arrDominators[i]);  // Проверяем, не налетел ли доминатор на Солнце
        arrDominators[i].Show();
    }

    // *** Dominator Bombs ***
    for (i = 0; i < arrDominators.length; i++) {
        for (var j = 0; j < arrDominators[i].Bombs.length; j++) {
            arrDominators[i].Bombs[j].Move();
            CheckSunAndBomb(arrDominators[i].Bombs[j]);
        }
        arrDominators[i].Bombs = arrDominators[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
    }

    for (i = 0; i < arrDominators.length; i++) {
        for (var j = 0; j < arrDominators[i].Bombs.length; j++) {
            arrDominators[i].Bombs[j].Show();
            CheckBombAndShip(arrDominators[i].Bombs[j], SHIP.MyShip);            // Проверяем, не встретилась ли вражеская бомба с нашим кораблем
        }
    }

    // Check colliding bombs with ships
    function CheckBombAndShip(bomb, ship) {
        var state = ship.VectorMove;
        if (state == "Inactive" || state.indexOf("Explode") != -1) {
            return false;
        }

        var checkX = (bomb.X >= ship.X - bomb.Size / 2) && (bomb.X <= ship.X + ship.Size - bomb.Size / 2);
        var checkY = (bomb.Y >= ship.Y - bomb.Size / 2) && (bomb.Y <= ship.Y + ship.Size - bomb.Size / 2);
        if (checkX && checkY) {
            bomb.Vector = "Inactive";
            ship.HP -= SHIP.BombHP;           // Если да, уменьшаем HP корабля
            if (ship.HP <= 0) {
                ship.HP = 0;
                ship.VectorMove = "Explode00";              // Взрыв проверяется только по свойству VectorMove (для определенности)
                ship.VectorRotate = "Stop";
                return true;    // Подбил
            }
        }
        return false;
    }

    // Check colliding ships with sun
    function CheckSunAndShip(ship) {
        if (ship.VectorMove.indexOf("Explode") != -1) {
            return;
        }

        if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - ship.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - ship.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
            ship.HP -= SHIP.SunHP;           // Если да, уменьшаем HP корабля
            if (ship.HP <= 0) {
                ship.HP = 0;
                ship.Death++;
                ship.VectorMove = "Explode00";              // Взрыв проверяется только по свойству VectorMove (для определенности)
                ship.VectorRotate = "Stop";
            }
        }
    }

    // Check colliding bombs with sun
    function CheckSunAndBomb(bomb) {
        if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - bomb.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - bomb.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
            bomb.Vector = "Inactive";
        }
    }
}

// *** Bombs ***
function GetNewBombX(ship) {
    return (ship.X + ship.Size / 2) + (Math.cos(ship.Angle)) * (ship.Size / 2) - (SHIP.BombSize / 2);
}

function GetNewBombY(ship) {
    return (ship.Y + ship.Size / 2) + (Math.sin(ship.Angle)) * (ship.Size / 2) - (SHIP.BombSize / 2);
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

// *** Global Timers ***
function StartGlobalSpaceTimer() {
    globalSpaceTimer = setInterval(function () {
        clearInterval(dominatorTimer);
        GenerateDominatorBombs();
    }, syncRateDominatorBombs);
}

function StartGlobalShipTimer() {
    globalShipTimer = setInterval(function () {
        Synchronize();
        SynchronizeDominatorShips();
        ReloadGame();
    }, GAME.SyncRate);
}


// *** Window Events ***
window.onload = function () {
    var request = $.ajax({
        url: "http://" + GAME.ServerName + "/game/Home/InitShips/",
        type: "GET",
        dataType: "json",
        cache: false
    });

    request.done(function (data) {
        GAME.SessionId = data.sessionId;
        GetShips(data.ships);
        InitDominators();
        StartGlobalSpaceTimer();
        StartGlobalShipTimer();
    });
};

window.onresize = function () {
    clearInterval(globalSpaceTimer);
    clearInterval(globalShipTimer);

    // Recount sun coordinates after window resizing
    var heightTotal = document.documentElement.clientHeight;
    GAME.Sidebar.style.height = heightTotal + "px";

    GAME.Canvas.width = document.documentElement.clientWidth - GAME.SidebarWidth;
    GAME.Canvas.height = heightTotal;
    SPACE.Sun.GetCenter();

    StartGlobalSpaceTimer();
    StartGlobalShipTimer();
};

window.onkeydown = function (key) {
    var vectorMove = SHIP.MyShip.VectorMove;
    if (vectorMove.indexOf("Explode") != -1) return false;   // If my ship is in the explosion state, it cannot move.

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            if (SHIP.MyShip.VectorRotate == "RotateCCW") {
                return false;
            }
            SHIP.MyShip.VectorRotate = "RotateCCW";
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            if (SHIP.MyShip.VectorMove = "MoveForward") {
                return false;
            }
            SHIP.MyShip.VectorMove = "MoveForward";
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            if (SHIP.MyShip.VectorRotate == "RotateCW") {
                return false;
            }
            SHIP.MyShip.VectorRotate = "RotateCW";
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
            if (SHIP.MyShip.VectorMove == "MoveBackward") {
                return false;
            }
            SHIP.MyShip.VectorMove = "MoveBackward";
            break;
        case 32:    // Space        (Fire)
            // Центрируем бомбу по оси наклона корабля (аналогично планетам) и затем смещаем бомбу на половину ее размера по X и Y (чтобы скомпенсировать "left top" для Image)
            var bombX = GetNewBombX(SHIP.MyShip);
            var bombY = GetNewBombY(SHIP.MyShip);
            if (SHIP.MyShip.Bombs.length < 5) {
                var bomb = new Bomb("ranger", bombX, bombY, SHIP.MyShip.Angle, SHIP.BombSize, 0, SHIP.BombSpeed);
                SHIP.MyShip.Bombs.push(bomb);
            }
            else {
                return false;
            }
            break;
            //case 27:    // Esc        (...)
            //    alert('Конец игры');
            //    window.close();
            //    break;
    }
    //return false;
};

window.onkeyup = function (key) {
    var vectorMove = SHIP.MyShip.VectorMove;
    if (vectorMove == null) return;                     // If key was up when MyShip wasn't created yet (i.e. when Ctrl+F5 was pressed in browser)
    if (vectorMove.indexOf("Explode") != -1) return false;    // If my ship is in the explosion state, it cannot move.

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            SHIP.MyShip.VectorRotate = "Stop";
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            SHIP.MyShip.VectorMove = "Stop";
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            SHIP.MyShip.VectorRotate = "Stop";
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
            SHIP.MyShip.VectorMove = "Stop";
            break;
    }
    return false;
};
