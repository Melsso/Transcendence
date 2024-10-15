import { loadProfile } from "./populatePageHelpers.js";
import { loadFriends, getFriends } from "./populateFriends.js";
// This variable is used to store user data
let userData = {};

// This variable is needed to catch the useremail after registering and before email verification
let userEmail;


// This is the function that fetches user data on homepage access
async function homepageData() {
	
	const access_token = localStorage.getItem('accessToken');
	// const refresh_token = localStorage.getItem('refreshToken');

	if (!access_token) {
		throw new Error("No access token found.");
	}

	const response = await fetch('http://localhost:8000/home/', {
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

	const url = `http://localhost:8000/home/search-users/?search-user-input=${encodeURIComponent(searchTerm)}`;

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
	const response = await fetch('http://localhost:8000/register/', {
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
		throw new Error(errorResponse.detail || 'Registration failed');
	}

	const data = await response.json();
	return data;
}

// This is the function that fetches user data on login
async function loginUser(usernameOrEmail, password) {
	const response = await fetch('http://localhost:8000/login/', {
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
	const response = await fetch('http://localhost:8000/verify-code/', {
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
	const access_token = localStorage.getItem('accessToken');

	const response = await fetch('http://localhost:8000/logout/', {
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
		alert('Logout failed: ${errorResponse}');

		// here will have to handle depending on error encountered, probably redirect to login anyway
	}
}

async function sendFriendRequest(targetId) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error('User is not authenticated');
	}
	const url = 'http://localhost:8000/FriendRequestManager/';

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
		console.log('Errmsg: ', errorResponse, " sinon: ", errorResponse.detail);
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
					const addFriendBtn = document.getElementById('add-friend');
					addFriendBtn.style.display = 'none';
					loadProfile(result);
				}
				else {
					const calleruser = data['user'];
					if (userData["username"] !== calleruser['username']) {
						const addFriendBtn = document.getElementById('add-friend');
						addFriendBtn.style.display = 'flex';
					}
					else {
						const addFriendBtn = document.getElementById('add-friend');
						addFriendBtn.style.display = 'none';
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
			alert('Login error: ${error.message}');
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
			alert('Registration successful.');

			// We update the things we need to render
			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'none';
			document.getElementById('second-reg-container').style.display = 'block';
		} catch (error) {
			alert('Registration error: ${error.message}');

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
			alert('Registration error:, ${error.message}');
			navigateTo('register', null); 
		}
	});

	logoutButton.addEventListener('click', async function () {

		try {
			await logoutUser();
			console.log('Logged out successfuly');
		} catch (error) {
			console.log('Error: ', error.detail);
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
				alert('No such user');
			}
		} catch (error) {
			console.log("Error: ", error.message);
		}
	});

	friendButton.addEventListener('click', async function () {
		try {
			const result = await getFriends();
			loadFriends(result);

		} catch (error) {
			console.log("Error: ", error.message);
		}
	});

	sendFriendRequestButton.addEventListener('click', async function () {
		const target = document.getElementById('username');
		const target_id = target.getAttribute('user_id');
		console.log(target_id, '<----');
		try {
	
			const result = await sendFriendRequest(target_id);
			alert('Friend Request Sent!');
		} catch (error) {
			console.log("Error: ", error.detail);
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
});
