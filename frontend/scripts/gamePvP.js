const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState, sendBuffState } from "./gameSystem.js";

const REFERENCE_WIDTH = 1920;
let gamer1;
let gamer2;
let up1 = true;
let up2 = true;
let up3 = true;
let sphereinbuff = false;
let buffcount = 0;
let attackcount = 0;
let bigpadcount = 0;
let last_hit = 0;
let p1;
let p2;
let sx;
let BuffFlag = 0;
let sy;
const REFERENCE_HEIGHT = 1080;
let upPressed = false;
let animation =  [];
let downPressed = false;
let playerPaddle1 = { x: 0, y: 0, width: 0, height: 0, dy: 0, username: "", Att: 0 };
let playerPaddle2 = { x: 0, y: 0, width: 0, height: 0, dy: 0, username: "", Att: 0 };
let Buffpvp = {x: 0, y: 0, width: 0, height: 0, visible: false};
let Attackpvp = {x: 0, y: 0, width: 0, height: 0, visible: false};
let Bigpadpvp = {x: 0, y: 0, width: 0, height: 0, visible: false};
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

export function ChangeFlag(flag) {
	BuffFlag = flag;
}

export function drawBuffpvp(x){
	ctxx.globalAlpha = 0.5;
	ctxx.fillStyle = "gold";
	ctxx.fillRect(x * window.userData.screen_dimensions.width, Buffpvp.y, Buffpvp.width, Buffpvp.height);
	ctxx.globalAlpha = 1.0;
}

export function drawAttackpvp(x){
	ctxx.globalAlpha = 0.5;
	ctxx.fillStyle = "red";
	ctxx.fillRect(x * window.userData.screen_dimensions.width, Attackpvp.y, Attackpvp.width, Attackpvp.height);
	ctxx.globalAlpha = 1.0;
}
export function drawBigpadpvp(x){
	ctxx.globalAlpha = 0.5;
	ctxx.fillStyle = "cyan";
	ctxx.fillRect(x * window.userData.screen_dimensions.width, Bigpadpvp.y, Bigpadpvp.width, Bigpadpvp.height);
	ctxx.globalAlpha = 1.0;
}

export function Habess() {
	for (let i = 0; i < animation.length; i++) {
		cancelAnimationFrame(animation[i]);
  }
  animation = [];
}

export function changeLast(last) {
	last_hit = last;
}

function Speedpower(){
	if (last_hit === 1)
		playerPaddle1.dy *= 2;
	else if (last_hit === 2)
		playerPaddle2.dy *= 2;
	if (playerPaddle1.dy === 12 && last_hit === 1)
		playerPaddle1.dy = 12;
	if (playerPaddle2.dy === 12 && last_hit === 2)
		playerPaddle2.dy = 12;
}
function	Trackballinspeed(){
	if ( (Buffpvp.visible) &&
		sphere.x + sphere.radius > Buffpvp.x &&
		sphere.x - sphere.radius < Buffpvp.x + Buffpvp.width &&
		sphere.y + sphere.radius > Buffpvp.y &&
		sphere.y - sphere.radius < Buffpvp.y + Buffpvp.height){
			if (!sphereinbuff)
				sphereinbuff = true;
		}
		else	{
			if (sphereinbuff){
				sphereinbuff = false;
				buffcount++;
				if (last_hit === 1 || last_hit === 2)
					Speedpower();
			}
		}
	if (buffcount === 2){
		Buffpvp.visible = false;
	}
}
function Attackpower(){
	if (last_hit === 1)
		playerPaddle1.Att = 1;
	else if (last_hit === 2)
		playerPaddle2.Att = 1;
	if (playerPaddle1.Att === 1 && last_hit === 1)
		playerPaddle1.Att = 1;
	if (playerPaddle2.Att === 1 && last_hit === 2)
		playerPaddle2.Att = 1;
}
function	Trackballinattack(){
	if ( (Attackpvp.visible) &&
		sphere.x + sphere.radius > Attackpvp.x &&
		sphere.x - sphere.radius < Attackpvp.x + Attackpvp.width &&
		sphere.y + sphere.radius > Attackpvp.y &&
		sphere.y - sphere.radius < Attackpvp.y + Attackpvp.height){
			if (!sphereinbuff)
				sphereinbuff = true;
		}
		else	{
			if (sphereinbuff){
				sphereinbuff = false;
				buffcount++;
				if (last_hit === 1 || last_hit === 2)
					Attackpower();
			}
		}
	if (buffcount === 2){
		Attackpvp.visible = false;
	}
}
function Bigpadpower(){
	let player1height2 = playerPaddle1.height * 2;
	let player2height2 = playerPaddle2.height * 2;
	if (last_hit === 1)
		playerPaddle1.height = player1height2;
	else if (last_hit === 2)
		playerPaddle2.height = player2height2;
	if (playerPaddle1.height === player1height2 && last_hit === 1)
		playerPaddle1.height = player1height2;
	if (playerPaddle2.height === player2height2 && last_hit === 2)
		playerPaddle2.height = player2height2;
}
function	TrackballinBigpad(){
	if ( (Bigpadpvp.visible) &&
		sphere.x + sphere.radius > Bigpadpvp.x &&
		sphere.x - sphere.radius < Bigpadpvp.x + Bigpadpvp.width &&
		sphere.y + sphere.radius > Bigpadpvp.y &&
		sphere.y - sphere.radius < Bigpadpvp.y + Bigpadpvp.height){
			if (!sphereinbuff)
				sphereinbuff = true;
		}
		else	{
			if (sphereinbuff){
				sphereinbuff = false;
				buffcount++;
				if (last_hit === 1 || last_hit === 2)
					Attackpower();
			}
		}
	if (buffcount === 2){
		Bigpadpvp.visible = false;
	}
}

function setDimensions() {
	const widthScale = window.userData.screen_dimensions.width;
	const heightScale = window.userData.screen_dimensions.height;
	
	playerPaddle1.width = widthScale / 100;
	playerPaddle1.height = heightScale / 10;
	playerPaddle1.x = 0;
	playerPaddle1.y = (heightScale / 2) - (playerPaddle1.height / 2);
	p1 = playerPaddle1.y;
	playerPaddle1.dy = heightScale / 100;
	Buffpvp.width = widthScale / 20;
	Buffpvp.height = heightScale / 100;
	Attackpvp.width = widthScale / 20;
	Attackpvp.height = heightScale / 100;
	Bigpadpvp.width = widthScale / 20;
	Bigpadpvp.height = heightScale / 100;
	Buffpvp.y = heightScale;
	Attackpvp.y = heightScale;
	Bigpadpvp.y = heightScale;

	playerPaddle2.width = widthScale / 100;
	playerPaddle2.height = heightScale / 10;
	playerPaddle2.x = widthScale - playerPaddle2.width;
	playerPaddle2.y = (heightScale / 2) - (playerPaddle2.height / 2);
	p2 = playerPaddle2.y;
	playerPaddle2.dy = heightScale / 100;

	sphere.radius = widthScale / 100;
	sphere.x = (widthScale / 2);
	sx = sphere.x;
	sphere.y = (heightScale / 2);
	sy = sphere.y;
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
	if (upPressed && paddle.y > 0) {
		paddle.y -= paddle.dy;
		if (paddle.y < 0)
			paddle.y = 0;
		sendGameState(1, target.username, me);
	} else if (downPressed && paddle.y < window.userData.screen_dimensions.height - paddle.height) {
		paddle.y += paddle.dy;
		if (paddle.y > window.userData.screen_dimensions.height - paddle.height)
			paddle.y = window.userData.screen_dimensions.height - paddle.height;
		sendGameState(0, target.username, me);
	}
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
			if (player1.set === false ) {
				gamer1 = player1;
				gamer2 = player2;
				setDimensions();
				playerPaddle1.username = player1.username;
				playerPaddle2.username = player2.username;
				player1.set = true;
			}
		}
	}
	else {
		if (player2.set === false ) {
			gamer1 = player1;
			gamer2 = player2;
			setDimensions();
			playerPaddle1.username = player1.username;
			playerPaddle2.username = player2.username;
			player2.set = true;
		}
	}
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
	drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
	if (BuffFlag === 1) {
		drawBuffpvp(0.5);
		if (up1) {
			Buffpvp.y -= Buffpvp.height / 2;
		} else {
			Buffpvp.y += Buffpvp.height / 2;
		}
		if (Buffpvp.y <= 0) {
			up1 = false;
		}
	}
	else if (BuffFlag === 2) {
		drawAttackpvp(0.5);
		if (up2) {
			Attackpvp.y -= Attackpvp.height / 2;
			} else {
			Attackpvp.y += Attackpvp.height / 2;
		}
		if (Attackpvp.y <= 0) {
			up2 = false;
		}
	}
	else if (BuffFlag === 3) {
		drawBigpadpvp(0.5);
		if (up3) {
			Bigpadpvp.y -= Bigpadpvp.height / 2;
		} else {
			Bigpadpvp.y += Bigpadpvp.height / 2;
		}
		if (Bigpadpvp.y <= 0) {
			up3 = false;
		}
	}
	drawSphere(sphere.x, sphere.y, sphere.radius);
	movement(player1, player2);
	let frame = requestAnimationFrame(() => drawAll(player1, player2, settings));
	animation.push(frame);
}

export function displayCountdown() {
	const gameContainer = document.getElementById('gameContainer');
	const countdownOverlay = document.createElement('div');
	countdownOverlay.classList.add('countdown-overlay');
	countdownOverlay.style.cssText = `
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		color: #fff;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 5em;
		z-index: 1000;
	`;
	gameContainer.appendChild(countdownOverlay);
	
	let countdown = 3;
	countdownOverlay.textContent = countdown;
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	playerPaddle1.y = p1;
	playerPaddle2.y = p2;
	sphere.x = sx;
	sphere.y = sy;
	const countdownInterval = setInterval(() => {
		 countdown -= 1;
		 if (countdown > 0) {
			  countdownOverlay.textContent = countdown;
		 } else {
			  clearInterval(countdownInterval);
			  countdownOverlay.textContent = 'Game Start!';
			  setTimeout(() => {
					countdownOverlay.remove();
					console.log(gamer1, gamer2);
					drawAll(gamer1, gamer2, lobbySettings);
			  }, 1000);
		 }
	}, 1000);
}
// window.displayCountdown = displayCountdown;

window.addEventListener('resize', function () {
	console.log('ak nektha');
});