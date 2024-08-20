document.addEventListener("DOMContentLoaded", function() {
	const jsonUrl = 'profile.json'; // Adjust this path based on where your JSON file is located

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

			  const bioElement = document.getElementById('profile-bio');
			  bioElement.textContent = data.bio;

			  const progressBarElement1 = document.querySelector('#exp-bar .progress-bar');
			  progressBarElement1.style.width = `${data.game1.expPercentage}%`;
			  progressBarElement1.textContent = `Game 1 - Level ${data.game1.level} - ${data.game1.expPercentage}%`;
			  progressBarElement1.setAttribute('aria-valuenow', data.game1.expPercentage);

			  const progressBarElement2 = document.querySelector('.my-bar-two .progress-bar');
			  progressBarElement2.style.width = `${data.game2.expPercentage}%`;
			  progressBarElement2.textContent = `Game 2 - Level ${data.game2.level} - ${data.game2.expPercentage}%`;
			  progressBarElement2.setAttribute('aria-valuenow', data.game2.expPercentage);
		 })
		 .catch(error => {
			  console.error('Error fetching profile data:', error);
		 });
});
