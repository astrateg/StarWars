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
                // (!) Метод classList не работает в IE9-
                //my.RangerImages[index].classList.add("Selected");               // Добавляем класс "Selected" к выделенному
                //my.RangerImages[SHIP.MyShip.Image].classList.remove("Selected");  // И убираем "Selected" у предыдущего

                $(my.RangerImages[index]).addClass("Selected");
                $(my.RangerImages[SHIP.MyShip.Image]).removeClass("Selected");

                my.MyShip.Image = index;
                my.MyShipImageFull.src = GAME.ImagePath + "Rangers/Original/ranger" + (index + 1) + ".png";

                REQUESTS.UpdateUserShip("Image", index);     // Обновление моего корабля на сервере
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
    //cell.classList.add("StatShip");
    $(cell).addClass("StatShip");
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = "Player";
    //cell.classList.add("StatPlayer");
    $(cell).addClass("StatPlayer");
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = "+";
    //cell.classList.add("StatKill");
    $(cell).addClass("StatKill");
    row.appendChild(cell);

    cell = document.createElement('td');
    cell.innerHTML = "-";
    //cell.classList.add("StatDeath");
    $(cell).addClass("StatDeath");
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
