const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState } from "./gameSystem.js";

const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;
let upPressed = false;
let downPressed = false;
let playerPaddle1 = { x: 0, y: 0, width: 0, height: 0, dy: 0, username: "" };
let playerPaddle2 = { x: 0, y: 0, width: 0, height: 0, dy: 0, username: "" };
let sphere = { x: 0, y: 0, radius: 0, dx: 0, dy: 0, speed: 0 };


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
	const widthScale = window.userData.screen_dimensions.width;
	const heightScale = window.userData.screen_dimensions.height;

	playerPaddle1.width = widthScale / 200;
	playerPaddle1.height = heightScale / 10;
	playerPaddle1.x = 0;
	playerPaddle1.y = (heightScale / 2) - (playerPaddle1.height / 2);
	playerPaddle1.dy = heightScale / 100;

	playerPaddle2.width = widthScale / 200;
	playerPaddle2.height = heightScale / 10;
	playerPaddle2.x = widthScale - playerPaddle2.width;
	playerPaddle2.y = (heightScale / 2) - (playerPaddle2.height / 2);
	playerPaddle2.dy = heightScale / 100;

	sphere.radius = widthScale / 200;
	sphere.x = (widthScale / 2) - (sphere.radius / 2);
	sphere.y = (heightScale / 2) - (sphere.radius / 2);
	// sphere.speed = heightScale * 3.75;
	sphere.dx = widthScale / 100;
	sphere.dy = heightScale / 100;
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
	let me;
	let target;
	if (window.userData.username === player1.username) {
		target = player2;
		player = player1;
		me = '1';
		paddle = playerPaddle1;
	} else {
		target = player1;
		player = player2;
		me = '2';
		paddle = playerPaddle2;
	}
	if (upPressed && paddle.y > (player.screen_dimensions.height / 20)) {
		paddle.y -= paddle.dy;
		sendGameState(1, target.username, me);
	} else if (downPressed && paddle.y < player.screen_dimensions.height - paddle.height) {
		paddle.y += paddle.dy;
		sendGameState(0, target.username, me);
	}
}

export function renderOP(y) {
	if (window.userData.username === playerPaddle1.username) {
		console.log(playerPaddle2.y);
		playerPaddle2.y = y * window.userData.screen_dimensions.height;
		console.log(playerPaddle2.y);
	} else {
		console.log(playerPaddle1.y);
		playerPaddle1.y = y * window.userData.screen_dimensions.height;
		console.log(playerPaddle1.y);
	}
}

export function changeSphereVars(x, y) {
	sphere.x = x * window.userData.screen_dimensions.width;
	sphere.y = y * window.userData.screen_dimensions.height;
}

export function drawAll(player1, player2, settings) {
	if (settings === null){
		settings.mode = 'Default mode';
		settings.map = 'Map 1';
	}
	if (window.userData.username === player1.username) {
		if (player1.set === false ) {
			// window.userData.screen_dimensions = {
			// 	width: canvass.getBoundingClientRect().width,
			// 	height: canvass.getBoundingClientRect().height
			// };
			setDimensions(player1);
			playerPaddle1.username = player1.username;
			playerPaddle2.username = player2.username;
			player1.set = true;
		}
	}
	else {
		if (player2.set === false ) {
			// window.userData.screen_dimensions = {
			// 	width: canvass.getBoundingClientRect().width,
			// 	height: canvass.getBoundingClientRect().height
			// };
			setDimensions(player2);
			playerPaddle1.username = player1.username;
			playerPaddle2.username = player2.username;
			player2.set = true;
		}
	}

	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
	drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
	drawSphere(sphere.x, sphere.y, sphere.radius);
	movement(player1, player2);
	requestAnimationFrame(() => drawAll(player1, player2, settings));
}

window.addEventListener('resize', function () {
	console.log('ak nektha');
});