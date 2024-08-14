document.addEventListener('DOMContentLoaded', function () {
	const loginBtn = document.getElementById('login-btn');
	const registerBtn = document.getElementById('register-btn');

	// Function to set one button as active and the other as inactive
	function toggleActiveButton(activeButton, inactiveButton) {
		 activeButton.classList.add('active');
		 activeButton.classList.remove('inactive');
		 inactiveButton.classList.add('inactive');
		 inactiveButton.classList.remove('active');
	}

	// Initially set the register button as active
	toggleActiveButton(registerBtn, loginBtn);

	// Add event listeners to switch active/inactive state when clicked
	loginBtn.addEventListener('click', function () {
		 toggleActiveButton(loginBtn, registerBtn);
	});

	registerBtn.addEventListener('click', function () {
		 toggleActiveButton(registerBtn, loginBtn);
	});
});