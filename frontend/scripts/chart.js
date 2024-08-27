const statsData = {
	"pveWinrate": 75,
	"pveWins": 15,
	"pveLosses": 5,
	"pvpWinrate": 60,
	"pvpWins": 12,
	"pvpLosses": 8,
	"avgSuccessHistory": 85,
	"attack1Accuracy": 70,
	"attack2Accuracy": 65,
	"mapWinrates": {
		 "map1": 50,
		 "map2": 40,
		 "map3": 55
	},
	"mostUsedPowerup": {
		 "name": "Shield",
		 "percentage": 80
	},
	"pveWinLossData": {
		 "games": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		 "wins": [1, 1, 2, 2, 3, 3, 4, 5, 5, 6]
	},
	"pvpWinLossData": {
		 "games": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
		 "wins": [1, 2, 2, 3, 3, 3, 4, 4, 5, 6]
	}
};

function populateStats(data) {
	const pveWinrateElem = document.getElementById('pve-winrate');
	pveWinrateElem.style.width = data.pveWinrate + '%';
	pveWinrateElem.textContent = data.pveWinrate + '%';
	document.querySelectorAll('.win-loss')[0].innerHTML = `Wins: ${data.pveWins} | Losses: ${data.pveLosses}`;
	
	const pvpWinrateElem = document.getElementById('pvp-winrate');
	pvpWinrateElem.style.width = data.pvpWinrate + '%';
	pvpWinrateElem.textContent = data.pvpWinrate + '%';
	document.querySelectorAll('.win-loss')[1].innerHTML = `Wins: ${data.pvpWins} | Losses: ${data.pvpLosses}`;
	
	const avgSuccessHistoryElem = document.getElementById('avg-success-history');
	avgSuccessHistoryElem.style.width = data.avgSuccessHistory + '%';
	avgSuccessHistoryElem.textContent = data.avgSuccessHistory + '%';

	const attack1AccuracyElem = document.getElementById('attack1-accuracy');
	attack1AccuracyElem.style.width = data.attack1Accuracy + '%';
	attack1AccuracyElem.textContent = data.attack1Accuracy + '%';

	const attack2AccuracyElem = document.getElementById('attack2-accuracy');
	attack2AccuracyElem.style.width = data.attack2Accuracy + '%';
	attack2AccuracyElem.textContent = data.attack2Accuracy + '%';

	const map1WinrateElem = document.getElementById('map1-winrate');
	map1WinrateElem.style.width = data.mapWinrates.map1 + '%';
	map1WinrateElem.textContent = data.mapWinrates.map1 + '%';

	const map2WinrateElem = document.getElementById('map2-winrate');
	map2WinrateElem.style.width = data.mapWinrates.map2 + '%';
	map2WinrateElem.textContent = data.mapWinrates.map2 + '%';

	const map3WinrateElem = document.getElementById('map3-winrate');
	map3WinrateElem.style.width = data.mapWinrates.map3 + '%';
	map3WinrateElem.textContent = data.mapWinrates.map3 + '%';

	const mostUsedPowerupElem = document.getElementById('most-used-powerup');
	mostUsedPowerupElem.style.width = data.mostUsedPowerup.percentage + '%';
	mostUsedPowerupElem.textContent = data.mostUsedPowerup.name;
	
	createChart(document.getElementById('winLossChartPVE').getContext('2d'), 'PvE Win-Loss', data.pveWinLossData);
	createChart(document.getElementById('winLossChartPVP').getContext('2d'), 'PvP Win-Loss', data.pvpWinLossData);
}

function createChart(ctx, label, data) {
	new Chart(ctx, {
		 type: 'line',
		 data: {
			  labels: data.games,
			  datasets: [{
					label: label,
					data: data.wins,
					borderColor: 'rgba(0, 123, 255, 0.8)',
					backgroundColor: 'rgba(0, 123, 255, 0.1)',
					fill: true
			  }]
		 },
		 options: {
			  scales: {
					x: {
						 title: {
							  display: true,
							  text: 'Number of Games'
						 }
					},
					y: {
						 title: {
							  display: true,
							  text: 'Number of Wins'
						 },
						 beginAtZero: true
					}
			  }
		 }
	});
}

document.addEventListener('DOMContentLoaded', function() {
	// fetch('path/to/stats.json')
	// .then(response => response.json())
	// .then(data => populateStats(data))
	// .catch(error => console.error('Error loading stats:', error));
	populateStats(statsData);
});
