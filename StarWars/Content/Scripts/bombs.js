function Bomb(type, X, Y, angle, size, image, speed) {
    this.Type = type;
    this.X = X;
    this.Y = Y;
    this.Angle = angle;
    this.Size = size;
    this.Image = image;                     // Объект Image (Image.src - полное имя файла-изображения)
    this.Speed = speed;
    this.Vector = "Move";
    this.Sync = 0;
}

Bomb.prototype.GetImage = function () {
    if (this.Type == "dominator") {            // Выбираем, из какого массива берем изображение бомбы
        return imgDominatorBomb[this.Image];
    }

    return imgRangerBomb[this.Image];
}

Bomb.prototype.Move = function () {
    var vx = Math.cos(this.Angle) * this.Speed;
    var vy = Math.sin(this.Angle) * this.Speed;
    this.X += vx;
    this.Y += vy;
    this.X = Math.round(this.X * 100) / 100;
    this.Y = Math.round(this.Y * 100) / 100;

    // If the bomb reaches any border of the canvas, it disappears
    if ((this.X < -this.Size) || (this.X > canvas.width) || (this.Y < -this.Size) || (this.Y > canvas.height + this.Size)) {
        this.Vector = "Inactive";
    }
}

Bomb.prototype.Show = function () {
    // Don't need to rotate a bomb, because it doesn't make any sense :-)
    context.drawImage(this.GetImage(), this.X, this.Y);
}
