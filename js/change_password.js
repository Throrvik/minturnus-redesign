document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('change-password-form');
    if (!form) return;

    form.addEventListener('submit', e => {
        e.preventDefault();
        const current = document.getElementById('current-password').value;
        const newPass = document.getElementById('new-password').value;
        const repeat = document.getElementById('repeat-password').value;
        if (newPass !== repeat) {
            showMessage('Passordene stemmer ikke overens', 'error');
            return;
        }
        fetch('backend/change_password.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ current, new: newPass })
        })
        .then(r => r.json())
        .then(data => {
            if (data.status === 'success') {
                showMessage('Passord oppdatert', 'success');
                form.reset();
            } else {
                showMessage(data.message || 'Feil oppstod', 'error');
            }
        })
        .catch(() => showMessage('Serverfeil', 'error'));
    });
});
