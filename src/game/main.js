/*global Phaser, R, T, G, Controls, console, Network, window, UI, Assets, document*/
"use strict";




// retina display scaling
var Screen = {}, World = {width: 5000, height: 4000};
Screen.x = window.innerWidth;
Screen.y = window.innerHeight;

console.log('Screen size', Screen);

var game = new Phaser.Game(Screen.x, Screen.y, Phaser.CANVAS, 'boardgame', {
    preload: preload,
    create: Network.setup,
    update: update
});


var players;
var table;
var playerList = {};
var player = {};



var screenShot = function () {
    window.open(game.canvas.toDataURL());
};


function preload() {
    // game is available here
    Assets.preload(game);
}


function create() {
    if (G.created) {
        return;
    }
    G.created = true;
    setupStage();
    setupTable();

    setupAssets(assets);

    Controls.add(); // on top of tiles

    UI.init(); // do before players
    if (mode === 'play') { UI.showChat()};
    setupPlayers();
    Cursor.set();
    if(mode === 'play') Video.init();
    H.init();
}



function setupStage() {
    var please_wait = document.getElementById('please_wait');
    if(please_wait) please_wait.remove();
    game.stage.disableVisibilityChange = true; // loose tab focus, game will continue
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.fullScreenTarget = document.body;


    game.scale.onResize = UI.update;
    var canvas = game.canvas;

    canvas.id = "boardgame";
    // canvas.width = window.innerWidth * window.devicePixelRatio;
    // canvas.height = window.innerHeight * window.devicePixelRatio;
    // canvas.style.width = window.innerWidth + "px";
    // canvas.style.height = window.innerHeight + "px";
    // game.input.scale.set(window.devicePixelRatio);

    game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
    // game.canvas.style.setProperty('cursor', 'none');

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    
    game.world.setBounds(0, 0, World.width, World.height);
    game.scale.setScreenSize(true);


}


function gofull() {
    if (game.scale.isFullScreen) {
        game.scale.stopFullScreen();
        return;
    }
    game.scale.startFullScreen();
}


function setupTable() {
    var backgroundInput = game.add.image(0,0);
    backgroundInput.opacity = 0.0;
    backgroundInput.width = World.width;
    backgroundInput.height = World.height;
    backgroundInput.inputEnabled = true;
    backgroundInput.interactive = true;
    backgroundInput.buttonMode = true;
    backgroundInput.events.onInputDown.add(Controls.onStartSelection);
    backgroundInput.events.onInputUp.add(Controls.onStopSelection);


    table = game.add.tileSprite(0, 0, World.width, World.height, 'table');
    // table.scale.set(0.5);
    // vignette.scale.set(6);
    // vignette.fixedToCamera = true;
}


function buildAssetArray (asset, maxFrames) {
    var assetArray = [];
    for (var i = 0; i < maxFrames; i++) {
        R.times(function () {
            assetArray.push(i);
        })(asset.counts[i] || 1);
    }
    return assetArray;
}

function setupAssets (gameAssets) {
    var yOffset = 100;
    var maxFrames = 1;
    G.groups.add('tokens');

    R.forEach(function (asset) {
        yOffset += 150;

        var groupName = asset.args[0];
        var icon = 'fa-photo';

        console.log('adding asset group', groupName);

        G.groups.add(groupName, 0, Utils.deg2Rad(asset.rotateBy), asset.flipable, asset.handable, asset.lockable);


        if (asset.method === 'atlasJSONHash') {
            icon = 'fa-cube';
            maxFrames = game.cache.getFrameCount(groupName);
            addCards(groupName, yOffset, buildAssetArray(asset, maxFrames), G.groups.get(groupName));
        }

        if (asset.method === 'image') {
            addTokens(R.repeatN(groupName, asset.counts || maxFrames), G.groups.get(groupName), 100, yOffset);
        }

        if (asset.method === 'spritesheet') {
            icon = 'fa-th';

            maxFrames = asset.args[4];

            if (asset.isDice) {
                icon = 'fa-random';

                console.log('adding dice', R.head(R.of(asset.counts)));
                R.times(function () {
                    Dice.add(groupName, G.groups.get(groupName), maxFrames);
                })(R.head(R.of(asset.counts)) || 1);
            } else if (asset.isStash){
                addStash(groupName, yOffset, R.head(R.of(asset.counts)) || 1, G.groups.get(groupName));
            } else {
                addCards(groupName, yOffset, buildAssetArray(asset, maxFrames), G.groups.get(groupName));
            }
        }

        $('#layers').append(
            '<li>' + 
                '<a href="#" onclick="onArrangeLayer(\'' + groupName + '\')">' + 
                    '<i class="fa ' + icon + ' fa-fw"></i>&nbsp;' + 
                    groupName + 
                '</a>' +
        '</li>');
    })(gameAssets);
}

function onArrangeLayer (groupName) {
    console.log('arrangeLayers', groupName);
    Network.server.arrangeLayer(groupName);
}



function addStash (title, yOffset, array, group) {
    console.log('addStash', title, yOffset, array, group);
    var offsetX = 0;
    
    R.times(function (n) {
        var tile = group.create(offsetX, yOffset, title, n);
        tile.defaultFrame = 1;
        tile.isStash = true;
        R.compose(T.setId, Cursor.reset, T.networkAble, T.lockable(true), T.draggable, T.centerAnchor)(tile);
        T.hide(tile);

    })(array);
    
}



function addCards(title, yOffset, array, group) {
    var last;
    var tempOffsetX = 0;
    var tempOffsetY = 0;
    var nOffsetX = 0;
    var nOffsetY = 0;
    var offsetX = 0;

    R.forEach(function (n) {
        if (n === last) { // same frame
            tempOffsetY += S.offsetY;
            tempOffsetX += S.offsetX;
        } else {
            nOffsetX++;
            tempOffsetX = 0;
            tempOffsetY = 0;
        }
        offsetX = 100 + (nOffsetX * 120) + tempOffsetX;
        if (offsetX >= World.width) {
            nOffsetX = 0;
            nOffsetY+= 100;
        }
        var tile = group.create(offsetX, yOffset + tempOffsetY + nOffsetY, title, n);
        tile.defaultFrame = n;
        R.compose(T.setId, Cursor.reset, T.networkAble, T.lockable(group.lockable), T.stackable, T.flipable(group.flipable), T.rotateable(group.rotateBy), T.handable(group.handable),  T.draggable, T.centerAnchor)(tile);

        Controls.target = tile;
        last = n;
        // console.log('tile created', tile.id);
    })(array);
    return Controls.target;
}



function addTokens(which, group, x, y, scale) {
    x = x || 100;
    y = y || 300;
    scale = scale || 1.0;
    R.forEach.idx(function (n, idx) {
        var token = group.create(x + (S.offsetX * idx), y + (S.offsetY * idx ), n);
        T.setId(token);
        T.scale(scale, token);
        R.compose(Cursor.reset, T.networkAble,  T.rotateable(group.rotateBy), T.lockable(group.lockable), T.handable(group.handable), T.draggable, T.centerAnchor)(token);
    })(which);
}



function setupPlayers() {
    UI.updateNames();
    players = game.add.group();
    players.z = 17;
    player = {cursor: cursorId, name: playerName};
}



function update() {
    if (Network.ready === false) return;
    G.update();
    Controls.update();
    H.update();


    var mouseWorldPosition = Utils.getMousePosition();


    if (game.input.keyboard.isDown(Phaser.Keyboard.UP)
        || game.input.keyboard.isDown(Phaser.Keyboard.W) && !UI.chatVisible())
    {
        game.camera.y -= 50;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN)
             || game.input.keyboard.isDown(Phaser.Keyboard.S) && !UI.chatVisible())
    {
        game.camera.y += 50;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT)
             || game.input.keyboard.isDown(Phaser.Keyboard.A) && !UI.chatVisible())
    {
        game.camera.x -= 50;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)
             || game.input.keyboard.isDown(Phaser.Keyboard.D) && !UI.chatVisible())
    {
        game.camera.x += 50;   
    } else if(!G.enterDelay && game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        console.log('ENTER pressed');
        if (UI.chatVisible()) {
            UI.sendChat();
            UI.hideChat();
        } else {
            console.log('showChat');
            UI.showChat();
        }
        G.enterDelay = true;
        setTimeout(function() { G.enterDelay = false; }, 200);
    }


    if (game.input.mouse.event) {
        // console.log(game.input.mouse.event)
        if (game.input.mouse.event.wheelDeltaX) {
            game.camera.x -= game.input.mouse.event.wheelDeltaX;
        }
        if (game.input.mouse.event.wheelDeltaY) {
            game.camera.y -= game.input.mouse.event.wheelDeltaY;
        }
    }


    // Utils.alignPosition(player, mouseWorldPosition);

    if (!player.lastPosition
        || (player.lastPosition.x != mouseWorldPosition.x)
        || (player.lastPosition.y != mouseWorldPosition.y)) {
        Network.server.moveCursor(mouseWorldPosition);
        player.lastPosition = mouseWorldPosition;
    }
        // console.log('nothign changed');

}
