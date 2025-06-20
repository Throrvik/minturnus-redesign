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

function createCard(user, options = {}) {
    const card = document.createElement('div');
    card.className = 'user-card fade';
    if (options.compact) card.classList.add('compact');
    if (options.mini) card.classList.add('mini');

    const avatar = document.createElement('div');
    avatar.className = 'avatar-img';
    if (user.avatar_url) {
        avatar.style.backgroundImage = `url('${user.avatar_url}')`;
        avatar.textContent = '';
    } else {
        avatar.textContent = '👤';
    }
    card.appendChild(avatar);

    const content = document.createElement('div');
    content.className = 'card-content';
    card.content = content;

    const info = document.createElement('div');
    info.className = 'user-info';
    const name = user.firstname ? `${user.firstname} ${user.lastname || ''}` : (user.fullname || '');
    info.innerHTML = `<p class="name"><strong>${name.trim()}</strong></p>`;
    if (!options.mini) {
        if (options.compact) {
            if (user.company) info.innerHTML += `<p><strong>Firma:</strong> ${user.company}</p>`;
            if (user.location) info.innerHTML += `<p><strong>Lokasjon:</strong> ${user.location}</p>`;
            if (user.shift) info.innerHTML += `<p><strong>Turnus:</strong> ${user.shift}</p>`;
        } else {
            if (user.company) info.innerHTML += `<p>${user.company}</p>`;
            if (user.location) info.innerHTML += `<p>${user.location}</p>`;
            if (user.shift) info.innerHTML += `<p>${user.shift}</p>`;
            // shift_date intentionally ignored
        }
    }
    content.appendChild(info);
    card.appendChild(content);

    if (options.modal) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => showColleagueInfo(user.id));
    }

    if (options.search) {
        if (user.relation === 'colleague') {
            const span = document.createElement('span');
            span.className = 'status-text';
            span.textContent = 'Kollega';
            content.appendChild(span);
        } else if (user.relation === 'pending') {
            const span = document.createElement('span');
            span.className = 'status-text';
            span.textContent = 'Ventende forespørsel';
            content.appendChild(span);
        } else {
            const btn = document.createElement('button');
            btn.className = 'action-btn';
            btn.textContent = 'Send forespørsel';
            btn.onclick = (e) => {
                e.stopPropagation();
                sendRequest(user.id, btn);
            };
            content.appendChild(btn);
        }
    }

    if (options.remove) {
        const settings = document.createElement('div');
        settings.className = 'settings-row';

        const sel = document.createElement('select');
        const autoOpt = document.createElement('option');
        autoOpt.value = '';
        autoOpt.textContent = 'Auto';
        sel.appendChild(autoOpt);
        allColors.forEach(c => {
            const o = document.createElement('option');
            o.value = c;
            o.textContent = colorNames[c] || c;
            o.style.backgroundColor = c;
            sel.appendChild(o);
        });
        sel.value = colorPrefs[user.id] || '';
        sel.addEventListener('click', e => e.stopPropagation());
        sel.onchange = e => {
            const val = e.target.value;
            if (val) colorPrefs[user.id] = val; else delete colorPrefs[user.id];
            localStorage.setItem('colleagueColorPref', JSON.stringify(colorPrefs));
            updateColorOptions();
        };
        settings.appendChild(sel);

        const lbl = document.createElement('label');
        lbl.className = 'close-label';
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.checked = closePrefs[user.id] || false;
        cb.addEventListener('click', e => e.stopPropagation());
        lbl.addEventListener('click', e => e.stopPropagation());
        cb.onchange = e => {
            const checked = e.target.checked;
            fetch('api/close_colleagues.php', {
                credentials: 'include',
                method: checked ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: user.id })
            }).then(() => {
                if (checked) closePrefs[user.id] = true; else delete closePrefs[user.id];
                localStorage.setItem('closeColleagues', JSON.stringify(closePrefs));
            });
        };
        lbl.appendChild(cb);
        lbl.appendChild(document.createTextNode(' Nær kollega'));
        settings.appendChild(lbl);
        content.appendChild(settings);

        const btn = document.createElement('button');
        btn.className = 'action-btn';
        btn.textContent = 'Fjern';
        btn.onclick = (e) => {
            e.stopPropagation();
            removeColleague(user.id);
        };
        content.appendChild(btn);
    }
    return card;
}

function createProfileCard(user) {
    const card = document.createElement('div');
    card.className = 'profile-card fade';

    const nameEl = document.createElement('h2');
    nameEl.className = 'profile-name';
    const name = user.firstname ? `${user.firstname} ${user.lastname || ''}` : (user.fullname || '');
    nameEl.textContent = name.trim();
    card.appendChild(nameEl);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'profile-content';

    if (user.avatar_url) {
        const img = document.createElement('img');
        img.className = 'profile-image';
        img.src = user.avatar_url;
        img.alt = 'Profilbilde';
        contentDiv.appendChild(img);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'profile-info';
    if (!user.info_hide) {
        if (user.company) infoDiv.innerHTML += `<p><strong>Firma:</strong> ${user.company}</p>`;
        if (user.location) infoDiv.innerHTML += `<p><strong>Lokasjon:</strong> ${user.location}</p>`;
        if (user.shift) infoDiv.innerHTML += `<p><strong>Turnus:</strong> ${user.shift}</p>`;
    }

    contentDiv.appendChild(infoDiv);
    card.appendChild(contentDiv);
    return card;
}
