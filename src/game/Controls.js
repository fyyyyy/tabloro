/*global R, T, G, Utils, game*/
"use strict";

var Controls = {};
var cursors;

Controls.selected = [];

Controls.getSelected = function (tile) {
    if (Controls.selected.length) {
        return Controls.selected;
    }
    return [tile];
};

Controls.add = function () {
    Controls.controls = game.add.group();
    Controls.controls.position.set(-100);
    
    Controls.rotationControls = Controls.controls.create(0, 0, 'rotate');
    Controls.flipControls = Controls.controls.create(50, 0, 'flip');
    Controls.stackControls = Controls.controls.create(100, 0, 'stack');
    Controls.shuffleControls = Controls.controls.create(150, 0, 'shuffle');
    Controls.handControls = Controls.controls.create(150, 0, 'hand');
    Controls.lockControls = Controls.controls.create(150, 0, 'lock');
    
    Controls.rotationControls.scale.set(0.7);
    
    T.centerAnchor(Controls.rotationControls);
    T.centerAnchor(Controls.flipControls);
    T.centerAnchor(Controls.stackControls);
    T.centerAnchor(Controls.shuffleControls);
    T.centerAnchor(Controls.handControls);
    T.centerAnchor(Controls.lockControls);
    
    Controls.rotationControls.inputEnabled = true;
    Controls.rotationControls.input.useHandCursor = true;
    Controls.rotationControls.events.onInputUp.add(T.onRotate);
    
    Controls.flipControls.inputEnabled = true;
    Controls.flipControls.input.useHandCursor = true;
    Controls.flipControls.events.onInputUp.add(T.onFlip);

    Controls.stackControls.inputEnabled = true;
    Controls.stackControls.input.useHandCursor = true;
    Controls.stackControls.events.onInputUp.add(S.onTidy);
    
    Controls.shuffleControls.inputEnabled = true;
    Controls.shuffleControls.input.useHandCursor = true;
    Controls.shuffleControls.events.onInputUp.add(S.onShuffle);

    Controls.handControls.inputEnabled = true;
    Controls.handControls.input.useHandCursor = true;
    Controls.handControls.events.onInputUp.add(T.onTake);

    Controls.lockControls.inputEnabled = true;
    Controls.lockControls.input.useHandCursor = true;
    Controls.lockControls.events.onInputUp.add(T.onLock);
    
    Cursor.reset(Controls.rotationControls);
    Cursor.reset(Controls.flipControls);
    Cursor.reset(Controls.stackControls);
    Cursor.reset(Controls.shuffleControls);
    Cursor.reset(Controls.handControls);
    Cursor.reset(Controls.lockControls);

    Controls.graphics = game.add.graphics(0, 0);
    Controls.graphics.lineStyle(10, 0xFFFFFF, 0.8);
    Controls.graphics.beginFill(0xAABBEE, 0.3);
};


Controls.setTarget = function (target) {
    Controls.target = target;
    Controls.hide();
    Controls.assignRelativePositions(target);
    return target;
};


Controls.assignRelativePositions = function (target) {
    R.forEach(S.assignRelativePosition(target))(Controls.selected);
};


Controls.at = function (tile) {
    Controls.show(tile);
    Utils.toCorner(Controls.controls, tile);
};

Controls.show = function (tile) {
    Controls.positionX = 0;  

    Controls.controls.visible = true;
    // single tile
    Controls.position(Controls.flipControls, tile.flipable);
    Controls.position(Controls.rotationControls, tile.rotateable && !Controls.selected.length);
    Controls.position(Controls.handControls, tile.handable && !Controls.selected.length);
    console.log('lockable check');
    Controls.position(Controls.lockControls, tile.lockable && !Controls.selected.length);
    if (tile.input.draggable) {
        Controls.lockControls.tint = 0xFFFFFF;
    } else {
        Controls.lockControls.tint = 0xFF3366;
    }
    // multi selection
    Controls.position(Controls.stackControls, Controls.selected.length && !tile.isDice);
    Controls.position(Controls.shuffleControls, Controls.selected.length && !tile.isDice);
};

Controls.position = function (controlButton, condition) {
    if (condition) {
        controlButton.visible = true;
        controlButton.x = Controls.positionX;
        Controls.positionX += controlButton.width;
    } else {
        controlButton.visible = false;
    }
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


// multi select

Controls.onStartSelection = function (target, point) {
    console.log('onStartSelection');
    Controls.hide();
    Controls.selecting = true;
    Controls.rect = {x: point.worldX, y: point.worldY};
};


Controls.sanitizeRect = function (rect) {
    var newRect = {};
    
    if (rect.width < 0) {
        newRect.x = rect.x + rect.width;
        newRect.width =  - rect.width;
    } else {
        newRect.x = rect.x;
        newRect.width = rect.width;
    }
    
    if (rect.height < 0) {
        newRect.y = rect.y + rect.height;
        newRect.height =  - rect.height;
    } else {
        newRect.y = rect.y;
        newRect.height = rect.height;
    }
    return newRect;
};


Controls.onStopSelection = function () {
    console.log('onStopSelection');
    Controls.selecting = false;
    Controls.graphics.clear();
    if (Controls.selected.length) {
        Controls.at(Controls.setTarget(Controls.selected[0]));
    }
};


Controls.findSelectedTiles = function (rect) {
    var selected = [];
    R.mapObj(function (group) {
        R.forEach(function (child) {
           var found = Utils.pointIntersection(child, rect);
           if (found && child.input.draggable) {
                T.select(child);
                selected.push(child);
           } else {
                T.deselect(child);
           }
        })(group.children);
        
    })(G.groups.all());

    return selected;
};


Controls.dragAlong = function (tiles) {
    if (T.dragging) {
        R.forEach(S.moveRelativeTo(Controls.target))(tiles);
    }
};


Controls.update = function () {
    if (Controls.selecting) {
        if (game.input.mouse.event) {
            Controls.rect.width =  game.input.activePointer.worldX - Controls.rect.x;
            Controls.rect.height = game.input.activePointer.worldY - Controls.rect.y;
            Controls.graphics.clear();

            Controls.selected = Controls.findSelectedTiles(Controls.sanitizeRect(Controls.rect));

            Controls.graphics.drawRect(
                Controls.rect.x,
                Controls.rect.y,
                Controls.rect.width,
                Controls.rect.height
            );

        }
    }
    else if (Controls.selected.length) {
        if (game.input.mouse.event) {
            Controls.dragAlong(Controls.selected);  
        }
    }
};

Controls.verifySelection = function (tile) {
    if (!R.contains(tile)(Controls.selected)) {
        Controls.deselectAll();
        console.debug('Tile not in selection, dropping selection');
    }
};


Controls.deselectAll = function () {
    R.forEach(T.deselect)(Controls.selected);
    Controls.selected = [];
};
