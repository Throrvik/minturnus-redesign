document.addEventListener('DOMContentLoaded', () => {
    loadPendingRequests();
    loadColleagues();

    document.getElementById('search-btn')
        .addEventListener('click', searchUsers);
    document.getElementById('search-input')
        .addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                e.preventDefault();
                searchUsers();
            }
        });

    const closeBtn = document.getElementById('colleague-close');
    const modal = document.getElementById('colleague-modal');
    if (closeBtn && modal) {
        closeBtn.onclick = () => modal.style.display = 'none';
        window.addEventListener('click', e => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }
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
            list.forEach(c => box.appendChild(createCard(c, { remove: true, modal: true })));
            const count = document.getElementById('colleague-count');
            if (count) count.textContent = list.length;
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
    if (user.company) info.innerHTML += `<p>${user.company}</p>`;
    if (user.location) info.innerHTML += `<p>${user.location}</p>`;
    if (user.shift) info.innerHTML += `<p>${user.shift}</p>`;
    card.appendChild(info);

    if (options.modal) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showColleagueInfo(user.id));
    }

    if (options.request) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = 'Send forespørsel';
        btn.onclick = (e) => {
            e.stopPropagation();
            sendRequest(user.id);
        };
        card.appendChild(btn);
    }

    if (options.remove) {
        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = 'Fjern';
        btn.onclick = (e) => {
            e.stopPropagation();
            removeColleague(user.id);
        };
        card.appendChild(btn);
    }
    return card;
}

function createRequestCard(req) {
    const card = createCard(req.user || req, {});
    const accept = document.createElement('button');
    accept.className = 'action-btn';
    accept.textContent = 'Godta';
    accept.onclick = () => respondRequest(req.id, true);

    const decline = document.createElement('button');
    decline.className = 'action-btn';
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
    cancel.className = 'action-btn';
    cancel.textContent = 'Slett';
    cancel.onclick = () => cancelRequest(req.id);
    card.appendChild(cancel);
    return card;
}

function showColleagueInfo(id) {
    fetch(`api/user_info.php?id=${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success') return;
            const u = data.user;
            const modal = document.getElementById('colleague-modal');
            const content = document.getElementById('colleague-content');
            let html = `<div class="user-card">`;
            const avatar = u.avatar_url ? `background-image:url('${u.avatar_url}')` : '';
            html += `<div class="avatar-img" style="${avatar}">${u.avatar_url ? '' : '👤'}</div>`;
            html += `<div class="user-info">`;
            const name = `${u.firstname || ''} ${u.lastname || ''}`.trim();
            html += `<p class="name"><strong>${name}</strong></p>`;
            if (u.company) html += `<p>${u.company}</p>`;
            if (u.location) html += `<p>${u.location}</p>`;
            if (u.shift) html += `<p>${u.shift}</p>`;
            html += `</div></div>`;
            content.innerHTML = html;
            modal.style.display = 'block';
        });
}
