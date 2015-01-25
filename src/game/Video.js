/*global Peer, Network, navigator, window, $*/
var Video = {};
Video.existingCalls = [];

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;


Video.init = function () {
  console.log('VIDEO Connecting ...');
  $('#video-container').show();
  $('#step1').hide();
  $('#their-videos').hide();
  $('#start-video').click(function () {
    Video.start();
  });
};


Video.newPeerServerConnection = function () {
    Video.peer = new Peer(Network.myId, {
    key: '8z62zmz8keasjor',
    debug: 1,
    'iceServers': [
      // Pass in optional STUN and TURN server for maximum network compatibility
      { url: 'stun:stun.l.google.com:19302' }
    ]
  });
};

Video.start = function () {
  Video.started = true;
  $('#start-video').hide();
  $('#step1').show();
  $('#their-videos').show();


  Video.newPeerServerConnection();

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

    if (/Could not connect to peer (\w+)/.exec(err.message)) {
      var id = /Could not connect to peer (\w+)/.exec(err.message)[1];
      // Return to step 2 if error occurs
      Video.step2(id);
    } else {
      Video.newPeerServerConnection();
    }
  });


  $(function(){
      // Retry if getUserMedia fails
      $('#step1-retry').click(function(){
        $('#step1-error').hide();
        Video.step1();
      });
      // Get things started
      Video.step1();
    });
};




Video.newClient = function (clientId, clientName) {
  
  console.debug('new VIDEO client', clientId, clientName);
  if (!clientId) {
    console.error('no clientId given', clientId, clientName);
    return;
  }

  Video.addVideo(clientId);
  $('#' + clientId ).find('.step3').hide();
  $('#' + clientId ).find('.make-call').text('Call ' + clientName);

  $(function () {

    $('#' + clientId ).find('.make-call').click(function(){
      // Initiate a call!
      var id = $(this).parents('div.video-group').attr('id');
      console.log('make call', id);
      var call = Video.peer.call(id, window.localStream);
      Video.step3(call);
    });
    
    $('#' + clientId ).find('.end-call').click(function(){
      var id = $(this).parents('div.video-group').attr('id');
      console.log('end call', id);
      Video.existingCalls[clientId].close();
      Video.step2(clientId);
    });

  });
  Video.step2(clientId);
};


Video.killClient = function (clientId, clientName) {
  console.log('kill VIDEO client', clientId);
  Video.removeVideo(clientId);
};


Video.addVideo = function (id) {
  $('#their-videos').append(
    '<div class="video-group" id="' + id + '">' +
      '<div class="step3">' +
        '<a href="#" class="btn btn-xs btn-danger end-call">' +
          'x' +
        '</a>' +
      '</div>' +
      '<video class="video" style="display: none;" autoplay>' + 
      '</video>' + 
      '<div class="step step2"><a href="#" class="btn btn-xs btn-success make-call">Call</a></div>' +
    '</div>'
  );
};

Video.removeVideo = function (id) {
  $('#' + id ).remove();
};



Video.step1 = function () {
  console.log('step1');
  $('#step1-error').hide();


  // Get audio/video stream
  navigator.getUserMedia({
    audio: true,
    video: true
  }, function (stream) {
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));
    $('#my-video').show();
    window.localStream = stream;
    $('#step1').hide();
  }, function () {
    $('#step1-error').show();
    $('#my-video').hide();
    console.error('error setting up video');
  });
};



Video.step2 = function (clientId) {
  console.log('step 2', clientId);
  $('#step1').hide();
  $('#' + clientId ).find('.step3').hide();
  $('#' + clientId ).find('.step2').show();
};



Video.step3 = function (call) {
  console.log('step3', call);
  // Hang up on an existing call if present
  if (Video.existingCalls[call.peer]) {
    Video.existingCalls[call.peer].close();
  }
  if (!call) {
    console.error('no call object', call);
    return;
  }
  // Wait for stream on the call, then set peer video display
  call.on('stream', function (stream) {
    $('#' + call.peer).find('video').show();
    $('#' + call.peer).find('video').prop('src', URL.createObjectURL(stream));
  });

  call.on('close', function (stream) {
    $('#' + call.peer).find('video').hide();
    Video.step2(call.peer);
  });

  call.on('error', function (stream) {
    $('#' + call.peer).find('video').hide();
  });
  // UI stuff
  Video.existingCalls[call.peer] = call;
  $('#step1').hide();
  $('#' + call.peer ).find('.step2').hide();
  $('#' + call.peer ).find('.step3').show();
};
