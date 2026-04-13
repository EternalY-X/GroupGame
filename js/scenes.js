// scenes.js — Scene switching + crossfade + canvas particle engine

(function () {
  'use strict';

  // ════════════════════════════════════════════
  //  SCENE DEFINITIONS
  // ════════════════════════════════════════════

  const SCENES = {
    dollhouse: {
      frames: [
        'assets/scenes/dolls-1.jpg',
        'assets/scenes/dolls-2.jpg',
        'assets/scenes/dolls-3.jpg',
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
        'assets/scenes/garden-1.png',
        'assets/scenes/garden-2.png',
        'assets/scenes/garden-3.png',
      ],
      timing: [
        { fade: 3200, hold: 5000 },
        { fade: 2200, hold: 4000 },
        { fade: 4200, hold: 7000 },
      ],
      // TODO: fireflies + fog
      particles: { threads: null, grain: null },
    },

    ballroom: {
      frames: [
        'assets/scenes/ballroom-1.png',
        'assets/scenes/ballroom-2.png',
        'assets/scenes/ballroom-3.png',
      ],
      timing: [
        { fade: 3500, hold: 5500 },
        { fade: 2000, hold: 3500 },
        { fade: 4500, hold: 6500 },
      ],
      // TODO: embers / candles
      particles: { threads: null, grain: null },
    },
  };


  // ════════════════════════════════════════════
  //  CROSSFADE SYSTEM
  // ════════════════════════════════════════════

  let currentSceneKey = null;
  let currentScene = null;
  let frameEls = [];
  let currentFrame = 0;
  let frameDirection = 1;
  let pingPongStep = 0;
  let cycleTimer = null;
  let isCycleRunning = false;

  const paintingsLayer = document.getElementById('layer-paintings');

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

  function loadScene(sceneKey) {
    const scene = SCENES[sceneKey];
    if (!scene) return;

    stopCycle();
    currentSceneKey = sceneKey;
    currentScene = scene;
    currentFrame = 0;
    frameDirection = 1;
    pingPongStep = 0;

    createFrameElements();
    scene.frames.forEach(function (src, i) { frameEls[i].src = src; });

    frameEls[0].onload = function () { startCycle(); };
    setTimeout(function () { if (!isCycleRunning) startCycle(); }, 300);

    loadParticles(scene.particles);
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

  // Ping-pong: 0→1→2→1→0→1→2...
  // Forward: fade next frame IN on top of current (current stays visible underneath)
  // Backward: next frame is BELOW current, so fade current OUT to reveal it
  function scheduleNext() {
    if (!isCycleRunning || !currentScene) return;
    var timings = currentScene.timing;
    var timing = timings[pingPongStep % timings.length];

    cycleTimer = setTimeout(function () {
      if (!isCycleRunning) return;

      if (currentFrame >= 2) frameDirection = -1;
      if (currentFrame <= 0) frameDirection = 1;
      var nextFrame = currentFrame + frameDirection;

      if (frameDirection === 1) {
        // Going forward: next frame is above current in DOM → fade it in
        frameEls[nextFrame].style.transitionDuration = timing.fade + 'ms';
        frameEls[nextFrame].style.opacity = '1';

        setTimeout(function () {
          frameEls[currentFrame].style.transitionDuration = '0ms';
          frameEls[currentFrame].style.opacity = '0';
          currentFrame = nextFrame;
          pingPongStep++;
          scheduleNext();
        }, timing.fade);

      } else {
        // Going backward: next frame is below current in DOM
        // First make sure the frame beneath is visible
        frameEls[nextFrame].style.transitionDuration = '0ms';
        frameEls[nextFrame].style.opacity = '1';

        // Then fade the current (top) frame out to reveal it
        // Small delay so the browser registers the 0ms change first
        requestAnimationFrame(function () {
          frameEls[currentFrame].style.transitionDuration = timing.fade + 'ms';
          frameEls[currentFrame].style.opacity = '0';

          setTimeout(function () {
            currentFrame = nextFrame;
            pingPongStep++;
            scheduleNext();
          }, timing.fade);
        });
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
    this.x = Math.random() * W;
    this.y = Math.random() * H;
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
    if (this.y < -pad) this.y = H + pad;
    if (this.y > H + pad) this.y = -pad;

    this.pulsePhase += this.pulseSpeed;
  };

  GrainDot.prototype.draw = function () {
    var pulse = 0.6 + 0.4 * Math.sin(this.pulsePhase);
    var alpha = this.cfg.opacity * this.opacityMul * pulse;
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