var socket = io.connect();

var remotevid = document.getElementById('webrtc-remotevid');
var localStream = null;
var peerConn = null;
var started = false;
var channelReady = false;
var mediaConstraints = {'mandatory': {
                      'OfferToReceiveAudio':true, 
                      'OfferToReceiveVideo':true }};
var isVideoMuted = true;

var videoCamera = new tracking.VideoCamera().hide().render().renderVideoCanvas();
var ctx = videoCamera.canvas.context,
trackX,trackY,trackSize;

// var canvas = document.getElementById('paper');
// var ctx0 = canvas.getContext('2d');

// web rtc
var video=document.getElementById("webrtc-remotevid");
var remotecan=document.getElementById("remotecan");
var remotectx=remotecan.getContext('2d');

video.addEventListener('play', function() {
// var i=window.setInterval(function() {
//   remotectx.drawImage(video,0,0,640,480)},5);
var $this = this;
(function loop() {
  remotectx.drawImage($this,0,0,640,480);
  setTimeout(loop, 1000/100);
})();
},false);


function setLocalAndSendMessage(sessionDescription) {
peerConn.setLocalDescription(sessionDescription);
console.log("Sending: SDP");
console.log(sessionDescription);
socket.json.send(sessionDescription);
}

function createOfferFailed() {
console.log("Create Answer failed");
}

// start the connection upon user request
// function connectvid() {

socket.on('logNow',function(){
  console.log(localStream);
  if (!started && localStream && channelReady) {
    createPeerConnection();
    started = true;
    peerConn.createOffer(setLocalAndSendMessage, createOfferFailed, mediaConstraints);
  } else {
    alert("Close This Tab And Try Again.");
  }
});



// socket: channel connected
socket.on('connect', onChannelOpened)
    .on('message', onMessage);

function onChannelOpened(evt) {
console.log('Channel opened.');
channelReady = true;
}

function createAnswerFailed() {
console.log("Create Answer failed");
}
// socket: accept connection request
function onMessage(evt) {
$('.remoteavatar').css('-webkit-filter','none');
$('.remoteavatar').addClass('pulse');

if (evt.type === 'offer') {
  console.log("Received offer...")
  if (!started) {
    createPeerConnection();
    started = true;
  }
  console.log('Creating remote session description...' );
  peerConn.setRemoteDescription(new RTCSessionDescription(evt));
  console.log('Sending answer...');
  peerConn.createAnswer(setLocalAndSendMessage, createAnswerFailed, mediaConstraints);

} else if (evt.type === 'answer' && started) {
  console.log('Received answer...');
  console.log('Setting remote session description...' );
  peerConn.setRemoteDescription(new RTCSessionDescription(evt));

} else if (evt.type === 'candidate' && started) {
  console.log('Received ICE candidate...');
  var candidate = new RTCIceCandidate({sdpMLineIndex:evt.sdpMLineIndex, sdpMid:evt.sdpMid, candidate:evt.candidate});
  console.log(candidate);
  peerConn.addIceCandidate(candidate);

} else if (evt.type === 'bye' && started) {
  console.log("Received bye");
  stop();
}
}

function createPeerConnection() {
console.log("Creating peer connection");
RTCPeerConnection = webkitRTCPeerConnection || mozRTCPeerConnection;
var pc_config = {"iceServers":[]};
try {
  peerConn = new RTCPeerConnection(pc_config);

} catch (e) {
  console.log("Failed to create PeerConnection, exception: " + e.message);
}
// send any ice candidates to the other peer
peerConn.onicecandidate = function (evt) {
  if (event.candidate) {
    console.log('Sending ICE candidate...');
    console.log(evt.candidate);
    socket.json.send({type: "candidate",
                      sdpMLineIndex: evt.candidate.sdpMLineIndex,
                      sdpMid: evt.candidate.sdpMid,
                      candidate: evt.candidate.candidate});
  } else {
    console.log("End of candidates.");
  }
};
console.log('Adding local stream...');
console.log(localStream);
peerConn.addStream(localStream);

// peerConn.addStream(localScreen);

peerConn.addEventListener("addstream", onRemoteStreamAdded, false);

// when remote adds a stream, hand it on to the local video element
function onRemoteStreamAdded(event) {
  console.log("Added remote stream");
  remotevid.src = window.URL.createObjectURL(event.stream);
}

// when remote removes a stream, remove it from the local video element
}

//** web rtc



$(function(){
  //**** init canvas   **//
    var canvas1 = $('#paper1');
    $('#paper1').attr('width', $( document ).width()*0.96);
    $('#paper1').attr('height',$( document ).height()*0.84);      
    var ctx1 = canvas1[0].getContext('2d');

    var canvas2 = $('#paper');
    // $('#paper').attr('width', $( document ).width()*0.96);
    // $('#paper').attr('height',$( document ).height()*0.84);      
    var ctx2 = canvas2[0].getContext('2d');

    var canvas3 = $('#dot');
    // $('#dot').attr('width', $( document ).width()*0.96);
    // $('#dot').attr('height',$( document ).height()*0.84);      
    var ctx3 = canvas3[0].getContext('2d');

    var id = Math.round($.now() * Math.random()); // Generate a unique ID
    var drawing = false; // A flag for drawing activity
    var pandrawing = false;
    var clients = {};
    var sign = {};
    var prev = {}; // Previous coordinates container
    var lastEmit = $.now();
    var lineColor = 'rgb(242,198,23)';
    var lineWidth = 2;
    var eraserSelected = false;
    var erase = false;
    var notenow = true;

    var drawSegments = [],
        eraseFound = false,
        pencilFound = false,
        segment = 0,
        selectedElement = document.getElementById('selected');

    var drawColor = "rgba(232,78,55,1)";
    var prevx,prevy;

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
        // $('.menu').children().removeClass('selectmenu');
        // $(this).addClass('selectmenu');
        window.print(); 
    });



    $('.clearscreen').click(function() {
        ctx1.clearRect(0, 0, $( document ).width(), $( document ).height());
        ctx2.clearRect(0, 0, $( document ).width(), $( document ).height());
        // $('.light').selected()
    });




    $('.color').children().click(function() {
        $('.color').children().removeClass('selected');
        $(this).addClass('selected');
        lineColor = $(this).css('background-color');
    });
    // init over

    // control stick
    socket.on('drawing',function (data) {
      if(data < 60){
        if (data==49)
        {
          drawColor = "rgba(232,78,55,1)";
        }else if(data == 50){
          drawColor = "rgba(232,218,143,1)";
        }else if (data == 51) {
          drawColor = "rgba(99,207,232,1)";
        }else if (data == 52) {
          drawColor = "rgba(232,157,94,1)";
        }else if (data == 53) {
          drawColor = "rgba(103,207,252,1)";
        }else if (data ==54) {
          drawColor = "rgba(80,232,151,1)";
        }else if (data == 55) {
          drawColor = "rgba(255,151,157,1)";
        }else if (data == 56) {
          drawColor = "rgba(116,150,255,1)";
        }
      }

        else if(data == 100) {
            pandrawing = true;
            notenow = false;
        }else if(data == 101){
            pandrawing = false;
            notenow = false;
        }else if(data == 99){
            ctx2.clearRect(0,0, $( document ).width(), $( document ).height());
            ctx1.clearRect(0,0, $( document ).width(), $( document ).height());
        }
    });
    //***stick over

    // videoCamera.track({
    //     type: 'color',
    //     color: 'magenta',
    //     onFound: function(track) {
    //         var size = 60 - track.z;
    //         ctx.strokeStyle = "rgb(255,226,83)";
    //         ctx.lineWidth = 2;
    //         ctx.strokeRect(track.x - size*0.5, track.y - size*0.5, size, size);
    //         trackX=track.x - size*0.5 + 2;
    //         trackY=track.y - size*0.5 + 2;
    //         trackSize = size - 4;            
    //     }
    //   });

     $('.localavatar').addClass('pulse');
     
     //** control stick draw **//
     videoCamera.track({
        type: 'color',
        color: 'magenta',
        onFound: function(track) {

          // if (notenow) {

            var size = 60 - track.z;
            ctx.strokeStyle = "rgb(255,226,83)";
            ctx.lineWidth = 2;
            ctx.strokeRect(track.x - size*0.5, track.y - size*0.5, size, size);
            trackX=track.x - size*0.5 + 2;
            trackY=track.y - size*0.5 + 2;
            trackSize = size - 4;
          // }

          ctx3.beginPath();
          ctx3.clearRect(prevx - 4 - 1, prevy - 4 - 1, 4 * 2 + 2, 4 * 2 + 2);
          ctx3.closePath();

          ctx3.fillStyle = drawColor;
          ctx3.beginPath();
          ctx3.arc(track.x,track.y,4,0,Math.PI*2,true);
          ctx3.closePath();
          ctx3.fill();

          if (!drawSegments[segment]) {
                drawSegments[segment]= [];
            }
          if (pandrawing) {
            drawSegments[segment].push(track.x,track.y);

          }
          else if (!pandrawing) {
            drawSegments[segment]=[];
          }

          socket.emit('catching', {
              'drawSegments': drawSegments,
              'trackX': track.x,
              'trackY': track.y,
              'prevx': prevx,
              'prevy': prevy,
              'drawColor': drawColor,
              'x': ((640-track.x)/640)*$(document).width()*0.68+$(document).width()*0.28,
              'y': (track.y/480)*$( document ).height()*0.9,
              'pandrawing': pandrawing,
              'id': id
          });

          prevx = track.x;
          prevy = track.y;


            if (!pencilFound) {
                selectedElement.className = 'pencil';
            }

            pencilFound = true;



            lastEmit = $.now();

        },
        onNotFound: function() {

            if (pencilFound) {
                // segment++;
                drawSegments[segment]=[];
                pencilFound = false;
                selectedElement.className = '';
            }

            ctx3.beginPath();
            ctx3.clearRect(prevx - 4 - 1, prevy - 4 - 1, 4 * 2 + 2, 4 * 2 + 2);
            ctx3.closePath();

            // socket.emit('catching', {
            //   'drawSegments': drawSegments,
            //   'drawColor': drawColor,
            //   'id': id
            // });
            lastEmit = $.now();
        }


    });


      (function loop() {
          for (var i = 0, len = drawSegments.length; i < len; i++) {
              drawSpline(ctx2, drawColor, drawSegments[i], 0.5, false);
              // videoCamera.canvas.context
          }
          requestAnimationFrame(loop);
      }());


    function getControlPoints(x0,y0,x1,y1,x2,y2,t){
        //  x0,y0,x1,y1 are the coordinates of the end (knot) pts of this segment
        //  x2,y2 is the next knot -- not connected here but needed to calculate p2
        //  p1 is the control point calculated here, from x1 back toward x0.
        //  p2 is the next control point, calculated here and returned to become the
        //  next segment's p1.
        //  t is the 'tension' which controls how far the control points spread.

        //  Scaling factors: distances from this knot to the previous and following knots.
        var d01=Math.sqrt(Math.pow(x1-x0,2)+Math.pow(y1-y0,2));
        var d12=Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));

        var fa=t*d01/(d01+d12);
        var fb=t-fa;

        var p1x=x1+fa*(x0-x2);
        var p1y=y1+fa*(y0-y2);

        var p2x=x1-fb*(x0-x2);
        var p2y=y1-fb*(y0-y2);

        return [p1x,p1y,p2x,p2y]
    }

    function drawSpline(ctx,dwColor,pts,t){


        // showDetails=true;
        ctx.lineWidth=1;
        ctx.save();
        var cp=[];   // array of control points, as x0,y0,x1,y1,...
        var n=pts.length;


        // Draw an open curve, not connected at the ends
        for(var i=0;i<n-4;i+=2){
            cp=cp.concat(getControlPoints(pts[i],pts[i+1],pts[i+2],pts[i+3],pts[i+4],pts[i+5],t));
        }
        for(var i=2;i<pts.length-5;i+=2){
            // var color="rgba(232,78,55,0.9)";
            // if(!showDetails){color="#82CDFF";}
            ctx.strokeStyle=dwColor;
            ctx.beginPath();
            ctx.moveTo(pts[i],pts[i+1]);
            ctx.bezierCurveTo(cp[2*i-2],cp[2*i-1],cp[2*i],cp[2*i+1],pts[i+2],pts[i+3]);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.strokeStyle=dwColor;
        ctx.beginPath();
        ctx.moveTo(pts[0],pts[1]);
        ctx.quadraticCurveTo(cp[0],cp[1],pts[2],pts[3]);
        ctx.stroke();
        ctx.closePath();


        ctx.strokeStyle=dwColor;
        ctx.beginPath();
        ctx.moveTo(pts[n-2],pts[n-1]);
        ctx.quadraticCurveTo(cp[2*n-10],cp[2*n-9],pts[n-4],pts[n-3]);
        ctx.stroke();
        ctx.closePath();


        ctx.restore();

    }
    //**  control stick draw over

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


    // 抓便签纸
    $('.snapshot').click(function() {

        

        var canvasID = 'canvas' + $('canvas').length;

        var newCanvas = document.createElement('canvas');
        newCanvas.width = trackSize;
        newCanvas.height = trackSize;

        var imageData = ctx.getImageData(trackX,trackY,trackSize,trackSize);
        newCanvas.getContext('2d').putImageData(imageData,0,0);

        newCanvas.id = canvasID;
        $('body').append(newCanvas);

        // $('#'+canvasID).draggable({ cursor: "move", cursorAt: { top: trackSize, left: trackSize}, containment: '#note' });
         var $div = $('#note');
           $('#'+canvasID)
              .drag("start",function( ev, dd ){
                 dd.limit = $div.offset();
                 dd.limit.bottom = dd.limit.top + $div.outerHeight() - $( this ).outerHeight();
                 dd.limit.right = dd.limit.left + $div.outerWidth() - $( this ).outerWidth();
              })
              .drag(function( ev, dd ){
                 $( this ).css({
                    top: Math.min( dd.limit.bottom, Math.max( dd.limit.top, dd.offsetY ) ),
                    left: Math.min( dd.limit.right, Math.max( dd.limit.left, dd.offsetX ) )
                 });   
              });
        $('#'+canvasID).css('cursor','move');
        $('#'+canvasID).css('position','absolute');
        $('#'+canvasID).css('z-index','998');
        $('#'+canvasID).css('left',((640-trackX-trackSize)/640)*$(document).width()*0.68+$(document).width()*0.28+'px');
        $('#'+canvasID).css('top',(trackY/480)*$( document ).height()*0.9+'px');
        $('#'+canvasID).css('width',trackSize*2+'px');
        $('#'+canvasID).css('height',trackSize*2+'px');
        $('#'+canvasID).css('border-radius', '10px');
        
        
        socket.emit('note',{
          'trackX': trackX,
          'trackY': trackY,
          'trackSize': trackSize
        });// 发的位置，让远程也拍一下，识别。在网络延迟下会出错
        

  });

    // $('#clearscreen').click(function() {

    //   $('#note').children().remove();

    // });
    //** remote control stick
    socket.on('color', function (data) {
        // Create cursor

        // Set the starting point to where the user first touched


        ctx3.beginPath();
        ctx3.clearRect(data.prevx - 4 - 1, data.prevy - 4- 1, 4 * 2 + 2, 4 * 2 + 2);
        ctx3.closePath();

        ctx3.fillStyle = data.drawColor;
        ctx3.beginPath();
        ctx3.arc(data.trackX,data.trackY,4,0,Math.PI*2,true);
        ctx3.closePath();
        ctx3.fill();
        // Show drawing
            // clients[data.id] holds the previous position of this user's mouse pointer
                (function loop() {
                    for (var i = 0, len = data.drawSegments.length; i < len; i++) {
                        drawSpline(ctx2,data.drawColor,data.drawSegments[i], 0.5, false);
                    }
                    requestAnimationFrame(loop);
                }());



        // Save state
        // clients[data.id] = data;
        // clients[data.id].updated = $.now();
    });

    //** remote ticket
    socket.on('note', function (data) {

      var canvasID = 'canvas' + $('canvas').length;

      var newCanvas = document.createElement('canvas');
      newCanvas.width = data.trackSize;
      newCanvas.height = data.trackSize;

      var remoteImgData = remotectx.getImageData(data.trackX,data.trackY,data.trackSize,data.trackSize);

      newCanvas.getContext('2d').putImageData(remoteImgData,0,0);

      newCanvas.id = canvasID;

      $('body').append(newCanvas);

      var $div = $('#note');
           $('#'+canvasID)
              .drag("start",function( ev, dd ){
                 dd.limit = $div.offset();
                 dd.limit.bottom = dd.limit.top + $div.outerHeight() - $( this ).outerHeight();
                 dd.limit.right = dd.limit.left + $div.outerWidth() - $( this ).outerWidth();
              })
              .drag(function( ev, dd ){
                 $( this ).css({
                    top: Math.min( dd.limit.bottom, Math.max( dd.limit.top, dd.offsetY ) ),
                    left: Math.min( dd.limit.right, Math.max( dd.limit.left, dd.offsetX ) )
                 });   
              });
      $('#'+canvasID).css('cursor','move');
      $('#'+canvasID).css('position','absolute');
      $('#'+canvasID).css('z-index','998');
      $('#'+canvasID).css('left',((640-data.trackX-data.trackSize)/640)*$( document ).width()*0.68+$( document ).width()*0.28+'px');
      $('#'+canvasID).css('top',(data.trackY/480)*$( document ).height()*0.9+'px');
      $('#'+canvasID).css('width',data.trackSize*2+'px');
      $('#'+canvasID).css('height',data.trackSize*2+'px');
      $('#'+canvasID).css('border-radius', '10px');
    });

    //** date time **//
    var dayNames= ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
    var monthNames = [ "Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec." ];
    // Create a newDate() object
    var newDate = new Date();

    // Extract the current date from Date object
    newDate.setDate(newDate.getDate());





    $('#Weekday').html(dayNames[newDate.getDay()]);
    // Output the day, date, month and year
    $('#Date').html( monthNames[newDate.getMonth()] + ' ' + newDate.getDate() + ',' + ' ' + newDate.getFullYear());
     
    socket.on('time', function (data){

        $('#remoteWeekday').html(dayNames[data.weekday]);
        $('#remoteDate').html(monthNames[data.month] + ' ' + data.day + ',' + ' ' + data.year);
        $("#remotemin").html(( data.min < 10 ? "0" : "" ) + data.min);
        $("#remotehours").html(( data.hour < 10 ? "0" : "" ) + data.hour);

    });



     
    setInterval( function() {
        // Create a newDate() object and extract the minutes of the current time on the visitor's
        var minutes =  new Date().getMinutes();
        // Add a leading zero to the minutes value
        $("#min").html(( minutes < 10 ? "0" : "" ) + minutes);
        
        var hours = new Date().getHours();
        // Add a leading zero to the hours value
        $("#hours").html(( hours < 10 ? "0" : "" ) + hours);

        socket.emit('time',{
          'hour': hours,
          'min': minutes,
          'weekday': newDate.getDay(),
          'month': newDate.getMonth(),
          'day': newDate.getDate(),
          'year': newDate.getFullYear()
        });

    },1000);

   
 
});