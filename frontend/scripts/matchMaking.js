const qContainer = document.getElementById('Queue');
const qBtn = document.getElementById('matchmaking');
const qName = document.getElementById('q-name');
const canvass = document.getElementById('pongCanvas');
const menu = document.getElementById('menuuu');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const baseUrl = process.env.ACTIVE_HOST;
window.hebssmodal =false;
window.mod = null;
const lobby = document.getElementById('pong-inv-container');
import { getRoomName, startGameSocket } from "./gameSystem.js";
import { getMatchHistory } from "./populatePageHelpers.js";

function getWinPercentage(wins, losses) {
	const totalGames = wins + losses;
	return totalGames ? ((wins / totalGames) * 100).toFixed(0) : 0;
}

export function getWinsLosses(games) {
	var stats = {
        Wins: 0,
        Losses: 0,
    };
    games.forEach(game => {
        const gameKey = Object.keys(game)[0];
        const { ally, enemy } = game[gameKey];

        const isPve = enemy.user.username.includes('Easy AI') || enemy.user.username.includes('Hard AI') || enemy.user.username.includes('Medium AI');
        if (ally.is_win) {
            if (!isPve)
                stats.Wins++;
        } else {
            if (!isPve)
                stats.Losses++;
        }
	});
    return stats;
}

qBtn.addEventListener('click', async function() {
	var gameLogs;
	try {
		const result = await getMatchHistory();
		gameLogs = getWinsLosses(result['match_history']);

	} catch (error) {
		Notification('Game Action', `Failed to fecth game logs! ${error}`, 2, 'alert');
		gameLogs.Wins = 0;
		gameLogs.Losses = 0;
	}
	if (window.userData['guest'] === true) {
		Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
		return ;
	}
	const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
	const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
	setting = {
		mode: gameMode,
		map: selectedMap
	};
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
        <div class="map">Map:   ${setting.map}</div>
        <h1>1vs1 </h1>
        <div class="mode">Mode:   ${setting.mode}</div>
	`;

	const gContainer = document.createElement('div');
	gContainer.classList = 'player-container pong-container-players';
	gContainer.id = 'Queue-container-me';

	const avatarDiv = document.createElement('div');
	avatarDiv.classList.add('avatar');
	
	const avatarImg = document.createElement('img');
	avatarImg.src = window.userData.avatar;
	avatarImg.alt = `${window.userData.username} Avatar`;
	avatarImg.classList.add('avatar-image');
	avatarDiv.appendChild(avatarImg);

	const playerInfo = document.createElement('div');
	playerInfo.classList.add('player-info');

	const usernameHeading = document.createElement('h3');
	usernameHeading.textContent = window.userData.username;
	playerInfo.appendChild(usernameHeading);

	const levelParagraph = document.createElement('p');
		levelParagraph.textContent = `Level ${Math.floor(window.userData.bar_exp_game1 / 1000)}:`;
		playerInfo.appendChild(levelParagraph);

	const expBarContainer = document.createElement('div');
	expBarContainer.classList.add('exp-bar-container');

	const expBar = document.createElement('div');
	expBar.classList.add('exp-bar');
	expBar.style.width = `${((window.userData.bar_exp_game1 % 1000) / 10).toFixed(0)}%`;
	expBarContainer.appendChild(expBar);
	playerInfo.appendChild(expBarContainer);

	const winLossParagraph = document.createElement('p');
	winLossParagraph.textContent = `W/L: ${gameLogs.Wins}-${gameLogs.Losses}`;
	playerInfo.appendChild(winLossParagraph);
	const winrateBarContainer = document.createElement('div');
	winrateBarContainer.classList.add('winrate-bar-container');

	const winrateBar = document.createElement('div');
	winrateBar.classList.add('winrate-bar');
	winrateBar.style.width = `${getWinPercentage(gameLogs.Wins, gameLogs.Losses)}%`;
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
	mod = modal;
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
	acceptButton.id = 'queue-accept-button' + window.userData.id;
	acceptButton.className = 'queue-btn-modal queue-accept';
	acceptButton.innerText = 'Accept';
	buttonContainer.appendChild(acceptButton);
 
	const refuseButton = document.createElement('button');
	refuseButton.id = 'queue-refuse-button' + window.userData.id;
	refuseButton.className = 'queue-btn-modal queue-refuse';
	refuseButton.innerText = 'Decline';
	buttonContainer.appendChild(refuseButton);
 
	modalContent.appendChild(buttonContainer);
 
	modal.appendChild(modalContent);
 
	gContainer.appendChild(modal);
 
	modal.style.display = 'flex';
 
	acceptButton.onclick = function () {
		acceptButton.disabled = true;
		refuseButton.disabled = true;
		acceptButton.classList.add('grayed-out');
		refuseButton.classList.add('grayed-out');
		sendQueueStatus(true);
	};
 
	refuseButton.onclick = function () {
		acceptButton.disabled = true;
		refuseButton.disabled = true;
		acceptButton.classList.add('grayed-out');
		refuseButton.classList.add('grayed-out');

		sendQueueStatus(false);
		navigateTo('profile', null);
	};
 
	window.onclick = function (event) {
		if (event.target == modal) {
			modal.style.display = 'none';
			modal.remove();
			sendQueueStatus(false);
			navigateTo('profile', null);
		}
	};
	setTimeout(function () {
		if(!hebssmodal) {
			console.log('slm'); // hna make sure hebssmodal tweli false
			sendQueueStatus(false);
			navigateTo('profile', null);
			modal.remove();
			modal.style.display = 'none';
		}
	}, 10000);
	// display countdiown on modal
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
		const gameSocket = new WebSocket(`wss://${u.host}/ws/game/${data['room_name']}/?token=${accessToken}`);
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

export async function sendQueueStatus(accept, flag=null) {
	if (window.userData.pong_socket) {
		if (flag) {

			window.userData.pong_socket.send(JSON.stringify({
				action: 'game_start',
			}));
			return ;
		}
		window.userData.pong_socket.send(JSON.stringify({
			action: 'queue_status',
			state: accept,
			player: window.userData.username
		}));
  }
}