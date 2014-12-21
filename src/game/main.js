/*global Phaser, R, T, G, console, Network, random, window, UI, Assets, document*/
"use strict";




// retina display scaling
var Screen = {}, World = {width: 4000, height: 2000};
Screen.x = window.innerWidth *  window.devicePixelRatio;
Screen.y = window.innerHeight *  window.devicePixelRatio;

console.log('Screen size', Screen);

var game = new Phaser.Game(Screen.x, Screen.y, Phaser.AUTO, 'boardgame', {
    preload: preload,
    create: Network.setup,
    update: update
});


var redDice;
var blueDice;
var cards1;
var stacks;
var tokens;
var players;
var table;
var playerList = {};
var player = {};

var stack1;
var stack2;

var chatInput;


function preload() {
    // game is available here
    chatInput = document.getElementById('chatInput');
    Assets.preload(game);
}


function create() {
    setupStage();
    setupTable();

    setupTiles();
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



function addCards(array, group, stack) {
    var cards = [];
    R.forEach(function (n) {
        var tile = group.create(100, 100, 'tile', n);
        tile.defaultFrame = n;
        if (stack && stack.config.hidden) T.hide(tile);
        T.scale(0.5, tile);
        T.setDefaultTint(0xEEEEEE, tile);
        R.compose(T.setId, Cursor.reset, T.networkAble, T.stackable, T.rotateable, T.draggable, T.centerAnchor)(tile);
        cards.push(tile.id);

        Controls.target = tile;
        // console.log('tile created', tile.id);
    })(array);
    // S.updateCards(stack, cards);
    return Controls.target;
}



function addTokens(which, tint, x, y) {
    R.forEach.idx(function (n, idx) {
        var token = tokens.create(x + idx, y - (idx * 2), n);
        T.setId(token);
        T.scale(0.6, token);
        T.setDefaultTint(tint, token);
        R.compose(Cursor.reset, T.networkAble, T.rotateable, T.draggable, T.centerAnchor)(token);
    })(which);
}



function setupTiles () {
    stacks = game.add.group();
    redDice = game.add.group();
    blueDice = game.add.group();

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

    cards1 = game.add.group();
    cards1.z = 15;
    cards1.rotateBy = Math.PI / 2;


    addCards(R.concat(R.range(1, 38), R.range(40, 49)), cards1, stack1);

    var startTile = addCards([39], cards1);
    startTile.rotation += Math.PI;
    startTile.x = Screen.x / 2;
    startTile.y = Screen.y / 2;

    tokens = game.add.group();
    tokens.z = 16;
    tokens.rotateBy = Math.PI / 2;
    addTokens(R.repeatN('soldier', 10), 0x303320, 330, 60); // black
    addTokens(R.repeatN('soldier', 10), 0x33BBFF, 400, 60); // blue
    addTokens(R.repeatN('soldier', 10), 0xDD3333, 470, 60); // red
    addTokens(R.repeatN('soldier', 10), 0x22CC22, 540, 60); // green
    addTokens(R.repeatN('soldier', 10), 0xFFEE22, 610, 60); // purple
    addTokens(R.repeatN('soldier', 10), 0xFFFFFF, 680, 60); // white

    // dice
    Dice.add(redDice, 0, 0xDD3333);
    Dice.add(redDice, 1, 0xDD3333);
    // Dice.add(blueDice, 2, 0x3399AA);
}



function setupPlayers () {
    UI.updateNames();
    players = game.add.group();
    players.z = 17;
    player = {cursor: cursorId, name: playerName};
}



function update() {
    if (Network.ready === false) return;
    S.update();
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
