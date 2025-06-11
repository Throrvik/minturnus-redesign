function showMessage(text, type = 'info', timeout = 4000) {
    const container = document.getElementById('message');
    if (!container) {
        alert(text);
        return;
    }

    container.textContent = text;
    container.className = type; // assign the type as class for styling
    container.style.display = 'block';

    if (timeout > 0) {
        setTimeout(() => {
            container.style.display = 'none';
        }, timeout);
    }
}
