const allColors = [
    "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FFB2",
    "#66B2FF", "#CC66FF", "#FF66B2", "#66FF66", "#CCCCCC",
    "#FF8C00", "#FFD700", "#7CFC00", "#40E0D0", "#1E90FF",
    "#BA55D3", "#FF1493", "#32CD32", "#D3D3D3", "#8B0000",
    "#A52A2A", "#2E8B57", "#4682B4", "#FF4500", "#DA70D6",
    "#B0C4DE", "#8A2BE2", "#20B2AA", "#FF6347", "#9ACD32"
];
let colorPrefs = {};

document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('colleagueColorPref');
    colorPrefs = stored ? JSON.parse(stored) : {};
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
        const card = createCard(u, { search: true, compact: true });
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
            list.forEach(c => box.appendChild(createCard(c, { remove: true, modal: true, compact: true })));
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
    if (options.compact) card.classList.add('compact');

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
    if (!options.compact) {
        if (user.company) info.innerHTML += `<p>${user.company}</p>`;
        if (user.location) info.innerHTML += `<p>${user.location}</p>`;
        if (user.shift) info.innerHTML += `<p>${user.shift}</p>`;
        if (user.shift_date) info.innerHTML += `<p>${user.shift_date}</p>`;
    }
    card.appendChild(info);

    if (options.modal) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showColleagueInfo(user.id));
    }

    if (options.search) {
        if (user.relation === 'colleague') {
            const span = document.createElement('span');
            span.className = 'status-text';
            span.textContent = 'Kollega';
            card.appendChild(span);
        } else if (user.relation === 'pending') {
            const span = document.createElement('span');
            span.className = 'status-text';
            span.textContent = 'Ventende forespørsel';
            card.appendChild(span);
        } else {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = 'Send forespørsel';
            btn.onclick = (e) => {
                e.stopPropagation();
                sendRequest(user.id);
            };
            card.appendChild(btn);
        }
    }

    if (options.remove) {
        const sel = document.createElement('select');
        const autoOpt = document.createElement('option');
        autoOpt.value = '';
        autoOpt.textContent = 'Auto';
        sel.appendChild(autoOpt);
        allColors.forEach(c => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = c;
            o.style.backgroundColor = c;
            sel.appendChild(o);
        });
        sel.value = colorPrefs[user.id] || '';
        sel.onchange = e => {
            const val = e.target.value;
            if (val) colorPrefs[user.id] = val; else delete colorPrefs[user.id];
            localStorage.setItem('colleagueColorPref', JSON.stringify(colorPrefs));
        };
        card.appendChild(sel);

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
    const card = createCard(req.user || req, { compact: true });
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
    const card = createCard(req.user || req, { compact: true });
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
            const modal = document.getElementById('colleague-modal');
            const content = document.getElementById('colleague-content');
            const card = createCard(data.user, {});
            content.innerHTML = '';
            content.appendChild(card);
            modal.style.display = 'block';
        });
}
