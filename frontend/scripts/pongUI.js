window.player1 = {name: '', icon: '../frontend/assets/logo.jpg',  score: 0, aim: 0, Btaken: 0, ABR: 0, gothit: 0};
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
window.BallinBuff = false;
window.BallinAttackBuff = false;
window.BallinPadBigBuff = false;
window.aiTargetY = null;
window.GOscreen = false;

function	resets(){
	GOscreen = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (wasHit === true){
		aiPaddle.height *= 2;
		wasHit = false;
	}
	if (aiDidHit === true){
		playerPaddle.height *= 2;
		aiDidHit = false;
	}
	crossCount = 0;
	AttackCount = 0;
	BigPadCount = 0;
	playerPaddle.dy = 7;
	aiPaddle.dy = 7;
	ball.dy = 6;
	buff.visible = false;
	Attack.visible = false;
	PaddleBigger.visible = false;
	block.visible = false;
	aiblock.visible = false;
	LastpaddletoHit = null;
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
	ResetTime = Date.now();
	GOscreen = false;
	fullTime += elapsedTime;
	if (elapsedTime > LongestRound)
		 LongestRound = elapsedTime;
	if (elapsedTime < ShortestRound)
		 ShortestRound = elapsedTime;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	if (wasHit === true){
		 aiPaddle.height *= 2;
		 wasHit = false;
	}
	if (aiDidHit === true){
		 playerPaddle.height *= 2;
		 aiDidHit = false;
	}
	crossCount = 0;
	ball.x = canvas.width / 2;
	ball.y = canvas.height / 2;
	ball.dx *= -1;
	AttackCount = 0;
	BigPadCount = 0;
	playerPaddle.dy = 7;
	setbackoriginalvalues();
	aiPaddle.dy = 7;
	ball.dy = 6;
	playerPaddle.hasanattack = 0;
	aiPaddle.hasanattack = 0;
	buff.visible = false;
	Attack.visible = false;
	PaddleBigger.visible = false;
	block.visible = false;
	aiblock.visible = false;
	switchOnAI();
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
	gameLoop(diffy, setting);
	player1.score = 0;
	player2.score = 0;
}
window.redoGame = redoGame;
document.addEventListener('keydown', (event) => {
	if (GOscreen === true){
		if (event.code === 'KeyR'){
				player1.score = 0;
				player2.score = 0;
				redoGame();
			}
	}
});

function stopGameLoop() {
	gameActive = false;
	for (let i = 0; i < animationFrameIDs.length; i++) {
		 cancelAnimationFrame(animationFrameIDs[i]);
	}
	animationFrameIDs = [];
}
window.stopGameLoop = stopGameLoop;

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
			starter = false;
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

		if (block.x + block.width >= canvas.width) {
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
	if (buff.y + buff.height > canvas.height)
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
	if (Attack.y + Attack.height > canvas.height)
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
	if (PaddleBigger.y + PaddleBigger.height > canvas.height)
		PaddleBigger.visible = false;
	}
}
window.movePadBigbuff = movePadBigbuff;


function drawScoreBoard() {
	ctx.clearRect(0, 0, canvas.width, canvas.height * 0.0436);
	ctx.fillStyle =  'black';
	ctx.fillRect(0, 0, canvas.width, canvas.height * 0.0436);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = player1.icon;
	image2.src = player2.icon;
	ctx.drawImage(image1, 10, 5, 40, 40);
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	ctx.fillText(player1.name, 10*canvas.width/100, 30);
	ctx.fillText(player1.score, 18*canvas.width/100, 30);
	ctx.drawImage(image2, canvas.width - 50, 5, 40, 40);
	
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white'; 
	ctx.fillText(player2.name, 90*canvas.width/100, 30);
	ctx.fillText(player2.score, 82*canvas.width/100, 30);
}
window.drawScoreBoard = drawScoreBoard;

function giveSpeedBuff(){
	if (LastpaddletoHit === player1.name)
		playerPaddle.dy = 12;
	else if (LastpaddletoHit === player2.name)
		aiPaddle.dy = 12;
	if (playerPaddle.dy === 12 && LastpaddletoHit === player1.name)
		playerPaddle.dy = 12;
	if (playerPaddle.dy === 12 && LastpaddletoHit === player2.name)
		aiPaddle.dy = 12;
}
window.giveSpeedBuff = giveSpeedBuff;
function giveAttackBuff(){
	if (LastpaddletoHit === player1.name){
		playerPaddle.hasanattack = 1;
		player1.ABR += 1;
	}
	else if (LastpaddletoHit === player2.name){
		aiPaddle.aihasanattack = 1;
		player2.ABR += 1;
	}
	if (playerPaddle.hasanattack === 1 && LastpaddletoHit === player1.name)
		playerPaddle.hasanattack = 1;
	if (aiPaddle.aihasanattack === 1 && LastpaddletoHit === player2.name)
		aiPaddle.aihasanattack = 1;
}
window.giveAttackBuff = giveAttackBuff;
let doubled = false;
let aidoubled = false;
function givePadBigBuff(){
	let heightx2 = playerPaddle.height * 2;
	let aiheightx2 = aiPaddle.height * 2;
	if (LastpaddletoHit === player1.name && doubled != true){
		playerPaddle.height = heightx2;
		doubled = true;
	}
	else if (LastpaddletoHit === player2.name && aidoubled != true){
		aiPaddle.height = aiheightx2;
		aidoubled = true;
	}
}
window.givePadBigBuff = givePadBigBuff;

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
						 if (LastpaddletoHit === player1.name || LastpaddletoHit === player2.name){
							giveSpeedBuff();
							if (LastpaddletoHit === player1.name){
								player1.Btaken++;
								flag = 1;
							}
							else if (LastpaddletoHit === player2.name){
								player2.Btaken++;
								fflag = 1;
							}
						 }
						 }
					}
	if (crossCount === 2) {
		 buff.visible = false;
	}
}
window.drawSpeedBuff = drawSpeedBuff;

function drawAttackBuff() {
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
			  else{
					if (BallinAttackBuff) {
						 BallinAttackBuff = false;
						 AttackCount++;
						 if (LastpaddletoHit === player1.name || LastpaddletoHit === player2.name){
							  giveAttackBuff();
							 if (LastpaddletoHit === player1.name)
								player1.Btaken++;
							else
								player2.Btaken++;
					 		}
						}
					}
	if (AttackCount === 2)
		Attack.visible = false;
}
window.drawAttackBuff = drawAttackBuff;
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
						 if (LastpaddletoHit === player1.name || LastpaddletoHit === player2.name)
								givePadBigBuff();
						 if (LastpaddletoHit === player1.name)
							player1.Btaken++;
						else
							player2.Btaken++;
					}
				}
	if (BigPadCount === 2) {
		PaddleBigger.visible = false;
	}
}
window.drawPadBigBuff = drawPadBigBuff;

function drawTimer() {
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	let timeinsec = Math.floor(elapsedTime / 1000);
	ctx.fillText(`${timeinsec}`, canvas.width /2, 30);
}
window.aitoop;
function switchOffAI() {
   aitoop = true;
}
window.switchOffAI = switchOffAI;
function switchOnAI() {
	if (aitoop = true)
		aitoop = false;
}
window.switchOnAI = switchOnAI;

window.drawTimer = drawTimer;
function moveAIPaddleHard() {
	player2.name = 'Hard AI';
	if (LastpaddletoHit === player2.name)
		switchOffAI();
	else
		switchOnAI();
	if (aiPaddle.aihasanattack === 1){
		if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0732 && aiPaddle.y < canvas.height * 0.9289) {
			aiPaddle.y -= aiPaddle.dy;
	  } else if (ball.y > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y + aiPaddle.height < canvas.height * 0.9289) {
			aiPaddle.y += aiPaddle.dy;
			}
		AttackPrediction();
	}
	let predictedY = Prediction();
	
	if (aitoop === true)
		 return ;

	const tolerance = 3;

		 if (Math.abs(aiPaddle.y + aiPaddle.height / 2 - predictedY) > tolerance) {
			  if (predictedY < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0732 && aiPaddle.y < canvas.height *0.9289) {
					aiPaddle.y -= aiPaddle.dy;
			  } else if (predictedY > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y + aiPaddle.height < canvas.height * 0.9885) {
					aiPaddle.y += aiPaddle.dy;
			  }
	}
}
function moveAIPaddlemid() {
	player2.name = 'Medium AI';
	AttackPrediction();
	if (aitoop)
		 return;
	if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0732 && aiPaddle.y < canvas.height * 0.9289)
			  aiPaddle.y -= aiPaddle.dy;
		 else if (ball.y >= aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y + aiPaddle.height < canvas.height * 0.9889)
			  aiPaddle.y += aiPaddle.dy;
}

function moveAIPaddleEasy() {
	player2.name = 'Easy AI';
	AttackPrediction();
	if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > canvas.height * 0.0732 && aiPaddle.y < canvas.height * 0.9289) {
		 aiPaddle.y -= aiPaddle.dy;
	} else if (ball.y > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y + aiPaddle.height < canvas.height * 0.9889) {
		 aiPaddle.y += aiPaddle.dy;
	}
}
window.moveAIPaddleEasy = moveAIPaddleEasy;
window.moveAIPaddlemid = moveAIPaddlemid;
window.moveAIPaddleHard = moveAIPaddleHard;
let howmuchgained = null;
let howmuchlost = null;
function	expcounter(){
	if (player2.name === 'Hard AI'){
		howmuchgained = 250;
		howmuchlost = 100;
	}
	else if (player2.name === 'Medium AI'){
		howmuchgained = 100;
		howmuchlost = 50;
	}
	else if (player2.name === 'Easy AI'){
		howmuchgained = 50;
		howmuchlost = 25;
	}
}

function gameOverScreen(){
	expcounter();
	if (player1.score >= 7){
		GOscreen = true;
		showGameOverScreen();
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`${player1.name}: ${player1.score}`, canvas.width / 3, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`${player2.name} ${player2.score}`, canvas.width / 1.5, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`WINNER: ${player1.name}`, canvas.width / 2, canvas.height / 2 - 100);
		player1.score = 0;
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`You won: ${howmuchgained} exp`, canvas.width / 2, canvas.height / 2 + 100);
		player1.score = 0;
		gameover = true;
		isingame = false;
	}
	else if (player2.score >= 7){
		showGameOverScreen();
		GOscreen = true;
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`${player1.name}: ${player1.score}`, canvas.width / 3, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`${player2.name}: ${player2.score}`, canvas.width / 1.5, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`WINNER: ${player2.name}`, canvas.width / 2, canvas.height / 2 - 100);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = 'red';
		ctx.fillText(`You lost: ${howmuchlost} exp`, canvas.width / 2, canvas.height / 2 + 100);
		gameover = true;
		isingame = false;
	}
}
window.gameOverScreen = gameOverScreen;

function removeGameOverScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	GOscreen = false; // Hide game over screen
	gameover = false; // Reset game over flag
	isingame = false; // Set the game as active again
}
window.removeGameOverScreen = removeGameOverScreen;


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