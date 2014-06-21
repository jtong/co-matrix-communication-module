//include client_webrtc.js first



$(function(){




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
    ticket_capture(ctx,remotectx,trackX, trackY, trackSize);
    date_time();
});
