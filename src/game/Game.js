/*global Phaser, R, T, log, game, Utils, dynamicInvoke, stacks, console*/
"use strict";

var G = {};

G._groups = {};
G._tiles = {};


G.init = function (game) {
    G.created = true;
    G._masterGroup = game.add.group();
};


G.addTile = function (tile) {
    G._tiles[tile.id] = tile;
};


G.groups = {
    add: function (groupName, index, asset) {
        // console.log('adding group', groupName);
        index = index || 0;
        var group = G._masterGroup.add(game.add.group());
        group.z = index;
        group.name = groupName;
        group.rotateBy = Utils.deg2Rad(asset.rotateBy) || 0;
        group.flipable = asset.flipable;
        group.handable = asset.handable;
        group.lockable = asset.lockable;
        group.icon = G.getIcon(asset);

        G._groups[groupName] = group;
        return group;
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
        return 'fa-th-list';
    }
    return 'fa-photo';
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



G.saveSetup = function saveSetup() {
    console.log('saving Game Setup');
    Network.server.saveSetup();
    UI.chat('Saved setup', gameName);
};
