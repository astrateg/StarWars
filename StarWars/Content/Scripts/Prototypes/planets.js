// Вариант 1. Расчет координат делать на сервере, а здесь - только показывать (Show)
// Вариант 2. Оставить здесь расчет координат (GetOrbitAngle) и отображение (Show)


// *** Sun ***
function Sun(name, size, image, rotationAngle) {
    this.Name = name;
    this.Size = size;
    this.CenterX = GAME.SpaceWidth / 2 - GAME.SpaceShiftX;
    this.CenterY = GAME.SpaceHeight / 2 - GAME.SpaceShiftY;
    this.Image = image;
    this.AngleStart = 0;
    this.RotationAngle = rotationAngle;
}

Sun.prototype.GetCenter = function () {
    this.CenterX = GAME.SpaceWidth / 2 - GAME.SpaceShiftX;
    this.CenterY = GAME.SpaceHeight / 2 - GAME.SpaceShiftY;
};

Sun.prototype.GetAngle = function (dateDelta) {
    this.Angle = this.AngleStart + (dateDelta * this.RotationAngle / GAME.SyncRate);
};

Sun.prototype.Show = function () {
    GAME.Context.save();
    GAME.Context.translate(this.CenterX, this.CenterY);
    GAME.Context.rotate(this.Angle);
    GAME.Context.drawImage(this.Image, -this.Size / 2, -this.Size / 2);
    GAME.Context.restore();
};

// *** Planet ***
function Planet(name, orbitRadius, orbitAngleStart, moveAngle, planetSize, image) {
    this.Name = name;
    this.OrbitRadius = orbitRadius;
    this.OrbitAngleStart = orbitAngleStart;
    this.MoveAngle = moveAngle;
    this.PlanetSize = planetSize;                           // haven't used yet - may be later (for colliding with ships)
    this.Image = image;
}

Planet.prototype.GetOrbitAngle = function (dateDelta) {
    this.OrbitAngle = this.OrbitAngleStart + (dateDelta * this.MoveAngle / GAME.SyncRate);
};

Planet.prototype.Show = function () {
    var vx = Math.cos(this.OrbitAngle) * this.OrbitRadius;
    var vy = Math.sin(this.OrbitAngle) * this.OrbitRadius;
    this.X = SPACE.Sun.CenterX + vx - Math.ceil(this.PlanetSize / 2);
    this.Y = SPACE.Sun.CenterY + vy - Math.ceil(this.PlanetSize / 2);
    GAME.Context.drawImage(this.Image, this.X, this.Y);
};
