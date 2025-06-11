document.addEventListener('DOMContentLoaded', function () {
    const userName = localStorage.getItem('userName');
    const userInfoDiv = document.getElementById('user-info');
    const friendsLink = document.getElementById('friends-link');
    const loginLink = document.getElementById('login-link');

    // Håndter innloggingsstatus
    if (userName) {
        // Oppdater header for å vise velkomstmelding og logg ut-knapp
        if (userInfoDiv) {
            userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html"><strong>${userName}</strong></a></span> | <a href="#" id="logout-btn">Logg ut</a>`;
        }

        // Vis venne-lenken hvis brukeren er logget inn
        if (friendsLink) friendsLink.style.display = 'list-item';

        // Skjul "Logg inn"-lenken når brukeren er logget inn
        if (loginLink) {
            loginLink.style.display = 'none';
        }

    } else {
        // Skjul venne-lenken hvis brukeren ikke er logget inn
        if (friendsLink) friendsLink.style.display = 'none';

        // Sørg for at "Logg inn"-lenken vises
        if (loginLink) loginLink.style.display = 'list-item';
    }

    // Global event listener for utlogging
    document.addEventListener('click', function (event) {
        if (event.target && event.target.id === 'logout-btn') {
            if (confirm("Er du sikker på at du vil logge ut?")) {
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
});
