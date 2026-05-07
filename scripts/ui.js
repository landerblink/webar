/* =============================================================
   scripts/ui.js
   UIManager — controls all DOM-based UI:
   loading screen, overlays, banners, info panel, fullscreen,
   ripple effects, and the scan reticle.
   ============================================================= */

const UIManager = (function () {

  // ── Element cache ───────────────────────────────────────
  // Queried once to avoid repeated DOM lookups
  let els = {};

  // ── Banner auto-hide timer ──────────────────────────────
  let _bannerTimer = null;

  // ── Loading bar simulation ──────────────────────────────
  let _loadMilestoneIndex = 0;
  let _loadInterval       = null;

  // ── Private helpers ─────────────────────────────────────

  function _el(id) {
    if (!els[id]) els[id] = document.getElementById(id);
    return els[id];
  }

  function _show(id)   { _el(id)?.classList.remove('hidden'); }
  function _hide(id)   { _el(id)?.classList.add('hidden'); }
  function _toggle(id) { _el(id)?.classList.toggle('hidden'); }

  // ── Loading screen ──────────────────────────────────────

  /**
   * Advance the loading bar to simulate progress.
   * Will auto-complete when 8th Wall fires xrloaded.
   */
  function _startLoadingBar() {
    const milestones = APP_CONFIG.loadingMilestones;

    _loadInterval = setInterval(() => {
      if (_loadMilestoneIndex >= milestones.length - 1) {
        clearInterval(_loadInterval);
        return;
      }
      _loadMilestoneIndex++;
      setLoadingProgress(milestones[_loadMilestoneIndex]);
    }, APP_CONFIG.loadingInterval);
  }

  /**
   * Set the loading bar width percentage.
   * @param {number} pct 0–100
   */
  function setLoadingProgress(pct) {
    const bar = _el('loading-bar');
    if (bar) bar.style.width = `${Math.min(pct, 100)}%`;
  }

  /**
   * Update the loading tip text.
   * @param {string} msg
   */
  function setLoadingTip(msg) {
    const tip = _el('loading-tip');
    if (tip) tip.textContent = msg;
  }

  /**
   * Hide the loading screen with a fade animation.
   */
  function hideLoadingScreen() {
    clearInterval(_loadInterval);
    setLoadingProgress(100);

    const screen = _el('loading-screen');
    if (!screen) return;

    setTimeout(() => {
      screen.classList.add('fade-out');
      screen.addEventListener('animationend', () => {
        screen.classList.add('hidden');
      }, { once: true });
    }, 400);
  }

  // ── Main UI ─────────────────────────────────────────────

  /**
   * Reveal the main HUD after XR is ready.
   */
  function showMainUI() {
    _show('main-ui');
    if (APP_CONFIG.debug) console.log('[UIManager] Main UI visible');
  }

  // ── Camera permission ───────────────────────────────────

  function showCameraPermissionOverlay() {
    _show('camera-permission-overlay');
  }

  function hideCameraPermissionOverlay() {
    _hide('camera-permission-overlay');
  }

  // ── Error overlay ───────────────────────────────────────

  /**
   * Show the generic error overlay.
   * @param {string} [message]
   */
  function showError(message) {
    if (message) {
      const msgEl = _el('error-message');
      if (msgEl) msgEl.textContent = message;
    }
    _show('error-overlay');
  }

  // ── Target banners ──────────────────────────────────────

  /**
   * Flash the "target found" banner.
   * @param {string} label    Display label from config.
   * @param {string} sceneId  Used to colour the banner.
   */
  function showTargetFound(label, sceneId) {
    // Fade out reticle
    const hint = document.querySelector('.scan-hint');
    if (hint) hint.classList.add('fade');

    // Update banner text
    const bannerText = _el('target-banner-text');
    if (bannerText) bannerText.textContent = label + ' detected!';

    // Scene-2 purple style
    const banner = _el('target-banner');
    if (banner) {
      banner.classList.toggle('scene2-found', sceneId === 'scene2');
    }

    _hide('target-lost-banner');
    _show('target-banner');

    // Auto-hide after N ms
    clearTimeout(_bannerTimer);
    _bannerTimer = setTimeout(() => {
      _hide('target-banner');
    }, APP_CONFIG.bannerHideDuration);
  }

  /**
   * Show the "searching" banner.
   */
  function showTargetLost() {
    // Re-show reticle
    const hint = document.querySelector('.scan-hint');
    if (hint) hint.classList.remove('fade');

    clearTimeout(_bannerTimer);
    _hide('target-banner');
    _show('target-lost-banner');

    // Auto-hide lost banner after a few seconds
    _bannerTimer = setTimeout(() => {
      _hide('target-lost-banner');
    }, APP_CONFIG.bannerHideDuration);
  }

  // ── Info panel ──────────────────────────────────────────

  function toggleInfoPanel() {
    _toggle('info-panel');
  }

  function hideInfoPanel() {
    _hide('info-panel');
  }

  // ── Fullscreen ──────────────────────────────────────────

  function toggleFullscreen() {
    const docEl = document.documentElement;

    if (!document.fullscreenElement &&
        !document.webkitFullscreenElement) {
      // Enter fullscreen
      if (docEl.requestFullscreen)             docEl.requestFullscreen();
      else if (docEl.webkitRequestFullscreen)  docEl.webkitRequestFullscreen();
      _el('fullscreen-btn').textContent = '⛶';
    } else {
      // Exit fullscreen
      if (document.exitFullscreen)             document.exitFullscreen();
      else if (document.webkitExitFullscreen)  document.webkitExitFullscreen();
      _el('fullscreen-btn').textContent = '⛶';
    }
  }

  // ── Ripple effect ───────────────────────────────────────

  /**
   * Spawn a tap ripple at screen coordinates.
   * @param {number} x
   * @param {number} y
   */
  function spawnRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'tap-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top  = `${y}px`;
    document.body.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    }, { once: true });
  }

  // ── Touch ripple on A-Frame canvas ─────────────────────
  // Creates a visual ripple wherever the user touches the screen.

  function _attachCanvasTouchRipple() {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;

    canvas.addEventListener('touchstart', (evt) => {
      const touch = evt.touches[0];
      if (touch) spawnRipple(touch.clientX, touch.clientY);
    }, { passive: true });

    canvas.addEventListener('click', (evt) => {
      spawnRipple(evt.clientX, evt.clientY);
    });
  }

  // ── Init ────────────────────────────────────────────────

  /**
   * Wire up all UI event listeners.
   * Called once from main.js.
   */
  function init() {
    // Info button
    _el('info-btn')?.addEventListener('click', toggleInfoPanel);

    // Close info panel
    _el('close-info-btn')?.addEventListener('click', hideInfoPanel);

    // Click outside info panel to close
    document.addEventListener('click', (evt) => {
      const panel = _el('info-panel');
      const btn   = _el('info-btn');
      if (panel && !panel.classList.contains('hidden')) {
        if (!panel.contains(evt.target) && evt.target !== btn) {
          hideInfoPanel();
        }
      }
    });

    // Fullscreen button
    _el('fullscreen-btn')?.addEventListener('click', toggleFullscreen);

    // Camera retry button
    _el('retry-camera-btn')?.addEventListener('click', () => {
      hideCameraPermissionOverlay();
      location.reload();
    });

    // Start simulated loading bar
    _startLoadingBar();

    // Attach ripple to canvas (fires after A-Frame creates it)
    // We wait a tick so the canvas exists in DOM
    setTimeout(_attachCanvasTouchRipple, 500);

    if (APP_CONFIG.debug) console.log('[UIManager] Init complete');
  }

  // ── Public API ──────────────────────────────────────────
  return {
    init,
    setLoadingProgress,
    setLoadingTip,
    hideLoadingScreen,
    showMainUI,
    showCameraPermissionOverlay,
    hideCameraPermissionOverlay,
    showError,
    showTargetFound,
    showTargetLost,
    toggleInfoPanel,
    hideInfoPanel,
    toggleFullscreen,
    spawnRipple,
  };

})();

window.UIManager = UIManager;
