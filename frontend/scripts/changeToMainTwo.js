document.addEventListener('DOMContentLoaded', function () {
	// Get the mainOne element
	const mainOne = document.getElementById('mainOne');
	const mainTwo = document.getElementById('mainTwo');
	mainOne.style.display = 'none';
	mainTwo.style.display = 'flex';

	// Get the login and register buttons
	const loginButton = document.getElementById('login');
	const registerButton = document.getElementById('register');
	const logoutButon = document.getElementById('logout');

	// Add click event listener to the login button
	loginButton.addEventListener('click', function () {
		 mainOne.style.display = 'none';
		 mainTwo.style.display = 'flex';
	});

	// Add click event listener to the register button
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
});
