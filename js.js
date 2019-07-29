function newGame() {
    let snake;
    function Draw() {}

    Draw.prototype = function() {
        let setBackgroundColor = function(context, color) {
            return context.fillStyle = color;
        };
        let fillCanvasRectangle = function(context, xStart, yStart, xEnd, yEnd) {
            return context.fillRect(xStart, yStart, xEnd, yEnd);
        };
        let createGradient = function(context, xGradientStartPoint, yGradientStartPoint, xGradientEndPoint, yGradientEndPoint) {
            let gradient = context.createLinearGradient(xGradientStartPoint, yGradientStartPoint, xGradientEndPoint, yGradientEndPoint);
            return gradient;
        };
        let addColorStopToGradient = function(gradient, stop, color) {
            return gradient.addColorStop(stop, color);
        };
        let setCanvasTextStyle = function(context, font, fillStyle) {
            context.font = font;
            context.fillStyle = fillStyle;
        };
        let fillCanvasText = function(context, text, startX, startY) {
            context.fillText(text, startX, startY);
        };

        return {
            setBackgroundColor: setBackgroundColor,
            fillCanvasRectangle: fillCanvasRectangle,
            createGradient: createGradient,
            addColorStopToGradient: addColorStopToGradient,
            setCanvasTextStyle: setCanvasTextStyle,
            fillCanvasText: fillCanvasText
        }
    }();

    let draw = new Draw();
    draw.prototype = Draw.prototype;

    function Canvas() {
        this.element = document.getElementById('myCanvas');
        this.context = this.element.getContext('2d');
        this.elementSize = 20;
    }

    Canvas.prototype = function() {
        let drawGrid = function() {
            for (let i = 0; i < this.element.width; i += 20) {
                this.context.moveTo(0.5 + i + this.elementSize, 0);
                this.context.lineTo(0.5 + i + this.elementSize, this.element.height);
            }
            for (let i = 0; i < this.element.height; i += 20) {
                this.context.moveTo(0, 0.5 + i + this.elementSize);
                this.context.lineTo(this.element.width, 0.5 + i + this.elementSize);
            }
            this.context.strokeStyle = "#7c7c7c";
            this.context.stroke();
        };

        let drawStartScreen = function(context) {
            draw.setBackgroundColor(context, "#FFF");
            draw.fillCanvasRectangle(context, 40, 240, 400, 120);
            let gradient = draw.createGradient(context, 0, 0, canvas.element.width, 0);
            draw.addColorStopToGradient(gradient, "0.25", "#ff00ff");
            draw.addColorStopToGradient(gradient, "0.5", "#25d1cf");
            draw.addColorStopToGradient(gradient, "1.0", "#ff00ff");
            draw.setCanvasTextStyle(context, "40px Verdana", gradient);
            draw.fillCanvasText(context, "Click 'Start' to play", 85, 310);
        };

        let clearScreen = function(context, xStart, yStart, xEnd, yEnd) {
            context.clearRect(xStart, yStart, xEnd, yEnd);
        };

        return {
            drawGrid: drawGrid,
            drawStartScreen: drawStartScreen,
            clearScreen: clearScreen
        }
    }();

    let canvas = new Canvas();
    canvas.prototype = Canvas.prototype;
    canvas.drawStartScreen(canvas.context);

    function Snake() {
        this.length = 3;
        this.bodyArray = [];
        this.coordinates = [];
        this.direction = 'right';
        this.maxLength = this.getMaxSnakeLength();
        this.createSnakeBody();
    }

    Snake.prototype = function() {
        let createSnakeBody = function() {
            for (let i = this.length; i > 0; i--) {
                this.bodyArray.push({
                    x: i,
                    y: 0
                })
            }
        };

        let createSnakeCoordinatesArray = function(coordinates) {
            return this.coordinates.push([coordinates[0], coordinates[1]]);
        };

        let getMaxSnakeLength = function() {
            return (canvas.element.width/canvas.elementSize) * (canvas.element.height/canvas.elementSize) - 1;
        };

        let drawSnake = function(snakePositionX, snakePositionY) {
            let coordinates = [
                snakePositionX * canvas.elementSize + (canvas.element.width/2),
                snakePositionY * canvas.elementSize + (canvas.element.height/2)
            ];
            draw.setBackgroundColor(canvas.context, "#77c90c");
            draw.fillCanvasRectangle(canvas.context, coordinates[0], coordinates[1], canvas.elementSize, canvas.elementSize);
            this.createSnakeCoordinatesArray(coordinates);
        };

        let getAlive = function() {
            this.currentPosition = [this.bodyArray[0].x, this.bodyArray[0].y];
            this.changeDirection(this.direction);

            if (this.collisionWithOwnBody() || this.collisionWithCanvas()) {
                if (this.length > this.maxLength) {
                    snakeGame.levelUp();
                } else {
                    snakeGame.lives--;
                    updateElementInnerHtml("lives", snakeGame.lives);
                    if (snakeGame.lives == 0) {
                        snakeGame.over();
                        return;
                    }
                    this.score = 0;
                    updateElementInnerHtml("score", this.score);
                    this.level = 1;
                    updateElementInnerHtml("level", this.level);
                    snakeGame.collision = true;
                    snakeGame.over();
                    snakeGame.start();
                    snakeGame.loop();
                }
                return;
            }

            if (this.coordinates[0][0] === food.positionX && this.coordinates[0][1] === food.positionY) {
                this.eatFood();
            } else {
                this.move();
            }
            this.bodyArray.unshift(this.tail);
        };

        let changeDirection = function(direction) {
            let self = this;
            let directions = {
                "right": function() {
                    self.currentPosition[0]++;
                },
                "left": function() {
                    self.currentPosition[0]--;
                },
                "up": function() {
                    self.currentPosition[1]--;
                },
                "down": function() {
                    self.currentPosition[1]++;
                }
            };
            directions[direction]();
        };

        let collisionWithOwnBody = function() {
            for (let i = 3; i < this.bodyArray.length; i++) {
                if (this.coordinates[0][0] === this.coordinates[i][0] && this.coordinates[0][1] === this.coordinates[i][1]) {
                    return true;
                }
            }
            return false;
        };

        let collisionWithCanvas = function() {
            if (this.coordinates[0][0] >= canvas.element.width || this.coordinates[0][0] <= 0 || this.coordinates[0][1] < 0 || this.coordinates[0][1] >= canvas.element.height) {
                return true;
            }
            return false;
        };

        let eatFood = function() {
            this.tail = {
                x: this.currentPosition[0],
                y: this.currentPosition[1]
            };
            this.length++;
            snakeGame.score++;
            updateElementInnerHtml("score", snakeGame.score)
        };

        let move = function() {
            this.tail = this.bodyArray.pop();
            this.tail.x = this.currentPosition[0];
            this.tail.y = this.currentPosition[1];
        };

        return {
            createSnakeBody: createSnakeBody,
            createSnakeCoordinatesArray: createSnakeCoordinatesArray,
            getMaxSnakeLength: getMaxSnakeLength,
            drawSnake: drawSnake,
            getAlive: getAlive,
            changeDirection: changeDirection,
            collisionWithOwnBody: collisionWithOwnBody,
            collisionWithCanvas: collisionWithCanvas,
            eatFood: eatFood,
            move: move,
        }
    }();

    function SnakeGame() {
        this.speed = 130;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.collision = false;
        this.startInterval = null;
        this.isRunning = false;
        this.isPaused = false;
    }

    SnakeGame.prototype = function() {
        let start = function() {
            document.addEventListener("keydown", changeSnakeDirection);
            if (!snake || !this.isPaused){
                snake = new Snake();
                snake.prototype = Snake.prototype;
            }
            snake = snake;

            if (!food || !this.isPaused) {
                food.x  = food.generateRandomNumber();
                food.y = food.generateRandomNumber();
            }
        };

        let loop = function() {
            this.startInterval = setInterval(function() {
                canvas.clearScreen(canvas.context, 0, 0, canvas.element.width, canvas.element.height);
                canvas.drawGrid();
                snake.coordinates = [];
                for (let i = 0; i < snake.length; i++) {
                    snake.drawSnake(snake.bodyArray[i].x, snake.bodyArray[i].y);
                }
                snake.getAlive();
                food.createFood();
                food.drawFood();
            }, this.speed);
        };

        let pause = function() {
            clearInterval(this.startInterval);
        };

        let over = function() {
            clearInterval(this.startInterval);
        };

        let levelUp = function() {
            snakeGame.lives = 3;
            updateElementInnerHtml("lives", snakeGame.lives);
            this.score = 0;
            updateElementInnerHtml("score", this.score);
            this.level++;
            updateElementInnerHtml("level", this.level);
            this.start();
        };

        return {
            start: start,
            loop: loop,
            pause: pause,
            over: over,
            levelUp: levelUp
        }
    }();

    let snakeGame = new SnakeGame();
    snakeGame.prototype = SnakeGame.prototype;

    function updateElementInnerHtml(id, value) {
        return document.getElementById(id).innerHTML = value;
    }

    function Food() {
        this.x = this.generateRandomNumber();
        this.y = this.generateRandomNumber();
        this.positionX = 0;
        this.positionY = 0;
    }

    Food.prototype = function(){
        let generateRandomNumber = function() {
            return Math.floor((Math.random() * 20) + 1);
        };

        let createFood = function() {
            for (let i = 0; i < snake.coordinates.length; i++) {
                if (this.positionX === snake.coordinates[i][0] && this.positionY === snake.coordinates[i][1]) {
                    this.x = generateRandomNumber();
                    this.y = generateRandomNumber();
                }
                this.positionX = this.x * canvas.elementSize;
                this.positionY = this.y * canvas.elementSize;
            }
        };

        let drawFood = function() {
            draw.setBackgroundColor(canvas.context, "#B942F4");
            draw.fillCanvasRectangle(canvas.context, this.positionX, this.positionY, canvas.elementSize, canvas.elementSize);
        };

        return {
            generateRandomNumber: generateRandomNumber,
            createFood: createFood,
            drawFood: drawFood
        }
    }();

    let food = new Food();
    food.prototype = Food.prototype;

    function changeSnakeDirection(e) {
        if (e.keyCode === 37 && snake.direction !== "right") {
            snake.direction = "left";
        } else if (e.keyCode === 38 && snake.direction !== "down") {
            snake.direction = "up";
        } else if (e.keyCode === 39 && snake.direction !== "left") {
            snake.direction = "right";
        } else if (e.keyCode === 40 && snake.direction !== "up") {
            snake.direction = "down";
        }
    }

    document.getElementById("start-button").addEventListener("click", function() {
        if (!snakeGame.isRunning) {
            snakeGame.start();
            snakeGame.loop();
        }
        snakeGame.isRunning = true;
    });

    document.getElementById("pause-button").addEventListener("click", function() {
        if (!snakeGame.isPaused) {
            snakeGame.pause();
            snakeGame.isPaused = true;
        } else {
            snakeGame.start();
            snakeGame.loop();
            snakeGame.isPaused = false;
        }
    });

    document.getElementById("restart-button").addEventListener("click", function() {
        snakeGame.lives = 3;
        updateElementInnerHtml("lives", snakeGame.lives);
        snakeGame.score = 0;
        updateElementInnerHtml("score", snakeGame.score);
        snakeGame.level = 1;
        updateElementInnerHtml("level", snakeGame.level);
        snakeGame.start();
    });
}

newGame();