/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks, Network*/
"use strict";

var S = {};

S.offsetX = 1.2;
S.offsetY = -2;

S.create = function (config) {
    var stack = T.centerAnchor(stacks.create(0, 0, config.image));

    stack.width = 280;
    stack.height = 280;
    stack.align = [];
    stack.config = config;
    T.draggable(stack);
    stack.input.useHandCursor = false;
    stack.events.onInputDown.add(S.onDragStack);
    stack.events.onInputUp.add(S.onDropStack);
    T.setId(stack);
    stack.cards = [];

    stack.position.set(config.x, config.y);
    G.addText('0', stack, Utils.childTo(0.0, 0.78), '#3b74aa');

    // Buttons
    var setupStackButton = R.compose(Cursor.reset, S.align(stack), Utils.aboveCorner(stack), S.assign(stack), T.scale(0.4));
    if (config.shuffle) R.compose(setupStackButton, G.addText('SHUFFLE'))(UI.handCursor(G.button(S.onShuffle, stack)));
    // if (!config.tidy)       R.compose(setupStackButton, G.addText('TIDY'))      (UI.handCursor(G.button(S.tidy)));
    if (!config.hidden) R.compose(setupStackButton, G.addText('FLIP'))(UI.handCursor(G.button(S.onFlipButton, stack)));

    return stack;
};



S.align = R.curry(function (stack, item) {
    var lastItem = R.last(stack.align);
    stack.align.push(item);
    if (lastItem) item.x += lastItem.width * (stack.align.length - 1);
    return S.assignRelativePosition(stack, item);
});


S.assignRelativePosition = function (target) {
    return function (item) {
        item.relativePosition = {
            x: item.x - target.x,
            y: item.y - target.y
        };
        return item;
    };
};


S.assign = R.curry(function (stack, item) {
    item.stack = stack;
    return item;
});


// Interaction handlers

S.onDragStack = function (stack) {
    console.log('drag stack');
    Network.server.stackDragStart(stack.id);
    Controls.hide();
};


S.onDropStack = function (stack) {
    console.log('drop stack');
    var position = stack.position.clone();
    position.width = stack.width;
    position.height = stack.height;
    Network.server.stackDragStop(stack.id, position);
    S.tidy(stack);
};


S.onShuffle = function () {
    console.log('onShuffle');
    Network.server.shuffleStack(T.getSelectedIds());

};



S.onFlipButton = function (button) {
    var stack = button.stack;
    Network.server.flipStack(stack.id);
};

S.onTidy = function () {
    S.tidy(Controls.selected);
};



S.bringToTop = function (tile) {
    tile.bringToTop();
    return tile;
};


S.shuffle = function (tiles) {
    console.log('S.suffle', tiles.length);

    R.forEach.idx(function (tile, index) {
        tile.rotation = 0;
        T.hide(tile);
        var newPosition = S.calculateCardPos(Controls.target.position, index, 0);
        Utils.alignPosition(tile, newPosition);
        S.bringToTop(tile);
    })(tiles);

    return;
};



S.tidy = function (tiles) {
    console.log('S.tidy', tiles.length);
    var types = {};
    var counts = {};
    var offsetX = - tiles[0].width; // compensate
    var startPosition = Controls.target.position.clone();

    R.forEach.idx(function (tile, index) {

        if (!types[tile.key]) {
            var obj = {};
            offsetX += tile.width + 20;
            obj[tile.defaultFrame] = offsetX;
            types[tile.key] = obj;

            var c = {};
            c[tile.defaultFrame] = 1;
            counts[tile.key] = c;
            
            console.log('new types', tile.frame, types[tile.key][tile.defaultFrame]);
        } else if (R.contains(tile.defaultFrame.toString())(R.keys(types[tile.key]))) {
            console.log('found types',tile.frame,  types[tile.key][tile.defaultFrame]);
            counts[tile.key][tile.defaultFrame] += 1;
        } else {
            offsetX += tile.width + 20;
            types[tile.key][tile.defaultFrame] = offsetX;
            counts[tile.key][tile.defaultFrame] = 1;
            console.log('added types',tile.frame,  types[tile.key][tile.defaultFrame]);
        }

        tile.rotation = 0;
        T.show(tile);
        var newPosition = S.calculateCardPos(startPosition, counts[tile.key][tile.defaultFrame], types[tile.key][tile.defaultFrame]);
        console.log('newPosition', newPosition);
        Utils.alignPosition(tile, newPosition);
        S.bringToTop(tile);
    })(tiles);

    console.log('types', types);

    return;
};


S.overlap = R.curry(function (card, stack) {
    return game.physics.arcade.overlap(card, stack);
});


S.flipCards = function (stack) {
    R.forEach(function (cardId) {
        var card = G.findTile(cardId);
        if (card._frame.index === 0) {
            T.show(card);
        } else {
            T.hide(card);
        }
    })(stack.cards);
};




S.calculateCardPos = function (position, index, offsetX) {
    return {
        x: position.x + (S.offsetX * index) + (offsetX || 0),
        y: position.y + (S.offsetY * index)
    };
};




S.moveRelativeTo = R.curry(function (target, tile) {
    if (!tile.relativePosition || !tile.input.draggable || target === tile) {
        return tile;
    }

    tile.x = target.x + tile.relativePosition.x;
    tile.y = target.y + tile.relativePosition.y;
    return tile;
});



S.updateCounter = function (stack) {
    stack.setText(stack.cards.length);
    return stack;
};



S.updateCards = function (stack, cards) {
    if (!stack || !cards) {
        console.error('no stack or cards');
        return;
    }
    var newCardIds = R.difference(cards, stack.cards);
    R.forEach(S.removeCardFromStacks)(newCardIds);
    stack.cards = cards;

    if (newCardIds.length) {
        R.forEach(function (newCardId) {
            var newCard = G.findTile(newCardId);
            var tween = game.add.tween(newCard).to(
                stack.position,
                200, Phaser.Easing.Cubic.In, true, 0, false
            );
            tween.onComplete.add(function () {
                // console.log('stack tween complete');
                S.tidy(stack);
            });
        })(newCardIds);
    } else {
        S.tidy(stack);
    }
};


S.removeCardFromStacks = function (tileId) {
    var tileId = Number(tileId);
    R.forEach(function (stack) {
        stack.cards = R.reject(R.eq(tileId))(stack.cards);
        S.tidy(stack);
    })(stacks && stacks.children || []);
    // console.log('removed cardFromStacks', stack1.cards.length, stack2.cards.length);
    return tileId;
};

