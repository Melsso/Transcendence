document.getElementById('register-form').addEventListener('submit', function(event) {
	var password = document.getElementById('password').value;
	var confirmPassword = document.getElementById('confirm-password').value;

	if (password.length <= 7)
		{
			alert('Password too short!')
			event.preventDefault();
		}
	else if (password !== confirmPassword) {
		 alert('Passwords do not match.');
		 event.preventDefault();
	}
});