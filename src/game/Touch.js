/*global R, T, G, Utils, game*/
"use strict";

var Touch = {};

Touch.touching = false;

Touch.init = function () {

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
        UI.hudMessage('pan', ev.deltaX, ev.deltaY, ev.pointers.length);
        game.camera.x = Touch.oldCameraX - ev.deltaX;
        game.camera.y = Touch.oldCameraY - ev.deltaY;
    });

    Touch.hammertime.on('pinch', function(ev) {
        UI.hudMessage('pinch', ev.deltaX, ev.deltaY, ev.pointers.length);
    });
    
    Touch.hammertime.on('pinchin', function() {
        zoom(-0.6);
    });

    Touch.hammertime.on('pinchout', function() {
        zoom(0.6);
    });

}
