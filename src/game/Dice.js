/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks*/
"use strict";

var Dice = {};

Dice.add = function (assetName, group, numSides, tint) {
    tint = tint || 0xFFFFFF;
    var dice = group.create(100 + 80 * group.children.length, 100, assetName);
    group.numSides = numSides;

    dice.animations.add('spin', R.range(0, numSides));

    // seed value
    dice.play('spin', 30);
    dice.animations.currentAnim.setFrame(0, true);

    T.draggable(dice);

    dice.tint = tint;
    Dice.spinnable(dice);
    Cursor.reset(dice);
    T.setId(dice);
    T.networkAble(dice);

    return dice;
};


Dice.spin = function spin(diceInGroup, delays, values) {
    console.log('diceInGroup', diceInGroup);
    R.forEach.idx(function (diceId, index) {
        var dice = G.findTile(diceId),
            delay = delays[index],
            value = values[index];

        console.log('spin', diceId, value);
        dice.play('spin', 100, true);
        setTimeout(function () {
            console.log('dice stop spin');
            dice.animations.stop(null, false);
            dice.frame = value; // set dice to number of eyes
        }, delay - 200);

        game.add.tween(dice).to({
            rotation: delay / 20
        }, delay, Phaser.Easing.Cubic.Out, true, 0, false);
    })(diceInGroup);
};

Dice.onSpinClicked = function onSpinClicked(tile) {
    console.log('onSpinClicked', tile);
    var diceInGroup = R.pluck('id')(tile.parent.children);

    if (mode === 'test') {
        var delays = R.map(function () {
            return Math.floor(300 + 567 * Math.random());
        })(diceInGroup);

        var values = R.map(function () {
            return Math.floor(Math.random() * tile.parent.numSides);
        })(diceInGroup);
        Dice.spin(diceInGroup, delays, values);
    } else {
        Network.server.spin(diceInGroup, tile.parent.numSides);
    }
};


Dice.spinnable = function (tile) {
    tile.anchor.set(0.4);
    tile.events.onInputUp.add(Dice.onSpinClicked, this);
};
