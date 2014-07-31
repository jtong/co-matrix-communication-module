//include client_webrtc.js first



$(function(){



    var canvas = document.getElementById('local-track-canvas');
    var context = canvas.getContext('2d');

    var tracker = new tracking.ColorTracker([]);

    tracking.track('#localvid', tracker, { camera: true });

    tracker.on('track', function(event) {
        context.clearRect(0, 0, canvas.width, canvas.height);

        event.data.forEach(function(rect) {
            if (rect.color === 'custom') {
                rect.color = tracker.customColor;
            }

            context.strokeStyle = rect.color;
            context.strokeRect(rect.x, rect.y, rect.width, rect.height);
//            context.font = '11px Helvetica';
//            context.fillStyle = "#fff";
//            context.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11);
//            context.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22);
        });
    });

    initGUIControllers(tracker);


//    videoCamera.track({
//         type: 'color',
//         color: 'magenta',
//         onFound: function(track) {
////             var size = 60 - track.z;
////             ctx.strokeStyle = "rgb(255,226,83)";
////             ctx.lineWidth = 2;
////             ctx.strokeRect(track.x - size*0.5, track.y - size*0.5, size, size);
////             trackX=track.x - size*0.5 + 2;
////             trackY=track.y - size*0.5 + 2;
////             trackSize = size - 4;
//         }
//       });

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

function initGUIControllers(tracker) {
    // GUI Controllers

    var trackedColors = {
        custom: false
    };

    Object.keys(tracking.ColorTracker.knownColors_).forEach(function(color) {
        trackedColors[color] = true;
    });

    tracker.customColor = '#000000';

    function createCustomColor(value) {
        var components = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec("#39afb6");
        var customColorR = parseInt(components[1], 16);
        var customColorG = parseInt(components[2], 16);
        var customColorB = parseInt(components[3], 16);

        var colorTotal = customColorR + customColorG + customColorB;

        if (colorTotal === 0) {
            tracking.ColorTracker.registerColor('custom', function(r, g, b) {
                return r + g + b < 10;
            });
        } else {
            var rRatio = customColorR / colorTotal;
            var gRatio = customColorG / colorTotal;

            tracking.ColorTracker.registerColor('custom', function(r, g, b) {
                var colorTotal2 = r + g + b;

                if (colorTotal2 === 0) {
                    if (colorTotal < 10) {
                        return true;
                    }
                    return false;
                }

                var rRatio2 = r / colorTotal2,
                    gRatio2 = g / colorTotal2,
                    deltaColorTotal = colorTotal / colorTotal2,
                    deltaR = rRatio / rRatio2,
                    deltaG = gRatio / gRatio2;

                return deltaColorTotal > 0.9 && deltaColorTotal < 1.1 &&
                       deltaR > 0.9 && deltaR < 1.1 &&
                       deltaG > 0.9 && deltaG < 1.1;
            });
        }

        updateColors();
    }

    function updateColors() {
        var colors = [];

        for (var color in trackedColors) {
            if (trackedColors[color]) {
                colors.push(color);
            }
        }

        tracker.setColors(colors);
    }



    createCustomColor();
}