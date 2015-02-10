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
    Assets.preload(game);
}


function create() {
    if (G.created) {
        return;
    }
    setupStage();
    setupTable();

    G.init(game);
    
    var sortByValue = R.sortBy(R.prop('order'));

    setupAssets(sortByValue(assets));
    UI.listGroupsInMenu();


    Controls.add(); // on top of tiles

    UI.init(); // do before players
    setupPlayers();
    Cursor.set();
    if(mode === 'play') Video.init();
    H.init();
}



function setupStage() {
    game.stage.disableVisibilityChange = true; // loose tab focus, game will continue
    var please_wait = document.getElementById('please_wait');
    if(please_wait) please_wait.remove();
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

    game.canvas.oncontextmenu = function (e) { e.preventDefault(); };
    // game.canvas.style.setProperty('cursor', 'none');

    //  We're going to be using physics, so enable the Arcade Physics system
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //  A simple background for our game
    
    game.world.setBounds(0, 0, World.width, World.height);
    game.scale.setScreenSize(true);
    game.stage.disableVisibilityChange = true; // loose tab focus, game will continue


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
    var lastOrder;
    var lastGroup;

    R.forEach(function (asset) {
        yOffset += 150;
        var groupName;
        var group;

        groupName = asset.args[0];

        if (lastOrder && lastOrder === asset.order) {
            group = lastGroup;
        } else {
            group = G.groups.add(groupName, asset.order || 0, asset);
        }

        console.log('adding asset group', groupName);


        if (asset.method === 'atlasJSONHash') {
            maxFrames = game.cache.getFrameCount(groupName);
            addCards(groupName, yOffset, buildAssetArray(asset, maxFrames), group);
        }

        if (asset.method === 'image') {
            addTokens(R.repeatN(groupName, asset.counts || maxFrames), group, 100, yOffset);
        }

        if (asset.method === 'spritesheet') {

            maxFrames = asset.args[4];

            if (asset.isDice) {
                console.log('adding dice', R.head(R.of(asset.counts)));
                R.times(function () {
                    Dice.add(groupName, group, maxFrames);
                })(R.head(R.of(asset.counts)) || 1);
            } else if (asset.isStash){
                addStash(groupName, yOffset, R.head(R.of(asset.counts)) || 1, group);
            } else {
                addCards(groupName, yOffset, buildAssetArray(asset, maxFrames), group);
            }
        }

        lastOrder = asset.order;
        lastGroup = group;
    })(gameAssets);

}




function addStash (title, yOffset, array, group) {
    console.log('addStash', title, yOffset, array, group);
    var offsetX = 0;
    
    R.times(function (n) {
        var tile = group.create(offsetX, yOffset, title, n);
        tile.defaultFrame = 1;
        tile.isStash = true;
        R.compose(T.setId, Cursor.reset, T.networkAble, T.draggable, T.centerAnchor)(tile);
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
    players.name = 'players';
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
    } else if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        UI.enterPressed();
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
