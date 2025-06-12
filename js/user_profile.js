document.addEventListener('DOMContentLoaded', function () {
    fetchUserData();

    const profileForm = document.getElementById('user-profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', function (event) {
            event.preventDefault();
            updateUserProfile();
        });
    }

    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatar-preview');
    const avatarRemove = document.getElementById('avatar-remove');
    if (avatarInput) {
        avatarInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    avatarPreview.style.backgroundImage = `url('${e.target.result}')`;
                    avatarPreview.textContent = '';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    if (avatarRemove) {
        avatarRemove.addEventListener('click', function () {
            avatarInput.value = '';
            avatarPreview.style.backgroundImage = '';
            avatarPreview.textContent = '👤';
        });
    }

    const previewBtn = document.getElementById('preview-btn');
    if (previewBtn) {
        previewBtn.addEventListener('click', () => {
            alert('Dette er en forhåndsvisning av hvordan profilen din ser ut for andre.');
        });
    }

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
                const fullName = data.user.firstname || '';
                const parts = fullName.split(' ');
                document.getElementById('first-name').value = parts[0] || '';
                document.getElementById('last-name').value = parts.slice(1).join(' ');
                document.getElementById('email').value = data.user.email || '';
                document.getElementById('company').value = data.user.company || '';
                document.getElementById('location').value = data.user.location || '';
                document.getElementById('shift').value = data.user.shift || '';
                if (data.user.first_shift) {
                    document.getElementById('first-shift').value = data.user.first_shift;
                }

                if (data.user.avatar_url) {
                    const avatarPreview = document.getElementById('avatar-preview');
                    avatarPreview.style.backgroundImage = `url('${data.user.avatar_url}')`;
                    avatarPreview.textContent = '';
                }

                // Håndter NA-avkrysningsbokser basert på data
                document.getElementById('company-na').checked = data.user.company_na === 1;
                document.getElementById('location-na').checked = data.user.location_na === 1;
                document.getElementById('shift-na').checked = data.user.shift_na === 1;

                // Deaktiver feltene basert på NA-avkrysningsboksene
                toggleInputField();
            } else {
                showMessage(`Kunne ikke hente brukerdata: ${data.message}`, 'error');
            }
        })
        .catch(error => {
            console.error('Feil ved henting av data:', error);
            showMessage('En feil oppstod ved henting av brukerdata.', 'error');
        });
}

// Funksjon for å oppdatere brukerprofil
function updateUserProfile() {
    const formData = new FormData();
    const first = document.getElementById('first-name').value.trim();
    const last = document.getElementById('last-name').value.trim();

    formData.append('firstname', `${first} ${last}`.trim());
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
    formData.append('first-shift', document.getElementById('first-shift').value);

    const avatar = document.getElementById('avatar').files[0];
    if (avatar) {
        formData.append('avatar', avatar);
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
            showMessage('Profilen ble oppdatert!', 'success');

            // Oppdater localStorage og header med nytt navn
            localStorage.setItem('userName', first);
            const userInfoDiv = document.getElementById('user-info');
            if (userInfoDiv) {
                userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html"><strong>${first}</strong></a></span> | <a href="#" id="logout-btn">Logg ut</a>`;
            }
        } else {
            showMessage(`Kunne ikke oppdatere profil: ${data.message}`, 'error');
        }
    })
    .catch(error => {
        console.error('Feil ved oppdatering:', error);
        showMessage('Kunne ikke oppdatere profil.', 'error');
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
