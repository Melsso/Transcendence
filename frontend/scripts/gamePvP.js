const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState } from "./gameSystem.js";

const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;

let paddleWidth;
let paddleHeight;
let upPressed;
let downPressed;
let speedincre;
let sphereRadius;
let elTime = 0;
let RestTime = null;
let zbel;
let fullcanvas;
let playerPaddle1 = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	dy: 7,
	username: null,
	hasanattack: null
};

let playerPaddle2 = {
	x: 0,
	y: 0,
	width: 0,
	height: 0,
	dy: 7,
	username: null,
	aihasanattack: null
};

let sphere = {
	x: 0,
	y: 0,
	radius: 0,
	speed: 3,
	khra: 0,
	inc: 0,
	dx: 0,
	dy: 6
};


function drawPlayerPaddle1(x, y, width, height) {
	ctxx.fillStyle = 'white';
	ctxx.fillRect(x, y, width, height);
}

function drawPlayerPaddle2(x, y, width, height) {
	ctxx.fillStyle = 'white';
	ctxx.fillRect(x, y, width, height);
}

function drawSphere(x, y, radius) {
	ctxx.beginPath();
	ctxx.arc(x, y, radius, 0, Math.PI * 2);
	ctxx.fillStyle = 'white';
	ctxx.fill();
	ctxx.closePath();
}


function setDimensions(player) {
	const widthScale = player.screen_dimensions.width / REFERENCE_WIDTH;
	const heightScale = player.screen_dimensions.height / REFERENCE_HEIGHT;


	paddleWidth = widthScale * 20;     
	paddleHeight = heightScale * 100;

	playerPaddle1.width = paddleWidth;
	playerPaddle1.height = paddleHeight;
	playerPaddle1.x = 0;
	playerPaddle1.y = (player.screen_dimensions.height - paddleHeight) / 2;
	playerPaddle1.dy = heightScale * 6.75;

	playerPaddle2.width = paddleWidth;
	playerPaddle2.height = paddleHeight;
	playerPaddle2.x = player.screen_dimensions.width - paddleWidth;
	playerPaddle2.y = (player.screen_dimensions.height - paddleHeight) / 2;
	playerPaddle2.dy = heightScale * 6.75;

	sphereRadius = widthScale * 20;  
	sphere.radius = sphereRadius;
	sphere.x = player.screen_dimensions.width / 2;
	sphere.y = player.screen_dimensions.height / 2;


	sphere.speed = heightScale * 4; 
	sphere.dx = widthScale * 3.75; 
	sphere.dy = heightScale * 3.75;

	speedincre = heightScale * 0.2;
}

document.addEventListener('keydown', (e) => {
	if (e.key === 'ArrowUp') upPressed = true;
	if (e.key === 'ArrowDown') downPressed = true;
});

document.addEventListener('keyup', (e) => {
	if (e.key === 'ArrowUp') upPressed = false;
	if (e.key === 'ArrowDown') downPressed = false;
});

function movement(player1, player2) {
	let player;
	let paddle;
	let target;
	if (window.userData.username === player1.username) {
		target = player2;
		player = player1;
		paddle = playerPaddle1;
	} else {
		target = player1;
		player = player2;
		paddle = playerPaddle2;
	}
	if (upPressed && paddle.y > 50) {
		paddle.y -= paddle.dy;
		sendGameState(1, target.username);
	} else if (downPressed && paddle.y < player.screen_dimensions.height - paddle.height) {
		paddle.y += paddle.dy;
		sendGameState(0, target.username);
	}
}



function sphereMovement(player1, player2) {
	let  player;
	if (window.userData.username === player1.username) {
		player = player1;
	} else {
		player = player2;
	}

	const canvasWidth = player.screen_dimensions.width;
	const canvasHeight = player.screen_dimensions.height;


	sphere.x += sphere.dx;
	sphere.y += sphere.dy;


	if (sphere.y - sphere.radius < 0 || sphere.y + sphere.radius > canvasHeight) {
		sphere.dy = -sphere.dy; 
	}

	
	if (sphere.x - sphere.radius < 0 || sphere.x + sphere.radius > canvasWidth) {
		
		sphere.x = canvasWidth / 2;
		sphere.y = canvasHeight / 2;
		
		sphere.dx = -sphere.dx;
	}
	if (sphere.x + sphere.radius >= playerPaddle2.x &&
		sphere.y >= playerPaddle2.y &&
		sphere.y <= playerPaddle2.y + playerPaddle2.height) {
			sphere.dx *= -1;
			sphere.dy *= -1;
	}

	if (sphere.x - sphere.radius <= playerPaddle1.x + playerPaddle1.width &&
		sphere.y >= playerPaddle1.y &&
		sphere.y <= playerPaddle1.y + playerPaddle1.height) {
			sphere.dx *= -1;
			sphere.dy *= -1;
	}
}


function resetSpherePosition(canvasHeight, canvasWidth) {
	// Reset sphere to center of the screen with a default speed and angle
	sphere.x = canvasWidth / 2;
	sphere.y = canvasHeight / 2;
	sphere.dx = sphere.khra * (Math.random() < 0.5 ? 1 : -1); // Random direction
	sphere.dy = sphere.khra * (Math.random() < 0.5 ? 1 : -1);
	RestTime = Date.now(); // Reset speed increase timer
}

export function renderOP(y) {
	if (window.userData.username === playerPaddle1.username) {
		if (y) {
			playerPaddle2.y -= playerPaddle2.dy;
		} else {
			playerPaddle2.y += playerPaddle2.dy;
		}
	} else {
		if (y) {
			playerPaddle1.y -= playerPaddle1.dy;
		} else {
			playerPaddle1.y += playerPaddle1.dy;
		}
	}
}

export function drawAll(player1, player2, settings) {
	if (settings === null){
		settings.mode = 'Default mode';
		settings.map = 'Map 1';
	}
	if (window.userData.username === player1.username) {
		if (player1.set === false ) {

			setDimensions(player1);
			playerPaddle1.username = player1.username;
			playerPaddle2.username = player2.username;
			player1.set = true;
		}
	}
	else {
		if (player2.set === false ) {
			setDimensions(player2);
			playerPaddle1.username = player1.username;
			playerPaddle2.username = player2.username;
			player2.set = true;
		}
	}
	if (RestTime === null) {
		RestTime = Date.now();
	}
	let perc;
	perc = playerPaddle2.height * 100 / player1.screen_dimensions.height;
	console.log('rayans\'s paddle percentage :', perc);
	perc = playerPaddle1.height * 100 / player1.screen_dimensions.height;
	console.log('sadoon\'s paddle percentage :', perc);
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
	drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
	drawSphere(sphere.x, sphere.y, sphere.radius);
	sphereMovement(player1, player2);
	movement(player1, player2);
	requestAnimationFrame(() => drawAll(player1, player2, settings));
}

window.addEventListener('resize', function () {
	console.log('ak nektha');
});