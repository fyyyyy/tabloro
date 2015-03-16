/*global Phaser, R, H, game, console, Controls*/
"use strict";

var T = {};
T.id = 0;

T.centerAnchor = function (tile) {
    tile.anchor.set(0.5);
    return tile;
};

T.draggable = function (tile) {

    tile.inputEnabled = true;
    tile.input.enableDrag(false, true);
    // tile.input.useHandCursor = true;

    // if (tile.width < 200 || tile.height < 200) {
    //     game.physics.arcade.enable(tile);
    //     tile.body.collideWorldBounds = true;
    // }

    tile.events.onInputOver.add(T.highlight);
    tile.events.onInputOut.add(T.unlight);

    tile.events.onInputDown.add(T.onDragControllable);
    tile.events.onInputUp.add(T.onStopDragControllable);


    return tile;
};

T.onUserOwn = function (tile) {
    var tile = Controls.target;
    console.log('onUserOwn', playerName, tile);

    Network.server.tileOwnedBy(tile.id);
    return tile;
};


T.userOwns = function (tile, name) {
    if (tile.isStash) {
        tile.ownedBy = name;
        Controls.colorize(tile);
        if (tile.ownedBy !== playerName) {
            T.disableInput(tile);
            T.hide(tile);
        }
    }
    return tile;
};

T.nobodyOwns = function (tile) {
    delete tile.ownedBy;
    if (!tile.locked) T.enableInput(tile);
    Controls.colorize(tile);
    return tile;
};


T.highlight = function (tile) {
    // console.log('highlight', tile);
    Controls.highlight.clear();
    
    if (tile.isStash && (!tile.ownedBy || tile.ownedBy === playerName)) {
        T.show(tile);
        return;
    }
    Controls.highlight.drawRect(
        - tile.width / 2,
        - tile.height / 2,
        tile.width,
        tile.height
    );
    Controls.highlight.angle = tile.angle;
    Utils.alignPosition(Controls.highlight, tile);
};

T.unlight = function (tile) {
    // console.log('highlight', tile);
    Controls.highlight.clear();
    if(tile.controls) (tile.controls.visible = false);
    if (tile.isStash) {
        T.hide(tile);
    }
};

T.syncTile = function (tile, b) {
    if (tile && b) {
        tile.x = b.x;
        tile.y = b.y;
        tile.rotation = b.rotation;
        tile.frame = b.frame;
        if (tile.isStash) {
            T.hide(tile);
        }

    } else console.error('alignPosition', tile, b);
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





/*********** LOCK **************************************************************************************/

T.lockable = function (lockable) {
    return function (tile) {
        tile.lockable = lockable;
        tile.controls = Controls.make(tile.parent, 'lock', T.onUnLock.bind(tile, tile));
        tile.controls.tint = 0xFF3366;
        tile.controls.alpha = 0;
        tile.controls.scale.set(0.65);
        tile.controls.events.onInputOver.add(T.overLock);
        tile.controls.events.onInputOut.add(T.outLock);
        tile.addChild(tile.controls);
        return tile;
    };
};

T.onLock = function () {
    var tile = Controls.target;
    console.log('onLock', tile);
    Network.server.tileLock(tile.id);
    return tile;
};

T.onUnLock = function (tile) {
    console.log('onUnLock', tile);
    Network.server.tileLock(tile.id);
    return tile;
};

T.lock = function (tile) {
    console.log('lock', tile);

    if (tile.lockable) {
        tile.controls.visible = true;
        tile.controls.alpha = 1.0;
        tile.locked = true;
        T.disableInput(tile);
        Controls.hide(tile);

        setTimeout(function() {
            game.add.tween(tile.controls).to({
                alpha: 0
            }, 1000, Phaser.Easing.Linear.None, true, 0, false);
        }, 1000);

        // tile.input.disableDrag();
        // tile.input.useHandCursor = false;
    }
    return tile;
};

T.unlock = function ( tile) {
    tile.controls.visible = false;
    delete tile.locked;
    T.enableInput(tile);
    // tile.input.enableDrag(false, true);
    // tile.input.useHandCursor = true;
    return tile;
};

T.overLock = function (control) {
    control.alpha = 1.0;
};

T.outLock = function (control) {
    control.alpha = 0;
};


T.scale = R.curry(function (scale, tile) {
    tile.scale.set(scale);
    return tile;
});

T.setId = function (tile) {
    tile.id = T.id++;
    G.addTile(tile);
    return tile;
};


/****** ROTATE ***************************************************************************************/

T.resetRotation = function (tile) {
    tile.rotation = 0;
    return tile;
};


T.rotateable = function (rotateBy) {
    return function (tile) {
        rotateBy = Number(rotateBy);
        tile.rotateable = (rotateBy && rotateBy > 0) ? true : false;
        tile.rotateBy = Utils.deg2Rad(rotateBy);
        console.log('rotateable', tile.rotateable, tile.rotateBy);
        return tile;
    };
};

T.startRotate = function () {
    var tile = Controls.target;
    // console.log('startRotate', tile);
     tile.startRotatePosition = Utils.getMousePosition();
     tile.startRotation = tile.rotation;
     // console.log('startRotatePosition', tile.startRotatePosition);
     G.addUpdatePosition(tile);
};    


T.releaseRotate = function () {
    var tile = Controls.target;
    // console.log('releaseRotate', tile);

    var deltaRotation = tile.rotation - tile.startRotation;

    if (Math.abs(deltaRotation + 0.01)  < tile.rotateBy) {
        tile.rotation += tile.rotateBy;
    } else {
        // console.error('not enough', deltaRotation, tile.rotation, tile.startRotation);
    }

    delete tile.startRotatePosition;
    delete tile.startRotation;
    G.removeRotationPosition(tile.id);

    Network.server.tilesDragStop(T.getSelectedIds(tile), T.getPositions(tile));

    // game.add.tween(tile).to({
    //     rotation: '+' + rotation
    // }, 50, Phaser.Easing.Linear.None, true, 0, false);
};

T.flipable = function (flipable) {
    if (!flipable) { return R.I;}
    return function (tile) {
        tile.flipable = true;
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
    if (Touch.touching) {
        tile.input.stopDrag(game.input.activePointer);
    }

    T.dragging = true;
    console.log('onStartDrag', tile.id, tile.parent.z);

    H.release(tile);
    Controls.highlight.clear();

    Controls.verifySelection(tile);
    
    var relativePositions = Controls.selected.length && R.pluck('relativePosition')(Controls.selected) || [{x: 0, y: 0}];

    Network.server.tilesDragStart(T.getSelectedIds(tile), relativePositions);
    Controls.setTarget(tile);
};


T.onStopDrag = function (tile) {
    T.dragging = false;
    console.log('onStopDrag', tile.id);
    T.checkBounds(tile);

    Network.server.tilesDragStop(T.getSelectedIds(tile), T.getPositions(tile));
};

T.checkBounds = function (tile) {
    if (tile.width < 200 || tile.height < 200) {
        if (tile.x < 0) { tile.x = 0; }
        if (tile.x > World.width) { tile.x = World.width; }
        if (tile.y < 0) { tile.y = 0; }
        if (tile.y > World.height) { tile.y = World.height; }
    }
    return tile;
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

T.disableInput = function (tile) {
    tile.inputEnabled = false;
    return tile;
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
    // console.log('T.show', tile.id);

    if ((tile.flipable || tile.isStash) && tile.defaultFrame) tile.frame = tile.defaultFrame;
    return tile;
};

T.hide = function (tile) {
    // console.log('T.hide', tile.id);
    if ((tile.flipable || tile.isStash) && tile.defaultFrame) tile.frame = 0;
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

