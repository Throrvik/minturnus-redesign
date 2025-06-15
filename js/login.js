document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('form');
    const resetPasswordBtn = document.getElementById('reset-password-btn');

    // Håndter logikk for innlogging/registrering
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
    
            const action = form.dataset.action; // "register" eller "login"
            const errorMessages = document.getElementById('error-messages');
            const formData = new FormData(form);
            let url = '';

            // Velg riktig URL basert på handlingen
            if (action === 'register') {
                url = 'backend/register.php';
            } else if (action === 'login') {
                url = 'backend/login.php';
            }

            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: formData,
                    credentials: 'include'
                });

                const responseText = await response.text();
                console.log('Full server response:', responseText);

                if (!response.ok) {
                    throw new Error(`HTTP-feil! Status: ${response.status}`);
                }

                let result;
                try {
                    result = JSON.parse(responseText);
                } catch (parseError) {
                    console.error("Feil ved parsing av JSON:", parseError);
                    errorMessages.textContent = "En feil oppstod ved serverkommunikasjon. Vennligst prøv igjen senere.";
                    errorMessages.style.display = 'block';
                    return;
                }

                if (result.status === 'error') {
                    errorMessages.textContent = result.message;
                    errorMessages.style.display = 'block';
                } else if (result.success) {
                    // Lagre brukernavn i localStorage
                    console.log('Server response:', result);
                    if (result.success && result.firstname) {
                        localStorage.setItem('userName', result.firstname);
                        window.location.href = 'index.html'; 
                    } else {
                        showMessage('Innlogging feilet. Sjekk brukernavn og passord.', 'error');
                    }
                }

            } catch (error) {
                console.error('Feil ved håndtering:', error);
                errorMessages.textContent = "En feil oppstod. Vennligst prøv igjen senere.";
                errorMessages.style.display = 'block';
            }
        });
    }

    // Håndter glemt passord-knappen
    if (resetPasswordBtn) {
        resetPasswordBtn.addEventListener('click', function () {
            window.location.href = 'forgot_password.html'; // Naviger til siden for glemt passord
        });
    }
});
