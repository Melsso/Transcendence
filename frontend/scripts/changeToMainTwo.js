document.addEventListener('DOMContentLoaded', function () {
	// Get the mainOne element
	const mainOne = document.getElementById('mainOne');
	const mainTwo = document.getElementById('mainTwo');
	mainOne.style.display = 'none';
	mainTwo.style.display = 'flex';

	// Get the login and register buttons
	const loginButton = document.getElementById('login');
	const registerButton = document.getElementById('register');

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
});
