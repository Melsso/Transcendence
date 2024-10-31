const qContainer = document.getElementById('Queue');
const qBtn = document.getElementById('matchmaking');
const qName = document.getElementById('q-name');
const lo = document.getElementById('1v1');
const menu = document.getElementById('menuuu');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const lobby = document.getElementById('pong-inv-container');
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
	spinnerContainer.classList.add('text-center', 'mt-4');

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
});
