
document.addEventListener('DOMContentLoaded', function () {
    const allColors = [
        "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FFB2",
        "#66B2FF", "#CC66FF", "#FF66B2", "#66FF66", "#CCCCCC",
        "#FF8C00", "#FFD700", "#7CFC00", "#40E0D0", "#1E90FF",
        "#BA55D3", "#FF1493", "#32CD32", "#D3D3D3", "#8B0000",
        "#A52A2A", "#2E8B57", "#4682B4", "#FF4500", "#DA70D6",
        "#B0C4DE", "#8A2BE2", "#20B2AA", "#FF6347", "#9ACD32"
    ];

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
    const avatarRemoveFlag = document.getElementById('avatar-remove-flag');
    const cropperModal = document.getElementById('cropper-modal');
    const cropperImage = document.getElementById('cropper-image');
    const cropperClose = document.getElementById('cropper-close');
    const cropperConfirm = document.getElementById('cropper-confirm');

    let cropper = null;
    let croppedAvatarBlob = null;
    if (avatarInput) {
        avatarInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    cropperImage.src = e.target.result;
                    cropperModal.style.display = 'block';
                    if (cropper) cropper.destroy();
                    cropper = new Cropper(cropperImage, { aspectRatio: 1, viewMode: 1 });
                };
                reader.readAsDataURL(file);
                if (avatarRemoveFlag) avatarRemoveFlag.value = '0';
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
            croppedAvatarBlob = null;
            if (avatarRemoveFlag) avatarRemoveFlag.value = '1';
        });
    }

    if (cropperClose) {
        cropperClose.addEventListener('click', () => {
            cropperModal.style.display = 'none';
            if (cropper) { cropper.destroy(); cropper = null; }
            avatarInput.value = '';
        });
    }

    if (cropperConfirm) {
        cropperConfirm.addEventListener('click', () => {
            if (cropper) {
                const canvas = cropper.getCroppedCanvas({ width: 300, height: 300 });
                avatarPreview.style.backgroundImage = `url('${canvas.toDataURL('image/jpeg')}')`;
                avatarPreview.textContent = '';
                canvas.toBlob(blob => {
                    croppedAvatarBlob = blob;
                }, 'image/jpeg');
                if (avatarRemoveFlag) avatarRemoveFlag.value = '0';
                cropperModal.style.display = 'none';
                cropper.destroy();
                cropper = null;
            }
        });
    }

    const colorSelect = document.getElementById('user-color');
    if (colorSelect) {
        allColors.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = c;
            opt.style.backgroundColor = c;
            colorSelect.appendChild(opt);
        });
        const saved = localStorage.getItem('userColor');
        if (saved) colorSelect.value = saved;
        colorSelect.addEventListener('change', () => {
            const val = colorSelect.value;
            if (val) localStorage.setItem('userColor', val); else localStorage.removeItem('userColor');
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

    const colorVal = document.getElementById('user-color').value;
    if (colorVal) {
        localStorage.setItem('userColor', colorVal);
    } else {
        localStorage.removeItem('userColor');
    }

    if (croppedAvatarBlob) {
        formData.append('avatar', croppedAvatarBlob, 'avatar.jpg');
    } else {
        const avatar = document.getElementById('avatar').files[0];
        if (avatar) {
            formData.append('avatar', avatar);
        }
    }
    if (avatarRemoveFlag) {
        formData.append('avatar_remove', avatarRemoveFlag.value);
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
    const avatarStyle = document.getElementById('avatar-preview').style.backgroundImage;
    const avatarUrl = avatarStyle ? avatarStyle.slice(5, -2) : '';

    const first = document.getElementById('first-name').value;
    const last = document.getElementById('last-name').value;
    const company = document.getElementById('company').value;
    const location = document.getElementById('location').value;
    const shift = document.getElementById('shift').value;
    const showInfo = document.getElementById('info-hide').value === '0';

    const card = document.createElement('div');
    card.className = 'profile-card';

    const nameEl = document.createElement('h2');
    nameEl.className = 'profile-name';
    nameEl.textContent = `${first} ${last}`.trim();
    card.appendChild(nameEl);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'profile-content';

    if (avatarUrl) {
        const img = document.createElement('img');
        img.className = 'profile-image';
        img.src = avatarUrl;
        img.alt = 'Profilbilde';
        contentDiv.appendChild(img);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'profile-info';

    if (showInfo) {
        if (company) infoDiv.innerHTML += `<p><strong>Firma:</strong> ${company}</p>`;
        if (location) infoDiv.innerHTML += `<p><strong>Arbeidssted:</strong> ${location}</p>`;
        if (shift) infoDiv.innerHTML += `<p><strong>Turnus:</strong> ${shift}</p>`;
    }

    contentDiv.appendChild(infoDiv);
    card.appendChild(contentDiv);

    content.innerHTML = '';
    content.appendChild(card);
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
