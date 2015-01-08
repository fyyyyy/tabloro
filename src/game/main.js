/*global Phaser, R, T, G, console, Network, random, window, UI, Assets, document*/
"use strict";




// retina display scaling
var Screen = {}, World = {width: 4000, height: 2000};
Screen.x = window.innerWidth *  window.devicePixelRatio;
Screen.y = window.innerHeight *  window.devicePixelRatio;

console.log('Screen size', Screen);

var game = new Phaser.Game(Screen.x, Screen.y, Phaser.CANVAS, 'boardgame', {
    preload: preload,
    create: Network.setup,
    update: update
});


var redDice;
var stacks;
var players;
var table;
var playerList = {};
var player = {};

var stack1;
var stack2;

var chatInput;

var screenShot = function () {
    window.open(game.canvas.toDataURL());
};


function preload() {
    // game is available here
    chatInput = document.getElementById('chatInput');
    Assets.preload(game);
}


function create() {
    setupStage();
    setupTable();

    if (mode === 'test') {
        setupAssets(assets);
    } else {
        setupTiles();
    }
    Controls.add(); // on top of tiles

    UI.init(); // do before players
    setupPlayers();
    Cursor.set();
    Video.init();
}



function setupStage() {
    var please_wait = document.getElementById('please_wait');
    if(please_wait) please_wait.remove();
    game.stage.disableVisibilityChange = true; // loose tab focus, game will continue
    game.scale.scaleMode = Phaser.ScaleManager.RESIZE;
    game.scale.setScreenSize(true);
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
}



function setupTable() {
    table = game.add.tileSprite(0, 0, World.width, World.height, 'table');
    // table.scale.set(1.5);
    // table.interactive = false;
    // table.buttonMode = true;

    // vignette.scale.set(6);
    // vignette.fixedToCamera = true;
}


function buildAssetArray (asset, maxFrames) {
    var assetArray = [];
    for (var i = 0; i < maxFrames; i++) {
        R.times(function (n) {
            assetArray.push(i);
        })(asset.counts[i] || 1);
    }
    return assetArray;
}

function setupAssets (gameAssets) {
    var yOffset = 200;
    var maxFrames = 1;
    G.groups.add('tokens');

    R.forEach(function (asset) {
        yOffset += 150;

        var groupName = asset.args[0];
        console.log('adding asset group', groupName);
        G.groups.add(groupName, 0, Utils.deg2Rad(asset.rotateBy));


        if (asset.method === 'atlasJSONHash') {
            maxFrames = game.cache.getFrameCount(groupName);
            addCards(groupName, yOffset, buildAssetArray(asset, maxFrames), G.groups.get(groupName));
        }

        if (asset.method === 'image') {
            addTokens(R.repeatN(groupName, asset.counts || maxFrames), G.groups.get(groupName), 100, yOffset);
        }

        if (asset.method === 'spritesheet') {
            maxFrames = asset.args[4];
            if (asset.isDice) {
                console.log('adding dice', asset.counts[0]);
                R.times(function () {
                    Dice.add(groupName, G.groups.get(groupName), maxFrames);
                })(asset.counts[0] || 1);
            } else {
                addCards(groupName, yOffset, buildAssetArray(asset, maxFrames), G.groups.get(groupName));
            }
        }
    })(gameAssets);
}



function setupTiles () {
    stacks = game.add.group();
    redDice = game.add.group();

    G.init(game);
    stack1 = S.create({
        image: 'stack1',
        x: 400,
        y: 300,
        shuffle: true,
        hidden: true
    });
    stack2 = S.create({
        image: 'stack2',
        x: 100,
        y: 300,
        shuffle: true,
        hidden: false
    });

    G.groups.add('cards1', 15);

    addCards('tile', 500, R.range(1, 49), G.groups.get('cards1'), stack1, 0.5);

    G.groups.add('tokens', 16, Math.PI / 2);
    
    addTokens(R.repeatN('soldier', 7), G.groups.get('tokens'), 330, 60, 0x303320, 0.6); // black
    addTokens(R.repeatN('soldier', 7), G.groups.get('tokens'), 400, 60, 0x33BBFF, 0.6); // blue
    addTokens(R.repeatN('soldier', 7), G.groups.get('tokens'), 470, 60, 0xDD3333, 0.6); // red
    addTokens(R.repeatN('soldier', 7), G.groups.get('tokens'), 540, 60, 0x22CC22, 0.6); // green
    addTokens(R.repeatN('soldier', 7), G.groups.get('tokens'), 610, 60, 0xFFEE22, 0.6); // purple
    addTokens(R.repeatN('soldier', 7), G.groups.get('tokens'), 680, 60, 0xFFFFFF, 0.6); // white

    // dice
    Dice.add('diceWhite', redDice, 6, 0xDD3333);
    Dice.add('diceWhite', redDice, 6, 0xDD3333);
}

function addCards(title, yOffset, array, group, stack, scale) {
    scale = scale || 1.0;
    var cards = [];
    var last;
    var tempOffset = 0;

    R.forEach(function (n) {
        if (n === last) {
            tempOffset -= 3;
        } else {
            tempOffset = 0;
        }
        var tile = group.create(100 + (n * 120), yOffset + tempOffset, title, n);
        tile.defaultFrame = n;
        if (stack && stack.config.hidden) T.hide(tile);
        T.scale(scale, tile);
        T.setDefaultTint(0xEEEEEE, tile);
        R.compose(T.setId, Cursor.reset, T.networkAble, T.stackable, T.rotateable(group.rotateBy), T.draggable, T.centerAnchor)(tile);
        cards.push(tile.id);
        Controls.target = tile;
        last = n;
        // console.log('tile created', tile.id);
    })(array);
    // S.updateCards(stack, cards);
    return Controls.target;
}



function addTokens(which, group, x, y, tint, scale) {
    tint = tint || 0xFFFFFF;
    x = x || 100;
    y = y || 300;
    scale = scale || 1.0;
    R.forEach.idx(function (n, idx) {
        var token = group.create(x + idx, y - (idx * 3), n);
        T.setId(token);
        T.scale(scale, token);
        T.setDefaultTint(tint, token);
        R.compose(Cursor.reset, T.networkAble, T.rotateable(group.rotateBy), T.draggable, T.centerAnchor)(token);
    })(which);
}



function setupPlayers () {
    UI.updateNames();
    players = game.add.group();
    players.z = 17;
    player = {cursor: cursorId, name: playerName};
}



function update() {
    if (Network.ready === false) return;
    if(mode === 'play') S.update();
    G.update();


    var mouseWorldPosition = {
        x: Math.floor(game.input.activePointer.worldX),
        y: Math.floor(game.input.activePointer.worldY)
    };


    if (game.input.keyboard.isDown(Phaser.Keyboard.UP))
    {
        game.camera.y -= 30;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
    {
        game.camera.y += 30;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
        game.camera.x -= 30;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
        game.camera.x += 30;
    } else if(game.input.keyboard.isDown(Phaser.Keyboard.ENTER)) {
        if (chatInput.value.length > 0) {
            var text = chatInput.value;
            chatInput.value = '';
            Network.server.chat(text);
        }
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

    if (!player.lastPosition || (player.lastPosition.x != mouseWorldPosition.x) || (player.lastPosition.y != mouseWorldPosition.y)) {
        Network.server.moveCursor(mouseWorldPosition);
        player.lastPosition = mouseWorldPosition;
    }
        // console.log('nothign changed');

}
