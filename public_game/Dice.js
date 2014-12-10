/*global Phaser, R, T, G, log, game, Utils, dynamicInvoke, stacks*/
"use strict";

var Dice = {};

Dice.add = function (group, num, tint) {
    tint = tint || 0xFFFFFF;
    var dice = group.create(500, 30 + (num * 70), 'diceWhite');

    dice.animations.add('spin', [0, 1, 2, 3, 4, 5]);

    // seed value
    dice.play('spin', 30);
    dice.animations.currentAnim.setFrame(num, true);

    T.draggable(dice);

    dice.tint = tint;
    Dice.spinnable(dice);
    Cursor.reset(dice);
    T.setId(dice);
    T.networkAble(dice);

    return dice;
};


Dice.spin = function spin(diceInGroup, delays, values) {
    R.forEach.idx(function (diceId, index) {
        var dice = G.findTile(diceId),
            delay = delays[index],
            value = values[index];

        log('spin', diceId, delay);
        dice.play('spin', 100, true);
        setTimeout(function () {
            log('dice stop spin');
            dice.animations.stop(null, false);
            dice.frame = value; // set dice to number of eyes
        }, delay - 200);

        game.add.tween(dice).to({
            rotation: delay / 20
        }, delay, Phaser.Easing.Cubic.Out, true, 0, false);
    })(diceInGroup);
};

Dice.onSpinClicked = function onSpinClicked(tile) {
    log('onSpinClicked', tile);
    var diceInGroup = R.pluck('id')(tile.parent.children);
    Network.server.spin(diceInGroup);
};


Dice.spinnable = function (tile) {
    tile.anchor.set(0.4);
    tile.events.onInputUp.add(Dice.onSpinClicked, this);
};
