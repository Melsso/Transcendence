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
    losses: '0'
};
const player2 = {
    name: "Player 1",
    avatar: "assets/avatar2.svg",
    wins: '3',
    losses: '0'
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
    
    // Populate lobby name
    const lobbyNameElement = document.getElementById('lobby-name');
    lobbyNameElement.innerHTML = `
    <div class="map">Map:   ${lobbySettings.map}</div>
    <h1>1v1</h1>
    <div class="mode">Mode:   ${lobbySettings.mode}</div>
    `;
    // Populate Player 1
    const player1Container = document.querySelector('.player1-container');
    player1Container.innerHTML = `
        <div class="avatar">
            <img src="${player1.avatar}" alt="${player1.name} Avatar" class="avatar-image">
        </div>
        <div class="player-info">
            <h3>${player1.name}</h3>
            <p>Wins: ${player1.wins} | Losses: ${player1.losses}</p>
        </div>
    `;

    // Populate or create Player 2
    const player2Container = document.querySelector('.player2-container');
    
    if (player2) {
        // If Player 2 exists, show their information
        player2Container.innerHTML = `
            <div class="avatar">
                <img src="${player2.avatar}" alt="${player2.name} Avatar" class="avatar-image">
            </div>
            <div class="player-info">
                <h3>${player2.name}</h3>
                <p>Wins: ${player2.wins} | Losses: ${player2.losses}</p>
            </div>
        `;
    } else {
        // Otherwise, show the invite button and modal for adding a new player
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

    // Finally, make the lobby visible
    lobbyContainer.style.display = 'block';
}
