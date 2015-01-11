/*global PIXI, TWEEN, R, document, window, browser, createjs, Main*/
"use strict";

function slice(args, from, to) {
    switch (arguments.length) {
    case 0:
        throw 'no args';
    case 1:
        return slice(args, 0, args.length);
    case 2:
        return slice(args, from, args.length);
    default:
        var length = Math.max(0, to - from),
            list = new Array(length),
            idx = -1;
        while (++idx < length) {
            list[idx] = args[from + idx];
        }
        return list;
    }
}

function random(start, end) {
    if (end === undefined) {
        throw new Error("random end must be defined");
    }
    var r = Math.floor(Math.random() * (end - start + 1));
    r += start;
    //console.log('random', start, end, r);
    return r;
}

function isFunction(functionToCheck) {
    var getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

function maybeFun(fun) {
    if (isFunction(fun)) {
        return fun();
    }
}

function maybe(fun) {
    return function (obj) {
        if (obj) {
            return fun(obj);
        }
        // console.log('maybe got:', obj, 'not executing:', fun);
        return false;
    };
}

function dynamicInvoke(functionName) {
    return function (obj) {
        return obj[functionName](obj);
    };
}


function randomFrom(array) {
    var index = random(0, array.length - 1);
    return array[index];
}

function chance(percent, fun) {
    if (random(0, 100) < percent) {
        fun();
    }
}


function double(number) {
    return number * 2;
}

function randomDirection() {
    var direction = random(0, 2) === 1 ? '+' : '-';
    return direction;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var Utils = {
    humanize: function (start, end, stringArray) {
        return R.align(ifLte, R.interpolate(start, end, stringArray.length), stringArray);
    },

    alignPosition: function (a, b) {
        if (a && b) {
            a.x = b.x;
            a.y = b.y;
        } else console.error('alignPosition', a, b);
    },

    alignRelativePosition: function (a, b) {
        if (a && b && a.relativePosition) {
            a.x = b.x + a.relativePosition.x;
            a.y = b.y + a. relativePosition.y;
        } else console.error('alignRelativePosition', a, b);
    },

    syncTile: function (a, b) {
        if (a && b) {
            a.x = b.x;
            a.y = b.y;
            a.rotation = b.rotation;
            a.frame = b.frame;
        } else console.error('alignPosition', a, b);
    },

    alignRelativePosRot: function (a, b) {
        if (a && b && a.relativePosition) {
            a.x = b.x + a.relativePosition.x;
            a.y = b.y + a.relativePosition.y;
            a.rotation = b.rotation;
        } else console.error('alignRelativePosRot', a, b);
    },

    toCorner: function (a, b) {
        if (a && b) {
            a.x = b.x - b.width / 2;
            a.y = b.y - b.height / 2;
        } else {
            console.debug('toCorner error', a, b);
        }
    },

    childTo: function (xf, yf) {
        return function (a, b) {
            if (a && b) {
                a.x = b.width * xf;
                a.y = b.height * yf;
            };
        };
    },

    aboveCorner: R.curry(function (b, a) {
        if (a && b) {
            a.x = b.x - b.width / 2;
            a.y = b.y - b.height / 2 - a.height;
        }
        return a;
    }),

    delta: function (start, end) {
        return {
            x: start.x - end.x,
            y: start.y - end.y
        };
    },

    shuffle: function (array) {

        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }

        return array;
    },

    printargs: function () {
        console.debug(arguments);
        return arguments[0];
    },


    buttonize: function (sprite, fn) {
        sprite.interactive = true;
        sprite.buttonMode = true;
        sprite.defaultCursor = 'pointer';
        sprite.click = sprite.tap = fn;
        return sprite;
    },

    angle: function (delta) {
        return Math.atan2(delta.y, delta.x);
    },

    angle2points: function (a, b) {
        return R.compose(Utils.angle, Utils.delta)(a, b);
    },

    rad2Deg: function (rad) {
        var deg = rad * 180 / Math.PI;

        if (deg < 0) {
            deg += 360;
        }
        return deg;
    },

    deg2Rad: function (deg) {
        if (deg < 0) {
            deg += 360;
        }
        var rad = deg / 180 * Math.PI;

        return rad;
    },

    addProperties: function (obj, configObject) {
        R.forEach(
            function (arg) {
                obj[arg] = configObject[arg];
            }
        )(R.keys(configObject)); // assign each mixin property to the bird
        return obj;
    },

    rotate90: function (rad) {
        return rad + Math.PI / 2;
    },


    removeFromArray: R.curry(function (obj, array) {
        if (array && array.length > 0) {
            array.splice(array.indexOf(obj), 1);
        }
        return obj;
    }),



    removeChildren: function (sprite) {
        R.times(function () {
            if (sprite.children.length && sprite.getChildAt(0)) {
                sprite.removeChild(sprite.getChildAt(0));
            }
        }, sprite.children.length);
    },


    move: function (obj) {
        var rad = obj.rotation,
            speed = obj.speed,
            moveX,
            moveY;
        moveX = Math.cos(rad) * speed;
        moveY = Math.sin(rad) * speed;
        obj.position.set(obj.x + moveX, obj.y + moveY);
        return obj;
    },

    center: function (objToCenter, background) {
        // console.debug(objToCenter.width, objToCenter.height, background.width, background.height);
        objToCenter.x = background.x + ((background.width - objToCenter.width) / 2);
        objToCenter.y = background.y + ((background.height - objToCenter.height) / 2);
        // console.debug(objToCenter.x, objToCenter.y);
    },


    testHitArray: function testHitArray(hitFunction, array) {
        return function appliedTestHitArray(bullet) {
            for (var i = array.length - 1; i >= 0; i -= 1) {
                Utils.testHit(bullet, array[i], hitFunction);
            }
            return bullet;
        };
    },


    testHit: function testHit(bullet, target, hitFunction) {
        if (Utils.collidesRectCircle(bullet, target)) {
            hitFunction(bullet, target);
        }
    },


    testNearMissArray: function testNearMissArray(nearMissFunction, array) {
        return function appliedNearMissArray(bullet) {
            for (var i = array.length - 1; i >= 0; i -= 1) {
                Utils.testNearMiss(bullet, array[i], nearMissFunction);
            }
            return bullet;
        };
    },


    testNearMiss: function testNearMiss(bullet, target, nearMissFunction) {
        if (Utils.collidesRectCircle(bullet, target, target.nearMissRadius)) {
            nearMissFunction(target);
        }
    },


    pointIntersection: function (point, r2) {
        return (point.x > r2.x) && (point.x < r2.x + r2.width) && (point.y > r2.y) && (point.y < r2.y + r2.height);
    },

    simpleIntersection: function (r1, r2) {
        return !(r2.x > (r1.x + r1.width) ||
            (r2.x + r2.width) < r1.x ||
            r2.y > (r1.y + r1.height) ||
            (r2.y + r2.height) < r1.y);
    },

    /* 
     * Helper function to determine the distance between
     * two points using Pythagorean theorem
     */
    getPowDistance: function (fromX, fromY, toX, toY) {
        var a = Math.abs(fromX - toX);
        var b = Math.abs(fromY - toY);
        return (a * a) + (b * b);
    },

    collidesRectCircle: function (rect, circle, radiusOverride) {
        var radius = radiusOverride || circle.width * 0.5;
        var upperRectRadius = Math.max(rect.width, rect.height) * 0.75;

        // quick check, whether collision is actually possible:
        if (Math.abs(circle.x - rect.x) < radius + upperRectRadius &&
            Math.abs(circle.y - rect.y) < radius + upperRectRadius) {

            // adjust radians:
            var rotation = rect.rotation > 0 ? -1 * rect.rotation : -1 * rect.rotation + Math.PI;

            // rotate circle around origin of the rectangle:
            var rotatedCircleX = Math.cos(rotation) * (circle.x - rect.x) -
                Math.sin(rotation) * (circle.y - rect.y) + rect.x;
            var rotatedCircleY = Math.sin(rotation) * (circle.x - rect.x) +
                Math.cos(rotation) * (circle.y - rect.y) + rect.y;

            // get upper left position of the rectangle:
            var rectX = rect.x - (rect.width * 0.5);
            var rectY = rect.y - (rect.height * 0.5);

            // find closest point in the rectangle to the rotated circle's center:
            var closestX, closestY;

            if (rotatedCircleX < rectX) {
                closestX = rectX;
            } else if (rotatedCircleX > rectX + rect.width) {
                closestX = rectX + rect.width;
            } else {
                closestX = rotatedCircleX;
            }

            if (rotatedCircleY < rectY) {
                closestY = rectY;
            } else if (rotatedCircleY > rectY + rect.height) {
                closestY = rectY + rect.height;
            } else {
                closestY = rotatedCircleY;
            }

            // check distance between closest point and rotated circle's center:
            var distance = this.getPowDistance(rotatedCircleX, rotatedCircleY, closestX, closestY);
            if (distance < radius * radius) {
                return true; // Collision
            }
        }
        return false;
    },

    doPolygonsIntersect: function (a, b) {
        var polygons = [a, b],
            minA,
            maxA,
            projected,
            i,
            i1,
            j,
            minB,
            maxB;

        for (i = 0; i < polygons.length; i++) {

            // for each polygon, look at each edge of the polygon, and determine if it separates
            // the two shapes
            var polygon = polygons[i];
            for (i1 = 0; i1 < polygon.length; i1++) {

                // grab 2 vertices to create an edge
                var i2 = (i1 + 1) % polygon.length;
                var p1 = polygon[i1];
                var p2 = polygon[i2];

                // find the line perpendicular to this edge
                var normal = {
                    x: p2.y - p1.y,
                    y: p1.x - p2.x
                };

                minA = maxA = undefined;
                // for each vertex in the first shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                for (j = 0; j < a.length; j++) {
                    projected = normal.x * a[j].x + normal.y * a[j].y;
                    if (isUndefined(minA) || projected < minA) {
                        minA = projected;
                    }
                    if (isUndefined(maxA) || projected > maxA) {
                        maxA = projected;
                    }
                }

                // for each vertex in the second shape, project it onto the line perpendicular to the edge
                // and keep track of the min and max of these values
                minB = maxB = undefined;
                for (j = 0; j < b.length; j++) {
                    projected = normal.x * b[j].x + normal.y * b[j].y;
                    if (isUndefined(minB) || projected < minB) {
                        minB = projected;
                    }
                    if (isUndefined(maxB) || projected > maxB) {
                        maxB = projected;
                    }
                }

                // if there is no overlap between the projects, the edge we are looking at separates the two
                // polygons, and we know there is no overlap
                if (maxA < minB || maxB < minA) {
                    CONSOLE("polygons don't intersect!");
                    return false;
                }
            }
        }
        return true;
    }


};
