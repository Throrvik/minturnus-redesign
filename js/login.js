document.addEventListener('DOMContentLoaded', function () {
    // Hent nødvendige elementer
    const userName = localStorage.getItem('userName');
    const userInfoDiv = document.getElementById('user-info');
    const friendsLink = document.getElementById('friends-link');
    const loginLink = document.getElementById('login-link');
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');
    const form = document.getElementById('form');
    const logoutBtn = document.getElementById('logout-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');

    // Håndter innloggingsstatus
    if (userName) {
        // Oppdater header for å vise velkomstmelding og logg ut-knapp
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html">${userName}</a></span> | <a href="#" id="logout-btn">Logg ut</a>`;
        }

        // Vis venne- og lønnstabell-lenker hvis brukeren er logget inn
        if (friendsLink) friendsLink.style.display = 'inline';

        // Skjul "Logg inn"-lenken når brukeren er logget inn
        if (loginLink) loginLink.style.display = 'none';

        // Håndter utlogging
        document.addEventListener('click', function (event) {
            if (event.target && event.target.id === 'logout-btn') {
                if (confirm("Er du sikker på at du vil logge ut?")) {
                    localStorage.removeItem('userName');
                    window.location.href = 'index.html';
                }
            }
        });
    } else {
        // Hvis brukeren IKKE er logget inn, fjern venne- og lønnstabell-lenker
        if (friendsLink) friendsLink.style.display = 'none';
    }

    // Håndter navigasjon for hamburgermenyen
    if (hamburger && navbar) {
        hamburger.addEventListener('click', function () {
            navbar.classList.toggle('show'); // Vis/skjul navigasjonen
        });
    }

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
