const	player1 = {name: 'wasd', icon: '../frontend/assets/logo.jpg', score: 0}
const	player2 = {name: 'Arrows', icon: '../frontend/assets/logo.jpg', score: 0}
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const menu = document.getElementById('menuuu');
const ins_return = document.getElementById('return-to-menu-ins');
const gameContainer = document.querySelector('.gameContainer');
const gameModal = document.getElementById('gameModal');

let	buff = {
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
   y: 0,
   width: canvas.width,
   height: 50
};

let wasdHit = false;
let ARHit = false;
let crossCount = 0;
let AttackCount = 0;
let BigPadCount = 0;
let sbVisible = false;
let abVisible = true;
let flag = 0;
let BallinBuff = false;
let ResetTime = null;
let BallinAttackBuff = false;
let BallinPadBigBuff = false;
let GOscreen = false;
let upPressed = false;
let downPressed = false;
let wPressed = false;
let sPressed = false;
let gameActive = false;
let animationFrameIDs = [];
//UI
function	redoGame(){
	ResetTime = Date.now();
	GOscreen = false;
	gameover = false; 
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (wasdHit === true){
		ARPaddle.height *= 2;
		wasdHit = false;
	}
	if (ARHit === true){
		wasdPaddle.height *= 2;
		ARHit = false;
	}
	crossCount = 0;
	AttackCount = 0;
	BigPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	ball.dy = 6;
	buff.visible = false;
	Attack.visible = false;
	PaddleBigger.visible = false;
	WDblock.visible = false;
	ARblock.visible = false;
	LastpaddletoHit = null;
	gameover = false;
	if (buff.speed > 0) {
		buff.speed *= -1;
	}
	if (Attack.speed > 0) {
		Attack.speed *= -1;
	}
	if (PaddleBigger.speed > 0) {
		PaddleBigger.speed *= -1;
	}
	gameActive = true;
	gameLLoop();
	player1.score = 0;
	player2.score = 0;
}

document.addEventListener('keydown', (event) => {
	if (GOscreen === true){
		if (event.code === 'KeyR'){
				console.log ("trying to do so");
				player1.score = 0;
				player2.score = 0;
				redoGame();
			}
	}
});

function stopGameLoop() {
	for (let i = 0; i < animationFrameIDs.length; i++) {
		 cancelAnimationFrame(animationFrameIDs[i]);
	}
	animationFrameIDs = [];
	gameActive = false;
}

function	resets(){
	GOscreen = false;
	gameover = false; 
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (wasdHit === true){
		ARPaddle.height *= 2;
		wasdHit = false;
	}
	if (ARHit === true){
		wasdPaddle.height *= 2;
		ARHit = false;
	}
	crossCount = 0;
	AttackCount = 0;
	BigPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	ball.dy = 6;
	buff.visible = false;
	Attack.visible = false;
	PaddleBigger.visible = false;
	WDblock.visible = false;
	ARblock.visible = false;
	LastpaddletoHit = null;
	gameover = false;
	if (buff.speed > 0) {
		buff.speed *= -1;
	}
	if (Attack.speed > 0) {
		Attack.speed *= -1;
	}
	if (PaddleBigger.speed > 0) {
		PaddleBigger.speed *= -1;
	}
	player1.score = 0;
	player2.score = 0;
}

document.addEventListener('keydown', (event) => {
	if (GOscreen === true){
		if (event.code === 'KeyQ' && gameActive === false){
			ResetTime = null;
			ball.x = canvas.width / 2;
			ball.y = canvas.height / 2;
			ball.dx *= -1;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			stopGameLoop();
			removeGameOverScreen();
			resets();
			GOscreen = false;
			gameover = false;
			isingame = false;
			menu.style.display = 'flex';
			player1.score = 0;
			player2.score = 0;
			gameActive = false;
		}
	}
});

document.addEventListener('keydown', (event) => {
	if (event.code === 'Space'){
		if (WDblock.visible === true) {
			return;
		}
		if (wasdPaddle.hasanattack === 1){
			WDblock.visible = true;
			WDblock.x = wasdPaddle.x + wasdPaddle.width / 2 - WDblock.width / 2;
			WDblock.y = wasdPaddle.height / 2 + wasdPaddle.y - WDblock.height / 2;
			wasdPaddle.hasanattack = 0;
		}
		else {
			return ;
		}
	}
});
document.addEventListener('keydown', (event) => {
	if (event.code === 'Enter'){
		if (ARblock.visible === true)
			return;
		if (ARPaddle.hasanattack === 1){
			ARblock.visible = true;
			ARblock.x = ARPaddle.x + ARPaddle.width / 2 - ARblock.width / 2;
			ARblock.y = ARPaddle.height / 2 + ARPaddle.y - ARblock.height / 2;
			ARPaddle.hasanattack = 0;
		}
		else
			return ;
	}
});

function didItHit(){
	if (wasdHit === true){
		return;
	}
	if (WDblock.visible === true &&
		(WDblock.x >= ARPaddle.x - ARPaddle.width - 20) &&
		(WDblock.y >= ARPaddle.y) &&
		(WDblock.y <= ARPaddle.y + ARPaddle.height)) 
		{
			WDblock.visible = false;
			ARPaddle.height /= 2;
			wasdHit = true;
		}
}

function didAiHit() {
	if (ARHit === true){
		return;
	}
	if (ARblock.visible === true &&
		(ARblock.x <= wasdPaddle.x + wasdPaddle.width + 20) &&
		(ARblock.y >= wasdPaddle.y) && 
		(ARblock.y <= wasdPaddle.y + wasdPaddle.height)) {
		ARblock.visible = false;
		wasdPaddle.height = wasdPaddle.height / 2;
		ARHit = true;
	}
}
function moveBlock() {
	if (WDblock.visible) {
		WDblock.x += WDblock.speed;

		if (WDblock.x + WDblock.width >= canvas.width) {
			WDblock.visible = false;
		}
	}
}
function moveARBlock() {
	if (ARblock.visible) {
		ARblock.x -= ARblock.speed; 

		if (ARblock.x + ARblock.width <= 0) {
			ARblock.visible = false;
		}
	}
}

function drawwasdBlock() {
	if (WDblock.visible) {
		ctx.fillStyle = 'blue';
		ctx.fillRect(WDblock.x, WDblock.y, WDblock.width, WDblock.height);
	}
}
function drawARBlock() {
	if (ARblock.visible) {
		ctx.fillStyle = 'green';
		ctx.fillRect(ARblock.x, ARblock.y, ARblock.width, ARblock.height);
	}
}


function randomizeBuffX() {
	const leftBoundary = canvas.width * 0.2;
	const rightBoundary = canvas.width * 0.8;
	buff.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
function randomizeAttackX() {
	const leftBoundary = canvas.width * 0.2;
	const rightBoundary = canvas.width * 0.8;
	Attack.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
function randomizePadBigX() {
	const leftBoundary = canvas.width * 0.2;
	const rightBoundary = canvas.width * 0.8;
	PaddleBigger.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}


function movebuff() {
	if (buff.visible) {
		buff.y += buff.speed;
		if (buff.y + buff.height <= 52) {
			buff.speed *= -1;
		}
	if (buff.y + buff.height > canvas.height)
		buff.visible = false;
	}
}
function moveAttackbuff() {
	if (Attack.visible) {
		Attack.y += Attack.speed;
		if (Attack.y + Attack.height <= 52) {
			Attack.speed *= -1;
		}
	if (Attack.y + Attack.height > canvas.height)
		Attack.visible = false;
	}
}
function movePadBigbuff() {
	if (PaddleBigger.visible) {
		PaddleBigger.y += PaddleBigger.speed;
		if (PaddleBigger.y + PaddleBigger.height <= 52) {
			PaddleBigger.speed *= -1;
		}
	if (PaddleBigger.y + PaddleBigger.height > canvas.height)
		PaddleBigger.visible = false;
	}
}

function drawScoreBoard() {
	ctx.clearRect(0, 0, canvas.width, 50);
	ctx.fillStyle = 'black';
	ctx.fillRect(0, 0, canvas.width, 50);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = player1.icon;
	image2.src = player2.icon;
	ctx.drawImage(image1, 10, 5, 40, 40);
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	ctx.fillText('wasd', 10*canvas.width/100, 30);
	ctx.fillText(player1.score, 18*canvas.width/100, 30);
	ctx.drawImage(image2, canvas.width - 50, 5, 40, 40);
	
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white'; 
	ctx.fillText('Arrows', 90*canvas.width/100, 30);
	ctx.fillText(player2.score, 82*canvas.width/100, 30);
}

function giveSpeedBuff(){
	if (LastpaddletoHit === "wasd")
		wasdPaddle.dy = 12;
	else if (LastpaddletoHit === "Arrows")
		ARPaddle.dy = 12;
	if (wasdPaddle.dy === 20 && LastpaddletoHit === "wasd")
		wasdPaddle.dy = 20;
	if (ARPaddle.dy === 20 && LastpaddletoHit === "Arrows")
		ARPaddle.dy = 12;
}
function giveAttackBuff(){
	if (LastpaddletoHit === "wasd")
		wasdPaddle.hasanattack = 1;
	else if (LastpaddletoHit === "Arrows")
		ARPaddle.hasanattack = 1;
	if (wasdPaddle.hasanattack === 1 && LastpaddletoHit === "wasd")
		wasdPaddle.hasanattack = 1;
	if (ARPaddle.hasanattack === 1 && LastpaddletoHit === "Arrows")
		ARPaddle.hasanattack = 1;
}
let doubled = false;
let ARdoubled = false;
function givePadBigBuff(){
	let heightx2 = wasdPaddle.height * 2;
	let aiheightx2 = ARPaddle.height * 2;
	if (LastpaddletoHit === "wasd" && doubled != true){
		wasdPaddle.height = heightx2;
		doubled = true;
	}
	else if (LastpaddletoHit === "Arrows" && ARdoubled != true){
		ARPaddle.height = aiheightx2;
		ARdoubled = true;
	}
}
function drawSpeedBuff() {
	if (buff.visible) {
		 ctx.globalAlpha = 0.5;
		 ctx.fillStyle = "gold";
		 ctx.fillRect(buff.x, buff.y, buff.width, buff.height);
	}
	ctx.globalAlpha = 1.0;
	if ((buff.visible) &&
		 ball.x + ball.radius > buff.x && 
		 ball.x - ball.radius < buff.x + buff.width && 
		 ball.y + ball.radius > buff.y && 
		 ball.y - ball.radius < buff.y + buff.height) {
			  if (!BallinBuff)
					BallinBuff = true;
			  }
			  else {
					if (BallinBuff) {
						 BallinBuff = false;
						 crossCount++;
						 if (LastpaddletoHit === "wasd" || LastpaddletoHit === "Arrows"){
							giveSpeedBuff();
							if (LastpaddletoHit === "wasd"){
								flag = 50;
							}
						}
					}
				}
	if (crossCount === 2) {
		 buff.visible = false;
	}
}
function drawPadBigBuff() {
	if (PaddleBigger.visible) {
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "cyan";
		ctx.fillRect(PaddleBigger.x, PaddleBigger.y, PaddleBigger.width, PaddleBigger.height);
  }
  ctx.globalAlpha = 1.0;
  if ((PaddleBigger.visible) &&
		ball.x + ball.radius > PaddleBigger.x && 
		ball.x - ball.radius < PaddleBigger.x + PaddleBigger.width && 
		ball.y + ball.radius > PaddleBigger.y && 
		ball.y - ball.radius < PaddleBigger.y + PaddleBigger.height) {
			 if (!BallinPadBigBuff)
				  BallinPadBigBuff = true;
			 }
			 else {
				  if (BallinPadBigBuff) {
						BallinPadBigBuff = false;
						BigPadCount++;
						if (LastpaddletoHit === "wasd" || LastpaddletoHit === "Arrows"){
						  givePadBigBuff();
						}
					}
			  }
  if (BigPadCount === 2) {
		PaddleBigger.visible = false;
  }
}
function	drawAttackBuff(){
	if (Attack.visible) {
		ctx.globalAlpha = 0.5;
		ctx.fillStyle = "red";
		ctx.fillRect(Attack.x, Attack.y, Attack.width, Attack.height);
  }
  ctx.globalAlpha = 1.0;
  if ((Attack.visible) &&
		ball.x + ball.radius > Attack.x && 
		ball.x - ball.radius < Attack.x + Attack.width && 
		ball.y + ball.radius > Attack.y && 
		ball.y - ball.radius < Attack.y + Attack.height) {
			 if (!BallinAttackBuff)
				  BallinAttackBuff = true;
			 }
			 else {
				  if (BallinAttackBuff) {
						BallinAttackBuff = false;
						AttackCount++;
						if (LastpaddletoHit === "wasd" || LastpaddletoHit === "Arrows"){
						  giveAttackBuff();
						}
					}
			  }
  if (AttackCount === 2) {
		Attack.visible = false;
  }
}

function drawTimer() {
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.fillText(`${elapsedTime}`, canvas.width /2, 30);
}
function gameOverScreen(){
	if (player1.score >= 2){
		GOscreen = true;
		showGameOverScreen();
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`wasd: ${player1.score}`, canvas.width / 3, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`Arrows: ${player2.score}`, canvas.width / 1.5, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`WINNER: player1`, canvas.width / 2, canvas.height / 2 - 100);
		player1.score = 0;
		gameover = true;
		isingame = false;
	}
	else if (player2.score >= 2){
		showGameOverScreen();
		GOscreen = true;
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`wasd: ${player1.score}`, canvas.width / 3, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`Arrows: ${player2.score}`, canvas.width / 1.5, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`WINNER: player2`, canvas.width / 2, canvas.height / 2 - 100);
		gameover = true;
		isingame = false;
	}
}
function removeGameOverScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	GOscreen = false;
	gameover = false;
	console.log("we made it here");
	isingame = false;
}
function showGameOverScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = '#000';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	const	font_size = canvas.width * 0.15;
	ctx.font = `${font_size}px "PixelFont", sans-serif`;
	ctx.fillStyle = '#ffffff';
	ctx.textAlign = 'center';
	ctx.fillText('GAME OVER', canvas.width * 0.5, canvas.height * 0.3);
	ctx.font = '24px "PixelFont", sans-serif';
	ctx.fillStyle = '#ff0000';
	ctx.fillText('Press R to replay, Q to go back to main menu', canvas.width / 2, canvas.height / 2 + 500);
}

//gamelogic
let gameStartTime;
const speedIncreaseInterval = 5000;
const initialSpeed = 4;
const speedIncrement = 0.22;


function drawPaddle(x, y, width, height) {
	ctx.fillStyle = 'white';
	if (flag){
		 ctx.fillStyle = 'gold';
		 flag--;
	}
	ctx.fillRect(x, y, width, height);

}

function drawBall(x, y, radius) {
	ctx.beginPath();
	ctx.arc(x, y, radius, 0, Math.PI * 2);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.closePath();
}

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
        drawScoreBoard();
        ctx.font = '48px sans-serif'; 
        ctx.fillStyle = '#fff';
        ctx.fillText(`Round starts in: ${countdown}`, canvas.width / 2 , canvas.height * 0.4);
        
        countdown--;

        if (countdown < 0) {
            clearInterval(intervalID);
            callback();
      	}
   }, 1000);
}

function restartGame(difficulty) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (wasdHit === true){
		ARPaddle.height *= 2;
		wasdHit = false;
	}
	if (ARHit === true){
		wasdPaddle.height *= 2;
		ARHit = false;
	}
	crossCount = 0;
	AttackCount = 0;
	BigPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	ball.dy = 4;
	buff.visible = false;
	Attack.visible = false;
	WDblock.visible = false;
	ARblock.visible = false;
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
	if (PaddleBigger.speed > 0) {
		PaddleBigger.speed *= -1;
	};
}


let isingame = false;
resizeCanvas();
addEventListener('resize', resizeCanvas);

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
	if (e.code === 'KeyW') wPressed = true;
	if (e.code === 'KeyS') sPressed = true;
});

document.addEventListener('keyup', (e) => {
	if (e.code === 'KeyW') wPressed = false;
	if (e.code === 'KeyS') sPressed = false;
});

document.addEventListener('keydown', (e) => {
	if (e.code === 'ArrowUp') upPressed = true;
	if (e.code === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
	if (e.code === 'ArrowUp') upPressed = false;
	if (e.code === 'ArrowDown') downPressed = false;
});
function moveBall() {
	const elapsedTime = Date.now() - ResetTime;
	const speedFactor = 1 + Math.floor(elapsedTime / speedIncreaseInterval) * speedIncrement;
	ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
	ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);

	ball.x += ball.dx;
	ball.y += ball.dy;

	if (ball.y + ball.radius < 70 ||ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
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

	if ((ball.x - ball.radius <= 0 || ball.x + ball.radius >= canvas.width))
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
    gameLLoop();
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
		 countdownBeforeRound(() => {
			gameActive = true;
			setbackoriginalvalues();
			restartRound();
			restartGame();
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
		 stopGameLoop();
		 ball.x = canvas.width / 2;
		 ball.y = canvas.height / 2;
		 ball.dx *= -1;
		 ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
		 ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
		 countdownBeforeRound(() => {
			 gameActive = true;
			 setbackoriginalvalues();
			 restartRound();
			 restartGame();
			});
		 return; 
	}
}
let gameover = false;

function    setbackoriginalvalues(){
	wasdPaddle.width = canvas.width * 0.01;
	ARPaddle.width = canvas.width * 0.01;
	wasdPaddle.height = canvas.height * 0.1;
	ARPaddle.height = canvas.height * 0.1;
	wasdPaddle.y = canvas.height / 2 - wasdPaddle.height / 2;
	ARPaddle.y = canvas.height / 2 - wasdPaddle.height / 2;
}
function getRandomNumber() {
	const randomNumber = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
	return randomNumber;
}

let storedRandomNumber = getRandomNumber();

function gameLLoop() {
	if (!gameActive) {
		 return;
	}
	if (!ResetTime)
		 ResetTime = Date.now();
	isingame = true;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	elapsedTime = Math.floor((Date.now() - ResetTime) / 1000);
	if (elapsedTime === 1) {
		Attack.visible = true;
		Attack.y = canvas.height - Attack.height;
		randomizeAttackX();
	}
	if (Attack.visible)
		 moveAttackbuff();
	if (AttackCount === 2)
		 Attack.visible = false;
	if (elapsedTime === 4) {
		buff.visible = true;
		buff.y = canvas.height - buff.height;
		randomizeBuffX();
	}
	if (buff.visible) {
		movebuff();
	}
	if (crossCount === 2)
		buff.visible = false;
	if (elapsedTime === 5) {
		PaddleBigger.visible = true;
		PaddleBigger.y = canvas.height - PaddleBigger.height;
		randomizePadBigX();
  }
  if (PaddleBigger.visible) {
		movePadBigbuff();
  }
  if (BigPadCount === 2)
		PaddleBigger.visible = false;
	drawPaddle(wasdPaddle.x, wasdPaddle.y, wasdPaddle.width, wasdPaddle.height);
	drawPaddle(ARPaddle.x, ARPaddle.y, ARPaddle.width, ARPaddle.height);
	drawBall(ball.x, ball.y, ball.radius);
	movewasdPaddle();
	moveARPaddle();
	didItHit();
	didAiHit();
	drawARBlock();
	drawwasdBlock();
	moveBlock();
	moveARBlock();
	drawSpeedBuff();
	drawAttackBuff();
	drawPadBigBuff();
	moveBall();
	drawScoreBoard();
	drawTimer();
	gameOverScreen();
	let frameID = requestAnimationFrame(() => gameLLoop());
	animationFrameIDs.push(frameID);
	if (gameover) {
		 console.log(animationFrameIDs);
		 setbackoriginalvalues();
		 gameActive = false;
		 return;
	}
}

document.getElementById('pong-local').addEventListener('click', () => {
	menu.style.display = 'none';
	gameActive = true;
	gameLLoop();
})