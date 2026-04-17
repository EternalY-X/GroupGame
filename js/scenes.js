// scenes.js — Scene switching + crossfade + canvas particle engine

(function () {
  'use strict';

  // ════════════════════════════════════════════
  //  SCENE DEFINITIONS
  // ════════════════════════════════════════════

  const SCENES = {
    dollhouse: {
      frames: [
        'assets/scenes/dollhouse/dolls-1.jpg',
        'assets/scenes/dollhouse/dolls-2.jpg',
        'assets/scenes/dollhouse/dolls-3.jpg',
      ],
      timing: [
        { fade: 3000, hold: 5000 },
        { fade: 1800, hold: 3000 },
        { fade: 4000, hold: 6000 },
      ],
      particles: {
        threads: {
          count: 5,
          opacity: 0.5,
          colors: [
            [180, 190, 185],
            [160, 175, 170],
            [200, 205, 200],
            [145, 160, 155],
            [190, 195, 192],
          ],
          widthMin: 1,
          widthMax: 1.9,
          driftSpeed: 4,
        },
        grain: {
          count: 900,
          opacity: 0.7,
          color: [160, 170, 165],
          colorVariance: 40,
          sizeMin: 0.1,
          sizeMax: 2.2,
          driftSpeed: 0.2,
          jitter: 0.1,
          turnRate: 0.02,
        },
      },
    },

    garden: {
      frames: [
        'assets/scenes/fairy-garden/1.jpg',
        'assets/scenes/fairy-garden/2.jpg',
        'assets/scenes/fairy-garden/3.jpg',
      ],
      timing: [
        { fade: 3200, hold: 5000 },
        { fade: 2200, hold: 4000 },
        { fade: 4200, hold: 7000 },
      ],
      particles: {
        threads: null,
        grain: {
          count: 15,
          opacity: 0.09,
          color: [190, 195, 185],
          colorVariance: 50,
          sizeMin: 200,
          sizeMax: 300,
          driftSpeed: 0.2,
          jitter: 0.1,
          turnRate: 0.001,
          blur: 40,
          yMin: 0.65,        // fog only in bottom 35% of screen
          yMax: 1.0,
        },
         rain: {
          count: 300,
          opacity: 0.25,
          color: [180, 190, 185],
          colorVariance: 10,
          length: 18,         // raindrop streak length in px
          speed: 7,           // fall speed
          speedVariance: 7,
          angle: 0.15,        // slight wind angle in radians (tilts right)
          width: 0.8,
        },
      },
    },

    ballroom: {
      frames: [
        'assets/scenes/ballroom/1.jpg',
        'assets/scenes/ballroom/2.jpg',
        'assets/scenes/ballroom/3.jpg',
      ],
      timing: [
        { fade: 3500, hold: 5500 },
        { fade: 2000, hold: 3500 },
        { fade: 4500, hold: 6500 },
      ],

      particles: {
        threads: null,
        grain: null,
        embers: {
          count: 250,
          opacity: 0.7,
          color: [184, 133, 120],
          colorVariance: 50,
          sizeMin: 0.3,
          sizeMax: 6,
          riseSpeed: 0.7,
          riseVariance: 0.7,
          drift: 0.3,
          fadeHeight: 0.8,
        },
      },
    },
  };


 // ════════════════════════════════════════════
  //  CROSSFADE SYSTEM — Simple forward loop
  //  Uses only TWO img elements that swap roles.
  //  "show" is the visible frame, "next" fades in
  //  on top, then becomes "show". No stacking issues.
  // ════════════════════════════════════════════

  let currentSceneKey = null;
  let currentScene = null;
  let currentFrame = 0;
  let cycleTimer = null;
  let isCycleRunning = false;

  const paintingsLayer = document.getElementById('layer-paintings');

  // Only TWO img elements ever — they alternate roles
  let imgA = null;
  let imgB = null;
  let showingA = true;  // which one is currently visible

  function createFrameElements() {
    paintingsLayer.innerHTML = '';

    imgA = document.createElement('img');
    imgB = document.createElement('img');

    [imgA, imgB].forEach(function (img) {
      img.classList.add('scene-frame');
      img.alt = '';
      img.draggable = false;
      img.style.opacity = '0';
      paintingsLayer.appendChild(img);
    });

    // A starts visible
    imgA.style.opacity = '1';
    showingA = true;
  }

  function loadScene(sceneKey) {
    var scene = SCENES[sceneKey];
    if (!scene) return;

    stopCycle();
    currentSceneKey = sceneKey;
    currentScene = scene;
    currentFrame = 0;

    createFrameElements();

    // Load first frame into A (the visible one)
    imgA.src = scene.frames[0];
    imgA.onload = function () {
    imgA.onload = null;  // one-shot — don't fire again on future src changes
    startCycle();
  };
  setTimeout(function () { if (!isCycleRunning) startCycle(); }, 500);

    loadParticles(scene.particles);

    // Toggle ballroom candle glow CSS
    var fxLayer = document.getElementById('layer-css-fx');
    fxLayer.className = 'scene-layer';
    if (sceneKey === 'ballroom') fxLayer.classList.add('scene-ballroom');

// Switch ambient SFX and playlist — delayed to ensure audio.js is loaded
    setTimeout(function () {
      if (window.resetSfxMuteState) window.resetSfxMuteState();
      if (window.switchSceneSFX) window.switchSceneSFX(sceneKey);
      var sceneToPlaylist = { dollhouse: 'DollHouse', garden: 'Garden', ballroom: 'Ballroom' };
      if (window.changePlaylist && sceneToPlaylist[sceneKey]) {
        window.changePlaylist(sceneToPlaylist[sceneKey]);
      }
    }, 0);
  }

  function startCycle() {
    if (isCycleRunning) return;
    isCycleRunning = true;
    scheduleNext();
  }

  function stopCycle() {
    isCycleRunning = false;
    if (cycleTimer) { clearTimeout(cycleTimer); cycleTimer = null; }
  }

// Forward loop: 0 → 1 → 2 → 0 → 1 → 2...
  // Uses the two img elements (imgA, imgB) that swap roles.
  // Every timeout stored in cycleTimer — stopCycle() cancels it.
  function scheduleNext() {
    if (!isCycleRunning || !currentScene) return;
    var timing = currentScene.timing[currentFrame % currentScene.timing.length];
    var totalFrames = currentScene.frames.length;
    var nextFrame = (currentFrame + 1) % totalFrames;

    // Phase 1: hold on current frame
    cycleTimer = setTimeout(function () {
      if (!isCycleRunning) return;

      var show = showingA ? imgA : imgB;  // currently visible
      var next = showingA ? imgB : imgA;  // will become visible

      // Load next frame into the hidden img
      next.src = currentScene.frames[nextFrame];

      var doFade = function () {
        // Show "next" instantly underneath, then fade "show" out
        next.style.transitionDuration = '0ms';
        next.style.opacity = '1';
        void next.offsetHeight;  // force paint

        show.style.transitionDuration = timing.fade + 'ms';
        show.style.opacity = '0';

        // Phase 2: wait for fade to finish, then loop
        // Same cycleTimer — stopCycle still cancels this
        cycleTimer = setTimeout(function () {
          if (!isCycleRunning) return;
          currentFrame = nextFrame;
          showingA = !showingA;
          scheduleNext();
        }, timing.fade);
      };

      if (next.complete && next.naturalWidth > 0) {
  doFade();
} else {
  next.onload = function () {
    next.onload = null;
    doFade();
  };
}
    }, timing.hold);
  }

  // ════════════════════════════════════════════
  //  PARTICLE ENGINE
  // ════════════════════════════════════════════

  var particleCanvas = document.getElementById('particle-canvas');
  var ctx = particleCanvas.getContext('2d');
  var W = 0, H = 0;
  var animRunning = false;
  var threads = [];
  var grains = [];
  var raindrops = [];
  var embers = [];

  function resizeCanvas() {
    var dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    particleCanvas.width = W * dpr;
    particleCanvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resizeCanvas);


  // ── Thread (cobweb filament) ──

  function Thread(cfg) {
    this.cfg = cfg;
    this.reset();
  }

  Thread.prototype.reset = function () {
    var c = this.cfg;
    this.x0 = Math.random() * W;
    this.y0 = Math.random() * H;
    this.x3 = Math.random() * W;
    this.y3 = Math.random() * H;

    this.cx1 = this.x0 + (Math.random() - 0.5) * W * 0.5;
    this.cy1 = this.y0 + (Math.random() - 0.5) * H * 0.4;
    this.cx2 = this.x3 + (Math.random() - 0.5) * W * 0.5;
    this.cy2 = this.y3 + (Math.random() - 0.5) * H * 0.4;

    this.dcx1 = (Math.random() - 0.5) * 0.15;
    this.dcy1 = (Math.random() - 0.5) * 0.12;
    this.dcx2 = (Math.random() - 0.5) * 0.15;
    this.dcy2 = (Math.random() - 0.5) * 0.12;
    this.dx0 = (Math.random() - 0.5) * 0.05;
    this.dy0 = (Math.random() - 0.5) * 0.04;
    this.dx3 = (Math.random() - 0.5) * 0.05;
    this.dy3 = (Math.random() - 0.5) * 0.04;

    var rgb = c.colors[Math.floor(Math.random() * c.colors.length)];
    this.colorStr = rgb[0] + ',' + rgb[1] + ',' + rgb[2];
    this.width = c.widthMin + Math.random() * (c.widthMax - c.widthMin);
    this.opacityMul = 0.6 + Math.random() * 0.4;

    this.life = 0;
    this.maxLife = 800 + Math.random() * 600;
    this.fadeIn = 120;
    this.fadeOut = 150;
  };

  Thread.prototype.update = function () {
    var s = this.cfg.driftSpeed;
    this.cx1 += this.dcx1 * s;
    this.cy1 += this.dcy1 * s;
    this.cx2 += this.dcx2 * s;
    this.cy2 += this.dcy2 * s;
    this.x0 += this.dx0 * s;
    this.y0 += this.dy0 * s;
    this.x3 += this.dx3 * s;
    this.y3 += this.dy3 * s;
    this.life++;
    if (this.life > this.maxLife) this.reset();
  };

  Thread.prototype.draw = function () {
    var alpha = this.cfg.opacity * this.opacityMul;
    if (this.life < this.fadeIn) {
      alpha *= this.life / this.fadeIn;
    } else if (this.life > this.maxLife - this.fadeOut) {
      alpha *= (this.maxLife - this.life) / this.fadeOut;
    }
    if (alpha < 0.005) return;

    ctx.beginPath();
    ctx.moveTo(this.x0, this.y0);
    ctx.bezierCurveTo(this.cx1, this.cy1, this.cx2, this.cy2, this.x3, this.y3);
    ctx.strokeStyle = 'rgba(' + this.colorStr + ',' + alpha + ')';
    ctx.lineWidth = this.width;
    ctx.stroke();
  };


  // ── Grain dot (flowing dust) ──

  function GrainDot(cfg) {
    this.cfg = cfg;
    var yMin = (cfg.yMin || 0) * H;
    var yMax = (cfg.yMax || 1) * H;
    this.x = Math.random() * W;
    this.y = yMin + Math.random() * (yMax - yMin);
    this.yMin = yMin;
    this.yMax = yMax;
    this.size = cfg.sizeMin + Math.random() * (cfg.sizeMax - cfg.sizeMin);

    this.angle = Math.random() * Math.PI * 2;
    this.turnSpeed = (Math.random() - 0.5) * 2;
    this.speedMul = 0.5 + Math.random() * 1.0;

    var base = cfg.color;
    var v = cfg.colorVariance;
    var r = Math.round(base[0] + (Math.random() - 0.5) * v);
    var g = Math.round(base[1] + (Math.random() - 0.5) * v);
    var b = Math.round(base[2] + (Math.random() - 0.5) * v);
    this.colorStr = r + ',' + g + ',' + b;

    this.opacityMul = 0.3 + Math.random() * 0.7;
    this.pulsePhase = Math.random() * Math.PI * 2;
    this.pulseSpeed = 0.003 + Math.random() * 0.008;
  }

  GrainDot.prototype.update = function () {
    var c = this.cfg;
    this.angle += this.turnSpeed * c.turnRate;

    var speed = c.driftSpeed * this.speedMul;
    this.x += Math.cos(this.angle) * speed;
    this.y += Math.sin(this.angle) * speed;

    this.x += (Math.random() - 0.5) * c.jitter * 2;
    this.y += (Math.random() - 0.5) * c.jitter * 2;

    var pad = 20;
    if (this.x < -pad) this.x = W + pad;
    if (this.x > W + pad) this.x = -pad;
    if (this.cfg.yMin !== undefined) {
      // Constrained to a vertical band — wrap within it
      if (this.y < this.yMin - pad) this.y = this.yMax + pad;
      if (this.y > this.yMax + pad) this.y = this.yMin - pad;
    } else {
      if (this.y < -pad) this.y = H + pad;
      if (this.y > H + pad) this.y = -pad;
    }

    this.pulsePhase += this.pulseSpeed;
  };

  GrainDot.prototype.draw = function () {
    var pulse = 0.6 + 0.4 * Math.sin(this.pulsePhase);
    var alpha = this.cfg.opacity * this.opacityMul * pulse;
    if (alpha < 0.005) return;

    if (this.cfg.blur) {
      ctx.save();
      ctx.filter = 'blur(' + this.cfg.blur + 'px)';
    }
    ctx.fillStyle = 'rgba(' + this.colorStr + ',' + alpha + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    if (this.cfg.blur) {
      ctx.restore();
    }
  };

  // ── Rain streak ──

  function RainDrop(cfg) {
    this.cfg = cfg;
    this.reset(true);
  }

  RainDrop.prototype.reset = function (initial) {
    var c = this.cfg;
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : -20;
    this.speed = c.speed + (Math.random() - 0.5) * c.speedVariance;
    this.length = c.length * (0.7 + Math.random() * 0.6);
    this.opacity = c.opacity * (0.4 + Math.random() * 0.6);
    this.width = c.width * (0.6 + Math.random() * 0.8);

    var base = c.color;
    var v = c.colorVariance;
    var r = Math.round(base[0] + (Math.random() - 0.5) * v);
    var g = Math.round(base[1] + (Math.random() - 0.5) * v);
    var b = Math.round(base[2] + (Math.random() - 0.5) * v);
    this.colorStr = r + ',' + g + ',' + b;
  };

  RainDrop.prototype.update = function () {
    var c = this.cfg;
    this.x += Math.sin(c.angle) * this.speed;
    this.y += Math.cos(c.angle) * this.speed;

    if (this.y > H + 20) this.reset(false);
    if (this.x > W + 20) this.x = -20;
    if (this.x < -20) this.x = W + 20;
  };

  RainDrop.prototype.draw = function () {
    var c = this.cfg;
    var dx = Math.sin(c.angle) * this.length;
    var dy = Math.cos(c.angle) * this.length;

    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + dx, this.y + dy);
    ctx.strokeStyle = 'rgba(' + this.colorStr + ',' + this.opacity + ')';
    ctx.lineWidth = this.width;
    ctx.stroke();
  };

  // ── Rising ember (ballroom candles) ──

  function Ember(cfg) {
    this.cfg = cfg;
    this.reset(true);
  }

  Ember.prototype.reset = function (initial) {
    var c = this.cfg;
    this.x = Math.random() * W;
    this.y = initial ? Math.random() * H : H + 10;
    this.size = c.sizeMin + Math.random() * (c.sizeMax - c.sizeMin);
    this.speed = c.riseSpeed + (Math.random() - 0.5) * c.riseVariance;
    this.driftX = (Math.random() - 0.5) * c.drift;
    this.wobblePhase = Math.random() * Math.PI * 2;
    this.wobbleSpeed = 0.02 + Math.random() * 0.03;
    this.startY = this.y;

    var base = c.color;
    var v = c.colorVariance;
    var r = Math.round(base[0] + (Math.random() - 0.5) * v);
    var g = Math.round(base[1] + (Math.random() - 0.5) * v);
    var b = Math.round(base[2] + (Math.random() - 0.5) * v);
    this.colorStr = r + ',' + g + ',' + b;
    this.opacityMul = 0.4 + Math.random() * 0.6;
  };

  Ember.prototype.update = function () {
    this.y -= this.speed;
    this.x += this.driftX + Math.sin(this.wobblePhase) * 0.3;
    this.wobblePhase += this.wobbleSpeed;

    if (this.y < -20) this.reset(false);
    if (this.x < -20) this.x = W + 20;
    if (this.x > W + 20) this.x = -20;
  };

  Ember.prototype.draw = function () {
    var c = this.cfg;
    // Fade out as ember rises — gone by fadeHeight fraction of screen
    var traveled = (this.startY - this.y) / H;
    var fade = 1 - Math.min(traveled / c.fadeHeight, 1);
    var alpha = c.opacity * this.opacityMul * fade * fade;
    if (alpha < 0.005) return;

    ctx.fillStyle = 'rgba(' + this.colorStr + ',' + alpha + ')';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  };

  // ── Particle lifecycle ──

  function loadParticles(pcfg) {
    threads = [];
    grains = [];
    raindrops = [];
    embers = [];

    if (!pcfg) return;

    if (pcfg.threads) {
      for (var i = 0; i < pcfg.threads.count; i++) {
        threads.push(new Thread(pcfg.threads));
      }
    }
    if (pcfg.grain) {
      for (var j = 0; j < pcfg.grain.count; j++) {
        grains.push(new GrainDot(pcfg.grain));
      }
    }

    if (pcfg.rain) {
      for (var k = 0; k < pcfg.rain.count; k++) {
        raindrops.push(new RainDrop(pcfg.rain));
      }
    }

    if (pcfg.embers) {
      for (var m = 0; m < pcfg.embers.count; m++) {
        embers.push(new Ember(pcfg.embers));
      }
    }

    if (!animRunning) {
      animRunning = true;
      requestAnimationFrame(animLoop);
    }
  }

  function animLoop() {
    if (!animRunning) return;
    ctx.clearRect(0, 0, W, H);

    for (var i = 0; i < threads.length; i++) { threads[i].update(); threads[i].draw(); }
    for (var j = 0; j < grains.length; j++) { grains[j].update(); grains[j].draw(); }
    for (var k = 0; k < raindrops.length; k++) { raindrops[k].update(); raindrops[k].draw(); }
    for (var m = 0; m < embers.length; m++) { embers[m].update(); embers[m].draw(); }

    requestAnimationFrame(animLoop);
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      animRunning = false;
    } else {
      animRunning = true;
      requestAnimationFrame(animLoop);
    }
  });


  // ════════════════════════════════════════════
  //  SCENE SELECTORS + BOOT
  // ════════════════════════════════════════════

  function initSceneSelectors() {
    document.querySelectorAll('.scene-icon').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.scene;
        if (key && SCENES[key]) loadScene(key);
      });
    });
  }

  function init() {
    resizeCanvas();
    createFrameElements();
    initSceneSelectors();

    var activeIcon = document.querySelector('.scene-icon.active');
    loadScene(activeIcon ? activeIcon.dataset.scene : 'dollhouse');
  }

  window.Scenes = { loadScene: loadScene, stopCycle: stopCycle };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
