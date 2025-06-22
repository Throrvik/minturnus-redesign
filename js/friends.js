const allColors = [
    "#FF6666", "#FFB266", "#FFFF66", "#B2FF66", "#66FFB2",
    "#66B2FF", "#CC66FF", "#FF66B2", "#66FF66", "#CCCCCC",
    "#FF8C00", "#FFD700", "#7CFC00", "#40E0D0", "#1E90FF",
    "#BA55D3", "#FF1493", "#32CD32", "#D3D3D3", "#8B0000",
    "#A52A2A", "#2E8B57", "#4682B4", "#FF4500", "#DA70D6",
    "#B0C4DE", "#8A2BE2", "#20B2AA", "#FF6347", "#9ACD32"
];
let colorPrefs = {};
let closePrefs = {};

document.addEventListener('DOMContentLoaded', () => {
    const stored = localStorage.getItem('colleagueColorPref');
    colorPrefs = stored ? JSON.parse(stored) : {};
    fetch('api/close_colleagues.php', { credentials: 'include' })
        .then(r => r.json())
        .then(ids => {
            closePrefs = {};
            ids.forEach(id => closePrefs[id] = true);
            localStorage.setItem('closeColleagues', JSON.stringify(closePrefs));
        })
        .catch(() => {
            const closeStored = localStorage.getItem('closeColleagues');
            closePrefs = closeStored ? JSON.parse(closeStored) : {};
        });
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

    // Share modal setup
    const shareBtn = document.getElementById('share-btn');
    const shareModal = document.getElementById('share-modal');
    const shareClose = document.getElementById('share-close');
    const shareLink = document.getElementById('share-link');
    const copyBtn = document.getElementById('copy-link-btn');
    const messengerLink = document.getElementById('messenger-link');
    const qrBox = document.getElementById('qr-code');
    const copyFeedback = document.getElementById('copy-feedback');

    let shareURL = 'https://minturnus.no/venn';
    const refName = localStorage.getItem('userName');
    if (refName) {
        shareURL += '?ref=' + encodeURIComponent(refName);
    }

    if (shareLink) shareLink.value = shareURL;

    fetch('backend/get_config.php')
        .then(r => r.json())
        .then(cfg => {
            const appId = cfg.facebook_app_id || '';
            if (messengerLink) {
                if (appId) {
                    messengerLink.href =
                        `https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareURL)}&app_id=${appId}&redirect_uri=https://minturnus.no/`;
                } else {
                    messengerLink.href = 'https://m.me/?link=' + encodeURIComponent(shareURL);
                }
            }
        });

    function openShare() {
        if (shareModal) shareModal.style.display = 'block';
        if (qrBox) {
            qrBox.innerHTML = '';
            if (typeof QRCode === 'function') {
                new QRCode(qrBox, { text: shareURL, width: 160, height: 160 });
            } else {
                const img = document.createElement('img');
                img.src = 'https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=' + encodeURIComponent(shareURL);
                qrBox.appendChild(img);
            }
        }
    }

    if (shareBtn) shareBtn.onclick = openShare;
    if (shareClose) shareClose.onclick = () => { if (shareModal) shareModal.style.display = 'none'; };
    window.addEventListener('click', e => { if (e.target === shareModal) shareModal.style.display = 'none'; });
    if (copyBtn) copyBtn.onclick = () => {
        shareLink.select();
        shareLink.setSelectionRange(0, 99999);
        document.execCommand('copy');
        if (copyFeedback) {
            copyFeedback.textContent = 'Lenke kopiert!';
            copyFeedback.style.display = 'block';
            setTimeout(() => { copyFeedback.style.display = 'none'; }, 3000);
        }
    };
});

function updateColorOptions() {
    const used = new Set(Object.values(colorPrefs).filter(c => c));
    document.querySelectorAll('#colleagues-list select').forEach(sel => {
        const current = sel.value;
        Array.from(sel.options).forEach(opt => {
            if (!opt.value) return;
            opt.disabled = used.has(opt.value) && opt.value !== current;
        });
    });
}

function searchUsers() {
    const query = document.getElementById('search-input').value.trim();
    const box = document.getElementById('search-results');
    if (query.length < 2) {
        box.innerHTML = '<p>Skriv minst to bokstaver.</p>';
        return;
    }

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
        const card = createCard(u, { search: true, mini: true });
        card.classList.add('search-card');
        box.appendChild(card);
    });
}

function sendRequest(id, btn) {
    return fetch('api/send_request.php', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
        body: JSON.stringify({ id })
    })
        .then(r => r.json())
        .then(() => {
            if (btn) {
                btn.textContent = 'Ventende forespørsel';
                btn.disabled = true;
            }
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
            if (typeof updatePendingBadge === 'function') updatePendingBadge();
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
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
        body: JSON.stringify({ id, accept })
    })
        .then(() => {
            loadPendingRequests();
            loadColleagues();
            if (typeof updatePendingBadge === 'function') updatePendingBadge();
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
            updateColorOptions();
        });
}

function removeColleague(id) {
    fetch('api/remove_colleague.php', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
        body: JSON.stringify({ id })
    })
    .then(() => loadColleagues());
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

    card.content.appendChild(accept);
    card.content.appendChild(decline);
    return card;
}

function cancelRequest(id) {
    fetch('api/cancel_request.php', {
        credentials: 'include',
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
        body: JSON.stringify({ id })
    }).then(() => loadSentRequests());
}

function createSentRequestCard(req) {
    const card = createCard(req.user || req, { compact: true });
    const cancel = document.createElement('button');
    cancel.className = 'action-btn';
    cancel.textContent = 'Slett';
    cancel.onclick = () => cancelRequest(req.id);
    card.content.appendChild(cancel);
    return card;
}

function showColleagueInfo(id) {
    fetch(`api/user_info.php?id=${id}`, { credentials: 'include' })
        .then(r => r.json())
        .then(data => {
            if (!data || data.status !== 'success') return;
            const modal = document.getElementById('colleague-modal');
            const content = document.getElementById('colleague-content');
            const card = createProfileCard(data.user);
            content.innerHTML = '';
            content.appendChild(card);
            modal.style.display = 'block';
        });
}
