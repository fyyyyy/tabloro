"use strict";

var Assets = {};


Assets.preload = function (game) {
    var GameCursors = R.range(1, 55);

    R.forEach(function (cursor) {
        game.load.image('cursor' + cursor, '../img/cursors/' + cursor + '.png');
    })(GameCursors);

    game.load.image('table', 'assets/table_low.jpg');
    // game.load.image('vignette', 'vingnette.png');
    game.load.image('stack1', 'assets/stack1.png');
    game.load.image('stack2', 'assets/stack2.png');
    game.load.image('save', 'assets/save.png');
    game.load.image('move', 'assets/move.png');
    game.load.image('load', 'assets/load.png');
    game.load.image('rotate', 'assets/rotate.png');
    game.load.image('soldier', 'assets/soldier.png');
    game.load.image('farmer', 'assets/farmer.png');
    game.load.spritesheet('pieces', 'assets/pieces.png', 64, 64, 19);
    game.load.atlasXML('diceWhite', 'assets/diceWhite.png', 'assets/diceWhite.xml');
    game.load.spritesheet('button', 'assets/button_sprite_sheet.png', 193, 71);
    game.load.atlasJSONHash('tile', 'assets/carcassoneSheet.png', 'assets/carcassone.json');
    // game.load.atlasJSONHash('cursors', 'assets/cursors.png', 'assets/cursors.json');

};
