document.addEventListener("DOMContentLoaded", function() {
	const jsonUrl = '../profile.json';

	fetch(jsonUrl)
		 .then(response => {
			  if (!response.ok) {
					throw new Error('Failed to load JSON file: ' + response.statusText);
			  }
			  return response.json();
		 })
		 .then(data => {
			  const avatarElement = document.getElementById('profile-avatar');
			  avatarElement.style.backgroundImage = `url(${data.avatarUrl})`;

			  const usernameElement = document.getElementById('username');
			  usernameElement.textContent = data.username;

			  const progressBarElement = document.querySelector('#exp-bar .progress-bar');
			  progressBarElement.style.width = `${data.expPercentage}%`;
			  progressBarElement.textContent = `Level ${data.level} - ${data.expPercentage}%`;
			  progressBarElement.setAttribute('aria-valuenow', data.expPercentage);
		 })
		 .catch(error => {
			  console.error('Error fetching profile data:', error);
		 });
});
