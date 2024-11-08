import { loadProfile } from "./populatePageHelpers.js";
import { loadFriends, getFriends } from "./populateFriends.js";
import { launchSocket, loadMessages, getMessages  } from "./chat.js";
import { adjustAccordionHeight, setAccordionMaxHeight } from "./confirm-password.js";
import { Habess } from "./gamePvP.js";
let userEmail;
const baseUrl = process.env.ACTIVE_HOST;


async function homepageData() {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = baseUrl + 'api/home/';
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		localStorage.removeItem('accessToken');
		navigateTo('login', null);
		throw new Error(errorResponse.detail);
	}
	const data = await response.json();
	return data;
}

export async function userLookUp(searchTerm) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = baseUrl + `api/home/search-users/?search-user-input=${encodeURIComponent(searchTerm)}`;
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			"Authorization": `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail);
	}

	const data = await response.json();
	return data;
}

// This is the function that fetches user data on register
async function registerUser(username, password, email) {
	const url = baseUrl + 'api/register/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: username,
			password: password,
			email: email,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse);
	}

	const data = await response.json();
	return data;
}

async function checkKnownLocation(access_token) {
	const url = baseUrl + 'api/new-entity/';
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			"Authorization": `Bearer ${access_token}`,
		},
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse);
	}

	const data = await response.json();
	return data;
}

async function addToKnownLocation(v_code, remember) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}

	const url = baseUrl + 'api/new-entity/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			"Authorization": `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			code: v_code,
			remember: remember,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse);
	}

	const data = await response.json();
	return data;
}

async function resetPassowrd(email, password, verf_code) {
	const url = baseUrl + 'api/reset-password/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			verf_code: verf_code,
			password: password,
			email: email,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse);
	}
}

async function updateUsername(uname) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/home/settings/updateuname/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			username: uname,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail);
	}

	const data = await response.json();
	return data;
}

async function updateBio(biog) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}
	const url = baseUrl + 'api/home/settings/updatebio/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			bio: biog,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail);
	}
	const data = await response.json();
	return data;
}

async function updatePwd(curr_pwd, new_pwd, cfm_pwd) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}
	const url = baseUrl + 'api/home/settings/updatepwd/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			currentPwd: curr_pwd,
			newPwd: new_pwd,
			confirmedPwd: cfm_pwd,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail);
	}
	const data = await response.json();
	return data;
}

async function deleteAccount(password){
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');

		return ;
	}
	const url = baseUrl + 'api/delete-account/';
	const response = await fetch (url, {
		method: 'DELETE',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			password: password,
		}),
	});
	if (!response.ok){
		const errorResponse = await response.json();
		Notification('Profile action', "Account Deletion Failed", 1, 'alert');
		throw new Error(errorResponse.detail);
	}
	Notification('Profile action', "Account deleted successfully!", 0, 'success');
	return await response.json();
}

async function checkEmail(email) {
	const url = baseUrl + 'api/forgot/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			email: email,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		console.log(errorResponse.detail);
		throw new Error(errorResponse.detail);
	}
}

// This is the function that fetches user data on login
async function loginUser(usernameOrEmail, password) {
	const url = baseUrl + 'api/login/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username_or_email: usernameOrEmail,
			password: password,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		Notification('Profile Action', "Login Failed!", 1, 'alert');
		throw new Error(errorResponse.detail);
	}
	const data = await response.json();
	return data;
}

// This is the function that fetches user data on email verification step
async function verifyEmail(formData) {
	const url = baseUrl + 'api/verify-code/';
	const response = await fetch(url, {
		method: 'POST',
		body: formData,
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		Notification('Profile Action', 'Please make sure the verification code is correct!', 1, 'alert');
		throw new Error(errorResponse.detail);
	}

	const data = await response.json();
	return data;
}

// This is the function that will make sure the tokens are removed in the backend and front
async function logoutUser() {
	const refresh_token = localStorage.getItem('refreshToken');
	if (!refresh_token) {
		Notification('Profile Action', "No refresh Token", 2, 'alert');
		return ;
	}
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/logout/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			refresh: refresh_token,
		}),
	});

	if (response.ok) {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('refreshToken');
		if (window.userData.socket) {
			window.userData.socket.close();
			window.userData.socket = null;
			window.userData.r_name = null;
			window.userData.target = null;
		}
		window.userData = {};
		userEmail = null;
	}
	else {
		const errorResponse = await response.json();
		throw new Error (errorResponse.detail);
	}
}

async function sendFriendRequest(targetId) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error('User is not authenticated');
	}

	const url = baseUrl + 'api/FriendRequestManager/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			target_id: targetId,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw new Error(errorResponse.detail);
	}
	const data = await response.json();
	return data;
}


document.addEventListener('DOMContentLoaded', function () {
	const reg1 = document.getElementById('register-form-container');
    const log1 = document.getElementById('login-form-container');
    const reg2 = document.getElementById('second-reg-container');
	const mainOne = document.getElementById('mainOne');
	const mainTwo = document.getElementById('mainTwo');
	const mainBody = document.getElementById('mainTwo-body');
	const mainSettings = document.getElementById('setting-page');
	const mainPONGgame = document.getElementById('PONG-game');
	const forgotcontainer = document.getElementById('forgot-container');
	const newpass = document.getElementById('create-new-pass');
	const inv_menu = document.getElementById('inv-menu');
	const facontainer = document.getElementById('2fa-container');
	const ai_menu = document.getElementById('ai-menu');
	const Instructions = document.getElementById('Instructions-box');
	const lobby = document.getElementById('pong-inv-container');
	const menu = document.getElementById('menuuu');
	const qContainer = document.getElementById('Queue');

	qContainer.style.display = 'none';
	mainOne.style.display = 'none';
	log1.style.display = 'none';
	forgotcontainer.style.display = 'none';
	newpass.style.display = 'none';
	mainTwo.style.display = 'none';
	mainBody.style.display = 'none';
	mainSettings.style.display = 'none';
	mainPONGgame.style.display = 'none';
	facontainer.style.display = 'none';
	
	const deleteModal = document.getElementById('deleteModal');
	const confirmDelete = document.getElementById('confirmDelete');
	const cancelDelete = document.getElementById('cancelDelete');	
	const deletebtn = document.getElementById('delete-account');
	const confirmButton = document.getElementById('pass-verf-code');
	const loginButton = document.getElementById('login');
	const login2faButton = document.getElementById('2fa-btn');
	const profileButton = document.getElementById('to-profile');
	const registerButton = document.getElementById('register');
	const nextButton = document.getElementById('next-btn');
	const logoutButton = document.getElementById('logout');
	const searchButton = document.getElementById('search-user');
	const settingButton = document.getElementById('to-settings');
	const PONGButton = document.getElementById('PONG-button');
	const updateUsernameButton = document.getElementById('updateUsername-btn');
	const updateBioButton = document.getElementById('updateBio-btn');
	const updatePwdButton = document.getElementById('updatePwd-btn');
	const friendButton = document.getElementById('friend-list-btn');
	const sendFriendRequestButton = document.getElementById('add-friend');
	const TonewpassButton = document.getElementById('to-new-pass');
	const forgotButton = document.getElementById('forgot-btn');
	const Tlobby = document.getElementById('pong-tournament');
	
	async function showView(view, data) {
		if (window.userData.pong_socket) {
			window.userData.pong_socket.close();
			window.userData.pong_socket = null;
			window.userData.r_name = null;
			// Tlobby.style.display = 'none';
			// tourniLobby.style.display = 'none';
		}
		window.altFfour();
		window.leaving();
		Habess();
		qContainer.style.display = 'none';
		Tlobby.style.display = 'none';
		inv_menu.style.display = 'none';
		ai_menu.style.display = 'none';
		Instructions.style.display = 'none';
		lobby.style.display = 'none';
		facontainer.style.display = 'none';
		menu.style.display = 'none';
		forgotcontainer.style.display = 'none';
		newpass.style.display = 'none';
		reg1.style.display = 'none';
		log1.style.display = 'none';
		reg2.style.display = 'none';
		mainOne.style.display = 'none';
		mainTwo.style.display = 'none';
		mainBody.style.display = 'none';
		mainSettings.style.display = 'none';
		mainPONGgame.style.display = 'none';

		if (view === 'login') {
			log1.style.display = 'block';
			mainOne.style.display = 'flex';
			mainTwo.style.display = 'none';
		} else if (view === 'profile') {
			try {
				if (data === null) {
					const result = await homepageData();
					const sock = window.userData.socket;
					window.userData = result["user"];
					if (!sock || sock.readyState !== WebSocket.OPEN) {
						const u = new URL(baseUrl);
						const accessToken = localStorage.getItem('accessToken');
						const chatSocket = new WebSocket(`ws://${u.host}/ws/?token=${accessToken}`);
						window.userData.socket = chatSocket;
						window.userData["target"] = "Global";
						launchSocket();
					} else {
						window.userData.socket = sock;
					}
					sendFriendRequestButton.style.display = 'none';
					loadProfile(result);
					const res = await getMessages();
					loadMessages(res["list"]);
				}
				else {
					const calleruser = data['user'];
					if (userData["username"] !== calleruser['username']) {
						sendFriendRequestButton.style.display = 'flex';
					}
					else {
						sendFriendRequestButton.style.display = 'none';
					}
					loadProfile(data);						
				}
			
				mainTwo.style.display = 'flex';
				mainBody.style.display = 'flex';
				setAccordionMaxHeight();
				adjustAccordionHeight();
			} catch (error) {
				Notification('Profile Action', "Error: changeToMainTwo.js:379", 2, 'alert'); // check
			}
		} else if (view === 'settings') {
			mainTwo.style.display = 'flex';
			mainSettings.style.display = 'flex';
		} else if (view === 'PONG') {
			inv_menu.style.display = 'none';
			ai_menu.style.display = 'none';
			Instructions.style.display = 'none';
			lobby.style.display = 'none';
			menu.style.display = 'flex';
			mainTwo.style.display = 'flex';
			mainPONGgame.style.display = 'flex';
		} else if (view === 'register') {
			mainOne.style.display = 'flex';
			reg2.style.display = 'block';
		} else if (view === 'forgot') {
			mainOne.style.display = 'flex';
			forgotcontainer.style.display = 'block';
		} else if (view === '2fa') {
			mainOne.style.display = 'flex';
			facontainer.style.display = 'block';
		}
	}

	window.addEventListener('popstate', function (event) {
		if (event.state && event.state.view) {
			showView(event.state.view);
		}
	});

	forgotButton.addEventListener('click', function() {
		navigateTo('forgot', null);
	});

	function navigateTo(view, data) {
		history.pushState({ view: view }, null, `#${view}`);
		showView(view, data);
	}
	window.navigateTo = navigateTo;

	TonewpassButton.addEventListener('click', async function() {
		const input_email = document.getElementById('forgotmail').value;
		try {
			await checkEmail(input_email);
			document.getElementById('forgot-container').style.display = 'none';
			document.getElementById('create-new-pass').style.display = 'block';
		}catch(error) {
			Notification('Profile Action', 'This email doesn\'t belong to any account!', 1, 'alert');
		}
		confirmButton.addEventListener('click', async function() {
			const new_pass = document.getElementById('New Password-R').value;
			const conf_new = document.getElementById('Confirm-New-Password').value;
			const verf = document.getElementById('verf-code').value;
			if (new_pass !== conf_new){
				Notification('Profile Action', 'Make sure the new passwords match!', 1, 'alert');
				return;
			}
			if (!verf) {
				Notification('Profile Action', 'Make sure you type the correct verification code!', 1, 'alert');
				return ;
			}
			try {
				await resetPassowrd(input_email, new_pass, verf);
				Notification('Profile Action', 'You have changed your password successfully!', 1, 'profile');
				navigateTo('login', null);
			}catch (error) {
				Notification('Profile Action', 'Wrong verification code!', 1, 'alert');
			}
	
		});
	});

	loginButton.addEventListener('click', async function () {
		const username = document.getElementById('username-login').value;
		const password = document.getElementById('password-login').value;

		// need to save wether remember or not for next call
		try {
			const result = await loginUser(username, password);
			const tokens = result.tokens;
			const host_check = await checkKnownLocation(tokens.access);
			localStorage.setItem('accessToken', tokens.access);
			localStorage.setItem('refreshToken', tokens.refresh);
			if (host_check['2fa'] === false) {
				navigateTo('profile', null);
			}
			else {
				navigateTo('2fa', null);
				return ;
			}
		} catch (error) {
			Notification('Profile Action', `Failed to login because: ${error}`, 1,'alert');
		}
	});

	login2faButton.addEventListener('click', async function () {
		const v_code = document.getElementById('2fa-input').value;
		const l1 = document.getElementById('2fa-yes');
		const r_value = l1.checked;
		try {
			const result = await addToKnownLocation(v_code, r_value);
			if (result.status === 'success') {
				navigateTo('profile', null);
			}
		} catch (error) {
			Notification('User Action', `Failed To Verify Origin: ${error}`, 1, 'alert');
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			navigateTo('login', null);
		}
	});

	nextButton.addEventListener('click', async function () {
		const username = document.getElementById('username-R').value;
		const password = document.getElementById('password-R').value;
		const email = document.getElementById('email-R').value;

		try {
			const result = await registerUser(username, password, email);
			userEmail = result.user_email;
			Notification('Profile Action', 'Registration Successful',1, 'profile');

			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'none';
			document.getElementById('second-reg-container').style.display = 'block';
		} catch (error) {
			Notification('Profile Action', `Failed to Register because: ${error}`,1, 'alert');

			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'block';
			document.getElementById('second-reg-container').style.display = 'none';
		}
	});

	registerButton.addEventListener('click', async function () {
		const avatarInput = document.getElementById('avatar');
		const avatarSelectionResult = document.getElementById('avatar-selection-result');
		const selectedImage = avatarSelectionResult.querySelector('img');
		const verification_code = document.getElementById('verification-code').value;
		
		const formData = new FormData();
		formData.append('code', verification_code);
		formData.append('email', userEmail);

		if (avatarInput.files.length > 0) {
			formData.append('avatar', avatarInput.files[0]);
	  } else if (selectedImage) {
			try {
				const response = await fetch(selectedImage.src); 
				const blob = await response.blob(); 
				const file = new File([blob], selectedImage.src.split('/').pop(), { type: blob.type }) 
				formData.append('avatar', file);  
		  	} catch (error) {
				Notification('Profile Action', `Failed to fetch preset avatar: ${error}`, 1, 'alert');
				return;
		  	}
	  } else {
			Notification('Profile Action', 'Please select an avatar image to upload.', 1, 'alert');
			return;
	  }
		try {
			const result = await verifyEmail(formData);
			navigateTo('login', null);
		} catch (error) {
			Notification('Profile Action', `Failed to verify email because: ${error}`,1, 'alert');
			navigateTo('register', null); 
		}
	});

	logoutButton.addEventListener('click', async function () {

		try {
			await logoutUser();
			if (window.userData.pong_socket) {
				window.userData.pong_socket.close();
				window.userData.pong_socket = null;
				window.userData.r_name = null;
			}
		} catch (error) {
			Notification('Profile Action', `Failed to logout because: ${error}`,2, 'alert');
		}
		document.getElementById('register-form-container').style.display = 'none';
		document.getElementById('second-reg-container').style.display = 'none';
		document.getElementById('login-form-container').style.display = 'block';

		navigateTo('login', null); 
	});

	searchButton.addEventListener('click', async function () {
		const uname = document.getElementById('search-user-input').value;

		try {
			const result = await userLookUp(uname);
			if (result['user'] !== null) {
				navigateTo('profile', result);
			}
			else {
				Notification('Search', 'No such user found!', 2, 'alert');
			}
		} catch (error) {
			Notification('Profile Action', "Error: changeToMainTwo:496", 2, 'alert');// check
		}
	});

	friendButton.addEventListener('click', async function () {
		try {
			const result = await getFriends();
			loadFriends(result, userData.id);

		} catch (error) {
			Notification('Profile Action', "Error: ", 2, 'alert');
		}
	});

	sendFriendRequestButton.addEventListener('click', async function () {
		const target = document.getElementById('username');
		const target_id = target.getAttribute('user_id');
		try {
	
			const result = await sendFriendRequest(target_id);
			Notification('Friend Action', 'You have sent a friend request!', 2,'request');
		} catch (error) {
			Notification('Friend Action', `Friend Request Failed because: ${error}`, 2, 'alert');
		}
	});

	settingButton.addEventListener('click', function () {
		navigateTo('settings', null); 
	});

	profileButton.addEventListener('click', function () {
		navigateTo('profile', null);
	});

	PONGButton.addEventListener('click', function () {
		navigateTo('PONG', null);
	});

	window.onload = function () {
		const hashView = location.hash.replace("#", "") || "login"; 
		navigateTo(hashView, null);
	};

	updateUsernameButton.addEventListener('click', async function () {
		const username = document.getElementById('new-username').value;
		if (username === window.userData.username) {
			Notification('Profile Action', 'You are already using that name!', 2, 'alert');
			return ;
		}
		try {
			const result = await updateUsername(username);
			Notification('Profile Action', 'You have updated your username!',2, 'profile');
		} catch (error) {
			Notification('Profile Action', `Failed to change Username because: ${error}`,2, 'alert');
		}
	});

	updateBioButton.addEventListener('click', async function () {
		const bio = document.getElementById('new-Bio').value;
		const old_bio = document.getElementById('profile-bio').textContent;
		if (bio === old_bio) {
			Notification('Profile Action', 'You are already using that bio', 2, 'alert');
			return ;
		}
		try {
			const result = await updateBio(bio);
			Notification('Profile Action', 'You have updated your bio!',2, 'profile');
		} catch (error) {
			Notification('Profile Action', `Failed to change bio because: ${error}`,2, 'alert');
		}
	});

	updatePwdButton.addEventListener('click', async function () {
		const curr_pwd = document.getElementById('current-password').value;
		const new_pwd = document.getElementById('new-password').value;
		const cfm_pwd = document.getElementById('new-confirm-password').value;
	
		try {
			const result = await updatePwd(curr_pwd, new_pwd, cfm_pwd);
			Notification('Profile Action', 'You have updated your password!',2, 'profile');
		} catch (error) {
			Notification('Profile Action', `${error}`,2, 'alert');
		}
	});

	deletebtn.addEventListener('click', function () {
		deleteModal.style.display = 'flex';
	});

	cancelDelete.addEventListener('click', function () {
		deleteModal.style.display = 'none';
  	});

  	confirmDelete.addEventListener('click', async function () {
		const password = document.getElementById('confirmPassworddelete').value;
		if (password) {
			try {
				await deleteAccount(password);
				navigateTo("login", null);
				localStorage.removeItem("accessToken");
				localStorage.removeItem("refreshToken");
				if (window.userData.chatSocket) {
					window.userData.chatSocket.close();
					window.userData.r_name = null;
					window.userData.chatSocket = null;
				}
				window.userData = {}
				userEmail = null;
				deleteModal.style.display = 'none';
			} catch(error){
				Notification('Profile Action', `Failed To Delete The Account: ${error.message}`, 2, 'alert');
			}
		} else {
			Notification('Profile Action', 'Please Enter Your Password First!', 2, 'alert');
		}
	});
});

const updateAvatarbtn = document.getElementById('updateavatar-btn');
updateAvatarbtn.addEventListener('click',async function () {
	const avatarInput = document.getElementById('new-avatar');
	if (avatarInput.files.length === 0) {
		Notification('Profile Action', 'Please select an avatar image to upload.',2, 'alert');
		return;
	}
	const formData = new FormData();
	formData.append('avatar', avatarInput.files[0]);
	try {
		const res = await updateAvatar(formData);
		Notification('Profile Action', 'You have updated your avatar!',2, 'profile');
	} catch (error) {
		Notification('Profile Action', `Failed to update Avatar because: ${error}`,2, 'alert');
	}

});

async function updateAvatar(formData) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');

		return ;
	}
	const url = baseUrl + 'api/home/settings/updateavatar/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
		},
		body: formData,
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		Notification('Profile Action', 'Please make sure the verification code is correct!', 2, 'alert');
		throw new Error(errorResponse.detail);
	}

	const data = await response.json();
	return data;
}