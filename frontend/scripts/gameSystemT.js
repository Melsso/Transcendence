const baseUrl = process.env.ACTIVE_HOST;

const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const Tlobby = document.getElementById('pong-tournament');
const menu = document.getElementById('menuuu');
const tourniLobby = document.getElementById('tournament');
let lobbysettings;
const gamer2Template = {
	username: "Player 1",
	avatar: "assets/avatar2.svg",
	wins: '3',
	losses: '0',
	level: '7.34'
};

const gamers = Array(8).fill().map(() => ({ ...gamer2Template }));

document.getElementById('PONG-button').addEventListener('click', function () {
	const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
	const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
	lobbysettings = {
		 mode: gameMode,
		 map: selectedMap
	};
	
});

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
        throw new Error(errorResponse);
    }
    const data = await response.json();
    return data;
}

function startTournamentSocket() {
	window.userData.pong_socket.onopen = function(e) {
		console.log("TOURNAMENTSOCKET-ON");
	}
	window.userData.pong_socket.onclose = function(e) {
		console.log("TOURNAMENTSOCKET-OFF");
	}
	window.userData.pong_socket.onmessage = function(e) {
		const data = JSON.parse(e.data);
		if (data.action == 'update_game_state') {
			gameState = data.gameState;
		} else if (data.action === 'current_players') {
			// adjust some styling here probably
			menu.style.display = 'none';
			ai_menu.style.display = 'none';
			inv_menu.style.display = 'none';
			Instructions.style.display = 'none';
			Tlobby.style.display = 'block';
			console.log('Current players in the room: ', data.players);
			displayTourniLobby(lobbysettings, data.players);
		}
	}
}

tourniLobby.addEventListener('click', async function (event) {
	event.preventDefault();
	// menu.style.display = 'none';
	// ai_menu.style.display = 'none';
	// inv_menu.style.display = 'none';
	// Instructions.style.display = 'none';
	// Tlobby.style.display = 'block';
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
		const u = new URL(baseUrl);
		window.userData.pong_socket = new WebSocket(`ws://${u.host}/ws/tournament/${result['tournament_room_name']}/?token=${accessToken}`);
		window.userData.r_name = result.tournament_room_name;
		// load the socket or smth
		startTournamentSocket();
	} catch(error) {
		Notification('Game Action', `Failed To Create A Tournament: ${error}`, 2, 'alert');
		window.userData.r_name = null;
        if (window.userData.pong_socket) {
            window.userData.pong_socket.close();
        }
        window.userData.pong_socket = null;
        return ;
	}
	// displayTourniLobby(lobbysettings, gamers);
});

let readyPlayers = 0;
const Tcontainer = document.getElementById('tournament-cards');
const lobbyNameElement = document.getElementById('tournament-name');

function displayTourniLobby(lobbysettings, TourniPlayers) {
	lobbyNameElement.innerHTML = `
		<div class="map">Map:   ${lobbysettings.map}</div>
		<h1>Tournament</h1>
		<div class="mode">Mode:   ${lobbysettings.mode}</div>
	`;
	for (let i = 0; i < 8; i++) {
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
			 playerButton.id = player.username + 'ready';
			 playerButton.classList.add('btn', 'btn-readyT');

			 playerButton.addEventListener('click', function () {
				  if (playerButton.classList.contains('ready')) {
						readyPlayers--;
						playerButton.classList.remove('ready');
						playerButton.textContent = 'Not Ready';
				  } else {
						readyPlayers++;
						playerButton.classList.add('ready');
						playerButton.textContent = 'Ready!';
				  }
				  checkReadyStatus(TourniPlayers);
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
			plusBtn.addEventListener('click', function () {
				let modal = 'pong-modal-' + i;
				let doc = document.getElementById(modal);
				let overlay = 'modal-overlay' + i;
				let docs = document.getElementById(overlay);
				doc.style.display = 'block';
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
			closeButton.addEventListener('click', function () {
				let modal = 'pong-modal-' + i;
				let doc = document.getElementById(modal);
				let overlay = 'modal-overlay' + i;
				let docs = document.getElementById(overlay);
				doc.style.display = 'none';
				docs.style.display = 'none';
			});
			
			let submitButton = document.createElement('button');
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
		}

		Tcontainer.appendChild(playerContainer);
	}
	
}
function checkReadyStatus(TourniPlayers) {
	console.log(readyPlayers);
	if (readyPlayers === 1) {
		Tcontainer.style.display = 'none';
		lobbyNameElement.style.display = 'none';
		generateTournamentBracket(TourniPlayers);
	}
};

function generateTournamentBracket(TourniPlayers) {
	let shuffledPlayers = [...TourniPlayers].sort(() => 0.5 - Math.random());
	let matchups = [];
	
	
	for (let i = 0; i < 8; i += 2) {
		 matchups.push([shuffledPlayers[i] || { username: '?' }, shuffledPlayers[i + 1] || { username: '?' }]);
	}

	const bracketContainer = document.getElementById('bracket-container');
	bracketContainer.innerHTML = '';

	const rounds = [
		 matchups,                     
		
		
	];

	
	rounds.forEach((round) => {
		 let roundDiv = document.createElement('div');
		 roundDiv.classList.add('bracket-round');

		 round.forEach((matchup) => {
			  let matchupDiv = document.createElement('div');
			  matchupDiv.classList.add('bracket-matchup');

			  let player1Div = document.createElement('div');
			  player1Div.classList.add('bracket-player');
			  player1Div.textContent = matchup[0] ? matchup[0].username : '?';
			  if (!matchup[0] || matchup[0].username === '?') player1Div.classList.add('placeholder');

			  
			  let versusDiv = document.createElement('div');
			  versusDiv.classList.add('bracket-versus');
			  versusDiv.textContent = 'vs';

			  
			  let player2Div = document.createElement('div');
			  player2Div.classList.add('bracket-player');
			  player2Div.textContent = matchup[1] ? matchup[1].username : '?';
			  if (!matchup[1] || matchup[1].username === '?') player2Div.classList.add('placeholder');

			  matchupDiv.appendChild(player1Div);
			  matchupDiv.appendChild(versusDiv);
			  matchupDiv.appendChild(player2Div);

			  roundDiv.appendChild(matchupDiv);
		 });

		 bracketContainer.appendChild(roundDiv);
	});

	let rounds2 = [
		 Array(2).fill([null, null]), 
	];
	rounds2.forEach(round => {
		let roundDiv = document.createElement('div');
		roundDiv.classList.add('bracket-round-2');
		 round.forEach(matchup => {
			let matchupDiv = document.createElement('div');
			  matchupDiv.classList.add('bracket-matchup');

			  let player1Div = document.createElement('div');
			  player1Div.classList.add('bracket-player');
			  player1Div.textContent = matchup[0] ? matchup[0].username : '?';
			  if (!matchup[0] || matchup[0].username === '?') player1Div.classList.add('placeholder');

			  
			  let versusDiv = document.createElement('div');
			  versusDiv.classList.add('bracket-versus');
			  versusDiv.textContent = 'vs';

			  
			  let player2Div = document.createElement('div');
			  player2Div.classList.add('bracket-player');
			  player2Div.textContent = matchup[1] ? matchup[1].username : '?';
			  if (!matchup[1] || matchup[1].username === '?') player2Div.classList.add('placeholder');
			  matchupDiv.appendChild(player1Div);
			  matchupDiv.appendChild(versusDiv);
			  matchupDiv.appendChild(player2Div);

			  roundDiv.appendChild(matchupDiv);
		 });
		 bracketContainer.appendChild(roundDiv);
	});

	let rounds3 = [
		[[null, null]], 
  ];
  let roundDiv = document.createElement('div');
		roundDiv.classList.add('bracket-round-3');
		rounds3.forEach(matchup => {
			let matchupDiv = document.createElement('div');
			matchupDiv.classList.add('bracket-matchup');
	  
			
			let player1Div = document.createElement('div');
			player1Div.classList.add('bracket-player');
			player1Div.textContent = matchup[0] && matchup[0][0] ? matchup[0][0].username : '?';
			if (!matchup[0] || matchup[0][0] === null) player1Div.classList.add('placeholder');
	  
			
			let versusDiv = document.createElement('div');
			versusDiv.classList.add('bracket-versus');
			versusDiv.textContent = 'vs';
	  
			
			let player2Div = document.createElement('div');
			player2Div.classList.add('bracket-player');
			player2Div.textContent = matchup[0] && matchup[0][1] ? matchup[0][1].username : '?';
			if (!matchup[0] || matchup[0][1] === null) player2Div.classList.add('placeholder');
	  
			
			matchupDiv.appendChild(player1Div);
			matchupDiv.appendChild(versusDiv);
			matchupDiv.appendChild(player2Div);
	  
			
			roundDiv.appendChild(matchupDiv);
	  });
	  
		bracketContainer.appendChild(roundDiv);
}
