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

let LastpaddletoHit = null;

window.playerPaddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 5,
    hasanattack: null
};

window.aiPaddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 5,
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
const initialSpeed = 3;
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


function restartGame(difficulty) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (wasHit === true){
        aiPaddle.height *= 2;
        wasHit = false;
    }
    if (aiDidHit === true){
        playerPaddle.height *= 2;
        aiDidHit = false;
    }
    playerPaddle.x = 0;
    playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
    aiPaddle.x = canvas.width - aiPaddle.width;
    aiPaddle.y = canvas.height / 2 - aiPaddle.height / 2;
    crossCount = 0;
    AttackCount = 0;
    playerPaddle.dy = 7;
    aiPaddle.dy = 7;
    buff.visible = false;
    Attack.visible = false;
    block.visible = false;
    ResetTime = null;
    LastpaddletoHit = null;
    gameover = false;
    if (buff.speed > 0) {
        buff.speed *= -1;
    }
    if (Attack.speed > 0) {
        Attack.speed *= -1;
    }
    requestAnimationFrame(() => gameLoop(diffy));
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

let aiTargetY = null;

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

    if (ball.x - ball.radius < 0) {
        player2.score++;
        drawScoreBoard();
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
        ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
        ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
        switchOnAI();
        restartGame();
    }
    if (ball.x + ball.radius > canvas.width) {
        player1.score++;
        drawScoreBoard();
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
        ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
        ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
        switchOnAI();
        restartGame();
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

function getRandomNumber() {
    // Generate a random number between 10 and 15
    const randomNumber = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    return randomNumber;
}

// Example of storing the random number
let storedRandomNumber = getRandomNumber();

function gameLoop(difficulty) {
    window.diffy = difficulty;
    if (!ResetTime)
        ResetTime = Date.now();
    ai_menu.style.display = 'none';
    isingame = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsedTime = Math.floor((Date.now() - ResetTime) / 1000);
    if (elapsedTime === storedRandomNumber) {
        Attack.visible = true;
        Attack.y = canvas.height - Attack.height;
        randomizeAttackX();
    }
    if (Attack.visible) {
        moveAttackbuff();
    }
    if (AttackCount === 2)
        Attack.visible = false;
    if (elapsedTime === storedRandomNumber + 5) {
        buff.visible = true;
        buff.y = canvas.height - buff.height;
        randomizeBuffX();
    }
    if (buff.visible) {
        movebuff();
    }
    if (crossCount === 2)
        buff.visible = false;
    if (elapsedTime === storedRandomNumber + 10) {
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
    window.moveAIPaddle(difficulty);
    window.didItHit();
    window.didAiHit();
    window.drawScoreBoard();
    window.drawaiBlock();
    window.drawBlock();
    window.moveBlock();
    window.moveaiBlock();
    window.drawSpeedBuff();
    window.drawAttackBuff();
    window.drawPadBigBuff();
    moveBall();
    window.drawTimer();
    window.gameOverScreen();
    if (gameover)
        return;
    requestAnimationFrame(() => gameLoop(difficulty));
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

aibutton.addEventListener('click', function () {
    inv_menu.style.display = 'none';
    menu.style.display = 'none';
    ai_menu.style.display = 'flex';

    const selectDifficulty = (difficulty) => {
        gameLoop(difficulty)
    };

    ai_easy.addEventListener('click', () => selectDifficulty('easy'));
    ai_medium.addEventListener('click', () => selectDifficulty('medium'));
    ai_hard.addEventListener('click', () => selectDifficulty('hard'));
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

//  document.getElementById('start-pong-ai').addEventListener('click', applyBlurEffect);