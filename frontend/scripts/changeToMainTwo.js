import { loadProfile } from "./populatePageHelpers.js";
import { loadFriends, getFriends } from "./populateFriends.js";
// This variable is used to store user data
window.userData = {};

// require("dotenv").config();

// console.log("first ", process.env.ACTIVE_HOST);

// This variable is needed to catch the useremail after registering and before email verification
let userEmail;
const baseUrl = 'http://10.11.5.17:80/';
// let baseUrl = 'http://localhost:80/';

// This is the function that fetches user data on homepage access
async function homepageData() {
	
	const access_token = localStorage.getItem('accessToken');
	// const refresh_token = localStorage.getItem('refreshToken');

	if (!access_token) {
		throw new Error("No access token found.");
	}
	const url = baseUrl + 'api/home/';
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},

	});

	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Err details: ", errorResponse.detail);
		throw new Error(errorResponse.detail || "Fetching homepage failed");
	}

	const data = await response.json();
	userData = data["user"];
	return data;
}

async function userLookUp(searchTerm) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = baseUrl + `api/home/search-users/?search-user-input=${encodeURIComponent(searchTerm)}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Homepage: Search User error: ", errorResponse.detail);
		throw new Error(errorResponse.detail || "User search error");
	}

	const data = await response.json();
	return data;
}

// This is the function that fetches user data on register
async function registerUser(username, password, email) {
	const url = baseUrl + 'api/register/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: username,
			password: password,
			email: email,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Following error happened: ", response);
		throw new Error(errorResponse || 'Registration failed');
	}

	const data = await response.json();
	return data;
}

async function updateUsername(uname) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		console.log('No access Token!');
		return ;
	}

	const url = baseUrl + 'api/home/settings/updateuname/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			username: uname,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Username Change failed');
	}

	const data = await response.json();
	return data;
}

async function updateBio(biog) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		console.log("No access Token!");
		return ;
	}
	const url = baseUrl + 'api/home/settings/updatebio/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			bio: biog,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Bio Change failed');
	}
	const data = await response.json();
	return data;
}

async function updatePwd(curr_pwd, new_pwd, cfm_pwd) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		console.log("No access Token");
		return ;
	}
	const url = baseUrl + 'api/home/settings/updatepwd/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			currentPwd: curr_pwd,
			newPwd: new_pwd,
			confirmedPwd: cfm_pwd,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Following error happened: ", errorResponse.detail);
		throw new Error(errorResponse.detail || 'Password Change failed');
	}
	const data = await response.json();
	return data;
}

async function updateMail(new_mail) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		console.log('No access Token');
		return ;
	}
	const url = baseUrl + 'api/home/settings/updatemail/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			mail: new_mail,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Mail Change failed');
	}
	const data = await response.json();
	return data;
}

// This is the function that fetches user data on login
async function loginUser(usernameOrEmail, password) {
	const url = baseUrl + 'api/login/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username_or_email: usernameOrEmail,
			password: password,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Login failed');
	}
	const data = await response.json();
	return data;
}

// This is the function that fetches user data on email verification step
async function verifyEmail(verification_code, email) {
	const url = baseUrl + 'api/verify-code/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			code: verification_code,
			email: email,	
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail || 'Verification failed');
	}

	const data = await response.json();
	return data;
}

// This is the function that will make sure the tokens are removed in the backend and front
async function logoutUser() {
	const refresh_token = localStorage.getItem('refreshToken');
	if (!refresh_token) {
		console.log('No refresh Token');
		return ;
	}
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		console.log('No access Token');
		return ;
	}

	const url = baseUrl + 'api/logout/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			refresh: refresh_token,
		}),
	});

	if (response.ok) {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		userData = {};
		userEmail = "";
	}
	else {
		const errorResponse = await response.json();
		throw new Error (errorResponse.detail);
	}
}

async function sendFriendRequest(targetId) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error('User is not authenticated');
	}

	const url = baseUrl + 'api/FriendRequestManager/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			target_id: targetId,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse);
	}
	const data = await response.json();
	return data;
}

document.addEventListener('DOMContentLoaded', function () {
	const reg1 = document.getElementById('register-form-container');
    const log1 = document.getElementById('login-form-container');
    const reg2 = document.getElementById('second-reg-container');
	const mainOne = document.getElementById('mainOne');
	const mainTwo = document.getElementById('mainTwo');
	const mainBody = document.getElementById('mainTwo-body');
	const mainSettings = document.getElementById('setting-page');
	const mainSLgame = document.getElementById('S&L-page');
	const mainPONGgame = document.getElementById('PONG-game');
	
	console.log('HALAW: ', process.env.ACTIVE_HOST);

	mainOne.style.display = 'none';
	mainTwo.style.display = 'flex';
	mainBody.style.display = 'none';
	mainSettings.style.display = 'none';
	mainSLgame.style.display = 'none';
	mainPONGgame.style.display = 'none';
	
	const loginButton = document.getElementById('login');
	const profileButton = document.getElementById('to-profile');
	const registerButton = document.getElementById('register');
	const nextButton = document.getElementById('next-btn');
	const logoutButton = document.getElementById('logout');
	const searchButton = document.getElementById('search-user');
	const SLButton = document.getElementById('S&L-play');
	const settingButton = document.getElementById('to-settings');
	const PONGButton = document.getElementById('PONG-button');
	const updateUsernameButton = document.getElementById('updateUsername-btn');
	const updateBioButton = document.getElementById('updateBio-btn');
	const updatePwdButton = document.getElementById('updatePwd-btn');
	// const updateMailButton = document.getElementById('updateMail-btn');
	const friendButton = document.getElementById('friend-list-btn');
	const sendFriendRequestButton = document.getElementById('add-friend');


	async function showView(view, data) {
		reg1.style.display = 'none';
		log1.style.display = 'none';
		reg2.style.display = 'none';
		mainOne.style.display = 'none';
		mainTwo.style.display = 'none';
		mainBody.style.display = 'none';
		mainSettings.style.display = 'none';
		mainSLgame.style.display = 'none';
		mainPONGgame.style.display = 'none';

		if (view === 'login') {
			log1.style.display = 'block';
			mainOne.style.display = 'flex';
			mainTwo.style.display = 'none';
		} else if (view === 'profile') {
			try {
				if (data === null) {
					const result = await homepageData();
					sendFriendRequestButton.style.display = 'none';
					loadProfile(result);
				}
				else {
					const calleruser = data['user'];
					if (userData["username"] !== calleruser['username']) {
						sendFriendRequestButton.style.display = 'flex';
					}
					else {
						sendFriendRequestButton.style.display = 'none';
					}
					
					loadProfile(data);
				}
			
				mainTwo.style.display = 'flex';
				mainBody.style.display = 'flex';

			} catch (error) {
				console.log("Error: ", error.message);
			}
		} else if (view === 'settings') {
			mainTwo.style.display = 'flex';
			mainSettings.style.display = 'flex';
		} else if (view === 'S&L') {
			mainTwo.style.display = 'flex';
			mainSLgame.style.display = 'flex';
		} else if (view === 'PONG') {
			mainTwo.style.display = 'flex';
			mainPONGgame.style.display = 'flex';
		}
	}

	function navigateTo(view, data) {
		history.pushState({ view: view }, null, `#${view}`);
		showView(view, data);
	}

	window.addEventListener('popstate', function (event) {
		if (event.state && event.state.view) {
			showView(event.state.view);
		}
	});

	loginButton.addEventListener('click', async function () {
		const username = document.getElementById('username-login').value;
		const password = document.getElementById('password-login').value;

		try {
			const result = await loginUser(username, password);
			// Here we are getting our access tokens and storing them locally
			const tokens = result.tokens;
			localStorage.setItem('accessToken', tokens.access)
			localStorage.setItem('refreshToken', tokens.refresh)
			
			// We redirect to home page
			navigateTo('profile', null);
		} catch (error) {
			Notification('Profile Action', `Failed to login because: ${error}`, 'alert');
		}
	});

	nextButton.addEventListener('click', async function () {
		const username = document.getElementById('username-R').value;
		const password = document.getElementById('password-R').value;
		const email = document.getElementById('email-R').value;

		try {
			const result = await registerUser(username, password, email);
			// Here we get the email that we need for the verification step
			userEmail = result.user_email;
			Notification('Profile Action', 'Registration Successful', 'profile');

			// We update the things we need to render
			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'none';
			document.getElementById('second-reg-container').style.display = 'block';
		} catch (error) {
			Notification('Profile Action', `Failed to Register because: ${error}`, 'alert');

			// We update the things we need to render
			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'block';
			document.getElementById('second-reg-container').style.display = 'none';
		}
	});

	registerButton.addEventListener('click', async function () {
		const verification_code = document.getElementById('verification-code').value;
		const avatarUrl = document.getElementById('avatar').value;
		
		try {
			const result = await verifyEmail(verification_code, userEmail);
			navigateTo('login', null);
		} catch (error) {
			Notification('Profile Action', `Failed to verify email because: ${error}`, 'alert');
			navigateTo('register', null); 
		}
	});

	logoutButton.addEventListener('click', async function () {

		try {
			await logoutUser();
		} catch (error) {
			Notification('Profile Action', `Failed to logout because: ${error}`, 'alert');
		}

		document.getElementById('register-form-container').style.display = 'none';
		document.getElementById('second-reg-container').style.display = 'none';
		document.getElementById('login-form-container').style.display = 'block';

		navigateTo('login', null); 
	});

	searchButton.addEventListener('click', async function () {
		const uname = document.getElementById('search-user-input').value;

		try {
			const result = await userLookUp(uname);
			if (result['user'] !== null) {
				navigateTo('profile', result);
			}
			else {
				Notification('Search', 'No such user found!', 'alert');
			}
		} catch (error) {
			console.log("Error: ", error.message);
		}
	});

	friendButton.addEventListener('click', async function () {
		try {
			const result = await getFriends();
			loadFriends(result, userData.id);

		} catch (error) {
			console.log("Error: ", error.detail);
		}
	});

	sendFriendRequestButton.addEventListener('click', async function () {
		const target = document.getElementById('username');
		const target_id = target.getAttribute('user_id');
		try {
	
			const result = await sendFriendRequest(target_id);
			Notification('Friend Action', 'You have sent a friend request!', 'request');
		} catch (error) {
			Notification('Friend Action', `Friend Request Failed because: ${error}`, 'alert');
		}
	});
	
	settingButton.addEventListener('click', function () {
		navigateTo('settings', null); 
	});

	profileButton.addEventListener('click', function () {
		navigateTo('profile', null);
	});

	SLButton.addEventListener('click', function () {
		navigateTo('S&L', null);
	});

	PONGButton.addEventListener('click', function () {
		navigateTo('PONG', null);
	});

	window.onload = function () {
		const hashView = location.hash.replace("#", "") || "login"; 
		navigateTo(hashView, null);
	};

	updateUsernameButton.addEventListener('click', async function () {
		const username = document.getElementById('new-username').value;
		try {
			const result = await updateUsername(username);
			Notification('Profile Action', 'You have updated your username!', 'profile');
		} catch (error) {
			Notification('Profile Action', `Failed to change Username because: ${error}`, 'alert');
		}
	});

	updateBioButton.addEventListener('click', async function () {
		const bio = document.getElementById('new-Bio').value;
	
		try {
			const result = await updateBio(bio);
			Notification('Profile Action', 'You have updated your bio!', 'profile');
		} catch (error) {
			Notification('Profile Action', `Failed to change bio because: ${error}`, 'alert');
		}
	});

	updatePwdButton.addEventListener('click', async function () {
		const curr_pwd = document.getElementById('current-password').value;
		const new_pwd = document.getElementById('new-password').value;
		const cfm_pwd = document.getElementById('new-confirm-password').value;
	
		try {
			const result = await updatePwd(curr_pwd, new_pwd, cfm_pwd);
			Notification('Profile Action', 'You have updated your password!', 'profile');
		} catch (error) {
			cNotification('Profile Action', `Failed to change password because: ${error}`, 'alert');
		}
	});

	// updateMailButton.addEventListener('click', async function () {
	// 	const new_mail = document.getElementById('new-email').value;
	
	// 	try {
	// 		const result = await updateMail(new_mail);
	// 	} catch (error) {
	// 		console.log('Error: ', error.detail);
	// 	}
	// });
});
