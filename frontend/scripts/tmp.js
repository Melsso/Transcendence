// const menu = document.getElementById('menuuu');
const lo = document.getElementById('1v1');

// const inv_menu = document.getElementById('inv-menu');
// const ai_menu = document.getElementById('ai-menu');
// const Instructions = document.getElementById('Instructions-box');
const lobby = document.getElementById('pong-inv-container');

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
});
