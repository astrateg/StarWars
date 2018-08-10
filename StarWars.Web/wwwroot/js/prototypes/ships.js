define(['modules/game', 'modules/ship'], function (GAME, SHIP) {
  function Ship(args) {
    this.ID = args.ID;
    this.Name = args.Name;
    this.Type = args.Type;
    this.State = args.State;
    this.HP = args.HP;
    this.MaxHP = args.HPCurrent * SHIP.HPMult;
    this.MP = args.MP;
    this.MaxMP = args.MPCurrent * SHIP.MPMult;
    this.X = args.X;
    this.Y = args.Y;
    this.Speed = args.Speed;
    this.SpeedCurrent = args.SpeedCurrent;
    this.Angle = args.Angle;
    this.AngleSpeed = args.AngleSpeed;
    this.Size = args.Size;
    this.Image = args.Image;                     // Индекс имени файла-изображения (для массива imgShipShortName)
    //this.VectorMove = vectorMove;
    //this.VectorRotate = vectorRotate;
    //this.Delay = delay || 0;
    //this.Shoot = shoot || 0;
    this.Stealth = args.Stealth;
    this.Kill = args.Kill || 0;
    this.Death = args.Death || 0;
    this.SkillPoints = args.SkillPoints || 0;
    this.Bombs = [];
  }

  Ship.prototype.GetImage = function () {
    var type = this.Type;
    if (type === "dominator") {
      // Name example: "dominator-smersh123"
      var dominatorType = this.Name.slice(10, -3);
      var indexType = SHIP.Dominator.Types.indexOf(dominatorType);
      var image = SHIP.Dominator.ImagesSmall[indexType][this.Image];
      if (!image) {
        debugger;
      }
      return image;
    }

    return SHIP.Ranger.ImagesSmall[this.Image];
  };

  Ship.prototype.GetCenterX = function () {
    return this.X + this.Size / 2 - GAME.SpaceShiftX;
  };

  Ship.prototype.GetCenterY = function () {
    return this.Y + this.Size / 2 - GAME.SpaceShiftY;
  };

  Ship.prototype.Show = function () {
    var state = this.State;
    if (state === "Inactive") {
      return;
    }

    if (state.indexOf("Explode") !== -1) {   // Например, Explode01 (X = 1, Y = 0)
      var explodeX = state[8];
      var explodeY = state[7];
      var explodeStepX = GAME.Explosion.imgExplosionStepX;
      var explodeStepY = GAME.Explosion.imgExplosionStepY;
      var canvasX = this.GetCenterX() - explodeStepX / 2;
      var canvasY = this.GetCenterY() - explodeStepY / 2;
      GAME.Context.drawImage(GAME.Explosion.imgExplosion,
        explodeStepX * explodeX, explodeStepY * explodeY, explodeStepX, explodeStepY,
        canvasX, canvasY, explodeStepX, explodeStepY);

      return;
    }

    var centerShipX = this.GetCenterX();
    var centerShipY = this.GetCenterY();

    var lineHP = (this.HP / this.MaxHP) * this.Size;
    var lineMP = (this.MP / this.MaxMP) * this.Size;

    var color = {
      myShipCircle: this.Stealth === 0 ? "rgba(0, 200, 0, 0.3)" : "rgba(200, 200, 200, 0.3)",
      allShipHPFull: "#00BB00",
      allShipHPMid: "#FFBB00",
      allShipHPEmpty: "#FF0000",
      allShipMP: "#0000BB"
    };

    if (this.ID === SHIP.MyShip.ID) {    // Если наш корабль - подсвечиваем его
      GAME.Context.strokeStyle = color.myShipCircle;
      GAME.Context.fillStyle = color.myShipCircle;

      GAME.Context.beginPath();
      GAME.Context.arc(centerShipX, centerShipY, this.Size, 0, 2 * Math.PI, true);      // arc(x, y, radius, startAngle, endAngle)
      //GAME.Context.arc(centerShipX, centerShipY, this.Size * 0.75, -3 * Math.PI / 4, -Math.PI / 4);
      GAME.Context.closePath();
      GAME.Context.fill();

      // (Проблема кроссбраузерности: свойство innerText отсутствует в Firefox. Поэтому используем jQuery!)
      // Обновили полосу HP на панели Sidebar
      var currentShipHPValue = $('#CurrentShipHPValue');
      currentShipHPValue.text(Math.round(this.HP));
      currentShipHPValue.css("width", (this.HP / this.MaxHP) * 124 + "px");    // 124 = 128 - 2 - 2 (размер рисунка с кораблем минус границы 2px)
      // Обновили полосу MP на панели Sidebar
      var currentShipMPValue = $('#CurrentShipMPValue');
      currentShipMPValue.text(Math.round(this.MP));
      currentShipMPValue.css("width", (this.MP / this.MaxMP) * 124 + "px");    // 124 = 128 - 2 - 2 (размер рисунка с кораблем минус границы 2px)
      currentShipMPValue.css("backgroundColor", color.allShipMP);
      // Цвет полосы HP на панели Sidebar зависит от количества HP
      if (this.HP <= (this.MaxHP / 4)) {
        GAME.Context.fillStyle = color.allShipHPEmpty;
        currentShipHPValue.css("backgroundColor", color.allShipHPEmpty);
      } else if (this.HP <= (this.MaxHP / 2)) {
        GAME.Context.fillStyle = color.allShipHPMid;
        currentShipHPValue.css("backgroundColor", color.allShipHPMid);
      } else {
        currentShipHPValue.css("backgroundColor", color.allShipHPFull);
      }

      // Обновили полосу скорости на панели Sidebar
      var speed = Math.round(this.Speed * 100) / 100;
      $("#CurrentShipSpeedTitle").text(speed);

      var scale = this.SpeedCurrent / 5;	// 5 - количество клеток для скорости на Sidebar
      var points = this.Speed / scale;	// сколько клеток подсвечивать

      var currentShipSpeedPositive = $("#CurrentShipSpeedPositiveValue .Square");						// порядок перебора: 0..4 (прямой)
      var currentShipSpeedNegative = $($("#CurrentShipSpeedNegativeValue .Square").get().reverse());	// порядок перебора: 4..0 (обратный)
      // Если скорость около 0
      if (Math.round(this.Speed * 1000) === 0) {
        currentShipSpeedPositive.eq(0).css("backgroundColor", "transparent");
        currentShipSpeedNegative.eq(0).css("backgroundColor", "transparent");
      }
        // Если скорость > 0
      else if (this.Speed > 0) {
        currentShipSpeedNegative.eq(0).css("backgroundColor", "transparent");
        jQuery.each(currentShipSpeedPositive, function (index, value) {
          if (index < points) {
            $(value).css("backgroundColor", "green");
          }
          else {
            $(value).css("backgroundColor", "transparent");
          }
        });
      }
        // Если скорость < 0
      else if (this.Speed < 0) {
        currentShipSpeedPositive.eq(0).css("backgroundColor", "transparent");
        jQuery.each(currentShipSpeedNegative, function (index, value) {
          if (-index > points) {
            $(value).css("backgroundColor", "orange");
          }
          else {
            $(value).css("backgroundColor", "transparent");
          }
        });
      }
    }
      // Показываем имена остальных игроков
    else {
      if (this.Stealth === 1) {
        return;
      }

      GAME.Context.fillStyle = "#FFF";
      GAME.Context.font = "12pt Arial";
      GAME.Context.textAlign = "center";
      GAME.Context.fillText(this.Name, this.GetCenterX(), this.GetCenterY() - this.Size / 2);
    }

    var lineHeight = 5;
    // Обновили полосу HP для каждого корабля на карте
    GAME.Context.strokeStyle = color.allShipHPFull;
    GAME.Context.fillStyle = color.allShipHPFull;
    GAME.Context.strokeRect(centerShipX - this.Size / 2, centerShipY + this.Size / 2, this.Size, lineHeight);    // fillRect(x, y, width, height)
    GAME.Context.fillRect(centerShipX - this.Size / 2, centerShipY + this.Size / 2, lineHP, lineHeight);         // fillRect(x, y, width, height)

    // Обновили полосу MP для каждого корабля на карте
    GAME.Context.strokeStyle = color.allShipMP;
    GAME.Context.fillStyle = color.allShipMP;
    GAME.Context.strokeRect(centerShipX - this.Size / 2, centerShipY + this.Size / 2 + lineHeight, this.Size, lineHeight);    // fillRect(x, y, width, height)
    GAME.Context.fillRect(centerShipX - this.Size / 2, centerShipY + this.Size / 2 + lineHeight, lineMP, lineHeight);         // fillRect(x, y, width, height)

    if (this.Angle === 0) {
      GAME.Context.drawImage(this.GetImage(), this.X - GAME.SpaceShiftX, this.Y - GAME.SpaceShiftY);
    } else {
      // If Angle <> 0, have to rotate the ship ("Angle" - direction for moving & shooting)
      GAME.Context.save();
      GAME.Context.translate(centerShipX, centerShipY);
      GAME.Context.rotate(this.Angle);
      GAME.Context.drawImage(this.GetImage(), -this.Size / 2, -this.Size / 2);
      GAME.Context.restore();
    }
  };

  return Ship;
});