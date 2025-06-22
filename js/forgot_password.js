// Global debug flag
window.DEBUG = window.DEBUG || false;
var DEBUG = window.DEBUG;

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('forgot-password-form');
    if (!form) return; // Script may be loaded on other pages
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;

        fetch('backend/forgot_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': window.CSRF_TOKEN
            },
            body: JSON.stringify({ email })
        })
        .then(response => response.json())
        .then(data => {
            const errorMessages = document.getElementById('error-messages');
            errorMessages.textContent = data.message;
            errorMessages.style.display = 'block';
            errorMessages.style.color = data.success ? 'green' : 'red';
        })
        .catch(error => {
            if (DEBUG) console.error('Feil ved tilbakestilling:', error);
        });
    });
});
