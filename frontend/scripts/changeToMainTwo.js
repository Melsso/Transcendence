let userData = {};
let userEmail;

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
		// console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Registration failed');
	}

	const data = await response.json();
	return data;
}


// This function will attempt to fetch a response from the backend with posted data
// Note; there will be a token used for further auth returned on success, decide where
// to store that token and when, can be done in the loginUser func or in the event 
// listener
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
		// console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Verification failed');
	}

	const data = await response.json();
	return data;
}


document.addEventListener('DOMContentLoaded', function () {
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
	const SLButton = document.getElementById('S&L-play');
	const settingButton = document.getElementById('to-settings');
	const PONGButton = document.getElementById('PONG-button');

	function showView(view) {
		mainOne.style.display = 'none';
		mainTwo.style.display = 'none';
		mainBody.style.display = 'none';
		mainSettings.style.display = 'none';
		mainSLgame.style.display = 'none';
		mainPONGgame.style.display = 'none';

		if (view === 'login') {
			mainOne.style.display = 'flex';
			mainTwo.style.display = 'none';
		} else if (view === 'profile') {
			mainTwo.style.display = 'flex';
			mainBody.style.display = 'flex';
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
			console.log('Login successful.');
			userData = result['user'];
			navigateTo('profile');
		} catch (error) {
			console.error('Login error:', error.message);
		}
	});

	nextButton.addEventListener('click', async function () {
		const username = document.getElementById('username-R').value;
		const password = document.getElementById('password-R').value;
		const email = document.getElementById('email-R').value;

		try {
			const result = await registerUser(username, password, email);
			let chunk = result['user'];
			userEmail = chunk['email'];
			console.log('Registration successful.');
			// here i have no clue how to take it to the second code confirmation page
			// token wont be returned on register functions, only login
		} catch (error) {
			console.error('Registration error: ', error.message);
		}
	});

	registerButton.addEventListener('click', async function () {
		const verification_code = document.getElementById('verification-code').value;
		const avatarUrl = document.getElementById('avatar').value;
		
		try {
			const result = await verifyEmail(verification_code, userEmail);
			console.log('Email verified successfuly.');
			navigateTo('login');
		} catch (error) {
			console.error('Registration error:', error.message);
			navigateTo('register'); 
		}
	});

	logoutButton.addEventListener('click', function () {
		document.getElementById('register-form-container').style.display = 'none';
		document.getElementById('second-reg-container').style.display = 'none';
		document.getElementById('login-form-container').style.display = 'block';
		navigateTo('login'); 
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
});
