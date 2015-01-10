/*global Phaser, R, T, Utils, game*/
"use strict";

var Controls = {};
var cursors;

Controls.add = function () {
    Controls.controls = game.add.group();
    Controls.controls.position.set(-100);
    
    Controls.rotationControls = Controls.controls.create(0, 0, 'rotate');
    Controls.flipControls = Controls.controls.create(50, 0, 'flip');
    
    Controls.rotationControls.scale.set(0.7);
    Controls.flipControls.scale.set(1.0);
    
    T.centerAnchor(Controls.rotationControls);
    T.centerAnchor(Controls.flipControls);
    
    Controls.rotationControls.inputEnabled = true;
    Controls.rotationControls.input.useHandCursor = true;
    Controls.rotationControls.events.onInputUp.add(T.onRotate);
    
    Controls.flipControls.inputEnabled = true;
    Controls.flipControls.input.useHandCursor = true;
    Controls.flipControls.events.onInputUp.add(T.onFlip);
    
    Cursor.reset(Controls.rotationControls);
    Cursor.reset(Controls.flipControls);
};



Controls.at = function (tile) {
    Controls.show(tile);
    Utils.toCorner(Controls.controls, tile);
};

Controls.show = function (tile) {
    Controls.controls.visible = true;
    Controls.flipControls.visible = tile.flipable || false;
    Controls.rotationControls.visible = tile.rotateable || false;
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
