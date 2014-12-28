"use strict";

var Assets = {};


Assets.preload = function (game) {
    var GameCursors = R.range(1, 55);

    R.forEach(function (cursor) {
        game.load.image('cursor' + cursor, '/img/cursors/' + cursor + '.png');
    })(GameCursors);

    game.load.image('table', '/assets/table_low.jpg');
    game.load.image('stack1', '/assets/stack1.png');
    game.load.image('stack2', '/assets/stack2.png');
    // game.load.image('save', '/assets/save.png');
    // game.load.image('move', '/assets/move.png');
    // game.load.image('load', '/assets/load.png');
    game.load.image('rotate', '/assets/rotate.png');
    game.load.spritesheet('button', '/assets/button_sprite_sheet.png', 193, 71);
    // game.load.spritesheet('pieces', '/assets/pieces.png', 64, 64, 19);

    R.forEach(function (asset) {
        game.load[asset.method].apply(game.load, asset.urls);
    })(assets);
};
