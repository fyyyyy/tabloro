/*global R, T, G, Utils, game*/
"use strict";

var Touch = {};

Touch.touching = false;

Touch.init = function () {
    // add 2 more pointers, 4 total
    game.input.addPointer();
    game.input.addPointer();

    Touch.hammertime = new Hammer(document.getElementsByTagName('canvas')[0]);
    
    var pan = Touch.hammertime.get('pan');
    pan.set({ direction: Hammer.DIRECTION_ALL, pointers: 2});
    
    var pinch = Touch.hammertime.get('pinch');
    pinch.set({ enable: true, threshold: 0.2 });
    
    pinch.recognizeWith(pan);



    Touch.hammertime.on('panstart', function() {
        Touch.oldCameraX = game.camera.x;
        Touch.oldCameraY = game.camera.y;
        Touch.touching = true;
    });

    Touch.hammertime.on('panend', function() {
        Touch.touching = false;
    });
    Touch.hammertime.on('pinchstart', function() {
        Touch.touching = true;
    });
    Touch.hammertime.on('pinchend', function() {
        Touch.touching = false;
    });

    Touch.hammertime.on('panmove', function(ev) {
        if (Controls.target.input.isDragged) {
            return;
        }
        UI.hudMessage('pan', ev.deltaX, ev.deltaY, ev.pointers.length);
        game.camera.x = Touch.oldCameraX - ev.deltaX;
        game.camera.y = Touch.oldCameraY - ev.deltaY;
    });

    // Touch.hammertime.on('pinch', function(ev) {
    // });
    
    Touch.hammertime.on('pinchin', function() {
        if (Controls.target.input.isDragged) {
            return;
        }
        zoom(-0.6);
        UI.hudMessage('pinchin', ev.deltaX, ev.deltaY, ev.pointers.length);
    });

    Touch.hammertime.on('pinchout', function() {
        if (Controls.target.input.isDragged) {
            return;
        }
        zoom(0.6);
        UI.hudMessage('pinchout', ev.deltaX, ev.deltaY, ev.pointers.length);
    });

}
