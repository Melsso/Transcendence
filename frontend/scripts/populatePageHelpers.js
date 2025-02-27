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
					    text: 'Number Of Games'
					}
				},
				y: {
					title: {
						display: true,
						text: 'Number Of Wins'
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


export async function getMatchHistory(uname=null) {
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
        throw errorResponse;
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
        // this is not enough here do somethign relevant, probably nav to login 
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
        Notification('Profile Action', `Error: ${error}`, 2, 'alert');
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
    const email = document.getElementById('profile-email');
    const expBar1 = document.getElementById('exp-pong');
    const expText1 = document.getElementById('exp-txt');
    const stars = document.querySelectorAll("#tournaments-won-profile .star");
    stars.forEach((star) => {
        star.classList.remove('gold', 'bronze', 'silver', 'platinum', 'diamond');
    });
    
    if (user.t_won > 0) {
        let colorClass = "";
        if (user.t_won <= 10) {
            colorClass = "bronze";
        } else if (user.t_won <= 20) {
            colorClass = "silver";
        } else if (user.t_won <= 30) {
            colorClass = "gold";
        } else if (user.t_won <= 40) {
            colorClass = "platinum";
        } else {
            colorClass = "diamond";
        }
    
        let starsToFill = user.t_won % 10 === 0 ? 10 : user.t_won % 10;
        stars.forEach((star, index) => {
            if (index < starsToFill) {
                star.classList.add(colorClass);
            }
        });
    }
    profileUsername.textContent = user.username;
    profileUsername.setAttribute('user_id', user.id);
    avatarElement.style.backgroundImage = `url(${user.avatar})`;

    bio.textContent = user.biography;
    if (window.userData.username === user.username) {
        email.textContent = user.email;
    } else {
        email.textContent = '';
    }
    const expGame1Percentage = Math.max((user.bar_exp_game1 % 1000) / 10, 1);
    const levelGame1 = Math.floor(user.bar_exp_game1 / 1000);
    expBar1.style.width = `${expGame1Percentage}%`;
    expText1.textContent = `Level ${levelGame1}`;
    expBar1.setAttribute('aria-valuenow', expGame1Percentage);
}

export function computeStats(games) {
    let stats = {
        pveWins: 0,
        pveLosses: 0,
        pvpWins: 0,
        pvpLosses: 0,
        TotalBuffGames: 0,
        TotalAttack: 0,
        TotalSpeed: 0,
        TotalShield: 0,
        AttackAccuracy: 0.0,
        TotalDuration: 0.0,
        mapStatistics: {
            'Map 1': { wins: 0, losses: 0 },
            'Map 2': { wins: 0, losses: 0 },
            'Map 3': { wins: 0, losses: 0 },
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
    var gameCount = 0;
    games.forEach(game => {
        const gameKey = Object.keys(game)[0];
        const { ally, enemy } = game[gameKey];
        const isPve = enemy.user.username.includes('Easy AI') || enemy.user.username.includes('Hard AI') || enemy.user.username.includes('Medium AI');
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
        if (ally.attack_powerup != null)
            stats.TotalBuffGames++;
        if (!ally.is_forfeit && !enemy.is_forfeit) {
            stats.TotalAttack += (ally.attack_powerup || 0);
            stats.AttackAccuracy += (ally.attack_accuracy || 0);
            stats.TotalSpeed += (ally.speed_powerup || 0);
            stats.TotalShield += (ally.shield_powerup || 0);
            stats.TotalDuration += ally.game_duration;
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
    const attackAccuracy = stats.AttackAccuracy / stats.TotalBuffGames;
    const map1WinRate = stats.mapStatistics['Map 1'].wins + stats.mapStatistics['Map 1'].losses > 0
        ? (stats.mapStatistics['Map 1'].wins / (stats.mapStatistics['Map 1'].wins + stats.mapStatistics['Map 1'].losses)) * 100 : 0;
    const map2WinRate = stats.mapStatistics['Map 2'].wins + stats.mapStatistics['Map 2'].losses > 0
        ? (stats.mapStatistics['Map 2'].wins / (stats.mapStatistics['Map 2'].wins + stats.mapStatistics['Map 2'].losses)) * 100 : 0;
    const map3WinRate = stats.mapStatistics['Map 3'].wins + stats.mapStatistics['Map 3'].losses > 0
        ? (stats.mapStatistics['Map 3'].wins / (stats.mapStatistics['Map 3'].wins + stats.mapStatistics['Map 3'].losses)) * 100 : 0;
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
    const attackAccuracyElem = document.getElementById('attack-accuracy');
	attackAccuracyElem.style.width = attackAccuracy + '%';
	attackAccuracyElem.textContent = attackAccuracy + '%';
    const totalAttackElem = document.getElementById('total-attack');
    totalAttackElem.textContent = 'Number Of Picked Up Attack Buffs: ' + stats.TotalAttack;
    const totalShieldElem = document.getElementById('total-shield');
    totalShieldElem.textContent = 'Number Of Picked Up Shield Buffs: ' + stats.TotalShield;
    const totalSpeedElem = document.getElementById('total-speed');
    totalSpeedElem.textContent = 'Number Of Picked Up Speed Buffs: ' + stats.TotalSpeed;
    const totalMatchDurationElem = document.getElementById('matches_duration');
	totalMatchDurationElem.textContent = 'Total Minutes Played: ' + stats.TotalDuration;
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
    var favoritePowerup = {'name':'', 'value':0};
    const max = Math.max(stats.TotalAttack, stats.TotalShield, stats.TotalSpeed);
    favoritePowerup.value = max;
    if (stats.TotalAttack === max)
        favoritePowerup.name = 'Bullet';
    else if (stats.TotalShield === max)
        favoritePowerup.name = 'Shield';
    else
        favoritePowerup.name = 'Speed';
	mostUsedPowerupElem.style.width = favoritePowerup.value + '%';
	mostUsedPowerupElem.textContent = favoritePowerup.name;
	createChart(document.getElementById('winLossChartPVE').getContext('2d'), 'PvE Win-Loss', stats.pveWinLossData, 'pve');
	createChart(document.getElementById('winLossChartPVP').getContext('2d'), 'PvP Win-Loss', stats.pvpWinLossData, 'pvp');
}

export function loadMatchHistory(games) {
    const container = document.getElementById('match-stats-container');
    const historyTab = document.getElementById('History');
    const statsstab = document.getElementById('MatchStats');
    const matchHistoryContainer = document.getElementById('match-history-new');
    historyTab.addEventListener('click', async function (event) {
        event.preventDefault();
        if (historyTab.getAttribute('aria-selected') === 'true' && historyTab.getAttribute('on') === 'true') {
            loadMatchHistory(games);
            return ;
        } else {
            historyTab.setAttribute('on', 'true');
            statspage.setAttribute('on', 'false');
            statsstab.setAttribute('on', 'false');
            matchHistoryContainer.innerHTML = '';
            try {
                if (document.getElementById('username').value === window.userData.username) {
                    games = await getMatchHistory();
                }
                loadMatchHistory(games);
                return ;
            } catch (error) {
                Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
            }
        }
	}, { once: true });
    loadStats(games);
    matchHistoryContainer.innerHTML = '';
    container.innerHTML = '';
    if (games.length === 0) {
        const para = document.createElement('p');
        const par =  document.createElement('p');
        par.textContent = 'No Match Played!';
        para.textContent = 'No Match Played!';
        matchHistoryContainer.appendChild(para);
        container.appendChild(par);
        return ;
    }
    games.forEach(game => {
        const matchCard = document.createElement('div');
        matchCard.classList.add('match-card');
        var match_score;
        const gameKey = Object.keys(game)[0];
        const {ally, enemy} = game[gameKey];

        if (!ally.is_win) {
            matchCard.classList.add('lost');
        }
        if (ally.is_forfeit) {
            match_score = "LOST BY FORFEIT";
        } else if (enemy.is_forfeit) {
            match_score = "WON BY FORFEIT";
        } else {
            match_score = `${ally.score}-${enemy.score}`;
        }
        matchCard.innerHTML = `
        <div class="player player-left">
            <img src="${ally.user.avatar}" alt="Avatar of ${ally.user.username}">
            <div class="player-info-2">
                <div>${ally.user.username}</div>
                <div class="game-name">${ally.game_id}</div>
            </div>
        </div>
        <div class="score">${match_score}</div>
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
    games.forEach(game => {
        const matchCard = document.createElement('div');
        matchCard.classList.add('match-card');
        var match_score;
        const gameKey = Object.keys(game)[0];
        const {ally, enemy} = game[gameKey];
        if (ally.game_mode === 'Default Mode') {
            ally.speed_powerup = null;
            ally.shield_powerup = null;
            ally.attack_accuracy = null;
            ally.attack_powerup  = null;
            enemy.speed_powerup = null;
            enemy.shield_powerup = null;
            enemy.attack_accuracy = null;
            enemy.attack_powerup  = null;
        }
        if (!ally.is_win) {
            matchCard.classList.add('lost');
        }
        if (ally.is_forfeit) {
            match_score = "LOST BY FORFEIT";
            ally.game_duration = 'ABORTED';
        } else if (enemy.is_forfeit) {
            match_score = "WON BY FORFEIT";
            ally.game_duration = 'ABORTED';
        } else {
            match_score = `${ally.score}-${enemy.score}`;
            ally.game_duration += 'mins';
        }
        matchCard.innerHTML = `
        <div class="player player-left">
            <img src="${ally.user.avatar}" alt="Avatar of ${ally.user.username}">
            <div class="player-info-2">
                <div style="font: bold;">${ally.user.username}</div>
                <p>Number Of Picked Up Speed Buffs: ${ally.speed_powerup}</p>
                <p>Number Of Picked Up Shield Buffs: ${ally.shield_powerup}</p>
                <p>Number Of Picked Up Attack Buffs: ${ally.attack_powerup}</p>
                <p>Attack Accuracy: ${ally.attack_accuracy}%</p>
                <div class="game-name">${ally.game_id}</div>
            </div>
        </div>
        <div class="My_score">${match_score}</div>
        <p class="game-duration">Game Duration: ${ally.game_duration}</p>
        <p class="game-details">Game Details:${ally.game_mode} ${ally.map_name}</p>
        <div class="player player-right">
            <img src="${enemy.user.avatar}" alt="Avatar of ${enemy.user.username}">
            <div class="player-info-2">
                <div style="font: bold;">${enemy.user.username}</div>
                <p>Number Of Picked Up Speed Buffs: ${enemy.speed_powerup}</p>
                <p>Number Of Picked Up Shield Buffs: ${enemy.shield_powerup}</p>
                <p>Number Of Picked Up Attack Buffs: ${enemy.attack_powerup}</p>
                <p>Attack Accuracy: ${enemy.attack_accuracy}%</p>
                <div class="game-name">${enemy.game_id}</div>
            </div>
        </div>
        `;
        container.appendChild(matchCard);
    });
}
