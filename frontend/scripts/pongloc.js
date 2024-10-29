const	player1 = {name: 'wasd', icon: '../frontend/assets/logo.jpg', score: 0}
const	player2 = {name: 'Arrows', icon: '../frontend/assets/logo.jpg', score: 0}
const Canvaas = document.getElementById('pongCanvas');
const ctxx = Canvaas.getContext('2d');
const menuu = document.getElementById('menuuu');
const ins_returnn = document.getElementById('return-to-menu-ins');
const gameContainerr = document.querySelector('.gameContainer');
const gameModall = document.getElementById('gameModal');
let sett = null;
let elapsedTime;
let el;
let ppaddleWidth;
let ppaddleHeight;
let ballsRadius;

let	Powerup = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};

let Attacking = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};
let BiggerPaddle = {
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


let LastpaddleHit = null;

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

let Balls = {
   x: 0,
   y: 0,
   radius: 0,
   speed: 3,
   dx: 0,
   dy: 6
};

let wasdHit = false;
let ARHit = false;
let SpeedCount = 0;
let AttackingCount = 0;
let BiggerPadCount = 0;
let fflag = 0;
let BallinsideBuff = false;
let ResetedTime = null;
let BallinAttackingBuff = false;
let BallinBiggerPadBuff = false;
let GameOverscreen = false;
let ArrowupPressed = false;
let ArrowdownPressed = false;
let wPressed = false;
let sPressed = false;
let gameActive = false;
let animationFramesIDs = [];
//UI
function	redotheGame(){
	ResetedTime = Date.now();
	GameOverscreen = false;
	gameover = false; 
	ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
	if (wasdHit === true){
		ARPaddle.height *= 2;
		wasdHit = false;
	}
	if (ARHit === true){
		wasdPaddle.height *= 2;
		ARHit = false;
	}
	SpeedCount = 0;
	AttackingCount = 0;
	BiggerPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	Balls.dy = 6;
	Powerup.visible = false;
	Attacking.visible = false;
	BiggerPaddle.visible = false;
	WDblock.visible = false;
	ARblock.visible = false;
	LastpaddleHit = null;
	gameover = false;
	if (Powerup.speed > 0) {
		Powerup.speed *= -1;
	}
	if (Attacking.speed > 0) {
		Attacking.speed *= -1;
	}
	if (BiggerPaddle.speed > 0) {
		BiggerPaddle.speed *= -1;
	}
	gameActive = true;
	gameLLoop();
	player1.score = 0;
	player2.score = 0;
}

document.addEventListener('keydown', (event) => {
	if (GameOverscreen === true){
		if (event.code === 'KeyR'){
				player1.score = 0;
				player2.score = 0;
				redotheGame();
			}
	}
});

function stopGameLLoop() {
	for (let i = 0; i < animationFramesIDs.length; i++) {
		 cancelAnimationFrame(animationFramesIDs[i]);
	}
	animationFramesIDs = [];
	gameActive = false;
}

function	reseting(){
	GameOverscreen = false;
	gameover = false; 
	ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
	if (wasdHit === true){
		ARPaddle.height *= 2;
		wasdHit = false;
	}
	if (ARHit === true){
		wasdPaddle.height *= 2;
		ARHit = false;
	}
	SpeedCount = 0;
	AttackingCount = 0;
	BiggerPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	Balls.dy = 6;
	Powerup.visible = false;
	Attacking.visible = false;
	BiggerPaddle.visible = false;
	WDblock.visible = false;
	ARblock.visible = false;
	LastpaddleHit = null;
	gameover = false;
	if (Powerup.speed > 0) {
		Powerup.speed *= -1;
	}
	if (Attacking.speed > 0) {
		Attacking.speed *= -1;
	}
	if (BiggerPaddle.speed > 0) {
		BiggerPaddle.speed *= -1;
	}
	player1.score = 0;
	player2.score = 0;
}

document.addEventListener('keydown', (event) => {
	if (GameOverscreen === true){
		if (event.code === 'KeyQ' && gameActive === false){
			ResetedTime = null;
			Balls.x = Canvaas.width / 2;
			Balls.y = Canvaas.height / 2;
			Balls.dx *= -1;
			ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
			stopGameLLoop();
			removeGameOScreen();
			reseting();
			GameOverscreen = false;
			gameover = false;
			iscurrentlyingame = false;
			menuu.style.display = 'flex';
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

function didIHit(){
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

function didArrowsiHit() {
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
function shootingBlock() {
	if (WDblock.visible) {
		WDblock.x += WDblock.speed;

		if (WDblock.x + WDblock.width >= Canvaas.width) {
			WDblock.visible = false;
		}
	}
}
function shootingARBlock() {
	if (ARblock.visible) {
		ARblock.x -= ARblock.speed; 

		if (ARblock.x + ARblock.width <= 0) {
			ARblock.visible = false;
		}
	}
}

function drawwasdBlock() {
	if (WDblock.visible) {
		ctxx.fillStyle = 'blue';
		ctxx.fillRect(WDblock.x, WDblock.y, WDblock.width, WDblock.height);
	}
}
function drawARBlock() {
	if (ARblock.visible) {
		ctxx.fillStyle = 'green';
		ctxx.fillRect(ARblock.x, ARblock.y, ARblock.width, ARblock.height);
	}
}


function randomBuffX() {
	const leftBoundary = Canvaas.width * 0.2;
	const rightBoundary = Canvaas.width * 0.8;
	Powerup.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
function randomAttackX() {
	const leftBoundary = Canvaas.width * 0.2;
	const rightBoundary = Canvaas.width * 0.8;
	Attacking.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
function randomPadBigX() {
	const leftBoundary = Canvaas.width * 0.2;
	const rightBoundary = Canvaas.width * 0.8;
	BiggerPaddle.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}


function movingbuff() {
	if (Powerup.visible) {
		Powerup.y += Powerup.speed;
		if (Powerup.y + Powerup.height <= 52) {
			Powerup.speed *= -1;
		}
	if (Powerup.y + Powerup.height > Canvaas.height)
		Powerup.visible = false;
	}
}
function movingAttackbuff() {
	if (Attacking.visible) {
		Attacking.y += Attacking.speed;
		if (Attacking.y + Attacking.height <= 52) {
			Attacking.speed *= -1;
		}
	if (Attacking.y + Attacking.height > Canvaas.height)
		Attacking.visible = false;
	}
}
function movingPadBigbuff() {
	if (BiggerPaddle.visible) {
		BiggerPaddle.y += BiggerPaddle.speed;
		if (BiggerPaddle.y + BiggerPaddle.height <= 52) {
			BiggerPaddle.speed *= -1;
		}
	if (BiggerPaddle.y + BiggerPaddle.height > Canvaas.height)
		BiggerPaddle.visible = false;
	}
}

function drawScore() {
	ctxx.clearRect(0, 0, Canvaas.width, 50);
	ctxx.fillStyle = 'black';
	ctxx.fillRect(0, 0, Canvaas.width, 50);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = player1.icon;
	image2.src = player2.icon;
	ctxx.drawImage(image1, 10, 5, 40, 40);
	ctxx.font = '20px Arial';
	ctxx.fillStyle = 'white';
	ctxx.fillText('wasd', 10*Canvaas.width/100, 30);
	ctxx.fillText(player1.score, 18*Canvaas.width/100, 30);
	ctxx.drawImage(image2, Canvaas.width - 50, 5, 40, 40);
	
	ctxx.font = '20px Arial';
	ctxx.fillStyle = 'white'; 
	ctxx.fillText('Arrows', 90*Canvaas.width/100, 30);
	ctxx.fillText(player2.score, 82*Canvaas.width/100, 30);
}

function givingSpeedBuff(){
	if (LastpaddleHit === "wasd")
		wasdPaddle.dy = 12;
	else if (LastpaddleHit === "Arrows")
		ARPaddle.dy = 12;
	if (wasdPaddle.dy === 20 && LastpaddleHit === "wasd")
		wasdPaddle.dy = 20;
	if (ARPaddle.dy === 20 && LastpaddleHit === "Arrows")
		ARPaddle.dy = 12;
}
function givingAttackBuff(){
	if (LastpaddleHit === "wasd")
		wasdPaddle.hasanattack = 1;
	else if (LastpaddleHit === "Arrows")
		ARPaddle.hasanattack = 1;
	if (wasdPaddle.hasanattack === 1 && LastpaddleHit === "wasd")
		wasdPaddle.hasanattack = 1;
	if (ARPaddle.hasanattack === 1 && LastpaddleHit === "Arrows")
		ARPaddle.hasanattack = 1;
}
let doubledheight = false;
let ARdoubledheight = false;
function givingPadBigBuff(){
	let heightx2 = wasdPaddle.height * 2;
	let aiheightx2 = ARPaddle.height * 2;
	if (LastpaddleHit === "wasd" && doubledheight != true){
		wasdPaddle.height = heightx2;
		doubledheight = true;
	}
	else if (LastpaddleHit === "Arrows" && ARdoubledheight != true){
		ARPaddle.height = aiheightx2;
		ARdoubledheight = true;
	}
}
function drawingSpeedBuff() {
	if (Powerup.visible) {
		 ctxx.globalAlpha = 0.5;
		 ctxx.fillStyle = "gold";
		 ctxx.fillRect(Powerup.x, Powerup.y, Powerup.width, Powerup.height);
	}
	ctxx.globalAlpha = 1.0;
	if ((Powerup.visible) &&
		 Balls.x + Balls.radius > Powerup.x && 
		 Balls.x - Balls.radius < Powerup.x + Powerup.width && 
		 Balls.y + Balls.radius > Powerup.y && 
		 Balls.y - Balls.radius < Powerup.y + Powerup.height) {
			  if (!BallinsideBuff)
					BallinsideBuff = true;
			  }
			  else {
					if (BallinsideBuff) {
						 BallinsideBuff = false;
						 SpeedCount++;
						 if (LastpaddleHit === "wasd" || LastpaddleHit === "Arrows"){
							givingSpeedBuff();
							if (LastpaddleHit === "wasd"){
								fflag = 50;
							}
						}
					}
				}
	if (SpeedCount === 2) {
		 Powerup.visible = false;
	}
}
function drawingPadBigBuff() {
	if (BiggerPaddle.visible) {
		ctxx.globalAlpha = 0.5;
		ctxx.fillStyle = "cyan";
		ctxx.fillRect(BiggerPaddle.x, BiggerPaddle.y, BiggerPaddle.width, BiggerPaddle.height);
  }
  ctxx.globalAlpha = 1.0;
  if ((BiggerPaddle.visible) &&
		Balls.x + Balls.radius > BiggerPaddle.x && 
		Balls.x - Balls.radius < BiggerPaddle.x + BiggerPaddle.width && 
		Balls.y + Balls.radius > BiggerPaddle.y && 
		Balls.y - Balls.radius < BiggerPaddle.y + BiggerPaddle.height) {
			 if (!BallinBiggerPadBuff)
				  BallinBiggerPadBuff = true;
			 }
			 else {
				  if (BallinBiggerPadBuff) {
						BallinBiggerPadBuff = false;
						BiggerPadCount++;
						if (LastpaddleHit === "wasd" || LastpaddleHit === "Arrows"){
						  givingPadBigBuff();
						}
					}
			  }
  if (BiggerPadCount === 2) {
		BiggerPaddle.visible = false;
  }
}
function	drawingAttackBuff(){
	if (Attacking.visible) {
		ctxx.globalAlpha = 0.5;
		ctxx.fillStyle = "red";
		ctxx.fillRect(Attacking.x, Attacking.y, Attacking.width, Attacking.height);
  }
  ctxx.globalAlpha = 1.0;
  if ((Attacking.visible) &&
		Balls.x + Balls.radius > Attacking.x && 
		Balls.x - Balls.radius < Attacking.x + Attacking.width && 
		Balls.y + Balls.radius > Attacking.y && 
		Balls.y - Balls.radius < Attacking.y + Attacking.height) {
			 if (!BallinAttackingBuff)
				  BallinAttackingBuff = true;
			 }
			 else {
				  if (BallinAttackingBuff) {
						BallinAttackingBuff = false;
						AttackingCount++;
						if (LastpaddleHit === "wasd" || LastpaddleHit === "Arrows"){
						  givingAttackBuff();
						}
					}
			  }
  if (AttackingCount === 2) {
		Attacking.visible = false;
  }
}

function drawingTimer() {
	ctxx.font = '20px Arial';
	ctxx.fillStyle = 'white';
	ctxx.textAlign = 'center';
	ctxx.fillText(`${elapsedTime / 1000}`, Canvaas.width /2, 30);
}
function gameOScreen(){
	if (player1.score >= 7){
		GameOverscreen = true;
		showGameOScreen();
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`wasd: ${player1.score}`, Canvaas.width / 3, Canvaas.height / 2 + 10);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#ffffff';
		ctxx.fillText(`Arrows: ${player2.score}`, Canvaas.width / 1.5, Canvaas.height / 2 + 10);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`WINNER: player1`, Canvaas.width / 2, Canvaas.height / 2 - 100);
		player1.score = 0;
		gameover = true;
		iscurrentlyingame = false;
	}
	else if (player2.score >= 7){
		showGameOScreen();
		GameOverscreen = true;
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#ffffff';
		ctxx.fillText(`wasd: ${player1.score}`, Canvaas.width / 3, Canvaas.height / 2 + 10);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`Arrows: ${player2.score}`, Canvaas.width / 1.5, Canvaas.height / 2 + 10);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`WINNER: player2`, Canvaas.width / 2, Canvaas.height / 2 - 100);
		gameover = true;
		iscurrentlyingame = false;
	}
}
function removeGameOScreen() {
	ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
	GameOverscreen = false;
	gameover = false;
	iscurrentlyingame = false;
}
function showGameOScreen() {
	ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
	ctxx.fillStyle = '#000';
	ctxx.fillRect(0, 0, Canvaas.width, Canvaas.height);
	const	font_size = Canvaas.width * 0.15;
	ctxx.font = `${font_size}px "PixelFont", sans-serif`;
	ctxx.fillStyle = '#ffffff';
	ctxx.textAlign = 'center';
	ctxx.fillText('GAME OVER', Canvaas.width * 0.5, Canvaas.height * 0.3);
	ctxx.font = '24px "PixelFont", sans-serif';
	ctxx.fillStyle = '#ff0000';
	ctxx.fillText('Press R to replay, Q to go back to main menuu', Canvaas.width / 2, Canvaas.height / 2 + 500);
}

//gamelogic
const speedIncrease = 5000;
const initSpeed = 4;
const speedInc = 0.22;


function drawingPaddle(x, y, width, height) {
	ctxx.fillStyle = 'white';
	if (fflag){
		 ctxx.fillStyle = 'gold';
		 fflag--;
	}
	ctxx.fillRect(x, y, width, height);

}

function drawingBall(x, y, radius) {
	ctxx.beginPath();
	ctxx.arc(x, y, radius, 0, Math.PI * 2);
	ctxx.fillStyle = 'white';
	ctxx.fill();
	ctxx.closePath();
}

function resizingCanvas() {
    Canvaas.width = Canvaas.clientWidth;
    Canvaas.height = Canvaas.clientHeight;
    setGameDimension();
}

function setGameDimension() {
   ppaddleWidth = Canvaas.width * 0.01;
   ppaddleHeight = Canvaas.height * 0.1;
   ballsRadius = Canvaas.width * 0.01;

	wasdPaddle.width = ppaddleWidth;
	wasdPaddle.height = ppaddleHeight;
	wasdPaddle.x = 0;
   wasdPaddle.y = Canvaas.height / 2 - ppaddleHeight / 2;

   ARPaddle.width = ppaddleWidth;
   ARPaddle.height = ppaddleHeight;
   ARPaddle.x = Canvaas.width - ppaddleWidth;
   ARPaddle.y = Canvaas.height / 2 - ppaddleHeight / 2;

   Balls.radius = ballsRadius;
   Balls.x = Canvaas.width / 2;
   Balls.y = Canvaas.height / 2;
}

function countdownBeforeRound(callback) {
   let countdown = 3;
    
   const intervalID = setInterval(() => {
 
        ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
        drawingPaddle(wasdPaddle.x, wasdPaddle.y, wasdPaddle.width, wasdPaddle.height);
        drawingPaddle(ARPaddle.x, ARPaddle.y, ARPaddle.width, ARPaddle.height);
        drawingBall(Balls.x, Balls.y, Balls.radius);
        drawScore();
        ctxx.font = '48px sans-serif'; 
        ctxx.fillStyle = '#fff';
        ctxx.fillText(`Round starts in: ${countdown}`, Canvaas.width / 2 , Canvaas.height * 0.4);
        
        countdown--;

        if (countdown < 0) {
            clearInterval(intervalID);
            callback();
      	}
   }, 1000);
}

function restartingGame(difficulty) {
	ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
	if (wasdHit === true){
		ARPaddle.height *= 2;
		wasdHit = false;
	}
	if (ARHit === true){
		wasdPaddle.height *= 2;
		ARHit = false;
	}
	SpeedCount = 0;
	AttackingCount = 0;
	BiggerPadCount = 0;
	wasdPaddle.dy = 7;
	ARPaddle.dy = 7;
	Balls.dy = 4;
	Powerup.visible = false;
	Attacking.visible = false;
	WDblock.visible = false;
	ARblock.visible = false;
	BiggerPaddle.visible = false;
	ResetedTime = null;
	LastpaddleHit = null;
	gameover = false;
	if (Powerup.speed > 0) {
		Powerup.speed *= -1;
	}
	if (Attacking.speed > 0) {
		Attacking.speed *= -1;
	};
	if (BiggerPaddle.speed > 0) {
		BiggerPaddle.speed *= -1;
	};
}


let iscurrentlyingame = false;
resizingCanvas();
addEventListener('resize', resizingCanvas);

function movewasdPaddle() {
	if (wPressed && wasdPaddle.y > 50) {
		wasdPaddle.y -= wasdPaddle.dy;
	} else if (sPressed && wasdPaddle.y < Canvaas.height - wasdPaddle.height) {
		wasdPaddle.y += wasdPaddle.dy;
	}
}

function moveARPaddle() {
	if (ArrowupPressed && ARPaddle.y > 50) {
		ARPaddle.y -= ARPaddle.dy;
	} else if (ArrowdownPressed && ARPaddle.y < Canvaas.height - ARPaddle.height) {
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
	if (e.code === 'ArrowUp') ArrowupPressed = true;
	if (e.code === 'ArrowDown') ArrowdownPressed = true;
});

document.addEventListener('keyup', (e) => {
	if (e.code === 'ArrowUp') ArrowupPressed = false;
	if (e.code === 'ArrowDown') ArrowdownPressed = false;
});
function movingBall() {
	elapsedTime = Date.now() - ResetedTime;
	const speedFactor = 1 + Math.floor(elapsedTime / speedIncrease) * speedInc;
	Balls.dx = initSpeed * speedFactor * (Balls.dx > 0 ? 1 : -1);
	Balls.dy = initSpeed * speedFactor * (Balls.dy > 0 ? 1 : -1);

	Balls.x += Balls.dx;
	Balls.y += Balls.dy;

	if (Balls.y + Balls.radius < 70 ||Balls.y + Balls.radius > Canvaas.height || Balls.y - Balls.radius < 0) {
		 Balls.dy *= -1;
	}

	if (
		 Balls.x - Balls.radius <= wasdPaddle.x + wasdPaddle.width &&
		 Balls.y >= wasdPaddle.y &&
		 Balls.y <= wasdPaddle.y + wasdPaddle.height
	) {
		 var relativeIntersectY = (wasdPaddle.y + wasdPaddle.height / 2) - Balls.y;
		 var normrelIntersectY = relativeIntersectY / (wasdPaddle.height / 2);
		 var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));

		 Balls.dx = Balls.speed * Math.cos(bounceAngle);
		 Balls.dy = -Balls.speed * Math.sin(bounceAngle);
		 
		 Balls.x = wasdPaddle.x + wasdPaddle.width + ballsRadius + 1;
		 
		 Balls.dx = Balls.speed * (Balls.dx > 0 ? 1 : -1);
		 LastpaddleHit = "wasd";
	}

	if (
		 Balls.x + Balls.radius >= ARPaddle.x &&
		 Balls.y >= ARPaddle.y &&
		 Balls.y <= ARPaddle.y + ARPaddle.height
	) {
		 var relativeIntersectY = (ARPaddle.y + ARPaddle.height / 2) - Balls.y;
		 var normrelIntersectY = relativeIntersectY / (ARPaddle.height / 2);
		 var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));
		 Balls.dx = - Balls.speed * Math.cos(bounceAngle);
		 Balls.dy = - Balls.speed * Math.sin(bounceAngle);
		 Balls.x = ARPaddle.x - ballsRadius -1;
		 Balls.dx = Balls.speed * (Balls.dx > 0 ? 1 : -1);
		 LastpaddleHit = "Arrows";
	}

	if ((Balls.x - Balls.radius <= 0 || Balls.x + Balls.radius >= Canvaas.width))
		 anotherRound();
}


function stopGameLLoop() {
	for (let i = 0; i < animationFramesIDs.length; i++) {
		 cancelAnimationFrame(animationFramesIDs[i]);
	}
	animationFramesIDs = [];
	gameActive = false;
}


function restartingRound() {
    gameLLoop();
}
function anotherRound(){
	el = elapsedTime;
	const speedFactor = 1 + Math.floor(elapsedTime / speedIncrease) * speedInc;
	if (Balls.x - Balls.radius <= 0) {
		 player2.score++;
		 if (player2.score === 7){
			  gameover = true;
			  return;
		 }
		 stopGameLLoop();
		 
		 Balls.x = Canvaas.width / 2;
		 Balls.y = Canvaas.height / 2;
		 Balls.dx *= -1;
		 Balls.dx = initSpeed * speedFactor * (Balls.dx > 0 ? 1 : -1);
		 Balls.dy = initSpeed * speedFactor * (Balls.dy > 0 ? 1 : -1);
		 countdownBeforeRound(() => {
			gameActive = true;
			backtooriginalvalues();
			restartingRound();
			restartingGame();
		 });
		 return; 
	}
	if (Balls.x + Balls.radius >= Canvaas.width) {
		 player1.score++;
		 if (player1.score === 7){
			  gameover = true;
			  return;
		 }
		 stopGameLLoop();
		 Balls.x = Canvaas.width / 2;
		 Balls.y = Canvaas.height / 2;
		 Balls.dx *= -1;
		 Balls.dx = initSpeed * speedFactor * (Balls.dx > 0 ? 1 : -1);
		 Balls.dy = initSpeed * speedFactor * (Balls.dy > 0 ? 1 : -1);
		 countdownBeforeRound(() => {
			 gameActive = true;
			 backtooriginalvalues();
			 restartingRound();
			 restartingGame();
			});
		 return; 
	}
}
let gameover = false;

function    backtooriginalvalues(){
	wasdPaddle.width = Canvaas.width * 0.01;
	ARPaddle.width = Canvaas.width * 0.01;
	wasdPaddle.height = Canvaas.height * 0.1;
	ARPaddle.height = Canvaas.height * 0.1;
	wasdPaddle.y = Canvaas.height / 2 - wasdPaddle.height / 2;
	ARPaddle.y = Canvaas.height / 2 - wasdPaddle.height / 2;
}
function generateARandomNumber() {
	const randomNumber = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
	return randomNumber;
}

let reallyRandom = generateARandomNumber();

function gameLLoop(settings) {
	if (settings === null) {
		settings.mode = 'Default Mode';
		settings.map = 'Map 1';
	}
	if (!gameActive) {
		 return;
	}
	if (!ResetedTime)
		 ResetedTime = Date.now();
	iscurrentlyingame = true;
	ctxx.clearRect(0, 0, Canvaas.width, Canvaas.height);
	elapsedTime = Math.floor((Date.now() - ResetedTime) / 1000);
	if (sett.mode === "Buff Mode") {
		if (elapsedTime === reallyRandom) {
			Attacking.visible = true;
			Attacking.y = Canvaas.height - Attacking.height;
			randomAttackX();
		}
		if (Attacking.visible)
			 movingAttackbuff();
		if (AttackingCount === 2)
			 Attacking.visible = false;
		if (elapsedTime === reallyRandom + 10) {
			Powerup.visible = true;
			Powerup.y = Canvaas.height - Powerup.height;
			randomBuffX();
		}
		if (Powerup.visible) {
			movingbuff();
		}
		if (SpeedCount === 2)
			Powerup.visible = false;
		if (elapsedTime === reallyRandom + 20) {
			BiggerPaddle.visible = true;
			BiggerPaddle.y = Canvaas.height - BiggerPaddle.height;
			randomPadBigX();
	  }
	  if (BiggerPaddle.visible) {
			movingPadBigbuff();
	  }
	  if (BiggerPadCount === 2)
			BiggerPaddle.visible = false;
	}
	drawingPaddle(wasdPaddle.x, wasdPaddle.y, wasdPaddle.width, wasdPaddle.height);
	drawingPaddle(ARPaddle.x, ARPaddle.y, ARPaddle.width, ARPaddle.height);
	drawingBall(Balls.x, Balls.y, Balls.radius);
	movewasdPaddle();
	moveARPaddle();
	if (sett.mode === 'Buff Mode') {
		didIHit();
		didArrowsiHit();
		drawARBlock();
		drawwasdBlock();
		shootingBlock();
		shootingARBlock();
		drawingSpeedBuff();
		drawingAttackBuff();
		drawingPadBigBuff();
	}
	movingBall();
	drawScore();
	drawingTimer();
	gameOScreen();
	let frameID = requestAnimationFrame(() => gameLLoop());
	animationFramesIDs.push(frameID);
	if (gameover) {
		 backtooriginalvalues();
		 gameActive = false;
		 return;
	}
}

document.getElementById('pong-local').addEventListener('click', () => {
	menuu.style.display = 'none';
	gameActive = true;
	gameLLoop(sett);
})

document.getElementById('PONG-button').addEventListener('click', function () {
	const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
	const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
	sett = {
		 mode: gameMode,
		 map: selectedMap
	};
	window.stopGameLoop();
	window.resets();
});