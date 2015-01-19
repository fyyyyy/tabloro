/*globals R, assets*/
"use strict";

var Assets = {};


Assets.preload = function (game) {
    var GameCursors = R.range(1, 55);

    R.forEach(function (cursor) {
        game.load.image('cursor' + cursor, '/img/cursors/' + cursor + '.png');
    })(GameCursors);

    // game.load.image('save', '/assets/save.png');
    game.load.image('flip', '/assets/flip.png');
    game.load.image('stack', '/assets/load.png');
    game.load.image('shuffle', '/assets/shuffle.png');
    game.load.image('hand', '/assets/hand.png');
    game.load.image('lock', '/assets/lock.png');
    game.load.image('table', '/assets/table_low.jpg');
    game.load.image('rotate', '/assets/rotate.png');
    game.load.spritesheet('button', '/assets/button_sprite_sheet.png', 193, 71);

    R.forEach(function (asset) {
        game.load[asset.method].apply(game.load, asset.args);
        console.log('loading', asset.method, asset.args);
    })(assets);
};
