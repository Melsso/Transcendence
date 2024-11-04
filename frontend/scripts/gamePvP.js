const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState } from "./gameSystem.js";

const REFERENCE_WIDTH = 1920;
const REFERENCE_HEIGHT = 1080;

let plankton;
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


function setDimensions() {
	const widthScale = window.userData.screen_dimensions.width;
	const heightScale = window.userData.screen_dimensions.height;

	playerPaddle1.width = widthScale / 100;
	playerPaddle1.height = heightScale / 10;
	playerPaddle1.x = 0;
	playerPaddle1.y = (player.screen_dimensions.height - paddleHeight) / 2;
	playerPaddle1.dy = heightScale * 6.75;

	playerPaddle2.width = widthScale / 100;
	playerPaddle2.height = heightScale / 10;
	playerPaddle2.x = widthScale - playerPaddle2.width;
	playerPaddle2.y = (heightScale / 2) - (playerPaddle2.height / 2);
	playerPaddle2.dy = heightScale / 100;

	sphere.radius = widthScale / 100;
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
	var  maxbounceAngle = 75 * (Math.PI / 180);
	if (window.userData.username === player1.username) {
		player = player1;
	} else {
		player = player2;
	}
	// const speedFact = plankton + Math.floor(elapsedTime / speedincre) * speedincre * (player.screen_dimensions.width / REFERENCE_WIDTH);
	// sphere.dx = initialSpeed * speedFact * (sphere.dx > 0 ? 1 : -1);
	// sphere.dy = initialSpeed * speedFact * (sphere.dy > 0 ? 1 : -1);

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
	if (
		sphere.x - sphere.radius <= playerPaddle1.x + playerPaddle1.width &&
		sphere.y + sphere.radius >= playerPaddle1.y &&
		sphere.y <= playerPaddle1.y + playerPaddle1.height
	) {
		if (sphere.y >= playerPaddle1.y + (playerPaddle1.height / 2)) {
			sphere.dy = sphere.speed * -1;
		} else {
			sphere.dy = sphere.speed * 1;
		}
		sphere.dx *= -1;
			// var wherehit = (playerPaddle1.y + playerPaddle1.height / 2) - sphere.y;
			// var wherego = wherehit / (playerPaddle1.height / 2);
			// var bAngle = wherego * maxbounceAngle;
			
			// sphere.dx = sphere.speed * Math.cos(bAngle);
			// sphere.dy = sphere.speed * Math.cos(bAngle) * -Math.sign(wherego);
			// sphere.x = playerPaddle1.x + playerPaddle1.width + sphere.radius + plankton;
		}
	if (
		sphere.x + sphere.radius >= playerPaddle2.x &&
		sphere.y + sphere.radius >= playerPaddle2.y &&
		sphere.y <= playerPaddle2.y + playerPaddle2.height
		) {
			console.log(playerPaddle2.y);
			if (sphere.y >= playerPaddle2.y + (playerPaddle2.height / 2)) {
				sphere.dy = sphere.speed * -1;
			} else {
				sphere.dy = sphere.speed * 1;
			}
			sphere.dx *= -1;
			// var wherehit = (playerPaddle2.y + playerPaddle2.height / 2) - sphere.y;
			// var wherego = wherehit / (playerPaddle2.height / 2);
			// var bAngle = wherego * maxbounceAngle;

			// sphere.dx = - sphere.speed * Math.cos(bAngle);
			// sphere.dy = - sphere.speed * Math.cos(bAngle) * -Math.sign(wherego);
			// sphere.x = playerPaddle2.x - sphere.radius - plankton;
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
		playerPaddle2.y = y * window.userData.screen_dimensions.height;
	} else {
		playerPaddle1.y = y * window.userData.screen_dimensions.height;
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
			setDimensions();
			playerPaddle1.username = player1.username;
			playerPaddle2.username = player2.username;
			player1.set = true;
		}
	}
	else {
		if (player2.set === false ) {player2
			setDimensions();
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