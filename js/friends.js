document.addEventListener('DOMContentLoaded', () => {
    loadPendingRequests();
    loadColleagues();

    document.getElementById('search-btn')
        .addEventListener('click', searchUsers);
});

function searchUsers() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    fetch(`/api/search_users?query=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(showSearchResults)
        .catch(() => alert('Kunne ikke hente søkeresultater'));
}

function showSearchResults(users) {
    const box = document.getElementById('search-results');
    box.innerHTML = '';
    users.forEach(u => {
        const card = createCard(u, { request: true });
        box.appendChild(card);
    });
}

function sendRequest(id) {
    fetch('/api/send_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(r => r.json())
    .then(() => alert('Forespørsel sendt'))
    .catch(() => alert('Noe gikk galt'));
}

function loadPendingRequests() {
    fetch('/api/pending_requests')
        .then(r => r.json())
        .then(requests => {
            const box = document.getElementById('pending-requests');
            box.innerHTML = '';
            requests.forEach(r => box.appendChild(createRequestCard(r)));
        });
}

function respondRequest(id, accept) {
    fetch('/api/respond_request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accept })
    })
    .then(() => {
        loadPendingRequests();
        loadColleagues();
    });
}

function loadColleagues() {
    fetch('/api/my_colleagues')
        .then(r => r.json())
        .then(list => {
            const box = document.getElementById('colleagues-list');
            box.innerHTML = '';
            list.forEach(c => box.appendChild(createCard(c, { remove: true })));
        });
}

function removeColleague(id) {
    fetch('/api/remove_colleague', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(() => loadColleagues());
}

function createCard(user, options = {}) {
    const card = document.createElement('div');
    card.className = 'colleague-card fade';

    const img = document.createElement('img');
    img.src = 'img/placeholder-profile.png';  // Replace later with user profile
    card.appendChild(img);

    const info = document.createElement('div');
    info.innerHTML = `
        <div><strong>${user.fullname}</strong></div>
        <div>${user.company || ''}</div>
        <div>${user.location || ''}</div>
    `;
    card.appendChild(info);

    if (options.request) {
        const btn = document.createElement('button');
        btn.textContent = 'Send forespørsel';
        btn.onclick = () => sendRequest(user.id);
        card.appendChild(btn);
    }

    if (options.remove) {
        const btn = document.createElement('button');
        btn.textContent = 'Fjern';
        btn.onclick = () => removeColleague(user.id);
        card.appendChild(btn);
    }
    return card;
}

function createRequestCard(req) {
    const card = createCard(req.user || req, {});
    const accept = document.createElement('button');
    accept.textContent = 'Godta';
    accept.onclick = () => respondRequest(req.id, true);

    const decline = document.createElement('button');
    decline.textContent = 'Avslå';
    decline.onclick = () => respondRequest(req.id, false);

    card.appendChild(accept);
    card.appendChild(decline);
    return card;
}
