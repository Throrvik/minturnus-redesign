document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('forgot-password-form').addEventListener('submit', function (event) {
        event.preventDefault();

        const email = document.getElementById('email').value;

        fetch('backend/forgot_password.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
            console.error('Feil ved tilbakestilling:', error);
        });
    });
});
