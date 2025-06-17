const colorNames = {
    "#FF6666": "Light Red",
    "#FFB266": "Light Orange",
    "#FFFF66": "Light Yellow",
    "#B2FF66": "Lime",
    "#66FFB2": "Mint",
    "#66B2FF": "Sky Blue",
    "#CC66FF": "Violet",
    "#FF66B2": "Hot Pink",
    "#66FF66": "Bright Green",
    "#CCCCCC": "Gray",
    "#FF8C00": "Dark Orange",
    "#FFD700": "Gold",
    "#7CFC00": "Lawn Green",
    "#40E0D0": "Turquoise",
    "#1E90FF": "Dodger Blue",
    "#BA55D3": "Medium Orchid",
    "#FF1493": "Deep Pink",
    "#32CD32": "Lime Green",
    "#D3D3D3": "Light Gray",
    "#8B0000": "Dark Red",
    "#A52A2A": "Brown",
    "#2E8B57": "Sea Green",
    "#4682B4": "Steel Blue",
    "#FF4500": "Orange Red",
    "#DA70D6": "Orchid",
    "#B0C4DE": "Light Steel Blue",
    "#8A2BE2": "Blue Violet",
    "#20B2AA": "Light Sea Green",
    "#FF6347": "Tomato",
    "#9ACD32": "Yellow Green"
};

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
    if (options.compact) {
        if (user.company) info.innerHTML += `<p><strong>Firma:</strong> ${user.company}</p>`;
        if (user.location) info.innerHTML += `<p><strong>Arbeidssted:</strong> ${user.location}</p>`;
        if (user.shift) info.innerHTML += `<p><strong>Turnus:</strong> ${user.shift}</p>`;
    } else {
        if (user.company) info.innerHTML += `<p>${user.company}</p>`;
        if (user.location) info.innerHTML += `<p>${user.location}</p>`;
        if (user.shift) info.innerHTML += `<p>${user.shift}</p>`;
        // shift_date intentionally ignored
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
                sendRequest(user.id, btn);
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
        if (user.location) infoDiv.innerHTML += `<p><strong>Arbeidssted:</strong> ${user.location}</p>`;
        if (user.shift) infoDiv.innerHTML += `<p><strong>Turnus:</strong> ${user.shift}</p>`;
    }

    contentDiv.appendChild(infoDiv);
    card.appendChild(contentDiv);
    return card;
}
