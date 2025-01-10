import { handleSend } from "./chat.js";
import { getRoomName , startGameSocket} from "./gameSystem.js";
import { removeGscreen } from "./gamePvP.js";
const baseUrl = process.env.ACTIVE_HOST;
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const can = document.getElementById('pongCanvas');
const Instructions = document.getElementById('Instructions-box');
const Tlobby = document.getElementById('pong-tournament');
const menu = document.getElementById('menuuu');
const  carousel = document.getElementById('bracket-container');
const tourniLobby = document.getElementById('tournament');


tourniLobby.addEventListener('click', async function (event) {
	if (window.userData['guest'] === true) {
		Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
		return ;
  }
	menu.style.display = 'none';
	ai_menu.style.display = 'none';
	inv_menu.style.display = 'none';
	Instructions.style.display = 'none';
	Tlobby.style.display = 'block';
	var TourniPlayers = [{
		"avatar": window.userData.avatar,
		"username": window.userData.username,
		"ready":false,
	}];
  	displayTourniLobby(lobbySettings, TourniPlayers, window.userData.username);
});

let readyPlayers = 0;
const Tcontainer = document.getElementById('tournament-cards');
const lobbyNameElement = document.getElementById('tournament-name');

export function displayTourniLobby(lobbysettings, TourniPlayers, owner=null) {
	window.userData.tournoi = {
		"players": TourniPlayers,
		"owner": owner,
		"Slobby": lobbysettings,
		"in": false,
		"out": false,
		"games_won": 0,
	};
	window.userData.tournoi.in = true;
	Tcontainer.innerHTML = '';
	lobbyNameElement.innerHTML = `
		<div class="map">Map:   ${lobbysettings.map}</div>
		<h1>Tournament</h1>
		<div class="mode">Mode:   ${lobbysettings.mode}</div>
	`;
	for (let i = 0; i < 4; i++) {
		let player = TourniPlayers[i];
		let playerContainer = document.createElement('div');
		playerContainer.classList.add('pong-tournament-players');
		if (player) {
			playerContainer.id = player.username;
			let avatarContainer = document.createElement('div');
			avatarContainer.classList.add('avatarT');
			let playerAvatar = document.createElement('img');
			playerAvatar.classList.add('avatar-imageT');
			playerAvatar.src = player.avatar;
			playerAvatar.alt = player.username;
			let infoContainer = document.createElement('div');
			infoContainer.classList.add('player-infoT');
			let playerHeader = document.createElement('h3');
			playerHeader.textContent = player.username;
			let playerButton = document.createElement('button');
			playerButton.textContent = 'Not Ready';
			playerButton.type = 'button';
			playerButton.id = 'ready-button-' + player.username;
			playerButton.classList.add('btn', 'btn-readyT');
			if (player.ready) {
				readyPlayers++;
				playerButton.classList.add('ready');
				playerButton.textContent = 'Ready!';
			}
			playerButton.addEventListener('click', function () {
			const username = playerButton.id.split('-').pop();
			if (username === window.userData.username && TourniPlayers.length === 4) {
				if (playerButton.classList.contains('ready')) {
					readyPlayers--;
					playerButton.classList.remove('ready');
					playerButton.textContent = 'Not Ready';
					player.ready = false;
				} else {
					readyPlayers++;
					playerButton.classList.add('ready');
					playerButton.textContent = 'Ready!';
					player.ready = true;
				}
				handleSend(null, lobbysettings, 'TNotification', null, TourniPlayers, owner);
			}
			});

			avatarContainer.appendChild(playerAvatar);
			playerContainer.appendChild(avatarContainer);
			infoContainer.appendChild(playerHeader);
			playerContainer.appendChild(infoContainer);
			playerContainer.appendChild(playerButton);
		} else {
			let modalOverlay = document.createElement('div');
			modalOverlay.id = 'modal-overlay' + i;
			modalOverlay.className = 'modal-overlay';
			modalOverlay.style.display = 'none';
			
			let pongPC = document.createElement('div');
			pongPC.id = 'pong-p-c';
			
			
			let pongModal = document.createElement('div');
			pongModal.id = 'pong-modal-' + i;
			pongModal.className = 'search-modal' + i;
			pongModal.style.display = 'none';
			
			let plusBtn = document.createElement('div');
			plusBtn.className = 'plus-btnT';
			plusBtn.id = 'modal' + i;
			plusBtn.textContent = '+';
			plusBtn.addEventListener('click', function (e) {
				if (window.userData.username === owner) {
					e.preventDefault();
					let modal = 'pong-modal-' + i;
					let doc = document.getElementById(modal);
					let overlay = 'modal-overlay' + i;
					let docs = document.getElementById(overlay);
					doc.style.display = 'block';
				}
			})

			let modalContent = document.createElement('div');
			modalContent.className = 'search-modal-content';
			
			let modalTitle = document.createElement('h2');
			modalTitle.textContent = 'Search for Player';
			modalTitle.style.color = '#ffcc00';
			modalTitle.style.textAlign = 'center';
			
			let searchInput = document.createElement('input');
			searchInput.type = 'text';
			searchInput.placeholder = 'Enter player name...';
			searchInput.id = 'search-input' + i;
			
			let buttonContainer = document.createElement('div');
			buttonContainer.className = 'search-modal-buttons';
			
			let closeButton = document.createElement('button');
			closeButton.id = 'modal-close-' + i;
			closeButton.className = 'modal-btn';
			closeButton.textContent = 'Close';
			closeButton.addEventListener('click', function (e) {
				e.preventDefault();
				let modal = 'pong-modal-' + i;
				let doc = document.getElementById(modal);
				let overlay = 'modal-overlay' + i;
				let docs = document.getElementById(overlay);
				doc.style.display = 'none';
				docs.style.display = 'none';
			});
			
			let submitButton = document.createElement('button');
			if (player?.username) {
				submitButton.id = 'search-' + player.username;
			}
			submitButton.className = 'modal-btn';
			submitButton.textContent = 'Submit';
			
			buttonContainer.appendChild(closeButton);
			buttonContainer.appendChild(submitButton);
			
			modalContent.appendChild(modalTitle);
			modalContent.appendChild(searchInput);
			modalContent.appendChild(buttonContainer);
			
			pongModal.appendChild(modalContent);
			
			pongPC.appendChild(plusBtn);
			pongPC.appendChild(pongModal);

			playerContainer.appendChild(modalOverlay);
			playerContainer.appendChild(pongPC);

			submitButton.addEventListener('click', function ()  {
				if (window.userData.socket) {
					handleSend(searchInput.value , lobbysettings, 'TNotification', null, TourniPlayers, owner);
					Notification('Game Action', 'You Have Successfuly Sent A Tournament Game Invitation!', 2, 'invite');
				}
				else {
					Notification('Game Action', "Failed To Send Tournament Game Invitation, Please Log Out And Log Back In!", 2, 'alert');
				}				
			});
		}
		Tcontainer.appendChild(playerContainer);
	}
	if (TourniPlayers.length === 4){
		let a = 0;
		for (let i =0;i < 4;i++) {
			if (TourniPlayers[i]?.ready && TourniPlayers[i].ready === true) {
				a++;
			}
		}
		if (a === 4) {
			checkReadyStatus(TourniPlayers, lobbysettings);
		}
	}
}

function checkReadyStatus(TourniPlayers, Slobby) {
	if (window.userData.username === TourniPlayers[0].username) {
		let shuffledPlayers = [...TourniPlayers].sort(() => 0.5 - Math.random());
		let matchups = [];
		
		for (let i = 0; i < 4; i += 2) {
			matchups.push([
				shuffledPlayers[i] || { username: shuffledPlayers[i].username, avatar: shuffledPlayers[i].avatar }, 
				shuffledPlayers[i + 1] || { username: shuffledPlayers[i + 1].username, avatar: shuffledPlayers[i + 1].avatar }
			]);
		}
		handleSend(null, Slobby, 'TMatchups', null, matchups, window.userData.username);
	}
};

export async function generateTournamentCarousel(matchups, owner, lobbyS) {
	Tcontainer.style.display = 'none';
	lobbyNameElement.style.display = 'none';
	carousel.style.display = 'flex';
	removeGscreen();
	const carouselInner = document.querySelector('#matchupCarousel .carousel-inner');
	carouselInner.innerHTML = '';
	window.userData.tournoi.in = false;
	window.userData.tournoi.out = true;

	const countdownElement = document.createElement('div');
	countdownElement.id = 'countdown';
	countdownElement.style.position = 'absolute';
	countdownElement.style.top = '10px';
	countdownElement.style.right = '10px';
	countdownElement.style.fontSize = '24px';
	countdownElement.style.color = '#ffffff';
	countdownElement.style.backgroundColor = '#000000';
	countdownElement.style.padding = '10px';
	countdownElement.style.borderRadius = '5px';
	carousel.appendChild(countdownElement);

	let countdownValue = 10;
	countdownElement.innerHTML = `Starting in: ${countdownValue}s`;

	const countdownInterval = setInterval(() => {
	    countdownValue--;
	    countdownElement.innerHTML = `Starting in: ${countdownValue}s`;
	
	    if (countdownValue === 0) {
	        clearInterval(countdownInterval);
	        countdownElement.style.display = 'none';
	    }
	}, 1000); 
	matchups.forEach((matchup, index) => {
		const carouselItem = document.createElement('div');
		carouselItem.classList.add('carousel-item');
		if (index === 0) carouselItem.classList.add('active'); 
		
		const matchupContainer = document.createElement('div');
		matchupContainer.classList.add('matchup-container', 'd-flex', 'justify-content-around', 'align-items-center', 'p-4');

		const player1Div = document.createElement('div');
		player1Div.classList.add('player');
		player1Div.innerHTML = `
			<img src="${matchup[0].avatar}" class="avatar img-fluid rounded-circle mb-2" alt="Player 1 Avatar">
			<p class="username">${matchup[0].username}</p>
		`;
		const player2Div = document.createElement('div');
		player2Div.classList.add('player');
		player2Div.innerHTML = `
		<img src="${matchup[1].avatar}" class="avatar img-fluid rounded-circle mb-2" alt="Player 2 Avatar">
		<p class="username">${matchup[1].username}</p>
		`;
		
		matchupContainer.appendChild(player1Div);
		
		const versusDiv = document.createElement('div');
		versusDiv.classList.add('versus');
		versusDiv.innerHTML = '<h3>VS</h3>';
		
		matchupContainer.appendChild(versusDiv); 
		matchupContainer.appendChild(player2Div);
		carouselItem.appendChild(matchupContainer);
		carouselInner.appendChild(carouselItem);
	});
	setTimeout(async () => {
		for (const matchup of matchups) {
			carousel.style.display = 'none';
			clearInterval(countdownInterval);
			if (matchup[0].username === window.userData.username) {
				try {
					const res = await getRoomName();
					const room_name = 'tournoi_' + res.room_name;
					sendTRoomName(room_name, matchup, lobbyS);
				} catch (error) {
					Notification('Game Action', `Something went wrong; please relog! error: ${error.detail}`, 2, 'alert');
				}
				break;
			}
		}
	}, 10000);
}


export function sendTRoomName(room_name, matchup, lobbyS=null) {
	const users = {
		'player1':matchup[0].username,
		'player2':matchup[1].username,
	}

	window.userData.socket.send(JSON.stringify({action:'TournoiRoom', room_name:room_name, Slobby:lobbyS, players:users}));
}

export function sendTGameResult(winner, loser, players) {
	players.forEach(player => {
		if (player.username === winner) {
			player.result = "WIN";
		} else if (player.username === loser) {
			player.result = 'LOST';
		}
	});
	window.userData.socket.send(JSON.stringify({action:'TournoiGameRes', players:players}));
}