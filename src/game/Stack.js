/*global Phaser, R, T, G, console, game, Utils, dynamicInvoke, stacks, Network*/
"use strict";

var S = {};

S.offsetX = 1.2;
S.offsetY = -2;




S.assignRelativePosition = function (target) {
    return function (item) {
        item.relativePosition = {
            x: item.x - target.x,
            y: item.y - target.y
        };
        return item;
    };
};





S.bringToTop = function (tile) {
    tile.bringToTop();
    return tile;
};



S.onShuffle = function () {
    console.log('onShuffle');
    Network.server.shuffleStack(T.getSelectedIds(), Controls.cloneTargetPos());

};

S.shuffle = function (tiles, position) {
    console.log('S.suffle', tiles.length);
    var startPosition = position || Controls.cloneTargetPos();


    R.forEach.idx(function (tile, index) {
        console.log('shuffle', index);
        tile.rotation = 0;
        T.hide(tile);
        S.bringToTop(tile);
        var newPosition = S.calculateCardPos(startPosition, index, 0);
        Utils.alignPosition(tile, newPosition);
    })(tiles);

    return;
};



S.onTidy = function () {
    Network.server.tidyStack(T.getSelectedIds(), Controls.cloneTargetPos());
};

S.tidy = function (tiles, position) {
    console.log('S.tidy', tiles.length);
    var types = {};
    var counts = {};
    var offsetX = - tiles[0].width; // compensate
    var startPosition = position || Controls.cloneTargetPos();

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


// S.overlap = R.curry(function (card, stack) {
//     return game.physics.arcade.overlap(card, stack);
// });




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



// S.updateCards = function (stack, cards) {
//     if (!stack || !cards) {
//         console.error('no stack or cards');
//         return;
//     }
//     var newCardIds = R.difference(cards, stack.cards);
//     R.forEach(S.removeCardFromStacks)(newCardIds);
//     stack.cards = cards;

//     if (newCardIds.length) {
//         R.forEach(function (newCardId) {
//             var newCard = G.findTile(newCardId);
//             var tween = game.add.tween(newCard).to(
//                 stack.position,
//                 200, Phaser.Easing.Cubic.In, true, 0, false
//             );
//             tween.onComplete.add(function () {
//                 // console.log('stack tween complete');
//                 S.tidy(stack);
//             });
//         })(newCardIds);
//     } else {
//         S.tidy(stack);
//     }
// };


// S.removeCardFromStacks = function (tileId) {
//     var tileId = Number(tileId);
//     R.forEach(function (stack) {
//         stack.cards = R.reject(R.eq(tileId))(stack.cards);
//         S.tidy(stack);
//     })(stacks && stacks.children || []);
//     // console.log('removed cardFromStacks', stack1.cards.length, stack2.cards.length);
//     return tileId;
// };

