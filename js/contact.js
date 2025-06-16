document.addEventListener('DOMContentLoaded', async function () {
    try {
        const res = await fetch('backend/get_user_data.php', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (data.status === 'success') {
            const first = data.user.firstname || '';
            const last = data.user.lastname || '';
            const email = data.user.email || '';
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            if (nameInput && !nameInput.value) {
                nameInput.value = `${first} ${last}`.trim();
            }
            if (emailInput && !emailInput.value) {
                emailInput.value = email;
            }
        }
    } catch (e) {
        console.error('Failed to pre-fill contact form:', e);
    }
});
