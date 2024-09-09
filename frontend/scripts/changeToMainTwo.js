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

	loginButton.addEventListener('click', function () {
		navigateTo('profile');
	});

	registerButton.addEventListener('click', function () {
		navigateTo('profile'); 
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
