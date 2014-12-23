/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks, cards1, Network*/
"use strict";

var S = {};

S.offsetX = 1.2;
S.offsetY = -1;

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
    if (config.shuffle) R.compose(setupStackButton, G.addText('SHUFFLE'))(UI.handCursor(G.button(S.onShuffleButton, stack)));
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


S.assignRelativePosition = function (stack, item) {
    if (item.relativePosition) {
        return item;
    }
    item.relativePosition = {
        x: item.x - stack.x,
        y: item.y - stack.y
    };
    return item;
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


S.onShuffleButton = function (button) {
    console.log('shuffle', this);
    var stack = this;
    Network.server.shuffleStack(stack.id);
};



S.onFlipButton = function (button) {
    var stack = button.stack;
    Network.server.flipStack(stack.id);
};



S.bringToTop = function (tile) {
    tile.bringToTop();
    return tile;
};




S.tidy = function (stack) {
    // console.log('S.tidy stack', stack.id);
    var last;

    R.forEach.idx(function (cardId, index) {
        var card = G.findTile(cardId);
        // console.log('card', card, 'index', index);
        card.inputEnabled = false;
        Utils.alignPosition(card, S.calculateCardPos(stack, index));
        if (stack.config.hidden) T.hide(card);
        if (card) last = card;
        S.bringToTop(card);
    })(stack.cards);

    if (last) last.inputEnabled = true;
    if (last) UI.handCursor(last);

    S.alignElements(stack);
    return S.updateCounter(stack);
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


S.update = function () {
    stacks.forEach(function (stack) {
        if (stack.input.isDragged || stack.remoteDragged) {
            S.alignElements(stack);
            S.alignStackCards(stack);
        }
    });
};


S.calculateCardPos = function (position, index) {
    return {
        x: position.x + (S.offsetX * index),
        y: position.y + (S.offsetY * index)
    };
};

S.alignStackCards = function (stack) {
    R.forEach.idx(function (cardId, index) {
        var card = G.findTile(cardId);
        card.inputEnabled = false;
        Utils.alignPosition(card, S.calculateCardPos(stack, index));
    })(stack.cards);
};

S.alignElements = function (stack) {
    R.forEach(S.moveRelativeTo(stack))(stack.align);
};


S.moveRelativeTo = R.curry(function (target, tile) {
    if (!tile.relativePosition) {
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
    })(stacks.children);
    // console.log('removed cardFromStacks', stack1.cards.length, stack2.cards.length);
    return tileId;
};

