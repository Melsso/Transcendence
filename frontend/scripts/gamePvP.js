const canvass = document.getElementById('pongCanvas');
const ctxx = canvass.getContext('2d');
import { sendGameState, sendBuffState } from "./gameSystem.js";

const REFERENCE_WIDTH = 1920;
let gamer1;
let gamer2;
let up1 = true;
let up2 = true;
let up3 = true;
let sphereinspeed = false;
let sphereinattack = false;
let sphereinBigpad = false;
let SpeedCounting = 0;
let attackcount = 0;
let bigpadcount = 0;
let last_hit = 0;
let speeddoubled = 0;
let playerheight2 = 0;
let nocurrentGame = false;
let p1;
let p2;
let sx;
let BuffFlag = 0;
let sy;
const REFERENCE_HEIGHT = 1080;
let upPressed = false;
let animation =  [];
let downPressed = false;
let playerPaddle1 = { x: 0, y: 0, width: 0, height: 0, dy: 0, username: "", Att: 0, score: 0 };
let playerPaddle2 = { x: 0, y: 0, width: 0, height: 0, dy: 0, username: "", Att: 0, score: 0 };
let Buffpvp = {x: 0, y: 0, width: 0, height: 0, visible: false};
let Attackpvp = {x: 0, y: 0, width: 0, height: 0, visible: false};
let Bigpadpvp = {x: 0, y: 0, width: 0, height: 0, visible: false};
let sphere = { x: 0, y: 0, radius: 0, dx: 0, dy: 0, speed: 0 };
let block1 = {x: 0, y: 0, width: 0, height: 0, speed: 0, visible: false};
let block2 = {x: 0, y: 0, width: 0, height: 0, speed: 0, visible: false};



function drawScore(pvp1, pvp2) {
	ctxx.fillStyle = 'black';
	ctxx.fillRect(0, 0, canvass.width, 50);
	const image1 = new Image();
	const image2 = new Image();
	image1.src = gamer1.avatar;
	image2.src = gamer2.avatar;
	ctxx.drawImage(image1, 10, 5, 40, 40);
	ctxx.font = '20px Arial';
	ctxx.fillStyle = 'white';
	ctxx.fillText(pvp1.username, 10*canvass.width/100, 30);
	ctxx.fillText(pvp1.score, 18*canvass.width/100, 30);
	// ctxx.drawImage(image2, canvass.width - 50, 5, 40, 40);
	ctxx.font = '20px Arial';
	ctxx.fillStyle = 'white'; 
	ctxx.fillText(pvp2.username, 90*canvass.width/100, 30);
	ctxx.fillText(pvp2.score, 82*canvass.width/100, 30);
}
export function gameOScreenpvp() {
	var winner;
	if (sphere.x >= canvass.width - playerPaddle2.width){
		gamer2.score++;
		winner = gamer2.username;
	}
	else{
		gamer1.score++;
		winner = gamer1.username;
	}
	var w = [];
	if (window.userData.username === winner) {
		w.font = '24px "PixelFont", sans-serif';
		w.fillStyle = 'green';
		w.text = 'You won 250 EXP';
	} else {
		w.font = '24px "PixelFont", sans-serif';
		w.fillStyle = 'red';
		w.text = 'You lost 250 EXP';
	}
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	ctxx.fillStyle = '#000';
	ctxx.fillRect(0, 0, canvass.width, canvass.height);
	const	font_size = canvass.width * 0.15;
	ctxx.font = `${font_size}px "PixelFont", sans-serif`;
	ctxx.fillStyle = '#ffffff';
	ctxx.textAlign = 'center';
	ctxx.fillText('GAME OVER', canvass.width * 0.5, canvass.height * 0.25);
	if (gamer1.score >= 4){
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`${gamer1.username}: ${gamer1.score}`, canvass.width / 3, canvass.height / 2);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#ffffff';
		ctxx.fillText(`${gamer2.username}: ${gamer2.score}`, canvass.width / 1.5, canvass.height / 2);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`WINNER: ${gamer1.username}`, canvass.width / 2, canvass.height / 3);
	}
	else if (gamer2.score >= 4){
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#ffffff';
		ctxx.fillText(`${gamer1.username}: ${gamer1.score}`, canvass.width / 3, canvass.height / 2);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`${gamer2.username}: ${gamer2.score}`, canvass.width / 1.5, canvass.height / 2);
		ctxx.font = '50px "PixelFont", sans-serif';
		ctxx.fillStyle = '#FFD700';
		ctxx.fillText(`WINNER: ${gamer2.username}`, canvass.width / 2, canvass.height / 3);
	}
	ctxx.font = w.font;
	ctxx.fillStyle = w.fillStyle;
	ctxx.fillText(w.text, canvass.width / 2, canvass.height * 0.70);
	ctxx.font = '24px "PixelFont", sans-serif';
	ctxx.fillStyle = '#ff0000';
	ctxx.fillText('Please press Q to go back to main menu', canvass.width / 2, canvass.height * 0.85);
}

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
	if (BuffFlag === 1){
		Buffpvp.visible = true;
		Attackpvp.visible = false;
		Bigpadpvp.visible = false;
	}
	else if (BuffFlag === 2){
		Buffpvp.visible = false;
		Attackpvp.visible = true;
		Bigpadpvp.visible = false;
	}
	else if (BuffFlag === 3){
		Buffpvp.visible = false;
		Attackpvp.visible = false;
		Bigpadpvp.visible = true;
	}
	else{
		Buffpvp.visible = false;
		Attackpvp.visible = false;
		Bigpadpvp.visible = false;
	}
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

export function countdownforRound(callback){
	if (nocurrentGame)
		return;
	let cooldown = 3;
	const intID = setInterval(() => {
		if (nocurrentGame) {
			clearInterval(intID);
			cooldown = 3;
			return;
		}
		ctxx.clearRect(0, 0, canvass.widht, canvass.height);
		drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
		drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
		drawSphere(sphere.x, sphere.y, sphere.radius);
		displayCountdown();
		cooldown--;

		if(cooldown < 0){
			clearInterval(intID);
			callback();
		}

	}, 1000);
}

export function newRound() {
	const heightScale = window.userData.screen_dimensions.height;
	const widthScale = window.userData.screen_dimensions.width;
	ctxx.clearRect(0, 0, canvass.widht, canvass.height);
	playerPaddle1.height = heightScale / 10;
	playerPaddle2.height = heightScale / 10;
	playerPaddle1.dy = heightScale / 100;
	playerPaddle2.dy = heightScale / 100;
	Buffpvp.visible = false;
	Attackpvp.visible = false;
	Bigpadpvp.visible = false;
	last_hit = null;
	playerPaddle1.Att = 0;
	playerPaddle2.Att = 0;
	block1.visible = false;
	block2.visible = false;
	BuffFlag = 0;
	sphere.radius = widthScale / 100;
	sphere.x = (widthScale / 2);
	sx = sphere.x;
	sphere.y = (heightScale / 2);
	sy = sphere.y;
}

export function changeLast(last) {
	last_hit = last;
}

export function Speedpower(){
	if (playerPaddle1.dy === speeddoubled && last_hit === 1) {
		playerPaddle1.dy = speeddoubled;
	}
	if (playerPaddle2.dy === speeddoubled && last_hit === 2) {
		playerPaddle2.dy = speeddoubled;
	}
	if (last_hit === 1) {
		playerPaddle1.dy = speeddoubled;
	}
	else if (last_hit === 2) {
		playerPaddle2.dy = speeddoubled;
	}

}

function Trackballinspeed() {
	if (Buffpvp.visible &&
		sphere.x - sphere.radius <= Buffpvp.x + Buffpvp.width &&
		sphere.x + sphere.radius >= Buffpvp.x &&
		sphere.y - sphere.radius <= Buffpvp.y + Buffpvp.height && 
		sphere.y + sphere.radius >= Buffpvp.y )
		{
			if (!sphereinspeed) {
				sphereinspeed = true;
			}
		}
		else {
				if (sphereinspeed) {
					sphereinspeed = false;
					SpeedCounting++;
					if (last_hit === 1) {
						if (window.userData.username === playerPaddle1.username)
							sendBuffState('speed', last_hit);
					} else if (last_hit === 2) {
						if (window.userData.username === playerPaddle2.username) {
							sendBuffState('speed', last_hit);
						}
					}
				}
			}
		if (SpeedCounting === 2) {
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
	if (Attackpvp.visible &&
		sphere.x + sphere.radius > Attackpvp.x &&
		sphere.x - sphere.radius < Attackpvp.x + Attackpvp.width &&
		sphere.y + sphere.radius > Attackpvp.y &&
		sphere.y - sphere.radius < Attackpvp.y + Attackpvp.height){
			if (!sphereinattack)
				sphereinattack = true;
		}
		else	{
			if (sphereinattack){
				sphereinattack = false;
				attackcount++;
				if (last_hit === 1 || last_hit === 2)
					Attackpower();
			}
		}
	if (attackcount === 2){
		Attackpvp.visible = false;
	}
}
export function Bigpadpower(){
	if (playerPaddle1.height === playerheight2 && last_hit === 1) {
		return ;
	}
	if (playerPaddle2.height === playerheight2 && last_hit === 2) {
		return ;
	}
	if (last_hit === 1) {
		playerPaddle1.y = playerPaddle1.y - (playerPaddle1.height / 2);
		playerPaddle1.height = playerheight2;
	}
	else if (last_hit === 2) {
		playerPaddle2.y = playerPaddle2.y - (playerPaddle2.height / 2);
		playerPaddle2.height = playerheight2;
	}
}
function	TrackballinBigpad(){
	if (Bigpadpvp.visible &&
		sphere.x + sphere.radius >= Bigpadpvp.x &&
		sphere.x - sphere.radius <= Bigpadpvp.x + Bigpadpvp.width &&
		sphere.y + sphere.radius >= Bigpadpvp.y &&
		sphere.y - sphere.radius <= Bigpadpvp.y + Bigpadpvp.height)
		{
			if (!sphereinBigpad){
				sphereinBigpad = true;
				console.log("bababoy2");
			}
		}
		else	{
			if (sphereinBigpad){
				sphereinBigpad = false;
				bigpadcount++;
				if (last_hit === 1) {
					if (window.userData.username === playerPaddle1.username)
						sendBuffState('shield', last_hit);
				} else if (last_hit === 2) {
					if (window.userData.username === playerPaddle2.username) {
						sendBuffState('shield', last_hit);
					}
				}
			}
		}
	if (bigpadcount === 2){
		Bigpadpvp.visible = false;
	}
}

function setDimensions() {
	canvass.width = canvass.getBoundingClientRect().width;
	canvass.height = canvass.getBoundingClientRect().height;
	const widthScale = window.userData.screen_dimensions.width;
	const heightScale = window.userData.screen_dimensions.height;
	
	playerPaddle1.width = widthScale / 100;
	playerPaddle1.height = heightScale / 10;
	playerPaddle1.x = 0;
	playerPaddle1.y = (heightScale / 2) - (playerPaddle1.height / 2);
	p1 = playerPaddle1.y;
	playerPaddle1.dy = heightScale / 100;
	speeddoubled = playerPaddle1.dy * 1.75;
	playerheight2 =  ((heightScale / 10) * 2);
	Buffpvp.width = widthScale / 10;
	Buffpvp.height = heightScale / 50;
	Attackpvp.width = widthScale / 20;
	Attackpvp.height = heightScale / 100;
	Bigpadpvp.width = widthScale / 10;
	Bigpadpvp.height = heightScale / 50;
	Buffpvp.y = heightScale;
	Buffpvp.x = (widthScale / 2);
	Attackpvp.y = heightScale;
	Attackpvp.x = (widthScale / 2);
	Bigpadpvp.y = heightScale;
	Bigpadpvp.x = (widthScale / 2);

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

function movement(pvp1, pvp2) {
	let player;
	let paddle;
	let me;
	let target;
	if (window.userData.username === pvp1.username) {
		target = pvp2;
		player = pvp1;
		me = '1';
		paddle = playerPaddle1;
	} else {
		target = pvp1;
		player = pvp2;
		me = '2';
		paddle = playerPaddle2;
	}
	if (upPressed && paddle.y > 0) {
		paddle.y -= paddle.dy;
		if (paddle.y < 0)
			paddle.y = 0;
		sendGameState(1, target.username, me);
	} else if (downPressed && paddle.y < (window.userData.screen_dimensions.height - paddle.height)) {
		paddle.y += paddle.dy;
		if (paddle.y >= (window.userData.screen_dimensions.height - paddle.height))
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
	drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
	drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
}

export function changeSphereVars(x, y) {
	sphere.x = x * window.userData.screen_dimensions.width;
	sphere.y = y * window.userData.screen_dimensions.height;
}

export function drawAll(pvp1, pvp2, settings) {
	if (settings === null){
		settings.mode = 'Default mode';
		settings.map = 'Map 1';
	}
	if (window.userData.username === pvp1.username) {
		if (pvp1.set === false ) {
				setDimensions();
				playerPaddle1.username = pvp1.username;
				playerPaddle2.username = pvp2.username;
				pvp1.set = true;
		}
	}
	else {
		if (pvp2.set === false ) {
			setDimensions();
			playerPaddle1.username = pvp1.username;
			playerPaddle2.username = pvp2.username;
			pvp2.set = true;
		}
	}
	gamer1 = pvp1;
	gamer2 = pvp2;
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	drawScore(pvp1, pvp2);
	drawPlayerPaddle1(playerPaddle1.x, playerPaddle1.y, playerPaddle1.width, playerPaddle1.height);
 	drawPlayerPaddle2(playerPaddle2.x, playerPaddle2.y, playerPaddle2.width, playerPaddle2.height);
	TrackballinBigpad();
	Trackballinattack();
	Trackballinspeed();
	if (BuffFlag === 1) {
		if (Buffpvp.visible === true){
			drawBuffpvp(0.45);
			if (up1)
				Buffpvp.y -= Buffpvp.height / 2;
			else if (!up1)
				Buffpvp.y += Buffpvp.height / 2;
			if (Buffpvp.y <= 0){
				up1 = false;
			}
		}
	}
	else if (BuffFlag === 2) {
		if (Attackpvp.visible === true){
			drawAttackpvp(0.45);
			if (up2)
				Attackpvp.y -= Attackpvp.height / 2;
			else if (!up2)
				Attackpvp.y += Attackpvp.height / 2;
			if (Attackpvp.y <= 0){
				up2 = false;
			}
		}
	}
	else if (BuffFlag === 3) {
		if (Bigpadpvp.visible === true){
			drawBigpadpvp(0.45);
			if (up3)
				Bigpadpvp.y -= Bigpadpvp.height / 2;
			else if (!up3)
				Bigpadpvp.y += Bigpadpvp.height / 2;
			if (Bigpadpvp.y <= 0) {
				up3 = false;
			}
		}
	}
	drawSphere(sphere.x, sphere.y, sphere.radius);
	movement(pvp1, pvp2);
	let frame = requestAnimationFrame(() => drawAll(pvp1, pvp2, settings));
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
	
	let countdown =3;
	countdownOverlay.textContent = countdown;
	ctxx.clearRect(0, 0, canvass.width, canvass.height);
	playerPaddle1.y = p1;
	playerPaddle2.y = p2;
	if (sphere.x >=  canvass.width - playerPaddle2.width) {
		gamer2.score += 1;
	} else {
		gamer1.score += 1;
	}
	sphere.x = sx;
	sphere.y = sy;
	drawScore(gamer1, gamer2);
	const countdownInterval = setInterval(() => {
		 countdown -= 1;
		 if (countdown > 0) {
			  countdownOverlay.textContent = countdown;
		 } else {
			  clearInterval(countdownInterval);
			  countdownOverlay.textContent = 'Game Start!';
			  setTimeout(() => {
					countdownOverlay.remove();
					drawAll(gamer1, gamer2, lobbySettings);
			  }, 1000);
		 }
	}, 1000);
}
// window.displayCountdown = displayCountdown;

window.addEventListener('resize', function () {
	console.log('ak nektha');
});