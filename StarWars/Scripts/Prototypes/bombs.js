define(['Modules/game', 'Modules/ship'], function (GAME, SHIP) {
    function Bomb(args) {
        this.Type = args.Type;
        this.X = args.X;
        this.Y = args.Y;
        this.Angle = args.Angle;
        this.RotateAngle = args.RotateAngle;
        this.Size = args.Size;
        this.Image = args.Image;                     // Объект Image (Image.src - полное имя файла-изображения)
        this.Speed = args.Speed;
        this.State = args.State;
    }

    Bomb.prototype.GetCenterX = function () {
        return this.X + this.Size / 2 - GAME.SpaceShiftX;
    };

    Bomb.prototype.GetCenterY = function () {
        return this.Y + this.Size / 2 - GAME.SpaceShiftY;
    };

    Bomb.prototype.GetImage = function () {
        return SHIP.Bomb.Images[this.Image];
    };

    Bomb.prototype.Show = function () {
        if (this.RotateAngle == 0) {
            GAME.Context.drawImage(this.GetImage(), this.X - GAME.SpaceShiftX, this.Y - GAME.SpaceShiftY);
        } else {
            GAME.Context.save();
            GAME.Context.translate(this.GetCenterX(), this.GetCenterY());
            GAME.Context.rotate(this.RotateAngle);
            GAME.Context.drawImage(this.GetImage(), -this.Size / 2, -this.Size / 2);
            GAME.Context.restore();
        }
    };

    return Bomb;
});