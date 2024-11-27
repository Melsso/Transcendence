const open = document.createElement('button');
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('second-reg-container').style.display = 'none';
    document.getElementById('forgot-container').style.display = 'none';
    document.getElementById('create-new-pass').style.display  = 'none';
    const regButton = document.getElementById('register-btn');
    const logButton = document.getElementById('login-btn');

    showLoginForm(logButton, regButton);
 
    document.getElementById('login-btn').addEventListener('click', function(){
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('second-reg-container').style.display = 'none';
        document.getElementById('forgot-container').style.display = 'none';
        document.getElementById('create-new-pass').style.display  = 'none';
        document.getElementById('login-form-container').style.display = 'block';
        regButton.classList.remove('btn-active');
        logButton.classList.add('btn-active');

    });

    document.getElementById('register-btn').addEventListener('click', function () {
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('second-reg-container').style.display = 'none';
        document.getElementById('forgot-container').style.display = 'none';
        document.getElementById('create-new-pass').style.display  = 'none';
        document.getElementById('register-form-container').style.display = 'block';
        logButton.classList.remove('btn-active');
        regButton.classList.add('btn-active');
    });
    open.addEventListener('click', function (e) {
        e.preventDefault();
        // console.log('allo');
        navigateTo('force', null);
    });
});

function showLoginForm(logButton, regButton) {
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('second-reg-container').style.display = 'none';
    document.getElementById('forgot-container').style.display = 'none';
    document.getElementById('create-new-pass').style.display  = 'none';
    document.getElementById('login-form-container').style.display = 'block';
}

function Notification(title, message, file,type) {
    if (file === 2){
        var mainpage = document.getElementById('mainTwo');
    }
    else {
        var mainpage = document.getElementById('mainOne')
    }

    const main_welcome = document.createElement('div');
    main_welcome.classList.add("position-fixed", "p-3", "top-0", "end-0");
    main_welcome.style.zIndex = '100';

    const msg_container = document.createElement('div');
    msg_container.id = 'WELCOME';
    msg_container.classList.add('toast');
    msg_container.setAttribute('role', 'alert');
    msg_container.setAttribute('aria-live', 'assertive');
    msg_container.setAttribute('aria-atomic', 'true');

    const header = document.createElement('div');
    switch (type) {
        case 'alert':
            header.style.backgroundColor = 'rgba(255, 0, 0, 0.7)'; 
            break;
        case 'request':
            header.style.backgroundColor = 'rgba(0, 128, 0, 0.5)'; 
            break;
        case 'invite':
            header.style.backgroundColor = 'rgba(76, 39, 133, 0.5)';
            break;
        case 'message':
            header.style.backgroundColor = 'rgba(25, 110, 238, 0.5)';            
            break;
        case 'profile':
            header.style.backgroundColor = 'rgba(230, 230, 38, 0.5)';
            break;
        default:
            break;
    }
    header.classList.add('toast-header');
    header.style.textAlign = 'center';

    const header_msg = document.createElement('strong');
    header_msg.classList.add('me-auto');
    header_msg.textContent = title;
    header_msg.style.color = 'black'; 

    const msg_close = document.createElement('button');
    msg_close.type = 'button';
    msg_close.classList.add('btn-close');
    msg_close.setAttribute('aria-label', 'Close');
    msg_close.setAttribute('data-bs-dismiss', 'toast');

    header.appendChild(header_msg);
    header.appendChild(msg_close);

    const msg_content = document.createElement('div');
    msg_content.classList.add('toast-body');
    msg_content.textContent = message;  

    msg_container.appendChild(header);
    msg_container.appendChild(msg_content);
    main_welcome.appendChild(msg_container);
    mainpage.appendChild(main_welcome);

    const toast = new bootstrap.Toast(msg_container);
    toast.show();

    setTimeout(() => {
        toast.hide();
    }, 5000);
}

window.Notification = Notification;

function LoginNotification(title, message) {

    var mainpage = document.getElementById('mainOne')

    const main_welcome = document.createElement('div');
    main_welcome.classList.add("position-fixed", "p-3", "top-0", "start-0");
    main_welcome.style.zIndex = '100';

    const msg_container = document.createElement('div');
    msg_container.id = 'WELCOME';
    msg_container.classList.add('toast');
    msg_container.setAttribute('role', 'alert');
    msg_container.setAttribute('aria-live', 'assertive');
    msg_container.setAttribute('aria-atomic', 'true');

    const header = document.createElement('div');
    header.style.backgroundColor = 'rgba(230, 230, 38, 0.5)';
    header.classList.add('toast-header');
    header.style.textAlign = 'center';

    const header_msg = document.createElement('strong');
    header_msg.classList.add('me-auto');
    header_msg.textContent = title;
    header_msg.style.color = 'black'; 

    const msg_close = document.createElement('button');
    msg_close.type = 'button';
    msg_close.classList.add('btn-close');
    msg_close.setAttribute('aria-label', 'Close');
    msg_close.setAttribute('data-bs-dismiss', 'toast');


    open.type = 'button';
	open.textContent = 'Login!';
	open.classList.add('btn');
	open.style.backgroundColor = 'rgba(25, 110, 238, 0.5)';
	open.style.padding = '0.25rem 0.5rem'; 
	open.style.fontSize = '0.75rem';
	open.style.marginLeft = '10px';

    header.appendChild(header_msg);
    header.appendChild(open);
    header.appendChild(msg_close);

    const msg_content = document.createElement('div');
    msg_content.classList.add('toast-body');
    msg_content.textContent = message;  

    msg_container.appendChild(header);
    msg_container.appendChild(msg_content);
    main_welcome.appendChild(msg_container);
    mainpage.appendChild(main_welcome);

    const toast = new bootstrap.Toast(msg_container);
    toast.show();
    setTimeout(() => {
        toast.hide();
    }, 5000);
}

window.LoginNotification = LoginNotification;