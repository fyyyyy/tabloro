/*global Phaser, R, T, log, game, Utils, dynamicInvoke, stacks, console*/
"use strict";

var G = {};

G._groups = {};
G._tiles = {};

G.addTile = function (tile) {
    G._tiles[tile.id] = tile;
};

G.groups = {
    add: function (groupName, index, asset) {
        // console.log('adding group', groupName);
        index = index || 0;

        G._groups[groupName] = G._masterGroup.add(game.add.group());
        G._groups[groupName].z = index;
        G._groups[groupName].name = groupName;
        G._groups[groupName].rotateBy = Utils.deg2Rad(asset.rotateBy) || 0;
        G._groups[groupName].flipable = asset.flipable;
        G._groups[groupName].handable = asset.handable;
        G._groups[groupName].lockable = asset.lockable;
        G._groups[groupName].icon = G.getIcon(asset);
    },
    get: function (groupName) {
        return G._groups[groupName];
    },
    all: function () {
        return G._groups;
    }
};

G.getIcon = function (asset) {
    if (asset.method === 'spritesheet') {
        if (asset.isDice) {
            return 'fa-random';
        }
        return 'fa-th';
    }
    if (asset.method === 'atlasJSONHash') {
        return 'fa-cube';
    }
    return 'fa-photo';
};



G.init = function (game) {
    G.created = true;

    G._masterGroup = game.add.group();

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
