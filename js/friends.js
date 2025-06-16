document.addEventListener('DOMContentLoaded', () => {
    loadPendingRequests();
    loadSentRequests();
    loadColleagues();

    document.getElementById('search-btn')
        .addEventListener('click', searchUsers);
});

function searchUsers() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    fetch(`api/search_users.php?query=${encodeURIComponent(query)}`, {
        credentials: 'include'
    })
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
    fetch('api/send_request.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(r => r.json())
    .then(() => {
        alert('Forespørsel sendt');
        loadSentRequests();
    })
    .catch(() => alert('Noe gikk galt'));
}

function loadPendingRequests() {
    fetch('api/pending_requests.php', { credentials: 'include' })
        .then(r => r.json())
        .then(requests => {
            const box = document.getElementById('pending-requests');
            box.innerHTML = '';
            requests.forEach(r => box.appendChild(createRequestCard(r)));
            if (typeof updateRequestAlert === 'function') updateRequestAlert();
        });
}

function loadSentRequests() {
    fetch('api/sent_requests.php', { credentials: 'include' })
        .then(r => r.json())
        .then(requests => {
            const box = document.getElementById('sent-requests');
            if (!box) return;
            box.innerHTML = '';
            requests.forEach(r => box.appendChild(createSentRequestCard(r)));
        });
}

function respondRequest(id, accept) {
    fetch('api/respond_request.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, accept })
    })
        .then(() => {
            loadPendingRequests();
            loadColleagues();
            if (typeof updateRequestAlert === 'function') updateRequestAlert();
        });
}

function loadColleagues() {
    fetch('api/my_colleagues.php', { credentials: 'include' })
        .then(r => r.json())
        .then(list => {
            const box = document.getElementById('colleagues-list');
            box.innerHTML = '';
            list.forEach(c => box.appendChild(createCard(c, { remove: true })));
        });
}

function removeColleague(id) {
    fetch('api/remove_colleague.php', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    .then(() => loadColleagues());
}

function createCard(user, options = {}) {
    const card = document.createElement('div');
    card.className = 'user-card fade';

    const avatar = document.createElement('div');
    avatar.className = 'avatar-img';
    if (user.avatar_url) {
        avatar.style.backgroundImage = `url('${user.avatar_url}')`;
        avatar.textContent = '';
    } else {
        avatar.textContent = '👤';
    }
    card.appendChild(avatar);

    const info = document.createElement('div');
    info.className = 'user-info';
    const name = user.firstname ? `${user.firstname} ${user.lastname || ''}` : (user.fullname || '');
    info.innerHTML = `<p class="name"><strong>${name.trim()}</strong></p>`;
    if (user.location) info.innerHTML += `<p>${user.location}</p>`;
    if (user.company) info.innerHTML += `<p>${user.company}</p>`;
    if (user.shift) info.innerHTML += `<p>${user.shift}</p>`;
    if (user.shift_date) info.innerHTML += `<p>${user.shift_date}</p>`;
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

function cancelRequest(id) {
    fetch('api/cancel_request.php', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    }).then(() => loadSentRequests());
}

function createSentRequestCard(req) {
    const card = createCard(req.user || req, {});
    const cancel = document.createElement('button');
    cancel.textContent = 'Slett';
    cancel.onclick = () => cancelRequest(req.id);
    card.appendChild(cancel);
    return card;
}
