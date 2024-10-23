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
        drawPaddle(wasdPaddle.x, wasdPaddle.y, wasdPaddle.width, wasdPaddle.height);
        drawPaddle(ARPaddle.x, ARPaddle.y, ARPaddle.width, ARPaddle.height);
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

function restartGame(difficulty) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (wasHit === true){
		ARPaddle.height *= 2;
		wasHit = false;
	}
	if (aiDidHit === true){
		wasdPaddle.height *= 2;
		aiDidHit = false;
	}
	setbackoriginalvalues();
	wasdPaddle.x = 0;
	wasdPaddle.y = canvas.height / 2 - wasdPaddle.height / 2;
	ARPaddle.x = canvas.width - ARPaddle.width;
	ARPaddle.y = canvas.height / 2 - ARPaddle.height / 2;
	crossCount = 0;
	AttackCount = 0;
	BigPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	ball.dy = 6;
	buff.visible = false;
	Attack.visible = false;
	block.visible = false;
	PaddleBigger.visible = false;
	ResetTime = null;
	LastpaddletoHit = null;
	gameover = false;
	if (buff.speed > 0) {
		buff.speed *= -1;
	}
	if (Attack.speed > 0) {
		Attack.speed *= -1;
	};
}


let isingame = false;
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function movewasdPaddle() {
    if (wPressed && wasdPaddle.y > 50) {
        wasdPaddle.y -= wasdPaddle.dy;
    } else if (sPressed && wasdPaddle.y < canvas.height - wasdPaddle.height) {
        wasdPaddle.y += wasdPaddle.dy;
    }
}


function moveARPaddle() {
	if (upPressed && ARPaddle.y > 50) {
		 ARPaddle.y -= ARPaddle.dy;
	} else if (downPressed && ARPaddle.y < canvas.height - ARPaddle.height) {
		 ARPaddle.y += ARPaddle.dy;
	}
}
document.addEventListener('keydown', (e) => {
	if (e.key === 'KeyW') wPressed = true;
	if (e.key === 'KeyS') sPressed = true;
});

document.addEventListener('keyup', (e) => {
	if (e.key === 'KeyW') wPressed = false;
	if (e.key === 'KeyS') sPressed = false;
});

document.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowUp') upPressed = true;
	if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
	if (e.key === 'ArrowUp') upPressed = false;
	if (e.key === 'ArrowDown') downPressed = false;
});

