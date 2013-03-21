var SPACE = (function () {
    var my = {};

    // Images for planets
    var imgPlanets = {};
    imgPlanets["sun"] = new Image();
    imgPlanets["earth"] = new Image();
    imgPlanets["mars"] = new Image();
    imgPlanets["jupiter"] = new Image();

    // Objects "Image" are used as properties of the appropriate "Planet" objects (planets.js).
    imgPlanets["sun"].src = GAME.ImagePath + "sun.png";
    imgPlanets["earth"].src = GAME.ImagePath + "earth.png";
    imgPlanets["mars"].src = GAME.ImagePath + "mars.png";
    imgPlanets["jupiter"].src = GAME.ImagePath + "jupiter.png";

    $.ajax({
        url: "http://" + GAME.ServerName + "/game/Home/InitSpace/",
        type: "GET",
        dataType: "json",
        cache: false,
    }).done(function (data) {
        my.Sun = new Sun('sun', data.Sun.Size, imgPlanets["sun"], data.Sun.RotationAngle);
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

    return my;
})();
