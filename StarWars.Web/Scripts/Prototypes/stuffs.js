define(['Modules/game', 'Modules/space'], function (GAME, SPACE) {
  function Stuff(args) {
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

  Stuff.prototype.GetCenterX = function () {
    return this.X + this.Size / 2 - GAME.SpaceShiftX;
  };

  Stuff.prototype.GetCenterY = function () {
    return this.Y + this.Size / 2 - GAME.SpaceShiftY;
  };

  Stuff.prototype.GetImage = function () {
    return SPACE.Stuff.Images[this.Image];
  };

  Stuff.prototype.Show = function () {
    if (this.RotateAngle === 0) {
      GAME.Context.drawImage(this.GetImage(), this.X - GAME.SpaceShiftX, this.Y - GAME.SpaceShiftY, this.Size, this.Size);
    } else {
      GAME.Context.save();
      GAME.Context.translate(this.GetCenterX(), this.GetCenterY());
      GAME.Context.rotate(this.RotateAngle);
      GAME.Context.drawImage(this.GetImage(), -this.Size / 2, -this.Size / 2);
      GAME.Context.restore();
    }
  };

  return Stuff;
});