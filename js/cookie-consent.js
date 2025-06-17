if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('cookie-banner');
    if (!banner) return;
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      banner.style.display = 'flex';
    }
    const acceptBtn = document.getElementById('accept-cookies');
    const rejectBtn = document.getElementById('reject-cookies');
    if (acceptBtn) {
      acceptBtn.onclick = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        banner.style.display = 'none';
      };
    }
    if (rejectBtn) {
      rejectBtn.onclick = () => {
        localStorage.setItem('cookieConsent', 'rejected');
        banner.style.display = 'none';
      };
    }
  });
}
