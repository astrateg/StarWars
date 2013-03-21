var GAME = (function () {
    var my = {};
    my.ServerName = $('body').attr('data-server');
    my.ImagePath = "http://" + my.ServerName + "/Game/Content/Images/";
    my.SyncRate = 16;
    my.IntervalID = 0;    // для setInterval
    //my.TimeoutID = 0;       // для setTimeout

    var totalWidth = document.documentElement.clientWidth;
    var totalHeight = document.documentElement.clientHeight;

    my.SidebarWidth = 225;
    my.Sidebar = document.createElement('div');
    my.Sidebar.id = "Sidebar";
    my.Sidebar.style.width = my.SidebarWidth + "px";
    my.Sidebar.style.height = totalHeight + "px";
    my.Sidebar.style.cssFloat = "left";
    my.Sidebar.style.backgroundColor = "grey";
    document.body.appendChild(my.Sidebar);

    my.Statistics = {};

    my.SpaceWidth = 2560;   // ширина космоса
    my.SpaceHeight = 1600;  // высота космоса
    my.SpaceShiftX = my.SidebarWidth;   // сдвиг по X
    my.SpaceShiftY = 0;                 // сдвиг по Y

    my.Body = $('body').eq(0);  // eq(0) - это замена [0] (чтобы можно было вызывать метод jQuery css - иначе будет элемент DOM вместо объекта jQuery)

    var backPositionX = my.SidebarWidth;
    var backPositionY = 0;
    var backPosition = backPositionX + "px " + backPositionY + "px";
    my.Body.css('background-position', backPosition);

    my.Canvas = document.createElement('canvas');
    my.Canvas.width = totalWidth - my.SidebarWidth;
    my.Canvas.height = totalHeight;

    my.Context = my.Canvas.getContext('2d');
    document.body.appendChild(my.Canvas);

    return my;
})();
