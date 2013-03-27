define(['Modules/game', 'Modules/ship'], function (GAME, SHIP) {
    function Ship(args) {
        this.ID = args.ID;
        this.Name = args.Name;
        this.Type = args.Type;
        this.State = args.State;
        this.HP = args.HP;
        this.MaxHP = args.HPCurrent * SHIP.HPMult;
        this.X = args.X;
        this.Y = args.Y;
        //this.Speed = speed;
        this.Angle = args.Angle;
        //this.AngleSpeed = angleSpeed;
        this.Size = args.Size;
        this.Image = args.Image;                     // Индекс имени файла-изображения (для массива imgShipShortName)
        //this.VectorMove = vectorMove;
        //this.VectorRotate = vectorRotate;
        //this.Delay = delay || 0;
        //this.Shoot = shoot || 0;
        this.Kill = args.Kill || 0;
        this.Death = args.Death || 0;
        this.Bombs = [];
    }

    Ship.prototype.GetImage = function () {
        //var type = this.Type;
        //if (type.indexOf("dominator") != -1) {  // "dominator-smersh", "dominator-menok", "dominator-urgant", "dominator-ekventor"
        //    type = type.slice(10);               // "smersh", "menok", "urgant", "ekventor"
        //    var indexType = SHIP.DominatorTypes.Type.indexOf(type);
        //    return SHIP.DominatorTypes.Images[indexType][this.Image];
        //}

        return SHIP.Ranger.ImagesSmall[this.Image];
    };

    // *** Отработка движения корабля в случае, если очередной запрос не вернулся с сервера ***
    //Ship.prototype.RotateCCW = function (angle) {
    //    this.Angle -= angle;
    //    this.Angle = Math.round(this.Angle * 100) / 100; // Округление до 2 знаков
    //};

    //Ship.prototype.RotateCW = function (angle) {
    //    this.Angle += angle;
    //    this.Angle = Math.round(this.Angle * 100) / 100;
    //};

    //Ship.prototype.MoveForward = function () {
    //    var vx = Math.cos(this.Angle) * this.Speed;
    //    var vy = Math.sin(this.Angle) * this.Speed;
    //    this.X += vx;
    //    this.Y += vy;
    //    this.X = Math.round(this.X * 100) / 100;
    //    this.Y = Math.round(this.Y * 100) / 100;
    //    //this.CheckReappear();   // If the ship reaches any border of the GAME, it appears on the opposite side of the GAME
    //};

    //Ship.prototype.MoveBackward = function () {
    //    var vx = Math.cos(this.Angle) * this.Speed;
    //    var vy = Math.sin(this.Angle) * this.Speed;
    //    this.X -= vx;
    //    this.Y -= vy;
    //    this.X = Math.round(this.X * 100) / 100;
    //    this.Y = Math.round(this.Y * 100) / 100;
    //    //this.CheckReappear();
    //};
    // ***

    //Ship.prototype.CheckReappear = function () {
    //    if (this.X < - this.Size / 2)
    //        this.X = GAME.Canvas.width - this.Size / 2;
    //    if (this.X > GAME.Canvas.width - this.Size / 2)
    //        this.X = -this.Size / 2;
    //    if (this.Y < -this.Size / 2)
    //        this.Y = GAME.Canvas.height - this.Size / 2;
    //    if (this.Y > GAME.Canvas.height - this.Size / 2)
    //        this.Y = -this.Size / 2;
    //};

    Ship.prototype.GetCenterX = function () {
        return this.X + this.Size / 2 - GAME.SpaceShiftX;
    };

    Ship.prototype.GetCenterY = function () {
        return this.Y + this.Size / 2 - GAME.SpaceShiftY;
    };

    Ship.prototype.Show = function () {
        var state = this.State;
        if (state == "Inactive") {
            return;
        }

        if (state.indexOf("Explode") != -1) {   // Например, Explode01 (X = 1, Y = 0)
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

        if (this.Type.indexOf("dominator") != -1) {
            GAME.Context.strokeStyle = "#00BBFF";
            GAME.Context.fillStyle = "#00BBFF";
        }
        else {
            GAME.Context.strokeStyle = "#00BB00";
            GAME.Context.fillStyle = "#00BB00";
        }

        if (this.ID == SHIP.MyShip.ID) {    // Если наш корабль - подсвечиваем его
            if (state.indexOf("Start") != -1) { // Если reloading - то сначала концентрические круги
                var step = parseInt(state.slice(5));
                //GAME.Context.arc(centerShipX, centerShipY, this.Size * (20 - step) / 10, 0, 2 * Math.PI, false);
                GAME.Context.beginPath();
                GAME.Context.arc(centerShipX, centerShipY, this.Size * (25 - step) / 5, 0, 2 * Math.PI);      // arc(x, y, radius, startAngle, endAngle, CCW)
                GAME.Context.closePath();
                GAME.Context.fill();
            }
            else {
                GAME.Context.beginPath();
                GAME.Context.arc(centerShipX, centerShipY, this.Size * 0.8, -Math.PI / 4, -3 * Math.PI / 4, true);      // arc(x, y, radius, startAngle, endAngle)
                GAME.Context.arc(centerShipX, centerShipY, this.Size * 0.75, -3 * Math.PI / 4, -Math.PI / 4);
                GAME.Context.closePath();
                GAME.Context.fill();
            }

            // Обновили полосу HP на панели Sidebar
            var currentShipHPValue = document.getElementById('CurrentShipHPValue');
            currentShipHPValue.style.width = (this.HP / this.MaxHP) * 124 + "px";    // 124 = 128 - 2 - 2 (размер рисунка с кораблем минус границы 2px)

            if (this.HP <= (this.MaxHP / 4)) {
                GAME.Context.fillStyle = "#FF0000";
                currentShipHPValue.style.backgroundColor = "#FF0000";
            } else if (this.HP <= (this.MaxHP / 2)) {
                GAME.Context.fillStyle = "#FFBB00";
                currentShipHPValue.style.backgroundColor = "#FFBB00";
            } else {
                currentShipHPValue.style.backgroundColor = "#00BB00";
            }
        }

        GAME.Context.strokeRect(centerShipX - this.Size / 2, centerShipY + this.Size / 2, this.Size, 5);    // fillRect(x, y, width, height)
        GAME.Context.fillRect(centerShipX - this.Size / 2, centerShipY + this.Size / 2, lineHP, 5);         // fillRect(x, y, width, height)


        if (this.Angle == 0) {
            GAME.Context.drawImage(this.GetImage(), this.X, this.Y);
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