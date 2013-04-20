define(['Modules/requests', 'Modules/game'], function (REQUESTS, GAME) {

    // Images for planets
    var my = {};
    var imgPlanets = {};
    imgPlanets["sun"] = new Image();
    imgPlanets["earth"] = new Image();
    imgPlanets["mars"] = new Image();
    imgPlanets["jupiter"] = new Image();

    // Objects "Image" are used as properties of the appropriate "Planet" objects (planets.js).
    var imagePath = "http://" + location.hostname + "/Game/Content/Images/";

    imgPlanets["sun"].src = imagePath + "sun.png";
    imgPlanets["earth"].src = imagePath + "earth.png";
    imgPlanets["mars"].src = imagePath + "mars.png";
    imgPlanets["jupiter"].src = imagePath + "jupiter.png";

    my.Stuff = {};
    my.Stuff.Stuffs = [];
    my.Stuff.Images = [];
    my.Stuff.Images[0] = new Image();
    my.Stuff.Images[0].src = imagePath + "Stuff/bonusHP.png";
    my.Stuff.Images[1] = new Image();
    my.Stuff.Images[1].src = imagePath + "Stuff/bonusMP.png";


    my.Init = function () {
        var request = REQUESTS.InitSpace();

        request.done(function (data) {
            my.Sun = new Sun('sun', data.Sun.Size, imgPlanets["sun"], data.Sun.Angle);
            my.Planets = [];

            for (var i = 0; i < data.Planets.length; i++) {
                var planetName = data.Planets[i].Name;
                var planet = new Planet(
                    planetName,
                    data.Planets[i].OrbitRadius,
                    data.Planets[i].OrbitAngleStart,
                    data.Planets[i].MoveAngle,
                    data.Planets[i].Size,
                    imgPlanets[planetName]
                );
                my.Planets.push(planet);
            }
        });
    }

    // *** Sun prototype ***
    function Sun(name, size, image, angle) {
        this.Name = name;
        this.Size = size;
        this.CenterX = GAME.SpaceWidth / 2 - GAME.SpaceShiftX;
        this.CenterY = GAME.SpaceHeight / 2 - GAME.SpaceShiftY;
        this.Image = image;
        this.Angle = angle;
    }

    Sun.prototype.GetCenter = function () {
        this.CenterX = GAME.SpaceWidth / 2 - GAME.SpaceShiftX;
        this.CenterY = GAME.SpaceHeight / 2 - GAME.SpaceShiftY;
    };

    Sun.prototype.Show = function () {
        GAME.Context.save();
        GAME.Context.translate(this.CenterX, this.CenterY);
        GAME.Context.rotate(this.Angle);
        GAME.Context.drawImage(this.Image, -this.Size / 2, -this.Size / 2);
        GAME.Context.restore();
    };

    // *** Planet prototype ***
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
        this.X = my.Sun.CenterX + vx - Math.ceil(this.PlanetSize / 2);
        this.Y = my.Sun.CenterY + vy - Math.ceil(this.PlanetSize / 2);
        GAME.Context.drawImage(this.Image, this.X, this.Y);
    };


    return my;
});

