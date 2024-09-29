/*document.addEventListener("DOMContentLoaded", function() {
	const jsonUrl = 'profile.json'; // Adjust this path based on where your JSON file is located

	fetch(jsonUrl)
		 .then(response => {
			  if (!response.ok) {
					throw new Error('Failed to load JSON file: ' + response.statusText);
			  }
			  return response.json();
		 })
		 .then(data => {
			  const avatarElement = document.getElementById('profile-avatar');
			  avatarElement.style.backgroundImage = `url(${data.avatarUrl})`;

			  const usernameElement = document.getElementById('username');
			  usernameElement.textContent = data.username;

			  const bioElement = document.getElementById('profile-bio');
			  bioElement.textContent = data.bio;

			  const progressBarElement1 = document.querySelector('#exp-bar .progress-bar');
			  progressBarElement1.style.width = `${data.game1.expPercentage}%`;
			  progressBarElement1.textContent = `Game 1 - Level ${data.game1.level} - ${data.game1.expPercentage}%`;
			  progressBarElement1.setAttribute('aria-valuenow', data.game1.expPercentage);

			  const progressBarElement2 = document.querySelector('.my-bar-two .progress-bar');
			  progressBarElement2.style.width = `${data.game2.expPercentage}%`;
			  progressBarElement2.textContent = `Game 2 - Level ${data.game2.level} - ${data.game2.expPercentage}%`;
			  progressBarElement2.setAttribute('aria-valuenow', data.game2.expPercentage);
		 })
		 .catch(error => {
			  console.error('Error fetching profile data:', error);
		 });
});
*/
document.addEventListener("DOMContentLoaded", function() {
	fetch('friends.json')
		.then(response => {
			if (!response.ok) {
			 	throw new Error('Failed to load JSON file: ' + response.statusText);
			}
			return response.json();
 	 	})
		 .then(data => {
			  const friendsListContainer = document.getElementById('friends-list');
			  friendsListContainer.innerHTML = ''; // Clear any existing content

			  data.forEach(friend => {
					// Create a div for each friend
					const friendDiv = document.createElement('div');
					friendDiv.className = 'd-flex align-items-center mb-3';
					
					const avatarImg = document.createElement('img');
					avatarImg.src = friend.avatarUrl;
					avatarImg.alt = friend.Friendname;
					avatarImg.className = 'rounded-circle me-3';
					avatarImg.style.width = '50px';
					avatarImg.style.height = '50px';
					
					// Create the name and dropdown
					const nameDropdownDiv = document.createElement('div');
					nameDropdownDiv.className = 'd-flex justify-content-between w-100';
					
					// Name span
					const nameSpan = document.createElement('span');
					nameSpan.className = 'fw-bold';
					nameSpan.textContent = friend.Friendname;
					
					// Dropdown button and menu
					const dropdownDiv = document.createElement('div');
					dropdownDiv.className = 'dropdown dropend';
					
					const dropdownButton = document.createElement('button');
					dropdownButton.className = 'btn btn-secondary dropdown-toggle';
					dropdownButton.type = 'button';
					dropdownButton.id = `dropdownMenuButton${friend.friendID}`;
					dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
					dropdownButton.setAttribute('aria-expanded', 'false');
					dropdownButton.textContent = ''; // Added text for button
					
					const dropdownMenu = document.createElement('ul');
					dropdownMenu.className = 'dropdown-menu';
					dropdownMenu.setAttribute('aria-labelledby', dropdownButton.id);
					
					const actions = ['View Profile', 'Send a Message', 'Unfriend', 'Invite To Game']; // Example actions
					actions.forEach(action => {
						 const li = document.createElement('li');
						 const a = document.createElement('a');
						 a.className = 'dropdown-item';
						 a.href = '#';
						 a.textContent = action;
						 li.appendChild(a);
						 dropdownMenu.appendChild(li);
					});
					
					// Assemble the friend item
					dropdownDiv.appendChild(dropdownButton);
					dropdownDiv.appendChild(dropdownMenu);
					
					nameDropdownDiv.appendChild(nameSpan);
					nameDropdownDiv.appendChild(dropdownDiv);
					
					friendDiv.appendChild(avatarImg);
					friendDiv.appendChild(nameDropdownDiv);
					
					friendsListContainer.appendChild(friendDiv);
			  });
		 })
		 .catch(error => {
			  console.error('Error fetching friends data:', error);
		 });
});