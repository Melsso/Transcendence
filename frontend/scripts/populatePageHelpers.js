export function loadProfile(userData) {
    if (userData && 'tokens' in userData) {
        if (userData && 'user' in userData) {
            user = userData['user'];
            
            const profileUsername = document.getElementById('username');
            profileUsername.value = user['username'];

            const bio = document.getElementById('profile-bio');
            bio.value = user['biography'];

            const expBar1 = document.getElementById('exp-pong');
            expBar1.value = user['bar_exp_game1'];
            
            const expBar2 = document.getElementById('exp-ogame');
            expBar2.value = user['bar_exp_game1'];



            // Next find match history and populate it, but before that can be done, needs to be
            // created in backend
            // same for the other two stat pages, 

            // after that find friends and populate it, also needs to be done in backend
        }
        else {
            // here will have to fetch profile data again, prolly get request
            console.error();
        }
    }
    else {
        // will have to figure out a system, no tokens means session expired so redir to login 
        console.error('');
    }
}