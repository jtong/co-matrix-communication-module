var socket = io.connect();

var remotevid = document.getElementById('webrtc-remotevid');
var localStream = null;
var peerConn = null;
var started = false;
var channelReady = false;
var mediaConstraints = {'mandatory': {
    'OfferToReceiveAudio':true,
    'OfferToReceiveVideo':true }};




//var videoCamera = new tracking.VideoCamera({audio:false,controls: false,width:220, height:240}).render().renderVideoCanvas();

//var ctx = videoCamera.canvas.context,
//    trackX,trackY,trackSize;
//var localVideo = document.getElementById("localVideo");



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