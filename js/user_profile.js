
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
        if (avatarPreview) {
            avatarPreview.addEventListener('click', () => avatarInput.click());
        }
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
        previewBtn.addEventListener('click', showPreview);
    }

    const deleteBtn = document.getElementById('delete-profile-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', deleteProfile);
    }

    const toggleBtn = document.getElementById('toggle-info-btn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleInfoVisibility);
    }
});

// Funksjon for å hente brukerdata fra backend
function fetchUserData() {
    fetch('backend/get_user_data.php', { credentials: 'include' })
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
                document.getElementById('first-name').value = data.user.firstname || '';
                document.getElementById('last-name').value = data.user.lastname || '';
                document.getElementById('email').value = data.user.email || '';
                document.getElementById('company').value = data.user.company || '';
                document.getElementById('location').value = data.user.location || '';
                document.getElementById('shift').value = data.user.shift || '';
                if (data.user.shift_date) {
                    document.getElementById('first-shift').value = data.user.shift_date;
                }

                if (data.user.avatar_url) {
                    const avatarPreview = document.getElementById('avatar-preview');
                    avatarPreview.style.backgroundImage = `url('${data.user.avatar_url}')`;
                    avatarPreview.textContent = '';
                }

                document.getElementById('info-hide').value = data.user.info_hide ? 1 : 0;
                updateToggleButton();
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

    formData.append('firstname', first);
    formData.append('lastname', last);
    formData.append('email', document.getElementById('email').value);
    formData.append('company', document.getElementById('company').value);
    formData.append('location', document.getElementById('location').value);
    formData.append('shift', document.getElementById('shift').value);
    formData.append('info-hide', document.getElementById('info-hide').value);
    formData.append('shift_date', document.getElementById('first-shift').value);

    const avatar = document.getElementById('avatar').files[0];
    if (avatar) {
        formData.append('avatar', avatar);
    }

    fetch('backend/update_profile.php', {
        method: 'POST',
        body: formData,
        credentials: 'include'
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

function showPreview() {
    const modal = document.getElementById('preview-modal');
    const content = document.getElementById('preview-content');
    const avatar = document.getElementById('avatar-preview').style.backgroundImage;
    const name = `${document.getElementById('first-name').value} ${document.getElementById('last-name').value}`.trim();
    const company = document.getElementById('company').value;
    const location = document.getElementById('location').value;
    const shift = document.getElementById('shift').value;
    const firstShift = document.getElementById('first-shift').value;

    let html = `<div class="user-card">`;
    html += `<div class="avatar-img" style='${avatar ? `background-image:${avatar};` : ''}'>${avatar ? '' : '👤'}</div>`;
    html += `<div class="user-info">`;
    html += `<p class="name"><strong>${name}</strong></p>`;
    if (company && document.getElementById('info-hide').value === '0') html += `<p>${company}</p>`;
    if (location && document.getElementById('info-hide').value === '0') html += `<p>${location}</p>`;
    if (shift && document.getElementById('info-hide').value === '0') {
        html += `<p>${shift}</p>`;
        if (firstShift) html += `<p>${firstShift}</p>`;
    }
    html += `</div></div>`;
    content.innerHTML = html;
    modal.style.display = 'block';
    const closeBtn = document.getElementById('modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => { modal.style.display = 'none'; };
    }
    window.onclick = function(event) {
        if (event.target === modal) modal.style.display = 'none';
    };
}

function deleteProfile() {
    if (!confirm('Er du sikker på at du vil slette profilen?')) {
        return;
    }

    fetch('backend/delete_profile.php', {
        method: 'POST',
        credentials: 'include'
    })
    .then(r => r.json())
    .then(data => {
        if (data.status === 'success') {
            localStorage.removeItem('userName');
            window.location.href = 'login.html';
        } else {
            const msg = data.message ? `Kunne ikke slette profil: ${data.message}` : 'Kunne ikke slette profil.';
            showMessage(msg, 'error');
        }
    })
    .catch(() => showMessage('Kunne ikke slette profil.', 'error'));
}

function updateToggleButton() {
    const hidden = document.getElementById('info-hide').value === '1';
    const btn = document.getElementById('toggle-info-btn');
    if (btn) {
        btn.textContent = hidden ? 'Vis informasjon' : 'Skjul informasjon';
    }
}

function toggleInfoVisibility() {
    const current = document.getElementById('info-hide').value === '1';
    const newVal = current ? '0' : '1';
    document.getElementById('info-hide').value = newVal;
    updateToggleButton();
}
