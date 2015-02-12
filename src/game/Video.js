/*global Peer, Network, navigator, window, $*/
var Video = {};
Video.existingCalls = [];
Video.clients = {};

// Compatibility shim
navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia;

Video.getClientName = function (id) {
  return Video.clients[id] || 'unknown';
};


Video.init = function () {
  console.log('VIDEO init ...');
  
  // avoid cors issue, hack
  $.get('http://0.peerjs.com:9000', function(){console.log('done')})

  $('#video-container').show();
  $('#video-container').draggable();

  $('#get-media').hide();

  Video.peer = Video.newPeerServerConnection();
  Video.setupCallbacks(Video.peer);
  Video.callSound = game.add.audio('callSound');

};



Video.setupCallbacks = function (peer) {
  
  peer.on('open', function (id) {
    console.log('VIDEO peer.open My peer ID is: ' + id);
    Video.id = id;
  });

  // Receiving a call
  peer.on('call', function (call) {
    console.log('peer.on call', call);
    Video.callSound.play();
    $('#callee-name').text(Video.getClientName(call.peer));
    $('#accept-call-button').off();

    $('#accept-call-button').on('click', function () {
      $('#accept-call-modal').modal('hide');
      Video.askGetMedia(function () {
        call.answer(window.localStream);
        Video.step3(call);
      });
    });

    $('#accept-call-modal').modal({keyboard: true, show: true});
  });

  peer.on('error', function (err) {
    console.error(err.message);

    if (/Could not connect to peer (\w+)/.exec(err.message)) {
      var id = /Could not connect to peer (\w+)/.exec(err.message)[1];
      // Return to step 2 if error occurs
      Video.showCallButton(id);
    } else {
      Video.peer.reconnect();
    }
  });
};


Video.newPeerServerConnection = function () {
  console.log('Video.newPeerServerConnection');
  var peer = new Peer(Network.myId, {
    key: '8z62zmz8keasjor',
    debug: 1,
    'iceServers': [
      // Pass in optional STUN and TURN server for maximum network compatibility
      { url: 'stun:stun.l.google.com:19302' }
    ]
  });

  return peer;
};


Video.askGetMedia = function (cb) {
  
  if (Video.askedAlready) {
    // proceed with call
    if(cb) cb();
    return;
  }

  // show dialog
  Video.askedAlready = true;
  $('#get-media').show();
  $(function(){
      // Retry if getUserMedia fails
      $('#get-media-retry').click(function(){
        $('#get-media-error').hide();
        Video.getMedia(cb);
      });
      // Get things started
      Video.getMedia(cb);
    });
};



Video.getMedia = function (cb) {
  console.log('Video.getMedia');
  $('#get-media-error').hide();

  // Get audio/video stream
  navigator.getUserMedia({
    audio: true,
    video: true
  }, function (stream) {
    console.log('stream');
    // Set your video displays
    $('#my-video').prop('src', URL.createObjectURL(stream));
    $('#my-video').show();
    window.localStream = stream;
    $('#get-media').hide();
    if(cb) cb();
  }, function () {
    $('#get-media-error').show();
    $('#my-video').hide();
    console.error('error setting up video');
  });
};




Video.newClient = function (clientId, clientName) {
  
  console.debug('new VIDEO client', clientId, clientName);

  if (!clientId) {
    console.error('no clientId given', clientId, clientName);
    return;
  }

  Video.clients[clientId] = clientName;
  Video.addVideoClient(clientId);
  
  $('#' + clientId ).find('.step3').hide();
  $('#' + clientId ).find('.call-text').text(' ' + clientName);

  $(function () {

    // Initiate a call!
    $('#' + clientId ).find('.make-call').click(function(){
      var id = $(this).parents('div.video-group').attr('id');
      console.log('make-call', id);
      Video.askGetMedia( function callback() {
        console.log('make call CALLBACK', id);
        var call = Video.peer.call(id, window.localStream);
        Video.step3(call);
      });
    });
    
    // End call
    $('#' + clientId ).find('.end-call').click(function(){
      var id = $(this).parents('div.video-group').attr('id');
      console.log('end call', id);
      Video.existingCalls[clientId].close();
      Video.showCallButton(clientId);
    });

  });
  Video.showCallButton(clientId);
};


Video.killClient = function (clientId, clientName) {
  console.log('kill VIDEO client', clientId);
  Video.removeVideoClient(clientId);
};


Video.addVideoClient = function (id) {
  $('#their-videos').append(
    '<div class="video-group no-select" id="' + id + '">' +
      
      '<div class="step3">' +
        '<a href="#" class="btn btn-xs btn-danger end-call">' +
          'x' +
        '</a>' +
      '</div>' +
      
      '<video class="video" style="display: none;" autoplay>' + 
      '</video>' + 
      
      '<div class="step step2">' +
        '<a href="#" class="btn btn-success make-call">' +
          '<b class="fa fa-video-camera call-text">' +
          '</b>' +
        '</a>' + 
      '</div>' +
    '</div>'
  );
};

Video.removeVideoClient = function (id) {
  $('#' + id ).remove();
};



Video.showCallButton = function (clientId) {
  console.log('step 2', clientId);
  $('#get-media').hide();
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
    console.error('no call createObjectURLt', call);
    return;
  }
  // Wait for stream on the call, then set peer video display
  call.on('stream', function (stream) {
    $('#' + call.peer).find('video').show();
    $('#' + call.peer).find('video').prop('src', URL.createObjectURL(stream));
  });

  call.on('close', function (stream) {
    $('#' + call.peer).find('video').hide();
    Video.showCallButton(call.peer);
  });

  call.on('error', function (stream) {
    $('#' + call.peer).find('video').hide();
  });
  // UI stuff
  Video.existingCalls[call.peer] = call;
  $('#get-media').hide();
  $('#' + call.peer ).find('.step2').hide();
  $('#' + call.peer ).find('.step3').show();
};
