const qContainer = document.getElementById('Queue');
const qBtn = document.getElementById('matchmaking');
const qName = document.getElementById('q-name');
const canvass = document.getElementById('pongCanvas');
const menu = document.getElementById('menuuu');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const baseUrl = process.env.ACTIVE_HOST;
const lobby = document.getElementById('pong-inv-container');
import { getRoomName, startGameSocket } from "./gameSystem.js";
const qSettings = {
	mode: 'Default mode',
	map: 'Map 1'
}
const gamer = {
	username: "PlayerOne",
	avatar: "path/to/avatar.png",
	bar_exp_game1: 3.5,
	wins: 30,
	losses: 20,
};

function getWinPercentage(wins, losses) {
	const totalGames = wins + losses;
	return totalGames ? ((wins / totalGames) * 100).toFixed(0) : 0;
}

qBtn.addEventListener('click', function() {
	
	menu.style.display = 'none';
	ai_menu.style.display = 'none';
	inv_menu.style.display = 'none';
	Instructions.style.display = 'none';
	lobby.style.display = 'none';
	const existingContainer = document.querySelector('.player-container.pong-container-players');
	if (existingContainer) {
	    existingContainer.remove();
	}
		qName.innerHTML = `
        <div class="map">Map:   ${qSettings.map}</div>
        <h1>1vs1 </h1>
        <div class="mode">Mode:   ${qSettings.mode}</div>
   `;

	const gContainer = document.createElement('div');
	gContainer.classList = 'player-container pong-container-players';
	gContainer.id = 'Queue-container-me';

	const avatarDiv = document.createElement('div');
	avatarDiv.classList.add('avatar');
	
	const avatarImg = document.createElement('img');
	avatarImg.src = gamer.avatar;
	avatarImg.alt = `${gamer.username} Avatar`;
	avatarImg.classList.add('avatar-image');
	avatarDiv.appendChild(avatarImg);

	const playerInfo = document.createElement('div');
	playerInfo.classList.add('player-info');

	const usernameHeading = document.createElement('h3');
	usernameHeading.textContent = gamer.username;
	playerInfo.appendChild(usernameHeading);

	const levelParagraph = document.createElement('p');
	levelParagraph.textContent = `Level ${Math.floor(gamer.bar_exp_game1)}:`;
	playerInfo.appendChild(levelParagraph);

	const expBarContainer = document.createElement('div');
	expBarContainer.classList.add('exp-bar-container');

	const expBar = document.createElement('div');
	expBar.classList.add('exp-bar');
	expBar.style.width = `${((gamer.bar_exp_game1 - Math.floor(gamer.bar_exp_game1)) * 100).toFixed(0)}%`;
	expBarContainer.appendChild(expBar);
	playerInfo.appendChild(expBarContainer);

	const winLossParagraph = document.createElement('p');
	winLossParagraph.textContent = `W/L: ${gamer.wins}-${gamer.losses}`;
	playerInfo.appendChild(winLossParagraph);
	const winrateBarContainer = document.createElement('div');
	winrateBarContainer.classList.add('winrate-bar-container');

	const winrateBar = document.createElement('div');
	winrateBar.classList.add('winrate-bar');
	winrateBar.style.width = `${getWinPercentage(gamer.wins, gamer.losses)}%`;
	winrateBarContainer.appendChild(winrateBar);
	playerInfo.appendChild(winrateBarContainer);
	gContainer.appendChild(avatarDiv);
	gContainer.appendChild(playerInfo);

	const spinnerContainer = document.createElement('div');
	spinnerContainer.classList.add('text-center', 'mt-4', 'spinner-container');

	const spinner = document.createElement('div');
	spinner.classList.add('spinner-border', 'text-primary');
	spinner.setAttribute('role', 'status');

	const spinnerText = document.createElement('span');
	spinnerText.classList.add('sr-only');
	spinnerText.textContent = 'Loading...';
	spinner.appendChild(spinnerText);

	const loadingMessage = document.createElement('p');
	loadingMessage.textContent = 'Looking for an opponent...';
	loadingMessage.classList.add('mt-2');

	spinnerContainer.appendChild(spinner);
	spinnerContainer.appendChild(loadingMessage);

	gContainer.appendChild(spinnerContainer);
	qContainer.appendChild(gContainer);
	qContainer.style.display = 'flex';
	creatQueueRoom();
	// acceptRefuse();
});

export function acceptRefuse() {
	const gContainer = document.getElementById('Queue-container-me');
	const modal = document.createElement('div');
	modal.id = 'queue-match-modal';
	modal.className = 'queue-modal';
 
	const modalContent = document.createElement('div');
	modalContent.className = 'queue-modal-content';
 
	const heading = document.createElement('h2');
	heading.innerText = 'Match Found!';
	modalContent.appendChild(heading);
 
	const message = document.createElement('p');
	message.innerText = 'Do you accept the match?';
	modalContent.appendChild(message);
 
	const buttonContainer = document.createElement('div');
	buttonContainer.className = 'queue-modal-buttons';
 
	const acceptButton = document.createElement('button');
	acceptButton.id = 'queue-accept-button';
	acceptButton.className = 'queue-btn-modal queue-accept';
	acceptButton.innerText = 'Accept';
	buttonContainer.appendChild(acceptButton);
 
	const refuseButton = document.createElement('button');
	refuseButton.id = 'queue-refuse-button';
	refuseButton.className = 'queue-btn-modal queue-refuse';
	refuseButton.innerText = 'Decline';
	buttonContainer.appendChild(refuseButton);
 
	modalContent.appendChild(buttonContainer);
 
	modal.appendChild(modalContent);
 
	gContainer.appendChild(modal);
 
	modal.style.display = 'flex';
 
	acceptButton.onclick = function () {
	  modal.style.display = 'none';
	  modal.remove();

	  console.log('Match Accepted!');
	};
 
	refuseButton.onclick = function () {
	  modal.style.display = 'none';
	  modal.remove();

	  console.log('Match Declined.');
	};
 
	window.onclick = function (event) {
	  if (event.target == modal) {
		 modal.style.display = 'none';
		 modal.remove();
	  }
	};
}

async function creatQueueRoom() {
	const accessToken = localStorage.getItem('accessToken');
   if (!accessToken) {
      Notification('Profile Action', 'You Are Not Currently Logged In', 2, 'alert');
      return ;
   }
	try {
		if (window.userData.pong_socket) {
			 window.userData.pong_socket.close();
			 window.userData.pong_socket = null;
		 window.userData.r_name = null;
		}
		const data = await getRoomName();
		data.room_name = 'queue_' + data.room_name;
		window.userData.r_name = data.room_name;
		const u = new URL(baseUrl);
		const gameSocket = new WebSocket(`ws://${u.host}/ws/game/${data['room_name']}/?token=${accessToken}`);
		window.userData['pong_socket'] = gameSocket;
		startGameSocket();
  } catch (error) {
		Notification('Game Action', `Failed to create a room! ${error}`, 2, 'alert');
		window.userData.r_name = null;
		if (window.userData.pong_socket) {
			 window.userData.pong_socket.close();
		}
		window.userData.pong_socket = null;
		return ;
  }
}
