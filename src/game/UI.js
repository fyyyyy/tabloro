/*global Phaser, R, T, G, console, game*/
"use strict";

var UI = {};

UI.lines = [];
UI.timeout = null;

UI.init = function () {
    UI.group = game.add.group();

    //  The score
    // UI.gameText = game.add.text(0, 0, 'Table ||| '  + roomName, {
    //     font: '22px Arial',
    //     fill: '#ccc'
    // }, UI.group);
    // UI.gameText.alpha = 0.7;

    UI.nameText = game.add.text(0, 0, '----------------\nNAME:' + playerName, {
        font: '16px Helvetica',
        fill: '#ccc'
    }, UI.group);
    UI.nameText.align = 'right';
    UI.nameText.alpha = 0.7;
    UI.nameText.setShadow(1,2,'#000000');
    


    UI.messageText = game.add.text(0, 0, 'Messages:', {
        font: '14px monospace',
        fill: '#ccc'
    }, UI.group);
    UI.messageText.align = 'right';
    UI.messageText.alpha = 0.8;
    UI.messageText.setShadow(3,3,'#000000', 1);


    // UI.graphics = game.add.graphics(0, 0);
    // UI.graphics.lineStyle(5, 0x888888, 1);
    // UI.graphics.beginFill(0x333222111, 1);
    // UI.graphics.drawRect(
    //     Screen.x / 4,
    //     Screen.y / 4,
    //     Screen.x / 4,
    //     Screen.y / 4
    // );

    UI.chatInput = document.getElementById('chatInput');
    UI.chatFrame = document.getElementById('chatFrame');

    // UI.textElements = [UI.gameText, UI.nameText, UI.messageText];
    UI.textElements = [UI.nameText, UI.messageText];

    UI.update();

};


UI.sendChat = function () {
    if (chatInput.value.length > 0) {
        var text = chatInput.value;
        chatInput.value = '';
        Network.server.chat(text);
    }
};

UI.showChat = function () {
    chatFrame.style.setProperty('display', '');
    chatInput.focus();

};


UI.hideChat = function () {
    chatFrame.style.setProperty('display', 'none');
};

UI.chatVisible = function () {
    return chatFrame.style.getPropertyValue('display') !== 'none';
};


UI.update = function () {
    console.log('UI.update');

    R.forEach(UI.fixedToCamera(false))(UI.textElements);
    UI.messageText.x = game.camera.width - 230;
    // UI.gameText.x = 
    UI.nameText.x = 16;
    // UI.gameText.y = 5;
    UI.nameText.y = 16;
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
    UI.messageText.alpha = 0.8;
    var rawtext = R.join(' ', slice(arguments));

    var text = rawtext.match(/.{1,25}/g); // split string every 30 characters
    UI.lines = R.concat(text, UI.lines);

    if (UI.lines.length > 10) {
        UI.lines.pop();
    }

    console.log('rawtext', rawtext, rawtext.length);

    UI.messageText.setText(R.join('\n')(UI.lines) + '\n...');


    clearTimeout(UI.timeout);
    if(UI.messageTween) UI.messageTween.stop();

    UI.timeout = setTimeout(function() {
        UI.messageTween = game.add.tween(UI.messageText).to({
            alpha: 0
        }, 2000, Phaser.Easing.Linear.None, true);
    }, 10000);
};

UI.chat = function (userName, text) {
    UI.messageText.clearColors();
    UI.message(userName +  ': ' + text);
    UI.messageText.addColor('#5cb85c', 0);
    UI.messageText.addColor('#cccccc', userName.length + 1);
};

UI.setNames = function (names) {
    UI.nameText.setText(R.join('\n')(names));
    UI.nameText.addColor('#5cb85c', 0);
    UI.nameText.addColor('#cccccc', playerName.length);
    // UI.nameText.setText(R.join('-', new Array(gameName.length * 3)) + '\nTable: ' + roomName + '\n' + R.join('\n')(names));
};

UI.updateNames = function () {
    UI.setNames(R.concat([playerName], R.pluck('name', R.values(playerList))));
};
