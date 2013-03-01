// 1. Сделать привязку к сессии (перед стартом получать данные с сервера - если мой корабль уже есть, то брать его, иначе - создавать новый).
// 2. Проверить, сохраняется ли порядок Ajax-запросов, а главное - Ajax-ответов (вероятно, НЕТ - из-за этого дергания).
// 3. Исправить синхронизацию планет с сервером (сделать ее 1 раз - перед стартом - и сохранить где-то).

// ***** Initialization *****
var serverName = $('body').attr('data-server');
var sessionId = $('body').attr('data-session');
var syncRateSpace = 50;         // ms
var syncRateShip = 20;          // ms
var syncRateGlobal = 500;       // ms
var imagePath = "http://" + serverName + "/Game/Content/Images/";

// Generating random int number for fetching random image from array of dominator ships
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Timers for "setInterval" function
var globalSpaceTimer = null, localSpaceTimer = null;            // Timers for the sun and planets (server and local)
var globalShipTimer = null, localShipTimer = null;              // Timers for ships (server and local)
var shipMovingTimer = null, shipRotatingTimer = null;           // Timers for local ship
var otherShipsMovingTimer = [], otherShipsRotatingTimer = [];   // Timers for other ships

//var TO_RADIANS = Math.PI / 180;

// Images for planets and ships
var imgSun = new Image();
var imgEarth = new Image();
var imgMars = new Image();
var imgJupiter = new Image();

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
var ship1, speed = 1, angle = 0.01;     // Ship's speed & rotating angle
var arrShips = [];                      // Array of Ships

var dominatorSmersh, dominatorSmershSpeed = 1, dominatorSmershAngle = 0.01;
var arrDominators = [];  // Array of Dominators
var arrDominatorTimers = []; // Array of timers for Dominators
var dominatorTimer;

// Start coordinates and parameters for my ship
var shipX1 = 800, shipY1 = 600, shipAngle1 = 0;
var shipSize = 64;

// Stub ship
var otherShip, imgOtherShip;    // For every other ship from AJAX-request


var smershXStart = 1400, smershYStart = 100, smershAngleStart = 0;
var smershSize = 70;

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

    // Ship construstor: Ship(name, X, Y, angle, size, image, imageNameIndex, vectorMove, vectorRotate, delay)

    // Generating dominator ships
    var smersh, randomIndex, randomAngle;
    for (var i = 1; i < 10; i++) {
        randomIndex = getRandomInt(0, imgDominatorSmershMax - 1);
        randomAngle = Math.random() * (2 * Math.PI);
        smersh = new Ship('Smersh' + i, smershXStart, smershYStart + (i - 1) * 100, randomAngle, smershSize, imgDominatorSmersh[randomIndex], "MoveForward", "Stop", 0);
        arrDominators.push(smersh);
        arrDominatorTimers.push(null);
    }

    // Generating my ship (name = serverName)
    randomIndex = getRandomInt(0, imgShipMax - 1);
    ship1 = new Ship(sessionId, shipX1, shipY1, shipAngle1, shipSize, imgShip[randomIndex], randomIndex, "Stop", "Stop", 0);
    // Свой корабль НЕ добавляем в общий массив arrShips! (нет смысла корректировать его положение - мы его и так знаем).
    // Но с сервера получаем весь список кораблей (включая и свой), т.к. удалять корабль на сервере (перед отправкой) из коллекции List будет, вероятно, дороже.
}

function SynchronizePlanets() {
    var request = $.ajax({
        url: "http://" + serverName + "/game/Home/SynchronizePlanets",
        type: "GET",
        dataType: "json",
        cache: false,
        timeout: syncRateGlobal
    });

    request.done(function (date) {
        // Synchonize current orbit angle for each planet
        for (var i = 0; i < arrPlanets.length; i++) {
            arrPlanets[i].GetOrbitAngle(date);
        }

        // Именно здесь вызываем, т.к. надо дождаться, когда вернется JSON 
        // (иначе время сервера НЕ узнав, загрузим планеты - и всегда будем стартовать с одной и той же точки)
        localSpaceTimer = setInterval(function () {
            sun.Rotate();
            for (var i = 0; i < arrPlanets.length; i++) {
                arrPlanets[i].Move();
            }

            ReloadCanvas();
        }, syncRateSpace);
    });
}

function SynchronizeShips() {
    var request = $.ajax({
        url: "http://" + serverName + "/game/Home/SynchronizeShips",
        type: "POST",
        data: {
            Name: ship1.Name,
            X: ship1.X,
            Y: ship1.Y,
            Angle: ship1.Angle,
            Size: ship1.Size,
            Image: ship1.ImageNameIndex,
            VectorMove: ship1.VectorMove,
            VectorRotate: ship1.VectorRotate,
            Delay: ship1.Delay
        },
        dataType: "json",
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
                        continue;                   // если не одинаковые имена - берем следующий
                    }
                    else {                          // если корабль встретился в массиве JS - обновляем данные
                        arrShips[j].X = data.ships[i].X;
                        arrShips[j].Y = data.ships[i].Y;
                        arrShips[j].Angle = data.ships[i].Angle;
                        arrShips[j].VectorMove = data.ships[i].VectorMove;
                        arrShips[j].VectorRotate = data.ships[i].VectorRotate;
                        arrShips[j].Delay = data.ships[i].Delay;
                        isShipFound = true;
                        break;
                    }
                }

                if (!isShipFound) {                     // если корабля не было в массиве JS, то добавляем его в в массив
                    var imageIndex = parseInt(data.ships[i].Image);
                    otherShip = new Ship(
                        data.ships[i].Name,
                        data.ships[i].X,
                        data.ships[i].Y,
                        data.ships[i].Angle,
                        shipSize,
                        imgShip[imageIndex],
                        imageIndex,
                        data.ships[i].VectorMove,
                        data.ships[i].VectorRotate,
                        data.ships[i].Delay
                    );
                    arrShips.push(otherShip);
                    otherShipsMovingTimer.push(null);
                    otherShipsRotatingTimer.push(null);
                }
            }
        }

        for (i = 0; i < arrShips.length; i++) {
            var currentShip = arrShips[i];
            vectorMove = currentShip.VectorMove;
            vectorRotate = currentShip.VectorRotate;

            if (vectorMove == "Inactive") {
                continue;
            } else if (vectorMove == "Stop") {
                clearInterval(otherShipsMovingTimer[i]);
            } else {
                clearInterval(otherShipsMovingTimer[i]);
                otherShipsMovingTimer[i] = setInterval(function () {
                    currentShip[vectorMove](speed);
                    ReloadCanvas();
                }, syncRateShip);
            }

            if (vectorRotate == "Inactive") {
                continue;
            } else if (vectorRotate == "Stop") {
                clearInterval(otherShipsRotatingTimer[i]);
            } else {
                clearInterval(otherShipsRotatingTimer[i]);
                otherShipsRotatingTimer[i] = setInterval(function () {
                    currentShip[vectorRotate](angle);
                    ReloadCanvas();
                }, syncRateShip);
            }
        }
    });
}

function SynchronizeDominatorShips() {
    dominatorTimer = setInterval(function () {
        for (var i = 0; i < arrDominators.length; i++) {
            arrDominators[i].MoveForward(dominatorSmershSpeed);
        }
        ReloadCanvas();
    }, syncRateShip);
}

function ReloadCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    sun.Show();

    var i;
    for (i = 0; i < arrPlanets.length; i++) {
        arrPlanets[i].Show();
    }

    ship1.Show();
    for (i = 0; i < arrShips.length; i++) {
        arrShips[i].Show();
    }

    for (i = 0; i < arrDominators.length; i++) {
        arrDominators[i].Show();
    }
}

function StartGlobalSpaceTimer() {
    globalSpaceTimer = setInterval(function () {
        clearInterval(localSpaceTimer);
        clearInterval(dominatorTimer);
        SynchronizePlanets();
        SynchronizeDominatorShips();
    }, syncRateGlobal);
}

function StartGlobalShipTimer() {
    globalShipTimer = setInterval(function () {
        SynchronizeShips();
        ReloadCanvas();
    }, syncRateGlobal);
}

window.onload = function () {
    InitSpace();
    SynchronizePlanets();
    SynchronizeDominatorShips();
    SynchronizeShips();
    StartGlobalSpaceTimer();
    StartGlobalShipTimer();
};

window.onresize = function () {
    clearInterval(globalSpaceTimer);
    clearInterval(globalShipTimer);

    // Recount sun coordinates after window resizing
    canvas.width = document.documentElement.clientWidth;
    canvas.height = document.documentElement.clientHeight;
    sun.CenterX = sun.GetCenterX();
    sun.CenterY = sun.GetCenterY();

    StartGlobalSpaceTimer();
    StartGlobalShipTimer();
};

window.onkeydown = function (key) {
    switch (key.keyCode) {
        case 37:    // Left Arrow   (Rotate CCW)
        case 65:    // A
        case 97:    // a
            if (ship1.VectorRotate != "RotateCCW") { // Начинаем крутиться CCW (если до этого стояли ИЛИ крутились CW)
                clearInterval(shipRotatingTimer);
                ship1.VectorRotate = "RotateCCW";
                shipRotatingTimer = setInterval(function () { ship1.RotateCCW(angle); }, syncRateShip);
            }
            break;
        case 38:    // Up Arrow     (Move Forward)
        case 87:    // W
        case 119:   // w
            if (ship1.VectorMove != "MoveForward") { // Начинаем лететь Forward (если до этого стояли ИЛИ летели Backward)
                clearInterval(shipMovingTimer);
                ship1.VectorMove = "MoveForward";
                shipMovingTimer = setInterval(function () { ship1.MoveForward(speed); }, syncRateShip);
            }
            break;
        case 39:    // Right Arrow  (Rotate CW)
        case 68:    // D
        case 100:   // d
            if (ship1.VectorRotate != "RotateCW") { // Начинаем крутиться CW (если до этого стояли ИЛИ крутились CCW)
                clearInterval(shipRotatingTimer);
                ship1.VectorRotate = "RotateCW";
                shipRotatingTimer = setInterval(function () { ship1.RotateCW(angle); }, syncRateShip);
            }
            break;
        case 40:    // Down Arrow   (Move Backward)
        case 83:    // S
        case 115:   // s
            if (ship1.VectorMove != "MoveBackward") { // Начинаем лететь Backward (если до этого стояли ИЛИ летели Forward)
                clearInterval(shipMovingTimer);
                ship1.VectorMove = "MoveBackward";
                shipMovingTimer = setInterval(function () { ship1.MoveBackward(speed); }, syncRateShip);
            }
            break;
        case 32:    // Space        (Stop)
            clearInterval(shipMovingTimer);
            clearInterval(shipRotatingTimer);
            ship1.VectorMove = "Stop";
            ship1.VectorRotate = "Stop";
            break;
        case 27:    // Esc        (...)
            alert('Конец игры');
            window.close();
            break;
    }
};
