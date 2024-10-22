const baseUrl = process.env.ACTIVE_HOST;

function loadProfileInfo(user) {
    const profileUsername = document.getElementById('username');
    const avatarElement = document.getElementById('profile-avatar');
    const bio = document.getElementById('profile-bio');
    const expBar1 = document.getElementById('exp-pong');
    const expBar2 = document.getElementById('exp-ogame');
    
    profileUsername.textContent = user.username;
    profileUsername.setAttribute('user_id', user.id);

    avatarElement.style.backgroundImage = `url(${user.avatar})`;

    bio.textContent = user.biography;

    expBar1.style.width = 78;
    expBar1.textContent = `Game 1 - Level ${user.bar_exp_game1/1000}`;
    expBar1.setAttribute('aria-valuenow', user.bar_exp_game1%1000);
    expBar2.style.width = 200;
    expBar2.textContent = `Game 2 - Level ${user.bar_exp_game2/1000}`;
    expBar2.setAttribute('aria-valuenow', user.bar_exp_game2%1000);
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
        }
        else {
            result = await getMatchHistory(requestData.user.username);
        }
        loadMatchHistory(result['match_history']);
    } catch (error) {
        Notification('Profile Action', `Failed To Get Match History: ${error}`, 2, 'alert');
    }
    
}

export function loadMatchHistory(games) {
    const historyTab = document.getElementById('History');
	const matchHistoryContainer = document.querySelector('.match-history-container');
    
    historyTab.addEventListener('click', function () {
		matchHistoryContainer.innerHTML = '';
		try {
			loadMatchHistory(games);
            return ;
		} catch (error) {
			Notification('Profile Action', `Failed To Get Match History: ${error}`, 2, 'alert');
        }
	});

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

        matchCard.innerHTML =`
            <div class="player">
                <img src="${ally.user.avatar}" alt="Avatar of ${ally.user.username}">
                <div>
                    <div>${ally.user.username}</div>
                    <div class="game-name">${ally.game_id}</div>
                </div>
            </div>
            <div class="score">${ally.score}-${enemy.score}</div>
            <div class="player">
                <div>
                    <div>${enemy.user.username}</div>
                    <div class="game-name">${enemy.game_id}</div>
                </div>
                <img src="${enemy.user.avatar}" alt="Avatar of ${enemy.user.username}">
            </div>
        `;
        matchHistoryContainer.appendChild(matchCard);
    });
}