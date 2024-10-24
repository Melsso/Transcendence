const menu = document.getElementById('menuuu');
const lo = document.getElementById('1v1');
let lobbySettings;
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const lobby = document.getElementById('pong-inv-container');
const gamer1 = {
    name: "Player 1",
    avatar: "assets/avatar1.svg",
    wins: '3',
    losses: '1',
    level: '3.80'
};
const gamer2 = {
    name: "Player 1",
    avatar: "assets/avatar2.svg",
    wins: '3',
    losses: '0',
    level: '7.34'
};

lo.addEventListener('click', function (){
    menu.style.display = 'none';
    ai_menu.style.display = 'none';
    inv_menu.style.display = 'none';
    Instructions.style.display = 'none';
    lobby.style.display = 'flex';
    displayPongLobby(lobbySettings, gamer1);
});

document.getElementById('PONG-button').addEventListener('click', function () {
    const gameMode = document.querySelector('input[name="attackMode"]:checked').nextElementSibling.innerText;
    const selectedMap = document.querySelector('input[name="mapSelection"]:checked').nextElementSibling.innerText;
    lobbySettings = {
        mode: gameMode,
        map: selectedMap
    };
    
});

function displayPongLobby(lobbySettings, gamer1, gamer2 = null) {
    const lobbyContainer = document.getElementById('pong-inv-container');
    
    const lobbyNameElement = document.getElementById('lobby-name');
    lobbyNameElement.innerHTML = `
    <div class="map">Map:   ${lobbySettings.map}</div>
    <h1>1vs1</h1>
    <div class="mode">Mode:   ${lobbySettings.mode}</div>
    `;
    const gamer1Container = document.querySelector('.player1-container');
    gamer1Container.innerHTML = `
    <div class="avatar">
        <img src="${gamer1.avatar}" alt="${gamer1.name} Avatar" class="avatar-image">
    </div>
    <div class="player-info">
        <h3>${gamer1.name}</h3>
        <p>Level ${Math.floor(gamer1.level)}:</p>
        <div class="exp-bar-container">
            <div class="exp-bar" style="width: ${((gamer1.level - Math.floor(gamer1.level)) * 100).toFixed(0)}%;"></div>
        </div>
        <p>W/L: ${gamer1.wins}-${gamer1.losses} </p>
        <div class="winrate-bar-container">
            <div class="winrate-bar" style="width: ${getWinPercentage(gamer1.wins, gamer1.losses)}%;"></div>
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
    
    
    const gamer2Container = document.querySelector('.player2-container');
    
    if (gamer2) {
        
        gamer2Container.innerHTML = `
        <div class="avatar">
            <img src="${gamer2.avatar}" alt="${gamer2.name} Avatar" class="avatar-image">
        </div>
        <div class="player-info">
            <h3>${gamer2.name}</h3>
            <p>Level ${Math.floor(gamer2.level)}:</p>
            <div class="exp-bar-container">
                <div class="exp-bar" style="width: ${((gamer2.level - Math.floor(gamer2.level)) * 100).toFixed(0)}%;"></div>
            </div>
            <p>W/L: ${gamer2.wins}-${gamer2.losses} </p>
            <div class="winrate-bar-container">
                <div class="winrate-bar" style="width: ${getWinPercentage(gamer2.wins, gamer2.losses)}%;"></div>
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
        
        gamer2Container.innerHTML = `
        <div id="modal-overlay" class="modal-overlay"></div>
        <div id="pong-p-c">
            <div class="plus-btn" id="modal1">+</div>
            <div id="pong-modal-1" class="search-modal">
                <div class="search-modal-content">
                    <h2 style="color: #ffcc00; text-align: center;">Search for Player</h2>
                    <input type="text" placeholder="Enter player name..." id="search-input" />
                    <div class="search-modal-buttons">
                        <button id="modal1-close" class="modal-btn">Close</button>
                        <button onclick="submitInvite()" class="modal-btn">Submit</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    
    lobbyContainer.style.display = 'block';
    const modal = document.getElementById('modal1');
    const modalClose = document.getElementById('modal1-close');

    modal.addEventListener('click', function () {
        document.getElementById('pong-modal-1').classList.add('active');
        document.getElementById('modal-overlay').classList.add('active');
    })
    modalClose.addEventListener('click', function () {
        document.getElementById('pong-modal-1').classList.remove('active');
        document.getElementById('modal-overlay').classList.remove('active');
    })
}

function getWinPercentage(wins, losses) {
    const totalGames = Number(wins) + Number(losses); 
    if (totalGames === 0) return 0; 
    return (Number(wins) / totalGames) * 100; 
}
