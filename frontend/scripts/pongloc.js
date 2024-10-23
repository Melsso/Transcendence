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

function moveBall() {
	const elapsedTime = Date.now() - ResetTime;
	const speedFactor = 1 + Math.floor(elapsedTime / speedIncreaseInterval) * speedIncrement;
	ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
	ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);

	ball.x += ball.dx;
	ball.y += ball.dy;

	if (ball.y + ball.radius < 70 ||ball.y + ball.radius > 40 || ball.y - ball.radius < 0) {
		 ball.dy *= -1;
	}

	if (
		 ball.x - ball.radius < wasdPaddle.x + wasdPaddle.width &&
		 ball.y > wasdPaddle.y &&
		 ball.y < wasdPaddle.y + wasdPaddle.height
	) {
		 var relativeIntersectY = (wasdPaddle.y + wasdPaddle.height / 2) - ball.y;
		 var normrelIntersectY = relativeIntersectY / (wasdPaddle.height / 2);
		 var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));

		 ball.dx = ball.speed * Math.cos(bounceAngle);
		 ball.dy = -ball.speed * Math.sin(bounceAngle);
		 
		 ball.x = wasdPaddle.x + wasdPaddle.width + ballRadius + 1;
		 
		 ball.dx = ball.speed * (ball.dx > 0 ? 1 : -1);
		 LastpaddletoHit = "wasd";
	}

	if (
		 ball.x + ball.radius > ARPaddle.x &&
		 ball.y > ARPaddle.y &&
		 ball.y < ARPaddle.y + ARPaddle.height
	) {
		 var relativeIntersectY = (ARPaddle.y + ARPaddle.height / 2) - ball.y;
		 var normrelIntersectY = relativeIntersectY / (ARPaddle.height / 2);
		 var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));
		 ball.dx = - ball.speed * Math.cos(bounceAngle);
		 ball.dy = - ball.speed * Math.sin(bounceAngle);
		 ball.x = ARPaddle.x - ballRadius -1;
		 ball.dx = ball.speed * (ball.dx > 0 ? 1 : -1);
		 LastpaddletoHit = "Arrows";
	}

	if ((ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width) && fullTime >= 0)
		 newRound();
}


function stopGameLoop() {
	for (let i = 0; i < animationFrameIDs.length; i++) {
		 cancelAnimationFrame(animationFrameIDs[i]);
	}
	animationFrameIDs = [];
	gameActive = false;
}


function restartRound() {
    gameLoop(diffy);
}
function newRound(){
	EL = elapsedTime;
	const speedFactor = 1 + Math.floor(elapsedTime / speedIncreaseInterval) * speedIncrement;
	if (ball.x - ball.radius <= 0) {
		 player2.score++;
		 console.log("Arrows has scored: " + player2.score);
		 if (player2.score === 2){
			  gameover = true;
			  return;
		 }
		 stopGameLoop();
		 ball.x = canvas.width / 2;
		 ball.y = canvas.height / 2;
		 ball.dx *= -1;
		 ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
		 ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
		 restartGame();
		 countdownBeforeRound(() => {
			  gameActive = true;
			  restartRound();
		 });
		 return; 
	}
	if (ball.x + ball.radius >= canvas.width) {
		 player1.score++;
		 console.log("wasd has scored: " + player1.score);
		 if (player1.score === 2){
			  gameover = true;
			  return;
		 }
		 ball.x = canvas.width / 2;
		 ball.y = canvas.height / 2;
		 ball.dx *= -1;
		 ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
		 ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
		 countdownBeforeRound(() => {
			  switchOnAI();
			  restartGame();
		 });
		 return; 
	}
}
