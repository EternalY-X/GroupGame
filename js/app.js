// app.js — Main controller
// Wires together UI toggles for the wireframe pass

(function () {
  'use strict';

  // ── Hide-UI toggle ──
  const btnHide   = document.getElementById('btn-hide-ui');
  const uiOverlay = document.getElementById('ui-overlay');
  const eyeOpen   = document.getElementById('icon-eye-open');
  const eyeClosed = document.getElementById('icon-eye-closed');

  btnHide.addEventListener('click', () => {
    const hidden = uiOverlay.classList.toggle('hidden');
    eyeOpen.style.display   = hidden ? 'none'  : 'block';
    eyeClosed.style.display = hidden ? 'block' : 'none';
    btnHide.title = hidden ? 'Show UI' : 'Hide UI';
  });

  // ── Playlist popup toggle ──
  const btnPlaylist    = document.getElementById('btn-open-playlist');
  const playlistPopup  = document.getElementById('playlist-popup');

  btnPlaylist.addEventListener('click', () => {
    playlistPopup.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (playlistPopup.classList.contains('open')
        && !playlistPopup.contains(e.target)
        && e.target !== btnPlaylist
        && !btnPlaylist.contains(e.target)) {
      playlistPopup.classList.remove('open');
    }
  });

  // ── Playlist cover selection ──
  document.querySelectorAll('.playlist-cover-item').forEach(cover => {
    cover.addEventListener('click', () => {
      document.querySelectorAll('.playlist-cover-item').forEach(c => c.classList.remove('active'));
      cover.classList.add('active');
      const label = cover.querySelector('.cover-label')?.textContent || '';
      const header = document.querySelector('.playlist-tracks-header h3');
      if (header) header.textContent = label;
    });
  });

  // ── SFX volume panel toggle ──
  const btnSfx  = document.getElementById('btn-sfx-toggle');
  const sfxList = document.getElementById('sfx-list');

  btnSfx.addEventListener('click', () => {
    sfxList.classList.toggle('open');
  });

  document.addEventListener('click', (e) => {
    if (sfxList.classList.contains('open')
        && !sfxList.contains(e.target)
        && e.target !== btnSfx
        && !btnSfx.contains(e.target)) {
      sfxList.classList.remove('open');
    }
  });

  // ── Scene selector active state ──
  document.querySelectorAll('.scene-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.scene-icon').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

})();