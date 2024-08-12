function fillSidebarWithSquares(sidebarId) {
	const sidebar = document.getElementById(sidebarId);
	const sidebarHeight = sidebar.clientHeight;
	const sidebarWidth = sidebar.clientWidth;
	const squareSize = 40;
	const cols = Math.floor(sidebarWidth / squareSize);
	const rows = Math.floor(sidebarHeight / squareSize);
	const totalSquares = cols * rows;

	for (let i = 0; i < totalSquares; i++) {
		 const square = document.createElement('div');
		 square.classList.add('square');
		 const randomDelay = Math.random() * 2;
		 square.style.setProperty('--delay', `${randomDelay}s`);
		 sidebar.appendChild(square);
	}
}

function setupButtonClick(sidebarId, buttonId) {
	const sidebar = document.getElementById(sidebarId);
	const button = document.getElementById(buttonId);
	
	button.addEventListener('click', () => {
		 sidebar.classList.toggle('hide');
	});
}

fillSidebarWithSquares('leftSidebar');
fillSidebarWithSquares('rightSidebar');

setupButtonClick('leftSidebar', 'hideLeftButton');
setupButtonClick('rightSidebar', 'hideRightButton');

window.addEventListener('resize', () => {
	document.getElementById('leftSidebar').innerHTML = '';
	document.getElementById('rightSidebar').innerHTML = '';
	fillSidebarWithSquares('leftSidebar');
	fillSidebarWithSquares('rightSidebar');
});
