/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks, Network*/
"use strict";

var H = {};

H.offsetX = 1.2;
H.offsetY = -2;

H.hand = {};

H.init = function (config) {
    console.log('Hand init');
    // H.hands = game.add.group();
    // H.hand = H.hands.create(Screen.x / 2, 0, 'hand');
};



H.add = function (tile) {
    console.log('hand adding tile', tile.key, tile.id);
    H.hand[tile.id] = tile;
    Controls.hide();
    T.show(tile);
    T.scale(0.5, tile);
    // var c = Utils.pointIntersection(tile, H.hand);
    // console.log('check', c);
};


H.update = function () {
  var offsetX = 100;
  R.mapObj(function (tile) {
    UI.fixedToCamera(false, tile);
    tile.x = offsetX;
    offsetX += tile.width;
    tile.y = game.camera.height - tile.height / 3;
    S.bringToTop(tile);
    UI.fixedToCamera(true, tile);
  })(H.hand);
};


H.release = function(tile) {
  UI.fixedToCamera(false, tile);
  if (H.hand[tile.id]) {
    Network.server.fromHand(tile.id);
    delete H.hand[tile.id];
    T.scale(1.0, tile);
    console.log('card', tile.key, tile.id, 'removed from hand');
  }
};
