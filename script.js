/**
 * ============================================================================
 * MIRELLE LUCIEN — SLIDER REVOLUTION CINEMATIC PRESENTATION ENGINE
 * High-performance, multi-layered slide transitions, synchronized duration HUD,
 * mouse parallax tracking, and accessible interactive controls.
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // CONFIGURATION & STATE
  // --------------------------------------------------------------------------
  const SLIDE_DURATION = 7000; // Duration per slide in milliseconds (7 seconds)
  const TOTAL_SLIDES = 4;

  const SLIDE_CONTEXTS = [
    'Full-Spectrum Grant Management',
    'Grant Research & Prospect Auditing',
    'Institutional Proposal Architecture',
    'Strategic Capital Allocation & Advisory'
  ];

  let currentSlide = 0;
  let isPaused = false;
  let isUserInteracting = false;
  let slideStartTime = 0;
  let accumulatedTime = 0;
  let animFrameId = null;

  // Parallax Coordinates (Spring Lerp)
  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  const LERP_FACTOR = 0.08;

  // --------------------------------------------------------------------------
  // DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const heroStage = document.getElementById('heroMaster');
  const slideArticles = document.querySelectorAll('.slide-article');
  const backplates = document.querySelectorAll('.slide-backplate');
  const floatingDataLayers = document.querySelectorAll('.floating-data-layer');
  const tabButtons = document.querySelectorAll('.hud-tab-item');
  const currentNumEl = document.getElementById('currentSlideNum');
  const progressFillEl = document.getElementById('hudProgressFill');
  const pauseToggleBtn = document.getElementById('pauseToggleBtn');
  const iconPause = pauseToggleBtn ? pauseToggleBtn.querySelector('.icon-pause') : null;
  const iconPlay = pauseToggleBtn ? pauseToggleBtn.querySelector('.icon-play') : null;
  const prevBtn = document.getElementById('prevSlideBtn');
  const nextBtn = document.getElementById('nextSlideBtn');
  const contextLabelText = document.getElementById('contextLabelText');
  const lightSweep = document.getElementById('lightSweep');
  const portraitDepthCarrier = document.getElementById('portraitCarrier');
  const cardTop = document.getElementById('cardTop');
  const cardBottom = document.getElementById('cardBottom');

  // --------------------------------------------------------------------------
  // SLIDE TRANSITION CONTROLLER
  // --------------------------------------------------------------------------
  function goToSlide(index, triggerAnimation = true) {
    if (index === currentSlide && !triggerAnimation) return;

    // Handle seamless circular wrap
    const previousIndex = currentSlide;
    currentSlide = (index + TOTAL_SLIDES) % TOTAL_SLIDES;

    // 1. Update Slide Articles (Left Content Column)
    slideArticles.forEach((article, idx) => {
      if (idx === currentSlide) {
        article.classList.add('is-active');
        article.setAttribute('aria-hidden', 'false');
      } else {
        article.classList.remove('is-active');
        article.setAttribute('aria-hidden', 'true');
      }
    });

    // 2. Update Atmospheric Slide Backplates
    backplates.forEach((bp, idx) => {
      if (idx === currentSlide) {
        bp.classList.add('is-active');
      } else {
        bp.classList.remove('is-active');
      }
    });

    // 3. Update Visual Stage Floating Data Layers
    floatingDataLayers.forEach((layer, idx) => {
      if (idx === currentSlide) {
        layer.classList.add('is-active');
      } else {
        layer.classList.remove('is-active');
      }
    });

    // 4. Update HUD Pagination Tabs
    tabButtons.forEach((tab, idx) => {
      const isActive = idx === currentSlide;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });

    // 5. Update Numeric HUD Counter (e.g., "01", "02")
    if (currentNumEl) {
      currentNumEl.textContent = `0${currentSlide + 1}`;
    }

    // 6. Update Dynamic Stage Context Label
    if (contextLabelText && SLIDE_CONTEXTS[currentSlide]) {
      contextLabelText.style.opacity = '0';
      setTimeout(() => {
        contextLabelText.textContent = SLIDE_CONTEXTS[currentSlide];
        contextLabelText.style.opacity = '1';
      }, 250);
    }

    // 7. Trigger Cinematic Light Sweep Effect
    if (lightSweep) {
      lightSweep.classList.remove('sweep-trigger');
      // Reflow to retrigger animation
      void lightSweep.offsetWidth;
      lightSweep.classList.add('sweep-trigger');
    }

    // 8. Reset Slide Progress Timing
    resetSlideTimer();
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  // --------------------------------------------------------------------------
  // TIMER & SYNCHRONIZED PROGRESS ENGINE
  // --------------------------------------------------------------------------
  function resetSlideTimer() {
    slideStartTime = performance.now();
    accumulatedTime = 0;
    if (progressFillEl) {
      progressFillEl.style.width = '0%';
    }
  }

  function ticker(now) {
    if (!isPaused && !isUserInteracting) {
      if (!slideStartTime) slideStartTime = now;
      const elapsed = (now - slideStartTime) + accumulatedTime;
      const progressPercent = Math.min((elapsed / SLIDE_DURATION) * 100, 100);

      if (progressFillEl) {
        progressFillEl.style.width = `${progressPercent.toFixed(2)}%`;
      }

      if (elapsed >= SLIDE_DURATION) {
        nextSlide();
      }
    }

    // Update Parallax Spring Lerp
    updateParallax();

    animFrameId = requestAnimationFrame(ticker);
  }

  function togglePlayPause() {
    isPaused = !isPaused;
    if (pauseToggleBtn) {
      pauseToggleBtn.setAttribute('aria-pressed', isPaused ? 'true' : 'false');
      pauseToggleBtn.setAttribute(
        'aria-label',
        isPaused ? 'Resume Auto-Play Animation' : 'Pause Auto-Play Animation'
      );
    }

    if (iconPause && iconPlay) {
      if (isPaused) {
        iconPause.style.display = 'none';
        iconPlay.style.display = 'block';
      } else {
        iconPause.style.display = 'block';
        iconPlay.style.display = 'none';
        slideStartTime = performance.now();
      }
    }
  }

  // --------------------------------------------------------------------------
  // CINEMATIC MOUSE PARALLAX (Subtle 3D Depth)
  // --------------------------------------------------------------------------
  function onMouseMove(e) {
    const { innerWidth, innerHeight } = window;
    // Normalized range from -1 to 1
    targetMouseX = ((e.clientX / innerWidth) * 2 - 1) * 16;
    targetMouseY = ((e.clientY / innerHeight) * 2 - 1) * 16;
  }

  function updateParallax() {
    // Smooth Linear Interpolation (Lerp)
    currentMouseX += (targetMouseX - currentMouseX) * LERP_FACTOR;
    currentMouseY += (targetMouseY - currentMouseY) * LERP_FACTOR;

    // Apply translation to the portrait depth carrier
    if (portraitDepthCarrier) {
      portraitDepthCarrier.style.setProperty('--parallax-x', `${currentMouseX.toFixed(2)}px`);
      portraitDepthCarrier.style.setProperty('--parallax-y', `${currentMouseY.toFixed(2)}px`);
    }

    // Floating cards receive contrasting depth
    if (cardTop) {
      cardTop.style.transform = `translate3d(${(-currentMouseX * 0.7).toFixed(2)}px, ${(-currentMouseY * 0.7).toFixed(2)}px, 0)`;
    }
    if (cardBottom) {
      cardBottom.style.transform = `translate3d(${(currentMouseX * 0.5).toFixed(2)}px, ${(currentMouseY * 0.5).toFixed(2)}px, 0)`;
    }
  }

  // --------------------------------------------------------------------------
  // TOUCH SWIPE FOR MOBILE & TABLET
  // --------------------------------------------------------------------------
  let touchStartX = 0;
  let touchStartY = 0;

  function onTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
  }

  function onTouchEnd(e) {
    const touchEndX = e.changedTouches[0].screenX;
    const touchEndY = e.changedTouches[0].screenY;
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;

    // Only handle horizontal swipes greater than 45px if not scrolling vertically
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 45) {
      if (diffX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }

  // --------------------------------------------------------------------------
  // KEYBOARD NAVIGATION ACCESSIBILITY
  // --------------------------------------------------------------------------
  function onKeyDown(e) {
    // Only capture if not inside an input/textarea
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) return;

    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === ' ' || e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    }
  }

  // --------------------------------------------------------------------------
  // TAB VISIBILITY (Pause When Tab Is In Background)
  // --------------------------------------------------------------------------
  function onVisibilityChange() {
    if (document.hidden) {
      accumulatedTime += (performance.now() - slideStartTime);
      isPaused = true;
    } else {
      if (pauseToggleBtn && pauseToggleBtn.getAttribute('aria-pressed') !== 'true') {
        isPaused = false;
        slideStartTime = performance.now();
      }
    }
  }

  // --------------------------------------------------------------------------
  // EVENT LISTENERS INITIALIZATION
  // --------------------------------------------------------------------------
  function initEvents() {
    // Prev / Next Buttons
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);

    // Pause / Play Button
    if (pauseToggleBtn) pauseToggleBtn.addEventListener('click', togglePlayPause);

    // Pagination Tabs Click
    tabButtons.forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const gotoIndex = parseInt(tab.getAttribute('data-goto'), 10);
        if (!isNaN(gotoIndex)) {
          goToSlide(gotoIndex);
        }
      });
    });

    // Mouse Movement Parallax
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // Touch Gestures
    if (heroStage) {
      heroStage.addEventListener('touchstart', onTouchStart, { passive: true });
      heroStage.addEventListener('touchend', onTouchEnd, { passive: true });
    }

    // Keyboard Shortcuts
    window.addEventListener('keydown', onKeyDown);

    // Visibility Change
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Hover Over Hero Interactive Elements Pauses Auto-Advance
    const pauseTriggers = document.querySelectorAll(
      '.btn-luxury-primary, .btn-luxury-secondary, .glass-intel-card, .hud-action-controls, .hud-tabs-nav'
    );
    pauseTriggers.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        isUserInteracting = true;
      });
      el.addEventListener('mouseleave', () => {
        isUserInteracting = false;
        slideStartTime = performance.now();
      });
    });
  }

  // --------------------------------------------------------------------------
  // INITIAL ENTRANCE ORCHESTRATION
  // --------------------------------------------------------------------------
  function initHero() {
    initEvents();

    // Check for ?slide=0..3 in URL for deep-linking and automated testing
    const urlParams = new URLSearchParams(window.location.search);
    const slideParam = parseInt(urlParams.get('slide'), 10);
    const initialSlide = (!isNaN(slideParam) && slideParam >= 0 && slideParam < TOTAL_SLIDES) ? slideParam : 0;

    if (urlParams.has('slide')) {
      isPaused = true;
    }

    // Set initial active state
    goToSlide(initialSlide, false);

    // Trigger ready state on hero stage for initial cascading reveals
    requestAnimationFrame(() => {
      if (heroStage) {
        heroStage.classList.add('ready');
      }
      slideStartTime = performance.now();
      animFrameId = requestAnimationFrame(ticker);
    });
  }

  // DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHero);
  } else {
    initHero();
  }
})();
