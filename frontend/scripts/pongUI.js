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

function	redoGame(){
	ResetTime = Date.now();
	GOscreen = false;
	gameover = false; 
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
	AttackCount = 0;
	BigPadCount = 0;
	playerPaddle.dy = 7;
	aiPaddle.dy = 7;
	ball.dy = 6;
	buff.visible = false;
	Attack.visible = false;
	block.visible = false;
	LastpaddletoHit = null;
	gameover = false;
	if (buff.speed > 0) {
		 buff.speed *= -1;
	}
	if (Attack.speed > 0) {
		 Attack.speed *= -1;
	}
	gameActive = true;
	gameLoop(diffy);
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

document.addEventListener('keydown', (event) => {
	if (GOscreen === true){
		if (event.code === 'KeyQ' && gameActive === false){
			stopGameLoop();
			removeGameOverScreen();
			window.diffy = null;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			GOscreen = false;
			gameover = false;
			isingame = false;
			menu.style.display = 'flex';
			player1.score = 0;
			player2.score = 0;
			fullTime = 0;
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

function	AttackPrediction(){
	if (aiPaddle.y === playerPaddle.y && aiPaddle.aihasanattack === 1){
		aiblock.visible = true;
		aiblock.x = aiPaddle.x + aiPaddle.width / 2 - aiblock.width / 2;
		aiblock.y = aiPaddle.height / 2 + aiPaddle.y - aiblock.height / 2;
		aiPaddle.aihasanattack = 0;
	}
}

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
	ctx.fillStyle = 'blue';
	ctx.fillRect(0, 0, canvas.width, 50);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = player1.icon;
	image2.src = player2.icon;

	

	ctx.drawImage(image1, 10, 5, 40, 40);
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	// ctx.fillText('Player 1', 100, 30);
	// ctx.fillText(player1.score, 220, 30);
	ctx.fillText('Player 1', 10*canvas.width/100, 30);
	ctx.fillText(player1.score, 18*canvas.width/100, 30);

	// ctx.drawImage(image2, canvas.width - 50, 5, 40, 40);
	ctx.drawImage(image2, canvas.width - 50, 5, 40, 40);
	
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	// ctx.fillText('Player 2', canvas.width - 100, 30);
	// ctx.fillText(player2.score, canvas.width - 220, 30); 
	ctx.fillText('Player 2', 90*canvas.width/100, 30);
	ctx.fillText(player2.score, 82*canvas.width/100, 30);

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
function giveAttackBuff(){
	if (LastpaddletoHit === "player 1"){
		playerPaddle.hasanattack = 1;
		player1.ABR += 1;
	}
	else if (LastpaddletoHit === "Ai"){
		aiPaddle.aihasanattack = 1;
		player2.ABR += 1;
	}
	if (playerPaddle.hasanattack === 1 && LastpaddletoHit === "player 1")
		playerPaddle.hasanattack = 1;
	if (aiPaddle.aihasanattack === 1 && LastpaddletoHit === "Ai")
		aiPaddle.aihasanattack = 1;
}
let doubled = false;
let aidoubled = false;
function givePadBigBuff(){
	let heightx2 = playerPaddle.height * 2;
	let aiheightx2 = aiPaddle.height * 2;
	if (LastpaddletoHit === "player 1" && doubled != true){
		playerPaddle.height = heightx2;
		doubled = true;
	}
	else if (LastpaddletoHit === "Ai" && aidoubled != true){
		aiPaddle.height = aiheightx2;
		aidoubled = true;
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
						 if (LastpaddletoHit === "player 1" || LastpaddletoHit === "Ai"){
							giveSpeedBuff();
							if (LastpaddletoHit === "player 1"){
								player1.Btaken++;
								flag = 50;
							}
							else
								player2.Btaken++;
						 }
						 }
					}
	if (crossCount === 2) {
		 buff.visible = false;
	}
}
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
						 if (LastpaddletoHit === "player 1" || LastpaddletoHit === "Ai"){
							  giveAttackBuff();
							 if (LastpaddletoHit === "player 1")
								player1.Btaken++;
							else
								player2.Btaken++;
					 		}
						}
					}
	if (AttackCount === 2)
		Attack.visible = false;
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
			  if (!BallinPadBigBuff){}
					BallinPadBigBuff = true;
			  }
			  else {
					if (BallinPadBigBuff) {
						 BallinPadBigBuff = false;
						 BigPadCount++;
						 if (LastpaddletoHit === "player 1" || LastpaddletoHit === "Ai")
								givePadBigBuff();
						 if (LastpaddletoHit === "player 1")
							player1.Btaken++;
						else
							player2.Btaken++;
					}
				}
	if (BigPadCount === 2) {
		PaddleBigger.visible = false;
	}
}

function drawTimer() {
	ctx.font = '20px Arial';
	ctx.fillStyle = 'white';
	ctx.textAlign = 'center';
	ctx.fillText(`${elapsedTime}`, canvas.width /2, 30);
}
function moveAIPaddleHard() {
	if (aiPaddle.aihasanattack === 1){
		if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > 50 && aiPaddle.y < 1048) {
			aiPaddle.y -= aiPaddle.dy;
	  } else if (ball.y > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040) {
			aiPaddle.y += aiPaddle.dy;
			}
		AttackPrediction();
	}
	let predictedY = Prediction();
	if (aistop)
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
	if (aistop)
		 return;
		 if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > 50 && aiPaddle.y < 1048)
			  aiPaddle.y -= aiPaddle.dy;
		 else if (ball.y >= aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040)
			  aiPaddle.y += aiPaddle.dy;
}

function moveAIPaddleEasy() {
	AttackPrediction();
	if (ball.y < aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y > 50 && aiPaddle.y < 1048) {
		 aiPaddle.y -= aiPaddle.dy;
	} else if (ball.y > aiPaddle.y + aiPaddle.height / 2 && aiPaddle.y < 1040) {
		 aiPaddle.y += aiPaddle.dy;
	}
}
function gameOverScreen(){
	if (player1.score >= 2){
		GOscreen = true;
		showGameOverScreen();
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`Player 1: ${player1.score}`, canvas.width / 3, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#ffffff';
		ctx.fillText(`Player 2: ${player2.score}`, canvas.width / 1.5, canvas.height / 2 + 10);
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
		ctx.fillText(`Player 1: ${player1.score}`, canvas.width / 3, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`Player 2: ${player2.score}`, canvas.width / 1.5, canvas.height / 2 + 10);
		ctx.font = '50px "PixelFont", sans-serif';
		ctx.fillStyle = '#FFD700';
		ctx.fillText(`WINNER: player2`, canvas.width / 2, canvas.height / 2 - 100);
		gameover = true;
		isingame = false;
	}
}
function removeGameOverScreen() {
	ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
	GOscreen = false; // Hide game over screen
	gameover = false; // Reset game over flag
	console.log("we made it here");
	isingame = false; // Set the game as active again
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

