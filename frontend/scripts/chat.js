const messageContainer = document.getElementById('message-container');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const noChat = document.getElementById('no-chat');
const globalbtn = document.getElementById('revert_to_global');
const open = document.createElement('button');
const gameaccept = document.createElement('button');
const baseUrl = process.env.ACTIVE_HOST;
import { startGameSocket  } from "./gameSystem.js";
let tar;

export function handleSend(username, r_name, action) {
	chatInput.focus();
	const message = chatInput.value;
	if (action) {
		window.userData.socket.send(JSON.stringify({ action: action, username : window.userData.username, target: username, room_name: r_name, lobbySettings: window.lobbySettings}));
		return ;
	}
	window.userData.socket.send(JSON.stringify({ action: 'Message', message: message, username : username, target: window.userData.target, av: window.userData.avatar}));
	addMessage(message, true, null);
	chatInput.value = ''; 
}

globalbtn.addEventListener('click', async function(event) {
	event.preventDefault();
	var collapseElement = document.getElementById('collapseTwo');
	var name = document.getElementById('chatName');
	if (window.userData.target !== 'Global') {
		messageContainer.innerHTML = '';
		var bsCollapse = new bootstrap.Collapse(collapseElement, {
		toggle: false
		});
		if (collapseElement.classList.contains('show')) {
			bsCollapse.hide();
			setTimeout(() => {
				bsCollapse.show();
		  }, 600);
		}
		else {
			bsCollapse.show();
		}
		try {
			const result = await getMessages();
			loadMessages(result["list"]);
		} catch (error) {
			Notification('Message Action', 'Failed to load previous messages!', 2, 'alert');
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

function addMessage(message, isSender = false, data) {
	if (message.trim() === '') return;

	const messageElement = document.createElement('div');

	messageElement.classList.add('message');
	messageElement.classList.add(isSender ? 'right' : 'left');
	 
	const avatarElement = document.createElement('img');

	avatarElement.src = isSender ? window.userData.avatar : data.av;
	avatarElement.alt = isSender ? window.userData.username : data.username;

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

export async function	launchSocket() {
		window.userData.socket.onopen = function(e) {
			console.log("socket on--CHATSOCKET");
		}
		
		window.userData.socket.onclose = function(e) {
			console.log("socket off");
		}
		
		
		window.userData.socket.onmessage = async function(e) {
			const data = JSON.parse(e.data);

			if (window.userData.username === data.username) {
				return ;
			}
			if (data.action == 'Notification' && data.target == window.userData.username) {
				// console.log('data: ', data);
				GameNotification('Game Action', "Invited you to a pong game!", data.username);
				gameaccept.addEventListener('click', async function () {
					console.log('datachat: ', data);
					if (window.userData['pong_socket']) {
						window.userData['pong_socket'].close();
						delete window.userData['pong_socket'];
					}
					const u = new URL(baseUrl);
					const accessToken = localStorage.getItem('accessToken');
					if (!accessToken) {
						Notification('Game Action', "Failed To Send Game Invitation, Please Log Out And Log Back In!", 2, 'alert');
						return ;
					}
					const gameSocket = new WebSocket(`ws://${u.host}/ws/game/${data.room_name}/?token=${accessToken}`);
					window.userData['pong_socket'] = gameSocket;
					window.navigateTo('PONG', null);
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
					SpecialNotification('You received a message!',  data.message , 'Global');
					return ;
				}
			}
			if (data.target === window.userData.username || data.target === 'Global') {
				if (data.target === 'Global' && window.userData.target !== 'Global') {
					SpecialNotification('You received a message!',  data.message , 'Global');
					return ;
				}
				else if (data.target === window.userData.username && window.userData.target !== data.username) {
					SpecialNotification('You received a message!',  data.message , data.username);
				}
				else {
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
	var bsCollapse = new bootstrap.Collapse(collapseElement, {
	toggle: false
	});
	if (collapseElement.classList.contains('show')) {
		bsCollapse.hide();
		setTimeout(() => {
			bsCollapse.show();
			toast.hide();
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
		Notification('Message Action', 'Failed to load previous messages!', 2, 'alert');
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
		throw new Error(errorResponse.detail || 'Failed to retrieve messages');
	}
	const data = await response.json();
	return data;
}

export function loadMessages(data) {
	data.forEach(message => {
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

	const toast = new bootstrap.Toast(msg_container);
	toast.show();
	tar = target;
	setTimeout(() => {
		 toast.hide();
	}, 10000);
}
