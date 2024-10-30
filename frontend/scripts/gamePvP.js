const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState } from "./gameSystem.js";

let paddleWidth;
let paddleHeight;
let upPressed;
let downPressed;
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

let ball = {
	x: 0,
	y: 0,
	radius: 0,
	speed: 3,
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


function setDimensions(player) {
	paddleWidth = player.screen_dimensions.width * 0.01;
	paddleHeight = player.screen_dimensions.height * 0.1;
	// ballRadius = player.screen_dimensions.width * 0.01;

	playerPaddle1.width = paddleWidth;
	playerPaddle1.height = paddleHeight;
	playerPaddle1.x = 0;
	playerPaddle1.y = player.screen_dimensions.height / 2 - paddleHeight / 2;
	playerPaddle1.dy = player.screen_dimensions.height / 160;

	playerPaddle2.width = paddleWidth;
	playerPaddle2.height = paddleHeight;
	playerPaddle2.x = player.screen_dimensions.width - paddleWidth;
	playerPaddle2.y = player.screen_dimensions.height / 2 - paddleHeight / 2;
	playerPaddle2.dy = player.screen_dimensions.height / 160;
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
	
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
	drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
	movement(player1, player2);
	requestAnimationFrame(() => drawAll(player1, player2, settings));
}

window.addEventListener('resize', function () {
	console.log('ak nektha');
});