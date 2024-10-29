import { computeStats } from "./populatePageHelpers";
import { handleSend } from "./chat.js";
const baseUrl = process.env.ACTIVE_HOST;

const lo = document.getElementById('1v1');
const menu = document.getElementById('menuuu');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const lobby = document.getElementById('pong-inv-container');
window.lobbySettings;
let gameInterval = null;
let gameState = {
    ball: { x:0, y:0 },
    player1: { y:0 },
    player2: { y:0 },
    aspectRatio: 0,
};
const gamer2 = {
    name: "Player 1",
    avatar: "assets/avatar2.svg",
    wins: '3',
    losses: '0',
    level: '7.34'
};

async function getRoomName() {
    const access_token = localStorage.getItem('accessToken');
    if (!access_token) {
        Notification();
        return ;
    }

    const url = baseUrl + 'api/games/create-game-room/';
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

lo.addEventListener('click', async function (){
    menu.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    Instructions.style.display = 'none';
    lobby.style.display = 'flex';
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
        const data = await getRoomName();
        window.userData.r_name = data.room_name;
        const u = new URL(baseUrl);
        const gameSocket = new WebSocket(`ws://${u.host}/ws/game/${data['room_name']}/?token=${accessToken}`);
        window.userData['pong_socket'] = gameSocket;
        startGameSocket();
    } catch (error) {
        Notification('Game Action', `Failed to create a room! ${error}`, 2, 'alert');
        window.userData.r_name = null;
        if (window.userData.pong_socket) {
            window.userData.pong_socket.close();
        }
        window.userData.pong_socket = null;
        return ;
    }
});

function sendGameState(sock) {
    if (window.userData.pong_socket) {
        window.userData.pong_socket.send(JSON.stringify({
            action: 'update_game_state',
            state: gameState
        }));
    } else {
        if (gameInterval !== null) {
            clearInterval(gameInterval);
        }
        return ;
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
            state: stateData
        }));
    } else {
        return ;
        // here have to handle the error or rather changing view this shouldnt be reached in anycase anyway
    }
}

export async function startGameSocket() {
    window.userData.pong_socket.onopen = function(e) {
        console.log("GAMESOCKET--ON")
    }
    window.userData.pong_socket.onclose = function(e) {
        console.log("GAMESOCKET--OFF")
    }
    if (window.userData.pong_socket) {
       gameInterval = setInterval(sendGameState, 1000);
    }
    else {
        return ;
    }
    window.userData.pong_socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.action == 'update_game_state') {
            gameState = data.state;
        } else if (data.action === 'current_players') {
            menu.style.display = 'none';
            ai_menu.style.display = 'none';
            inv_menu.style.display = 'none';
            Instructions.style.display = 'none';
            lobby.style.display = 'flex';
            displayPongLobby(lobbySettings, data.players[0], data.players[1]);
        }
    }
}


document.getElementById('PONG-button').addEventListener('click', function () {
    const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
    const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
    window.lobbySettings = {
        mode: gameMode,
        map: selectedMap
    };
});

function displayPongLobby(lobbySettings, gamer1, gamer2 = null) {
    const lobbyContainer = document.getElementById('pong-inv-container');
    
    // const gamer1Stats = computeStats(gamer1.match_history);
    const gamer1Wins = 20;
    const gamer1Losses = 10;
    
    const gamer2Wins = 9;
    const gamer2Losses = 20;
    
    const lobbyNameElement = document.getElementById('lobby-name');
    lobbyNameElement.innerHTML = `
        <div class="map">Map:   ${lobbySettings.map}</div>
        <h1>1vs1 </h1>
        <div class="mode">Mode:   ${lobbySettings.mode}</div>
    `;
    const gamer1Container = document.querySelector('.player1-container');
    const btnid = 'ready-button-' + gamer1.username;
    gamer1Container.innerHTML = `
        <div class="avatar">
            <img src="${gamer1.avatar}" alt="${gamer1.username} Avatar" class="avatar-image">
        </div>
        <div class="player-info">
            <h3>${gamer1.username}</h3>
            <p>Level ${Math.floor(gamer1.bar_exp_game1)}:</p>
            <div class="exp-bar-container">
                <div class="exp-bar" style="width: ${((gamer1.bar_exp_game1 - Math.floor(gamer1.bar_exp_game1)) * 100).toFixed(0)}%;"></div>
            </div>
            <p>W/L: ${gamer1Wins}-${gamer1Losses} </p>
            <div class="winrate-bar-container">
                <div class="winrate-bar" style="width: ${getWinPercentage(gamer1Wins, gamer1Losses)}%;"></div>
            </div>
        </div>
        <button type="button" id="${btnid}" class="btn btn-ready">Not Ready</button>
    `;
    const readyButton1 = document.getElementById(btnid);
    if (gamer1.ready) {
        readyButton1.classList.add('ready');
        readyButton1.textContent = 'Ready!';
    }else {
        readyButton1.textContent = 'Not Ready';
        readyButton1.classList.remove('ready');
    }
    readyButton1.addEventListener('click', function () {
        const username = btnid.split('-').pop();
        if (username === window.userData.username) {
            if (readyButton1.classList.contains('ready')) {
                readyButton1.classList.remove('ready');
                readyButton1.textContent = 'Not Ready';
                gamer1.ready = false;
            } else {
                readyButton1.classList.add('ready');
                readyButton1.textContent = 'Ready!';
                gamer1.ready = true;
            }
            sendGameStatus(gamer1.username, gamer1.ready);
        }
    });
    
    const gamer2Container = document.querySelector('.player2-container');
    if (gamer2) {
        const btnid2 = 'ready-button-' + gamer2.username;
        gamer2Container.innerHTML = `
        <div class="avatar">
            <img src="${gamer2.avatar}" alt="${gamer2.username} Avatar" class="avatar-image">
        </div>
        <div class="player-info">
            <h3>${gamer2.username}</h3>
            <p>Level ${Math.floor(gamer2.bar_exp_game1)}:</p>
            <div class="exp-bar-container">
                <div class="exp-bar" style="width: ${((gamer2.bar_exp_game1 - Math.floor(gamer2.bar_exp_game1)) * 100).toFixed(0)}%;"></div>
            </div>
            <p>W/L: ${gamer2Wins}-${gamer2Losses} </p>
            <div class="winrate-bar-container">
                <div class="winrate-bar" style="width: ${getWinPercentage(gamer2Wins, gamer2Losses)}%;"></div>
            </div>
        </div>
        <button type="button" id="${btnid2}" class="btn btn-ready">Not Ready</button>
    `;
        const readyButton2 = document.getElementById(btnid2);
        if (gamer2.ready) {
            readyButton2.classList.add('ready');
            readyButton2.textContent = 'Ready!';
        }else {
            readyButton2.textContent = 'Not Ready'; 
            readyButton2.classList.remove('ready');
        }
        readyButton2.addEventListener('click', function () {
            const username2 = btnid2.split('-').pop();
            if (username2 === window.userData.username) {
                if (readyButton2.classList.contains('ready')) {
                    readyButton2.classList.remove('ready');
                    readyButton2.textContent = 'Not Ready';
                    gamer2.ready = false;
                } else {
                    readyButton2.classList.add('ready');
                    readyButton2.textContent = 'Ready!';
                    gamer2.ready = true;
                }
                sendGameStatus(gamer2.username, gamer2.ready);
            }
        });
    } else {
        const id = 'modal1' + gamer1.username;
        const id2 = 'modal1-close' + gamer1.username;
        const id3 = 'pong-modal-1' + gamer1.username;
        const id4 = 'modal-overlay' + gamer1.username;
        const id5 = 'modal-submit' + gamer1.username;
        const id6 = 'search-modal' + gamer1.username;
        gamer2Container.innerHTML = `
        <div id="${id4}" class="modal-overlay"></div>
        <div id="pong-p-c">
            <div class="plus-btn" id="${id}">+</div>
            <div id="${id3}" class="search-modal">
                <div class="search-modal-content">
                    <h2 style="color: #ffcc00; text-align: center;">Search for Player</h2>
                    <input type="text" placeholder="Enter player name..." id="${id6}" />
                    <div class="search-modal-buttons">
                        <button id="${id2}" class="modal-btn">Close</button>
                        <button id="${id5}" class="modal-btn">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
        document.getElementById(id).addEventListener('click', function () {
            document.getElementById(id3).classList.add('active');
            document.getElementById(id4).classList.add('active');
        });

        document.getElementById(id2).addEventListener('click', function () {
            document.getElementById(id3).classList.remove('active');
            document.getElementById(id4).classList.remove('active');
        });

        document.getElementById(id5).addEventListener('click', function () {
            if (window.userData.socket) {
				if (window.userData.pong_socket) {
					handleSend(document.getElementById(id6).value , window.userData.r_name, 'Notification');
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

    
    lobbyContainer.style.display = 'block';

}

function getWinPercentage(wins, losses) {
    const totalGames = Number(wins) + Number(losses); 
    if (totalGames === 0) return 0; 
    return (Number(wins) / totalGames) * 100; 
}
