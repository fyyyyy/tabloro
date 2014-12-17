"use strict";

var Cursor = {};

Cursor.new = function (client) {
    var cursor = players.create(0, 0, 'cursor' + client.cursor);
    cursor.name = client.name;
    cursor.addChild(
        game.add.text(40, 0, client.name, {
            font: '26px Arial',
            fill: '#fff'
        })
    );

    Cursor.set();
    return cursor;
};

Cursor.set = function () {
    game.canvas.setAttribute('style', 'cursor: url(/img/cursors/' + cursorId + '.png), auto;');
};

Cursor.reset = function (tile) {
    tile.events.onInputOut.add(Cursor.set);
    return tile;
};
