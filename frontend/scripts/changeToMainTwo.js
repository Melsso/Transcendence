// This variable is used to store user data
let userData = {};

// This variable is needed to catch the useremail after registering and before email verification
let userEmail;


// This is the function that fetches user data on homepage access
async function homepageData() {
	
	const access_token = localStorage.getItem('accessToken');
	const refresh_token = localStorage.getItem('refreshToken');

	if (!access_token) {
		throw new Error("No access token found.");
	}

	const response = await fetch('http:localhost:8000/home', {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},

	});

	if (!response.ok) {
		const errorResponse = await response.json();
		console.log("Homepage error: ", response);
		console.log("Err details: ", errorResponse.detail);
		throw new Error(errorResponse.detail || "Fetching homepage failed");
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
		// console.log("Following error happened: ", response);
		throw new Error(errorResponse.detail || 'Verification failed');
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
	mainTwo.style.display = 'none';
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

			const tokens = result.user;
			
			localStorage.setItem('accessToken', tokens.access)
			localStorage.setItem('refreshToken', tokens.refresh)
			
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
			userEmail = result.user_email;
			console.log('Registration successful.');

			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'none';
			document.getElementById('second-reg-container').style.display = 'block';
		} catch (error) {
			console.error('Registration error: ', error.message);
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
