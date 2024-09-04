document.addEventListener('DOMContentLoaded', function () {

	const mainSLgame = document.getElementById('S&L-page');
	const SLButton = document.getElementById('S&L-play');

	SLButton.addEventListener('click', function() {
		makeboard();

	});
});

function makeboard() {

	const board = document.getElementById('game-board');
	for (let i = 0; i < 16 * 16; i++) {
		const tiles = document.createElement('div');
		tiles.classList.add('tile');
		board.appendChild(tiles); 
	}
}
