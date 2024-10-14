export async function getFriends() {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = `http://localhost:8000/friends/`

	const response = await fetch(url, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok){
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail || "Friend List error");
	}

	const data = await response.json();
	return data;

};

export async function loadFriends(data) {
	const results = data['friends'];
	const friendsListContainer = document.getElementById('friends-list');
	friendsListContainer.innerHTML = '';
	if (results && results.length > 0){
		results.forEach(user =>{
			const FriendDiv = document.createElement('div');
			FriendDiv.className = 'd-flex align-items-center mb-3';
			FriendDiv.id = user.id;

			const avatarImg = document.createElement('img');
			avatarImg.src = user.avatarUrl;
			avatarImg.alt = user.userName;
			avatarImg.className = 'rounded-circle me-3';
			avatarImg.style.width = '50px';
			avatarImg.style.height = '50px';

			const nameDropdownDiv = document.createElement('div');
			nameDropdownDiv.className =- 'd-flex justify-content-between w-100';

			const nameSpan = document.createElement('div');
			nameSpan.className = 'fw-bold';
			nameSpan.textContent = friend.userName;

			const dropdownDiv = document.createElement('div');
			dropdownDiv.className = 'dropdown dropend';

			const uniqueDropdownId = `dropdownMenuButton${user.userID}`;
			const uniqueDropdownMenuId = `dropDownMenu${user.userID}`;

			const dropdownButton = document.createElement('button');
			dropdownButton.className = 'btn btn-friends';
			dropdownButton.type = 'button';
			dropdownButton.id = uniqueDropdownId;
			dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
			dropdownButton.setAttribute('aria-expanded', 'false');
			dropdownButton.innerHTML = '&#8226;&#8226;&#8226;';

			const dropdownMenu = document.createElement('ul');
			dropdownMenu.className = 'dropdown-menu';
			dropdownMenu.id = uniqueDropdownMenuId;
			dropdownMenu.setAttribute('aria-labelledby', dropdownButton.id);

			const actions = ['View Profile', 'Send a Message', 'Unfriend', 'Invite To Game'];
			actions.forEach(action => {
				const li = document.createElement('li');
				const a = document.createElement('a');
				a.className = 'dropdown-item';
				a.href = '#';
				a.textContent = action;
				li.appendChild(a);
				dropdownMenu.appendChild(li);
			});

			dropdownDiv.appendChild(dropdownButton);
			dropdownDiv.appendChild(dropdownMenu);

			nameDropdownDiv.appendChild(nameSpan);
			nameDropdownDiv.appendChild(dropdownDiv);

			FriendDiv.appendChild(avatarImg);
			FriendDiv.appendChild(nameDropdownDiv);

			friendsListContainer.appendChild(FriendDiv);
		});
	}else {
		const FriendDiv = document.createElement('div');
		FriendDiv.className = 'd-flex align-items-center mb-3';
		FriendDiv.id = 'aaaa';
		const par = document.createElement('p');
		par.textContent = 'No Friends Yet!';
		FriendDiv.appendChild(par);
		friendsListContainer.appendChild(FriendDiv);
	}
};
