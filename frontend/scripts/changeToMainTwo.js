import { loadProfile } from "./populatePageHelpers.js";

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

async function updateUsername(uname) {
	const access_token = localStorage.getItem('accessToken');
	const url = 'http://localhost:8000/home/settings/updateuname/';
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
	const url = 'http://localhost:8000/home/settings/updatebio/';
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
	const url = 'http://localhost:8000/home/settings/updatepwd/';
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
	const url = 'http://localhost:8000/home/settings/updatemail/';
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
	const updateUsernameButton = document.getElementById('updateUsername-btn');
	const updateBioButton = document.getElementById('updateBio-btn');
	const updatePwdButton = document.getElementById('updatePwd-btn');
	// const updateMailButton = document.getElementById('updateMail-btn');


	async function showView(view) {
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
				const result = await homepageData();
				loadProfile(result);
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

	function navigateTo(view) {
		history.pushState({ view: view }, null, `#${view}`);
		showView(view);
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
			navigateTo('profile');
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
			navigateTo('login');
		} catch (error) {
			alert('Registration error:, ${error.message}');
			navigateTo('register'); 
		}
	});

	logoutButton.addEventListener('click', async function () {

		// await logoutUser();

		document.getElementById('register-form-container').style.display = 'none';
		document.getElementById('second-reg-container').style.display = 'none';
		document.getElementById('login-form-container').style.display = 'block';

		navigateTo('login'); 
	});

	// need to create a new function like loadProfile that gets you everything about a user except the friendlist, loadProfile is misused here and should only be used for hte original user
	// need 2 call navigate as well, but keep in mind it will cause problems, so add flag to know if its searching or smth
	searchButton.addEventListener('click', async function () {
		const uname = document.getElementById('search-user-input').value;

		try {
			const result = await userLookUp(uname);
			if (result['user'] !== null) {
				loadProfile(result);
			}
			else {
				alert('No such user');
			}
		} catch (error) {
			console.log("Error: ", error.message);
		}
	});

	settingButton.addEventListener('click', function () {
		navigateTo('settings'); 
	});

	profileButton.addEventListener('click', function () {
		navigateTo('profile');
	});

	SLButton.addEventListener('click', function () {
		navigateTo('S&L');
	});

	PONGButton.addEventListener('click', function () {
		navigateTo('PONG');
	});

	window.onload = function () {
		const hashView = location.hash.replace("#", "") || "login"; 
		navigateTo(hashView);
	};

	updateUsernameButton.addEventListener('click', async function () {
		const username = document.getElementById('new-username').value;
		try {
			const result = await updateUsername(username);
			
		} catch (error) {
			console.log('Error: ', error.detail);
		}
	});

	updateBioButton.addEventListener('click', async function () {
		const bio = document.getElementById('new-Bio').value;
	
		try {
			const result = await updateBio(bio);
		} catch (error) {
			console.log('Error: ', error.detail);
		}
	});

	updatePwdButton.addEventListener('click', async function () {
		const curr_pwd = document.getElementById('current-password').value;
		const new_pwd = document.getElementById('new-password').value;
		const cfm_pwd = document.getElementById('new-confirm-password').value;
	
		try {
			const result = await updatePwd(curr_pwd, new_pwd, cfm_pwd);
		} catch (error) {
			console.log('Error: ', error.detail);
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
