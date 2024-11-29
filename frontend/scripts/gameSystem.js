import { computeStats } from "./populatePageHelpers.js";
import { handleSend } from "./chat.js";
import { acceptRefuse } from "./matchMaking.js";
import { drawAll, renderOP, changeSphereVars, newRound, Bigpadpower, countdownforRound } from "./gamePvP.js";
import { Habess, displayCountdown, ChangeFlag, changeLast, Speedpower, gameOScreenpvp } from "./gamePvP.js";
const baseUrl = process.env.ACTIVE_HOST;
const canvass = document.getElementById('pongCanvas');
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

export async function getRoomName() {
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
        throw errorResponse;
    }
    const data = await response.json();
    return data;
}

lo.addEventListener('click', async function (){
    if (window.userData['guest'] === true) {
        Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
        return ;
    }
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
        const screenHeight = canvass.clientHeight;
        const screenWidth = canvass.clientWidth;
        const gameSocket = new WebSocket(`ws://${u.host}/ws/game/${data['room_name']}/?token=${accessToken}&width=${screenWidth}&height=${screenHeight}`);
        window.userData['pong_socket'] = gameSocket;
        startGameSocket();
    } catch (error) {
        Notification('Game Action', `Error: ${error.detail}`, 2, 'alert');
        window.userData.r_name = null;
        if (window.userData.pong_socket) {
            window.userData.pong_socket.close();
            window.userData.r_name = null;
        }
        window.userData.pong_socket = null;
        return ;
    }
});

export function sendBuffState(Buff, player) {
	if (window.userData.pong_socket) {
		 window.userData.pong_socket.send(JSON.stringify({
			  action: 'update_buff_state',
			  player: player,
              buff: Buff,
		 }));
	}
}

export function sendGameState(gameState, target, me) {
    if (window.userData.pong_socket) {
        window.userData.pong_socket.send(JSON.stringify({
            action: 'update_game_state',
            state: gameState,
            target: target,
            player: me
        }));
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
        console.log("GAMESOCKET--ON");
        window.userData.screen_dimensions = {
            width: canvass.getBoundingClientRect().width,
            height: canvass.getBoundingClientRect().height
        };
    }
    window.userData.pong_socket.onclose = function(e) {
        console.log("GAMESOCKET--OFF");
    }
    window.userData.pong_socket.onmessage = function(event) {
        const data = JSON.parse(event.data);
        if (data.action !== 'ball_movment') {
            console.log(data);
        }
        if (data.action === 'update_game_state') {
            if (data.target === window.userData.username) {
                renderOP(data.state);
            }
        } else if (data.action === 'current_players') {
            // flag will be aded, check the flag first before performing this 
            menu.style.display = 'none';
            ai_menu.style.display = 'none';
            inv_menu.style.display = 'none';
            Instructions.style.display = 'none';
            lobby.style.display = 'flex';
            Habess();
            displayPongLobby(lobbySettings, data.players[0], data.players[1]);
        } else if (data.action === 'ball_movment') {
            changeSphereVars(data.x, data.y);
        } else if (data.action === 'notify_match') {
            acceptRefuse();
        } else if (data.action === 'no_match') {
            Notification('Game Action', 'We have found no other player in your skill range! Why don\'t you hone up your skills vs our ai?!', 2, 'alert');
        } else if (data.action == 'start_queue_game') {
            startQueueGame(data.players);
        } else if (data.action === 'Buff'){
            ChangeFlag(data.flag);
        } else if (data.action === 'paddle_hit') {
            changeLast(data.paddle);
        } else if (data.action === 'update_buff_state') {
            if (data.state === 'speed') {
                const target = data.target;
                Speedpower();
            } else if (data.state === 'attack') {
                const target = data.target;
            } else if (data.state === 'shield') {
                const target = data.target;
                Bigpadpower();
            }
        } else if (data.action === 'restart_round') {
            if (data.state === 'end') {
                Habess();
                gameOScreenpvp();
                console.log("KHLAAAAAAAAAAAAAS");
            } else {
                Habess();
                newRound();
                displayCountdown();
            }
            // countdownforRound();
            console.log('Restarting round: ', data);
        } else if (data.action === 'go_screen') {
            console.log('Ending the game: ', data);
        } 
    }
}

async function startQueueGame(players) {
    const queue = document.getElementById('Queue');
    queue.style.display = 'none';
    const gameContainer = document.getElementById('gameContainer');
        const countdownOverlay = document.createElement('div');
        countdownOverlay.classList.add('countdown-overlay');
        countdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5em;
            z-index: 1000;
        `;
    gameContainer.appendChild(countdownOverlay);

    let countdown = 3;
    countdownOverlay.textContent = countdown;
    let g1 = players[0];
    let g2 = players[1];
    g1['set'] = false;
    g2['set'] = false;
    g1['score'] = 0;
    g2['score'] = 0;
    // randomize lobby settings here
    const countdownInterval = setInterval(() => {
        countdown -= 1;
        if (countdown > 0) {
            countdownOverlay.textContent = countdown;
        } else {
            clearInterval(countdownInterval);
            countdownOverlay.textContent = 'Game Start!';
            setTimeout(() => {
                countdownOverlay.remove();
                drawAll(g1, g2, lobbySettings);
            }, 1000);
        }
    }, 1000);
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
    gamer1['set'] = false;
    gamer1['score'] = 0;
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
            <button type="button" id="${btnid}" class="btn btn-ready">Not Ready</button>
        </div>
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
        gamer2['set'] = false;
        gamer2['score'] = 0;
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
            <button type="button" id="${btnid2}" class="btn btn-ready">Not Ready</button>
        </div>
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
    if (gamer1 && gamer2 && gamer1.ready && gamer2.ready) {
        lobbyContainer.style.display = 'none';
        const gameContainer = document.getElementById('gameContainer');
        const countdownOverlay = document.createElement('div');
        countdownOverlay.classList.add('countdown-overlay');
        countdownOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 5em;
            z-index: 1000;
        `;
        gameContainer.appendChild(countdownOverlay);
    
        let countdown = 3;
        countdownOverlay.textContent = countdown;
    
        const countdownInterval = setInterval(() => {
            countdown -= 1;
            if (countdown > 0) {
                countdownOverlay.textContent = countdown;
            } else {
                clearInterval(countdownInterval);
                countdownOverlay.textContent = 'Game Start!';
                setTimeout(() => {
                    countdownOverlay.remove();
                    drawAll(gamer1, gamer2, lobbySettings);
                }, 1000);
            }
        }, 1000);
    }
}

function getWinPercentage(wins, losses) {
    const totalGames = Number(wins) + Number(losses); 
    if (totalGames === 0) return 0; 
    return (Number(wins) / totalGames) * 100; 
}