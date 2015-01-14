/*global Phaser, R, T, G, console, game*/
"use strict";

var UI = {};

UI.lines = [];

UI.init = function () {

    //  The score
    UI.gameText = game.add.text(0, 0, 'table > '  + roomName, {
        font: 'bold 22px Arial',
        fill: '#ccc'
    });
    UI.gameText.alpha = 0.7;

    UI.nameText = game.add.text(0, 0, '----------------\nNAME:' + playerName, {
        font: 'bold 18px Arial',
        fill: '#ccc'
    });
    UI.nameText.align = 'right';
    UI.nameText.alpha = 0.7;


    UI.messageText = game.add.text(0, 0, 'Messages:', {
        font: '18px Arial',
        fill: '#ccc'
    });
    UI.messageText.align = 'right';
    UI.messageText.alpha = 0.5;

    // UI.graphics = game.add.graphics(0, 0);
    // UI.graphics.lineStyle(5, 0x888888, 1);
    // UI.graphics.beginFill(0x333222111, 1);
    // UI.graphics.drawRect(
    //     Screen.x / 4,
    //     Screen.y / 4,
    //     Screen.x / 4,
    //     Screen.y / 4
    // );


    UI.textElements = [UI.gameText, UI.nameText, UI.messageText];

    UI.update();
};



UI.update = function () {
    console.log('UI.update');

    R.forEach(UI.fixedToCamera(false))(UI.textElements);
    UI.gameText.x = UI.nameText.x = UI.messageText.x = 16;
    UI.gameText.y = 5;
    UI.nameText.y = 40;
    UI.messageText.y = 280;
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
    UI.messageText.alpha = 0.5;
    var text = R.join(' ', slice(arguments));
    text = text.match(/.{1,30}/g); // split string every 30 characters

    UI.lines = R.concat(text, UI.lines);

    if (UI.lines.length > 10) {
        UI.lines.pop();
    }

    UI.messageText.setText('-> ' + R.join('\n')(UI.lines) + '\n...');
    setTimeout(function() {
        game.add.tween(UI.messageText).to({
            alpha: 0
        }, 2000, Phaser.Easing.Linear.None, true);
    }, 2000);
};

UI.setNames = function (names) {
    UI.nameText.setText(R.join('\n')(names));
    // UI.nameText.setText(R.join('-', new Array(gameName.length * 3)) + '\nTable: ' + roomName + '\n' + R.join('\n')(names));
};

UI.updateNames = function () {
    UI.setNames(R.concat(['* ' + playerName + ' *'], R.pluck('name', R.values(playerList))));
};
