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
            o.textContent = c;
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
