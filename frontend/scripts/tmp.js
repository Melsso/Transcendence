// const menu = document.getElementById('menuuu');
const lo = document.getElementById('1v1');
let lobbySettings;
// const inv_menu = document.getElementById('inv-menu');
// const ai_menu = document.getElementById('ai-menu');
// const Instructions = document.getElementById('Instructions-box');
const lobby = document.getElementById('pong-inv-container');
const player1 = {
    name: "Player 1",
    avatar: "assets/avatar1.svg",
    wins: '3',
    losses: '1',
    level: '3.80'
};
const player2 = {
    name: "Player 1",
    avatar: "assets/avatar2.svg",
    wins: '3',
    losses: '0',
    level: '7.34'
};
function openModal(modalId) {
    document.getElementById(`pong-modal-${modalId}`).classList.add('active');
    document.getElementById('modal-overlay').classList.add('active');
}

function closeModal(modalId) {
    document.getElementById(`pong-modal-${modalId}`).classList.remove('active');
    document.getElementById('modal-overlay').classList.remove('active');
}

lo.addEventListener('click', function (){
    menu.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    Instructions.style.display = 'none';
    lobby.style.display = 'flex';
    displayPongLobby(lobbySettings, player1, player2);
});

document.getElementById('PONG-button').addEventListener('click', function () {
    const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
    const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
    lobbySettings = {
        mode: gameMode,
        map: selectedMap
    };
    
});

function displayPongLobby(lobbySettings, player1, player2 = null) {
    const lobbyContainer = document.getElementById('pong-inv-container');
    
    const lobbyNameElement = document.getElementById('lobby-name');
    lobbyNameElement.innerHTML = `
    <div class="map">Map:   ${lobbySettings.map}</div>
    <h1>1vs1</h1>
    <div class="mode">Mode:   ${lobbySettings.mode}</div>
    `;
    const player1Container = document.querySelector('.player1-container');
    player1Container.innerHTML = `
    <div class="avatar">
        <img src="${player1.avatar}" alt="${player1.name} Avatar" class="avatar-image">
    </div>
    <div class="player-info">
        <h3>${player1.name}</h3>
        <p>Level ${Math.floor(player1.level)}:</p>
        <div class="exp-bar-container">
            <div class="exp-bar" style="width: ${((player1.level - Math.floor(player1.level)) * 100).toFixed(0)}%;"></div>
        </div>
        <p>W/L: ${player1.wins}-${player1.losses} </p>
        <div class="winrate-bar-container">
            <div class="winrate-bar" style="width: ${getWinPercentage(player1.wins, player1.losses)}%;"></div>
        </div>
    </div>
    <button type="button" id="ready-1" class="btn btn-ready">Not Ready</button>
    `;
    const readyButton1 = document.getElementById('ready-1');
    readyButton1.textContent = 'Not Ready';
    readyButton1.addEventListener('click', function () {
        if (readyButton1.classList.contains('ready')) {
            readyButton1.classList.remove('ready');
            readyButton1.textContent = 'Not Ready';
        } else {
            readyButton1.classList.add('ready');
            readyButton1.textContent = 'Ready!';
        }
    });
    
    
    const player2Container = document.querySelector('.player2-container');
    
    if (player2) {
        
        player2Container.innerHTML = `
        <div class="avatar">
            <img src="${player2.avatar}" alt="${player2.name} Avatar" class="avatar-image">
        </div>
        <div class="player-info">
            <h3>${player2.name}</h3>
            <p>Level ${Math.floor(player2.level)}:</p>
            <div class="exp-bar-container">
                <div class="exp-bar" style="width: ${((player2.level - Math.floor(player2.level)) * 100).toFixed(0)}%;"></div>
            </div>
            <p>W/L: ${player2.wins}-${player2.losses} </p>
            <div class="winrate-bar-container">
                <div class="winrate-bar" style="width: ${getWinPercentage(player2.wins, player2.losses)}%;"></div>
            </div>
        </div>
        <button type="button" id="ready-2" class="btn btn-ready">Not Ready</button>
    `;
        const readyButton2 = document.getElementById('ready-2');
        readyButton2.textContent = 'Not Ready'; 
        readyButton2.addEventListener('click', function () {
            if (readyButton2.classList.contains('ready')) {
                readyButton2.classList.remove('ready');
                readyButton2.textContent = 'Not Ready';
            } else {
                readyButton2.classList.add('ready');
                readyButton2.textContent = 'Ready!';
            }
        });
    } else {
        
        player2Container.innerHTML = `
            <div id="modal-overlay" class="modal-overlay"></div>
            <div id="pong-p-c">
                <div class="plus-btn" onclick="openModal(1)">+</div>
                <div id="pong-modal-1" class="search-modal">
                    <div class="search-modal-content">
                        <input type="text" placeholder="Search for player..." id="search-input">
                        <div class="search-modal-buttons">
                            <button onclick="closeModal(1)">Close</button>
                            <button onclick="submitInvite()">Submit</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    
    lobbyContainer.style.display = 'block';
}

function getWinPercentage(wins, losses) {
    const totalGames = Number(wins) + Number(losses); 
    if (totalGames === 0) return 0; 
    return (Number(wins) / totalGames) * 100; 
}
