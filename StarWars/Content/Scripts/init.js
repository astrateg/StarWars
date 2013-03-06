// ***** Initialization *****
var serverName = $('body').attr('data-server');
var sessionId = "";

var imagePath = "http://" + serverName + "/Game/Content/Images/";
var syncRateSpace = 60;         // ms
var syncRateShip = 20;          // ms
var syncRateGlobal = 600;       // ms
var shipSize = 64;

// Generating random int number for fetching random image from array of dominator ships
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Timers for "setInterval" function
var globalSpaceTimer = null, localSpaceTimer = null;    // Timers for the sun and planets (server and local)
var globalShipTimer = null;                             // Timers for server ships

//var TO_RADIANS = Math.PI / 180;

// Images for planets and ships
var imgSun = new Image();
var imgEarth = new Image();
var imgMars = new Image();
var imgJupiter = new Image();

// Image for ship explosion
var imgExplosion = new Image();
imgExplosion.src = imagePath + "explosion.png";
var imgExplosionSizeX = 384, imgExplosionSizeY = 256;   // Explosion Image size
var imgExplosionStepX = imgExplosionSizeX / 3, imgExplosionStepY = imgExplosionSizeY / 4;   // Image step for "background shift"

var imgShip = [];
var imgShipMax = 4;
for (var i = 0; i < imgShipMax; i++) {
    imgShip[i] = new Image();
    imgShip[i].src = imagePath + "ranger0" + (i + 1) + ".png";
}

var imgDominatorSmersh = [];
var imgDominatorSmershMax = 3;
for (var i = 0; i < imgDominatorSmershMax; i++) {
    imgDominatorSmersh[i] = new Image();
    imgDominatorSmersh[i].src = imagePath + "dominator-smersh0" + (i + 1) + ".png";
}

// *** Weapons ***
// var arrMyBombs = [], arrDominatorBombs = [];
var bombSize = 24;

// Weapon images
var imgRangerBomb = [];
imgRangerBomb[0] = new Image();
imgRangerBomb[0].src = imagePath + "weapon-bomb02-green.png";
var imgDominatorBomb = [];
imgDominatorBomb[0] = new Image();
imgDominatorBomb[0].src = imagePath + "weapon-bomb02-blue.png";

// Objects "Image" are used as properties of the appropriate "Planet" objects (planets.js).
imgSun.src = imagePath + "sun.png";
imgEarth.src = imagePath + "earth.png";
imgMars.src = imagePath + "mars.png";
imgJupiter.src = imagePath + "jupiter.png";

// *** Planets ***
var sun, earth, mars, jupiter;
var arrPlanets = [];    // Array of Planets

// Start coordinates for planets
var earthObritRadius = 200, marsObritRadius = 330, jupiterObritRadius = 460;
var earthOrbitAngleStart = 0, marsOrbitAngleStart = Math.PI / 2, jupiterOrbitAngleStart = Math.PI;
var earthMoveAngle = 0.004, marsMoveAngle = -0.003, jupiterMoveAngle = 0.001;
var earthSize = 50, marsSize = 40, jupiterSize = 95;
var planetSizeGeneral = 95;  // px
var sunSize = 220;
var sunRotationAngle = 0.002; // radian

// *** Ships ***
var ship1, speed = 5, angle = 0.05;     // Ship's speed & rotating angle
var shipSize = 64;
var arrShips = [];                      // Array of Ships

var dominatorSmersh, dominatorSmershSpeed = 1, dominatorSmershAngle = 0.01;
var arrDominators = [];         // Array of Dominators
var arrDominatorTimers = [];    // Array of timers for Dominators
var dominatorTimer, dominatorBombTimer;

var smershXStart = 1400, smershYStart = 100, smershAngleStart = 0;
var smershSize = 70;

// Stub ship
var otherShip, imgOtherShip;    // For every other ship from AJAX-request

// Creating canvas
var canvas = document.createElement('canvas');
canvas.width = document.documentElement.clientWidth;
canvas.height = document.documentElement.clientHeight;
var context = canvas.getContext('2d');
document.body.appendChild(canvas);

// Initialization of the sun and planets
function InitSpace() {
    sun = new Sun('sun', sunSize, imgSun);
    earth = new Planet('earth', earthObritRadius, earthOrbitAngleStart, earthMoveAngle, earthSize, imgEarth);
    mars = new Planet('mars', marsObritRadius, marsOrbitAngleStart, marsMoveAngle, marsSize, imgMars);
    jupiter = new Planet('jupiter', jupiterObritRadius, jupiterOrbitAngleStart, jupiterMoveAngle, jupiterSize, imgJupiter);

    arrPlanets.push(earth);
    arrPlanets.push(mars);
    arrPlanets.push(jupiter);

    // Ship construstor: Ship(name, type, X, Y, angle, size, image, vectorMove, vectorRotate, delay)

    // Generating dominator ships
    var smersh, randomIndex, randomAngle;
    for (var i = 1; i < 2; i++) {
        randomIndex = getRandomInt(0, imgDominatorSmershMax - 1);
        randomAngle = Math.random() * (2 * Math.PI);
        smersh = new Ship('Smersh' + i, "dominator", smershXStart, smershYStart + (i - 1) * 100, randomAngle, smershSize, randomIndex, "MoveForward", "Stop", 0);
        arrDominators.push(smersh);
        arrDominatorTimers.push(null);
    }
}

function SynchronizePlanets() {
    var request = $.ajax({
        url: "http://" + serverName + "/game/Home/SynchronizePlanets",
        type: "GET",
        dataType: "json",
        cache: false,
        timeout: syncRateGlobal
    });

    request.done(function (data) {
        // Synchonize current orbit angle for each planet
        for (var i = 0; i < arrPlanets.length; i++) {
            arrPlanets[i].GetOrbitAngle(data);
        }

        // Именно здесь вызываем, т.к. надо дождаться, когда вернется JSON 
        // (иначе время сервера НЕ узнав, загрузим планеты - и всегда будем стартовать с одной и той же точки)
        localSpaceTimer = setInterval(function () {
            sun.Rotate();
            for (var i = 0; i < arrPlanets.length; i++) {
                arrPlanets[i].Move();
            }
            GenerateExplodes();
            ReloadCanvas();
        }, syncRateSpace);
    });
}

function GetShips(ships) {
    var isMyShipFound = false;
    if (ships[0] != null) {
        for (var i = 0; i < ships.length; i++) {
            var imageIndex = parseInt(ships[i].Image);
            if (ships[i].Name == sessionId) {
                isMyShipFound = true;
                ship1 = new Ship(ships[i].Name, "ranger", ships[i].X, ships[i].Y, ships[i].Angle, shipSize, imageIndex, "Stop", "Stop", 0);
            }
            else {
                var imageIndex = parseInt(ships[i].Image);
                otherShip = new Ship(
                    ships[i].Name,
                    ships[i].Type,
                    ships[i].X,
                    ships[i].Y,
                    ships[i].Angle,
                    shipSize,
                    imageIndex,
                    ships[i].VectorMove,
                    ships[i].VectorRotate,
                    ships[i].Delay
                );
                arrShips.push(otherShip);
            }
        }
    }

    // Generating my ship if it isn't found
    randomIndex = getRandomInt(0, imgShipMax - 1);
    if (!isMyShipFound) {
        var shipX1 = 0, shipY1 = 0, shipAngle1 = 0;
        ship1 = new Ship(sessionId, "ranger", shipX1, shipY1, shipAngle1, shipSize, randomIndex, "Stop", "Stop", 0);
    }

    // Свой корабль НЕ добавляем в общий массив arrShips! (нет смысла корректировать его положение - мы его и так знаем).
    // Но с сервера получаем весь список кораблей (включая и свой), т.к. удалять корабль на сервере (перед отправкой) из коллекции List будет, вероятно, дороже.
}

function SynchronizeShips() {
    var bombs = ship1.Bombs.filter(function (obj) { return obj.Sync == 0; });   // Берем из массива только бомбы, которые еще не отправлялись на сервер
    for (var i = 0; i < bombs.length; i++) {
        bombs[i].Sync = 1;  // Помечаем бомбы как отправленные (таким образом, каждая бомба посылается на сервер только один раз, а дальше - обрабатывается на клиенте)
    }

    var stringified = JSON.stringify(ship1);
    var request = $.ajax({
        url: "http://" + serverName + "/game/Home/SynchronizeShips",
        type: "POST",
        data: stringified,
        dataType: "json",                               // !!!
        contentType: "application/json; charset=utf-8", // !!! (по умолчанию - "application/x-www-form-urlencoded; charset=UTF-8")
        cache: false,
        timeout: syncRateGlobal
    });

    request.done(function (data) {
        // Обновляем данные: (Очищать массив нельзя - корабль сильно мельтешит!)
        var i, vectorMove, vectorRotate;
        for (i = 0; i < data.ships.length; i++) {
            var isShipFound = false;
            if (ship1.Name != data.ships[i].Name) {   // если не наш корабль - добавляем в массив (или обновляем)
                for (var j = 0; j < arrShips.length; j++) {
                    if (arrShips[j].Name != data.ships[i].Name) {   // сравниваем массивы - локальный (Javascript) и пришедший (JSON)
                        continue;                                   // если не одинаковые имена - берем следующий
                    }
                    else {                                          // если корабль встретился в массиве JS - обновляем данные (только те, которые изменились)
                        arrShips[j].X = data.ships[i].X;
                        arrShips[j].Y = data.ships[i].Y;
                        arrShips[j].Angle = data.ships[i].Angle;
                        arrShips[j].VectorMove = data.ships[i].VectorMove;
                        arrShips[j].VectorRotate = data.ships[i].VectorRotate;
                        arrShips[j].Delay = data.ships[i].Delay;
                        arrShips[j].Bombs = [];                     // сначала обнуляем массив бомб для каждого рейнджера
                        if (data.ships[i].Bombs != null) {          // а затем заполняем массив данными с сервера
                            for (var k = 0; k < data.ships[i].Bombs.length; k++) {
                                arrShips[j].Bombs[k] = new Bomb(
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
                    otherShip = new Ship(
                        data.ships[i].Name,
                        data.ships[i].Type,
                        data.ships[i].X,
                        data.ships[i].Y,
                        data.ships[i].Angle,
                        shipSize,
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
                    arrShips.push(otherShip);
                }
            }
        }

        vectorMove = ship1.VectorMove;
        vectorRotate = ship1.VectorRotate;
        // Именно здесь перемещаем наш корабль! (нажатые клавиши задают векторы, а движение выполняется здесь)
        if ((vectorMove).slice(0, 4) == "Move") {
            ship1[vectorMove](speed);
        }
        if ((vectorRotate).slice(0, 6) == "Rotate") {
            ship1[vectorRotate](angle);
        }

        ReloadCanvas();
    });
}

function SynchronizeDominatorShips() {
    dominatorTimer = setInterval(function () {
        for (var i = 0; i < arrDominators.length; i++) {
            var state = arrDominators[i].VectorMove;
            if (state == "Inactive" || state.indexOf("Explode") != -1) {
                continue;
            }

            arrDominators[i].MoveForward(dominatorSmershSpeed);
        }
        ReloadCanvas();
    }, syncRateShip);
}

function GenerateDominatorBombs() {
    for (var i = 0; i < arrDominators.length; i++) {
        var state = arrDominators[i].VectorMove;
        if (state == "Inactive" || state.indexOf("Explode") != -1) {
            continue;
        }

        var bombX = GetNewBombX(arrDominators[i]);
        var bombY = GetNewBombY(arrDominators[i]);
        var bomb = new Bomb("dominator", bombX, bombY, arrDominators[i].Angle, bombSize, 0, speed * 0.5);
        arrDominators[i].Bombs.push(bomb);
    }
}

function ReloadCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    sun.Show();

    var i;
    for (i = 0; i < arrPlanets.length; i++) {
        arrPlanets[i].Show();
    }
    
    // *** My Bombs ***
    for (i = 0; i < ship1.Bombs.length; i++) {
        ship1.Bombs[i].Move();
    }

    // Функция Array.prototype.filter имеет аналог в jQuery: $.grep
    ship1.Bombs = ship1.Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран

    for (i = 0; i < ship1.Bombs.length; i++) {               // Неактивных бомб в массиве нет
        ship1.Bombs[i].Show();
        for (var j = 0; j < arrDominators.length; j++) {    // А неактивные корабли - есть
            var state = arrDominators[j].VectorMove;
            if (state == "Inactive" || state.indexOf("Explode") != -1) {
                continue;
            }
            if (CheckBombAndShip(ship1.Bombs[i], arrDominators[j])) {            // Проверяем, не встретилась ли наша бомба с вражеским кораблем
                arrDominators[j].VectorMove = "Explode00";                      // Взрыв проверяется только по свойству VectorMove (для определенности)
                arrDominators[j].VectorRotate = "Inactive";
                ship1.Bombs[i].Vector = "Inactive";
            }
        }
    }

    // *** Rangers bombs ***
    for (i = 0; i < arrShips.length; i++) {
        if (arrShips[i].Bombs != null) {
            arrShips[i].Bombs = arrShips[i].Bombs.filter(function (obj) { return obj.Vector !== "Inactive"; });   // Убираем из массива все бомбы, улетевшие за экран
        }
    }

    for (i = 0; i < arrShips.length; i++) {
        if (arrShips[i].Bombs != null) {
            for (var j = 0; j < arrShips[i].Bombs.length; j++) {
                arrShips[i].Bombs[j].Show();

                if (CheckBombAndShip(arrShips[i].Bombs[j], ship1)) {            // Проверяем, не встретилась ли вражеская бомба с нашим кораблем
                    ship1.VectorMove = "Explode00";
                    ship1.VectorRotate = "Stop";
                    arrShips[i].Bombs[j].Vector = "Inactive";
                }
            }
        }
    }

    if (CheckSunAndShip(ship1)) {            // Проверяем, не налетели ли на Солнце
        ship1.VectorMove = "Explode00";
        ship1.VectorRotate = "Stop";
    }
    ship1.Show();

    for (i = 0; i < arrShips.length; i++) {
        arrShips[i].Show();
    }

    for (i = 0; i < arrDominators.length; i++) {
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
            if (CheckBombAndShip(arrDominators[i].Bombs[j], ship1)) {            // Проверяем, не встретилась ли вражеская бомба с нашим кораблем
                ship1.VectorMove = "Explode00";
                ship1.VectorRotate = "Stop";
                arrDominators[i].Bombs[j].Vector = "Inactive";
            }
        }
    }

    if (CheckSunAndShip(ship1)) {            // Проверяем, не налетели ли на Солнце
        ship1.VectorMove = "Explode00";
        ship1.VectorRotate = "Stop";
    }
    ship1.Show();
    for (i = 0; i < arrShips.length; i++) {
        arrShips[i].Show();
    }

    for (i = 0; i < arrDominators.length; i++) {
        arrDominators[i].Show();
    }

    // Check colliding bombs with ships
    function CheckBombAndShip(bomb, ship) {
        if (ship.VectorMove.indexOf("Explode") != -1) {
            return false;
        }
        var checkX = (bomb.X >= ship.X - bombSize / 2) && (bomb.X <= ship.X + shipSize - bombSize / 2);
        var checkY = (bomb.Y >= ship.Y - bombSize / 2) && (bomb.Y <= ship.Y + shipSize - bombSize / 2);
        if (checkX && checkY) {
            return true;
        }
        else {
            return false;
        }
    }

    function CheckSunAndShip(ship) {
        if (ship.VectorMove.indexOf("Explode") != -1) {
            return false;
        }

        if (Math.sqrt(Math.pow(sun.CenterX - ship.GetCenterX(), 2) + Math.pow(sun.CenterY - ship.GetCenterY(), 2)) < sunSize / 2) {
            return true;
        }
        else {
            return false;
        }
    }

}

// *** Bombs ***
function GetNewBombX(ship) {
    return (ship.X + shipSize / 2) + (Math.cos(ship.Angle)) * (shipSize / 2) - (bombSize / 2);
}

function GetNewBombY(ship) {
    return (ship.Y + shipSize / 2) + (Math.sin(ship.Angle)) * (shipSize / 2) - (bombSize / 2);
}

// *** Explodes Animation and Changing Explosion State ***
function GenerateExplodes() {
    for (var i = 0; i < arrDominators.length; i++) {
        Generate(arrDominators[i]);
    }

    Generate(ship1);

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
                if (ship.Name == ship1.Name) {  // If it's my ship, reload it after exploding.
                    ship.X = 10;
                    ship.Y = 10;
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
        clearInterval(localSpaceTimer);
        clearInterval(dominatorTimer);
        SynchronizePlanets();
        SynchronizeDominatorShips();
        GenerateDominatorBombs();
    }, syncRateGlobal);
}

function StartGlobalShipTimer() {
    globalShipTimer = setInterval(function () {
        SynchronizeShips();
        ReloadCanvas();
    }, syncRateShip);
}


// *** Window Events ***
window.onload = function () {
    var request = $.ajax({
        url: "http://" + serverName + "/game/Home/GetSessionAndShips/",
        type: "GET",
        dataType: "json",
        cache: false
    });

    request.done(function (data) {
        sessionId = data.sessionId;
        GetShips(data.ships);
        InitSpace();
        StartGlobalSpaceTimer();
        StartGlobalShipTimer();
    });
};

window.onresize = function () {
    clearInterval(globalSpaceTimer);
    clearInterval(globalShipTimer);

    // Recount sun coordinates after window resizing
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    sun.GetCenter();

    StartGlobalSpaceTimer();
    StartGlobalShipTimer();
};

window.onkeydown = function (key) {
    if ((ship1.VectorMove).indexOf("Explode") != -1) return;   // If my ship is in the explosion state, it cannot move.

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            ship1.VectorRotate = "RotateCCW";
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            ship1.VectorMove = "MoveForward";
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            ship1.VectorRotate = "RotateCW";
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
            ship1.VectorMove = "MoveBackward";
            break;
        case 32:    // Space        (Fire)
            // Центрируем бомбу по оси наклона корабля (аналогично планетам) и затем смещаем бомбу на половину ее размера по X и Y (чтобы скомпенсировать "left top" для Image)
            var bombX = GetNewBombX(ship1);
            var bombY = GetNewBombY(ship1);
            var bomb = new Bomb("ranger", bombX, bombY, ship1.Angle, bombSize, 0, speed * 1.5);
            ship1.Bombs.push(bomb);
            break;
        //case 27:    // Esc        (...)
        //    alert('Конец игры');
        //    window.close();
        //    break;
    }
};

window.onkeyup = function (key) {
    if ((ship1.VectorMove).indexOf("Explode") != -1) return;   // If my ship is in the explosion state, it cannot move.

    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            ship1.VectorRotate = "Stop";
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            ship1.VectorMove = "Stop";
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            ship1.VectorRotate = "Stop";
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
            ship1.VectorMove = "Stop";
            break;
    }
};
