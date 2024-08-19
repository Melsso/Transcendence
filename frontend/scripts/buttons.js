document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'none';
    document.getElementById('second-reg-container').style.display = 'none';
    const regButton = document.getElementById('register-btn');
    const logButton = document.getElementById('login-btn');

    showLoginForm(logButton, regButton);
 
    document.getElementById('login-btn').addEventListener('click', function(){
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('second-reg-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
        regButton.classList.remove('btn-active');
        logButton.classList.add('btn-active');

    });


    document.getElementById('register-btn').addEventListener('click', function () {
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('second-reg-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'block';
        logButton.classList.remove('btn-active');
        regButton.classList.add('btn-active');
    });

    document.getElementById('next-btn').addEventListener('click', function() {
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('second-reg-container').style.display = 'block';
    });
});

function showLoginForm(logButton, regButton) {
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('second-reg-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'block';
}
