// *** MODULE for Game ***
var GAME = (function () {
    var my = {};
    my.ServerName = $('body').attr('data-server');
    my.SessionId = "";
    my.ImagePath = "http://" + my.ServerName + "/Game/Content/Images/";
    my.SyncRate = 20;

    my.Canvas = document.createElement('Canvas');
    my.Canvas.width = document.documentElement.clientWidth;
    my.Canvas.height = document.documentElement.clientHeight;

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

    // Ships
    my.ShipSize = 64, my.ShipSpeed = 5, my.ShipAngle = 0.05;
    my.MyShip = {};   // Ship's speed & rotating angle
    my.Ships = [];    // Array of Ships

    my.RangerImages = [];
    my.RangerImagesMax = 4;
    for (var i = 0; i < my.RangerImagesMax; i++) {
        my.RangerImages[i] = new Image();
        my.RangerImages[i].src = GAME.ImagePath + "Rangers/ranger0" + (i + 1) + ".png";
    }

    //imgDominatorSmersh
    my.DominatorTypesMax = 4;
    my.DominatorTypes = {
        Type: ["smersh", "menok", "urgant", "ekventor"],
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

    // Bombs
    my.BombSize = 24, my.BombSpeed = 2.5;

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
var dominatorSmersh, dominatorSmershSpeed = 1, dominatorSmershAngle = 0.01;
var arrDominators = [];         // Array of Dominators
var dominatorTimer;

var smershXStart = 1200, smershYStart = 100, smershAngleStart = 0;

function InitDominators() {
    // Ship construstor: Ship(name, type, X, Y, angle, size, image, vectorMove, vectorRotate, delay)
    var dominatorsMax = 10;     //DominatorTypes
    var randomIndexType, randomIndexImage;
    var dominator, type, size, randomAngle;
    for (var i = 0; i < dominatorsMax; i++) {
        randomIndexType = UTILS.GetRandomInt(0, SHIP.DominatorTypesMax - 1);
        randomIndexImage = UTILS.GetRandomInt(0, SHIP.DominatorImagesMax - 1);

        type = SHIP.DominatorTypes.Type[randomIndexType];
        size = SHIP.DominatorTypes.Size[randomIndexType];
        randomAngle = Math.random() * (2 * Math.PI);

        dominator = new Ship(
            type,
            "dominator-" + type,
            smershXStart + randomIndexType * randomIndexImage * 10,
            smershYStart + i * 100,
            randomAngle,
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
            if (ships[i].Name == GAME.SessionId) {
                isMyShipFound = true;
                SHIP.MyShip = new Ship(ships[i].Name, "ranger", ships[i].X, ships[i].Y, ships[i].Angle, SHIP.ShipSize, imageIndex, "Stop", "Stop", 0);
            }
            else {
                imageIndex = parseInt(ships[i].Image);
                var otherShip = new Ship(
                    ships[i].Name,
                    ships[i].Type,
                    ships[i].X,
                    ships[i].Y,
                    ships[i].Angle,
                    SHIP.ShipSize,
                    imageIndex,
                    ships[i].VectorMove,
                    ships[i].VectorRotate,
                    ships[i].Delay
                );
                SHIP.Ships.push(otherShip);
            }
        }
    }

    // Generating my ship if it isn't found
    randomIndex = UTILS.GetRandomInt(0, SHIP.RangerImagesMax - 1);
    if (!isMyShipFound) {
        var shipX1 = 0, shipY1 = 0, shipAngle1 = 0;
        SHIP.MyShip = new Ship(GAME.SessionId, "ranger", shipX1, shipY1, shipAngle1, SHIP.ShipSize, randomIndex, "Stop", "Stop", 0);
    }

    // Свой корабль НЕ добавляем в общий массив SHIP.Ships! (нет смысла корректировать его положение - мы его и так знаем).
    // Но с сервера получаем весь список кораблей (включая и свой), т.к. удалять корабль на сервере (перед отправкой) из коллекции List будет, вероятно, дороже.
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
            if (SHIP.MyShip.Name != data.ships[i].Name) {   // если не наш корабль - добавляем в массив (или обновляем)
                for (var j = 0; j < SHIP.Ships.length; j++) {
                    if (SHIP.Ships[j].Name != data.ships[i].Name) {   // сравниваем массивы - локальный (Javascript) и пришедший (JSON)
                        continue;                                   // если не одинаковые имена - берем следующий
                    }
                    else {                                          // если корабль встретился в массиве JS - обновляем данные (только те, которые изменились)
                        SHIP.Ships[j].X = data.ships[i].X;
                        SHIP.Ships[j].Y = data.ships[i].Y;
                        SHIP.Ships[j].Angle = data.ships[i].Angle;
                        SHIP.Ships[j].VectorMove = data.ships[i].VectorMove;
                        SHIP.Ships[j].VectorRotate = data.ships[i].VectorRotate;
                        SHIP.Ships[j].Delay = data.ships[i].Delay;
                        SHIP.Ships[j].Bombs = [];                     // сначала обнуляем массив бомб для каждого рейнджера
                        if (data.ships[i].Bombs != null) {          // а затем заполняем массив данными с сервера
                            for (var k = 0; k < data.ships[i].Bombs.length; k++) {
                                SHIP.Ships[j].Bombs[k] = new Bomb(
                                    data.ships[i].Bombs[k].Type,
                                    data.ships[i].Bombs[k].X,
                                    data.ships[i].Bombs[k].Y,
                                    data.ships[i].Bombs[k].Angle,
                                    data.ships[i].Bombs[k].Size,
                                    data.ships[i].Bombs[k].Image,
                                    data.ships[i].Bombs[k].speed
                                    );
                            }
                        }

                        isShipFound = true;
                        break;
                    }
                }

                if (!isShipFound) {                     // если корабля не было в массиве JS, то добавляем его в в массив
                    var imageIndex = parseInt(data.ships[i].Image);
                    var otherShip = new Ship(
                        data.ships[i].Name,
                        data.ships[i].Type,
                        data.ships[i].X,
                        data.ships[i].Y,
                        data.ships[i].Angle,
                        SHIP.ShipSize,
                        imageIndex,
                        data.ships[i].VectorMove,
                        data.ships[i].VectorRotate,
                        data.ships[i].Delay
                    );
                    if (data.ships[i].Bombs != null) {
                        for (var k = 0; k < data.ships[i].Bombs.length; k++) {
                            otherShip.Bombs[k] = new Bomb(
                                data.ships[i].Bombs[k].Type,
                                data.ships[i].Bombs[k].X,
                                data.ships[i].Bombs[k].Y,
                                data.ships[i].Bombs[k].Angle,
                                data.ships[i].Bombs[k].Size,
                                data.ships[i].Bombs[k].Image,
                                data.ships[i].Bombs[k].speed
                            );
                        }
                    }   // иначе: otherShip.Bombs = [] (см. конструктор Bomb)
                    SHIP.Ships.push(otherShip);
                }
            }
        }
    }

    function MoveMyShip() {
        vectorMove = SHIP.MyShip.VectorMove;
        vectorRotate = SHIP.MyShip.VectorRotate;
        // Именно здесь перемещаем наш корабль! (нажатые клавиши задают векторы, а движение выполняется здесь)
        if ((vectorMove).slice(0, 4) == "Move") {
            SHIP.MyShip[vectorMove](SHIP.ShipSpeed);
        }
        if ((vectorRotate).slice(0, 6) == "Rotate") {
            SHIP.MyShip[vectorRotate](SHIP.ShipAngle);
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
        cache: false
    });

    request.done(function (data) {
        SynchronizePlanets(data);
        SynchronizeShips(data);
        GenerateExplodes();
        MoveMyShip();
    });
}

function SynchronizeDominatorShips() {
    var type, indexTyp, speed;
    for (var i = 0; i < arrDominators.length; i++) {
        // Cheching state
        var state = arrDominators[i].VectorMove;
        if (state == "Inactive" || state.indexOf("Explode") != -1) {
            continue;
        }

        type = arrDominators[i].Type.slice(10);               // "smersh", "menok", "urgant", "ekventor"
        indexType = SHIP.DominatorTypes.Type.indexOf(type);
        speed = SHIP.DominatorTypes.Speed[indexType];

        arrDominators[i].MoveForward(speed);
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
    }

    // Функция Array.prototype.filter имеет аналог в jQuery: $.grep
    SHIP.MyShip.Bombs = SHIP.MyShip.Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран

    for (i = 0; i < SHIP.MyShip.Bombs.length; i++) {               // Неактивных бомб в массиве нет
        SHIP.MyShip.Bombs[i].Show();
        for (var j = 0; j < arrDominators.length; j++) {    // А неактивные корабли - есть
            var state = arrDominators[j].VectorMove;
            if (state == "Inactive" || state.indexOf("Explode") != -1) {
                continue;
            }
            if (CheckBombAndShip(SHIP.MyShip.Bombs[i], arrDominators[j])) {            // Проверяем, не встретилась ли наша бомба с вражеским кораблем
                arrDominators[j].VectorMove = "Explode00";                      // Взрыв проверяется только по свойству VectorMove (для определенности)
                arrDominators[j].VectorRotate = "Inactive";
                SHIP.MyShip.Bombs[i].Vector = "Inactive";
            }
        }
    }

    // *** Rangers bombs ***
    for (i = 0; i < SHIP.Ships.length; i++) {
        if (SHIP.Ships[i].Bombs != null) {
            SHIP.Ships[i].Bombs = SHIP.Ships[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
        }
    }

    for (i = 0; i < SHIP.Ships.length; i++) {
        if (SHIP.Ships[i].Bombs != null) {
            for (var j = 0; j < SHIP.Ships[i].Bombs.length; j++) {
                SHIP.Ships[i].Bombs[j].Show();

                if (CheckBombAndShip(SHIP.Ships[i].Bombs[j], SHIP.MyShip)) {            // Проверяем, не встретилась ли рейнджерская бомба с нашим кораблем
                    SHIP.MyShip.VectorMove = "Explode00";
                    SHIP.MyShip.VectorRotate = "Stop";
                    SHIP.Ships[i].Bombs[j].Vector = "Inactive";
                }
            }
        }
    }

    if (CheckSunAndShip(SHIP.MyShip)) {            // Проверяем, не налетели ли на Солнце
        SHIP.MyShip.VectorMove = "Explode00";
        SHIP.MyShip.VectorRotate = "Stop";
    }
    SHIP.MyShip.Show();

    for (i = 0; i < SHIP.Ships.length; i++) {
        SHIP.Ships[i].Show();
    }

    for (i = 0; i < arrDominators.length; i++) {
        if (arrDominators[i].VectorMove == "Inactive") {
            continue;
        }
        if (CheckSunAndShip(arrDominators[i])) {            // Проверяем, не налетели ли на Солнце
            arrDominators[i].VectorMove = "Explode00";
            arrDominators[i].VectorRotate = "Stop";
        }
        arrDominators[i].Show();
    }

    // *** Dominator Bombs ***
    for (i = 0; i < arrDominators.length; i++) {
        for (var j = 0; j < arrDominators[i].Bombs.length; j++) {
            arrDominators[i].Bombs[j].Move();
        }
        arrDominators[i].Bombs = arrDominators[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
    }

    for (i = 0; i < arrDominators.length; i++) {
        for (var j = 0; j < arrDominators[i].Bombs.length; j++) {
            arrDominators[i].Bombs[j].Show();
            if (CheckBombAndShip(arrDominators[i].Bombs[j], SHIP.MyShip)) {            // Проверяем, не встретилась ли вражеская бомба с нашим кораблем
                SHIP.MyShip.VectorMove = "Explode00";
                SHIP.MyShip.VectorRotate = "Stop";
                arrDominators[i].Bombs[j].Vector = "Inactive";
            }
        }
    }

    // Check colliding bombs with ships
    function CheckBombAndShip(bomb, ship) {
        if (ship.VectorMove.indexOf("Explode") != -1) {
            return false;
        }
        var checkX = (bomb.X >= ship.X - bomb.Size / 2) && (bomb.X <= ship.X + ship.Size - bomb.Size / 2);
        var checkY = (bomb.Y >= ship.Y - bomb.Size / 2) && (bomb.Y <= ship.Y + ship.Size - bomb.Size / 2);
        if (checkX && checkY) {
            return true;
        }
        else {
            return false;
        }
    }

    // Check colliding ships with sun
    function CheckSunAndShip(ship) {
        if (ship.VectorMove.indexOf("Explode") != -1) {
            return false;
        }

        if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - ship.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - ship.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
            return true;
        }
        else {
            return false;
        }
    }

    // Check colliding bombs with sun
    function CheckSunAndBomb(bomb) {
        if (bomb.Vector.indexOf("Explode") != -1) {
            return false;
        }

        if (Math.sqrt(Math.pow(SPACE.Sun.CenterX - bomb.GetCenterX(), 2) + Math.pow(SPACE.Sun.CenterY - bomb.GetCenterY(), 2)) < SPACE.Sun.Size / 2) {
            return true;
        }
        else {
            return false;
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
                if (ship.Name == SHIP.MyShip.Name) {  // If it's my ship, reload it after exploding.
                    var randomX = UTILS.GetRandomInt(200, 400);
                    var randomLeft = UTILS.GetRandomInt(0, 1);
                    var randomY = UTILS.GetRandomInt(200, 400);
                    var randomTop = UTILS.GetRandomInt(0, 1);
                    ship.X = (randomLeft) ? randomX : (GAME.Canvas.width - randomX);
                    ship.Y = (randomTop) ? randomY : (GAME.Canvas.height - randomY);
                    ship.VectorMove = "Stop";
                }
                else {
                    ship.VectorMove = "Inactive";
                }
                return;
            }
            ship.VectorMove = "Explode" + Y + X;
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
    GAME.Canvas.width = document.documentElement.clientWidth;
    GAME.Canvas.height = document.documentElement.clientHeight;
    SPACE.Sun.GetCenter();

    StartGlobalSpaceTimer();
    StartGlobalShipTimer();
};

window.onkeydown = function (key) {
    var vectorMove = SHIP.MyShip.VectorMove;
    if (vectorMove.indexOf("Explode") != -1) return;   // If my ship is in the explosion state, it cannot move.

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            SHIP.MyShip.VectorRotate = "RotateCCW";
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            SHIP.MyShip.VectorMove = "MoveForward";
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            SHIP.MyShip.VectorRotate = "RotateCW";
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
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
            break;
        //case 27:    // Esc        (...)
        //    alert('Конец игры');
        //    window.close();
        //    break;
    }
};

window.onkeyup = function (key) {
    var vectorMove = SHIP.MyShip.VectorMove;
    if (vectorMove.indexOf("Explode") != -1) return;   // If my ship is in the explosion state, it cannot move.

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
};
