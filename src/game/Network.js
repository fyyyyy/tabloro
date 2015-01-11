/*global R, G, Controls, console, Eureca, playerList, UI*/
"use strict";

var Network = {};

Network.ready = false;

Network.isMine = function (id) {
    return Network.myId === id;
};

Network.setup = function () {
    console.log('Network.setup');
    
    // create an instance of eureca.io client
    Network.client = new Eureca.Client();

    Network.client.ready(function (proxy) {
        Network.server = proxy;
    });



    // EXPORTS
    // methods defined under "exports" namespace become available in the server side

    Network.client.exports.setId = function (id) {
        console.log('Network.setId for', playerName);
        Network.myId = id;
        //create() is moved here to make sure nothing is created before uniq id assignation
        Network.server.handshake(id, cursorId, playerName, roomName, mode);
        console.log('connecting to table', roomName);

        create();
        Network.ready = true;
    };



    Network.client.exports.kill = function (client) {
        console.log('killing', client.name);
        if (playerList[client.id]) {
            playerList[client.id].kill();
            console.log('killing ', client.name, playerList[client.id]);
            delete playerList[client.id];

            UI.message(client.name, 'left the table...');
            UI.updateNames();
        }
        Video.killClient(client.id, client.name);
    };



    Network.client.exports.spawnPlayer = function (client, isNewPlayer) {
        console.log('Spawn new player >> ', client.name, 'is new player ? ', isNewPlayer);
        if (Network.isMine(client.id)) return; //this is me

        var p = Cursor.new(client);
        playerList[client.id] = p;

        UI.message(client.name, 'joined the table!');
        UI.updateNames();

        Video.newClient(client.id, client.name);
    };



    Network.client.exports.updateCursor = function (client, state) {
        if (Network.isMine(client.id)) return; // this is me //////////////
        if (playerList[client.id]) {
            playerList[client.id].x = state.x;
            playerList[client.id].y = state.y;
        }
    };

    /******************* TILES ******************/


    Network.client.exports.dragTiles = function (client, selected, relativePositions) {
        console.log(client.name  + ' drags tiles ', selected);
        
        // this is me //////////////
        if (Network.isMine(client.id)) return;
        
        if (selected.length) {
            var tiles = G.findTiles(selected);
            R.forEach.idx(function (tile, index) {
                Controls.hide(tile);
                tile.relativePosition = relativePositions[index];
                console.log('follow tile', tile.id, tile.relativePosition);
                G.addUpdatePosition({follower: tile, target: playerList[client.id]});
            })(tiles);
            return;
        }
    };

    Network.client.exports.positionTile = function (client, tileId, newPosition) {
        if (! Network.isMine(client.id)) return; // this is NOT me ////////
        console.log('Initial positioning of tile ', tileId);
        
        var tile = G.findTile(tileId);
        Controls.hide(tile);
        
        R.compose(T.enableInput, T.show)(tile);
        
        Utils.syncTile(tile, newPosition);
        UI.message('Positioning tile', tileId);
    };


    Network.client.exports.dropTile = function (client, tileId, newPosition) {
        if (Network.isMine(client.id)) return; // this is me //////////////

        console.log(client.name + ' drops tile ', tileId, 'at', newPosition);
        
        var tile = G.findTile(tileId);
        Controls.hide(tile);
        
        G.removeUpdatePosition(playerList[client.id]);
        delete tile.relativePosition;

        Utils.syncTile(tile, newPosition);
        UI.message(client.name, 'moved tile', tile.id);

    };


    Network.client.exports.flipTile = function (client, tileId, newFrame) {
        if (Network.isMine(client.id)) return; // this is me //////////////
        console.log(client.name + ' flips tile ', tileId, 'to', newFrame);
        
        var tile = G.findTile(tileId);
        Controls.hide(tile);
        
        tile.frame = newFrame;
        UI.message(client.name, 'flipped tile', tile.id);
        
    };


    /******************* STACKS ******************/

    Network.client.exports.dragStack = function (client, stackId) {
        console.log(client.name  + ' drags stack ', stackId);
        if (Network.isMine(client.id)) return; //this is me
        var stack = G.findStack(stackId);
        stack.remoteDragged = true;
        G.addUpdatePosition({follower: stack, target: playerList[client.id]});
    };


    Network.client.exports.dropStack = function (client, stackId, newPosition) {
        console.log(client.name + ' moved stack ', stackId);
        if (Network.isMine(client.id)) return; //this is me
        var stack = G.findStack(stackId);
        G.removeUpdatePosition(playerList[client.id]);
        stack.remoteDragged = false;

        Utils.syncTile(stack, newPosition);

        S.tidy(stack);
        UI.message(client.name, 'moved stack', stackId);
    };


    Network.client.exports.positionStack = function (client, stackId, stackData) {
        console.log(client.name + ' moved stack ', stackId);
        if (!Network.isMine(client.id)) return; //this is NOT me
        
        var stack = G.findStack(stackId);
        Utils.syncTile(stack, stackData.position);
        console.log('adding', stackData.cards, 'to stack', stackId);
        S.updateCards(stack, stackData.cards);

        S.alignElements(stack);
        UI.message('Positioning stack', stackId);
    };


    Network.client.exports.updateStackCards = function (client, stackId, cards) {
        console.log('updateCards', cards, 'toStack', stackId);
        G.removeUpdatePosition(playerList[client.id]);
        var updatedStack = G.findStack(stackId);
        S.updateCards(updatedStack, cards);
    };

    Network.client.exports.flipStack = function(client, stackId) {
        var stack = G.findStack(stackId);
        S.flipCards(stack);
    };




    /******************* DICE ******************/

    Network.client.exports.spin = function(client, diceInGroup, delays, values) {
        Dice.spin(diceInGroup, delays, values);
        UI.message('Spinning', diceInGroup.length, 'dice');
    };


    /******************* DICE ******************/

    Network.client.exports.receiveChat = function(client, text) {
        console.log(client.name, 'says', text);
        UI.message(client.name, ':', text);
    };
};

