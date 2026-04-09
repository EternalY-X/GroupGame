// scenes.js — Scene switching + canvas particle system
// scenes.js — Scene switching + crossfade animation
// Eerie rhythm: slow creeping fades, asymmetric holds

(function () {
  'use strict';

  // ── Scene definitions ──
  // Each scene: 3 frames + per-step [fadeDuration, holdDuration] in ms
  // The asymmetry is the trick — long linger, then a quicker unsettling shift,
  // then the slowest creep back. Viewer can never predict the next change.
  const SCENES = {
    library: {
      frames: [
        'assets/scenes/dolls-1.jpg',
        'assets/scenes/dolls-2.jpg',
        'assets/scenes/dolls-3.jpg',
      ],
      timing: [
        { fade: 1500, hold: 3000 },   // frame 1 → 2
        { fade: 1000, hold: 2000 },   // frame 2 → 3
        { fade: 2000, hold: 3500 },   // frame 3 → 1
      ],
    },
    piano: {
      frames: [
        'assets/scenes/piano-1.png',
        'assets/scenes/piano-2.png',
        'assets/scenes/piano-3.png',
      ],
      timing: [
        { fade: 1800, hold: 3200 },
        { fade: 1200, hold: 2200 },
        { fade: 2200, hold: 3800 },
      ],
    },
    garden: {
      frames: [
        'assets/scenes/garden-1.png',
        'assets/scenes/garden-2.png',
        'assets/scenes/garden-3.png',
      ],
      timing: [
        { fade: 1600, hold: 3000 },
        { fade: 1000, hold: 2500 },
        { fade: 2000, hold: 4000 },
      ],
    },
  };

  // ── State ──
  let currentScene = null;
  let frameEls = [];
  let currentFrame = 0;
  let cycleTimer = null;
  let isRunning = false;

  const paintingsLayer = document.getElementById('layer-paintings');

  // ── Build 3 stacked <img> elements ──
  function createFrameElements() {
    paintingsLayer.innerHTML = '';
    frameEls = [];

    for (let i = 0; i < 3; i++) {
      const img = document.createElement('img');
      img.classList.add('scene-frame');
      img.alt = '';
      img.draggable = false;
      img.style.opacity = i === 0 ? '1' : '0';
      paintingsLayer.appendChild(img);
      frameEls.push(img);
    }
  }

  // ── Load a scene ──
  function loadScene(sceneKey) {
    const scene = SCENES[sceneKey];
    if (!scene) return;

    stopCycle();
    currentScene = scene;
    currentFrame = 0;

    createFrameElements();

    scene.frames.forEach((src, i) => {
      frameEls[i].src = src;
    });

    // Start cycle once first image is ready
    frameEls[0].onload = () => startCycle();
    // Fallback for cached / broken images
    setTimeout(() => { if (!isRunning) startCycle(); }, 300);
  }

  // ── Crossfade cycle ──
  function startCycle() {
    if (isRunning) return;
    isRunning = true;
    scheduleNext();
  }

  function stopCycle() {
    isRunning = false;
    if (cycleTimer) {
      clearTimeout(cycleTimer);
      cycleTimer = null;
    }
  }

  function scheduleNext() {
    if (!isRunning || !currentScene) return;

    const { fade, hold } = currentScene.timing[currentFrame];

    // Hold on current frame...
    cycleTimer = setTimeout(() => {
      if (!isRunning) return;

      const nextFrame = (currentFrame + 1) % 3;

      // Apply per-step fade duration so CSS ease-in-out picks it up
      frameEls[nextFrame].style.transitionDuration = fade + 'ms';
      frameEls[currentFrame].style.transitionDuration = fade + 'ms';

      // Cross-fade: next fades in, current fades out simultaneously
      frameEls[nextFrame].style.opacity = '1';
      frameEls[currentFrame].style.opacity = '0';

      // After the fade completes, advance and loop
      setTimeout(() => {
        currentFrame = nextFrame;
        scheduleNext();
      }, fade);

    }, hold);
  }

  // ── Wire scene-selector buttons ──
  function initSceneSelectors() {
    document.querySelectorAll('.scene-icon').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.scene;
        if (key && SCENES[key]) {
          loadScene(key);
        }
      });
    });
  }

  // ── Boot ──
  function init() {
    createFrameElements();
    initSceneSelectors();

    const activeIcon = document.querySelector('.scene-icon.active');
    loadScene(activeIcon?.dataset.scene || 'library');
  }

  window.Scenes = { loadScene, stopCycle };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();