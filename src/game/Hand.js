/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks, Network*/
"use strict";

var H = {};

H.offsetX = 1.2;
H.offsetY = -2;
H.sizeX = 100;
H.sizeY = 100;


H.hand = {};

H.init = function (config) {
    console.log('Hand init');
    // H.hands = game.add.group();
    // H.hand = H.hands.create(Screen.x / 2, 0, 'hand');

    H.graphics = game.add.graphics(0, 0);
    H.graphics.lineStyle(2, 0x665544, 0.8);
    H.graphics.beginFill(0x000000, 0.5);
    UI.fixedToCamera(true, H.graphics);
    game.world.setChildIndex(H.graphics, 2)


};



H.add = function (tile) {
    console.log('hand adding tile', tile.key, tile.id);
    H.hand[tile.id] = tile;
    Controls.hide();
    T.show(tile);
    // T.scale(0.5, tile);
    // var c = Utils.pointIntersection(tile, H.hand);
    // console.log('check', c);
};


H.update = function () {
  var offsetX = 50;
  R.mapObj(function (tile) {
    UI.fixedToCamera(false, tile);
    tile.x = offsetX;
    offsetX += tile.width;
    tile.y = game.camera.height - tile.height / 2;
    S.bringToTop(tile);
    UI.fixedToCamera(true, tile);
  })(H.hand);

  H.sizeX = offsetX;

  H.graphics.clear();
  H.graphics.drawRoundedRect(
      -20,
      game.camera.height - H.sizeY,
      H.sizeX,
      game.camera.height,
      20,
      0
  );
};


H.release = function(tile) {
  UI.fixedToCamera(false, tile);
  if (H.hand[tile.id]) {
    T.hide(tile);
    Network.server.fromHand(tile.id);
    delete H.hand[tile.id];
    // T.scale(1.0, tile);
    console.log('card', tile.key, tile.id, 'removed from hand');
  }
};
