/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks, Network*/
"use strict";

var H = {};

H.offsetX = 1.2;
H.offsetY = -2;

H.init = function (config) {
    console.log('Hand init');
    H.hands = game.add.group();
    // H.hand = H.hands.create(Screen.x / 2, 0, 'hand');
};



H.check = function (tile) {
    console.log('hand check');
    // var c = Utils.pointIntersection(tile, H.hand);
    // console.log('check', c);
};
