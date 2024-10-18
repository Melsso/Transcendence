const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getcontext('2d');
const gameModal = document.getElementById('gameModal');
const gameContainer = document.querySelector('.gameContainer');
const menu = document.getElementById('menuuu');
const aibutton = document.getElementById('start-pong-ai');
const inv_btn = document.getElementById('send-invite');
const	q_up = document.getElementById('matchmaking');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const	ai_easy = document.getElementById('PongEasy');
const	ai_medium = document.getElementById('PongMedium');
const	ai_hard = document.getElementById('PongHard');
const player1 = {name: 'player1', icon: '../frontend/assets/logo.jpg',  score: 0};
const player2 = {name: 'player2', icon: '../frontend/assets/logo.jpg', score: 0};

let	Buff = {
	x: 0,
	y: 0,
	width: 60,
	height: 15,
	speed: -2,
	direction: -1, // this should be removed.
	visible: false
};

let	block = {
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	speed: 20,
	visible: false
};

let	aiblock = {
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	speed: 20,
	visible: false
};

var	wasHit = false;
var	aiDidHit = false;
let crossCount = 0;
let sbVisible = false;
let BallinBuff = false;

document.addEventListener('keydown', (event) => {
	if (event.code === 'Space'){
		 if (block.visible === true)
			  return;
		 block.visible = true;
		 block.x = playerPaddle.x + playerPaddle.width / 2 - block.width / 2;
		 block.y = playerPaddle.height / 2 + playerPaddle.y - block.height / 2;
		 console.log("shooting...");
	}
});
document.addEventListener('keydown', (event) => {
	if (event.code === 'Enter'){
		 if (aiblock.visible === true)
			  return;
		 aiblock.visible = true;
		 aiblock.x = aiPaddle.x + aiPaddle.width / 2 - aiblock.width / 2;
		 aiblock.y = aiPaddle.height / 2 + aiPaddle.y - aiblock.height / 2;
		 console.log("shooting....");
	}
});

function didItHit(){
	if (wasHit === true)
		return;
	if (block.visible === true &&
		(block.x >= aiPaddle.x - aiPaddle.width) &&
		(block.y >= aiPaddle.y) &&
		(block.y <= aiPaddle.y +aiPaddle.height)){
			block.visible = rtue;
			aiPaddle.height /= 2;
			wasHit = true;
		}
}
function didAiitHit() {
	if (aiDidHit === true)
		 return;
	if (aiblock.visible === true &&
		 (aiblock.x <= playerPaddle.x + playerPaddle.width) &&
		 (aiblock.y >= playerPaddle.y) && 
		 (aiblock.y <= playerPaddle.y + playerPaddle.height)) {
		 aiblock.visible = false;
		 playerPaddle.height = playerPaddle.height / 2;
		 aiDidHit = true;
		 console.log("AI block hit the player paddle!");
	}
}

function moveBlock() {
	if (block.visible) {
		 block.x += block.speed;

		 if (block.x + block.width >= canvas.width) {
			  block.visible = false;
		 }
	}
}
function moveaiBlock() {
	if (aiblock.visible) {
		 aiblock.x -= aiblock.speed; 

		 if (aiblock.x + aiblock.width <= 0) {
			  aiblock.visible = false;
		 }
	}
}

function drawBlock() {
	if (block.visible) {
		 ctx.fillStyle = 'blue';
		 ctx.fillRect(block.x, block.y, block.width, block.height);
	}
}
function drawaiBlock() {
	if (aiblock.visible) {
		 ctx.fillStyle = 'green';
		 ctx.fillRect(aiblock.x, aiblock.y, aiblock.width, aiblock.height);
	}
}

function randomizeBuffX() {
	const leftBoundary = canvas.width * 0.2;
	const rightBoundary = canvas.width * 0.8;
	buff.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}

function movebuff() {
	if (buff.visible) {
		 buff.y += buff.speed;
		 if (buff.y + buff.height <= 52) {
			  console.log('happened');
			  buff.speed *= -1;
		 }
	if (buff.y + buff.height > canvas.height)
		 buff.visible = false;
	}
}

function ScoreBoardTracker(){
	drawScoreBoard();
}

function drawScoreBoard() {
	ctx.clearRect(0, 0, canvas.width, 50);
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, 0, canvas.width, 50);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = player1.icon;
	image2.src = player2.icon;
	

		ctx.drawImage(image1, 10, 5, 40, 40);
		 ctx.font = '20px Arial';
		 ctx.fillStyle = 'white';
		 ctx.fillText('Player 1', 100, 30);
		 ctx.fillText(player1.score, 220, 30);

		 ctx.drawImage(image2, canvas.width - 50, 5, 40, 40);
		 ctx.font = '20px Arial';
		 ctx.fillStyle = 'white';
		 ctx.fillText('Player 2', canvas.width - 100, 30);
		 ctx.fillText(player2.score, canvas.width - 220, 30); 
}
function giveSpeedBuff(){
	if (LastpaddletoHit === "player 1")
		 playerPaddle.dy = 12;
	else if (LastpaddletoHit === "Ai")
		 aiPaddle.dy = 12;
	if (playerPaddle.dy === 20 && LastpaddletoHit === "player 1")
		 playerPaddle.dy = 20;
	if (playerPaddle.dy === 20 && LastpaddletoHit === "Ai")
		 aiPaddle.dy = 12;
}

function giveSpeedBuff(){
	if (LastpaddletoHit === "player 1")
		 playerPaddle.dy = 12;
	else if (LastpaddletoHit === "Ai")
		 aiPaddle.dy = 12;
	if (playerPaddle.dy === 20 && LastpaddletoHit === "player 1")
		 playerPaddle.dy = 20;
	if (playerPaddle.dy === 20 && LastpaddletoHit === "Ai")
		 aiPaddle.dy = 12;
}

function drawSpeedBuff() {
	if (buff.visible) {
		 ctx.globalAlpha = 0.5;
		 ctx.fillStyle = "red";
		 ctx.fillRect(buff.x, buff.y, buff.width, buff.height);
	}
	ctx.globalAlpha = 1.0;
	if ((buff.visible) &&
		 ball.x + ball.radius > buff.x && 
		 ball.x - ball.radius < buff.x + buff.width && 
		 ball.y + ball.radius > buff.y && 
		 ball.y - ball.radius < buff.y + buff.height) {
			  if (!BallinBuff){}
					BallinBuff = true;
			  }
			  else {
					if (BallinBuff) {
						 BallinBuff = false; // Reset the flag
						 crossCount++; // Increment the cross count since the ball left the buff
						 if (LastpaddletoHit === "player 1" || LastpaddletoHit === "Ai")
							  giveSpeedBuff();
						 }
					}
	if (crossCount === 2) {
		 buff.visible = false;
	}
}