/**
 * Playing Asteroids while learning JavaScript object model.
 */


/**
 * Shim layer, polyfill, for requestAnimationFrame with setTimeout fallback.
 * http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 */
window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();



/**
 * Shim layer, polyfill, for cancelAnimationFrame with setTimeout fallback.
 */
window.cancelRequestAnimFrame = (function () {
    return  window.cancelRequestAnimationFrame ||
        window.webkitCancelRequestAnimationFrame ||
        window.mozCancelRequestAnimationFrame ||
        window.oCancelRequestAnimationFrame ||
        window.msCancelRequestAnimationFrame ||
        window.clearTimeout;
})();

/**
 * Trace the keys pressed
 * http://nokarma.org/2011/02/27/javascript-game-development-keyboard-input/index.html
 */
window.Key = {
    pressed: {},
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    SPACE: 32,
    A: 65,
    S: 83,
    D: 68,
    W: 87,
    I: 73,
    J: 74,
    K: 75,
    L: 76,
    isDown: function (keyCode, keyCode1) {
        return this.pressed[keyCode] || this.pressed[keyCode1];
    },
    onKeydown: function (event) {
        this.pressed[event.keyCode] = true;
    },
    onKeyup: function (event) {
        delete this.pressed[event.keyCode];
    }
};
window.addEventListener('keyup', function (event) {
    Key.onKeyup(event);
}, false);
window.addEventListener('keydown', function (event) {
    Key.onKeydown(event);
}, false);



/**
 * All objects are Vectors
 */
function Vector (x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vector.prototype = {
    muls: function (scalar) {
        return new Vector(this.x * scalar, this.y * scalar);
    }, // Multiply with scalar
    imuls: function (scalar) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }, // Multiply itself with scalar
    adds: function (scalar) {
        return new Vector(this.x + scalar, this.y + scalar);
    }, // Multiply with scalar
    iadd: function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    }   // Add itself with Vector
}



/**
 * The forces around us.
 */
function Forces () {
    this.all = {};
}

Forces.prototype = {
    createAcceleration: function (vector) {
        return function (velocity, td) {
            velocity.iadd(vector.muls(td));
        }
    },
    createDamping: function (damping) {
        return function (velocity, td) {
            velocity.imuls(damping);
        }
    },
    createWind: function (vector) {
        return function (velocity, td) {
            velocity.iadd(vector.adds(td));
        }
    },
    addAcceleration: function (name, vector) {
        this.all[name] = this.createAcceleration(vector);
    },
    addDamping: function (name, damping) {
        this.all[name] = this.createDamping(damping);
    },
    addWind: function (name, vector) {
        this.all[name] = this.createWind(vector);
    },
    update: function (object, td) {
        for (var force in this.all) {
            if (this.all.hasOwnProperty(force)) {
                this.all[force](object, td);
            }
        }
    }

}

window.Forces = new Forces();
window.Forces.addAcceleration('gravity', new Vector(0, 9.82));
window.Forces.addDamping('drag', 0.97);
window.Forces.addWind('wind', new Vector(0.5, 0));



/**
 * A Player as an object.
 */
function Player (width, height, position, velocity, speed, direction, accelerateForce, breakForce, dampForce, key_up, key_right, key_down, key_left) {
    this.height = height || 32;
    this.width = width || 32;
    this.position = position || new Vector();
    this.velocity = velocity || new Vector();
    this.speed = speed || new Vector();
    this.direction = direction || 0;
    this.accelerateForce = accelerateForce || Forces.createAcceleration(new Vector(80, 80));
    this.breakForce = breakForce || Forces.createDamping(0.97);
    this.dampForce = dampForce || Forces.createDamping(0.999);
    this.key_up = key_up || null;
    this.key_right = key_right || null;
    this.key_down = key_down || null;
    this.key_left = key_left || null;

}

Player.prototype = {
    draw: function (ct) {
        var x = this.width / 2, y = this.height / 2;

        ct.save();
        ct.translate(this.position.x, this.position.y);
        ct.rotate(this.direction + Math.PI / 2)
        ct.beginPath();
        ct.moveTo(0, -y);
        ct.lineTo(x, y);
        ct.lineTo(0, 0.8 * y);
        ct.lineTo(-x, y);
        ct.lineTo(0, -y);

        if (Key.isDown(this.key_up)) {
            ct.moveTo(0, y);
            ct.lineTo(-2, y + 10);
            ct.lineTo(0, y + 8);
            ct.lineTo(2, y + 10);
            ct.lineTo(0, y);
        }

        if (Key.isDown(this.key_down)) {
            ct.moveTo(y + 4, 0);
            ct.arc(0, 0, y + 4, 0, Math.PI, true);
        }

        ct.stroke();
        ct.restore();
    },
    moveForward: function (td, ops) {
        this.dampForce(this.speed, td);
        this.position.x += this.speed.x * Math.cos(this.direction) * td;
        this.position.y += this.speed.y * Math.sin(this.direction) * td;
        this.position.iadd(this.velocity.muls(td));
    },
    rotateLeft: function () {
        this.direction -= Math.PI / 30;
    },
    rotateRight: function () {
        this.direction += Math.PI / 30;
    },
    throttle: function (td) {
        this.accelerateForce(this.speed, td);
    },
    breaks: function (td) {
        this.breakForce(this.speed, td);
        this.breakForce(this.velocity, td);
    },
    update: function (td, width, height, ops) {
        if (Key.isDown(this.key_up)) this.throttle(td);
        if (Key.isDown(this.key_left)) this.rotateLeft();
        if (Key.isDown(this.key_down)) this.breaks(td);
        if (Key.isDown(this.key_right)) this.rotateRight();

        Forces.update(this.velocity, td);
        this.moveForward(td, ops || false);
        this.stayInArea(width, height);
    },
    stayInArea: function (width, height) {
        if (this.position.y < -this.height) this.position.y = height;
        if (this.position.y > height) this.position.y = -this.height;
        if (this.position.x > width) this.position.x = -this.width;
        if (this.position.x < -this.width) this.position.x = width;
    },
    export: function () {
        var myObj = {
            "height": this.height,
            "width": this.width,
            "position": this.position,
            "velocity": this.velocity,
            "speed": this.speed,
            "direction": this.direction};
        return  JSON.stringify(myObj);
    },
    keyDown: function () {
        return (Key.isDown(this.key_up) || Key.isDown(this.key_left) || Key.isDown(this.key_down) || Key.isDown(this.key_right));
    }
}


/**
 * Asteroids, the Game
 */

window.Asteroids = (function () {
    var canvas, ct, player, players = [], lastGameTick, lastServerTick, websocket;

    var init = function (canvas, ws) {
        canvas = document.getElementById(canvas);
        ct = canvas.getContext('2d');
        width = canvas.width,
            height = canvas.height,
            ct.lineWidth = 1;
        ct.strokeStyle = 'hsla(0,0%,100%,1)',
            player = new Player(10, 20, new Vector(width / 2, height / 2), null, null, null, null, null, null, Key.W, Key.D, Key.S, Key.A);
        console.log('Init the game');
        // spara websocket så vi kan använda den
        websocket = ws;

    };

    var update = function (td) {
        player.update(td, width, height);
        for (var pl in players) {
            players[pl].update(td, width, height, true);
        }
    };

    var render = function () {
        ct.clearRect(0, 0, width, height);
        player.draw(ct);

        for (var pl in players) {
            //console.log(pl);
            players[pl].draw(ct);
        }
    };

    var gameLoop = function () {
        var now = Date.now();
        td = (now - (lastGameTick || now)) / 1000; // Timediff since last frame / gametick
        lastGameTick = now;
        requestAnimFrame(gameLoop);
        update(td);
        render();

        //om en tangent är nedtryckt skicka information
        if (player.keyDown()) {
            td = 0;
        } else {
            //Räkna fram tiden igen så vi vet hur lång tid som gått sedan förra gången vi skickade till servern
            td = (now - (lastServerTick || now)) / 1000; // Timediff since last frame / gametick
        }

        //Är td noll har vi inget och borde skicka
        if (td > 1 || td === 0) {
            lastServerTick = now;
            if (websocket) {
                websocket.send(player.export());
            }
        }

    };
    var oponents = function (ops) {

        ops = JSON.parse(ops);

        ops.forEach(function (op1 ,b) {

            if (op1 != null) {
                var op = JSON.parse(op1);
                console.log(b);
                players[b] = new Player(op.width + 10, op.height + 10, new Vector(op.position.x, op.position.y), new Vector(op.velocity.x, op.velocity.y), new Vector(op.speed.x, op.speed.y), op.direction);
            }
        })

    };

    return {
        'init': init,
        'gameLoop': gameLoop,
        'oponents': oponents
    };
})();

// On ready
$(function () {
    'use strict';

    //anslut till websocket
    var websocket = new WebSocket('ws://dbwebb.se:1337/', 'broadcast-protocol');

    //vad göra vid anslutning
    websocket.onopen = function () {
        //websocket.send('Hi server. Im connected');
        console.log('The websocket is now open now start the game.');
        Asteroids.init('canvas1', websocket);
        Asteroids.gameLoop();
    }

    websocket.onmessage = function (event) {
        Asteroids.oponents(event.data);
    }


    console.log('Ready to play.');
}); 