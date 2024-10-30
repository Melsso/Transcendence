const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState } from "./gameSystem.js";

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
	paddleWidth = player.screen_dimensions.width * 0.01;
	paddleHeight = player.screen_dimensions.height * 0.1;
	sphereRadius = player.screen_dimensions.width * 0.01;
	speedincre = player.screen_dimensions.height / 5000;
	fullcanvas = player.screen_dimensions.height + player.screen_dimensions.width;
	zbel = (player.screen_dimensions.height + player.screen_dimensions.width) * 2;

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

	sphere.radius = sphereRadius;
	sphere.x = player.screen_dimensions.width / 2;
	sphere.y = player.screen_dimensions.height / 2;
	sphere.speed = fullcanvas / 545;
	sphere.dx = fullcanvas / 568;
	sphere.dy = fullcanvas / 568;
	sphere.inc = speedincre;
	sphere.khra = fullcanvas / 975;
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
	elapsedTime = Date.now() - RestTime;
	const speedFactor = 1 + Math.floor(elapsedTime / zbel) * sphere.inc;
	sphere.dx = sphere.speed * speedFactor * (sphere.dx > 0 ? 1 : -1);
	sphere.dy = sphere.speed * speedFactor * (sphere.dy > 0 ? 1 : -1);
	let canvasWidth;
	let canvasHeight;
	let player ;
	if (window.userData.username === player1.username) {
		player = player1;
	} else {
		player = player2;
	}
	canvasHeight = player.screen_dimensions.height;
	canvasWidth = player.screen_dimensions.width;

	sphere.x += sphere.dx;
	sphere.y += sphere.dy;

	if (sphere.y + sphere.radius > canvasHeight || sphere.y - sphere.radius < 0) {
		 sphere.dy *= -1;
	}

	if (
		 sphere.x - sphere.radius <= playerPaddle1.x + playerPaddle1.width &&
		 sphere.y >= playerPaddle1.y &&
		 sphere.y <= playerPaddle1.y + playerPaddle1.height
	) {
		 var relativeIntersectY = (playerPaddle1.y + playerPaddle1.height / 2) - sphere.y;
		 var normrelIntersectY = relativeIntersectY / (playerPaddle1.height / 2);
		 var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));
		 
		 sphere.dx = sphere.khra * Math.cos(bounceAngle);
		 sphere.dy = -sphere.khra * Math.sin(bounceAngle);
		 
		 sphere.x = playerPaddle1.x + playerPaddle1.width + sphere.radius + 1;
		 
		 sphere.dx = sphere.khra * (sphere.dx > 0 ? 1 : -1);
		 console.log(sphere.x, " ", sphere.y, " ", sphere.dx, " ", sphere.dy);
		//  LastpaddleHit = "wasd";
	}

	if (
		 sphere.x + sphere.radius >= playerPaddle2.x &&
		 sphere.y >= playerPaddle2.y &&
		 sphere.y <= playerPaddle2.y + playerPaddle2.height
	) {
		 var relativeIntersectY = (playerPaddle2.y + playerPaddle2.height / 2) - sphere.y;
		 var normrelIntersectY = relativeIntersectY / (playerPaddle2.height / 2);
		 var bounceAngle = normrelIntersectY * (75 * (Math.PI / 180));
		 sphere.dx = - sphere.khra * Math.cos(bounceAngle);
		 sphere.dy = - sphere.khra * Math.sin(bounceAngle);
		 sphere.x = playerPaddle2.x - sphereRadius -1;
		 sphere.dx = sphere.khra * (sphere.dx > 0 ? 1 : -1);
		 console.log(sphere.x, " ", sphere.y, " ", sphere.dx, " ", sphere.dy);
		//  LastpaddleHit = "Arrows";
	}
	if ((sphere.x - sphere.radius <= 0 || sphere.x + sphere.radius >= canvasWidth)){
		sphere.dx *= -1;
		sphere.dy *= -1;
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
	if (RestTime === null) {
		RestTime = Date.now();
	}
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