document.addEventListener('DOMContentLoaded', function () {
	const loginForm = document.getElementById('login-form');
	if (loginForm) {
		 loginForm.addEventListener('submit', handleSubmit);
	}
	const registerForm = document.getElementById('register-form');
	if (registerForm) {
		 registerForm.addEventListener('submit', handleSubmit);
	}
});

function handleSubmit(event) {
	event.preventDefault();

	const form = event.target;
	const formId = form.id;

	if (form.checkValidity()) {
		 if (formId === 'register-form') {
			  if (isAvatarSelected()) {
					window.location.href = "../main/main.html";
			  } else {
					alert('Please select or upload an avatar.');
			  }
		 } else if (formId === 'login-form') {
			  window.location.href = "../main/main.html";
		 }
	} else {
		 form.reportValidity();
	}
}
