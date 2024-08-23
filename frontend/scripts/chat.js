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
			  handleSend();
		 }
	});

	sendButton.addEventListener('click', handleSend);

	if (messageContainer.children.length === 0) {
		 noChat.style.display = 'block';
	}
});