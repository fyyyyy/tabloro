/*global Peer, Network, navigator, window, $*/
var Video = {};

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;


Video.init = function () {
  console.log('VIDEO Connecting ...');
  Video.peer = new Peer(Network.myId, {
    // key: 'lwjd5qra8257b9',
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
  });

  // Video.peer.on('connection', function (conn) {
  //   console.log('VIDEO peer.connection received connection to other player', conn);
  //   conn.on('open', function () {
  //     // Receive messages
  //     conn.on('data', function (data) {
  //       console.log('VIDEO Received', data);
  //     });

  //     // Send messages
  //     console.log('VIDEO open Send hello');
  //     conn.send('Hello!');
  //   });
  // });
Video.step1();
};

Video.connect = function (clientId) {
  console.log('VIDEO connecting video to', clientId);
  var conn = Video.peer.connect(clientId);

};

Video.call = function (clientId) {
  console.log('VIDEO calling', clientId);
  var call = Video.peer.call(clientId, window.localStream);
  Video.step3(call);
};

Video.step1 = function () {
  // Get audio/video stream
  navigator.getUserMedia({
    audio: true,
    video: true
  }, function (stream) {
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));
    window.localStream = stream;
    Video.step2();
  }, function () {
    // $('#step1-error').show();
    console.error('error setting up video');
  });
};

Video.step2 = function () {
  console.log('step 2');
};

Video.step3 = function (call) {
  // Hang up on an existing call if present
  if (window.existingCall) {
    window.existingCall.close();
  }
  // Wait for stream on the call, then set peer video display
  call.on('stream', function (stream) {
    $('#their-video').prop('src', URL.createObjectURL(stream));
  });
  // UI stuff
  window.existingCall = call;
  // $('#their-id').text(call.peer);
  call.on('close', Video.step2);
  // $('#step1, #step2').hide();
  // $('#step3').show();
};
