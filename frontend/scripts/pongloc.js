const	player1 = {name: 'wasd', icon: '../frontend/assets/logo.jpg', score: 0}
const	player2 = {name: 'Arrows', icon: '../frontend/assets/logo.jpg', score: 0}

let	Buff = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};

let Attack = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};
let PaddleBigger = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};

let WDblock = {
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	speed: 40,
	visible: false
};

let ARblock = {
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	speed: 40,
	visible: false
};


let LastpaddletoHit = null;

let wasdPaddle = {
   x: 0,
   y: 0,
   width: 0,
   height: 0,
   dy: 7,
   hasanattack: null
};

let ARPaddle = {
   x: 0,
   y: 0,
   width: 0,
   height: 0,
   dy: 7,
   hasanattack: null
};

let ball = {
   x: 0,
   y: 0,
   radius: 0,
   speed: 3,
   dx: 0,
   dy: 6
};

let scoreboard = {
   x: 0,
   y: 0, // Assuming the scoreboard starts at the top of the canvas
   width: canvas.width,
   height: 50 // Height of the scoreboard, adjust as necessary
};


let gameStartTime;
const speedIncreaseInterval = 5000;
const initialSpeed = 6;
const speedIncrement = 0.22;


function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    setGameDimensions();
}

function setGameDimensions() {
   paddleWidth = canvas.width * 0.01;
   paddleHeight = canvas.height * 0.1;
   ballRadius = canvas.width * 0.01;

	wasdPaddle.width = paddleWidth;
	wasdPaddle.height = paddleHeight;
	wasdPaddle.x = 0;
   wasdPaddle.y = canvas.height / 2 - paddleHeight / 2;

   ARPaddle.width = paddleWidth;
   ARPaddle.height = paddleHeight;
   ARPaddle.x = canvas.width - paddleWidth;
   ARPaddle.y = canvas.height / 2 - paddleHeight / 2;

   ball.radius = ballRadius;
   ball.x = canvas.width / 2;
   ball.y = canvas.height / 2;
}

function countdownBeforeRound(callback) {
    let countdown = 3;
    
    const intervalID = setInterval(() => {
 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
        drawPaddle(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
        drawBall(ball.x, ball.y, ball.radius);
        window.drawScoreBoard();
        ctx.font = '48px sans-serif'; 
        ctx.fillStyle = '#fff';
        ctx.fillText(`Round starts in: ${countdown}`, canvas.width / 2 , canvas.height * 0.4);
        
        countdown--;

        if (countdown < 0) {
            clearInterval(intervalID);
            callback(); // Call the function to restart the round
        }
    }, 1000); // Set interval for every 1 second
}

