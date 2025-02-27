import { endGameStats } from "./pong.js"
import { userLookUp, blockedUsers } from "./changeToMainTwo.js";
import { startGameSocket, startQueueGame } from "./gameSystem.js";
import { displayTourniLobby, generateTournamentCarousel, sendTGameResult } from "./gameSystemT.js";
import { getFriends, loadFriends } from "./populateFriends.js";
import { Habess } from "./gamePvP.js";
const messageContainer = document.getElementById('message-container');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const mybtn = document.getElementById('update-chat-btn');
const canvass = document.getElementById('pongCanvas');
const noChat = document.getElementById('no-chat');
const globalbtn = document.getElementById('revert_to_global');
const open = document.createElement('button');
let gameaccept = document.createElement('button');
const menu = document.getElementById('menuuu');
const inv_menu = document.getElementById('inv-menu');
const ai_menu = document.getElementById('ai-menu');
const Instructions = document.getElementById('Instructions-box');
const lobby = document.getElementById('pong-inv-container');
const Tlobby = document.getElementById('pong-tournament');
const baseUrl = process.env.ACTIVE_HOST;
const contextMenu = document.createElement('div');
const cc = canvass.getContext('2d');
contextMenu.className = 'custom-context-menu';
contextMenu.style.display = 'none';
document.body.appendChild(contextMenu);
let tar;
let toastgame;

export function handleSend(username=null, r_name=null, action, gameend=null, tournament=null, owner=null) {
	if (action === 'Tourni_over') {
		console.log("jina hna");
		window.userData.socket.send(JSON.stringify({action:action, username:window.userData.username, target:window.userData.tournoi.players}));
		return ;
	}
	if (tournament && action === 'TMatchups') {
		window.userData.socket.send(JSON.stringify({action:action, Slobby:r_name, players:tournament, owner:owner}));
		return ;
	}
	if (tournament) {
		window.userData.socket.send(JSON.stringify({action:action, target: username,Slobby: r_name ,players: tournament, owner:owner}));
		return;
	}
	chatInput.focus();
	const message = chatInput.value;
	chatInput.value = '';
	if (r_name === null && gameend) {
		window.userData.socket.send(JSON.stringify({action:action, username : window.userData.username, target: username}));
		return ;
	}
	if (action) {
		window.userData.socket.send(JSON.stringify({ action: action, username : window.userData.username, target: username, room_name: r_name, lobbySettings: window.lobbySettings}));
		return ;
	}
	window.userData.socket.send(JSON.stringify({ action: 'Message', message: message, username : username, target: window.userData.target, av: window.userData.avatar}));
	addMessage(message, true, null);
}

globalbtn.addEventListener('click', async function(event) {
	event.preventDefault();
	var collapseElement = document.getElementById('collapseTwo');
	var name = document.getElementById('chatName');
	messageContainer.innerHTML = '';
	try {
		const result = await getMessages();
		loadMessages(result["list"]);
	} catch (error) {
		Notification('Message Action', `Error: ${error.detail}`, 2, 'alert');
	}
	if (window.userData.target !== 'Global') {
		var bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
		if (collapseElement.classList.contains('show')) {
			bsCollapse.hide();
			setTimeout(() => {
				bsCollapse.show();
		  	}, 600);
		}
		else {
			bsCollapse.show();
		}
		window.userData.target = 'Global';
		name.textContent = 'Global';
		return ;
	}
	else {
		Notification('Message Action', 'You are already in the global chat room!', 2, 'alert');
		return ;
	}
});

function showContextMenu(event, username) {
	event.preventDefault();
	contextMenu.innerHTML = '';
	const menuOptions = [
		{text: 'View Profile', action: () => handleProfileView(username)},
		{text: 'invite to game', action: () => handleGameInvite(username)}
	];
	menuOptions.forEach(option => {
		const menuItem = document.createElement('div');
		menuItem.className = 'context-menu-item';
		menuItem.textContent = option.text;
		menuItem.addEventListener('click', option.action);
		contextMenu.appendChild(menuItem);
	});
	contextMenu.style.left = `${event.pageX}px`;
	contextMenu.style.top = `${event.pageY}px`;
	contextMenu.style.display = 'block';
}

function fixStyles(){
	const mainOne = document.getElementById('mainOne');
	const mainTwo = document.getElementById('mainTwo');
	const mainBody = document.getElementById('mainTwo-body');
	const mainSettings = document.getElementById('setting-page');
	const mainPONGgame = document.getElementById('PONG-game');
	const inv_menu = document.getElementById('inv-menu');
	const facontainer = document.getElementById('Tfa-container');
	const ai_menu = document.getElementById('ai-menu');
	const Instructions = document.getElementById('Instructions-box');
	const lobby = document.getElementById('pong-inv-container');
	const menu = document.getElementById('menuuu');
	const qContainer = document.getElementById('Queue');
	const moreSettings = document.getElementById('Additional-settings-form');
	const Tlobby = document.getElementById('pong-tournament');
	const deleteModal = document.getElementById('deleteModal');
	const delMsgModal = document.getElementById('deleteMsgModal');
	const delGamesModal = document.getElementById('deleteGamesModal');
	const delPrivMsgModal = document.getElementById('deletePrvMsgModal');
	const changePolicyModal = document.getElementById('changePrivacyModal');
	cc.clearRect(0, 0, canvass.width, canvass.height);
	moreSettings.style.display = 'none';
	qContainer.style.display = 'none';
	mainTwo.style.display = 'none';
	mainBody.style.display = 'none';
	mainSettings.style.display = 'none';
	mainPONGgame.style.display = 'none';
	facontainer.style.display = 'none';
	deleteModal.style.display = 'none';
	delPrivMsgModal.style.display = 'none';
	delMsgModal.style.display = 'none';
	delGamesModal.style.display = 'none';
	changePolicyModal.style.display = 'none';
	qContainer.style.display = 'none';
	mainOne.style.display = 'none';
	mainTwo.style.display = 'none';
	mainBody.style.display = 'none';
	mainSettings.style.display = 'none';
	mainPONGgame.style.display = 'none';
	inv_menu.style.display = 'none';
	ai_menu.style.display = 'none';
	Instructions.style.display = 'none';
	lobby.style.display = 'none';
	menu.style.display = 'none';
	mainTwo.style.display = 'flex';
	mainPONGgame.style.display = 'flex';
	Tlobby.style.display = 'block';
}

async function handleGameInvite(username) {
	if (window.userData.socket) {
		if (window.userData.pong_socket && !resizeGame) {
			handleSend(username, window.userData.r_name, 'Notification');
			Notification('Game Action', 'You Have Successfuly Sent A Game Invitation!', 2, 'invite');
		}
		else {
			Notification('Game Action', 'You have to be in a lobby to invite another user!', 2, 'alert');
		}
	}
	else {
		Notification('Game Action', "Failed To Send Game Invitation, Please Log Out And Log Back In!", 2, 'alert');
	}
}

async function handleProfileView(username) {
	try {
		const result = await userLookUp(username);
		if (result['user'] !== null) {
			navigateTo('profile', result);
		} else {
			Notification('Profile Action', 'Failed to load friend\'s profile!', 2, 'alert');
		}
	} catch (error) {
		Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
	}
}

async function addMessage(message, isSender = false, data) {
	if (message.trim() === '') return;
	const messageElement = document.createElement('div');
	messageElement.classList.add('message');
	messageElement.classList.add(isSender ? 'right' : 'left');
	const avatarElement = document.createElement('img');
	avatarElement.src = isSender ? window.userData.avatar : data.av;
	avatarElement.alt = isSender ? window.userData.username : data.username;
	avatarElement.addEventListener('contextmenu', (event) => showContextMenu(event, avatarElement.alt));
	document.addEventListener('click', () => {
		contextMenu.style.display = 'none';
  	});
	const contentElement = document.createElement('div');
	contentElement.classList.add('message-content');
	contentElement.textContent = message;
	messageElement.appendChild(contentElement);
	messageElement.appendChild(avatarElement);
	messageContainer.appendChild(messageElement);
	if (messageContainer.children.length > 1) {
		noChat.style.display = 'none';
	}
	messageContainer.scrollTop = messageContainer.scrollHeight;
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

function checkFirstRound(players) {
	if (players.length === 4)
		return true;
	else if (players.length === 2)
		return true;
	else
		return false;
}

export async function launchSocket() {
	window.userData.socket.onopen = function(e) {
		console.log("CHATSOCKET--ON");
	}
	
	window.userData.socket.onclose = function(e) {
		console.log("CHATSOCKET--OFF");
	}
	
	window.userData.socket.onmessage = async function(e) {
		const data = JSON.parse(e.data);
		if (data.action === 'Tourni_over' && window.userData?.tournoi) {
			if (window.userData.tournoi.players.find(player => player.username === data.username)) {
				resizeGame = false;
				Habess();
				window.userData.tournoi = null;
				navigateTo('profile', null);
				Notification('Tournament Action', `${data.username} has left the tournament which caused it to be cancelled!`,2 ,'alert');
				return ;
			}
		}
		if (data.action === 'TournoiGameRes') {
			if (window.userData.tournoi === null) return;
			const currentPlayer = data.players.find(player => player.username === window.userData.username);
			if (!currentPlayer)
				return;
			var matchups = [];
			data.players = data.players.filter(player => player.result !== 'LOST');
			if (!(data.players.some(player => player.username === window.userData.username))) {
				window.userData.tournoi = null;
				navigateTo('profile', null);
				return;
			}
			window.userData.tournoi.players = data.players;
			if (window.userData.tournoi.players.length === 1) {
				window.userData.tournoi = null;
				return;
			}
			if (checkFirstRound(window.userData.tournoi.players)) {
				Habess();
				fixStyles();
				if (window.userData.username === data.players[0].username && data.players.length === 4) {
					matchups.push([
						{ username: window.userData.username },
						{ username: data.players[1].username }
					]);
					matchups.push([
						{ username: data.players[2].username }, 
						{ username: data.players[3].username }
					]);
					handleSend(null, null, 'TMatchups', null, matchups, window.userData.username);
				} else if (window.userData.username === data.players[0].username && data.players.length === 2) {
					matchups.push([
						{ username: window.userData.username }, 
						{ username: data.players[1].username }
					]);
					handleSend(null, null, 'TMatchups', null, matchups, window.userData.username);
				}
			}
			return ;
		}
		if (data.action === 'TournoiRoom' && window.userData.tournoi && Object.values(data.players).includes(window.userData.username)) {
			if (data.players['player2'] === window.userData.username) {
				await sleep(1000);
			}
			try {
				if (window.userData.tournoi === null)
					return ;
				if (window.userData.pong_socket) {
					window.userData.pong_socket.close();
					window.userData.pong_socket = null;
					window.userData.r_name = null;
				}
				const accessToken = localStorage.getItem('accessToken');
				if (!accessToken) {
					Notification('Profile Action', 'You Are Not Currently Logged In', 2, 'alert');
					return ;
				}
				window.userData.r_name = data.room_name;
				const u = new URL(baseUrl);
				const screenHeight = canvass.clientHeight;
				const screenWidth = canvass.clientWidth;
				const gameSocket = new WebSocket(`wss://${u.host}/ws/game/${data['room_name']}/?token=${accessToken}&width=${screenWidth}&height=${screenHeight}`);
				window.userData['pong_socket'] = gameSocket;
				startGameSocket();
				if (data.players['player1'] === window.userData.username) {
					await sleep(1000);
				}
				startQueueGame(data.players, data.Slobby, true);
		  } catch (error) {
				Notification('Game Action', `Error: ${error.detail}`, 2, 'alert');
				window.userData.r_name = null;
				if (window.userData.pong_socket) {
					window.userData.pong_socket.close();
					window.userData.r_name = null;
				}
				window.userData.pong_socket = null;
				window.userData.tournoi = null;
				return ;
		  }
			return ;
		}
		if (data.action === 'TMatchups' && data.players.some(matchup => matchup.some(player => player.username === window.userData.username))) {
			console.log(data.players);
			generateTournamentCarousel(data.players, data.owner, data.Slobby);
			return ;
		}
		if (data.action === 'TNotification') {
			if (data.players.some(player => player.username === window.userData.username)) {
				displayTourniLobby(data.Slobby, data.players, data.owner);
				return ;
			}
			if (window.userData.username === data.target) {
				if (gameaccept) {
					gameaccept = null;
					gameaccept = document.createElement('button');
				}
				TGameNotification('Game Action', "Invited you to a Tournament pong game!", data.owner);
				gameaccept.addEventListener('click', function () {
					if (window.userData['guest'] === true) {
						Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
						return ;
					}
					if (data.players.some(player => player.username === window.userData.username)) {
						return ;
					}
					toastgame.hide();
					data.players.push({
						"avatar": window.userData.avatar,
						"ready": false,
						"username": window.userData.username,
					})
					navigateTo('PONG', null);
					menu.style.display = 'none';
					ai_menu.style.display = 'none';
					inv_menu.style.display = 'none';
					Instructions.style.display = 'none';
					Tlobby.style.display = 'block';
					displayTourniLobby(data.Slobby, data.players, data.owner);
					handleSend(null, data.Slobby, 'TNotification', null, data.players, data.owner);
					return ;
				})
			}
			return ;
		}
		if (data.action == 'online_status') {
			window.userData['online'] = data.users;
			try {
				if (window.userData?.guest && window.userData.guest === true) {
					return ;
				}
				const result = await getFriends();
				loadFriends(result, window.userData.id); 
			} catch (error) {
				Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
			}
			return;
		}
		if (window.userData.username === data.username) {
			return ;
		}
		if (data.action === 'Game_left' && window.userData.username === data.target) {
			Notification('Game action', `Your oppponent: ${data.username} has left the game! therefore you win the match by default!`, 2, 'profile');
			Habess();
			resizeGame = false;
			const tmp = window.userData.r_name;
			navigateTo('PONG', null);
			await endGameStats({'name':window.userData.username, 'score':0}, {'name':data.username, 'score':0}, false, tmp, null);
			return;
		}
		if (data.action == 'Notification' && data.target == window.userData.username) {
			if (gameaccept) {
				gameaccept = null;
				gameaccept = document.createElement('button');
			}
			GameNotification('Game Action', "Invited you to a pong game!", data.username);
			gameaccept.addEventListener('click', async function () {
				if (window.userData['guest'] === true) {
					Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
					return ;
			  }
			  	toastgame.hide();
				const u = new URL(baseUrl);
				const accessToken = localStorage.getItem('accessToken');
				if (!accessToken) {
					Notification('Game Action', "Failed To Accept Game Invitation, Please Log Out And Log Back In!", 2, 'alert');
					return ;
				}
				navigateTo('PONG', null);
				const screenHeight = canvass.clientHeight;
				const screenWidth = canvass.clientWidth;
				const gameSocket = new WebSocket(`wss://${u.host}/ws/game/${data['room_name']}/?token=${accessToken}&width=${screenWidth}&height=${screenHeight}`);
				window.userData['pong_socket'] = gameSocket;
				window.userData.r_name = data.room_name;
				menu.style.display = 'none';
				ai_menu.style.display = 'none';
				inv_menu.style.display = 'none';
				Instructions.style.display = 'none';
				Tlobby.style.display = 'none';
				lobby.style.display = 'flex';
				window.lobbySettings = data.lobbySettings;
				startGameSocket();
				return ;
			});
			return ;
		}
		if (data.target !== "Global" && data.target !== window.userData.username) {
			return ;
		}
		var Chat = document.getElementById('collapseTwo');
		if (Chat.classList.contains('show') && (data.target === window.userData.username || window.userData.target === 'Global')) {
			;
		}
		else {
			if (data.target !== 'Global') {
				SpecialNotification('You received a message!',  data.message , data.username);
				return ;				
			}
			else {
				return ;
			}
		}
		if (data.target === window.userData.username || data.target === 'Global') {
			if (data.target === 'Global' && window.userData.target !== 'Global') {
				return ;
			}
			else if (data.target === window.userData.username && window.userData.target !== data.username) {
				SpecialNotification('You received a message!',  data.message , data.username);
			}
			else {
				if (data.target === 'Global') {
					const blocked = await blockedUsers();
					const block_list = blocked.blocked_list;
					const isUsernamePresent = block_list.some(item => item.friend_data.username === data.username);
					if (isUsernamePresent) {
						return ;
					}
				}
				addMessage(data.message, false, data);
			}
		}
	}

	chatInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (chatInput.value.length > 200) {
				messageInput.value = messageInput.value.substring(0, 200);
				Notification('Message Action', 'You have reached the limit of characters you can type per message!', 2, 'alert');
			}
			handleSend(window.userData.username, null, null);
		}
	});

	sendButton.addEventListener('click', function(event) {
		event.preventDefault();
		handleSend(window.userData.username, null, null);
	});

	if (messageContainer.children.length === 0) {
		noChat.style.display = 'block';
	}
};



function SpecialNotification(title, message, target) {	
	var mainpage = document.getElementById('mainTwo');

	const main_welcome = document.createElement('div');
	main_welcome.classList.add("position-fixed", "p-3", "top-0", "end-0");
	main_welcome.style.zIndex = '100';

	const msg_container = document.createElement('div');
	msg_container.id = 'WELCOME';
	msg_container.classList.add('toast');
	msg_container.setAttribute('role', 'alert');
	msg_container.setAttribute('aria-live', 'assertive');
	msg_container.setAttribute('aria-atomic', 'true');

	const header = document.createElement('div');

	header.style.backgroundColor = 'rgba(25, 110, 238, 0.5)';            
	header.classList.add('toast-header');
	header.style.textAlign = 'center';

	const header_msg = document.createElement('strong');
	header_msg.classList.add('me-auto');
	header_msg.textContent = title;
	header_msg.style.color = 'black'; 

	const msg_close = document.createElement('button');
	msg_close.type = 'button';
	msg_close.classList.add('btn-close');
	msg_close.setAttribute('aria-label', 'Close');
	msg_close.setAttribute('data-bs-dismiss', 'toast');

	open.type = 'button';
	open.textContent = 'Open Chat!';
	open.classList.add('btn');
	open.style.backgroundColor = 'rgba(25, 110, 238, 0.5)';
	open.style.padding = '0.25rem 0.5rem'; 
	open.style.fontSize = '0.75rem';
	open.style.marginLeft = '10px';

	header.appendChild(header_msg);
	header.appendChild(open);
	header.appendChild(msg_close);

	const msg_content = document.createElement('div');
	msg_content.classList.add('toast-body');
	const holder = ': ';
	msg_content.textContent = target + holder + message;  


	msg_container.appendChild(header);
	msg_container.appendChild(msg_content);
	main_welcome.appendChild(msg_container);
	mainpage.appendChild(main_welcome);

	const toast = new bootstrap.Toast(msg_container);
	toast.show();
	tar = target;
	setTimeout(() => {
		toast.hide();
	}, 5000);
}
open.addEventListener('click', async function () {
	var collapseElement = document.getElementById('collapseTwo');
	var name = document.getElementById('chatName');
	messageContainer.innerHTML = '';
	var bsCollapse = new bootstrap.Collapse(collapseElement, { toggle: false });
	if (collapseElement.classList.contains('show')) {
		bsCollapse.hide();
		setTimeout(() => {
			bsCollapse.show();
	  }, 600);
	}
	else {
		bsCollapse.show();
	}
	window.userData.target = tar;
	name.textContent = tar;
	try {
		const result = await getMessages(tar);
		loadMessages(result["list"]);
	} catch (error) {
		Notification('Message Action', `Error: ${error.detail}`, 2, 'alert');
	}
});

export async function getMessages(uname=null) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error('User is not authenticated');
	}
	let url = baseUrl + `api/MessageList/`;
	if (uname && uname !== 'Global') { 
		url = baseUrl + `api/MessageList/${uname}/`;
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

export async function loadMessages(data) {
	messageContainer.innerHTML = '';
	const blocked = await blockedUsers();
	const block_list = blocked.blocked_list;
	data.forEach(message => {
		const isUsernamePresent = block_list.some(item => item.friend_data.username === message.username);
		if (isUsernamePresent) {
			return ;
		}
		if (message.content.trim() === '') return;
		const messageElement = document.createElement('div');
		messageElement.classList.add('message');
		const avatarElement = document.createElement('img');
		if (window.userData.username === message.username) {
			messageElement.classList.add('right');
			avatarElement.src = window.userData.avatar;
			avatarElement.alt = message.username;
		}
		else {
			messageElement.classList.add('left');
			const avtar = 'media/' + message.avatar;
			avatarElement.src = avtar;
			avatarElement.alt = message.username;
		}

		avatarElement.addEventListener('contextmenu', (event) => showContextMenu(event, avatarElement.alt));
		document.addEventListener('click', () => {
			contextMenu.style.display = 'none';
		});

		const contentElement = document.createElement('div');
		contentElement.classList.add('message-content');
		contentElement.textContent = message.content;

		messageElement.appendChild(contentElement);
		messageElement.appendChild(avatarElement);
		messageContainer.appendChild(messageElement);

		if (messageContainer.children.length > 1) {
			noChat.style.display = 'none';
		}
		requestAnimationFrame(() => {
			messageContainer.scrollTop = messageContainer.scrollHeight;
		});
	});
}

function GameNotification(title, message, target) {	
	var mainpage = document.getElementById('mainTwo');

	const main_welcome = document.createElement('div');
	main_welcome.classList.add("position-fixed", "p-3", "top-0", "end-0");
	main_welcome.style.zIndex = '100';

	const msg_container = document.createElement('div');
	msg_container.id = 'WELCOME';
	msg_container.classList.add('toast');
	msg_container.setAttribute('role', 'alert');
	msg_container.setAttribute('aria-live', 'assertive');
	msg_container.setAttribute('aria-atomic', 'true');

	const header = document.createElement('div');

	header.style.backgroundColor = 'rgba(76, 39, 133, 0.5)';            
	header.classList.add('toast-header');
	header.style.textAlign = 'center';

	const header_msg = document.createElement('strong');
	header_msg.classList.add('me-auto');
	header_msg.textContent = title;
	header_msg.style.color = 'black'; 

	const msg_close = document.createElement('button');
	msg_close.type = 'button';
	msg_close.classList.add('btn-close');
	msg_close.setAttribute('aria-label', 'Close');
	msg_close.setAttribute('data-bs-dismiss', 'toast');

	gameaccept.type = 'button';
	gameaccept.textContent = 'Accept Game Invite!';
	gameaccept.classList.add('btn');
	gameaccept.style.backgroundColor = 'rgba(76, 39, 133, 0.5)';
	gameaccept.style.padding = '0.25rem 0.5rem'; 
	gameaccept.style.fontSize = '0.75rem';
	gameaccept.style.marginLeft = '10px';
	gameaccept.style.id = 'game-btn' + target;

	header.appendChild(header_msg);
	header.appendChild(gameaccept);
	header.appendChild(msg_close);

	const msg_content = document.createElement('div');
	msg_content.classList.add('toast-body');
	const holder = ': ';
	msg_content.textContent = target + holder + message;  


	msg_container.appendChild(header);
	msg_container.appendChild(msg_content);
	main_welcome.appendChild(msg_container);
	mainpage.appendChild(main_welcome);

	toastgame = new bootstrap.Toast(msg_container);
	toastgame.show();
	tar = target;
	setTimeout(() => {
		toastgame.hide();
	}, 10000);
}

function TGameNotification(title, message, target) {	
	var mainpage = document.getElementById('mainTwo');

	const main_welcome = document.createElement('div');
	main_welcome.classList.add("position-fixed", "p-3", "top-0", "end-0");
	main_welcome.style.zIndex = '100';

	const msg_container = document.createElement('div');
	msg_container.id = 'WELCOME';
	msg_container.classList.add('toast');
	msg_container.setAttribute('role', 'alert');
	msg_container.setAttribute('aria-live', 'assertive');
	msg_container.setAttribute('aria-atomic', 'true');

	const header = document.createElement('div');

	header.style.backgroundColor = 'rgba(76, 39, 133, 0.5)';            
	header.classList.add('toast-header');
	header.style.textAlign = 'center';

	const header_msg = document.createElement('strong');
	header_msg.classList.add('me-auto');
	header_msg.textContent = title;
	header_msg.style.color = 'black'; 

	const msg_close = document.createElement('button');
	msg_close.type = 'button';
	msg_close.classList.add('btn-close');
	msg_close.setAttribute('aria-label', 'Close');
	msg_close.setAttribute('data-bs-dismiss', 'toast');

	gameaccept.type = 'button';
	gameaccept.textContent = 'Accept Tournament Invite!';
	gameaccept.classList.add('btn');
	gameaccept.style.backgroundColor = 'rgba(76, 39, 133, 0.5)';
	gameaccept.style.padding = '0.25rem 0.5rem'; 
	gameaccept.style.fontSize = '0.75rem';
	gameaccept.style.marginLeft = '10px';
	gameaccept.style.id = 'game-btn' + target;

	header.appendChild(header_msg);
	header.appendChild(gameaccept);
	header.appendChild(msg_close);

	const msg_content = document.createElement('div');
	msg_content.classList.add('toast-body');
	const holder = ': ';
	msg_content.textContent = target + holder + message;  


	msg_container.appendChild(header);
	msg_container.appendChild(msg_content);
	main_welcome.appendChild(msg_container);
	mainpage.appendChild(main_welcome);

	toastgame = new bootstrap.Toast(msg_container);
	toastgame.show();
	tar = target;
	setTimeout(() => {
		toastgame.hide();
	}, 10000);
}
