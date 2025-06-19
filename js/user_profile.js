
let ctx = null;
let imageObj = null;
let selection = { x: 0, y: 0, size: 0 };
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;
let croppedAvatarBlob = null;
let avatarRemoveFlag = null;
let cropperCanvas = null;

document.addEventListener('DOMContentLoaded', function () {
    const allColors = [
        "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FFB2",
        "#66B2FF", "#CC66FF", "#FF66B2", "#66FF66", "#CCCCCC",
        "#FF8C00", "#FFD700", "#7CFC00", "#40E0D0", "#1E90FF",
        "#BA55D3", "#FF1493", "#32CD32", "#D3D3D3", "#8B0000",
        "#A52A2A", "#2E8B57", "#4682B4", "#FF4500", "#DA70D6",
        "#B0C4DE", "#8A2BE2", "#20B2AA", "#FF6347", "#9ACD32"
    ];

    const colorNames = {
        "#FF6666": "Lys rød",
        "#FFB266": "Lys oransje",
        "#FFFF66": "Lys gul",
        "#B2FF66": "Lime",
        "#66FFB2": "Mint",
        "#66B2FF": "Himmelblå",
        "#CC66FF": "Fiolett",
        "#FF66B2": "Knallrosa",
        "#66FF66": "Klar grønn",
        "#CCCCCC": "Grå",
        "#FF8C00": "Mørk oransje",
        "#FFD700": "Gull",
        "#7CFC00": "Plengrønn",
        "#40E0D0": "Turkis",
        "#1E90FF": "Dodgerblå",
        "#BA55D3": "Orkide",
        "#FF1493": "Dyp rosa",
        "#32CD32": "Limegrønn",
        "#D3D3D3": "Lys grå",
        "#8B0000": "Mørk rød",
        "#A52A2A": "Brun",
        "#2E8B57": "Sjøgrønn",
        "#4682B4": "Stålblå",
        "#FF4500": "Oransjerød",
        "#DA70D6": "Orkide lilla",
        "#B0C4DE": "Lys stålblå",
        "#8A2BE2": "Blålilla",
        "#20B2AA": "Lys sjøgrønn",
        "#FF6347": "Tomatrød",
        "#9ACD32": "Gulgrønn"
    };

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
    avatarRemoveFlag = document.getElementById('avatar-remove-flag');
    const cropperModal = document.getElementById('cropper-modal');
    cropperCanvas = document.getElementById('cropper-canvas');
    const cropperClose = document.getElementById('cropper-close');
    const cropperConfirm = document.getElementById('cropper-confirm');

    ctx = null;
    imageObj = null;
    selection = { x: 0, y: 0, size: 0 };
    isDragging = false;
    dragOffsetX = 0;
    dragOffsetY = 0;
    croppedAvatarBlob = null;
    if (avatarInput) {
        avatarInput.addEventListener('change', function () {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = e => {
                    imageObj = new Image();
                    imageObj.onload = () => {
                        const maxDim = 400;
                        const scale = Math.min(maxDim / imageObj.width, maxDim / imageObj.height, 1);
                        cropperCanvas.width = imageObj.width * scale;
                        cropperCanvas.height = imageObj.height * scale;
                        ctx = cropperCanvas.getContext('2d');
                        selection.size = Math.min(cropperCanvas.width, cropperCanvas.height);
                        selection.x = (cropperCanvas.width - selection.size) / 2;
                        selection.y = (cropperCanvas.height - selection.size) / 2;
                        drawCropper();
                        cropperModal.style.display = 'block';
                    };
                    imageObj.src = e.target.result;
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

    function resetCropper() {
        cropperModal.style.display = 'none';
        avatarInput.value = '';
        ctx = null;
        imageObj = null;
    }

    if (cropperClose) {
        cropperClose.addEventListener('click', resetCropper);
    }

    // Attach cropper drag events now that the canvas exists
    if (cropperCanvas) {
        cropperCanvas.addEventListener('mousedown', startDrag);
        cropperCanvas.addEventListener('mousemove', drag);
        cropperCanvas.addEventListener('mouseup', endDrag);
        cropperCanvas.addEventListener('mouseleave', endDrag);
        // Touch support for mobile devices
        cropperCanvas.addEventListener('touchstart', startDrag, {passive: false});
        cropperCanvas.addEventListener('touchmove', drag, {passive: false});
        cropperCanvas.addEventListener('touchend', endDrag);
        cropperCanvas.addEventListener('touchcancel', endDrag);
    }

    if (cropperConfirm) {
        cropperConfirm.addEventListener('click', () => {
            if (!ctx || !imageObj) return;
            const output = document.createElement('canvas');
            output.width = 300;
            output.height = 300;
            const scaleX = imageObj.width / cropperCanvas.width;
            const scaleY = imageObj.height / cropperCanvas.height;
            output.getContext('2d').drawImage(
                imageObj,
                selection.x * scaleX,
                selection.y * scaleY,
                selection.size * scaleX,
                selection.size * scaleY,
                0,
                0,
                300,
                300
            );
            avatarPreview.style.backgroundImage = `url('${output.toDataURL('image/jpeg')}')`;
            avatarPreview.textContent = '';
            output.toBlob(blob => {
                croppedAvatarBlob = blob;
            }, 'image/jpeg');
            if (avatarRemoveFlag) avatarRemoveFlag.value = '0';
            resetCropper();
        });
    }

    const colorSelect = document.getElementById('user-color');
    if (colorSelect) {
        allColors.forEach(c => {
            const opt = document.createElement('option');
            opt.value = c;
            opt.textContent = colorNames[c] || c;
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

function drawCropper() {
    if (!ctx || !imageObj) return;
    ctx.clearRect(0, 0, cropperCanvas.width, cropperCanvas.height);

    // Draw the base image
    ctx.drawImage(imageObj, 0, 0, cropperCanvas.width, cropperCanvas.height);

    // Darken the entire canvas
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fillRect(0, 0, cropperCanvas.width, cropperCanvas.height);

    // Reveal the selected area by redrawing the image only inside the selection
    ctx.save();
    ctx.beginPath();
    ctx.rect(selection.x, selection.y, selection.size, selection.size);
    ctx.clip();
    ctx.clearRect(selection.x, selection.y, selection.size, selection.size);
    ctx.drawImage(imageObj, 0, 0, cropperCanvas.width, cropperCanvas.height);
    ctx.restore();

    // Outline the selection
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.strokeRect(selection.x, selection.y, selection.size, selection.size);
}

function getPos(evt) {
    if (evt.touches && evt.touches.length) {
        const rect = cropperCanvas.getBoundingClientRect();
        return {
            x: evt.touches[0].clientX - rect.left,
            y: evt.touches[0].clientY - rect.top
        };
    }
    return { x: evt.offsetX, y: evt.offsetY };
}

function startDrag(evt) {
    if (!ctx) return;
    evt.preventDefault();
    const pos = getPos(evt);
    isDragging = true;
    dragOffsetX = pos.x - selection.x;
    dragOffsetY = pos.y - selection.y;
}

function drag(evt) {
    if (!isDragging) return;
    evt.preventDefault();
    const pos = getPos(evt);
    selection.x = pos.x - dragOffsetX;
    selection.y = pos.y - dragOffsetY;
    selection.x = Math.max(0, Math.min(selection.x, cropperCanvas.width - selection.size));
    selection.y = Math.max(0, Math.min(selection.y, cropperCanvas.height - selection.size));
    drawCropper();
}

function endDrag() {
    isDragging = false;
}


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
                userInfoDiv.innerHTML = `<span>Velkommen, <a href="user_profile.html"><strong>${first}</strong></a></span> <span class="accent-text">|</span> <a href="#" id="logout-btn">Logg ut</a>`;
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
        if (location) infoDiv.innerHTML += `<p><strong>Lokasjon:</strong> ${location}</p>`;
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
