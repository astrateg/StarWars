define(['Modules/game', 'Modules/ship'], function (GAME, SHIP) {
    function Bomb(args) {
        this.Type = args.Type;
        this.X = args.X;
        this.Y = args.Y;
        this.Angle = args.Angle;
        this.Size = args.Size;
        this.Image = args.Image;                     // Объект Image (Image.src - полное имя файла-изображения)
        this.Speed = args.Speed;
        this.State = args.State;
    }

    Bomb.prototype.GetImage = function () {
        return SHIP.Bomb.Images[this.Image];
    };

    Bomb.prototype.Show = function () {
        GAME.Context.drawImage(this.GetImage(), this.X - GAME.SpaceShiftX, this.Y - GAME.SpaceShiftY);
    };

    return Bomb;
});