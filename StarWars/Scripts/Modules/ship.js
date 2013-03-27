// *** MODULE for Ships & Bombs ***
define(['jquery', 'Modules/requests'], function ($, REQUESTS) {
    var my = {};

    // *** Ships ***
    my.MyShip = {};   // Ship's speed & rotating angle
    my.Ships = [];    // Array of Ships

    var request = REQUESTS.InitShipConstants();

    request.done(function (data) {
        my.Types = {};
        my.Types.Type = JSON.parse(data.Types.Type);
        my.Types.HPStart = JSON.parse(data.Types.HPStart);
        my.Types.HPLimit = JSON.parse(data.Types.HPLimit);
        my.Types.SpeedStart = JSON.parse(data.Types.SpeedStart);
        my.Types.SpeedLimit = JSON.parse(data.Types.SpeedLimit);
        my.Types.AngleSpeedStart = JSON.parse(data.Types.AngleSpeedStart);
        my.Types.AngleSpeedLimit = JSON.parse(data.Types.AngleSpeedLimit);

        my.HPMult = data.HPMult,
        my.SpeedMult = data.SpeedMult,
        my.AngleSpeedMult = data.AngleSpeedMult,

        my.ShipSize = data.shipSize;
        //my.BombHP = data.bombHP;  // Ударная сила бомбы (1 столкновение)
        //my.BombSize = data.bombSize;
        //my.BombSpeed = data.bombSpeed;

        my.SunHP = data.sunHP;    // Ударная сила Солнца (1 tick = GAME.SyncRate = 20ms)
        my.RegenerateHP = data.regenerateHP;    // Регенерация (1 tick = GAME.SyncRate)
    });

    // Rangers
    my.Ranger = {};
    my.Ranger.TypesMax = 9;


    // *** My ship (add image) ***
    var currentShip = document.getElementById("CurrentShip");
    var currentShipHP = document.getElementById("CurrentShipHP");
    my.MyShip.ImageSmall = new Image();
    my.MyShip.ImageBig = new Image();
    currentShip.insertBefore(my.MyShip.ImageBig, currentShipHP);

    // *** Ranger ship types ***
    my.Ranger.ImagesBig = [];
    my.Ranger.ImagesSmall = [];
    my.Ranger.ImagesMax = 9;

    var selectShip = document.getElementById("SelectShipIcon");
    var imagePath = "http://" + location.hostname + "/Game/Content/Images/";    // Чтобы не ссылаться на GAME (иначе будет циклическая ссылка)

    for (var i = 0; i < my.Ranger.ImagesMax; i++) {
        my.Ranger.ImagesSmall[i] = new Image();
        my.Ranger.ImagesSmall[i].src = imagePath + "Rangers/ranger" + (i + 1) + ".png";

        my.Ranger.ImagesBig[i] = new Image();
        my.Ranger.ImagesBig[i].src = imagePath + "Rangers/Original/ranger" + (i + 1) + ".png";
        my.Ranger.ImagesBig[i].className = "Rounded";

        my.Ranger.ImagesBig[i].addEventListener("click", function (index) {
            return function () {
                // (!) Метод classList не работает в IE9-
                //my.Ranger.Images[index].classList.add("Selected");             // Добавляем класс "Selected" к выделенному
                //my.Ranger.Images[this.Image].classList.remove("Selected");     // И убираем "Selected" у предыдущего

                $(my.Ranger.ImagesBig[index]).addClass("Selected");
                $(my.Ranger.ImagesBig[my.MyShip.ImageIndex]).removeClass("Selected");

                my.MyShip.ImageIndex = index;
                my.MyShip.ImageSmall.src = imagePath + "Rangers/ranger" + (index + 1) + ".png";
                my.MyShip.ImageBig.src = imagePath + "Rangers/Original/ranger" + (index + 1) + ".png";

                var type = $("#SelectShipParameters .Type .Value").eq(0);
                type.text(my.Types.Type[index]);

                var hp = $("#SelectShipParameters .HP .Point");
                ShowParameters(my.Types.HPStart, my.Types.HPLimit, index, hp);

                var speed = $("#SelectShipParameters .Speed .Point");
                ShowParameters(my.Types.SpeedStart, my.Types.SpeedLimit, index, speed);

                var angleSpeed = $("#SelectShipParameters .AngleSpeed .Point");
                ShowParameters(my.Types.AngleSpeedStart, my.Types.AngleSpeedLimit, index, angleSpeed);

                //REQUESTS.UpdateUserShip("Image", index);     // Обновление моего корабля на сервере
            }
        }(i));

        selectShip.appendChild(my.Ranger.ImagesBig[i]);
    }

    function ShowParameters(arrStart, arrLimit, index, obj) {
        for (var i = 0; i < arrStart[index]; i++) {
            obj.eq(i).removeClass("Limit");
            obj.eq(i).addClass("Start");
        }
        for (var i = arrStart[index]; i < arrLimit[index]; i++) {
            obj.eq(i).removeClass("Start");
            obj.eq(i).addClass("Limit");
        }
        for (var i = arrLimit[index]; i < 10; i++) {
            obj.eq(i).removeClass("Start");
            obj.eq(i).removeClass("Limit");
        }
    }

    // Dominators
    my.Dominator = {};
    //my.Dominator.TypesMax = 4;
    //my.Dominator.Types = {
    //    Type: ["smersh", "menok", "urgant", "ekventor"],
    //    MaxHP: [150, 200, 250, 300],
    //    Speed: [5, 4, 3, 2],
    //    Angle: [0.05, 0.04, 0.03, 0.02],
    //    Size: [70, 75, 85, 85],
    //    Images: new Array(my.DominatorTypesMax)
    //};

    //my.Dominator.ImagesMax = 3;
    //for (var i = 0; i < my.Dominator.TypesMax; i++) {   // ["smersh", "menok", "urgant", "ekventor"]
    //    my.Dominator.Types.Images[i] = new Array(my.Dominator.ImagesMax);
    //    for (var j = 0; j < my.Dominator.ImagesMax; j++) {
    //        my.Dominator.Types.Images[i][j] = new Image();
    //        my.Dominator.Types.Images[i][j].src = imagePath + "Dominators/dominator-" + my.Dominator.Types.Type[i] + "0" + (j + 1) + ".png";
    //    }
    //}

    // *** Bombs ***
    var imagePath = "http://" + location.hostname + "/Game/Content/Images/";

    my.Ranger.BombImages = [];
    my.Ranger.BombImages[0] = new Image();
    my.Ranger.BombImages[0].src = imagePath + "Weapons/weapon-bomb02-green.png";

    my.Dominator.BombImages = [];
    my.Dominator.BombImages[0] = new Image();
    my.Dominator.BombImages[0].src = imagePath + "Weapons/weapon-bomb02-blue.png";

    return my;
});
