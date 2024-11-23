import { loadProfile } from "./populatePageHelpers.js";
import { loadFriends, getFriends } from "./populateFriends.js";
import { launchSocket, loadMessages, getMessages  } from "./chat.js";
import { adjustAccordionHeight, setAccordionMaxHeight } from "./confirm-password.js";
import { Habess } from "./gamePvP.js";
let userEmail;
let consentPrompt;
const baseUrl = process.env.ACTIVE_HOST;

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
      })
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

async function deleteMessages(target) {
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
		}),
	});
	if (!response.ok) {
		const errorResponse = await response.json();
		throw errorResponse;
	}

	const data = await response.json();
	return data;
}

async function deleteGames() {
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
	// here need to display some typa banner which contains a disclaimer as well as what the person decides to opt for
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
	const privacyPop = document.getElementById('privacy-policy');
	const policyActionWrapper = document.getElementById('policy-action-wrapper');
	const policyDetailsWrapper = document.getElementById('policy-details-wrapper');
	
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
	policyDetailsWrapper.style.display = 'none';
	privacyPop.style.display = 'flex';
	policyActionWrapper.style.display = 'flex';

	const profileMenu = document.getElementById('dropdown-container-profile');
	const guestButton = document.getElementById('guest-login');
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
	const updateEmailButton = document.getElementById('updateUserEmail-btn');
	const updatePwdButton = document.getElementById('updatePwd-btn');
	const friendButton = document.getElementById('friend-list-btn');
	// const sendFriendRequestButton = document.getElementById('add-friend');
	const TonewpassButton = document.getElementById('to-new-pass');
	const forgotButton = document.getElementById('forgot-btn');
	const Tlobby = document.getElementById('pong-tournament');
	const privacyAccept = document.getElementById('privacy-accept');
	const privacyDetails = document.getElementById('privacy-details');
	const privacyRefuse = document.getElementById('privacy-refuse');
	const privacyReturn = document.getElementById('privacy-return');

	async function showView(view, data) {
		if (window.userData.pong_socket) {
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
				let guest;
				if (data === null) {
					
					const result = await homepageData();
					
					if (result['user'].Twofa_auth === true && !toggle.classList.contains('on')) {
						toggle.classList.toggle('on');
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
					window.userData['target'] = target;
					if (guest) {
						window.userData.guest = guest;
					}
					window.userData['online'] = list;
					
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
					profileMenu.innerHTML = '';
					loadProfile(result);
					const res = await getMessages();
					loadMessages(res["list"]);
				}
				else {
					const calleruser = data['user'];
					if (window.userData["username"] !== calleruser['username']) {
						createDropDownProfile(calleruser['username'], calleruser['id']);
					}
					else {
						profileMenu.innerHTML = '';
					}
					loadProfile(data);						
				}
				
				mainTwo.style.display = 'flex';
				mainBody.style.display = 'flex';
				setAccordionMaxHeight();
				adjustAccordionHeight();
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

		}
	}

	window.addEventListener('popstate', function (event) {
		if (event.state && event.state.view) {
			showView(event.state.view);
		}
	});
	
	privacyAccept.addEventListener('click', function() {
		console.log('Privacy Accepted!');
		privacyPop.style.display = 'none';
		Notification('User Action', 'You Have Accepted Our Policy Privacy! If You\'ve Changed Your Mind, Please Register And Edit Your Privacy Settings.', 1, 'profile');
		consentPrompt = true;
	});

	privacyRefuse.addEventListener('click', function() {
		console.log('Privacy Refused');
		privacyPop.style.display = 'none';
		Notification('User Action', 'You Have Refused Our Policy Privacy, You Can Not Use Our Website... Refresh If You\'ve Changed Your Mind!', 1, 'alert');
		consentPrompt = false;
	});

	privacyDetails.addEventListener('click', function() {
		console.log('Privacy details!');
		policyActionWrapper.style.display = 'none';
		policyDetailsWrapper.style.display = 'flex';
	});

	privacyReturn.addEventListener('click', function() {
		console.log('Returning from privacy details');
		policyDetailsWrapper.style.display = 'none';
		policyActionWrapper.style.display = 'flex';
	})

	forgotButton.addEventListener('click', function() {
		navigateTo('forgot', null);
	});

	function navigateTo(view, data) {
		if (view !== 'profile' && view !=='PONG' && view !== 'login' && window.userData?.guest &&window.userData.guest === true) {
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
	})
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

	guestButton.addEventListener('click', async function() {
		try {
			const result = await guestLogin();
			const tokens = result.tokens;
			if (localStorage.getItem('accessToken')) {
				Notification('Profile Action', 'You are connected in another tab, Please log out there to be able to log in on this tab!', 1, 'alert');
				return;
			}
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
		let loged_in = false;
		try {
			loged_in = await getLogs(username);
		} catch (error) {
			console.log('tnaaaaaaaaket');
		}
		if (localStorage.getItem('accessToken') || loged_in) {
			Notification('Profile Action', 'You are connected in another tab, Please log out there to be able to log in on this tab!', 1, 'alert');
			return;
		}
		// need to save wether remember or not for next call
		try {

			const result = await loginUser(username, password);
			const tokens = result.tokens;
			const host_check = await checkKnownLocation(tokens.access);
			localStorage.setItem('accessToken', tokens.access);
			localStorage.setItem('refreshToken', tokens.refresh);
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
		const avatarInput = document.getElementById('avatar');
		const avatarSelectionResult = document.getElementById('avatar-selection-result');
		const selectedImage = avatarSelectionResult.querySelector('img');
		const verification_code = document.getElementById('verification-code').value;
		document.getElementById('verification-code').value = '';
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
		document.getElementById('search-user-input').value = '';
		try {
			const result = await userLookUp(uname);
			if (result['results'] !== null) {
				navigateTo('profile', result);
			}
			else {
				Notification('Search', 'No such user found!', 2, 'alert');
			}
		} catch (error) {
			Notification('Profile Action', `Error: ${error.detail}`, 2, 'alert');// check
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

	// sendFriendRequestButton.addEventListener('click', async function () {
	// 	if (window.userData.guest === true) {
	// 		Notification('Guest Action', "You can't access this feature with a guest account! Create a new account if you wanna use it!", 2, 'alert');
	// 		return ;
	//   }
	// 	const target = document.getElementById('username');
	// 	const target_id = target.getAttribute('user_id');
	// 	try {
	
	// 		const result = await sendFriendRequest(target_id);
	// 		Notification('Friend Action', 'You have sent a friend request!', 2,'request');
	// 	} catch (error) {
	// 		Notification('Friend Action', `Error: ${error.detail}`, 2, 'alert');
	// 	}
	// });

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
			Notification('Profile Action', 'You have updated your bio!',2, 'profile');
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
				Notification('Profile action', "Account deleted successfully!", 0, 'success');
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

async function createDropDownProfile(friendUname, friendId) {
	const container = document.getElementById('dropdown-container-profile');
	if (document.getElementById('profileDropDownMenu')) {
		document.getElementById('profileDropDownMenu').remove();
	}
	const actions = ['Add Friend', 'Block User'];
	const dropdownDiv = document.createElement('div');
	dropdownDiv.className = 'dropdown dropend';
	dropdownDiv.style.display = 'block';

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
		a.textContent = action;
		a.addEventListener('click', (event) => {
			event.preventDefault();
			handleprofileAction(action, friendUname, friendId);
		});
		li.appendChild(a);
		dropdownMenu.appendChild(li);
	});

	dropdownDiv.appendChild(dropdownButton);
	dropdownDiv.appendChild(dropdownMenu);
	container.appendChild(dropdownDiv);
}

async function handleprofileAction(action, targetuname, targetID) {
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
				Notification('Friend Action', `Error ${error.detail}`, 2, 'alert');
			}
			break ;
		case 'Block User':
			Notification('ALLO', 'AYA NDIRO BONG FDAR PLZ', 2, 'ALERT');
			break;
	}
}