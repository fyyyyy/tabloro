/*global Peer, Network, navigator, window, $*/
var Video = {};

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;



Video.init = function () {
  console.log('VIDEO Connecting ...');
  $('#video-container').show();
  $('#step2').hide();
  $('#step3').hide();

  Video.peer = new Peer(Network.myId, {
    key: '8z62zmz8keasjor',
    debug: 3,
    'iceServers': [
      // Pass in optional STUN and TURN server for maximum network compatibility
      { url: 'stun:stun.l.google.com:19302' }
    ]
  });

  Video.peer.on('open', function (id) {
    console.log('VIDEO peer.open My peer ID is: ' + id);
    Video.id = id;
  });

  // Receiving a call
  Video.peer.on('call', function (call) {
    // Answer the call automatically (instead of prompting user) for demo purposes
    call.answer(window.localStream);
    Video.step3(call);
  });

  Video.peer.on('error', function (err) {
    console.error(err.message);
    // Return to step 2 if error occurs
    Video.step2();
    Video.peer.reconnect();
  });


  $(function(){
      $('#make-call').click(function(){
        // Initiate a call!

        var call = Video.peer.call(Video.clientId, window.localStream);
        Video.step3(call);
      });
      $('#end-call').click(function(){
        window.existingCall.close();
        Video.step2();
      });
      // Retry if getUserMedia fails
      $('#step1-retry').click(function(){
        $('#step1-error').hide();
        Video.step1();
      });
      // Get things started
      Video.step1();
    });

};

Video.connect = function (clientId) {
  console.log('VIDEO connecting video to', clientId);
  var conn = Video.peer.connect(clientId);

};

Video.newClient = function (clientId, clientName) {
  console.log('new VIDEO client', clientId);
  $('#make-call').text('Call ' + clientName);
  Video.clientId = clientId;
  Video.step2();
};

Video.step1 = function () {
  console.log('step1');
  $('#their-video').hide();
  $('#step1-error').hide();


  // Get audio/video stream
  navigator.getUserMedia({
    audio: true,
    video: true
  }, function (stream) {
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
    $('#step1').hide();
  }, function () {
    $('#step1-error').show();
    console.error('error setting up video');
  });
};

Video.step2 = function () {
  console.log('step 2');
  $('#step1, #step3').hide();
  if(Video.clientId) $('#step2').show();
};

Video.step3 = function (call) {
  console.log('step3');
  // Hang up on an existing call if present
  if (window.existingCall) {
    window.existingCall.close();
  }
  if (!call) {
    console.error('no call object', call);
    return;
  }
  // Wait for stream on the call, then set peer video display
  call.on('stream', function (stream) {
    $('#their-video').show();
    $('#their-video').prop('src', URL.createObjectURL(stream));
  });

  call.on('close', function (stream) {
    $('#their-video').hide();
    Video.step2();
  });

  call.on('error', function (stream) {
    $('#their-video').hide();
  });
  // UI stuff
  window.existingCall = call;
  // $('#their-id').text(call.peer);
  $('#step1, #step2').hide();
  $('#step3').show();
};
