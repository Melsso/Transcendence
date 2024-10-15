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
		results.forEach(res =>{
			const user = res.friend_data;
			const FriendDiv = document.createElement('div');
			FriendDiv.className = 'd-flex align-items-center mb-3';
			FriendDiv.id = user.id;
			const avatarImg = document.createElement('img');
			avatarImg.src = user.avatar;
			avatarImg.alt = user.username;
			avatarImg.className = 'rounded-circle me-3';
			avatarImg.style.width = '50px';
			avatarImg.style.height = '50px';



			const nameDropdownDiv = document.createElement('div');
			nameDropdownDiv.className = 'd-flex justify-content-between w-100';

			const nameSpan = document.createElement('div');
			nameSpan.className = 'fw-bold';
			nameSpan.textContent = user.username;
			nameDropdownDiv.appendChild(nameSpan);
			
			if (user.status === 'FRIENDS') {
				const friendRequestContainer = document.getElementById('friend-request-container');
				if (friendRequestContainer) {
				    friendRequestContainer.remove();
				}
				const actions = ['View Profile', 'Send a Message', 'Unfriend', 'Invite To Game'];
				const dropdownDiv = document.createElement('div');
				dropdownDiv.className = 'dropdown dropend';
	
				const uniqueDropdownId = `dropdownMenuButton${user.id}`;
				const uniqueDropdownMenuId = `dropDownMenu${user.id}`;
	
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
				actions.forEach(action => {
					const li = document.createElement('li');
					const a = document.createElement('a');
					a.className = 'dropdown-item';
					a.href = '#';
					a.textContent = action;
					li.appendChild(a);
					dropdownMenu.appendChild(li);
				});
				nameDropdownDiv.appendChild(nameSpan);
				dropdownDiv.appendChild(dropdownButton);
				dropdownDiv.appendChild(dropdownMenu);
				nameDropdownDiv.appendChild(dropdownDiv);
				}
				if (user.status === 'PENDING') {
					const friendRequestContainer = document.createElement('div');
					friendRequestContainer.className = 'friend-request-container';	
					const refuseButton = document.createElement('button');
					refuseButton.id = 'no-btn'
					refuseButton.setAttribute('user_id', user.id);
					refuseButton.type = 'button';
					refuseButton.className = 'btn btn-request-no';
					refuseButton.innerHTML = '&#10005;';
					const acceptButton = document.createElement('button');
					acceptButton.id = 'yes-btn';
					acceptButton.setAttribute('user_id', user.id);
					acceptButton.type = 'button';
					acceptButton.className = 'btn btn-request-yes';
					acceptButton.innerHTML = '&#10003;'; 
					friendRequestContainer.appendChild(refuseButton);
					friendRequestContainer.appendChild(acceptButton);
				
					refuseButton.addEventListener('click', async function () {
						const nature = 'refuse';

						try {
							const result = await respondFriendRequest(user.id, nature);
							console.log('Performed: ', nature);
						} catch (error) {
							alert('Error: ', error.detail);
						}
					});

					acceptButton.addEventListener('click', async function () {
						const nature = 'accept';

						try {
							const result = await respondFriendRequest(user.id, nature);
							console.log('Performed: ', nature);
						} catch (error) {
							alert('Error: ', error.detail);
						}
					});
				}
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

async function respondFriendRequest(targetId, nature) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error('User is not authenticated');
	}
	const url = 'http://localhost:8000/FriendRequestManager/';
	
	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			target_id: targetId,
			nature: nature,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse);
	}
	const data = await response.json();
	return data;
}