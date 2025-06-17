document.addEventListener('DOMContentLoaded', async function () {
    // Verify the current session with the backend
    try {
        const res = await fetch('backend/session_status.php', { credentials: 'include' });
        if (res.ok) {
            const data = await res.json();
            if (data.loggedIn) {
                // Store the verified user name from the session
                if (data.userName) {
                    localStorage.setItem('userName', data.userName);
                }
            } else {
                // Remove any stale value if the session is not valid
                localStorage.removeItem('userName');
            }
        }
    } catch (e) {
        // If the request fails we keep the existing localStorage value
        console.error('Session status check failed:', e);
    }

    const userName = localStorage.getItem('userName');
    const userInfoDiv = document.getElementById('user-info');
    const friendsItem = document.getElementById('friends-item');
    const profileItem = document.getElementById('profile-item');
    const loginLink = document.getElementById('login-link');
    const requestAlert = document.getElementById('request-alert');

    // Håndter innloggingsstatus
    if (userName) {
        // Oppdater header for å vise velkomstmelding og logg ut-knapp
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html"><strong>${userName}</strong></a></span> <span class="accent-text">|</span> <a href="#" id="logout-btn">Logg ut</a>`;
        }

        // Vis venne- og profil-lenken hvis brukeren er logget inn
        if (friendsItem) friendsItem.style.display = 'list-item';
        if (profileItem) profileItem.style.display = 'list-item';
        if (requestAlert) requestAlert.style.display = 'inline';

        // Skjul "Logg inn"-lenken når brukeren er logget inn
        if (loginLink) {
            loginLink.style.display = 'none';
        }

    } else {
        // Skjul venne- og profil-lenken hvis brukeren ikke er logget inn
        if (friendsItem) friendsItem.style.display = 'none';
        if (profileItem) profileItem.style.display = 'none';
        
        // Sørg for at "Logg inn"-lenken vises
        if (loginLink) loginLink.style.display = 'list-item';
        if (requestAlert) requestAlert.style.display = 'none';
    }

    // Global event listener for utlogging
    document.addEventListener('click', async function (event) {
        if (event.target && event.target.id === 'logout-btn') {
            if (confirm("Er du sikker på at du vil logge ut?")) {
                try {
                    await fetch('backend/logout.php', { credentials: 'include' });
                } catch (e) {
                    console.error('Logout request failed:', e);
                }
                localStorage.removeItem('userName'); // Fjern brukernavn fra localStorage
                window.location.href = 'index.html'; // Gå tilbake til hovedsiden
            }
        }
    });

    // Håndter navigasjon for hamburgermenyen
    const hamburger = document.getElementById('hamburger');
    const navbar = document.getElementById('navbar');

    if (hamburger && navbar) {
        hamburger.addEventListener('click', function () {
            navbar.classList.toggle('show'); // Vis/skjul navigasjonen ved å toggle 'show'-klassen
        });
    }

    if (requestAlert) {
        requestAlert.addEventListener('click', function () {
            window.location.href = 'friends.html';
        });
        updateRequestAlert();
        setInterval(updateRequestAlert, 60000);
    }
});

async function updateRequestAlert() {
    const icon = document.getElementById('request-alert');
    if (!icon) return;
    try {
        const res = await fetch('api/pending_count.php', { credentials: 'include' });
        if (!res.ok) {
            icon.classList.remove('active');
            icon.style.display = 'none';
            return;
        }
        const data = await res.json();
        if (data.count > 0) {
            icon.classList.add('active');
            icon.style.display = 'inline';
        } else {
            icon.classList.remove('active');
            icon.style.display = 'none';
        }
    } catch (e) {
        console.error('Failed to fetch pending count:', e);
    }
}
