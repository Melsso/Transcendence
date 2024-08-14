document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('login-form-container').style.display = 'none';

    function showLoginForm() {
        document.getElementById('login-form-container').style.display = 'block';
    }

    // Auto-click login button on page load to simulate the login button being pressed
    showLoginForm();
    document.getElementById('login-btn').focus(); // Set focus on login button

    document.getElementById('login-btn').addEventListener('click', showLoginForm);

    document.getElementById('register-btn').addEventListener('click', function () {
        document.getElementById('login-form-container').style.display = 'none';
        // Add functionality to show the register form here.
    });
});