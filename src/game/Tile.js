/*global Phaser, R, game, console, Controls*/
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
        if (!tile.parent.rotateBy) { return R.I;}
        tile.rotateable = true;
        tile.events.onInputDown.add(T.onDragRotateable);
        tile.events.onInputUp.add(T.onStopDragRotateable);
        return tile;
    };
};

T.onRotate = function onRotate() {
    var tile = Controls.target;
    console.log('onRotate', tile);

    var rotation = tile.parent.rotateBy;

    var position = tile.position.clone();
    position.rotation = tile.rotation + rotation;

    Network.server.tileDragStop(tile.id,position);

    game.add.tween(tile).to({
        rotation: '+' + rotation
    }, 50, Phaser.Easing.Linear.None, true, 0, false);
};

T.flipable = function (flipable) {
    if (!flipable) { return R.I;}
    return function (tile) {
        tile.flipable = true;
        tile.events.onInputDown.add(T.onDragRotateable);
        tile.events.onInputUp.add(T.onStopDragRotateable);
        return tile;
    };
};


T.onFlip = function () {
    var tile = Controls.target;
    console.log('onFlip', tile.flipable, tile.id);
    if (!tile.flipable) { return R.I; }
    T.flip(tile);
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

T.onDragRotateable = function (tile) {
    console.log('onDragRotateable');
    Controls.target = tile;
    // T.show(tile);
    Controls.hide();
};


T.onStopDragRotateable = function (tile) {
    console.log('onStopDragRotateable');
    Controls.at(tile);
};


T.enableInput = function (tile) {
    tile.inputEnabled = true;
    return tile;
};

T.flip = function (tile) {
    console.log('flip', tile.id);
    if (tile.frame === tile.defaultFrame) {
        tile.frame = 0;
    } else {
        tile.frame = tile.defaultFrame;
    }
};

T.show = function (tile) {
    tile.frame = tile.defaultFrame;
    return tile;
};

T.hide = function (tile) {
    tile.frame = 0;
    return tile;
};

