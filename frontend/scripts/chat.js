const chatSocket = new WebSocket("ws://10.11.5.17:80/ws/"); //check wrong url "maybe"

chatSocket.onopen = function(e) {
	console.log("socket on");
}

chatSocket.onclose = function(e) {
	console.log("socket off");
}

// document.querySelector("#message-content").focus();

// document.querySelector("#message-content").onkeyup = function (e) { // check send on key <enter>
//     if (e.keyCode == 13) {
//         document.querySelector("#send-button").click();
//     }
// };

function send_message(username) {
	var messageInput =  document.getElementById('chat-input');
	// messageInput.value = ''; 
	messageInput.focus();

	console.log('asda', username);
	// console.log("message: <", messageInput.value);
    chatSocket.send(JSON.stringify({ message: messageInput.value, username : username}));
	messageInput.value = '';
};
chatSocket.onmessage = function(e) {
	
	const data = JSON.parse(e.data);
	console.log("username :",  data.username);
	console.log("message :", data.message);
}

document.addEventListener('DOMContentLoaded', function() {
	const messageContainer = document.getElementById('message-container');
	const chatInput = document.getElementById('chat-input');
	const sendButton = document.getElementById('send-button');
	const noChat = document.getElementById('no-chat');

	function addMessage(message, isSender = false) {
		if (message.trim() === '') return;

		const messageElement = document.createElement('div');
		messageElement.classList.add('message');
		messageElement.classList.add(isSender ? 'right' : 'left');
		 
		const avatarElement = document.createElement('img');
		avatarElement.src = isSender ? 'assets/avatar1.svg' : 'assets/receiver-avatar.svg';
		avatarElement.alt = 'User Avatar';

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

	function handleSend() {
		const message = chatInput.value;
		addMessage(message, true); 
		chatInput.value = ''; 
		chatInput.focus(); 
	}

	chatInput.addEventListener('keydown', function(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			send_message(window.userData.username);
		}
	});

	sendButton.addEventListener('click', function(event) {
		event.preventDefault();
		send_message(window.userData.username);
	});

	if (messageContainer.children.length === 0) {
		 noChat.style.display = 'block';
	}
});
