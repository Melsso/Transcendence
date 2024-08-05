document.addEventListener('DOMContentLoaded', function () {
	const avatarImages = document.querySelectorAll('.avatar-preview');
	const resultContainer = document.getElementById('avatar-selection-result');

	avatarImages.forEach(img => {
		 img.addEventListener('click', function () {
			  resultContainer.innerHTML = '';
			  const successMessage = document.createElement('p');
			  successMessage.textContent = 'Successful!';
			  successMessage.classList.add('text-success');
			  resultContainer.appendChild(successMessage);
			  const avatarPreview = document.createElement('img');
			  avatarPreview.src = this.getAttribute('data-avatar-src');
			  avatarPreview.alt = 'Selected Avatar';
			  avatarPreview.style.width = '50px';
			  avatarPreview.style.height = 'auto';
			  avatarPreview.style.marginTop = '10px';
			  resultContainer.appendChild(avatarPreview);
			  const avatarModal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
			  avatarModal.hide();
			  document.getElementById('avatar').value = ''; 
		 });
	});
});
