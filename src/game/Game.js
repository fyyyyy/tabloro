/*global Phaser, R, T, log, game, Utils, dynamicInvoke, stacks, console*/
"use strict";

var G = {};

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
    R.forEach(function (obj) {
        Utils.alignPosition(obj.follower, obj.target);
    })(G.updatePositions);
};

G.addUpdatePosition = function (obj) {
    G.updatePositions.push(obj);
};

G.removeUpdatePosition = function (target) {
    G.updatePositions = R.reject(R.propEq('target', target))(G.updatePositions);
};


G.findTile = function (tileId) {
    tileId = Number(tileId);
    var tile = R.find(R.propEq('id', tileId))(cards1.children);
    tile = tile || R.find(R.propEq('id', tileId))(tokens.children);
    tile = tile || R.find(R.propEq('id', tileId))(redDice.children);
    if (!tile) {
        console.error('tile not found', tileId);
        return {};
    }
    return tile;
};

G.findStack = function (stackId) {
    stackId = Number(stackId);
    var stack = R.find(R.propEq('id', stackId))(stacks.children);
    if (!stack) {
        console.error('stack not found', stackId, stack);
        return {};
    }
    return stack;
};
