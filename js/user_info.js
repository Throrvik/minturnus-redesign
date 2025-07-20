document.addEventListener('DOMContentLoaded', async () => {
  const userInfo = document.getElementById('user-info');
  const userAvatar = document.getElementById('user-avatar');
  const userFirstName = document.getElementById('user-firstname');
  const mobileUserLink = document.getElementById('mobile-user-link');
  const mobileUserAvatar = document.getElementById('mobile-user-avatar');
  const mobileUserFirstName = document.getElementById('mobile-user-firstname');
  const registerLinks = document.querySelectorAll('a[href="register.html"]');
  const friendsLinks = document.querySelectorAll('a[href="friends.html"]');
  const mobileProfileLink = document.getElementById('mobile-profile-link');
  const mobileLogoutBtn = document.getElementById('mobile-logout-btn');
  try {
    const res = await fetch('backend/get_user_data.php', { credentials: 'include' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === 'success' && data.user) {
      if (userInfo) userInfo.classList.remove('hidden');
      if (mobileUserLink) mobileUserLink.classList.remove('hidden');
      if (userFirstName) userFirstName.textContent = data.user.firstname || '';
      if (mobileUserFirstName) mobileUserFirstName.textContent = data.user.firstname || '';
      if (userAvatar && data.user.avatar_url) {
        let src = data.user.avatar_url;
        if (!src.startsWith('http')) {
          src = src.replace(/^\/+/, '');
          src = 'https://minturnus.no/' + src;
        }
        userAvatar.src = src;
        if (mobileUserAvatar) mobileUserAvatar.src = src;
      }
      registerLinks.forEach(l => l.classList.add('hidden'));
      friendsLinks.forEach(l => l.classList.remove('hidden'));
      if (mobileProfileLink) mobileProfileLink.classList.remove('hidden');
      if (mobileLogoutBtn) mobileLogoutBtn.classList.remove('hidden');
    } else {
      friendsLinks.forEach(l => l.classList.add('hidden'));
    }
  } catch (e) {
    console.error('Kunne ikke hente brukerinfo:', e);
  }
});
