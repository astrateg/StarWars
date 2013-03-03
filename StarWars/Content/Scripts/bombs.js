function Bomb(name, X, Y, angle, size, image, speed) {
    this.Name = name;
    this.X = X;
    this.Y = Y;
    this.Angle = angle;
    this.Size = size;
    this.Image = image;                     // Объект Image (Image.src - полное имя файла-изображения)
    this.Speed = speed;
    this.Vector = "Move";
}

Bomb.prototype.Move = function () {
    var vx = Math.cos(this.Angle) * this.Speed;
    var vy = Math.sin(this.Angle) * this.Speed;
    this.X += vx;
    this.Y += vy;
    this.X = Math.round(this.X * 100) / 100;
    this.Y = Math.round(this.Y * 100) / 100;
    this.CheckDisappear();   // If the bomb reaches any border of the canvas, it disappears
}

Bomb.prototype.CheckDisappear = function () {
    if ( (this.X < -this.Size) || (this.X > canvas.width) || (this.Y < -this.Size) || (this.Y > canvas.height + this.Size) ) {
        this.Vector = "Inactive";
    }
}

Bomb.prototype.Show = function () {
    // Don't need to rotate a bomb, because it doesn't make any sense :-)
    context.drawImage(this.Image, this.X, this.Y);
}
