import { handleSend } from "./chat.js";

const baseUrl = process.env.ACTIVE_HOST;
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const can = document.getElementById('pongCanvas');
const Instructions = document.getElementById('Instructions-box');
const Tlobby = document.getElementById('pong-tournament');
const menu = document.getElementById('menuuu');
const  carousel = document.getElementById('bracket-container');
const tourniLobby = document.getElementById('tournament');

async function getTournamentName() {
	const access_token = localStorage.getItem('accessToken');
    if (!access_token) {
        Notification();
        return ;
    }

    const url = baseUrl + 'api/games/create-tournament-room/';
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const errorResponse = await response.json();
        throw errorResponse;
    }
    const data = await response.json();
    return data;
}

export async function startTournamentSocket() {
	window.userData.pong_socket.onopen = function(e) {
		console.log("TOURNAMENTSOCKET-ON");
	}
	window.userData.pong_socket.onclose = function(e) {
		console.log("TOURNAMENTSOCKET-OFF");
		Tlobby.style.display = 'none';
	}
	window.userData.pong_socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.action == 'update_game_state') {
			gameState = data.gameState;
		} else if (data.action === 'current_players') {
			menu.style.display = 'none';
			ai_menu.style.display = 'none';
			inv_menu.style.display = 'none';
			Instructions.style.display = 'none';
			Tlobby.style.display = 'block';
			displayTourniLobby(lobbySettings, data.players, data.owner);
		} else if (data.action === 'match_randomized') {
			generateTournamentCarousel(data.players);
		}
	}
}

function sendGameStatus(username, ready) {
	if (window.userData.pong_socket) {
		const stateData = {
			'username': username,
			'ready': ready,
		}
		window.userData.pong_socket.send(JSON.stringify({
			action: 'player_action',
			state: stateData,
		}));
	} else {
		return ;
		// here have to handle the error or rather changing view this shouldnt be reached in anycase anyway
	}
}

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
		const result = await getTournamentName();
		window.userData.r_name = result.tournament_room_name;
		const u = new URL(baseUrl);
		const screenHeight = can.clientHeight;
		const screenWidth = can.clientWidth;
		window.userData.pong_socket = new WebSocket(`ws://${u.host}/ws/tournament/${result['tournament_room_name']}/?token=${accessToken}&width=${screenWidth}&height=${screenHeight}`);
		startTournamentSocket();
	} catch(error) {
		Notification('Game Action', `Error: ${error.detail}`, 2, 'alert');
		window.userData.r_name = null;
        if (window.userData.pong_socket) {
            window.userData.pong_socket.close();
        }
        window.userData.pong_socket = null;
        return ;
	}
});

let readyPlayers = 0;
const Tcontainer = document.getElementById('tournament-cards');
const lobbyNameElement = document.getElementById('tournament-name');

function displayTourniLobby(lobbysettings, TourniPlayers, owner) {
	Tcontainer.innerHTML = '';
	lobbyNameElement.innerHTML = `
		<div class="map">Map:   ${lobbysettings.map}</div>
		<h1>Tournament</h1>
		<div class="mode">Mode:   ${lobbysettings.mode}</div>
	`;
	for (let i = 0; i < 8; i++) {
		let player = TourniPlayers[i];
		let gameMaster;
		if (owner === null) {
			gameMaster = owner;
		} else {
			gameMaster = owner;
		}
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
			if (username === window.userData.username && TourniPlayers.length === 8) {
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
				sendGameStatus(player.username, player.ready);
				// checkReadyStatus(TourniPlayers);
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
					if (window.userData.pong_socket) {
						handleSend(searchInput.value , window.userData.r_name, 'Notification');
						Notification('Game Action', 'You Have Successfuly Sent A Game Invitation!', 2, 'invite');
					}
					else {
						Notification('Game Action', 'You Are Not In A Lobby! Join A Lobby First!', 2, 'alert');
					}
				}
				else {
					Notification('Game Action', "Failed To Send Game Invitation, Please Log Out And Log Back In!", 2, 'alert');
				}				
			});
		}

		Tcontainer.appendChild(playerContainer);
	}
	if (TourniPlayers.length === 8){
		let a = 0;
		for (let i =0;i < 8;i++) {
			if (TourniPlayers[i]?.ready && TourniPlayers[i].ready === true) {
				a++;
			}
		}
		if (a === 8) {
			checkReadyStatus(TourniPlayers);
		}
	}
}

function sendMatchups(matchups) {
	if (window.userData.pong_socket) {
		window.userData.pong_socket.send(JSON.stringify({
			action: 'match_making',
			matchups: matchups,		
		}));
  }
}

function checkReadyStatus(TourniPlayers) {
	if (window.userData.username === TourniPlayers[0].username) {
		let shuffledPlayers = [...TourniPlayers].sort(() => 0.5 - Math.random());
		let matchups = [];
		
		for (let i = 0; i < 8; i += 2) {
			matchups.push([
				shuffledPlayers[i] || { username: '?', avatar: 'placeholder.png' }, 
				shuffledPlayers[i + 1] || { username: '?', avatar: 'placeholder.png' }
			]);
		}
		sendMatchups(matchups);
	}
	Tcontainer.style.display = 'none';
	lobbyNameElement.style.display = 'none';
	carousel.style.display = 'flex';
	// generateTournamentCarousel(TourniPlayers, matchups);
};

function generateTournamentCarousel(matchups) {

	const carouselInner = document.querySelector('#matchupCarousel .carousel-inner');
	carouselInner.innerHTML = '';

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
}