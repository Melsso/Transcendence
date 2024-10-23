const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const gameModal = document.getElementById('gameModal');
const gameContainer = document.querySelector('.gameContainer');
const menu = document.getElementById('menuuu');
const aibutton = document.getElementById('start-pong-ai');
const inv_btn = document.getElementById('send-invite');
const Instructionsbtn = document.getElementById('Instructions');
const Instructions = document.getElementById('Instructions-box');
const q_up = document.getElementById('matchmaking');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const ai_easy = document.getElementById('PongEasy');
const ai_medium = document.getElementById('PongMedium');
const ai_hard = document.getElementById('PongHard');
const ins_return = document.getElementById('return-to-menu-ins');
window.gameActive = false;
window.flag = 0;
window.data = {
    playerStats1: {
        score: 0,
        buffs_taken: 0,
        attack_acc: 0,
    }, playerStats2: {
        score: 0,
        buffs_taken: 0,
        attack_acc: 0,
    }, gameStats: {
        average_round_time: 0,
        fastest_round: 0,
        longest_round: 0,
        map_played: 1,
        full_time: 0,
        winner: 0,
    }
};

let LastpaddletoHit = null;

window.playerPaddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 7,
    hasanattack: null
};

window.aiPaddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 7,
    aihasanattack: null
};

window.ball = {
    x: 0,
    y: 0,
    radius: 0,
    speed: 3,
    dx: 0,
    dy: 6
};

window.scoreboard = {
    x: 0,
    y: 0, // Assuming the scoreboard starts at the top of the canvas
    width: canvas.width,
    height: 50 // Height of the scoreboard, adjust as necessary
};

let ResetTime = null;


function Prediction() {
    let predictedY = ball.y;
    let predictedX = ball.x;
    let predictedDX = ball.dx;
    let predictedDY = ball.dy;

    while (predictedX + ball.radius < aiPaddle.x && predictedDX > 0) {
        predictedX += predictedDX;
        predictedY += predictedDY;
        if (predictedY - ball.radius < 0 || predictedY + ball.radius > canvas.height)
            predictedDY = -predictedDY;
    }
    if (predictedDX <= 0) {
        return ball.y; 
    }
    return predictedY;
}



function mediumDifficultyAI() {
    
}

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

    playerPaddle.width = paddleWidth;
    playerPaddle.height = paddleHeight;
    playerPaddle.x = 0;
    playerPaddle.y = canvas.height / 2 - paddleHeight / 2;

    aiPaddle.width = paddleWidth;
    aiPaddle.height = paddleHeight;
    aiPaddle.x = canvas.width - paddleWidth;
    aiPaddle.y = canvas.height / 2 - paddleHeight / 2;

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
            callback();
        }
    }, 1000);
}


let fullTime = null;
let LongestRound = null;
let ShortestRound = 2000;
function restartGame(difficulty) {
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
    setbackoriginalvalues();
    playerPaddle.x = 0;
    playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
    aiPaddle.x = canvas.width - aiPaddle.width;
    aiPaddle.y = canvas.height / 2 - aiPaddle.height / 2;
    crossCount = 0;
    AttackCount = 0;
    BigPadCount = 0;
    playerPaddle.dy = 7;
    aiPaddle.dy = 7;
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

function movePlayerPaddle() {
    if (upPressed && playerPaddle.y > 50) {
        playerPaddle.y -= playerPaddle.dy;
    } else if (downPressed && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += playerPaddle.dy;
    }
}
let aistop;
function switchOffAI() {
    aistop = true;
}
function switchOnAI() {
    if (aistop = true)
        aistop = false;
}


let EL = null;
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
        ball.x - ball.radius < playerPaddle.x + playerPaddle.width &&
        ball.y > playerPaddle.y &&
        ball.y < playerPaddle.y + playerPaddle.height
    ) {
        var relativeIntersectY = (playerPaddle.y + playerPaddle.height / 2) - ball.y;
        var normrelIntersectY = relativeIntersectY / (playerPaddle.height / 2);
        var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));

        ball.dx = ball.speed * Math.cos(bounceAngle);
        ball.dy = -ball.speed * Math.sin(bounceAngle);
        
        ball.x = playerPaddle.x + playerPaddle.width + ballRadius + 1;
        
        ball.dx = ball.speed * (ball.dx > 0 ? 1 : -1);
        LastpaddletoHit = "player 1";
        switchOnAI();
    }

    if (
        ball.x + ball.radius > aiPaddle.x &&
        ball.y > aiPaddle.y &&
        ball.y < aiPaddle.y + aiPaddle.height
    ) {
        var relativeIntersectY = (aiPaddle.y + aiPaddle.height / 2) - ball.y;
        var normrelIntersectY = relativeIntersectY / (aiPaddle.height / 2);
        var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));
        ball.dx = - ball.speed * Math.cos(bounceAngle);
        ball.dy = - ball.speed * Math.sin(bounceAngle);
        ball.x = aiPaddle.x - ballRadius -1;
        ball.dx = ball.speed * (ball.dx > 0 ? 1 : -1);
        LastpaddletoHit = "Ai";
        switchOffAI();
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
        console.log("Player 2 score: " + player2.score);
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
            switchOnAI();
            restartRound();
        });
        return; 
    }
    if (ball.x + ball.radius >= canvas.width) {
        player1.score++;
        console.log("Player 1 score: " + player1.score);
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

let upPressed = false;
let downPressed = false;

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') upPressed = true;
    if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') upPressed = false;
    if (e.key === 'ArrowDown') downPressed = false;
});



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

window.gameover = false;

function    setbackoriginalvalues(){
    playerPaddle.width = canvas.width * 0.01;
    aiPaddle.width = canvas.width * 0.01;
    playerPaddle.height = canvas.height * 0.1;
    aiPaddle.height = canvas.height * 0.1;
    playerPaddle.x = 0;
    aiPaddle.x = 0;
    playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
    aiPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
}
function getRandomNumber() {
    const randomNumber = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    return randomNumber;
}

let storedRandomNumber = getRandomNumber();

function calculateAccuracy(player1, player2){
    let averageHits = player2.gothit / player1.ABR
    if (player1.ABR === 0)
        return 0;
    return averageHits;
}


let player1AttackAcc = null; 
window.animationFrameIDs = [];

function gameLoop(difficulty) {
    if (!gameActive) {
        return;
    }
    window.diffy = difficulty;
    if (!ResetTime)
        ResetTime = Date.now();
    ai_menu.style.display = 'none';
    isingame = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsedTime = Math.floor((Date.now() - ResetTime) / 1000);
    if (elapsedTime === 1) {
        Attack.visible = true;
        Attack.y = canvas.height - Attack.height;
        randomizeAttackX();
    }
    if (Attack.visible) {
        moveAttackbuff();
    }
    if (AttackCount === 2)
        Attack.visible = false;
    if (elapsedTime === 2) {
        buff.visible = true;
        buff.y = canvas.height - buff.height;
        randomizeBuffX();
    }
    if (buff.visible) {
        movebuff();
    }
    if (crossCount === 2)
        buff.visible = false;
    if (elapsedTime === 8) {
        PaddleBigger.visible = true;
        PaddleBigger.y = canvas.height - PaddleBigger.height;
        randomizePadBigX();
    }
    if (PaddleBigger.visible) {
        movePadBigbuff();
    }
    if (BigPadCount === 2)
        PaddleBigger.visible = false;
    drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    drawPaddle(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
    drawBall(ball.x, ball.y, ball.radius);
    movePlayerPaddle();
    console.log(aiPaddle.width);
    window.moveAIPaddle(difficulty);
    window.didItHit();
    window.didAiHit();
    window.drawaiBlock();
    window.drawBlock();
    window.moveBlock();
    window.moveaiBlock();
    window.drawSpeedBuff();
    window.drawAttackBuff();
    window.drawPadBigBuff();
    moveBall();
    window.drawScoreBoard();
    window.drawTimer();
    player1AttackAcc = calculateAccuracy(player1.ABR, player2.gothit);
    window.gameOverScreen();
    console.log(fullTime);
    let frameID = requestAnimationFrame(() => gameLoop(difficulty));
    animationFrameIDs.push(frameID);
    if (gameover) {
        console.log(animationFrameIDs);
        setbackoriginalvalues();
        gameActive = false;
        return;
    }
}

ins_return.addEventListener('click', function () {
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    menu.style.display = 'flex';
    Instructions.style.display = 'none';
});

document.getElementById('return-to-menu').addEventListener('click', () => {
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    menu.style.display = 'flex';
    Instructions.style.display = 'none';
});

document.getElementById('return-to-menu-ai').addEventListener('click', () => {
    inv_menu.style.display = 'none';
    ai_menu.style.display = 'none';
    menu.style.display = 'flex';
    Instructions.style.display = 'none';
});

inv_btn.addEventListener('click', function () {
    menu.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'flex';
    Instructions.style.display = 'none';
});
Instructionsbtn.addEventListener('click', function () {
    menu.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    Instructions.style.display = 'flex';
});

aibutton.addEventListener('click', function (event) {
    event.preventDefault();
    inv_menu.style.display = 'none';
    menu.style.display = 'none';
    ai_menu.style.display = 'flex';
});

ai_easy.addEventListener('click', function (event) {
    event.preventDefault();
    gameActive = true;
    gameLoop('easy');
});

ai_medium.addEventListener('click', function(event) {
    event.preventDefault();
    gameActive = true;
    gameLoop('medium');
});

ai_hard.addEventListener('click', function(event) {
    event.preventDefault();
    gameActive = true;
    gameLoop('hard');
});

//  function applyBlurEffect() {
//      const gameContainer = document.querySelector('.gameContainer');

//      const mainTwo = document.getElementById('mainTwo');
//      const allElements = mainTwo.children;

//      for (let i = 0; i < allElements.length; i++) {
//          if (!allElements[i].contains(gameContainer) || !allElements.contains(pongCanvas)) {
//              allElements[i].classList.add('blur-effect');
//          }
//      }
//  }

//  function removeBlurEffect() {
//      const mainTwo = document.getElementById('mainTwo');
//      const allElements = mainTwo.children;

//      for (let i = 0; i < allElements.length; i++) {
//          allElements[i].classList.remove('blur-effect');
//          allElements[i].classList.remove('no-blur');
//          allElements[i].style.zIndex = '';  // Reset z-index
//      }
//  }

function    calculateAverageRoundTime(){
    let endScore = player1.score + player2.score;
    let art = fullTime / endScore;
    return art;
}


// let player1AttackAcc = calculateAccuracy(player1.ABR, player2.gothit); // Replace with actual accuracy calculation
function endGameStats() {
    const player1Score = getPlayer1Score(); 
    const player2Score = getPlayer2Score(); 
    const player1BuffsTaken = getPlayer1Buffs();
    const player2BuffsTaken = getPlayer2Buffs();
    // window.player1AttackAcc = calculateAccuracy(player1.ABR, player2.gothit); // Replace with actual accuracy calculation
    window.player2AttackAcc = calculateAccuracy(player2.ABR, player1.gothit); // Replace with actual accuracy calculation

    // Fill in player stats
    window.data.playerStats1.score = player1.score; //done
    window.data.playerStats1.buffs_taken = player1.Btaken; //done
    window.data.playerStats1.attack_acc = player1AttackAcc;

    window.data.playerStats2.score = player2.score; // done
    window.data.playerStats2.buffs_taken = player2.Btaken; // done
    window.data.playerStats2.attack_acc = player2AttackAcc;

    // Fill in game stats
    window.data.gameStats.average_round_time = calculateAverageRoundTime(); // done
    window.data.gameStats.fastest_round = ShortestRound; // done
    window.data.gameStats.longest_round = LongestRound; // done
    window.data.gameStats.map_played = 1; // Replace with actual map played
    window.data.gameStats.full_time = fullTime; // done
    window.data.gameStats.winner = player1.Score > player2.Score ? 1 : 2; // should work, to be tested //

    console.log("Game stats updated:", window.data);
}
