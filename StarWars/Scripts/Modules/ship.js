// *** MODULE for Ships & Bombs ***
define(['Modules/requests'], function (REQUESTS) {
    var my = {};
    var request = REQUESTS.InitShipConstants();

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

    // Rangers
    //my.Rangers = {};
    //my.RangerTypesMax = 9;
    //my.RangerTypes = {
    //    Type: ["smersh", "menok", "urgant", "ekventor"],
    //    MaxHP: [150, 200, 250, 300],
    //    Speed: [5, 4, 3, 2],
    //    Angle: [0.05, 0.04, 0.03, 0.02],
    //    Size: [70, 75, 85, 85],
    //    Images: new Array(my.DominatorTypesMax)
    //};


    // *** My ship (add image) ***
    var currentShip = document.getElementById("CurrentShip");
    my.MyShipImageFull = new Image();
    currentShip.appendChild(my.MyShipImageFull);

    // *** Ranger ship types ***
    my.RangerImages = [];
    my.RangerImagesMax = 9;

    var selectShip = document.getElementById("SelectShip");
    var imagePath = "http://" + location.hostname + "/Game/Content/Images/";    // Чтобы не ссылаться на GAME (иначе будет циклическая ссылка)

    for (var i = 0; i < my.RangerImagesMax; i++) {
        my.RangerImages[i] = new Image();
        my.RangerImages[i].src = imagePath + "Rangers/ranger" + (i + 1) + ".png";

        my.RangerImages[i].addEventListener("click", function (index) {
            return function () {
                // (!) Метод classList не работает в IE9-
                //my.RangerImages[index].classList.add("Selected");             // Добавляем класс "Selected" к выделенному
                //my.RangerImages[this.Image].classList.remove("Selected");     // И убираем "Selected" у предыдущего

                $(my.RangerImages[index]).addClass("Selected");
                $(my.RangerImages[my.MyShip.Image]).removeClass("Selected");

                my.MyShip.Image = index;
                my.MyShipImageFull.src = imagePath + "Rangers/Original/ranger" + (index + 1) + ".png";

                REQUESTS.UpdateUserShip("Image", index);     // Обновление моего корабля на сервере
            }
        }(i));

        selectShip.appendChild(my.RangerImages[i]);
    }

    // Dominators
    //my.DominatorTypesMax = 4;
    //my.DominatorTypes = {
    //    Type: ["smersh", "menok", "urgant", "ekventor"],
    //    MaxHP: [150, 200, 250, 300],
    //    Speed: [5, 4, 3, 2],
    //    Angle: [0.05, 0.04, 0.03, 0.02],
    //    Size: [70, 75, 85, 85],
    //    Images: new Array(my.DominatorTypesMax)
    //};

    //my.DominatorImagesMax = 3;
    //for (var i = 0; i < my.DominatorTypesMax; i++) {   // ["smersh", "menok", "urgant", "ekventor"]
    //    my.DominatorTypes.Images[i] = new Array(my.DominatorImagesMax);
    //    for (var j = 0; j < my.DominatorImagesMax; j++) {
    //        my.DominatorTypes.Images[i][j] = new Image();
    //        my.DominatorTypes.Images[i][j].src = GAME.ImagePath + "Dominators/dominator-" + my.DominatorTypes.Type[i] + "0" + (j + 1) + ".png";
    //    }
    //}

    // *** Bombs ***
    var imagePath = "http://" + location.hostname + "/Game/Content/Images/";

    my.RangerBombImages = [];
    my.RangerBombImages[0] = new Image();
    my.RangerBombImages[0].src = imagePath + "Weapons/weapon-bomb02-green.png";

    my.DominatorBombImages = [];
    my.DominatorBombImages[0] = new Image();
    my.DominatorBombImages[0].src = imagePath + "Weapons/weapon-bomb02-blue.png";

    return my;
});
