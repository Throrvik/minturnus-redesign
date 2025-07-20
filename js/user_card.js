
function createCard(user, options = {}) {
    const card = document.createElement('div');
    card.className = 'user-card colleague-card fade';
    card.dataset.userid = user.id;
    if (options.compact) card.classList.add('compact');
    if (options.mini) card.classList.add('mini');

    const avatarWrap = document.createElement('div');
    avatarWrap.className = 'avatar';
    const avatar = document.createElement('div');
    avatar.className = 'avatar-img';
    if (user.avatar_url) {
        let src = user.avatar_url;
        if (!src.startsWith('http')) {
            src = src.replace(/^\/+/, '');
            src = 'https://minturnus.no/' + src;
        }
        avatar.style.backgroundImage = `url('${src}')`;
        avatar.textContent = '';
    } else {
        avatar.textContent = '👤';
    }
    avatarWrap.appendChild(avatar);
    card.appendChild(avatarWrap);

    const content = document.createElement('div');
    content.className = 'card-content';
    card.content = content;

    const info = document.createElement('div');
    info.className = 'user-info';
    const name = user.firstname ? `${user.firstname} ${user.lastname || ''}` : (user.fullname || '');
    const nameP = document.createElement('p');
    nameP.className = 'name text-xl mb-2';
    const strongName = document.createElement('strong');
    strongName.textContent = name.trim();
    nameP.appendChild(strongName);
    info.appendChild(nameP);
    if (!options.mini) {
        if (options.compact) {
            if (user.company) {
                const p = document.createElement('p');
                p.className = 'text-gray-700 mb-1';
                const s = document.createElement('strong');
                s.textContent = 'Firma:';
                p.appendChild(s);
                p.append(' ' + user.company);
                info.appendChild(p);
            }
            if (user.location) {
                const p = document.createElement('p');
                p.className = 'text-gray-700 mb-1';
                const s = document.createElement('strong');
                s.textContent = 'Lokasjon:';
                p.appendChild(s);
                p.append(' ' + user.location);
                info.appendChild(p);
            }
            if (user.shift) {
                const p = document.createElement('p');
                p.className = 'text-gray-700 mb-1';
                const s = document.createElement('strong');
                s.textContent = 'Turnus:';
                p.appendChild(s);
                p.append(' ' + user.shift);
                info.appendChild(p);
            }
        } else {
            if (user.company) {
                const p = document.createElement('p');
                p.className = 'text-gray-700 mb-1';
                p.textContent = user.company;
                info.appendChild(p);
            }
            if (user.location) {
                const p = document.createElement('p');
                p.className = 'text-gray-700 mb-1';
                p.textContent = user.location;
                info.appendChild(p);
            }
            if (user.shift) {
                const p = document.createElement('p');
                p.className = 'text-gray-700 mb-1';
                p.textContent = user.shift;
                info.appendChild(p);
            }
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

        const colorWrap = document.createElement('div');
        colorWrap.className = 'color-container';

        const colorDisplay = document.createElement('div');
        colorDisplay.className = 'color-display';
        const currentColor = colorPrefs[user.id] || '';
        if (currentColor) colorDisplay.style.backgroundColor = currentColor; else colorDisplay.textContent = 'A';
        colorWrap.appendChild(colorDisplay);

        const changeBtn = document.createElement('button');
        changeBtn.className = 'action-btn';
        changeBtn.textContent = 'Endre';
        colorWrap.appendChild(changeBtn);

        const picker = document.createElement('div');
        picker.className = 'color-picker hidden';
        const createSwatch = (col, label) => {
            const sw = document.createElement('div');
            sw.className = 'color-swatch';
            sw.dataset.color = col;
            if (col) sw.style.backgroundColor = col; else sw.textContent = label;
            if ((colorPrefs[user.id] || '') === col) sw.classList.add('selected');
            picker.appendChild(sw);
        };
        createSwatch('', 'A');
        allColors.forEach(c => createSwatch(c));
        picker.addEventListener('click', e => {
            const sw = e.target.closest('.color-swatch');
            if (!sw) return;
            e.stopPropagation();
            picker.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
            sw.classList.add('selected');
            const val = sw.dataset.color || '';
            fetch('api/colleague_colors.php', {
                credentials: 'include',
                method: val ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': window.CSRF_TOKEN },
                body: JSON.stringify({ id: user.id, color: val })
            }).then(() => {
                if (val) {
                    colorPrefs[user.id] = val;
                    colorDisplay.style.backgroundColor = val;
                    colorDisplay.textContent = '';
                } else {
                    delete colorPrefs[user.id];
                    colorDisplay.style.backgroundColor = '';
                    colorDisplay.textContent = 'A';
                }
                localStorage.setItem('colleagueColorPref', JSON.stringify(colorPrefs));
                updateColorOptions();
                picker.classList.add('hidden');
            });
        });
        changeBtn.addEventListener('click', e => {
            e.stopPropagation();
            picker.classList.toggle('hidden');
        });

        colorWrap.appendChild(picker);
        settings.appendChild(colorWrap);

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
        let src = user.avatar_url;
        if (!src.startsWith('http')) {
            src = src.replace(/^\/+/, '');
            src = 'https://minturnus.no/' + src;
        }
        img.src = src;
        img.alt = 'Profilbilde';
        contentDiv.appendChild(img);
    }

    const infoDiv = document.createElement('div');
    infoDiv.className = 'profile-info';
    if (!user.info_hide) {
        if (user.company) {
            const p = document.createElement('p');
            const s = document.createElement('strong');
            s.textContent = 'Firma:';
            p.appendChild(s);
            p.append(' ' + user.company);
            infoDiv.appendChild(p);
        }
        if (user.location) {
            const p = document.createElement('p');
            const s = document.createElement('strong');
            s.textContent = 'Lokasjon:';
            p.appendChild(s);
            p.append(' ' + user.location);
            infoDiv.appendChild(p);
        }
        if (user.shift) {
            const p = document.createElement('p');
            const s = document.createElement('strong');
            s.textContent = 'Turnus:';
            p.appendChild(s);
            p.append(' ' + user.shift);
            infoDiv.appendChild(p);
        }
    }

    contentDiv.appendChild(infoDiv);
    card.appendChild(contentDiv);
    return card;
}
