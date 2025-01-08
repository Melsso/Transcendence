import { loadProfile } from "./populatePageHelpers.js";
import { loadFriends, getFriends } from "./populateFriends.js";
import { launchSocket, loadMessages, getMessages, handleSend  } from "./chat.js";
import { adjustAccordionHeight, setAccordionMaxHeight } from "./confirm-password.js";
import { Habess, handleQuitting } from "./gamePvP.js";
let userEmail;
let flag = false;
let myflag = false;
let consentPrompt = false;
const baseUrl = process.env.ACTIVE_HOST;

async function blockedUsers() {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}
	const url = baseUrl + 'api/friends/blockedUsers/';
	const response = await fetch(url, {
		method: 'GET',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}
	const data = await response.json();
	return data;
}

async function blockUser(target) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}
	const url = baseUrl + 'api/friends/blockUser/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			target: target
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}
	const data = await response.json();
	return data;
}

async function unblockUser(target) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		throw new Error("No access token found.");
	}
	const url = baseUrl + 'api/friends/unblockUser/';
	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Authorization': `Bearer ${access_token}`,
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			target: target
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}
	const data = await response.json();
	return data;
}

async function refreshAccessToken() {
   const refreshToken = localStorage.getItem('refreshToken');
	if (!refreshToken || refreshToken.trim() === "") {
		return ;
	}
	const url = baseUrl + 'api/refresh-token/';
	const response = await fetch(url, {
    	method: 'POST',
    	headers: {
        	'Content-Type': 'application/json',
    	},
    	body: JSON.stringify({
        	refresh: refreshToken
    	}),
	});

	if (response.ok) {
    	const data = await response.json();
    	localStorage.setItem('accessToken', data.data.access);
		localStorage.setItem('refreshToken', data.data.refresh);
		scheduleTokenRefresh(localStorage.getItem('accessToken'));
	} else {
      Notification('Profile Action', 'Failed to refresh your token due to an unkown error, PLease refresh the page and log back in!', 2, 'alert');
	}
}

function decodeToken(token) {
	try {
		 const payload = JSON.parse(atob(token.split('.')[1]));
		 return payload;
	} catch (err) {
		 console.error('Failed to decode token:', err);
		 return null;
	}
}


function scheduleTokenRefresh(token) {
	const payload = decodeToken(token);
	if (payload && payload.exp) {

		const expirationTime = payload.exp * 1000;
		
		const currentTime = Date.now();
		const bufferTime = 60 * 1000;
		const delay = expirationTime - currentTime - bufferTime;

		if (delay > 0) {
		  setTimeout(() => {
				refreshAccessToken();
		  }, delay);
		} else {
			Notification('Profile Action', 'Your Token has expired due to an unkown issue, Please refresh the page and log back in!', 2, 'alert');
		}
	}
}

async function guestLogin() {
	const url = baseUrl + 'api/guest-login/';

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		Notification('Profile Action', "Login Failed!", 1, 'alert');
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

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
		localStorage.removeItem('refreshToken');
		navigateTo('login', null);
		throw errorResponse;
	}
	const data = await response.json();
	return data;
}

export async function userLookUp(searchTerm) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		// Same comment as above
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
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

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
		throw errorResponse;
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
		throw errorResponse;
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
		throw errorResponse;
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
		throw errorResponse;
	}
}

async function getUserData() {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/home/settings/requestUserData/';
	const response = await fetch (url, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}


export async function deleteMessages(target, password) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/home/settings/deleteMessages/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			target: target,
			password: password,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function deleteGames(password) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/home/settings/deleteGames/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			password: password,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function updatePrivacy(consent, password) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/home/settings/updatePrivacy/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			consent: consent,
			password: password,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}
	const data = await response.json();
	return data;
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
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function updateEmail(email) {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}

	const url = baseUrl + 'api/home/settings/updateEmail/';
	const response = await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
		body: JSON.stringify({
			email: email,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
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
		throw errorResponse;
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
		throw errorResponse;
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
		// Notification('Profile action', "Account Deletion Failed", 1, 'alert');
		throw errorResponse;
	}

	const data = await response.json();
	return data;
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
		throw errorResponse;
	}

	const data = await response.json();
	return data;
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
		// Notification('Profile Action', "Login Failed!", 1, 'alert');
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function getLogs(uname) {
	const url = baseUrl + 'api/get-logs/';

	const response = await fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: uname,
		}),
	});

	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}
	const data = await response.json();
	return data.flag;
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
		// Notification('Profile Action', 'Please make sure the verification code is correct!', 1, 'alert');
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function UpdateTwoFactorAuth() {
	const access_token = localStorage.getItem('accessToken');
	if (!access_token) {
		Notification('Profile Action', "No access Token!", 2, 'alert');
		return ;
	}
	const url = baseUrl + 'api/home/settings/updateTwoFactorAuth/';
	const response =  await fetch (url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${access_token}`,
		},
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

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
	if (resizeGame) {
		Habess();
		handleQuitting();
	}
	let url = baseUrl + 'api/logout/';
	if (window.userData.guest === true) {
		url = baseUrl+ 'api/guest-logout/'
	}
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
		if (window.userData?.socket) {
			window.userData.socket.close();
			window.userData.socket = null;
			window.userData.r_name = null;
			window.userData.target = null;
		}
		if (window.userData?.pong_socket) {
			window.userData.pong_socket.close();
			window.userData.pong_socket = null;
		}
		window.userData = {};
		userEmail = null;
	}
	else {
		const errorResponse = await response.json();
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function forceLogin(username, password) {
	const url = baseUrl + 'api/force-login/';

	const response = await fetch(url, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			username: username,
			password: password,
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		// Notification('Profile Action', "Login Failed!", 1, 'alert');
		throw errorResponse;
	}

	const data = await response.json();
	return data;
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
		throw errorResponse;
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
	const facontainer = document.getElementById('Tfa-container');
	const ai_menu = document.getElementById('ai-menu');
	const Instructions = document.getElementById('Instructions-box');
	const lobby = document.getElementById('pong-inv-container');
	const menu = document.getElementById('menuuu');
	const qContainer = document.getElementById('Queue');
	const toggle = document.getElementById('2fa-toggle');
	const force = document.getElementById('force-container');
	const insButton = document.getElementById('return-to-menu-ins');
	const moreSettings = document.getElementById('Additional-settings-form');

	moreSettings.style.display = 'none';
	insButton.style.display = 'none';
	force.style.display = 'none';
	qContainer.style.display = 'none';
	mainOne.style.display = 'none';
	lobby.style.display = 'none';
	log1.style.display = 'none';
	forgotcontainer.style.display = 'none';
	newpass.style.display = 'none';
	mainTwo.style.display = 'none';
	mainBody.style.display = 'none';
	mainSettings.style.display = 'none';
	mainPONGgame.style.display = 'none';
	facontainer.style.display = 'none';
	const passwordtogglebtn = document.getElementById('toggle-password');
	const additionalBtn = document.getElementById('additional-settings-btn');
	const profileMenu = document.getElementById('dropdown-container-profile');
	const guestButton = document.getElementById('guest-login');
	const forceButton = document.getElementById('force-login');
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
	const updateEmailButton = document.getElementById('updateUserEmail-btn');
	const updatePwdButton = document.getElementById('updatePwd-btn');
	const friendButton = document.getElementById('friend-list-btn');
	const TonewpassButton = document.getElementById('to-new-pass');
	const forgotButton = document.getElementById('forgot-btn');
	const Tlobby = document.getElementById('pong-tournament');
	const ShowPrivacy = document.getElementById('show-privacy');
	
	const deletebtn = document.getElementById('delete-account');
	const deleteModal = document.getElementById('deleteModal');
	const confirmDelete = document.getElementById('confirmDelete');
	const cancelDelete = document.getElementById('cancelDelete');	
	
	const delMsgBtn = document.getElementById('delete-messages-btn');
	const delMsgModal = document.getElementById('deleteMsgModal');
	const confirmDelMsgBtn = document.getElementById('confirmDeleteMsg');
	const cancelDelMsgBtn = document.getElementById('cancelDeleteMsg');

	const delGamesBtn = document.getElementById('delete-games-btn');
	const delGamesModal = document.getElementById('deleteGamesModal');
	const confirmDelGamesBtn = document.getElementById('confirmDeleteGames');
	const cancelDelGamesBtn = document.getElementById('cancelDeleteGames');
	
	const delPrivMsgModal = document.getElementById('deletePrvMsgModal');
	
	const changePolicyBtn = document.getElementById('change-privacy-settings-btn');
	const changePolicyModal = document.getElementById('changePrivacyModal');
	const confirmPolicyChange = document.getElementById('confirmPolicyChange');
	const cancelPolicyChange = document.getElementById('cancelPolicyChange');

	const requestUserDataBtn = document.getElementById('request-data-btn');
	const openModalTerms = document.getElementById('open-terms-reg');


	async function showView(view, data) {
		if (window.userData?.tournoi && window.userData.tournoi.in === true) {
			window.userData.tournoi.players = window.userData.tournoi.players.filter(player => player.username !== window.userData.username);
			if (window.userData.tournoi.owner === window.userData.username) {
				window.userData.tournoi.owner = window.userData.tournoi.players[0].username;
			}
			handleSend(null, window.userData.tournoi.Slobby, 'TNotification', null, window.userData.tournoi.players, window.userData.tournoi.owner);
			window.userData.tournoi = null;
		}
		if (!localStorage.getItem('accessToken') && window.userData?.accessToken) {
			if (window.userData?.socket) {
				window.userData.socket.close();
				window.userData.socket = null;
				window.userData.target = null;
			}
			if (window.userData?.pong_socket) {
				window.userData.tmp_room = window.userData.r_name;
				await window.userData.pong_socket.close();
				window.userData.pong_socket = null;
			}
			window.userData = {};
			userEmail = null;
			navigateTo('login', null);
			return ;
		}
		if (view !== 'login' && view !== 'register' && view !== '2fa' && view !== 'forgot' && view !== 'force' && !window.userData?.accessToken && !localStorage.getItem('accessToken')) {
			navigateTo('login', null);
			return;
		}
		if (myflag === false && !window.userData?.acessToken && localStorage.getItem('accessToken')) {
			myflag = true;
			if (window.userData?.pong_socket) {
				window.userData.tmp_room = window.userData.r_name;
				window.userData.pong_socket.close();
				window.userData.pong_socket = null;
				window.userData.r_name = null;
			}
			navigateTo('profile', null);
			return ;
		}
		if (window.userData?.pong_socket) {
			window.userData.tmp_room = window.userData.r_name;
			window.userData.pong_socket.close();
			window.userData.pong_socket = null;
			window.userData.r_name = null;
		}
		if (!localStorage.getItem('accessToken') && window.userData?.guest && window.userData.guest === true) {
			return;
		}
		altFfour();
		leaving();
		Habess();
		deleteModal.style.display = 'none';
		delPrivMsgModal.style.display = 'none';
		delMsgModal.style.display = 'none';
		delGamesModal.style.display = 'none';
		changePolicyModal.style.display = 'none';
		force.style.display = 'none';
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
		insButton.style.display = 'none';
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
			mainTwo.style.display = 'flex';
			mainBody.style.display = 'flex';
			setAccordionMaxHeight();
			adjustAccordionHeight();
			try {
				let guest = null;
				if (data === null) {
					const result = await homepageData();
					if (result['user'].Twofa_auth === true && !toggle.classList.contains('on')) {
						toggle.classList.toggle('on');
					} else {
						toggle.classList.remove('on');
					}
					if (window.userData?.guest  && window.userData.guest === true) {
						guest = true;
					} else {
						guest = false;
					}
					const sock = window.userData.socket;
					const target = window.userData.target;
					const list = window.userData['online'];
					window.userData = result["user"];
					window.userData.accessToken  = localStorage.getItem('accessToken');
					window.userData['target'] = target;
					if (guest) {
						window.userData.guest = guest;
						window.userData.avatar = 'media/avatars/avatar1.svg';
					}
					window.userData['online'] = list;
					if (!sock || sock.readyState !== WebSocket.OPEN) {
						const u = new URL(baseUrl);
						const accessToken = localStorage.getItem('accessToken');
						const chatSocket = new WebSocket(`wss://${u.host}/ws/?token=${accessToken}`);
						window.userData.socket = chatSocket;						
						window.userData["target"] = "Global";
						launchSocket();
					} else {
						
						window.userData.socket = sock;
					}
					profileMenu.innerHTML = '';

					loadProfile(result);
					const res = await getMessages();
					loadMessages(res["list"]);
				}
				else {
					const calleruser = data['user'];
					if (window.userData["username"] !== calleruser['username']) {
						const result = await blockedUsers();
						createDropDownProfile(calleruser['username'], calleruser['id'], result.blocked_list);
					}
					else {
						profileMenu.innerHTML = '';
					}
					loadProfile(data);						
				}
			} catch (error) {
				// check if error is unauthorized
				// call the refresh function
				// refreshAccessToken();
				// navigateTo('profile', data);
				Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
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
		} else if (view === 'force') {
			mainOne.style.display = 'flex';
			force.style.display = 'block';
		}
	}

	forceButton.addEventListener('click', async function (e){
		e.preventDefault();
		const username = document.getElementById('forceUsername').value;
		const password = document.getElementById('force-password').value;
		document.getElementById('forceUsername').value = '';
		document.getElementById('force-password').value = '';
		try {
			const results = await forceLogin(username, password);
			const tokens = results.tokens;
			const host_check = await checkKnownLocation(tokens.access);
			localStorage.setItem('accessToken', tokens.access);
			localStorage.setItem('refreshToken', tokens.refresh);
			window.userData.accessToken = localStorage.getItem('accessToken');
			scheduleTokenRefresh(localStorage.getItem('accessToken'));
			if (host_check['2fa'] === false) {
				navigateTo('profile', null);
			}
			else {
				navigateTo('2fa', null);
				return ;
			}
		} catch (error) {
			Notification('Profile Action', `Failed to login because: ${error.detail}`, 1,'alert');
		}
	});

	window.addEventListener('popstate', function (event) {
		if (event.state && event.state.view) {
			showView(event.state.view, null);
		} else  if (localStorage.getItem('accessToken')){
			showView('profile', null);
	  } else {
			showView('login', null);
	  }
	});


	openModalTerms.addEventListener('click', function () {
		createTermsModal();
	})

	forgotButton.addEventListener('click', function() {
		navigateTo('forgot', null);
	});

	function navigateTo(view, data) {
		if (view !== 'profile' && view !=='PONG' && view !== 'login' && window.userData?.guest && window.userData.guest === true) {
			Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
			return ;
		}
		history.pushState({ view: view }, null, `#${view}`);
		showView(view, data);
	}
	window.navigateTo = navigateTo;

	toggle.addEventListener('click', async function() {
		toggle.classList.toggle('on');
		try {
			await UpdateTwoFactorAuth();
			Notification('Profile Action', 'You have changed your 2fa status!', 2, 'profile');
		} catch(error) {
			Notification('Profile Action', 'Something Went Wrong, Please Relog', 2, 'alert');
		}
	});


	TonewpassButton.addEventListener('click', async function() {
		const input_email = document.getElementById('forgotmail').value;
		document.getElementById('forgotmail').value = '';
		try {
			await checkEmail(input_email);
			document.getElementById('forgot-container').style.display = 'none';
			document.getElementById('create-new-pass').style.display = 'block';
		} catch(error) {
			Notification('Profile Action', 'This email doesn\'t belong to any account!', 1, 'alert');
		}
		confirmButton.addEventListener('click', async function() {
			const verf = document.getElementById('verf-code').value;
			const new_pass = document.getElementById('New Password-R').value;
			const conf_new = document.getElementById('Confirm-New-Password').value;
			document.getElementById('verf-code').value = '';
			document.getElementById('New Password-R').value = '';
			document.getElementById('Confirm-New-Password').value = '';
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

	additionalBtn.addEventListener('click', function () {
		if (moreSettings.style.display === 'none' || moreSettings.style.display === '') {
			moreSettings.style.display = 'flex';
	  	} else {
			moreSettings.style.display = 'none';
	  	}
	})

	ShowPrivacy.addEventListener('click', function () {
		createTermsModal();
	})

	guestButton.addEventListener('click', async function() {
		if (localStorage.getItem('accessToken')) {
			navigateTo('profile', null);
			return;
		}
		try {
			const result = await guestLogin();
			const tokens = result.tokens;
			localStorage.setItem('accessToken', tokens.access);
			localStorage.setItem('refreshToken', tokens.refresh);
			window.userData['guest'] = true;
			scheduleTokenRefresh(localStorage.getItem('accessToken'));
			navigateTo('profile', null);
		} catch (error) {
			Notification('Profile Action', `Failed to login because: ${error}`, 1,'alert');
		}
	});

	loginButton.addEventListener('click', async function () {
		const username = document.getElementById('username-login').value;
		const password = document.getElementById('password-login').value;
		document.getElementById('username-login').value = '';
		document.getElementById('password-login').value = '';
		// if (!consentPrompt) {
		// 	Notification('User Action', 'You Have Not Consented To Our Privacy Policy, Please Log In As A Guest.', 1, 'alert');
		// 	return ;
		// }
		let loged_in = false;
		try {
			loged_in = await getLogs(username);
		} catch (error) {
			Notification('Profile Action', 'Please Stand By For A Few Seconds...', 1, 'alert');
		}
		if (loged_in) {
			Notification('Profile Action', 'You are connected on another device/browser, Please log out first to be able to Log in here!', 1, 'alert');
			LoginNotification('Profile Action', 'Click here if you wanna force login to your account!');
			return;
		}
		if (localStorage.getItem('accessToken')) {
			navigateTo('profile', null);
			return;
		}
		// need to save wether remember or not for next call
		try {
			const result = await loginUser(username, password);
			const tokens = result.tokens;
			const host_check = await checkKnownLocation(tokens.access);
			localStorage.setItem('accessToken', tokens.access);
			localStorage.setItem('refreshToken', tokens.refresh);
			window.userData.accessToken = localStorage.getItem('accessToken');
			scheduleTokenRefresh(localStorage.getItem('accessToken'));
			if (host_check['2fa'] === false) {
				navigateTo('profile', null);
			}
			else {
				navigateTo('2fa', null);
				return ;
			}
		} catch (error) {
			Notification('Profile Action', `Failed to login because: ${error.detail}`, 1,'alert');
		}
	});

	login2faButton.addEventListener('click', async function () {
		const v_code = document.getElementById('2fa-input').value;
		document.getElementById('2fa-input').value = '';
		const l1 = document.getElementById('2fa-yes');
		const r_value = l1.checked;
		try {
			const result = await addToKnownLocation(v_code, r_value);
			if (result.status === 'success') {
				navigateTo('profile', null);
			}
		} catch (error) {
			Notification('User Action', `Failed To Verify Origin: ${error.detail}`, 1, 'alert');
			localStorage.removeItem('accessToken');
			localStorage.removeItem('refreshToken');
			navigateTo('login', null);
		}
	});

	nextButton.addEventListener('click', async function () {
		const username = document.getElementById('username-R').value;
		const password = document.getElementById('password-R').value;
		const email = document.getElementById('email-R').value;
		document.getElementById('username-R').value = '';
		document.getElementById('password-R').value = '';
		document.getElementById('email-R').value = '';
		try {
			const result = await registerUser(username, password, email);
			userEmail = result.user_email;
			Notification('Profile Action', 'Registration Successful',1, 'profile');

			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'none';
			document.getElementById('second-reg-container').style.display = 'block';
		} catch (error) {
			Notification('Profile Action', `Failed to Register because: ${error.detail}`,1, 'alert');

			document.getElementById('login-form-container').style.display = 'none';
			document.getElementById('register-form-container').style.display = 'block';
			document.getElementById('second-reg-container').style.display = 'none';
		}
	});

	registerButton.addEventListener('click', async function () {
		const termsCheckbox = document.getElementById('terms-checkbox');
		if (!termsCheckbox.checked) {
			Notification('Register Action', 'You Have Not Agreed To Terms And Conditions, Please Agree To Complete Registration!', 1, 'alert');
			return ;
		}
		const avatarInput = document.getElementById('avatar');
		const avatarSelectionResult = document.getElementById('avatar-selection-result');
		const selectedImage = avatarSelectionResult.querySelector('img');
		const verification_code = document.getElementById('verification-code').value;
		document.getElementById('verification-code').value = '';
		const formData = new FormData();
		formData.append('code', verification_code);
		formData.append('email', userEmail);
		const file = avatarInput.files[0];
		const MAX_SIZE = 2 * 1024 * 1024; 
		if (file.size > MAX_SIZE) {
			Notification('Profile Action', 'The selected file is too large. Please select an image smaller than 2 MB.', 2, 'alert');
			return;
		}
		if (avatarInput.files.length > 0) {
			formData.append('avatar', avatarInput.files[0]);
	  } else if (selectedImage) {
			try {
				const response = await fetch(selectedImage.src); 
				const blob = await response.blob(); 
				const file = new File([blob], selectedImage.src.split('/').pop(), { type: blob.type }) 
				formData.append('avatar', file);  
		  	} catch (error) {
				Notification('Profile Action', `Failed to fetch preset avatar: ${error.detail}`, 1, 'alert');
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
			Notification('Profile Action', `Failed to verify email because: ${error.detail}`,1, 'alert');
			navigateTo('register', null); 
		}
	});

	logoutButton.addEventListener('click', async function () {
		try {
			await logoutUser();
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	
		document.getElementById('register-form-container').style.display = 'none';
		document.getElementById('second-reg-container').style.display = 'none';
		document.getElementById('login-form-container').style.display = 'block';

		navigateTo('login', null); 
	});

	searchButton.addEventListener('click', async function () {
		const uname = document.getElementById('search-user-input').value;
		if (uname.trim() === "") {
			Notification('Search Action', 'Please fill the input field!', 2, 'alert');
			return ;
		}
		document.getElementById('search-user-input').value = '';
		if (!localStorage.getItem('accessToken') && window.userData?.accessToken) {
			if (window.userData?.socket) {
				window.userData.socket.close();
				window.userData.socket = null;
				window.userData.r_name = null;
				window.userData.target = null;
			}
			if (window.userData?.pong_socket) {
				window.userData.pong_socket.close();
				window.userData.pong_socket = null;
			}
			window.userData = {};
			userEmail = null;
			navigateTo('login', null);
			return ;
		}
		try {
			const result = await userLookUp(uname);
			if (result['user'] !== null) {
				navigateTo('profile', result);
			}
			else {
				Notification('Search', 'No such user found!', 2, 'alert');
			}
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	});

	friendButton.addEventListener('click', async function () {
		if (window.userData.guest === true) {
			Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
			return ;
	  }
		try {
			const result = await getFriends();
			loadFriends(result, userData.id);

		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	});

	passwordtogglebtn.addEventListener('click', function () {
		const passwordInput = document.getElementById("password-login");
		const toggleButton = document.getElementById("toggle-password");
		if (passwordInput.type === "password") {
			 passwordInput.type = "text";
			 toggleButton.textContent = "🙈";
		} else {
			 passwordInput.type = "password";
			 toggleButton.textContent = "👁️";
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
		document.getElementById('new-username').value = '';
		if (username === window.userData.username) {
			Notification('Profile Action', 'You are already using that name!', 2, 'alert');
			return ;
		}
		try {
			const result = await updateUsername(username);
			Notification('Profile Action', 'You have updated your username!',2, 'profile');
			navigateTo('profile', null);
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`,2, 'alert');
		}
	});

	updateEmailButton.addEventListener('click', async function() {
		const email = document.getElementById('new-useremail').value;
		document.getElementById('new-useremail').value = '';
		if (window.userData.email === email) {
			Notification('Profile Action', 'You are already using that email!', 2, 'alert');
			return ;
		}
		try {
			const result = await updateEmail(email);
			Notification('Profile Action', 'You have updated your email!', 2, 'profile');
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	});

	updateBioButton.addEventListener('click', async function () {
		const bio = document.getElementById('new-Bio').value;
		document.getElementById('new-Bio').value = '';
		const old_bio = document.getElementById('profile-bio').textContent;
		if (bio === old_bio) {
			Notification('Profile Action', 'You are already using that bio', 2, 'alert');
			return ;
		}
		try {
			const result = await updateBio(bio);
			Notification('Profile Action', 'You have updated your bio!', 2, 'profile');
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	});

	function convertToCsv(data, sectionTitle) {
		if (!Array.isArray(data) || data.length === 0) {
			return `${sectionTitle}: No data available`;
		}
		const headers = Object.keys(data[0]);
		const rows = data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','));
		return `\n\n${sectionTitle}\n` + [headers.join(','), ...rows].join('\n');
	}

	function generateFile(fileName, data, format) {
		let fileContent = '';

		fileContent += convertToCsv(data.match_history, 'Match History');
		fileContent += convertToCsv(data.friends, 'Friends');
		fileContent += convertToCsv(data.messages, 'Messages');
		fileContent += convertToCsv([data.profile_data], 'Profile Data');
		const mimeType = 'text/csv';
		const blob = new Blob([fileContent], { type:mimeType });
		const link = document.createElement('a');
		link.href = URL.createObjectURL(blob);
		link.download = `${fileName}.${format}`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	}

	requestUserDataBtn.addEventListener('click', async function() {
		try {
			var gdata = window.userData;
			delete gdata.socket;
			delete gdata.target;
			delete gdata.online;
			delete gdata.match_history;
			const result = await getUserData();
			gdata['consent_time'] = result.consent_date;
			gdata['creation_time'] = result.consent_date;
			const combinedData = {
				match_history: result.data.match_history,
				friends: result.data.friends,
				messages: result.data.messages,
				profile_data: gdata
			};
			generateFile('user_data', combinedData, 'csv');
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	});
	
	cancelDelMsgBtn.addEventListener('click', function() {
		delMsgModal.style.display = 'none';
	});
	delMsgBtn.addEventListener('click', function() {
		delMsgModal.style.display = 'flex';
	});
	confirmDelMsgBtn.addEventListener('click', async function() {
		const pswdElement = document.getElementById('confirmPassMessages');
		const pswd = pswdElement.value;
		pswdElement.value = '';
		try {
			const result = await deleteMessages(null, pswd);
			Notification('Profile Action', `Update: ${result.detail}`, 2, 'profile');
			delMsgModal.style.display = 'none';
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');
		}
	});

	cancelDelGamesBtn.addEventListener('click',  function() {
		delGamesModal.style.display = 'none';
	});
	delGamesBtn.addEventListener('click',  function() {
		delGamesModal.style.display = 'flex';
	});
	confirmDelGamesBtn.addEventListener('click', async function() {
		const pswdElement = document.getElementById('confirmPassGames');
		const pswd = pswdElement.value;
		pswdElement.value = '';
		try {
			const result = await deleteGames(pswd);
			if (result.status === 'success') {
				Notification('Profile Action', 'All Games Have Been Deleted', 2, 'profile');
				delGamesModal.style.display = 'none';
			}
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`,2, 'alert');
		}
	});

	changePolicyBtn.addEventListener('click',  function() {
		changePolicyModal.style.display = 'flex';
	});
	cancelPolicyChange.addEventListener('click',  function() {
		changePolicyModal.style.display = 'none';
	});
	confirmPolicyChange.addEventListener('click', async function() {
		const pswdElement = document.getElementById('confirmPassPolicy');
		const pswd = pswdElement.value;
		pswdElement.value = '';
			try {
				const result = await updatePrivacy(false, pswd);
				if (result.status === 'success' && result.detail === 'Privacy Policy Updated') {
					Notification('Profile Action', 'You Have Agreed To Our Privacy Policy.', 2, 'profile');
					delMsgModal.style.display = 'none';
					return ;
				}
				if (window.userData.socket) {
					window.userData.socket.close();
				}
				window.userData = {};
				localStorage.removeItem('refreshToken');
				localStorage.removeItem('accessToken');
				delMsgModal.style.display = 'none';
				navigateTo('login', null);
				Notification('Profile Action', 'You Have Refused Our Privacy Policy, Please Use A Guest Account.', 1, 'alert');
			} catch (error) {
				Notification('Profile Action', `Error: ${error.detail}`,2, 'alert');
			}
	});
	
	updatePwdButton.addEventListener('click', async function () {
		const curr_pwd = document.getElementById('current-password').value;
		const new_pwd = document.getElementById('new-password').value;
		const cfm_pwd = document.getElementById('new-confirm-password').value;
		document.getElementById('current-password').value = '';
		document.getElementById('new-password').value = '';
		document.getElementById('new-confirm-password').value = '';
		try {
			const result = await updatePwd(curr_pwd, new_pwd, cfm_pwd);
			Notification('Profile Action', 'You have updated your password!',2, 'profile');
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`,2, 'alert');
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
		document.getElementById('confirmPassworddelete').value = '';
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
				Notification('Profile action', "Account deleted successfully!", 1, 'profile');
			} catch(error){
				Notification('Profile Action', `Failed To Delete The Account: ${error.detail}`, 2, 'alert');
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
	const file = avatarInput.files[0];
	const MAX_SIZE = 2 * 1024 * 1024; 
	if (file.size > MAX_SIZE) {
		Notification('Profile Action', 'The selected file is too large. Please select an image smaller than 2 MB.', 2, 'alert');
		return;
	}
	const formData = new FormData();
	formData.append('avatar', avatarInput.files[0]);
	try {
		const res = await updateAvatar(formData);
		Notification('Profile Action', 'You have updated your avatar!',2, 'profile');
	} catch (error) {
		Notification('Profile Action', `Error: ${error.detail}`,2, 'alert');
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
		throw new Error(errorResponse);
	}

	const data = await response.json();
	return data;
}

async function createDropDownProfile(friendUname, friendId, block_list) {
	const isUsernamePresent = block_list.some(item => item.friend_data.username === friendUname);
	if (isUsernamePresent) {
		flag = true;
	}
	const container = document.getElementById('dropdown-container-profile');
	if (document.getElementById('profileDropDownMenu')) {
		document.getElementById('profileDropDownMenu').remove();
	}
	const actions = ['Add Friend', 'Block User'];
	const dropdownDiv = document.createElement('div');
	dropdownDiv.className = 'dropdown dropend';
	dropdownDiv.style.display = 'block';
	dropdownDiv.style.visibility = 'visible';
	dropdownDiv.style.opacity = '1';

	const uniqueDropdownId = `Button${friendUname}`;
	const uniqueDropdownMenuId = `Menu${friendUname}`;

	const dropdownButton = document.createElement('button');
	dropdownButton.className = 'btn';
	dropdownButton.type = 'button';
	dropdownButton.style.color = 'white';
	dropdownButton.id = uniqueDropdownId;
	dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
	dropdownButton.setAttribute('aria-expanded', 'false');
	dropdownButton.innerHTML = '&#8226;&#8226;&#8226;';
	const dropdownMenu = document.createElement('ul');
	dropdownMenu.className = 'dropdown-menu';
	dropdownMenu.id = uniqueDropdownMenuId;
	dropdownMenu.setAttribute('aria-labelledby', dropdownButton.id);
	actions.forEach(action => {
		const li = document.createElement('li');
		const a = document.createElement('a');
		a.className = 'dropdown-item';
		a.href = '#';
		if (action === 'Block User' && flag) {
			a.textContent = 'Unblock User';
		} else {
			a.textContent = action;
		}
		a.addEventListener('click', (event) => {
			event.preventDefault();
			handleprofileAction(action, friendUname, friendId, a);
		});
		li.appendChild(a);
		dropdownMenu.appendChild(li);
	});
	dropdownDiv.appendChild(dropdownButton);
	dropdownDiv.appendChild(dropdownMenu);
	container.appendChild(dropdownDiv);
}

async function handleprofileAction(action, targetuname, targetID, a) {
	if (window.userData.guest === true) {
		Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
		return ;
	}
	switch(action) {
		case 'Add Friend':
			try {
				const result = await sendFriendRequest(targetID);
				Notification('Friend Action', 'You have sent a friend request!', 2 ,'request');
			} catch (error) {
				var type = 'alert';
				if (error?.flag) {
					type = 'profile';
				}
				Notification('Friend Action', `${error.detail}`, 2, type);
			}
			break;
		case 'Block User':
			try {
				var result;
				if (flag) {
					result = await unblockUser(targetuname);
					flag = false;
				} else {
					result = await blockUser(targetuname);
				}
				Notification('Friend Action', `${result.detail}`, 2, 'profile');
				const res = await userLookUp(targetuname);
				navigateTo('profile', res);
			} catch (error) {
				Notification('Friend Action', `Error ${error.detail}`, 2, 'alert');
			}
			break;
	}
}

function createTermsModal() {
	const existingModal = document.getElementById('terms-modal');
	if (existingModal) {
		 existingModal.remove();
	}
	const modal = document.createElement('div');
   modal.id = 'terms-modal';
   modal.style.position = 'fixed';
   modal.style.top = '0';
   modal.style.left = '0';
   modal.style.width = '100vw';
	modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
   modal.style.height = '100vh';
   modal.style.display = 'flex';
   modal.style.justifyContent = 'center';
   modal.style.alignItems = 'center';
   modal.style.zIndex = '1000';
   const modalContent = document.createElement('div');
   modalContent.style.width = '60%';
	modalContent.style.height = '95%';
   modalContent.style.borderRadius = '10px';
   modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
   modalContent.style.textAlign = 'center';
	modalContent.style.position = 'relative';
	const closeButton = document.createElement('button');
	closeButton.textContent = '✖'; 
	closeButton.style.position = 'absolute';
	closeButton.style.top = '10px';
	closeButton.style.right = '10px';
	closeButton.style.color = '#333'; 
	closeButton.style.border = 'none'; 
	closeButton.style.fontSize = '20px'; 
	closeButton.style.cursor = 'pointer';
   
   closeButton.addEventListener('click', () => {
       modal.remove();
   });
   modal.appendChild(modalContent);
   document.body.appendChild(modal);
	const ContentPolicy = createPolicyDetailsElement();
	modalContent.appendChild(ContentPolicy);
   modalContent.appendChild(closeButton);
}

function createPolicyDetailsElement() {

   const polDet = document.createElement('div');
   polDet.id = 'pol-det';

    const addSection = (headingText, paragraphHTML) => {
        const heading = document.createElement('h2');
        heading.className = 'p-1';
        heading.textContent = headingText;
        polDet.appendChild(heading);

        const paragraph = document.createElement('p');
        paragraph.className = 'p-1';
        paragraph.innerHTML = paragraphHTML;
        polDet.appendChild(paragraph);
    };

    addSection('Introduction', `
        We are just a few developers having a fun time creating an online PongGame for our school project!<br>
        This privacy policy explains how we collect, use and protect your personal data in accordance with the General Data Protection Regulation (GDPR).<br>
        Legal obligations: No action required.<br>
    `);

    addSection('What Data We Collect', `
        Registered Accounts: username, email, profile picture, profile biography, match history of games played, and hostname.<br>
        Guest Accounts: temporary session identifiers (e.g., cookies or tokens).<br>
        Messaging Data: chat messages are stored for 6 months and then deleted afterwards, they can also be deleted on request.<br>
        Technical Data: temporary session identifiers (e.g., cookies or tokens).<br>
    `);

    addSection('How We Use Your Data.', `
        Account creation and management.<br>
        Gameplay functionality (e.g., matchmaking, storing preferences, match history).<br>
        Communication (e.g., messaging between players, global chat).<br>
    `);

    addSection('Legal Basis For Processing', `
        Contract: Account creation and gameplay require processing personal data.
    `);

    addSection('How Long We Store Data', `
        Account Data: Until the account is deleted by the user.<br>
        Gameplay Data: Retained for 6 months for analytics and better user experience.<br>
        Messaging Data: Retained for 6 months, unless deleted by the user.<br>
        Cookies: Retention for as long as a user is the website tab is open.<br>
    `);

    addSection('Who We Share Data With', `
        Your data is not shared with any 3rd party software and or company.
    `);

    addSection('Your Rights Under GDPR', `
        Access: You can request a copy of the personal data we hold about you.<br>
        Rectification: You can update or correct inaccurate data in your profile.<br>
        Erasure: You can delete your account, which will remove your data from our system.<br>
        Objection: You can object to the processing of your data for certain purposes.<br>
        Withdraw Consent: You can change your preferences for optional data processing at any time (our website does not contain any optional data processing).<br>
    `);

    addSection('Security Measures', `
        Encryption for sensitive information (e.g., passwords, communications).<br>
        Access controls to limit data exposure.<br>
    `);

    addSection('Cookies And Tracking', `
        We are currently using one session cookie which stores your session data, it can be cleared and erased manually through the inspect toolbox.
    `);

    addSection('Data Breaches', `
        Notify authorities within 72 hours.<br>
        Inform affected users promptly.<br>
    `);

    addSection('Changes To The Privacy', `
        Notify users when significant changes are made.<br>
        Last updated on 22 November 2024.<br>
    `);

    addSection('Contact Information', `
        Email address: your.pong.website@gmail.com
    `);


    return polDet;
}