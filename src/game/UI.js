/*global Phaser, R, T, G, console, game*/
"use strict";

var UI = {};

UI.lines = [];
UI.menuLines = [];
UI.timeout = null;

UI.init = function () {
    UI.group = game.add.group();

    //  The score
    // UI.gameText = game.add.text(0, 0, 'Table ||| '  + roomName, {
    //     font: '22px Arial',
    //     fill: '#ccc'
    // }, UI.group);
    // UI.gameText.alpha = 0.7;
    UI.graphics = game.add.graphics(0, 0);
    UI.group.addChild(UI.graphics);

    UI.nameText = game.add.text(0, 0, '----------------\nNAME:' + playerName, {
        font: '16px Helvetica',
        fill: '#ccc'
    }, UI.group);
    UI.nameText.align = 'right';
    UI.nameText.alpha = 0.7;
    UI.nameText.setShadow(1,2,'#000000');
    



    UI.messageText = game.add.text(0, 0, 'Messages:', {
        font: '18px monospace',
        fill: '#fff'
    }, UI.group);
    UI.messageText.align = 'right';
    UI.messageText.alpha = 1.0;
    UI.messageText.setShadow(3,3,'#000000', 1);



    UI.chatInput = document.getElementById('chatInput');
    UI.chatFrame = document.getElementById('chatFrame');

    // UI.textElements = [UI.gameText, UI.nameText, UI.messageText];
    UI.textElements = [UI.nameText, UI.messageText, UI.graphics];

    UI.chatSound = game.add.audio('chatSound');
    UI.disconnectSound = game.add.audio('disconnectSound');


    UI.update();

};

UI.gofull = function () {
    if (game.scale.isFullScreen) {
        game.scale.stopFullScreen();
        return;
    }
    game.scale.startFullScreen();
};

UI.listGroupsInMenu = function() {
    var groups = G._masterGroup.children;
    console.log('UI.listGroupsInMenu', groups);
    var i = 0;
    $('#layers').children().slice(1,99).remove();
    R.forEach(function (group) {
        $('#layers').append(
            '<li>' + 
                '<a href="#" onclick="UI.onArrangeLayer(\'' + group.name + '\')">' + 
                    ++i + '. ' +
                    '<i class="fa fa-arrow-up fa-fw"></i>&nbsp;' + 
                    group.name + 
                '</a>' +
        '</li>');
    })(R.reverse(groups));
};


UI.onArrangeLayer = function (groupName) {
    console.log('arrangeLayers', G._masterGroup.children);
    Network.server.arrangeLayer(groupName);
};

UI.enterPressed = function () {
    if (UI.enterDelay) {
        return;
    }
    console.log('ENTER pressed');
        if (UI.chatVisible()) {
            UI.sendChat();
            UI.hideChat();
        } else {
            console.log('showChat');
            UI.showChat();
        }
        UI.enterDelay = true;
        setTimeout(function() { UI.enterDelay = false; }, 200);
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
    UI.messageText.x = game.camera.width - 280;
    // UI.gameText.x = 
    UI.nameText.x = 16;
    // UI.gameText.y = 5;
    UI.nameText.y = 16;
    UI.messageText.y = 280;

    Utils.alignPosition(UI.graphics, UI.messageText);
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

UI.hudMessage = function () {
    UI.messageText.alpha = 1.0;
    UI.graphics.alpha = 1.0;
    var rawtext = R.join(' ', slice(arguments));

    var text = rawtext.match(/.{1,25}/g); // split string every 30 characters
    
    
    // chat text
    UI.lines = R.concat(text, UI.lines);
    if (UI.lines.length > 10) {
        UI.lines.pop();
    }
    UI.messageText.setText(R.join('\n')(UI.lines) + '\n...');

    
    UI.log(rawtext);

    UI.graphics.clear();
    UI.graphics.lineStyle(1, 0x888888, 1);
    UI.graphics.beginFill(0x333222111, 0.5);
    UI.graphics.drawRect(
        - 10,
         - 10,
        UI.messageText.width + 20,
        UI.messageText.height + 20
    );


    clearTimeout(UI.timeout);
    if(UI.messageTween)  UI.messageTween.stop();
    if(UI.graphicsTween) UI.graphicsTween.stop();

    UI.timeout = setTimeout(function() {
        UI.messageTween = game.add.tween(UI.messageText).to({
            alpha: 0
        }, 2000, Phaser.Easing.Linear.None, true);
        UI.graphicsTween = game.add.tween(UI.graphics).to({
            alpha: 0
        }, 2000, Phaser.Easing.Linear.None, true);
    }, 10000);
};


// Menu message
UI.log = function (text) {
    // menu chat text
    var rawtext = R.join(' ', slice(arguments));

    UI.menuLines = R.concat([rawtext], UI.menuLines);
    if (UI.menuLines.length > 30) {
        UI.menuLines.pop();
    }
    $('#menu-chat-text').html(R.join('<br><br>')(UI.menuLines));
};

UI.chat = function (userName, text, sound) {
    UI.messageText.clearColors();
    UI.hudMessage(userName +  ': ' + text);
    UI.messageText.addColor('#5cb85c', 0);
    UI.messageText.addColor('#cccccc', userName.length + 1);
    if (sound) {
        sound.play();
        return;
    }
    if (playerName.toLowerCase() !== userName.toLowerCase()) UI.chatSound.play();
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
