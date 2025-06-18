// JS module for colleague suggestions based on user profile

const initColleagueSuggestions = async () => {
    const container = document.getElementById('colleague-suggestions');
    if (!container) return;

    // Retrieve ignored user IDs from localStorage
    const ignored = JSON.parse(localStorage.getItem('ignoredSuggestions') || '[]');

    try {
        // Fetch current user profile
        const userRes = await fetch('backend/get_user_data.php', { credentials: 'include' });
        if (!userRes.ok) return;
        const userData = await userRes.json();
        if (!userData || userData.status !== 'success') return;
        const currentUser = userData.user;

        // Fetch all other users
        const res = await fetch('api/all_users.php', { credentials: 'include' });
        if (!res.ok) return;
        const users = await res.json();

        // Fetch existing colleagues to exclude them from suggestions
        const colRes = await fetch('api/my_colleagues.php', { credentials: 'include' });
        const colleagues = colRes.ok ? await colRes.json() : [];
        const colleagueIds = new Set(colleagues.map(c => String(c.id)));

        // Filter out ignored users and already added colleagues
        const others = users.filter(u =>
            !ignored.includes(String(u.id)) &&
            u.id !== currentUser.id &&
            !colleagueIds.has(String(u.id))
        );

        // Score users based on profile similarity
        others.forEach(u => {
            let score = 0;
            if (u.company && currentUser.company && u.company === currentUser.company) score++;
            if (u.location && currentUser.location && u.location === currentUser.location) score++;
            if (u.shift && currentUser.shift && u.shift === currentUser.shift) score++;
            u._score = score;
        });

        // Sort by score descending
        others.sort((a, b) => b._score - a._score);

        // Take top 10 and shuffle
        const top = others.slice(0, 10);
        for (let i = top.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [top[i], top[j]] = [top[j], top[i]];
        }

        const suggestions = top.slice(0, 5);
        suggestions.forEach(user => {
            const card = createCard(user, { compact: true });
            card.classList.add('suggestion-card');

            const requestBtn = document.createElement('button');
            requestBtn.className = 'action-btn';
            requestBtn.textContent = 'Send forespørsel';
            requestBtn.onclick = e => {
                e.stopPropagation();
                sendRequest(user.id, requestBtn);
            };

            const removeBtn = document.createElement('button');
            removeBtn.className = 'action-btn';
            removeBtn.textContent = 'Fjern';
            removeBtn.onclick = () => {
                container.removeChild(card);
                const list = JSON.parse(localStorage.getItem('ignoredSuggestions') || '[]');
                if (!list.includes(String(user.id))) {
                    list.push(String(user.id));
                    localStorage.setItem('ignoredSuggestions', JSON.stringify(list));
                }
            };

            card.appendChild(requestBtn);
            card.appendChild(removeBtn);
            container.appendChild(card);
        });
    } catch (e) {
        console.error('Failed to load colleague suggestions', e);
    }
};

document.addEventListener('DOMContentLoaded', initColleagueSuggestions);
