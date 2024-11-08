import { getMessages, loadMessages, handleSend } from "./chat.js";
import { userLookUp} from "./changeToMainTwo.js";

const baseUrl = process.env.ACTIVE_HOST;

export async function getFriends() {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = baseUrl + 'api/friends/'
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok){
		const errorResponse = await response.json();
		throw new Error(errorResponse || "Friend List error");
	}

	const data = await response.json();
	return data;
};

export async function loadFriends(data, userid) {
	const friendsListContainer = document.getElementById('friends-list');
	friendsListContainer.innerHTML = '';
	
	const results = data['friends'];
	if (results && results.length > 0) {
		results.forEach(res => {
			// var user_data;
			var friend_data;
			const status = res.status;
			if (userid === res.user_data.id && status === 'PENDING') {
				return ;
			} else {
				// user_data = res.friend_data;
				friend_data = res.user_data;
			}
			if (userid === res.user_data.id && status === 'FRIENDS') {
				friend_data = res.friend_data;
			}
			const fid = res.id;
			// Creating the friend Div
			const FriendDiv = document.createElement('div');
			FriendDiv.className = 'd-flex align-items-center mb-3';
			FriendDiv.id = friend_data.id;
			FriendDiv.setAttribute('Friendship_id', fid);

			// Creating the image link
			const avatarImg = document.createElement('img');
			avatarImg.src = friend_data.avatar;
			avatarImg.alt = friend_data.username;
			avatarImg.className = 'rounded-circle me-3';
			avatarImg.style.width = '50px';
			avatarImg.style.height = '50px';

			const nameDropdownDiv = document.createElement('div');
			nameDropdownDiv.className = 'd-flex justify-content-between w-100';

			const nameSpan = document.createElement('div');
			nameSpan.className = 'fw-bold';
			nameSpan.textContent = friend_data.username;
			nameDropdownDiv.appendChild(nameSpan);
			
			if (status === 'FRIENDS') {
				const friendRequestContainer = document.getElementById('friend-request-container');
				if (friendRequestContainer) {
				    friendRequestContainer.remove();
				}
				const actions = ['View Profile', 'Send a Message', 'Unfriend', 'Invite To Game'];
				const dropdownDiv = document.createElement('div');
				dropdownDiv.className = 'dropdown dropend';
	
				const uniqueDropdownId = `dropdownMenuButton${friend_data.id}`;
				const uniqueDropdownMenuId = `dropDownMenu${friend_data.id}`;
	
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
					a.addEventListener('click', (event) => {
						event.preventDefault();
						handleAction(action, friend_data.id, userid, friend_data.username);
					});
					li.appendChild(a);
					dropdownMenu.appendChild(li);
				});

				nameDropdownDiv.appendChild(nameSpan);
				dropdownDiv.appendChild(dropdownButton);
				dropdownDiv.appendChild(dropdownMenu);
				nameDropdownDiv.appendChild(dropdownDiv);
			}
			if (status === 'PENDING') {
				const friendRequestContainer = document.createElement('div');
				friendRequestContainer.className = 'friend-request-container';	
				const refuseButton = document.createElement('button');
				refuseButton.id = 'no-btn';
				refuseButton.setAttribute('user_id', friend_data.id);
				refuseButton.type = 'button';
				refuseButton.className = 'btn btn-request-no';
				refuseButton.innerHTML = '&#10005;';
				const acceptButton = document.createElement('button');
				acceptButton.id = 'yes-btn';
				acceptButton.setAttribute('user_id', friend_data.id);
				acceptButton.type = 'button';
				acceptButton.className = 'btn btn-request-yes';
				acceptButton.innerHTML = '&#10003;'; 
				friendRequestContainer.appendChild(refuseButton);
				friendRequestContainer.appendChild(acceptButton);
				FriendDiv.appendChild(friendRequestContainer);
				
				refuseButton.addEventListener('click', async function () {
					const nature = 'refuse';

					try {
						const result = await respondFriendRequest(friend_data.id, nature);
						const r1 = await getFriends();
						loadFriends(r1, userid);
						Notification('Friend Action', `You refused a friend request from ${friend_data.username}!`, 2,'request');
					} catch (error) {
						Notification('Friend Action ERROR', `the following error has occured ${error}`,2,'alert');
					}
				});

				acceptButton.addEventListener('click', async function () {
					const nature = 'accept';

					try {
						const result = await respondFriendRequest(friend_data.id, nature);
						const r1 = await getFriends();
						loadFriends(r1, userid);
						Notification('Friend Action', `You Accepted a friend request from ${friend_data.username}!`, 2,'request');
						} catch (error) {
							Notification('Friend Action ERROR', `the following error has occured ${error}`,2,'alert');
						}
					});
			}
			// const onlineDot = document.createElement('div');
			// onlineDot.className = 'online-dot';

			FriendDiv.appendChild(avatarImg);
			// FriendDiv.appendChild(onlineDot);
			FriendDiv.appendChild(nameDropdownDiv);
			friendsListContainer.appendChild(FriendDiv);
		});
	} else {
		const FriendDiv = document.createElement('div');
		FriendDiv.className = 'd-flex align-items-center mb-3';
		FriendDiv.id = 'aaaa';
		const par = document.createElement('p');
		par.textContent = 'No Friends Yet!';
		FriendDiv.appendChild(par);
		friendsListContainer.appendChild(FriendDiv);
	}
};

async function handleAction(action, targetId, userid, targetUname) {
	const messageContainer = document.getElementById('message-container');
	switch(action) {
		case 'Unfriend':
			try {
				const nature = 'delete';
				const res = await respondFriendRequest(targetId, nature);
				const r1 = await getFriends();
				loadFriends(r1, userid);
				Notification('Friend Action', 'You have deleted a friend!', 2,'request');
			} catch (error) {
					Notification('Friend Action ERROR', `the following error has occured ${error}`,2,'alert');
			}
			break;
		case 'Send a Message':
			
			var name = document.getElementById('chatName');
			var collapseElement = document.getElementById('collapseTwo');
			var bsCollapse = new bootstrap.Collapse(collapseElement, {
			toggle: false
			});			 
			if (collapseElement.classList.contains('show') && targetUname !== window.userData.target) {
				bsCollapse.hide();
				messageContainer.innerHTML = '';
				setTimeout(() => {
					bsCollapse.show();
				}, 600);
			}
			else {
				bsCollapse.show();
			}
			name.textContent = targetUname;
			if (targetUname !== window.userData.target) {
				window.userData.target = targetUname;
				messageContainer.innerHTML = '';
				try {
					const result = await getMessages(targetUname);
					loadMessages(result["list"]);
				}catch (error) {
					Notification('Message Action', 'Failed to load previous messages!', 2, 'alert');
					break ;
				}
			}
			break;
			case 'View Profile':
				try {
					const result = await userLookUp(targetUname);
					if (result['user'] !== null) {
						window.navigateTo('profile', result);
					} else {
						Notification('Profile Action', 'Failed to load friend\'s profile!', 2, 'alert');
					}
				} catch (error) {
					Notification('Profile Action', 'Failed to load friend\'s profile!', 2, 'alert');
				}
			break;
		case 'Invite To Game':
			if (window.userData.socket) {
				if (window.userData.pong_socket) {
					handleSend(targetUname, window.userData.r_name, 'Notification');
					Notification('Game Action', 'You Have Successfuly Sent A Game Invitation!', 2, 'invite');
				}
				else {
					Notification('Game Action', 'You have to be in a lobby to invite another user!', 2, 'alert');
				}
			}
			else {
				Notification('Game Action', "Failed To Send Game Invitation, Please Log Out And Log Back In!", 2, 'alert');
			}
			break;
	}
}

async function respondFriendRequest(targetId, nature) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error('User is not authenticated');
	}
	const url = baseUrl + 'api/FriendRequestManager/';
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