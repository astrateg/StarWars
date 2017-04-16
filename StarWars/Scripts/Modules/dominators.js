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


// ***** Initialization *****
var syncRateDominatorBombs = 2000;       // ms

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

    type = SHIP.Dominator.Types.Type[randomIndexType];
    maxHP = SHIP.Dominator.Types.MaxHP[randomIndexType];
    size = SHIP.Dominator.Types.Size[randomIndexType];
    randomAngle = Math.random() * (2 * Math.PI);
    speed = SHIP.Dominator.Types.Speed[randomIndexType];

    // Исправить под новый конструктор Ship
    //dominator = new Ship(
    //    type,
    //    type,
    //    "dominator-" + type,
    //    maxHP,
    //    maxHP,
    //    XStart + randomIndexType * randomIndexImage * 10,
    //    YStart + i * 100,
    //    speed,
    //    randomAngle,
    //    0,      // скорость вращения (пока 0)
    //    size,
    //    randomIndexImage,
    //    "MoveForward",
    //    "Stop",
    //    0
    //);
    //arrDominators.push(dominator);
  }
}

function SynchronizeDominatorShips() {
  var type, indexTyp;
  for (var i = 0; i < arrDominators.length; i++) {
    // Checking state
    var state = arrDominators[i].State;
    if (state === "Inactive" || state.indexOf("Explode") !== -1) {
      continue;
    }

    arrDominators[i].MoveForward();
  }
}

function GenerateDominatorBombs() {
  for (var i = 0; i < arrDominators.length; i++) {
    // Cheching state
    var state = arrDominators[i].State;
    if (state === "Inactive" || state.indexOf("Explode") !== -1) {
      continue;
    }

    var bombX = GetNewBombX(arrDominators[i]);
    var bombY = GetNewBombY(arrDominators[i]);
    var bomb = new Bomb("dominator", bombX, bombY, arrDominators[i].Angle, SHIP.BombSize, 0, SHIP.BombSpeed);
    arrDominators[i].Bombs.push(bomb);
  }
}

//for (i = 0; i < arrDominators.length; i++) {
//    if (arrDominators[i].State == "Inactive") {
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

