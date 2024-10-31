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

const accordionButtons = document.querySelectorAll('.accordion-button');
export function setAccordionMaxHeight() {
	console.log('dkhelna hna');
	const sidebar = document.querySelector('.sidebar');
	const sidebarHeight = sidebar.clientHeight;
	const maxHeight = sidebarHeight * 0.455;
	document.documentElement.style.setProperty('--accordion-height', `${maxHeight}px`);
}
export function adjustAccordionHeight() {
	document.querySelectorAll('.accordion-collapse').forEach(collapse => {
		if (collapse.classList.contains('show')) {
				collapse.style.height = 'auto';
				collapse.offsetHeight; 
				collapse.style.height = `var(--accordion-height)`;
		} else {
				collapse.style.height = '0px';
		}
	});
}
window.addEventListener('resize', () => {
	setAccordionMaxHeight();
	adjustAccordionHeight();
});
document.addEventListener('DOMContentLoaded', function() {
	setAccordionMaxHeight();
	adjustAccordionHeight();
	accordionButtons.forEach(button => {
		button.addEventListener('click', adjustAccordionHeight);
	});
});
