/*global require, console*/

"use strict";
var log = console.log;
log('eurecaServer config');
var R = require('../public/js/ramda.js');

var mongoose = require('mongoose');
var Table = mongoose.model('Table');
var Setup = mongoose.model('Setup');


module.exports = function (eurecaServer) {

    // we'll keep clients data here
    var clients = {};
    // list of open game rooms
    var rooms = {};

    // list of timeouts for destroying empty rooms
    var roomTimeouts = {};
    eurecaServer.name = 'eurecaServer';
    eurecaServer.clients = clients;

    eurecaServer.getPlayers = function getPlayers (roomId) {
        var clientIds = rooms[roomId] && rooms[roomId].clients;
        return clientIds && R.props(clientIds)(clients);
    };

    eurecaServer.getPlayerIds = function getPlayerIds (roomId) {
        var clientIds = rooms[roomId] && rooms[roomId].clients;
        return clientIds || [];
    };

    function saveTable (room) {
        Table.eurecaUpdate(room.name, room.tiles, room.stacks);    
    }

    function saveSetup (room) {
        console.log('saving setup', room.name);
        Setup.eurecaUpdate(room.name, room.tiles);    
    }

    function or(a, b) {
        return a || b;
    }

    function pointIntersection(point, r2) {
        return  (point.x > r2.x - r2.width / 2) &&
                (point.x < r2.x + r2.width / 2) &&
                (point.y > r2.y - r2.height / 2) &&
                (point.y < r2.y + r2.height / 2);
    }

    function stackIntersection(room, point) {
        return R.compose(R.reject(R.eq(undefined)), R.values)(R.mapObj.idx(function (stack, index) {
            if (pointIntersection(point, stack.position)) {
                return index;
            }
        })(room.stacks));
    }

    function findOrCreateStack(room, stackId) {
        var newStack = {cards: []};
        room.stacks[stackId] = room.stacks[stackId] || newStack;
        return room.stacks[stackId];
    }

    function findOrCreateRoom(roomId, mode, callback) {
        if (roomId === undefined) {
            return;
        }
        if (!rooms[roomId]) {
            if (mode === 'setup') {
                log('> Looking for GAME SETUP on server: ', roomId);
                return Setup.load(roomId, function (err, setup) {
                    if (err || !setup) {
                        console.error('Game Setup not found on server', err);
                        return;
                    } else {
                        log('Game Setup', roomId, 'found on server');
                        callback(rooms[roomId] = {
                            clients: [],
                            tiles: setup && setup.tiles || {},
                            stacks: {},
                            name: roomId,
                            mode: mode
                        });
                    }
                });            
            } else {
                log('> Looking for TABLE on server: ', roomId);
                return Table.load(roomId, function (err, table) {
                    if (err || !table) {
                        console.error('Table not found on server', err);
                        return;
                    } else {
                        log('Table', roomId, 'found on server');
                        callback(rooms[roomId] = {
                            clients: [],
                            tiles: table && table.tiles || {},
                            stacks: table && table.stacks || {},
                            name: roomId,
                            mode: mode
                        });
                    }
                });
            }
            
        } else {
            if (roomTimeouts[roomId]) {
                log('preventing destruction of room', roomId);
                clearTimeout(roomTimeouts[roomId]);
                delete roomTimeouts[roomId];
            }
            callback(rooms[roomId]);
        }
    }


    function removeCardFromStacks(room, tileId) {
        log('removeCardFromStacks', tileId, room.name);
        R.forEach(function (stack) {
            stack.cards = R.reject(R.eq(tileId))(stack.cards);
            // log('removed', tileId, 'from stack', stack);
        })(R.values(room.stacks));
        // log('removed cardFromStacks', stack1.cards.length, stack2.cards.length);
        return tileId;
    }

    function addCardToStack(room, stackId, tileId) {
        removeCardFromStacks(room, tileId);
        var cards = findOrCreateStack(room, stackId).cards;
        cards.push(tileId);
        cards = R.uniq(cards);
        return cards;
    }

    var removeFromArray = R.curry(function (obj, array) {
        if (array && array.length > 0) {
            array.splice(array.indexOf(obj), 1);
        }
        return obj;
    });

    function forEachClient(room, fn) {
        if(room === undefined) {
            console.error('room not defined, forEachClient');
            return;
        }
        R.forEach(function (clientId) {
            var c = clients[clientId];
            if (!c) {
                log('ERROR: client not found', clientId, 'removing from room....', room.name);
                removeFromArray(clientId, room.clients);
            } else {
                fn.call(clientId, c.remote, clientId);
            }
        })(room.clients);
    }

    function getTile(room, id) {
        return room.tiles[id];
    }

    function stackPosition(room, id) {
        return room.stacks[id].position;
    }

    function stackCards(room, id) {
        return room.stacks[id].cards;
    }


    function currentClient(that) {
        var conn = that.connection,
            client = clients[conn.id];
        if (client) return {
            id: client.id,
            name: client.name
        };
        return {};
    }

    function currentRoom(that, callback) {
        var conn = that.connection,
            client = clients[conn.id];
        // log('currentRoom', client.roomId);
        findOrCreateRoom(client.roomId, client.mode, callback);
    }

    function findClient(id) {
        var client = clients[id];
        if(!client)
            console.error('no client found');
        return client;
    }

    function getRemote(id) {
        var client = clients[id];
        return client.remote;
    }



    // eureca.io provides events to detect clients connect/disconnect
    // detect client connection
    eurecaServer.onConnect(function (conn) {
        log('onConnect New Client id=%s ', conn.id, conn.remoteAddress);

        // the getClient method provide a proxy allowing us to call remote client functions
        var remote = eurecaServer.getClient(conn.id);

        // register the client
        clients[conn.id] = {
            id: conn.id,
            remote: remote
        };

        // here we call setId (defined in the client side)
        remote.setId(conn.id);
    });



    // detect client disconnection
    eurecaServer.onDisconnect(function (conn) {
        var clientId = conn.id,
            client,
            room;
        client = findClient(clientId);
        room = rooms[client.roomId];

        log('onDisconnect Client ', client.id, 'from room ', room && room.name);


        // here we call kill() method defined in the client side
        forEachClient(room, function (remote) {
            remote.kill({
                id: client.id,
                name: client.name
            });
        });

        delete clients[clientId];
        if(room) {
            removeFromArray(clientId, room.clients);

            if (room.clients.length === 0) {
                var delay = 5 * 60 * 1000; // 5 minutes
                log('\tkilling room', room.name, 'in', delay / 60 / 1000, 'minutes');
                roomTimeouts[client.roomId] = setTimeout(function () {
                    delete rooms[client.roomId];
                    log('\tkilled room', client.roomId, '\topen rooms:', R.size(R.keys(rooms)));
                    delete roomTimeouts[client.roomId];
                }, delay);
            }
        }
    });



    eurecaServer.exports.handshake = function (newClientId, cursorId, name, roomId, mode) {
        log('handshake with', name, 'room', roomId);
        var that = this,
            newClient = findClient(newClientId),
            newClientRemote = getRemote(newClientId);
        
        findOrCreateRoom(roomId, mode, function (room) {
            log('room exists');

            newClient.cursor = cursorId;
            newClient.name = name;
            newClient.roomId = roomId;
            newClient.mode = mode;
            room.clients.push(newClientId);


            // spawning the new client on each machine of the old players
            forEachClient(room, function (oldRemote) {
                oldRemote.spawnPlayer(findClient(newClientId), true); // isNewPlayer = true
            });


            // spawn already existing clients on new player's machine
            forEachClient(room, function (rem, otherClientId) {
                newClientRemote.spawnPlayer(findClient(otherClientId), false); // isNewPlayer = false
            });

            // position tiles of current game session
            R.forEach(function (tileId) {
                log('positioning tile  id: ', tileId, 'in', room.name);
                newClientRemote.positionTile(currentClient(that), tileId, getTile(room, tileId), true);
            })(R.keys(room.tiles));
            
        });

    };



    // be exposed to client side
    eurecaServer.exports.moveCursor = function (mousePosition) {
        // log('moveCursor');
        var that = this;

        currentRoom(that, function (room) {
            forEachClient(room, function (remote) {
                remote.updateCursor(currentClient(that), mousePosition);
            });
        });

    };



    /******************* TILES ******************/


    eurecaServer.exports.tileDragStart = function (selected, relativePositions) {
        log('tileDragStart');
        var that = this;

        currentRoom(that, function (room) {
            forEachClient(room, function (remote) {
                remote.dragTiles(currentClient(that), selected, relativePositions);
            });
        });

    };



    // be exposed to client side
    eurecaServer.exports.tileDragStop = function (selected, newPositions) {
        log('tileDragStop');
        var that = this;

        currentRoom(that, function (room) {

            R.forEach.idx(function (tileId, index) {
                var newPosition = newPositions[index];
                
                // keep last known tile position so we can send it to new connected clients
                room.tiles[tileId] = newPosition;

                forEachClient(room, function (remote) {
                    remote.dropTile(currentClient(that), tileId, newPosition);
                });
            })(selected);


            if(room.mode === 'play') saveTable(room);
        });

    };


        // be exposed to client side
    eurecaServer.exports.flipTiles = function (selected, frames) {
        log('flipTiles');
        var that = this;

        currentRoom(that, function (room) {

            R.forEach.idx(function (tileId, index) {
                var newFrame = frames[index];
                
                // keep last known tile frame so we can send it to new connected clients
                room.tiles[tileId].frame = newFrame;

                forEachClient(room, function (remote) {
                    remote.flipTile(currentClient(that), tileId, newFrame);
                });
            })(selected);


            if(room.mode === 'play') saveTable(room);
        });

    };

     eurecaServer.exports.toHand = function (tileId) {
        log('toHand', tileId);
        var that = this;

        currentRoom(that, function (room) {
            room.tiles[tileId].hand = currentClient(that).name;
            

            forEachClient(room, function (remote) {
                remote.toHand(currentClient(that), tileId);
            });
            if(room.mode === 'play') saveTable(room);
        });
    };


     eurecaServer.exports.fromHand = function (tileId) {
        log('fromHand', tileId);
        var that = this;

        currentRoom(that, function (room) {
            delete room.tiles[tileId].hand;

            forEachClient(room, function (remote) {
                remote.fromHand(currentClient(that), tileId);
            });
            if(room.mode === 'play') saveTable(room);
        });
    };


    /******************* STACKS ******************/


    function shuffle(array) {
        var i, j, temp;

        for (i = array.length - 1; i > 0; i -= 1) {
            j = Math.floor(Math.random() * (i + 1));
            temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        return array;
    }

    eurecaServer.exports.stackDragStart = function (stackId, newPosition) {
        log('stackDragStart');
        var that = this;

        currentRoom(that, function (room) {
            forEachClient(room, function (remote) {
                remote.dragStack(currentClient(that), stackId);
            });
        });
    };


    eurecaServer.exports.stackDragStop = function (stackId, newPosition) {
        log('stackDragStop');
        var that = this;

        currentRoom(that, function (room) {
            // keep last known stack position so we can send it to new connected clients
            findOrCreateStack(room, stackId).position = newPosition;

            forEachClient(room, function (remote) {
                remote.dropStack(currentClient(that), stackId, newPosition);
            });

            saveTable(room);
        });
    };

    eurecaServer.exports.shuffleStack = function (tiles) {
        log('shuffleStack');
        var that = this;

        currentRoom(that, function (room) {
            log('shuffled', tiles, 'in room', room.name);

            var shuffledTiles = shuffle(tiles);

            forEachClient(room, function (remote) {
                remote.updateStackCards(currentClient(that), shuffledTiles);
            });
        });

    };

    eurecaServer.exports.flipStack = function (stackId) {
        log('flipStack');
        var that = this;

        currentRoom(that, function (room) {
            forEachClient(room, function (remote) {
                remote.flipStack(currentClient(that), stackId);
            });
        });

    };




    /******************* DICE ******************/

    eurecaServer.exports.spin = function (diceInGroup, numSides) {
        log('spin');
        var that = this,
            delays,
            values;

        currentRoom(that, function (room) {
            delays = R.map(function () {
                return Math.floor(300 + 567 * Math.random());
            })(diceInGroup);

            values = R.map(function () {
                return Math.floor(Math.random() * numSides);
            })(diceInGroup);

            forEachClient(room, function (remote) {
                remote.spin(currentClient(that), diceInGroup, delays, values);
            });
        });

    };


    /******************* CHAT ******************/

    eurecaServer.exports.chat = function (text) {
        log('chat', text);
        var that = this;

        currentRoom(that, function (room) {
            forEachClient(room, function (remote) {
                remote.receiveChat(currentClient(that), text);
            });
        });

    };


    /******************* SAVE ******************/

    eurecaServer.exports.saveSetup = function () {
        log('saveSetup');
        var that = this;

        currentRoom(that, function (room) {
            saveSetup(room);
        });

    };

};

