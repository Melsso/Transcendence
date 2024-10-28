import Chart from 'chart.js/auto';
const baseUrl = process.env.ACTIVE_HOST;
let pvpChart;
let pveChart;

function createChart(ctx, label, data, chartType) {
	if (pvpChart && chartType === 'pvp') {
        pvpChart.destroy();
    }
    if (pveChart && chartType === 'pve') {
        pveChart.destroy();
    }
    const myChart = new Chart(ctx, {
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
    if (chartType === 'pve') {
        pveChart = myChart;
    } else {
        pvpChart = myChart;
    }
}


export async function getMatchHistory(uname) {
    const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}
    let url = baseUrl + `api/games/match-history/`;
    if (uname) {
        url = baseUrl + `api/games/match-history/${uname}/`;
    }
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

export async function loadProfile(requestData) {
    if (requestData && 'user' in requestData) {
        const user = requestData['user'];
        loadProfileInfo(user);
    }
    else {
        // Do something else relevant here, probably redirect refretch or smth
        console.error("Error: No User Data Found!");
    }

    try {
        let result;
        if (requestData && 'friends' in requestData) {
            result = await getMatchHistory();
            window.userData['match_history'] = result['match_history'];
        }
        else {
            result = await getMatchHistory(requestData.user.username);
        }
        loadMatchHistory(result['match_history']);
    } catch (error) {
        Notification('Profile Action', `Failed To Get Match History: ${error}`, 2, 'alert');
    }  
}

const statspage = document.getElementById('stats-tab');
statspage.addEventListener('click', function (event) {
    event.preventDefault();
    if (statspage.getAttribute('aria-selected') === 'true' && statspage.getAttribute('on') === 'true') {
        return ;
    }
    const historyTab = document.getElementById('History');
    statspage.setAttribute('on', 'true');
    historyTab.setAttribute('on', 'false');
}, { once: true });

function loadProfileInfo(user) {
    const profileUsername = document.getElementById('username');
    const avatarElement = document.getElementById('profile-avatar');
    const bio = document.getElementById('profile-bio');
    const expBar1 = document.getElementById('exp-pong');
    const expText1 = document.getElementById('exp-txt');
    
    profileUsername.textContent = user.username;
    profileUsername.setAttribute('user_id', user.id);

    avatarElement.style.backgroundImage = `url(${user.avatar})`;

    bio.textContent = user.biography;

    const expGame1Percentage = Math.max((user.bar_exp_game1 % 1000) / 10, 1);
    
    const levelGame1 = Math.floor(user.bar_exp_game1 / 1000);

    expBar1.style.width = `${expGame1Percentage}%`;
    expText1.textContent = `Game 1 - Level ${levelGame1}`;
    expBar1.setAttribute('aria-valuenow', expGame1Percentage);

}

export function computeStats(games) {
    let stats = {
        pveWins: 0,
        pveLosses: 0,
        pvpWins: 0,
        pvpLosses: 0,
        mapStatistics: {
            'Map1': { wins: 0, losses: 0 },
            'Map2': { wins: 0, losses: 0 },
            'Map3': { wins: 0, losses: 0 },
        },
        pveWinLossData: {
            games: [],
            wins: []
        },
        pvpWinLossData: {
            games: [],
            wins: []
        }
    };

    let gameCount = 0;

    games.forEach(game => {
        const gameKey = Object.keys(game)[0];
        const { ally, enemy } = game[gameKey];
        const isPve = enemy.user.username === 'ai';
        if (ally.game_type !== 'pong') {
            return ;
        }
        gameCount++;
        if (ally.is_win) {
            if (isPve) {
                stats.pveWins++;
                stats.pveWinLossData.wins.push((stats.pveWinLossData.wins.length > 0 ? stats.pveWinLossData.wins[stats.pveWinLossData.wins.length - 1] : 0) + 1);
            } else {
                stats.pvpWins++;
                stats.pvpWinLossData.wins.push((stats.pvpWinLossData.wins.length > 0 ? stats.pvpWinLossData.wins[stats.pvpWinLossData.wins.length - 1] : 0) + 1);
            }
        } else {
            if (isPve) {
                stats.pveLosses++;
                stats.pveWinLossData.wins.push(stats.pveWinLossData.wins.length > 0 ? stats.pveWinLossData.wins[stats.pveWinLossData.wins.length - 1] : 0);
            } else {
                stats.pvpLosses++;
                stats.pvpWinLossData.wins.push(stats.pvpWinLossData.wins.length > 0 ? stats.pvpWinLossData.wins[stats.pvpWinLossData.wins.length - 1] : 0);
            }
        }
        if (isPve) {
            stats.pveWinLossData.games.push(gameCount);
        } else {
            stats.pvpWinLossData.games.push(gameCount);
        }
        stats.mapStatistics[ally.map_name].wins += ally.is_win ? 1 : 0;
        stats.mapStatistics[ally.map_name].losses += ally.is_win ? 0 : 1;
    });

    return stats;
}

function loadStats(games) {
    const stats = computeStats(games);
    
    const pveWinRate = stats.pveWins + stats.pveLosses > 0 ? (stats.pveWins / (stats.pveWins + stats.pveLosses)) * 100 : 0;
    const pvpWinRate = stats.pvpWins + stats.pvpLosses > 0 ? (stats.pvpWins / (stats.pvpWins + stats.pvpLosses)) * 100 : 0;
    const totalWins = stats.pveWins + stats.pvpWins;
    const totalLosses= stats.pveLosses + stats.pvpLosses;
    const totalWinRate = totalWins + totalLosses > 0 ? (totalWins / (totalWins + totalLosses)) * 100 : 0;
    const attack1Accuracy = 70;
    const attack2Accuracy = 65;
    const map1WinRate = stats.mapStatistics['Map1'].wins + stats.mapStatistics['Map1'].losses > 0
        ? (stats.mapStatistics['Map1'].wins / (stats.mapStatistics['Map1'].wins + stats.mapStatistics['Map1'].losses)) * 100 : 0;
    const map2WinRate = stats.mapStatistics['Map2'].wins + stats.mapStatistics['Map2'].losses > 0
        ? (stats.mapStatistics['Map2'].wins / (stats.mapStatistics['Map2'].wins + stats.mapStatistics['Map2'].losses)) * 100 : 0;
    const map3WinRate = stats.mapStatistics['Map3'].wins + stats.mapStatistics['Map3'].losses > 0
        ? (stats.mapStatistics['Map3'].wins / (stats.mapStatistics['Map3'].wins + stats.mapStatistics['Map3'].losses)) * 100 : 0;
    
    const pveWinrateElem = document.getElementById('pve-winrate');
    pveWinrateElem.style.width = pveWinRate + '%';
    pveWinrateElem.textContent = pveWinRate + '%';
    document.querySelectorAll('.win-loss')[0].innerHTML = `Wins: ${stats.pveWins} | Losses: ${stats.pveLosses}`;

    const pvpWinrateElem = document.getElementById('pvp-winrate');
	pvpWinrateElem.style.width = pvpWinRate + '%';
	pvpWinrateElem.textContent = pvpWinRate + '%';
	document.querySelectorAll('.win-loss')[1].innerHTML = `Wins: ${stats.pvpWins} | Losses: ${stats.pvpLosses}`;

    const avgSuccessHistoryElem = document.getElementById('avg-success-history');
	avgSuccessHistoryElem.style.width = totalWinRate + '%';
	avgSuccessHistoryElem.textContent = totalWinRate + '%';

    const attack1AccuracyElem = document.getElementById('attack1-accuracy');
	attack1AccuracyElem.style.width = attack1Accuracy + '%';
	attack1AccuracyElem.textContent = attack1Accuracy + '%';

    const attack2AccuracyElem = document.getElementById('attack2-accuracy');
	attack2AccuracyElem.style.width = attack2Accuracy + '%';
	attack2AccuracyElem.textContent = attack2Accuracy + '%';

    const map1WinrateElem = document.getElementById('map1-winrate');
	map1WinrateElem.style.width = map1WinRate + '%';
	map1WinrateElem.textContent = map1WinRate + '%';

	const map2WinrateElem = document.getElementById('map2-winrate');
	map2WinrateElem.style.width = map2WinRate + '%';
	map2WinrateElem.textContent = map2WinRate + '%';

	const map3WinrateElem = document.getElementById('map3-winrate');
	map3WinrateElem.style.width = map3WinRate + '%';
	map3WinrateElem.textContent = map3WinRate + '%';

    const mostUsedPowerupElem = document.getElementById('most-used-powerup');
	mostUsedPowerupElem.style.width = 80 + '%';
	mostUsedPowerupElem.textContent = "Bullet";

	createChart(document.getElementById('winLossChartPVE').getContext('2d'), 'PvE Win-Loss', stats.pveWinLossData, 'pve');
	createChart(document.getElementById('winLossChartPVP').getContext('2d'), 'PvP Win-Loss', stats.pvpWinLossData, 'pvp');
}

export function loadMatchHistory(games) {
    const historyTab = document.getElementById('History');
    const matchHistoryContainer = document.querySelector('.match-history-container');
    historyTab.addEventListener('click', function (event) {
        event.preventDefault();
        if (historyTab.getAttribute('aria-selected') === 'true' && historyTab.getAttribute('on') === 'true') {
            return ;
        } else {
            historyTab.setAttribute('on', 'true');
            statspage.setAttribute('on', 'false');
            matchHistoryContainer.innerHTML = '';
            try {
                loadMatchHistory(games);
                return ;
            } catch (error) {
                Notification('Profile Action', `Failed To Get Match History: ${error}`, 2, 'alert');
            }
        }
	}, { once: true });

    loadStats(games);

    matchHistoryContainer.innerHTML = '';
    if (games.length === 0) {
        const para = document.createElement('p');
        para.textContent = 'No Match Played!';
        matchHistoryContainer.appendChild(para);
        return ;
    }
    games.forEach(game => {
        const matchCard = document.createElement('div');
        matchCard.classList.add('match-card');

        const gameKey = Object.keys(game)[0];
        const {ally, enemy} = game[gameKey];

        if (!ally.is_win) {
            matchCard.classList.add('lost');
        }

        matchCard.innerHTML = `
        <div class="player player-left">
            <img src="${ally.user.avatar}" alt="Avatar of ${ally.user.username}">
            <div class="player-info-2">
                <div>${ally.user.username}</div>
                <div class="game-name">${ally.game_id}</div>
            </div>
        </div>
        <div class="score">${ally.score}-${enemy.score}</div>
        <div class="player player-right">
            <img src="${enemy.user.avatar}" alt="Avatar of ${enemy.user.username}">
            <div class="player-info-2">
                <div>${enemy.user.username}</div>
                <div class="game-name">${enemy.game_id}</div>
            </div>
        </div>
    `;
        matchHistoryContainer.appendChild(matchCard);
    });
}