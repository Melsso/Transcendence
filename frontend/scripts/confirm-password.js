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

document.addEventListener('DOMContentLoaded', function() {
	const sidebar = document.querySelector('.sidebar');
	const accordionBodies = document.querySelectorAll('.accordion-body');
	
	function setAccordionMaxHeight() {
		 const sidebarHeight = sidebar.clientHeight;
		 const maxHeight = sidebarHeight * 0.455; // 50% of sidebar height
		 
		 accordionBodies.forEach(body => {
			  body.style.maxHeight = `${maxHeight}px`;
		 });
	}

	setAccordionMaxHeight();
	window.addEventListener('resize', setAccordionMaxHeight); // Adjust on window resize
});
