// const inv_menu = document.getElementById('inv-menu');
// const ai_menu = document.getElementById('ai-menu');
// const Instructions = document.getElementById('Instructions-box');
const Tlobby = document.getElementById('pong-tournament');
// const menu = document.getElementById('menuuu');
const tourniLobby = document.getElementById('tournament');

const gamer2Template = {
	username: "Player 1",
	avatar: "assets/avatar2.svg",
	wins: '3',
	losses: '0',
	level: '7.34'
};

const gamers = Array(1).fill().map(() => ({ ...gamer2Template }));

document.getElementById('PONG-button').addEventListener('click', function () {
	const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
	const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
	lobbysettings = {
		 mode: gameMode,
		 map: selectedMap
	};
	
});

tourniLobby.addEventListener('click', function () {
	menu.style.display = 'none';
	ai_menu.style.display = 'none';
	inv_menu.style.display = 'none';
	Instructions.style.display = 'none';
	Tlobby.style.display = 'block';
	displayTourniLobby(lobbysettings, gamers);
});

function displayTourniLobby(lobbysettings, TourniPlayers) {
	const Tcontainer = document.getElementById('tournament-cards');
	const lobbyNameElement = document.getElementById('tournament-name');
	lobbyNameElement.innerHTML = `
		<div class="map">Map:   ${lobbysettings.map}</div>
		<h1>Tournament</h1>
		<div class="mode">Mode:   ${lobbysettings.mode}</div>
	`;
	for (let i = 0; i < 8; i++) {
		let player = TourniPlayers[i];

		let playerContainer = document.createElement('div');
		playerContainer.classList.add('pong-tournament-players');
		
		// If player data is available, fill it in; otherwise, create an empty slot
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
						playerButton.classList.remove('ready');
						playerButton.textContent = 'Not Ready';
				  } else {
						playerButton.classList.add('ready');
						playerButton.textContent = 'Ready!';
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
			plusBtn.addEventListener('click', function () {
				let modal = 'pong-modal-' + i;
				let doc = document.getElementById(modal);
				let overlay = 'modal-overlay' + i;
				let docs = document.getElementById(overlay);
				doc.style.display = 'block';
				// docs.style.display = 'block';
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
			// submitButton.addEventListener('click', submitInvite);
			
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