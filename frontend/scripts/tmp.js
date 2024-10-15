const friendRequestContainer = document.createElement('div');
friendRequestContainer.className = 'friend-request-container';

// Create the "Refuse" button with the X symbol
const refuseButton = document.createElement('button');
refuseButton.type = 'button';
refuseButton.className = 'btn btn-request-no';
refuseButton.innerHTML = '&#10005;'; // X symbol

// Create the "Accept" button with the checkmark symbol
const acceptButton = document.createElement('button');
acceptButton.type = 'button';
acceptButton.className = 'btn btn-request-yes';
acceptButton.innerHTML = '&#10003;'; // Checkmark symbol

// Append the buttons to the friend request container
friendRequestContainer.appendChild(refuseButton);
friendRequestContainer.appendChild(acceptButton);


