document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('register-form-container').style.display = 'none';
    document.getElementById('login-form-container').style.display = 'none';

    function showLoginForm() {
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
    }
    showLoginForm();
    document.getElementById('login-btn').focus(); 

    document.getElementById('login-btn').addEventListener('click', showLoginForm, function(){
        document.getElementById('register-form-container').style.display = 'none';
        document.getElementById('login-form-container').style.display = 'block';
    });

    document.getElementById('register-btn').addEventListener('click', function () {
        document.getElementById('login-form-container').style.display = 'none';
        document.getElementById('register-form-container').style.display = 'block';
    });
});