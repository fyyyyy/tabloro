/*global Phaser, R, H, game, console, Controls*/
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
    // tile.input.useHandCursor = true;

    game.physics.arcade.enable(tile);
    tile.body.collideWorldBounds = true;

    tile.events.onInputOver.add(T.highlight);
    tile.events.onInputOut.add(T.unlight);


    return tile;
};

T.highlight = function (tile) {
    console.log('highlight', tile);
    tile.alpha = 0.8;
};

T.unlight = function (tile) {
    console.log('highlight', tile);
    tile.alpha = 1.0;
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

T.lockable = function (lockable) {
    return function (tile) {
        tile.lockable = lockable;
        return tile;
    };
};

T.onLock = function () {
    var tile = Controls.target;

    console.log('lock', tile);
    Network.server.tileLock(tile.id);
    return tile;
};

T.lock = function ( tile) {
    if (tile.lockable) {
        Controls.lockControls.tint = 0xFF3366;
        tile.input.disableDrag();
        // tile.input.useHandCursor = false;
    }
    return tile;
};

T.unlock = function ( tile) {
    Controls.lockControls.tint = 0xFFFFFF;
    tile.input.enableDrag(false, true);
    // tile.input.useHandCursor = true;
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
    return function (tile) {
        tile.rotateable = (rotateable && tile.parent.rotateBy) || false;
        tile.events.onInputDown.add(T.onDragControllable);
        tile.events.onInputUp.add(T.onStopDragControllable);
        return tile;
    };
};

T.onRotate = function onRotate() {
    var tile = Controls.target;
    console.log('onRotate', tile);

    var rotation = tile.parent.rotateBy;

    var position = T.getPosition(tile);
    position.rotation = tile.rotation + rotation;
    console.log(position.rotation, rotation);

    Network.server.tileDragStop(tile.id, position);

    game.add.tween(tile).to({
        rotation: '+' + rotation
    }, 50, Phaser.Easing.Linear.None, true, 0, false);
};

T.flipable = function (flipable) {
    if (!flipable) { return R.I;}
    return function (tile) {
        tile.flipable = true;
        tile.events.onInputDown.add(T.onDragControllable);
        tile.events.onInputUp.add(T.onStopDragControllable);
        return tile;
    };
};

T.handable = function (handable) {
    if (!handable) { return R.I;}
    return function (tile) {
        tile.handable = true;
        return tile;
    };
};


T.onFlip = function () {
    var tile = Controls.target;
    console.log('onFlip', tile.flipable, tile.id);
    if (!tile.flipable) { return R.I; }

    Network.server.flipTiles(T.getSelectedIds(tile), T.nextFlipStates(tile));
    R.forEach(T.flip)(Controls.getSelected(tile));
};

T.nextFlipStates = function (tile) {
    return R.map(function (t) {
        if (t.frame === t.defaultFrame) {
            return 0;
        }
        return t.defaultFrame;
    })(Controls.getSelected(tile));
};

T.onTake = function () {
    console.log('onTake');
    var tile = Controls.target;
    H.add(tile);
    Network.server.toHand(tile.id);
};


T.getSelectedIds = function (tile) {
    return R.pluck('id')(Controls.getSelected(tile));
};

T.getPositions = function (tile) {
    return R.map(function (tile) {
        return T.getPosition(tile);
    })(Controls.getSelected(tile));
};

T.getPosition = function (tile) {
    return {
        x: tile.x,
        y: tile.y,
        rotation: tile.rotation,
        frame: tile.frame,
    };
};


T.onStartDrag = function (tile) {
    T.dragging = true;
    console.log('onStartDrag', tile.id);

    H.release(tile);

    Controls.verifySelection(tile);
    
    var relativePositions = Controls.selected.length && R.pluck('relativePosition')(Controls.selected) || [{x: 0, y: 0}];

    Network.server.tileDragStart(T.getSelectedIds(tile), relativePositions);
    Controls.setTarget(tile);
};


T.onStopDrag = function (tile) {
    T.dragging = false;
    console.log('onStopDrag');
    Network.server.tileDragStop(T.getSelectedIds(tile), T.getPositions(tile));
};

T.onDragControllable = function (tile) {
    T.dragging = true;

    console.log('onDragControllable');
    Controls.setTarget(tile);
    // T.show(tile);
};


T.onStopDragControllable = function (tile) {
    T.dragging = false;

    console.log('onStopDragControllable');
    Controls.at(tile);
};


T.enableInput = function (tile) {
    tile.inputEnabled = true;
    return tile;
};

T.flip = function (tile) {
    if (!tile.flipable) {
        return;
    }
    console.log('T.flip', tile.id);
    if (tile.frame === tile.defaultFrame) {
        tile.frame = 0;
    } else {
        tile.frame = tile.defaultFrame;
    }
};


T.show = function (tile) {
    if (tile.flipable && tile.defaultFrame) tile.frame = tile.defaultFrame;
    return tile;
};

T.hide = function (tile) {
    if (tile.flipable && tile.defaultFrame) tile.frame = 0;
    return tile;
};

T.select = function (tile) {
    tile.alpha = 0.5;
    tile.selected = true;
    return tile;
};


T.deselect = function (tile) {
    tile.alpha = 1;
    tile.selected = false;
    delete tile.relativePosition;
    return tile;
};

