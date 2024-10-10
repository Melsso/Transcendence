export function loadProfile(requestData) {
    // Change this first check to properly check for sessions status
    if (requestData) {
        if (requestData && 'user' in requestData) {
            user = requestData['user'];
            
            const profileUsername = document.getElementById('username');
            profileUsername.value = user['username'];

            const bio = document.getElementById('profile-bio');
            bio.textContent = user['biography'];

            const expBar1 = document.getElementById('exp-pong');
            expBar1.style.width = `${user['bar_exp_game1']%1000}%`;
            expBar1.textContent = `Game 1 - Leveluser${['bar_exp_game1'] / 1000}%`;
            expBar1.setAttribute('aria-valuenow', user['bar_exp_game1']%1000);

            const expBar2 = document.getElementById('exp-ogame');
            expBar2.style.width = `${user['bar_exp_game2']%1000}%`;
            expBar2.textContent = `Game 2 - Leveluser${['bar_exp_game2'] / 1000}%`;
            expBar2.setAttribute('aria-valuenow', user['bar_exp_game2']%1000);
        }
        else {
            // here will have to fetch profile data again, prolly get request
            console.error("Error: No User Data Found!");
        }

        if (requestData && 'match_history' in requestData) {
            games = requestData['match_history'];

            // Add appending logic here
        }
        else {
            console.error("Error: No Match History Found!");
        }

    }
    else {
        // will have to figure out a system, no tokens means session expired so redir to login 
        console.error('');
    }
}