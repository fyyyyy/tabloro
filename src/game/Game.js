/*global Phaser, R, T, log, game, Utils, dynamicInvoke, stacks, console*/
"use strict";

var G = {};

G._groups = {};
G._tiles = {};

G.addTile = function (tile) {
    G._tiles[tile.id] = tile;
};

G.groups = {
    add: function (groupName, index, rotateBy, flipable, handable, lockable) {
        // console.log('adding group', groupName);
        index = index || 0;
        rotateBy = rotateBy || 0;

        G._groups[groupName] = game.add.group();
        G._groups[groupName].z = index;
        G._groups[groupName].rotateBy = rotateBy;
        G._groups[groupName].flipable = flipable;
        G._groups[groupName].handable = handable;
        G._groups[groupName].lockable = lockable;
    },
    get: function (groupName) {
        return G._groups[groupName];
    },
    all: function () {
        return G._groups;
    }
};


G.init = function (game) {
    G.button = R.converge(
        game.add.button,
        R.always(0),
        R.always(0),
        R.always('button'),
        R.I,
        R.argN(1),
        R.always(1),
        R.always(0),
        R.always(2)
    ).bind(game.add);
};



G.addText = R.curryN(2, function (text, button, fn, fill) {
    fill = fill || '#ccc';
    var txtField = game.add.text(20, 20, text, {
        fontSize: '32px',
        fill: fill
    });
    if (fn) {
        fn(txtField, button);
    }
    button.setText = txtField.setText.bind(txtField);
    button.addChild(txtField);
    return button;
});

G.updatePositions = [];

G.update = function () {
    R.forEach(function (tile) {
        if (tile.follower && tile.follower.input.draggable) {
            if (tile.follower.relativePosition) {
                Utils.alignRelativePosition(tile.follower, tile.target);
                return;
            }
            Utils.alignPosition(tile.follower, tile.target);
        }
        if (tile.startRotatePosition) {
            var delta = Utils.delta(tile.startRotatePosition, Utils.getMousePosition());
            var rotateByDeg = Utils.rad2Deg(tile.parent.rotateBy);
            var rotationInDegree = Math.floor((- delta.x * 2 + delta.y  * 2 ) / rotateByDeg) * rotateByDeg;
            var rotationInRad = Utils.deg2Rad(rotationInDegree);
            tile.rotation = tile.startRotation + rotationInRad;
        }
    })(G.updatePositions);
};

G.addUpdatePosition = function (tile) {
    G.updatePositions.push(tile);
};

G.removeUpdatePosition = function (target) {
    G.updatePositions = R.reject(R.propEq('target', target))(G.updatePositions);
};

G.removeRotationPosition = function (id) {
    G.updatePositions = R.reject(R.propEq('id', id))(G.updatePositions);
};

G.findTile = function (tileId) {
    // tileId = Number(tileId);
    return G._tiles[tileId] || {};
};



G.findTiles = function (tileIds) {
    return R.map(function (tileId) {
        return G.findTile(tileId);
    })(tileIds);
};



// G.findStack = function (stackId) {
//     stackId = Number(stackId);
//     var stack = R.find(R.propEq('id', stackId))(stacks.children);
//     if (!stack) {
//         console.error('stack not found', stackId, stack);
//         return {};
//     }
//     return stack;
// };


G.saveSetup = function saveSetup() {
    console.log('saving Game Setup');
    Network.server.saveSetup();
    UI.message('Saved setup', gameName);
};
