/*global Phaser, R, T, Utils, game*/
"use strict";

var Controls = {};
var cursors;

Controls.add = function () {
    Controls.controls = game.add.group();
    Controls.controls.position.set(-100);
    var rotationControls = Controls.controls.create(0, 0, 'rotate');
    rotationControls.scale.set(0.7);
    T.centerAnchor(rotationControls);
    rotationControls.inputEnabled = true;
    rotationControls.input.useHandCursor = true;
    rotationControls.events.onInputUp.add(T.onRotate);
    Cursor.reset(rotationControls);
};



Controls.at = function (tile) {
    Controls.controls.visible = true;
    Utils.toCorner(Controls.controls, tile);
};



Controls.hide = function (tile) {
    if (tile) {
        if (Controls.target === tile) Controls.controls.visible = false;
    } else {
        Controls.controls.visible = false;
    }
};



//  Our controls.
Controls.cursors = function () {
    game.input.keyboard.createCursorKeys();
};
