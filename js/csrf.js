window.CSRF_TOKEN = null;
async function loadCsrfToken() {
    try {
        const res = await fetch('backend/get_csrf_token.php', { credentials: 'include' });
        const data = await res.json();
        window.CSRF_TOKEN = data.token;
        document.querySelectorAll('input[name="csrf_token"]').forEach(el => {
            el.value = window.CSRF_TOKEN;
        });
    } catch (e) {
        console.error('Failed to get CSRF token', e);
    }
}

document.addEventListener('DOMContentLoaded', loadCsrfToken);
