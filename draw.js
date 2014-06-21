
function mouse_draw(socket){
    //**** init canvas   **//
    var canvas1 = $('#paper1');
    $('#paper1').attr('width', $( document ).width()*0.96);
    $('#paper1').attr('height',$( document ).height()*0.84);
    var ctx1 = canvas1[0].getContext('2d');




    var id = Math.round($.now() * Math.random()); // Generate a unique ID

    var lineColor = 'rgb(242,198,23)';
    var lineWidth = 2;
    var eraserSelected = false;

    var drawing = false; // A flag for drawing activity
    var clients = {};
    var sign = {};
    var prev = {}; // Previous coordinates container
    var lastEmit = $.now();
    var erase = false;

    $('.color1').addClass('selected');
    $('.light').addClass('selected');
    $('.light').addClass('fadeIn');



    $('.light').click(function (){
        eraserSelected = false;
        lineWidth = 2;
        $('.menu').children().removeClass('selected');
        $('.menu').children().removeClass('fadeIn');
        $(this).addClass('selected');
        $(this).addClass('fadeIn');
    });

    $('.medium').click(function (){
        eraserSelected = false;
        lineWidth = 4;
        $('.menu').children().removeClass('selected');
        $('.menu').children().removeClass('fadeIn');
        $(this).addClass('selected');
        $(this).addClass('fadeIn');
    });

    $('.heavy').click(function (){
        eraserSelected = false;
        lineWidth = 6;
        $('.menu').children().removeClass('selected');
        $('.menu').children().removeClass('fadeIn');
        $(this).addClass('selected');
        $(this).addClass('fadeIn');
    });


    $('.eraser').click(function() {
        eraserSelected = true;
        $('.menu').children().removeClass('selected');
        $('.menu').children().removeClass('fadeIn');
        $(this).addClass('selected');
        $(this).addClass('fadeIn');
    });




    $('.print').click(function () {
        window.print();
    });



    $('.clearscreen').click(function() {
        ctx1.clearRect(0, 0, $( document ).width(), $( document ).height());
        var canvas2 = $('#paper');
        var ctx2 = canvas2[0].getContext('2d');
        ctx2.clearRect(0, 0, $( document ).width(), $( document ).height());
    });




    $('.color').children().click(function() {
        $('.color').children().removeClass('selected');
        $(this).addClass('selected');
        lineColor = $(this).css('background-color');
    });
    // init over

    //** mouse draw **//
    function drawLine(ctx, lineWidth, color, fromx, fromy, tox, toy)
    {
        ctx.beginPath();
        ctx.moveTo(fromx, fromy);
        ctx.lineTo(tox, toy);
        ctx.lineWidth = lineWidth;
        ctx.strokeStyle = color;
        ctx.lineCap = 'round';
        ctx.stroke();
    }


    // On mouse down
    canvas1.on('mousedown', function(e) {
        e.preventDefault();
        if (eraserSelected) {
            drawing = false;
            erase = true;
        }else{
            drawing = true;
            erase = false;
        }
        prev.x = e.pageX;
        prev.y = e.pageY;
    });

    // On touch start
    canvas1.on('touchstart', function(e) {
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
        if (eraserSelected) {
            drawing = false;
            erase = true;
        }else{
            drawing = true;
            erase = false;
        }
        prev.x = touch.pageX;
        prev.y = touch.pageY;
    });

    // On mouse move
    canvas1.on('mousemove', function(e) {
        // Emit the event to the server
        // if ($.now() - lastEmit > 30)
        // {
        socket.emit('mousemove', {
            'x': e.pageX/$('#paper1').width(),
            'y': e.pageY/$('#paper1').height(),
            'touch': false,
            'drawing': drawing,
            'id': id,
            'lineColor': lineColor,
            'lineWidth': lineWidth
        });
        lastEmit = $.now();
        // }

        // Draw a line for the current user's movement
        if (drawing)
        {
            drawLine(ctx1, lineWidth, lineColor, prev.x, prev.y, e.pageX, e.pageY);
            prev.x = e.pageX;
            prev.y = e.pageY;
        }

        if(erase)
        {
            ctx1.clearRect(e.pageX,e.pageY,3*lineWidth,3*lineWidth);
        }
    });

    // On touch move
    canvas1.on('touchmove', function(e) {
        e.preventDefault();
        var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];

        // Emit the event to the server
        // if ($.now() - lastEmit > 10)
        // {
        socket.emit('touchmove', {
            'x': touch.pageX/$('#paper1').width(),
            'y': touch.pageY/$('#paper1').height(),
            'startX': prev.x/$('#paper1').width(),
            'startY': prev.y/$('#paper1').height(),
            'touch': true,
            'drawing': drawing,
            'id': id,
            'lineColor': lineColor,
            'lineWidth': lineWidth
        });
        lastEmit = $.now();
        // }

        // Draw a line for the current user's movement
        if (drawing)
        {
            drawLine(ctx1, lineWidth, lineColor, prev.x, prev.y, touch.pageX, touch.pageY);
            prev.x = touch.pageX;
            prev.y = touch.pageY;
        }
        if(erase)
        {
            ctx1.clearRect(touch.pageX,touch.pageY,3*lineWidth,3*lineWidth);
        }
    });

    // On mouse up
    canvas1.on('mouseup mouseleave', function(e) {
        drawing = false;
        erase = false;
    });

    // On touch end
    canvas1.on('touchend touchleave touchcancel', function(e) {
        drawing = false;
        erase = false;
    });
    //local mouse move

    // remote mouse move
    // Keep users screen up to date with other users cursors & lines
    socket.on('mousemoving', function (data) {


        // Create cursor
        if ( !(data.id in clients) )
        {
            sign[data.id] = $('<div class="cursor">').appendTo('.sign');
        }

        // Move cursor
        sign[data.id].css({
            'left' : data.x*$('#paper1').width(), //因为pad和pc屏幕不一样，所以用百分比通信
            'top' : data.y*$('#paper1').height()
        });



        // Show drawing
        if (data.drawing && clients[data.id])
        {
            // clients[data.id] holds the previous position of this user's mouse pointer
            drawLine(ctx1, data.lineWidth, data.lineColor, clients[data.id].x*$('#paper1').width(), clients[data.id].y*$('#paper1').height(), data.x*$('#paper1').width(), data.y*$('#paper1').height());
        }

        // Save state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });


    socket.on('touchmoving', function (data) {
        // Create cursor
        if ( !(data.id in clients) )
        {
            sign[data.id] = $('<div class="hand">').appendTo('.sign');
        }

        // Move cursor
        sign[data.id].css({
            'left' : data.x*$('#paper1').width(),
            'top' : data.y*$('#paper1').height()
        });

        // Set the starting point to where the user first touched
        if (data.drawing && clients[data.id] && data.touch)
        {
            clients[data.id].x = data.startX*$('#paper1').width();
            clients[data.id].y = data.startY*$('#paper1').height();
        }

        // Show drawing
        if (data.drawing && clients[data.id])
        {
            // clients[data.id] holds the previous position of this user's mouse pointer
            drawLine(ctx1, data.lineWidth, data.lineColor, clients[data.id].x, clients[data.id].y, data.x*$('#paper1').width(), data.y*$('#paper1').height());
        }

        // Save state
        clients[data.id] = data;
        clients[data.id].updated = $.now();
    });
    //remote mouse move over
}