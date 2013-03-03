function Ship(name, X, Y, angle, size, image, imageNameIndex, vectorMove, vectorRotate, delay) {
    this.Name = name;
    this.X = X;
    this.Y = Y;
    this.Angle = angle;
    this.Size = size;
    this.Image = image;                     // Объект Image (Image.src - полное имя файла-изображения)
    this.ImageNameIndex = imageNameIndex;   // Индекс имени файла-изображения (для массива imgShipShortName)
    this.VectorMove = vectorMove;
    this.VectorRotate = vectorRotate;
    this.Delay = delay;
}

Ship.prototype.RotateCCW = function (angle) {
    this.Angle -= angle;
    this.Angle = Math.round(this.Angle * 100) / 100; // Округление до 2 знаков
    context.save();
    context.translate(this.X + this.Size / 2, this.Y + this.Size / 2);
    context.rotate(this.Angle);
    context.drawImage(this.Image, -this.Size / 2, -this.Size / 2);
    context.restore();
}

Ship.prototype.RotateCW = function (angle) {
    this.Angle += angle;
    this.Angle = Math.round(this.Angle * 100) / 100;
    context.save();
    context.translate(this.X + this.Size / 2, this.Y + this.Size / 2);
    context.rotate(this.Angle);
    context.drawImage(this.Image, -this.Size / 2, -this.Size / 2);
    context.restore();
}

Ship.prototype.MoveForward = function (speed) {
    var vx = Math.cos(this.Angle) * speed;
    var vy = Math.sin(this.Angle) * speed;
    this.X += vx;
    this.Y += vy;
    this.X = Math.round(this.X * 100) / 100;
    this.Y = Math.round(this.Y * 100) / 100;
    this.CheckReappear();   // If the ship reaches any border of the canvas, it appears on the opposite side of the canvas
}

Ship.prototype.MoveBackward = function (speed) {
    var vx = Math.cos(this.Angle) * speed;
    var vy = Math.sin(this.Angle) * speed;
    this.X -= vx;
    this.Y -= vy;
    this.X = Math.round(this.X * 100) / 100;
    this.Y = Math.round(this.Y * 100) / 100;
    this.CheckReappear();
}

Ship.prototype.CheckReappear = function () {
    if (this.X < -this.Size)
        this.X = canvas.width;
    if (this.X > canvas.width)
        this.X = -this.Size;
    if (this.Y < -this.Size)
        this.Y = canvas.height + this.Size;
    if (this.Y > canvas.height + this.Size)
        this.Y = -this.Size;
}

Ship.prototype.GetCenterX = function () {
    return this.X + this.Size / 2;
}

Ship.prototype.GetCenterY = function () {
    return this.Y + this.Size / 2;
}

Ship.prototype.Show = function () {
    var state = this.VectorMove;
    if (state == "Inactive") {
        return;
    }

    if (state.indexOf("Explode") != -1) {   // Например, Explode01 (X = 1, Y = 0)
        var explodeX = state[8];
        var explodeY = state[7];
        var canvasX = this.GetCenterX() - imgExplosionStepX / 2;
        var canvasY = this.GetCenterY() - imgExplosionStepY / 2;
        context.drawImage(imgExplosion,
            imgExplosionStepX * explodeX, imgExplosionStepY * explodeY, imgExplosionStepX, imgExplosionStepY,
            canvasX, canvasY, imgExplosionStepX, imgExplosionStepY);

        return;
    }

    if (this.Angle == 0) {
        context.drawImage(this.Image, this.X, this.Y);
    } else {
        // If Angle <> 0, have to rotate the ship ("Angle" - direction for moving & shooting)
        context.save();
        context.translate(this.GetCenterX(), this.GetCenterY());
        context.rotate(this.Angle);
        context.drawImage(this.Image, -this.Size / 2, -this.Size / 2);
        context.restore();
    }
}
