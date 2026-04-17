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

  let sfxPanelOpen = false;

  btnSfx.addEventListener('click', () => {
    if (!sfxPanelOpen) {
      // First click: open the panel
      sfxList.classList.add('open');
      sfxPanelOpen = true;
    } else {
      // Second click: close panel and mute all SFX
      sfxList.classList.remove('open');
      sfxPanelOpen = false;

      // Stop all ambient sounds
      document.querySelectorAll('.sfx-play-btn.playing').forEach(btn => {
        btn.click();
      });

      // Swap to crossed icon
      btnSfx.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6"/>
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>
          <line x1="2" y1="2" x2="22" y2="22"/>
        </svg>`;
    }
  });

  // Close panel when clicking outside (but don't mute)
  document.addEventListener('click', (e) => {
    if (sfxPanelOpen
        && sfxList.classList.contains('open')
        && !sfxList.contains(e.target)
        && e.target !== btnSfx
        && !btnSfx.contains(e.target)) {
      sfxList.classList.remove('open');
      sfxPanelOpen = false;
    }
  });

  // Restore normal icon when any SFX starts playing again
  const originalSfxIcon = btnSfx.innerHTML;
  const observer = new MutationObserver(() => {
    if (document.querySelector('.sfx-play-btn.playing')) {
      btnSfx.innerHTML = originalSfxIcon;
    }
  });
  observer.observe(document.querySelector('#sfx-list'), { subtree: true, attributes: true, attributeFilter: ['class'] });

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