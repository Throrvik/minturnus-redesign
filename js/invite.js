document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('ref');
  const refBox = document.getElementById('ref-info');
  if (ref) {
    refBox.textContent = `${decodeURIComponent(ref)} inviterte deg til å teste MinTurnus sammen med ham.`;
  } else {
    refBox.textContent = 'Bli med på MinTurnus – gratis verktøy for å holde orden på turnusen din.';
  }
});

