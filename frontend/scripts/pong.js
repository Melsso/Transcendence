const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');
const gameModal = document.getElementById('gameModal');
const gameContainer = document.querySelector('.gameContainer');
const menu = document.getElementById('menuuu');
const aibutton = document.getElementById('start-pong-ai');
const inv_btn = document.getElementById('send-invite');
const q_up = document.getElementById('matchmaking');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const ai_easy = document.getElementById('PongEasy');
const ai_medium = document.getElementById('PongMedium');
const ai_hard = document.getElementById('PongHard');

let LastpaddletoHit = null;

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

let buff = {
    x: 0,           // Starting x position of the buff
    y: 0,           // Starting y position of the buff
    width: 50,      // Width of the buff
    height: 10,     // Height of the buff
    speed: -2,       // Speed at which the buff moves vertically
    direction: -1,   // Direction of movement: 1 for down, -1 for up
    visible: false
};

let block = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    speed: 20,
    visible: false
};

let aiblock = {
    x: 0,
    y: 0,
    width: 10,
    height: 10,
    speed: 20,
    visible: false
};



var washit = false;
var aididhit = false;
function  diditHit(){
    if (washit === true)
        return;
    if (block.visible === true &&
        (block.x >= aiPaddle.x - aiPaddle.width) &&
        (block.y >= aiPaddle.y) && 
        (block.y <= aiPaddle.y + aiPaddle.height)){
        block.visible = false;
        aiPaddle.height = aiPaddle.height / 2;
        washit = true;
    }
}
function didAiitHit() {
    if (aididhit === true)
        return;
    if (aiblock.visible === true &&
        (aiblock.x <= playerPaddle.x + playerPaddle.width) &&
        (aiblock.y >= playerPaddle.y) && 
        (aiblock.y <= playerPaddle.y + playerPaddle.height)) {
        aiblock.visible = false;
        playerPaddle.height = playerPaddle.height / 2;
        aididhit = true;
        console.log("AI block hit the player paddle!");
    }
}

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


const player1 = {name: 'player1', icon: '../frontend/assets/logo.jpg',  score: 0};
const player2 = {name: 'player2', icon: '../frontend/assets/logo.jpg', score: 0};


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

let crossCount = 0;
let sbVisible = false;
let BallinBuff = false;



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
const initialSpeed = 5;
const speedIncrement = 0.22;


function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    console.log(canvas.height);
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


function restartGame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (washit === true){
        aiPaddle.height *= 2; 
        washit = false;
    }
    if (aididhit === true){
        playerPaddle.height *= 2;
        aididhit = false;
    }
    playerPaddle.x = 0;
    playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
    aiPaddle.x = canvas.width - aiPaddle.width;
    aiPaddle.y = canvas.height / 2 - aiPaddle.height / 2;
    crossCount = 0;
    playerPaddle.dy = 7;
    aiPaddle.dy = 7
    buff.visible = false;
    block.visible = false;
    ResetTime = null;
    LastpaddletoHit = null;
    if (buff.speed > 0) {
        buff.speed *= -1;
    }
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

let aiTargetY = null;

function moveAIPaddleHard() {

    let predictedY = Prediction();
    if (aistop)
        return ;

    const tolerance = 3;

        if (Math.abs(aiPaddle.y + aiPaddle.height / 2 - predictedY) > tolerance) {
            if (predictedY < aiPaddle.y + aiPaddle.height / 2) {
                aiPaddle.y -= aiPaddle.dy;
            } else if (predictedY > aiPaddle.y + aiPaddle.height / 2) {
                aiPaddle.y += aiPaddle.dy;
            }
    }
}
function moveAIPaddlemid() {
    if (aistop)
        return;
        if (ball.y < aiPaddle.y + aiPaddle.height / 2)
            aiPaddle.y -= aiPaddle.dy;
        else if (ball.y >= aiPaddle.y + aiPaddle.height / 2)
            aiPaddle.y += aiPaddle.dy;
}

function moveAIPaddleEasy() {
    if (ball.y < aiPaddle.y + aiPaddle.height / 2) {
        aiPaddle.y -= aiPaddle.dy;
    } else if (ball.y > aiPaddle.y + aiPaddle.height / 2) {
        aiPaddle.y += aiPaddle.dy;
    }
}
function moveBall() {
    const elapsedTime = Date.now() - ResetTime;
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

inv_btn.addEventListener('click', function () {
    menu.style.display = 'none';
    inv_menu.style.display = 'flex';
});

aibutton.addEventListener('click', function () {
    menu.style.display = 'none';
    ai_menu.style.display = 'flex';

    const selectDifficulty = (difficulty) => {
        gameLoop(difficulty)
    };

    ai_easy.addEventListener('click', () => selectDifficulty('easy'));
    ai_medium.addEventListener('click', () => selectDifficulty('medium'));
    ai_hard.addEventListener('click', () => selectDifficulty('hard'));
});

function gameLoop(difficulty) {
    if (!ResetTime)
        ResetTime = Date.now();
    ai_menu.style.display = 'none';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    elapsedTime = Math.floor((Date.now() - ResetTime) / 1000);
    if (elapsedTime === 1) {
        buff.visible = true;
        buff.y = canvas.height - buff.height;
        randomizeBuffX();
    }
    if (buff.visible) {
        movebuff();
    }
    if (crossCount === 2)
        buff.visible = false;
    drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    drawPaddle(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
    drawBall(ball.x, ball.y, ball.radius);
    movePlayerPaddle();
    
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
    diditHit();
    didAiitHit();
    drawScoreBoard();
    drawaiBlock();
    drawBlock();
    moveBlock();
    moveaiBlock();
    drawSpeedBuff();
    moveBall();
    drawTimer();

    requestAnimationFrame(() => gameLoop(difficulty));
}

document.getElementById('return-to-menu').addEventListener('click', () => {
    inv_menu.style.display = 'flex';
    menu.style.display = 'flex';
});

document.getElementById('return-to-menu-ai').addEventListener('click', () => {
    ai_menu.style.display = 'flex';
    menu.style.display = 'flex';
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