// *** MODULE for Ships & Bombs ***
define(['Modules/requests'], function (REQUESTS) {
    var my = {};

    // *** Ships ***
    my.MyShip = {};   // Ship's speed & rotating angle
    my.Ships = [];    // Array of Ships

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

    var imagePath = "http://" + location.hostname + "/Game/Content/Images/";    // Чтобы не ссылаться на GAME (иначе будет циклическая ссылка)

    // Загружаем маленькие иконки кораблей - они нужны в любом случае (весь набор)
    for (var i = 0; i < my.Ranger.ImagesMax; i++) {
        my.Ranger.ImagesSmall[i] = new Image();
        my.Ranger.ImagesSmall[i].src = imagePath + "Rangers/ranger" + (i + 1) + ".png";
    }

    my.Init = function () {
        var request = REQUESTS.InitShipConstants();

        request.done(function (data) {
            my.MyShip.Exists = data.MyShipExists;
            // Если корабль есть, сохраняем индекс иконки
            if (data.MyShipImageIndex > -1) {
                my.MyShip.ImageIndex = data.MyShipImageIndex;
            }

            my.Types = data.Types;
            my.HPMult = data.HPMult,
            my.SpeedMult = data.SpeedMult,
            my.AngleSpeedMult = data.AngleSpeedMult,

            my.ShipSize = data.ShipSize;

            if (my.MyShip.Exists == 0) {
                $("#ModalWindow").css("display", "block");

                // Загружаем большие иконки кораблей - они нужны только если корабль еще не создан
                var selectShip = document.getElementById("SelectShipIcon");

                for (var i = 0; i < my.Ranger.ImagesMax; i++) {
                    my.Ranger.ImagesBig[i] = new Image();
                    my.Ranger.ImagesBig[i].src = imagePath + "Rangers/Original/ranger" + (i + 1) + ".png";
                    my.Ranger.ImagesBig[i].className = "Rounded";

                    var buttonOK = $("#ButtonOK");

                    my.Ranger.ImagesBig[i].addEventListener("click", function (index) {
                        return function () {
                            buttonOK.addClass("Active");
                            // (!) Метод classList не работает в IE9-
                            //my.Ranger.Images[index].classList.add("Selected");             // Добавляем класс "Selected" к выделенному
                            //my.Ranger.Images[this.Image].classList.remove("Selected");     // И убираем "Selected" у предыдущего

                            $(my.Ranger.ImagesBig[index]).addClass("Selected");
                            $(my.Ranger.ImagesBig[my.MyShip.ImageIndex]).removeClass("Selected");

                            my.MyShip.ImageIndex = index;
                            my.MyShip.ImageSmall.src = imagePath + "Rangers/ranger" + (index + 1) + ".png";
                            my.MyShip.ImageBig.src = imagePath + "Rangers/Original/ranger" + (index + 1) + ".png";

                            ShowAllParameters(index);
                        }
                    }(i));

                    selectShip.appendChild(my.Ranger.ImagesBig[i]);
                }
            }
            else {
                ShowAllParameters(my.MyShip.ImageIndex);
            }
        });
    }

    function ShowAllParameters(index) {
        var type = $("#SelectShipParameters .Type .Value").eq(0);
        type.text(my.Types.Type[index]);

        var hp = $("#SelectShipParameters .HP .Point");
        ShowParameters(my.Types.HPStart, my.Types.HPLimit, index, hp);

        var speed = $("#SelectShipParameters .Speed .Point");
        ShowParameters(my.Types.SpeedStart, my.Types.SpeedLimit, index, speed);

        var angleSpeed = $("#SelectShipParameters .AngleSpeed .Point");
        ShowParameters(my.Types.AngleSpeedStart, my.Types.AngleSpeedLimit, index, angleSpeed);
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

    // *** Bombs ***
    //var imagePath = "http://" + location.hostname + "/Game/Content/Images/";
    //my.BombHP = data.bombHP;  // Ударная сила бомбы (1 столкновение)
    //my.BombSize = data.bombSize;
    //my.BombSpeed = data.bombSpeed;
    //my.Ranger.BombImages = [];
    //my.Ranger.BombImages[0] = new Image();
    //my.Ranger.BombImages[0].src = imagePath + "Weapons/weapon-bomb02-green.png";
    //my.Dominator.BombImages = [];
    //my.Dominator.BombImages[0] = new Image();
    //my.Dominator.BombImages[0].src = imagePath + "Weapons/weapon-bomb02-blue.png";

    return my;
});
