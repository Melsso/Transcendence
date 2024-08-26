document.addEventListener('DOMContentLoaded', function () {
	const mainOne = document.getElementById('mainOne');
	const mainTwo = document.getElementById('mainTwo');
	const mainBody = document.getElementById('mainTwo-body');
	const mainSettings = document.getElementById('setting-page');
	const mainSLgame = document.getElementById('S&L-page');
	const mainPONGgame = document.getElementById('PONG-game');
	mainPONGgame.style.display = 'none';
	mainSLgame.style.display = 'none';
	mainOne.style.display = 'none';
	mainTwo.style.display = 'flex';
	mainBody.style.display = 'flex'
	mainSettings.style.display = 'none';


	const loginButton = document.getElementById('login');
	const profileButton = document.getElementById('to-profile');
	const registerButton = document.getElementById('register');
	const logoutButon = document.getElementById('logout');
	const SLButton = document.getElementById('S&L-play');
	const settingButton = document.getElementById('to-settings');
	const PONGButton = document.getElementById('PONG-button');

	
	
	loginButton.addEventListener('click', function () {
		 mainOne.style.display = 'none';
		 mainTwo.style.display = 'flex';
	});

	
	PONGButton.addEventListener('click', function () {
		mainBody.style.display = 'none';
		mainSettings.style.display = 'none';
		mainSLgame.style.display = 'none';
		mainPONGgame.style.display = 'flex';
	});

	registerButton.addEventListener('click', function () {
		 mainOne.style.display = 'none';
		 mainTwo.style.display = 'flex';
	});
	logoutButon.addEventListener('click', function() {
		document.getElementById('register-form-container').style.display = 'none';
		document.getElementById('second-reg-container').style.display = 'none';
		document.getElementById('login-form-container').style.display = 'block';
		mainOne.style.display = 'flex';
		mainTwo.style.display = 'none';
	});

	settingButton.addEventListener('click', function() {
		mainSettings.style.display = 'flex';
		mainBody.style.display = 'none';
		mainPONGgame.style.display = 'none';
		mainSLgame.style.display = 'none';
	});

	profileButton.addEventListener('click', function () {
		mainBody.style.display = 'flex';
		mainSettings.style.display = 'none';
		mainSLgame.style.display = 'none';
		mainPONGgame.style.display = 'none';
	});

	SLButton.addEventListener('click', function() {
		mainBody.style.display = 'none';
		mainSettings.style.display = 'none';
		mainPONGgame.style.display = 'none';
		mainSLgame.style.display = 'flex';
	});
});
