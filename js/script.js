$(function() {
    var canvas = document.querySelector('#canvas');
    if(!canvas) {
        console.log("Impossible de récupérer le canvas");
        return;
    }
    var context = canvas.getContext('2d');
    if(!context) {
        console.log("Impossible de récupérer le context du canvas");
        return;
    }

    window.requestAnimFrame = (function(){
        return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function( callback ){
                window.setTimeout(callback, 1000 / 60);
            };
    })();


    var balls;

    function init() {
        balls = [];
        initBalls();
    }

    function clear() {
        context.clearRect(0, 0, canvas.width, canvas.height);
    }

    function initBalls() {
        for (var i =0; i<20;i++) {
            var color = '#'+Math.floor(Math.random()*16777215).toString(16);
            var r = Math.floor(Math.random() *50 ) + 10;
            var x = Math.floor(Math.random() *(1000-r) ) + r+1;
            var y = Math.floor(Math.random() *(500-r) ) + r+1;
            var vx = Math.random()*5+0.1;
            var vy = Math.random()*5+0.1;
            balls.push(new Ball(x,y, r, vx, vy, color));
        }

        // For collision testing with high speed and mass difference
        //     balls.push(new Ball(150, 150, 10, 1, 1, '#CCCCCC'));
        //     balls.push(new Ball(400, 400, 50, -5, -5, '#000000'));
    }


    function Ball(x,y,r,vx,vy,color) {
        this.pos = {
            x:x,
            y:y
        };
        this.r = r;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.m = r;

        this.draw = function () {
            context.beginPath();
            context.arc(this.pos.x, this.pos.y, this.r, 0, Math.PI*2);
            context.fillStyle = this.color;
            context.fill();
            context.closePath();
        };

        this.move = function () {
            this.pos.x += this.vx;
            this.pos.y += this.vy;
        };

        this.bounce = function () {
            if (this.pos.x >= (canvas.width-this.r)) {
                this.vx *= -1;
                this.pos.x = canvas.width-this.r-1;
            }
            if (this.pos.x <= this.r ) {
                this.vx *= -1;
                this.pos.x = this.r+1;
            }
            if (this.pos.y >= (canvas.height-this.r)) {
                this.vy *= -1;
                this.pos.y = canvas.height-this.r-1;
            }
            if (this.pos.y <= this.r) {
                this.vy *= -1;
                this.pos.y = this.r+1;
            }
        };

        this.collide = function(ball) {
            var dx = ball.pos.x - this.pos.x,
                dy = ball.pos.y - this.pos.y,
                dist = Math.sqrt(dx * dx + dy * dy);

            if (dist <= this.r + ball.r) {
                var angle = Math.atan2(dy, dx),
                    sin = Math.sin(angle),
                    cos = Math.cos(angle);

                var pos0 = {x: 0, y: 0},
                    pos1 = Ball.rotate(dx, dy, sin, cos, true),
                    vel0 = Ball.rotate(this.vx, this.vy, sin, cos, true),
                    vel1 = Ball.rotate(ball.vx, ball.vy, sin, cos, true),
                    vxTotal = vel0.x - vel1.x;
                vel0.x = ((this.m - ball.m) * vel0.x + 2 * ball.m * vel1.x) / (this.m + ball.m);
                vel1.x = vxTotal + vel0.x;
                var absV = Math.abs(vel0.x) + Math.abs(vel1.x),
                    overlap = (this.r + ball.r) - Math.abs(pos0.x - pos1.x);
                pos0.x += vel0.x / absV * overlap;
                pos1.x += vel1.x / absV * overlap;
                //rotate positions & vel back
                var pos0F = Ball.rotate(pos0.x, pos0.y, sin, cos, false),
                    pos1F = Ball.rotate(pos1.x, pos1.y, sin, cos, false);
                ball.pos.x = this.pos.x + pos1F.x;
                ball.pos.y = this.pos.y + pos1F.y;
                this.pos.x = this.pos.x + pos0F.x;
                this.pos.y = this.pos.y + pos0F.y;
                var vel0F = Ball.rotate(vel0.x, vel0.y, sin, cos, false),
                    vel1F = Ball.rotate(vel1.x, vel1.y, sin, cos, false);
                this.vx = vel0F.x;
                this.vy = vel0F.y;
                ball.vx = vel1F.x;
                ball.vy = vel1F.y;
            }
        };
    }

    Ball.rotate = function (x, y, sin, cos, reverse) {
        return {
            x: (reverse) ? (x * cos + y * sin) : (x * cos - y * sin),
            y: (reverse) ? (y * cos - x * sin) : (y * cos + x * sin)
        };
    };

    function draw() {
        clear();
        for (var n=0;n < balls.length; n++) {
            var ball = balls[n];
            ball.draw();
            ball.move();
            ball.bounce();
            for (var m=0;m < balls.length; m++) {
                if (ball!== balls[m]) {
                    ball.collide(balls[m]);
                }
            }
        }
    }

    init();
    animate();

    function animate() {
        requestAnimFrame(animate);
        draw();

    }
});
