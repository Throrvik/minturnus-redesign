document.addEventListener('DOMContentLoaded', function () {
    // Hent brukerdata når siden lastes
    fetchUserData();

    // Håndter skjema for profiloppdatering
    const profileForm = document.getElementById('user-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            updateUserProfile();
        });
    }

    // Legg til event listeners for "NA"-avkrysningsbokser for å deaktivere tilhørende inputfelt
    addToggleListeners();
});

// Funksjon for å hente brukerdata fra backend
function fetchUserData() {
    fetch('backend/get_user_data.php')
        .then(response => {
            console.log('HTTP response status:', response.status);
            if (!response.ok) {
                throw new Error('Server returnerte en feil.');
            }
            return response.json();
        })
        .then(data => {
            console.log('Server response:', data);
            if (data.status === 'success') {
                document.getElementById('firstname').value = data.user.firstname || '';
                document.getElementById('email').value = data.user.email || '';
                document.getElementById('company').value = data.user.company || '';
                document.getElementById('location').value = data.user.location || '';
                document.getElementById('shift').value = data.user.shift || '';

                // Håndter NA-avkrysningsbokser basert på data
                document.getElementById('company-na').checked = data.user.company_na === 1;
                document.getElementById('location-na').checked = data.user.location_na === 1;
                document.getElementById('shift-na').checked = data.user.shift_na === 1;

                // Deaktiver feltene basert på NA-avkrysningsboksene
                toggleInputField();
            } else {
                alert(`Kunne ikke hente brukerdata: ${data.message}`);
            }
        })
        .catch(error => {
            console.error('Feil ved henting av data:', error);
            alert('En feil oppstod ved henting av brukerdata.');
        });
}

// Funksjon for å oppdatere brukerprofil
function updateUserProfile() {
    const formData = new FormData();
    const firstname = document.getElementById('firstname').value;

    formData.append('firstname', firstname);
    formData.append('email', document.getElementById('email').value);
    formData.append('company', document.getElementById('company').value);
    formData.append('company-hide', document.getElementById('company-hide').checked ? 1 : 0);
    formData.append('company-na', document.getElementById('company-na').checked ? 1 : 0);
    formData.append('location', document.getElementById('location').value);
    formData.append('location-hide', document.getElementById('location-hide').checked ? 1 : 0);
    formData.append('location-na', document.getElementById('location-na').checked ? 1 : 0);
    formData.append('shift', document.getElementById('shift').value);
    formData.append('shift-hide', document.getElementById('shift-hide').checked ? 1 : 0);
    formData.append('shift-na', document.getElementById('shift-na').checked ? 1 : 0);

    // Sjekk om passordfeltet er fylt ut før det sendes
    const newPassword = document.getElementById('new-password').value;
    if (newPassword) {
        formData.append('new-password', newPassword);
    }

    fetch('backend/update_profile.php', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log('HTTP response status:', response.status);
        if (!response.ok) {
            throw new Error('Server returnerte en feil.');
        }
        return response.json();
    })
    .then(data => {
        console.log('Server response:', data);
        if (data.status === 'success') {
            alert('Profilen ble oppdatert!');

            // Oppdater localStorage og header med nytt navn
            localStorage.setItem('userName', firstname);
            const userInfoDiv = document.getElementById('user-info');
            if (userInfoDiv) {
                userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html">${firstname}</a></span> | <a href="#" id="logout-btn">Logg ut</a>`;
            }
        } else {
            alert(`Kunne ikke oppdatere profil: ${data.message}`);
        }
    })
    .catch(error => {
        console.error('Feil ved oppdatering:', error);
        alert('Kunne ikke oppdatere profil.');
    });
}


// Funksjon for å deaktivere inputfelt basert på avkrysningsboksene
function toggleInputField() {
    document.getElementById('company').disabled = document.getElementById('company-na').checked;
    document.getElementById('location').disabled = document.getElementById('location-na').checked;
    document.getElementById('shift').disabled = document.getElementById('shift-na').checked;
}

// Legg til event listeners for checkboxer
function addToggleListeners() {
    document.getElementById('company-na').addEventListener('change', toggleInputField);
    document.getElementById('location-na').addEventListener('change', toggleInputField);
    document.getElementById('shift-na').addEventListener('change', toggleInputField);
}
