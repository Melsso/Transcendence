const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const aibutton = document.getElementById('start-pong-ai');
const gameModal = document.getElementById('gameModal');
const gameContainer = document.querySelector('.gameContainer');
const menu = document.getElementById('menuuu');

const playerPaddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 7
};

const aiPaddle = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    dy: 7
};

const ball = {
    x: 0,
    y: 0,
    radius: 0,
    speed: 5,
    dx: 0,
    dy: 6
    
};

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

let gameStartTime = Date.now();
const speedIncreaseInterval = 5000;
const initialSpeed = 5;
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

let ResetTime = Date.now();

function restartGame() {
    playerPaddle.x = 0;
    playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
    aiPaddle.x = canvas.width - aiPaddle.width;
    aiPaddle.y = canvas.height / 2 - aiPaddle.height / 2;
}

function drawTimer() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText(`${elapsedTime}`, canvas.width /2, 30);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function movePlayerPaddle() {
    if (upPressed && playerPaddle.y > 0) {
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

function moveAIPaddlehard() {
    if (aistop)
        return ;
    let predictedY = Prediction();
    if (predictedY < aiPaddle.y + aiPaddle.height / 2)
        aiPaddle.y -= aiPaddle.dy;
     else if (predictedY >= aiPaddle.y + aiPaddle.height / 2) {
        aiPaddle.y += aiPaddle.dy;
    }
}
function moveAIPaddlemid() {
    let predictedY = Prediction();
    if (predictedY < aiPaddle.y + aiPaddle.height / 2)
        aiPaddle.y -= aiPaddle.dy;
     else if (predictedY >= aiPaddle.y + aiPaddle.height / 2) {
        aiPaddle.y += aiPaddle.dy;
    }
}
function moveAIPaddleEasy() {
    if (predictedY < aiPaddle.y + aiPaddle.height / 2)
        aiPaddle.y -= aiPaddle.dy;
     else if (predictedY >= aiPaddle.y + aiPaddle.height / 2) {
        aiPaddle.y += aiPaddle.dy;
    }
}

function moveBall() {
    const elapsedTime = Date.now() - gameStartTime;

    const speedFactor = 1 + Math.floor(elapsedTime / speedIncreaseInterval) * speedIncrement;
    ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
    ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
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
        switchOffAI();
    }

    if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
        ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
        ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
        gameStartTime = Date.now();
        ResetTime = Date.now();
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

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsedTime = Math.floor((Date.now() - ResetTime) / 1000);
    drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    drawPaddle(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
    drawBall(ball.x, ball.y, ball.radius);
    movePlayerPaddle();
    moveAIPaddlehard();
    moveBall();

    drawTimer();


    requestAnimationFrame(gameLoop);
}



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

aibutton.addEventListener('click', function () {
    aibutton.style.display = 'none';
    menuuu.style.display = 'none';
    gameLoop();
});


function applyBlurEffect() {
    const gameContainer = document.querySelector('.gameContainer');

    const mainTwo = document.getElementById('mainTwo');
    const allElements = mainTwo.children;

    for (let i = 0; i < allElements.length; i++) {
        if (!allElements[i].contains(gameContainer) || !allElements.contains(pongCanvas)) {
            allElements[i].classList.add('blur-effect');
        }
    }
}

function removeBlurEffect() {
    const mainTwo = document.getElementById('mainTwo');
    const allElements = mainTwo.children;

    for (let i = 0; i < allElements.length; i++) {
        allElements[i].classList.remove('blur-effect');
        allElements[i].classList.remove('no-blur');
        allElements[i].style.zIndex = '';  // Reset z-index
    }
}

document.getElementById('start-pong-ai').addEventListener('click', applyBlurEffect);