window.canvas = document.getElementById('pongCanvas');
window.ctx = canvas.getContext('2d');
const gameModal = document.getElementById('gameModal');
const gameContainer = document.querySelector('.gameContainer');
window.menu = document.getElementById('menuuu');
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
const baseUrl = process.env.ACTIVE_HOST;
window.setting;
let paddleWidth;
let paddleHeight;
let ballRadius;
let NOgame = false;
window.starter = false;
window.gameover = false;
document.getElementById('PONG-button').addEventListener('click', function () {
    const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
    const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
    window.setting = {
        mode: gameMode,
        map: selectedMap
    };
});

window.elapsedTime = null;
window.gameActive = false;
window.flag = 0;
window.fflag = 0;
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

window.LastpaddletoHit = null;


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

window.ResetTime = null;

function drawMaps(){
    if (setting.map === 'Map 1'){
        const cont = document.getElementById('gameContainer');
        ctx.fillStyle = 'black';
        window.ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    else if (setting.map === 'Map 2'){
        drawMap();
    }
    else if (setting.map === 'Map 3'){
        drawRetroTrianglePattern();
        drawBBall(ball.x, ball.y, ball.radius);
        drawBaiPaddle(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
        drawBPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
    }
}

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
window.Prediction = Prediction;

window.gameStartTime;
window.speedIncreaseInterval = 5000;
window.initialSpeed = 4;
window.speedIncrement = 0.22;

async function kickPlayer() {
    if (gameActive === true) {
        gameActive = false;
        var winner = {};
        if (player1.name === window.userData.username) {
            winner['name'] = player2.name;
            winner['score'] = 0;
        } else {
            winner['name'] = player1.name;
            winner['score'] = 0;    
        }
        await endGameStats(winner, {'name':window.userData.username, 'score': 0}, true, window.userData.r_name);
        Notification('Game Action', 'You have left an active game, therefore the game will be counted as a forfeit from your side!', 2, 'alert');
        navigateTo('profile', null);
        return ;
    }
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    setGameDimensions();
}
window.resizeCanvas = resizeCanvas;

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
window.setGameDimension = setGameDimensions;

function countdownBeforeRound(callback) {
    if (NOgame)
        return;
    let countdown = 3;
    
    const intervalID = setInterval(() => {
        if (NOgame){
            clearInterval(intervalID);
            countdown = 3;
            return;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawMaps();
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
window.countdownBeforeRound = countdownBeforeRound;

async function altFfour(){
    if (gameActive) {
       await kickPlayer();
    }
    stopGameLoop();
    GOscreen = false;
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	gameover = false; 
    removeGameOverScreen();
	if (wasHit === true){
        aiPaddle.height *= 2;
		wasHit = false;
	}
	if (aiDidHit === true){
        playerPaddle.height *= 2;
		aiDidHit = false;
	}
    setbackoriginalvalues();
    ball.y = canvas.height / 2;
    ball.x = canvas.width / 2;
    elapsedTime = 0;
    EL = 0;
	crossCount = 0;
    ResetTime = 0;
    flag = 0;
    fflag = 0;
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
    gameActive = false;
    NOgame = true;
    starter = false;
}
window.altFfour = altFfour;

window.fullTime = null;
window.LongestRound = null;
window.ShortestRound = 2000;
function restartGame(difficulty) {
    fullTime += elapsedTime;
    if (elapsedTime > LongestRound)
        LongestRound = elapsedTime;
    if (elapsedTime < ShortestRound)
        ShortestRound = elapsedTime;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
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
    flag = 0;
    fflag = 0;
    aiPaddle.dy = 7;
    ball.dy = 6;
    playerPaddle.hasanattack = 0;
    aiPaddle.aihasanattack = 0;
    buff.visible = false;
    Attack.visible = false;
    block.visible = false;
    aiblock.visible = false;
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
window.restartGame = restartGame;

window.isingame = false;
window.resizeCanvas();
window.addEventListener('resize', kickPlayer);

function movePlayerPaddle() {
    if (upPressed && playerPaddle.y > 50) {
        playerPaddle.y -= playerPaddle.dy;
    } else if (downPressed && playerPaddle.y < canvas.height - playerPaddle.height) {
        playerPaddle.y += playerPaddle.dy;
    }
}


window.aitoop = false;

window.EL = null;
function moveBall() {
    elapsedTime = Date.now() - ResetTime;
    const speedF = 1 + Math.floor(elapsedTime / speedIncreaseInterval) * speedIncrement;
    ball.dx = initialSpeed * speedF * (ball.dx > 0 ? 1 : -1);
    ball.dy = initialSpeed * speedF * (ball.dy > 0 ? 1 : -1);

    ball.x += ball.dx;
    ball.y += ball.dy;

    if (ball.y + ball.radius < canvas.height * 0.0732 ||ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
        ball.dy *= -1;
    }

    if (
        ball.x - ball.radius <= playerPaddle.x + playerPaddle.width &&
        ball.y >= playerPaddle.y &&
        ball.y <= playerPaddle.y + playerPaddle.height
    ) {
        var relativeIntersectY = (playerPaddle.y + playerPaddle.height / 2) - ball.y;
        var normrelIntersectY = relativeIntersectY / (playerPaddle.height / 2);
        var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));

        ball.dx = ball.speed * Math.cos(bounceAngle);
        ball.dy = -ball.speed * Math.sin(bounceAngle);
        
        ball.x = playerPaddle.x + playerPaddle.width + ballRadius + 1;
        
        ball.dx = ball.speed * (ball.dx > 0 ? 1 : -1);
        LastpaddletoHit = player1.name;
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
        LastpaddletoHit = player2.name;
        switchOffAI();
    }

    if ((ball.x - ball.radius < ball.radius / 2 || ball.x + ball.radius >= canvas.width + ball.radius / 6) && fullTime >= 0)
        newRound();
}
window.moveBall = moveBall;

function resizingGame() {
    navigateTo('profile', null);
    Notification('Game Action', 'You have Lost the game due to resizing your browser!', 2, 'alert');
}

addEventListener('resize', function () {
	if (gameActive)
		resizingGame();
	else
		return;
});

function restartRound() {
    gameActive = true;
    gameLoop(diffy, setting);
}
window.restartRound = restartRound;

function newRound(){
    EL = elapsedTime;
    const speedFactor = 1 + Math.floor(elapsedTime / speedIncreaseInterval) * speedIncrement;
    if (ball.x - ball.radius <= 0) {
        player2.score++;
        if (player2.score === 1){
            gameover = true;
            return;
        }
        stopGameLoop();
        playerPaddle.hasanattack = 0;
        aiPaddle.hasanattack = 0;
        block.visible = false;
        aiblock.visible = false;
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        flag = 0;
        fflag = 0;
        ball.dx *= -1;
        ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
        ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
        if (NOgame)
            return;
        countdownBeforeRound(() => {
            switchOnAI();
            restartRound();
            restartGame();
            setbackoriginalvalues();
        });
        return; 
    }
    if (ball.x + ball.radius >= canvas.width) {
        player1.score++;
        if (player1.score === 1){
            gameover = true;
            return;
        }
        stopGameLoop();
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx *= -1;
        ball.dx = initialSpeed * speedFactor * (ball.dx > 0 ? 1 : -1);
        ball.dy = initialSpeed * speedFactor * (ball.dy > 0 ? 1 : -1);
        if (NOgame)
            return;
        countdownBeforeRound(() => {
            switchOnAI();
            restartRound();
            restartGame();
            setbackoriginalvalues();
        });
        return; 
    }
}
window.newRound = newRound;

window.upPressed = false;
window.downPressed = false;

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
    }
    ctx.fillRect(x, y, width, height);
}
function drawaiPaddle(x, y, width, height) {
    ctx.fillStyle = 'white';
    if (fflag){
        ctx.fillStyle = 'gold';
    }
    ctx.fillRect(x, y, width, height);
}
window.drawaiPaddle = drawaiPaddle;
window.drawPaddle = drawPaddle;
function drawBPaddle(x, y, width, height) {
    ctx.fillStyle = 'black';
    if (flag){
        ctx.fillStyle = 'gold';
    }
    ctx.fillRect(x, y, width, height);
}
function drawBaiPaddle(x, y, width, height) {
    ctx.fillStyle = 'black';
    if (fflag){
        ctx.fillStyle = 'gold';
    }
    ctx.fillRect(x, y, width, height);
}
window.drawBPaddle = drawBPaddle;
window.drawBaiPaddle = drawBPaddle;

function drawBall(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.closePath();
}
window.drawBall = drawBall;
function drawBBall(x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.closePath();
}
window.drawBBall = drawBBall;

function    setbackoriginalvalues(){
    playerPaddle.width = canvas.width * 0.01;
    aiPaddle.width = canvas.width * 0.01;
    playerPaddle.height = canvas.height * 0.1;
    aiPaddle.height = canvas.height * 0.1;
    playerPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
    aiPaddle.y = canvas.height / 2 - playerPaddle.height / 2;
}
window.setbackoriginalvalues = setbackoriginalvalues;
function getRandomNumber() {
    const randomNumber = Math.floor(Math.random() * (15 - 10 + 1)) + 10;
    return randomNumber;
}
window.setbackoriginalvalues = setbackoriginalvalues;

window.storedRandomNumber = getRandomNumber();

function calculateAccuracy(){
    let averageHits = player2.gothit / player1.ABR
    if (player1.ABR === 0)
        return 0;
    return averageHits;
}



let player1AttackAcc = null; 
window.animationFrameIDs = [];

const treeColors = [
    '#0f2e0f',
    '#1b3d1b',
    '#2e4d2f',
    '#4c6f4c',
    '#7a9b7a'
];

window.trees = [
    { x: canvas.width * 0.9, height: canvas.height * 0.8, width: canvas.width * 0.04, colorIndex: 0 },
    { x: canvas.width * 0.75, height: canvas.height * 0.76, width: canvas.width * 0.02, colorIndex: 1 },
    { x: canvas.width * 0.64, height: canvas.height, width: canvas.width * 0.03, colorIndex: 2},
    { x: canvas.width * 0.52, height: canvas.height * 0.84, width: canvas.width * 0.04, colorIndex: 1},
    { x: canvas.width * 0.4, height: canvas.height, width: canvas.width * 0.05, colorIndex: 2},
    { x: canvas.width * 0.25, height: canvas.height * 0.78, width: canvas.width * 0.034, colorIndex: 2},
    { x: canvas.width * 0.1, height: canvas.height * 0.8, width: canvas.width * 0.04, colorIndex: 0},
];

window.groundHeightArray = [
    canvas.height * 0.9, canvas.height * 0.9, 
    canvas.height * 0.9, canvas.height * 0.9, canvas.height * 0.99, canvas.height * 0.9, canvas.height * 0.9,
    canvas.height * 0.94, canvas.height * 0.9, canvas.height * 0.99,
    canvas.height * 0.9, canvas.height * 0.9, canvas.height * 0.94, canvas.height * 0.97,
    canvas.height * 0.9, canvas.height * 0.9, canvas.height * 0.9,
    canvas.height * 0.9, canvas.height * 0.91, canvas.height * 0.92,
    canvas.height * 0.99, canvas.height * 0.94, canvas.height * 0.9, canvas.height * 0.9, canvas.height * 0.9,
    canvas.height * 0.94, canvas.height * 0.9, canvas.height * 0.9,
    canvas.height * 0.9, canvas.height * 0.9,
];

function drawMap() {
    const cont = document.getElementById('gameContainer');

    window.ctx.clearRect(0, 0, canvas.width, canvas.height);


    // window.ctx.lineTo(canvas.width, canvas.height);
    // window.ctx.lineTo(0, canvas.height);
    // window.ctx.closePath();
    // window.ctx.fill();


    window.ctx.fillStyle = '#1b2e1b';
    window.ctx.beginPath();
    window.ctx.moveTo(0, groundHeightArray[0]);

    for (let i = 1; i < canvas.width; i++) {
        window.ctx.lineTo(i, groundHeightArray[i] || groundHeightArray[groundHeightArray.length - 1]);
    }

    window.ctx.lineTo(canvas.width, canvas.height);
    window.ctx.lineTo(0, canvas.height);
    window.ctx.closePath();
    window.ctx.fill();

    // Background gradient for the upper part of the canvas
    let gradient = window.ctx.createLinearGradient(0, groundHeightArray[0], 0, 0);
    gradient.addColorStop(0, '#2e4d2f');  // Mid green just above the ground
    gradient.addColorStop(1, '#7a9b7a');  // 

    window.ctx.fillStyle = gradient;
    window.ctx.fillRect(0, 0, canvas.width, groundHeightArray[0]);
    trees.forEach(tree => {
        window.ctx.fillStyle = treeColors[tree.colorIndex];

        const baseHeight = groundHeightArray[Math.floor(tree.x)] || groundHeightArray[0];
        window.ctx.beginPath();
        window.ctx.moveTo(tree.x - tree.width / 2, baseHeight);
        window.ctx.lineTo(tree.x + tree.width / 2, baseHeight);
        window.ctx.lineTo(tree.x + tree.width / 4, tree.height * 6);
        window.ctx.lineTo(tree.x + tree.width / 2, baseHeight);
        window.ctx.lineTo(tree.x - tree.width / 4, baseHeight - tree.height);
        window.ctx.lineTo(tree.x + tree.width / 4, tree.height * 6);
        window.ctx.lineTo(tree.x - tree.width / 4, baseHeight - tree.height);
        window.ctx.closePath();
        window.ctx.fill();

        window.ctx.lineWidth = 2;
        window.ctx.strokeStyle = treeColors[tree.colorIndex];
        window.ctx.beginPath();
        window.ctx.moveTo(tree.x, baseHeight - tree.height);
        window.ctx.lineTo(tree.x - tree.x * 0.01, baseHeight - tree.height * 0.3);
        window.ctx.lineTo(tree.x + tree.x * 0.02, baseHeight - tree.height * 0.4);
        window.ctx.lineTo(tree.x - tree.x * 0.01, baseHeight - tree.height * 0.1);
        window.ctx.lineTo(tree.x - tree.x * 0.01, baseHeight - tree.height * 0.2);
        window.ctx.lineTo(tree.x - tree.x * 0.01, baseHeight - tree.height * 0.2);
        window.ctx.lineTo(tree.x - tree.x * 0.03, baseHeight - tree.height * 0.1);
        window.ctx.lineTo(tree.x + tree.x * 0.01, baseHeight - tree.height * 0.8);
        window.ctx.stroke();
    });

    window.ctx.fillStyle = 'rgba(120, 200, 120, 0.1)';
    window.ctx.fillRect(0, 0, canvas.width, canvas.height);
}
window.drawMap = drawMap;
function drawRetroTrianglePattern() {
    const colors = ['#D3984F', '#D08E48', '#C5652F', '#BC5A2B']; // Old American Diner colorsD08E48  C5652F BC5A2B
    const numTriangles = 36; // Number of triangles/wedges
    const centerX =canvas.width / 2;
    const centerY =canvas.height / 2;
    const radius = Math.hypot(window.canvas.width,canvas.height); // Ensures triangles extend beyond canvas
    const angleIncrement = (2 * Math.PI) / numTriangles;

    for (let i = 0; i < numTriangles; i++) {
        const angle = i * angleIncrement;
        
        // Set color for each triangle
       ctx.fillStyle = colors[i % colors.length];
        
        // Start drawing the triangle
       ctx.beginPath();
       ctx.moveTo(centerX, centerY); // Center point

        // Calculate points at the edge of the canvas
        const x1 = centerX + radius * Math.cos(angle);
        const y1 = centerY + radius * Math.sin(angle);
        const x2 = centerX + radius * Math.cos(angle + angleIncrement);
        const y2 = centerY + radius * Math.sin(angle + angleIncrement);

        // Draw the triangle wedge
       ctx.lineTo(x1, y1);
       ctx.lineTo(x2, y2);
       ctx.closePath();
       ctx.fill();
    }
}
window.drawRetroTrianglePattern = drawRetroTrianglePattern;

function gameLoop(difficulty, setting) {
	if (starter === false) {
        window.player1.name = window.userData.username;
		canvas.width = canvas.clientWidth;
		canvas.height = canvas.clientHeight;
		setGameDimensions();
		starter = true;
	}
    if (setting === null){
        setting.mode = 'Default mode';
        setting.map = 'Map 1';
    }
    if (!gameActive) {
        return;
    }
    window.diffy = difficulty;
    if (NOgame)
        return;
    if (!ResetTime)
        ResetTime = Date.now();
    isingame = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaps();
    ai_menu.style.display = 'none';
    elapsedTime = Math.floor((Date.now() - ResetTime) / 1000);
    if (setting.mode === 'Buff Mode'){ 
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
        if (elapsedTime === storedRandomNumber + 10) {
            buff.visible = true;
            buff.y = canvas.height - buff.height;
            randomizeBuffX();
        }
        if (buff.visible) {
            movebuff();
        }
        if (crossCount === 2)
            buff.visible = false;
        if (elapsedTime === storedRandomNumber + 20) {
            PaddleBigger.visible = true;
            PaddleBigger.y = canvas.height - PaddleBigger.height;
            randomizePadBigX();
        }
        if (PaddleBigger.visible) {
            movePadBigbuff();
        }
        if (BigPadCount === 2)
            PaddleBigger.visible = false;
    }
    switchOnAI();
    if (setting.map === 'Map 1' || setting.map === 'Map 2'){
        drawPaddle(playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height);
        drawaiPaddle(aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height);
        drawBall(ball.x, ball.y, ball.radius);
    }
    movePlayerPaddle();
    moveAIPaddle(difficulty);
    if (setting.mode === 'Buff Mode'){
        didItHit();
        didAiHit();
        drawaiBlock();
        drawBlock();
        moveBlock();
        moveaiBlock();
        drawSpeedBuff();
        drawAttackBuff();
        drawPadBigBuff();
    }
    moveBall();
    drawScoreBoard();
    drawTimer();
    gameOverScreen();
    let frameID = requestAnimationFrame(() => gameLoop(difficulty, setting));
    animationFrameIDs.push(frameID);
    if (gameover) {
        setbackoriginalvalues();
        gameActive = false;
        return;
    }
}
window.gameLoop = gameLoop;

ins_return.addEventListener('click', function () {
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    menu.style.display = 'flex';
    ins_return.style.display = 'none';
    Instructions.style.display = 'none';
});

document.getElementById('return-to-menu').addEventListener('click', () => {
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    menu.style.display = 'flex';
    Instructions.style.display = 'none';
    ins_return.style.display = 'none';
});

document.getElementById('return-to-menu-ai').addEventListener('click', () => {
    inv_menu.style.display = 'none';
    ai_menu.style.display = 'none';
    menu.style.display = 'flex';
    ins_return.style.display = 'none';
    Instructions.style.display = 'none';
});

inv_btn.addEventListener('click', function () {
    menu.style.display = 'none';
    ins_return.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'flex';
    Instructions.style.display = 'none';
});
Instructionsbtn.addEventListener('click', function () {
    menu.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    ins_return.style.display = 'inline-block';
    Instructions.style.display = 'flex';
});

aibutton.addEventListener('click', function (event) {
    event.preventDefault();
    inv_menu.style.display = 'none';
    menu.style.display = 'none';
    ins_return.style.display = 'none';
    ai_menu.style.display = 'flex';
    Instructions.style.display = 'none';
});

ai_easy.addEventListener('click', function (event) {
    event.preventDefault();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    NOgame = false;
    drawMaps();
    gameActive = true;
    gameLoop('easy', setting);
});

ai_medium.addEventListener('click', function(event) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    event.preventDefault();
    NOgame = false;
    drawMaps();
    gameActive = true;
    gameLoop('medium', setting);
});

ai_hard.addEventListener('click', function(event) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMaps();
    NOgame = false;
    event.preventDefault();
    gameActive = true;
    gameLoop('hard', setting);
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
export async function endGameStats(winner, loser, forfeit=null, room_name=null) {
    let exp;
    let game_data = {};
    console.log("room namess", room_name);
    if (window.userData.username === winner.name) {
        game_data.score1 = winner.score;
        game_data.map = setting.map;
        game_data.attack_accuracy = 100;
        game_data.shield_powerup = 50;
        game_data.speed_powerup = 10;
        game_data.score2 = loser.score;
        if (loser.name.includes('Medium')) {
            exp = 100;
        } else if (loser.name.includes('Easy')) {
            exp = 50;
        } else if (loser.name.includes('Hard')) {
            exp = 250;
        } else {
            exp = 250;
        }
    } else {
        game_data.score1 = loser.score;
        game_data.score2 = winner.score;
        game_data.map = setting.map;
        game_data.attack_accuracy = 100;
        game_data.shield_powerup = 50;
        game_data.speed_powerup = 10;
        if (winner.name.includes('Medium')) {
            exp = 50;
        } else if (winner.name.includes('Easy')) {
            exp = 25;
        } else if (winner.name.includes('Hard')) {
            exp = 100;
        } else {
            exp = 250;
        }
    }
    console.log("Before try block");
    try {
        const result = await sendGameResult(exp, winner.name, loser.name, game_data, forfeit, room_name);
        console.log("res: ", result);
    } catch (error) {
        Notification('Game Action', `Error: ${error}`, 2, 'alert');
    }
    // const player1Score = getPlayer1Score(); 
    // const player2Score = getPlayer2Score(); 
    // const player1BuffsTaken = getPlayer1Buffs();
    // const player2BuffsTaken = getPlayer2Buffs();
    // // window.player1AttackAcc = calculateAccuracy(player1.ABR, player2.gothit); // Replace with actual accuracy calculation
    // window.player2AttackAcc = calculateAccuracy(player2.ABR, player1.gothit); // Replace with actual accuracy calculation

    // // Fill in player stats
    // data.playerStats1.score = player1.score; //done
    // data.playerStats1.buffs_taken = player1.Btaken; //done
    // data.playerStats1.attack_acc = player1AttackAcc;

    // data.playerStats2.score = player2.score; // done
    // data.playerStats2.buffs_taken = player2.Btaken; // done
    // data.playerStats2.attack_acc = player2AttackAcc;

    // // Fill in game stats
    // data.gameStats.average_round_time = calculateAverageRoundTime(); // done
    // data.gameStats.fastest_round = ShortestRound; // done
    // data.gameStats.longest_round = LongestRound; // done
    // data.gameStats.map_played = 1; // Replace with actual map played
    // data.gameStats.full_time = fullTime; // done
    // data.gameStats.winner = player1.score > player2.score ? 1 : 2; // should work, to be tested //

}

export async function sendGameResult(exp, winner, loser, game_data, forfeit=null, room_name=null) {
    const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = baseUrl + 'api/games/game_result/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
        body: JSON.stringify({
            exp: exp,
            winner: winner,
            loser: loser,
            stats: game_data,
            forfeit: forfeit,
            game_id: room_name,
        }),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		navigateTo('profile', null);
		throw errorResponse;
	}
	const data = await response.json();
	return data;
}
