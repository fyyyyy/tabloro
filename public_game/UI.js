/*global Phaser, R, T, G, console, game*/
"use strict";

var UI = {};

UI.lines = [];

UI.init = function () {

    //  The score
    UI.gameText = game.add.text(0, 0, 'C A R C A S S O N E', {
        font: 'bold 32px Times',
        fill: '#ccc'
    });

    UI.nameText = game.add.text(0, 0, '----------------\nNAME:' + playerName, {
        font: 'bold 22px Times',
        fill: '#ccc'
    });
    UI.nameText.align = 'right';


    UI.messageText = game.add.text(0, 0, 'Messages:', {
        font: '22px Times',
        fill: '#ccc'
    });
    UI.messageText.align = 'right';

    UI.textElements = [UI.gameText, UI.nameText, UI.messageText];

    UI.update();
};



UI.update = function () {
    log('UI.update');

    R.forEach(UI.fixedToCamera(false))(UI.textElements);
    UI.gameText.x = UI.nameText.x = UI.messageText.x = game.canvas.width - 400;
    UI.gameText.y = 16;
    UI.nameText.y = 46;
    UI.messageText.y = 260;
    R.forEach(UI.fixedToCamera(true))(UI.textElements);
};


UI.fixedToCamera = R.curry(function (bool, element) {
    element.fixedToCamera = bool;
    return element;
});


UI.handCursor = function (button) {
    button.input.useHandCursor = true;
    return button;
};

UI.message = function () {
    var text = R.join(' ', slice(arguments));
    text = text.match(/.{1,30}/g); // split string every 30 characters

    UI.lines = R.concat(text, UI.lines);

    if (UI.lines.length > 15) {
        UI.lines.pop();
    }

    UI.messageText.setText('-> ' + R.join('\n')(UI.lines) + '\n...');
};

UI.setNames = function (names) {
    UI.nameText.setText(R.join('-', new Array(41)) + '\nTable: ' + roomName + '\n' + R.join('\n')(names));
};

UI.updateNames = function () {
    UI.setNames(R.concat(['* ' + playerName + ' *'], R.pluck('name', R.values(playerList))));
};
