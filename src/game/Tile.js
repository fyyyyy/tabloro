/*global Phaser, R, game, console*/
"use strict";

var T = {};
T.id = 0;

T.centerAnchor = function (tile) {
    tile.anchor.set(0.5);
    return tile;
};

T.draggable = function (tile) {

    tile.controls = tile.controls || game.add.group();

    tile.inputEnabled = true;
    tile.input.enableDrag(false, true);
    tile.input.useHandCursor = true;

    game.physics.arcade.enable(tile);
    tile.body.collideWorldBounds = true;

    return tile;
};

T.networkAble = function (tile) {
    tile.events.onInputDown.add(T.onStartDrag);
    tile.events.onInputUp.add(T.onStopDrag);
    return tile;
};

T.stackable = function (tile) {
    tile.stackable = true;
    return tile;
};

T.scale = R.curry(function (scale, tile) {
    tile.scale.set(scale);
    return tile;
});

T.setId = function (tile) {
    tile.id = T.id++;
    return tile;
};

T.resetRotation = function (tile) {
    tile.rotation = 0;
    return tile;
};


T.rotateable = function (rotateable) {
    if (!rotateable) { return R.I;}
    return function (tile) {
        tile.rotateable = true;
        tile.events.onInputDown.add(T.onStartDragRotate);
        tile.events.onInputUp.add(T.onStopDragRotate);
        return tile;
    };
};

T.onRotate = function onRotate() {
    console.log('onRotate', Controls.target);

    var rotation = Controls.target.parent.rotateBy;
    if (!rotation) {
        console.log('tile not rotateable');
        return;
    }
    var position = Controls.target.position.clone();
    position.rotation = Controls.target.rotation + rotation;

    Network.server.tileDragStop(Controls.target.id,position);

    game.add.tween(Controls.target).to({
        rotation: '+' + rotation
    }, 50, Phaser.Easing.Linear.None, true, 0, false);
};


T.defaultTint = function (tile) {
    tile.tint = tile.defaultTint;
    return tile;
};

T.setDefaultTint = function (tint, tile) {
    tile.defaultTint = tile.tint = tint;
    return tile;
};

T.resetTint = function (tile) {
    tile.tint += 0x333333;
    return tile;
};

T.onStartDrag = function (tile) {
    console.log('onStartDrag', tile.id);
    Controls.hide();
    Network.server.tileDragStart(tile.id);
};


T.onStopDrag = function (tile) {
    console.log('onStopDrag');
    var position = tile.position.clone();
    position.rotation = tile.rotation;
    Network.server.tileDragStop(tile.id, position);
};

T.onStartDragRotate = function (tile) {
    console.log('onStartDragRotate');
    Controls.target = tile;
    T.show(tile);
    Controls.hide();
};


T.onStopDragRotate = function (tile) {
    console.log('onStopDragRotate');
    Controls.at(tile);
};


T.enableInput = function (tile) {
    tile.inputEnabled = true;
    return tile;
};

T.show = function (tile) {
    tile.frame = tile.defaultFrame;
    return tile;
};

T.hide = function (tile) {
    tile.frame = 0;
    return tile;
};

