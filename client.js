var socket = io.connect();

var remotevid = document.getElementById('webrtc-remotevid');
var localStream = null;
var peerConn = null;
var started = false;
var channelReady = false;
var mediaConstraints = {'mandatory': {
                      'OfferToReceiveAudio':true, 
                      'OfferToReceiveVideo':true }};

var videoCamera = new tracking.VideoCamera().hide().render().renderVideoCanvas();
var ctx = videoCamera.canvas.context,
trackX,trackY,trackSize;

// web rtc
var video=document.getElementById("webrtc-remotevid");
var remotecan=document.getElementById("remotecan");
var remotectx=remotecan.getContext('2d');

video.addEventListener('play', function() {
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




    videoCamera.track({
         type: 'color',
         color: 'magenta',
         onFound: function(track) {
//             var size = 60 - track.z;
//             ctx.strokeStyle = "rgb(255,226,83)";
//             ctx.lineWidth = 2;
//             ctx.strokeRect(track.x - size*0.5, track.y - size*0.5, size, size);
//             trackX=track.x - size*0.5 + 2;
//             trackY=track.y - size*0.5 + 2;
//             trackSize = size - 4;
         }
       });

     $('.localavatar').addClass('pulse');



    mouse_draw();

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
