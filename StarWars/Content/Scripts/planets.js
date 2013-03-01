function Sun(name, size, image) {
    this.Name = name;
    this.Size = size;
    this.CenterX = canvas.width / 2;
    this.CenterY = canvas.height / 2;
    this.Image = image;
    this.Angle = 0;

    this.GetCenterX = function () {
        return canvas.width / 2;
    }
    this.GetCenterY = function () {
        return canvas.height / 2;
    }

    this.Show = function () {
        context.save();
        context.translate(this.CenterX, this.CenterY);
        context.rotate(this.Angle);
        context.drawImage(this.Image, -this.Size / 2, -this.Size / 2);
        context.restore();
    }

    this.Rotate = function () {
        this.Angle += sunRotationAngle;
    }
}

function Planet(name, orbitRadius, orbitAngleStart, moveAngle, planetSize, image) {
    this.Name = name;
    this.OrbitRadius = orbitRadius;
    this.OrbitAngleStart = orbitAngleStart;                 // Regardless of synchronization (and the next step - invoking method GetOrbitAngle) 
    this.MoveAngle = moveAngle;                             // Rotating angle in unit time
    this.PlanetSize = planetSize;                           // haven't used yet - may be later (for colliding with ships)
    this.Image = image;
}

Planet.prototype.GetOrbitAngle = function (dateDelta) {
    this.OrbitAngle = this.OrbitAngleStart + (dateDelta * this.MoveAngle / syncRateSpace); // Start angle value (after synchronizing)
}

Planet.prototype.Show = function () {
    var vx = Math.cos(this.OrbitAngle) * this.OrbitRadius;
    var vy = Math.sin(this.OrbitAngle) * this.OrbitRadius;
    this.X = sun.CenterX + vx - Math.ceil(planetSizeGeneral / 2);
    this.Y = sun.CenterY + vy - Math.ceil(planetSizeGeneral / 2);

    context.drawImage(this.Image, this.X, this.Y);
}

Planet.prototype.Move = function () {
    this.OrbitAngle += this.MoveAngle;
}
