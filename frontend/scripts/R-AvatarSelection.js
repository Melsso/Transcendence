document.addEventListener('DOMContentLoaded', function () {
	const presetAvatarInput = document.getElementById('preset-avatar');
	const avatarInput = document.getElementById('avatar');
	const avatarSelectionResult = document.getElementById('avatar-selection-result');
	window.presetAvatarInput = presetAvatarInput;
	window.avatarInput = avatarInput;
	const avatarPreviews = document.querySelectorAll('.avatar-preview');
	avatarPreviews.forEach(avatar => {
		avatar.addEventListener('click', () => {
			const avatarSrc = avatar.getAttribute('data-avatar-src');
			presetAvatarInput.value = avatarSrc;
			avatarSelectionResult.innerHTML = `<img src="${avatarSrc}" alt="Selected Avatar">`;
			const modal = bootstrap.Modal.getInstance(document.getElementById('avatarModal'));
			modal.hide();
		});
	});
	avatarInput.addEventListener('change', (event) => {
		const file = event.target.files[0];
		if (file) {
			const fileReader = new FileReader();
			fileReader.onload = function (e) {
				const imgSrc = e.target.result;
				presetAvatarInput.value = '';
				avatarSelectionResult.innerHTML = `<img src="${imgSrc}" alt="Uploaded Avatar">`;
			};
			fileReader.readAsDataURL(file);
		}
	});
	document.getElementById('register-form').addEventListener('submit', function (e) {
		if (!presetAvatarInput.value && !avatarInput.value) {
			Notification('Registration Action', 'Please Select Or Upload An Avatar', 1, 'alert');
			e.preventDefault();
		}
	});
});

function isAvatarSelected() {
	return window.presetAvatarInput.value || window.avatarInput.files.length > 0;
}
