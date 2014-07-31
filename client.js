//include client_webrtc.js first

window.capture_image = false;

$(function(){



    navigator.webkitGetUserMedia({audio:true, video:true},
        function(stream){
//        var url = webkitURL.createObjectURL(stream);
//        localVideo.style.opacity = 1; localVideo.src = url;
            window.localStream = stream;
            socket.emit('logined',true);

        },
        function(error){
            console.log("不支持媒体流～ ", error);
        });

    var canvas = document.getElementById('local-track-canvas');
    var context = canvas.getContext('2d');

    var tracker = new tracking.ColorTracker([]);

    tracking.track('#localvid', tracker, { camera: true });

    tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        event.data.forEach(function(rect) {
            if (rect.color === 'cyan') {
                context.strokeStyle = rect.color;
                context.strokeRect(rect.x, rect.y, rect.width, rect.height);
                if(window.capture_image){
                    window.capture_image = false;
                    captureImage( rect.x, rect.y, rect.width, rect.height);
                }
            }
        });
    });

    initGUIControllers(tracker);


    $('.snapshot').click(function () {
       window.capture_image = true;
    });
     $('.localavatar').addClass('pulse');



    mouse_draw(socket);

    socket.on('disconnect', function(data) {
        $('.cursor').css('visibility','hidden');
        remotevid.src = "";
        started = false;
        $('#remotecan')[0].getContext('2d').clearRect(0,0,$( document ).width(),$( document ).height());
        $('#remotehours').html('');
        $('#remotemin').html('');
        $('remoteWeekday').html('');
        $('remoteDate').html('');

    });
//    ticket_capture(ctx,remotectx,trackX, trackY, trackSize);
    date_time();
});
var scale = 4;
var captureImage = function(x, y, width,height) {
    var local_video = document.getElementById("localvid")
    var whole_picture_canvas = document.createElement("canvas");
    whole_picture_canvas.id="aa"
    whole_picture_canvas.width = local_video.videoWidth;
    whole_picture_canvas.height = local_video.videoHeight;
    var context = whole_picture_canvas.getContext('2d');
    context.drawImage(local_video,0,0,whole_picture_canvas.width, whole_picture_canvas.height);

    var captured_canvas = document.createElement("canvas");

    captured_canvas.width=width*2;
    captured_canvas.height = height*2;
    console.log(x,y,width,height);
    var imageData = whole_picture_canvas.getContext('2d').getImageData(x*2, y*2,width*2,height*2);//hack for retina
    captured_canvas.getContext('2d').putImageData(imageData,0,0);

    var img = document.createElement("img");
    var canvasID = 'canvas' + $('canvas').length;
    img.id = canvasID;
    img.src = captured_canvas.toDataURL();
    $('body').prepend(img);
//    $('body').prepend(whole_picture_canvas);
//    $('body').prepend(captured_canvas);

    var $div = $('#note');
    $('#' + canvasID)
        .drag("start", function (ev, dd) {
            dd.limit = $div.offset();
            dd.limit.bottom = dd.limit.top + $div.outerHeight() - $(this).outerHeight();
            dd.limit.right = dd.limit.left + $div.outerWidth() - $(this).outerWidth();
        })
        .drag(function (ev, dd) {
            $(this).css({
                top: Math.min(dd.limit.bottom, Math.max(dd.limit.top, dd.offsetY)),
                left: Math.min(dd.limit.right, Math.max(dd.limit.left, dd.offsetX))
            });
        });
    $('#' + canvasID).css('cursor', 'move');
    $('#' + canvasID).css('position', 'absolute');
    $('#' + canvasID).css('z-index', '998');
    $('#' + canvasID).css('left', ((640 - x*2 - width*2) / 640) * $(document).width() * 0.68 + $(document).width() * 0.28 + 'px');
    $('#' + canvasID).css('top', (y*2 / 480) * $(document).height() * 0.9 + 'px');
    $('#' + canvasID).css('border-radius', '10px');

};



function initGUIControllers(tracker) {
    // GUI Controllers

    var trackedColors = {
        custom: false
    };

    Object.keys(tracking.ColorTracker.knownColors_).forEach(function(color) {
        trackedColors[color] = true;
    });


    var colors = [];

    for (var color in trackedColors) {
        if (trackedColors[color]) {
            colors.push(color);
        }
    }

    tracker.setColors(colors);



}