window.player1 = {name: 'player1', icon: '../frontend/assets/logo.jpg',  score: 0, aim: 0, Btaken: 0, ABR: 0, gothit: 0};
window.player2 = {name: 'player2', icon: '../frontend/assets/logo.jpg', score: 0, aim: 0, Btaken: 0, ABR: 0, gothit: 0};
// const play_again = document.getElementById('playAgain');
const	change_difficulty = document.getElementById('diffy');
const	backtomain = document.getElementById('goodbye')

window.buff = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};
window.Attack = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};
window.PaddleBigger = {
	x: 0,
	y: 0,
	width: 70,
	height: 10,
	speed: -2,
	direction: -1,
	visible: false
};

window.block = {
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	speed: 40,
	visible: false
};

window.aiblock = {
	x: 0,
	y: 0,
	width: 10,
	height: 10,
	speed: 40,
	visible: false
};

window.wasHit = false;
window.aiDidHit = false;
window.crossCount = 0;
window.AttackCount = 0;
window.BigPadCount = 0;
window.sbVisible = false;
window.abVisible = true;
window.BallinBuff = false;
window.BallinAttackBuff = false;
window.BallinPadBigBuff = false;
window.aiTargetY = null;
window.GOscreen = false;

function	resets(){
	window.GOscreen = false;
	gameover = false; 
	window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
	if (wasHit === true){
		aiPaddle.height *= 2;
		wasHit = false;
	}
	if (aiDidHit === true){
		playerPaddle.height *= 2;
		aiDidHit = false;
	}
	window.crossCount = 0;
	window.AttackCount = 0;
	window.BigPadCount = 0;
	playerPaddle.dy = 7;
	aiPaddle.dy = 7;
	ball.dy = 6;
	buff.visible = false;
	Attack.visible = false;
	PaddleBigger.visible = false;
	block.visible = false;
	aiblock.visible = false;
	window.LastpaddletoHit = null;
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
window.resets = resets;

function	redoGame(){
	window.ResetTime = Date.now();
	window.GOscreen = false;
	gameover = false; 
	window.fullTime += window.elapsedTime;
	if (window.elapsedTime > window.LongestRound)
		 window.LongestRound = window.elapsedTime;
	if (window.elapsedTime < window.ShortestRound)
		 window.ShortestRound = window.elapsedTime;
	window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
	if (wasHit === true){
		 aiPaddle.height *= 2;
		 wasHit = false;
	}
	if (aiDidHit === true){
		 playerPaddle.height *= 2;
		 aiDidHit = false;
	}
	window.crossCount = 0;
	ball.x = window.canvas.width / 2;
	ball.y = window.canvas.height / 2;
	ball.dx *= -1;
	window.AttackCount = 0;
	window.BigPadCount = 0;
	playerPaddle.dy = 7;
	window.setbackoriginalvalues();
	aiPaddle.dy = 7;
	ball.dy = 6;
	playerPaddle.hasanattack = 0;
	aiPaddle.hasanattack = 0;
	buff.visible = false;
	Attack.visible = false;
	PaddleBigger.visible = false;
	block.visible = false;
	switchOnAI();
	window.LastpaddletoHit = null;
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
	window.gameLoop(diffy);
	player1.score = 0;
	player2.score = 0;
}
window.redoGame = redoGame;
document.addEventListener('keydown', (event) => {
	if (window.GOscreen === true){
		if (event.code === 'KeyR'){
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
window.stopGameLoop = stopGameLoop;

document.addEventListener('keydown', (event) => {
	if (window.GOscreen === true){
		if (event.code === 'KeyQ' && gameActive === false){
			window.ResetTime = null;
			ball.x = window.canvas.width / 2;
			ball.y = window.canvas.height / 2;
			ball.dx *= -1;
			window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
			stopGameLoop();
			removeGameOverScreen();
			resets();
			window.GOscreen = false;
			gameover = false;
			window.isingame = false;
			window.menu.style.display = 'flex';
			player1.score = 0;
			player2.score = 0;
			gameActive = false;
		}
	}
});

document.addEventListener('keydown', (event) => {
	if (event.code === 'Space'){
		if (block.visible === true) {
			return;
		}
		if (playerPaddle.hasanattack === 1){
			block.visible = true;
			block.x = playerPaddle.x + playerPaddle.width / 2 - block.width / 2;
			block.y = playerPaddle.height / 2 + playerPaddle.y - block.height / 2;
			playerPaddle.hasanattack = 0;
		}
		else {
			return ;
		}
	}
});

document.addEventListener('keydown', (event) => {
	if (event.code === 'Enter'){
		if (aiblock.visible === true)
			return;
		if (aiPaddle.aihasanattack === 1){
			aiblock.visible = true;
			aiblock.x = aiPaddle.x + aiPaddle.width / 2 - aiblock.width / 2;
			aiblock.y = aiPaddle.height / 2 + aiPaddle.y - aiblock.height / 2;
			aiPaddle.aihasanattack = 0;
		}
		else
			return ;
	}
});

function didItHit(){
	if (wasHit === true){
		player2.wasHit++;
		return;
	}
	if (block.visible === true &&
		(block.x >= aiPaddle.x - aiPaddle.width - 20) &&
		(block.y >= aiPaddle.y) &&
		(block.y <= aiPaddle.y + aiPaddle.height)) 
		{
			block.visible = false;
			aiPaddle.height /= 2;
			wasHit = true;
			player2.gothit++;
		}
}
window.didItHit = didItHit;

function	AttackPrediction(){
	if (aiPaddle.y === playerPaddle.y && aiPaddle.aihasanattack === 1){
		aiblock.visible = true;
		aiblock.x = aiPaddle.x + aiPaddle.width / 2 - aiblock.width / 2;
		aiblock.y = aiPaddle.height / 2 + aiPaddle.y - aiblock.height / 2;
		aiPaddle.aihasanattack = 0;
	}
}
window.AttackPrediction = AttackPrediction;
function didAiHit() {
	if (aiDidHit === true){
		player1.gothit++;
		return;
	}
	if (aiblock.visible === true &&
		(aiblock.x <= playerPaddle.x + playerPaddle.width + 20) &&
		(aiblock.y >= playerPaddle.y) && 
		(aiblock.y <= playerPaddle.y + playerPaddle.height)) {
		aiblock.visible = false;
		playerPaddle.height = playerPaddle.height / 2;
		player1.gothit++;
		aiDidHit = true;
	}
}
window.didAiHit = didAiHit;
function moveBlock() {
	if (block.visible) {
		block.x += block.speed;

		if (block.x + block.width >= window.canvas.width) {
			block.visible = false;
		}
	}
}
window.moveBlock = moveBlock;
function moveaiBlock() {
	if (aiblock.visible) {
		aiblock.x -= aiblock.speed; 

		if (aiblock.x + aiblock.width <= 0) {
			aiblock.visible = false;
		}
	}
}
window.moveaiBlock = moveaiBlock;
function drawBlock() {
	if (block.visible) {
		window.ctx.fillStyle = 'blue';
		window.ctx.fillRect(block.x, block.y, block.width, block.height);
	}
}
window.drawBlock = drawBlock;
function drawaiBlock() {
	if (aiblock.visible) {
		window.ctx.fillStyle = 'green';
		window.ctx.fillRect(aiblock.x, aiblock.y, aiblock.width, aiblock.height);
	}
}
window.drawaiBlock = drawaiBlock;

function randomizeBuffX() {
	const leftBoundary = window.canvas.width * 0.2;
	const rightBoundary = window.canvas.width * 0.8;
	buff.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
function randomizeAttackX() {
	const leftBoundary = window.canvas.width * 0.2;
	const rightBoundary = window.canvas.width * 0.8;
	Attack.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
function randomizePadBigX() {
	const leftBoundary = window.canvas.width * 0.2;
	const rightBoundary = window.canvas.width * 0.8;
	PaddleBigger.x = Math.random() * (rightBoundary - leftBoundary) + leftBoundary;
}
window.randomizeAttackX = randomizeAttackX;
window.randomizeBuffX = randomizeBuffX;
window.randomizePadBigX = randomizePadBigX;

function movebuff() {
	if (buff.visible) {
		buff.y += buff.speed;
		if (buff.y + buff.height <= 52) {
			buff.speed *= -1;
		}
	if (buff.y + buff.height > window.canvas.height)
		buff.visible = false;
	}
}
window.movebuff = movebuff;
function moveAttackbuff() {
	if (Attack.visible) {
		Attack.y += Attack.speed;
		if (Attack.y + Attack.height <= 52) {
			Attack.speed *= -1;
		}
	if (Attack.y + Attack.height > window.canvas.height)
		Attack.visible = false;
	}
}
window.moveAttackbuff = moveAttackbuff;
function movePadBigbuff() {
	if (PaddleBigger.visible) {
		PaddleBigger.y += PaddleBigger.speed;
		if (PaddleBigger.y + PaddleBigger.height <= 52) {
			PaddleBigger.speed *= -1;
		}
	if (PaddleBigger.y + PaddleBigger.height > window.canvas.height)
		PaddleBigger.visible = false;
	}
}
window.movePadBigbuff = movePadBigbuff;


function drawScoreBoard() {
	window.ctx.clearRect(0, 0, window.canvas.width, canvas.height * 0.0436);
	window.ctx.fillStyle =  'rgba(0, 0, 0, 0)';
	window.ctx.fillRect(0, 0, window.canvas.width, canvas.height * 0.0436);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = player1.icon;
	image2.src = player2.icon;
	window.ctx.drawImage(image1, 10, 5, 40, 40);
	window.ctx.font = '20px Arial';
	window.ctx.fillStyle = 'white';
	window.ctx.fillText('Player 1', 10*window.canvas.width/100, 30);
	window.ctx.fillText(player1.score, 18*window.canvas.width/100, 30);
	window.ctx.drawImage(image2, window.canvas.width - 50, 5, 40, 40);
	
	window.ctx.font = '20px Arial';
	window.ctx.fillStyle = 'white'; 
	window.ctx.fillText('Player 2', 90*window.canvas.width/100, 30);
	window.ctx.fillText(player2.score, 82*window.canvas.width/100, 30);
}
window.drawScoreBoard = drawScoreBoard;

function giveSpeedBuff(){
	if (window.LastpaddletoHit === "player 1")
		playerPaddle.dy = 12;
	else if (window.LastpaddletoHit === "Ai")
		aiPaddle.dy = 12;
	if (playerPaddle.dy === 20 && window.LastpaddletoHit === "player 1")
		playerPaddle.dy = 20;
	if (playerPaddle.dy === 20 && window.LastpaddletoHit === "Ai")
		aiPaddle.dy = 12;
}
window.giveSpeedBuff = giveSpeedBuff;
function giveAttackBuff(){
	if (window.LastpaddletoHit === "player 1"){
		playerPaddle.hasanattack = 1;
		player1.ABR += 1;
	}
	else if (window.LastpaddletoHit === "Ai"){
		aiPaddle.aihasanattack = 1;
		player2.ABR += 1;
	}
	if (playerPaddle.hasanattack === 1 && window.LastpaddletoHit === "player 1")
		playerPaddle.hasanattack = 1;
	if (aiPaddle.aihasanattack === 1 && window.LastpaddletoHit === "Ai")
		aiPaddle.aihasanattack = 1;
}
window.giveAttackBuff = giveAttackBuff;
let doubled = false;
let aidoubled = false;
function givePadBigBuff(){
	let heightx2 = playerPaddle.height * 2;
	let aiheightx2 = aiPaddle.height * 2;
	if (window.LastpaddletoHit === "player 1" && doubled != true){
		playerPaddle.height = heightx2;
		doubled = true;
	}
	else if (window.LastpaddletoHit === "Ai" && aidoubled != true){
		aiPaddle.height = aiheightx2;
		aidoubled = true;
	}
}
window.givePadBigBuff = givePadBigBuff;

function drawSpeedBuff() {
	if (buff.visible) {
		 window.ctx.globalAlpha = 0.5;
		 window.ctx.fillStyle = "gold";
		 window.ctx.fillRect(buff.x, buff.y, buff.width, buff.height);
	}
	window.ctx.globalAlpha = 1.0;
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
						 window.crossCount++;
						 if (window.LastpaddletoHit === "player 1" || window.LastpaddletoHit === "Ai"){
							giveSpeedBuff();
							if (window.LastpaddletoHit === "player 1"){
								player1.Btaken++;
								flag = 50;
							}
							else
								player2.Btaken++;
						 }
						 }
					}
	if (window.crossCount === 2) {
		 buff.visible = false;
	}
}
window.drawSpeedBuff = drawSpeedBuff;

function drawAttackBuff() {
	if (Attack.visible) {
		 window.ctx.globalAlpha = 0.5;
		 window.ctx.fillStyle = "red";
		 window.ctx.fillRect(Attack.x, Attack.y, Attack.width, Attack.height);
	}
	window.ctx.globalAlpha = 1.0;
	if ((Attack.visible) &&
		 ball.x + ball.radius > Attack.x && 
		 ball.x - ball.radius < Attack.x + Attack.width && 
		 ball.y + ball.radius > Attack.y && 
		 ball.y - ball.radius < Attack.y + Attack.height) {
			  if (!BallinAttackBuff)
					BallinAttackBuff = true;
			  }
			  else{
					if (BallinAttackBuff) {
						 BallinAttackBuff = false;
						 window.AttackCount++;
						 if (window.LastpaddletoHit === "player 1" || window.LastpaddletoHit === "Ai"){
							  giveAttackBuff();
							 if (window.LastpaddletoHit === "player 1")
								player1.Btaken++;
							else
								player2.Btaken++;
					 		}
						}
					}
	if (window.AttackCount === 2)
		Attack.visible = false;
}
window.drawAttackBuff = drawAttackBuff;
function drawPadBigBuff() {
	if (PaddleBigger.visible) {
		 window.ctx.globalAlpha = 0.5;
		 window.ctx.fillStyle = "cyan";
		 window.ctx.fillRect(PaddleBigger.x, PaddleBigger.y, PaddleBigger.width, PaddleBigger.height);
	}
	window.ctx.globalAlpha = 1.0;
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
						 window.BigPadCount++;
						 if (window.LastpaddletoHit === "player 1" || window.LastpaddletoHit === "Ai")
								givePadBigBuff();
						 if (window.LastpaddletoHit === "player 1")
							player1.Btaken++;
						else
							player2.Btaken++;
					}
				}
	if (window.BigPadCount === 2) {
		PaddleBigger.visible = false;
	}
}
window.drawPadBigBuff = drawPadBigBuff;

function drawTimer() {
	window.ctx.font = '20px Arial';
	window.ctx.fillStyle = 'white';
	window.ctx.textAlign = 'center';
	window.ctx.fillText(`${window.elapsedTime}`, window.canvas.width /2, 30);
}
let aitoop;
function switchOffAI() {
   aitoop = true;
}
function switchOnAI() {
    if (aitoop = true)
        aitoop = false;
}

window.drawTimer = drawTimer;
function moveAIPaddleHard() {
	if (window.LastpaddletoHit === "Ai")
		switchOffAI();
	else
		switchOnAI();
	if (aiPaddle.aihasanattack === 1){
		if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0436 && aiPaddle.y < canvas.height * 0.9289) {
			aiPaddle.y -= aiPaddle.dy;
	  } else if (ball.y > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040) {
			aiPaddle.y += aiPaddle.dy;
			}
		AttackPrediction();
	}
	let predictedY = window.Prediction();
	
	if (aitoop === true)
		 return ;

	const tolerance = 3;

		 if (Math.abs(aiPaddle.y + aiPaddle.height / 2 - predictedY) > tolerance) {
			  if (predictedY < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > 50 && aiPaddle.y < 1048) {
					aiPaddle.y -= aiPaddle.dy;
			  } else if (predictedY > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040) {
					aiPaddle.y += aiPaddle.dy;
			  }
	}
}
function moveAIPaddlemid() {
	AttackPrediction();
	if (aitoop)
		 return;
	if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0436 && aiPaddle.y < canvas.height * 0.9289)
			  aiPaddle.y -= aiPaddle.dy;
		 else if (ball.y >= aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040)
			  aiPaddle.y += aiPaddle.dy;
}

function moveAIPaddleEasy() {
	AttackPrediction();
	if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0436 && aiPaddle.y < canvas.height * 0.9289) {
		 aiPaddle.y -= aiPaddle.dy;
	} else if (ball.y > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040) {
		 aiPaddle.y += aiPaddle.dy;
	}
}
window.moveAIPaddleEasy = moveAIPaddleEasy;
window.moveAIPaddlemid = moveAIPaddlemid;
window.moveAIPaddleHard = moveAIPaddleHard;

function gameOverScreen(){
	if (player1.score >= 2){
		window.GOscreen = true;
		showGameOverScreen();
		window.ctx.font = '50px "PixelFont", sans-serif';
		window.ctx.fillStyle = '#FFD700';
		window.ctx.fillText(`Player 1: ${player1.score}`, window.canvas.width / 3, window.canvas.height / 2 + 10);
		window.ctx.font = '50px "PixelFont", sans-serif';
		window.ctx.fillStyle = '#ffffff';
		window.ctx.fillText(`Player 2: ${player2.score}`, window.canvas.width / 1.5, window.canvas.height / 2 + 10);
		window.ctx.font = '50px "PixelFont", sans-serif';
		window.ctx.fillStyle = '#FFD700';
		window.ctx.fillText(`WINNER: player1`, window.canvas.width / 2, window.canvas.height / 2 - 100);
		player1.score = 0;
		gameover = true;
		window.isingame = false;
	}
	else if (player2.score >= 2){
		showGameOverScreen();
		window.GOscreen = true;
		window.ctx.font = '50px "PixelFont", sans-serif';
		window.ctx.fillStyle = '#ffffff';
		window.ctx.fillText(`Player 1: ${player1.score}`, window.canvas.width / 3, window.canvas.height / 2 + 10);
		window.ctx.font = '50px "PixelFont", sans-serif';
		window.ctx.fillStyle = '#FFD700';
		window.ctx.fillText(`Player 2: ${player2.score}`, window.canvas.width / 1.5, window.canvas.height / 2 + 10);
		window.ctx.font = '50px "PixelFont", sans-serif';
		window.ctx.fillStyle = '#FFD700';
		window.ctx.fillText(`WINNER: player2`, window.canvas.width / 2, window.canvas.height / 2 - 100);
		gameover = true;
		window.isingame = false;
	}
}
window.gameOverScreen = gameOverScreen;

function removeGameOverScreen() {
	window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height); // Clear the window.canvas
	window.GOscreen = false; // Hide game over screen
	gameover = false; // Reset game over flag
	window.isingame = false; // Set the game as active again
}
window.removeGameOverScreen = removeGameOverScreen;


function showGameOverScreen() {
	window.ctx.clearRect(0, 0, window.canvas.width, window.canvas.height);
	window.ctx.fillStyle = '#000';
	window.ctx.fillRect(0, 0, window.canvas.width, window.canvas.height);
	const	font_size = window.canvas.width * 0.15;
	window.ctx.font = `${font_size}px "PixelFont", sans-serif`;
	window.ctx.fillStyle = '#ffffff';
	window.ctx.textAlign = 'center';
	window.ctx.fillText('GAME OVER', window.canvas.width * 0.5, window.canvas.height * 0.3);
	window.ctx.font = '24px "PixelFont", sans-serif';
	window.ctx.fillStyle = '#ff0000';
	window.ctx.fillText('Press R to replay, Q to go back to main menu', window.canvas.width / 2, window.canvas.height / 2 + 500);
}
window.showGameOverScreen = showGameOverScreen;
function	moveAIPaddle(difficulty){
	switch (difficulty) {
		case 'easy':
			moveAIPaddleEasy();
			break;
		case 'medium':
			moveAIPaddlemid();
			break;
		case 'hard':
			moveAIPaddleHard();
			break;
  }
}

window.moveAIPaddle = moveAIPaddle;