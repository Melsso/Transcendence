const messageContainer = document.getElementById('message-container');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const noChat = document.getElementById('no-chat');

function handleSend(username) {
	chatInput.focus();
	const message = chatInput.value;
	window.userData.socket.send(JSON.stringify({ message: message, username : username, target: window.userData.target}));
	addMessage(message, true, null);
	chatInput.value = ''; 
}



function addMessage(message, isSender = false, data) {
	if (message.trim() === '') return;

	const messageElement = document.createElement('div');

	messageElement.classList.add('message');
	messageElement.classList.add(isSender ? 'right' : 'left');
	 
	const avatarElement = document.createElement('img');

	avatarElement.src = isSender ? window.userData.avatar : 'assets/receiver-avatar.svg';
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

export function	launchSocket() {
	console.log('dkhelna launcchsocket');
		window.userData.socket.onopen = function(e) {
			console.log("socket on");
		}
		
		window.userData.socket.onclose = function(e) {
			console.log("socket off");
		}
		
		
		window.userData.socket.onmessage = function(e) {
			const data = JSON.parse(e.data);

			if (window.userData.username === data.username) {
				return ;
			}
			if (data.target !== "Global" && data.target !== window.userData.username) {
				return ;
			}
			Notification('Message Action', 'You have received a message!', 2, 'message');

			var collapseElement = document.getElementById('collapseTwo');
			var bsCollapse = new bootstrap.Collapse(collapseElement, {
				toggle: false
			});			 
			bsCollapse.show();
			if (data.target === window.userData.username) {
				if (window.userData.target !== data.username) {
					messageContainer.innerHTML = '';
				}
				window.userData.target = data.username;
			}
			addMessage(data.message, false, data);
		}

	chatInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSend(window.userData.username);
		}
	});

	sendButton.addEventListener('click', function(event) {
		event.preventDefault();
		handleSend(window.userData.username);
	});

	if (messageContainer.children.length === 0) {
		 noChat.style.display = 'block';
	}
};
