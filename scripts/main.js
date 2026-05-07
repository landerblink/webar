/* =============================================================
   scripts/main.js
   Bootstrap / entry point.
   Wires 8th Wall + A-Frame lifecycle events to UIManager
   and SceneManager.
   ============================================================= */

(function () {

  'use strict';

  if (APP_CONFIG.debug) console.log('[Main] Bootstrapping WebAR app v' + APP_CONFIG.version);

  // ── Wait for DOM ready ───────────────────────────────────
  // (scripts are deferred so DOM is already ready, but belt-and-suspenders)
  document.addEventListener('DOMContentLoaded', onDOMReady);

  function onDOMReady() {
    if (APP_CONFIG.debug) console.log('[Main] DOM ready');

    // Initialise UI event listeners (buttons, etc.)
    UIManager.init();

    // Wire 8th Wall events
    _wire8thWallEvents();

    // Wire A-Frame scene events
    _wireAFrameEvents();

    // Wire scene-changed event to update accent colours etc.
    document.addEventListener('sceneChanged', _onSceneChanged);

    // Wire debug event listeners
    if (APP_CONFIG.debug) {
      document.addEventListener('targetFound', e => {
        console.log('[Main] targetFound event:', e.detail);
      });
      document.addEventListener('targetLost', e => {
        console.log('[Main] targetLost event:', e.detail);
      });
      document.addEventListener('arObjectTapped', e => {
        console.log('[Main] arObjectTapped event:', e.detail);
      });
    }
  }


  /* -----------------------------------------------------------
     8th Wall lifecycle events
     Documented at: https://www.8thwall.com/docs/web/#events
     ----------------------------------------------------------- */
  function _wire8thWallEvents() {

    // XR engine has started — camera is up, SLAM is ready
    window.addEventListener('xrloaded', () => {
      if (APP_CONFIG.debug) console.log('[Main] 8th Wall xrloaded');
      UIManager.setLoadingProgress(90);
      UIManager.setLoadingTip('AR engine ready — point at a target!');
    });

    // Camera permission denied
    window.addEventListener('xrnopermissions', () => {
      console.warn('[Main] Camera permissions denied');
      UIManager.setLoadingTip('Camera permission denied');
      UIManager.hideLoadingScreen();
      UIManager.showCameraPermissionOverlay();
    });

    // XR not supported on this device/browser
    window.addEventListener('xrnotfound', () => {
      console.warn('[Main] 8th Wall XR not found / not supported');
      UIManager.hideLoadingScreen();
      UIManager.showError(
        'WebAR is not supported on this browser. ' +
        'Please use Chrome on Android or Safari 15+ on iOS.'
      );
    });

    // Fatal XR error
    window.addEventListener('xrerror', (evt) => {
      console.error('[Main] 8th Wall error:', evt.detail);
      UIManager.hideLoadingScreen();
      UIManager.showError('AR engine error: ' + (evt.detail?.message || 'Unknown'));
    });
  }


  /* -----------------------------------------------------------
     A-Frame scene lifecycle events
     ----------------------------------------------------------- */
  function _wireAFrameEvents() {
    const scene = document.getElementById('ar-scene');
    if (!scene) {
      console.error('[Main] #ar-scene not found in DOM');
      return;
    }

    // A-Frame fully loaded (assets preloaded, scene rendered)
    scene.addEventListener('loaded', () => {
      if (APP_CONFIG.debug) console.log('[Main] A-Frame scene loaded');

      // Attach custom A-Frame components to image target entities
      attachTargetHandlers();
      attachTapInteractions();

      // Initialise SceneManager (shows Scene 1 by default)
      SceneManager.init();

      // Show main HUD
      UIManager.hideLoadingScreen();
      UIManager.showMainUI();
    });

    // Handle A-Frame asset timeout
    scene.addEventListener('assetloadfailed', (evt) => {
      console.warn('[Main] Asset failed to load:', evt.detail);
      // Non-fatal — continue but log it
    });

    // Log render info if debug
    if (APP_CONFIG.debug) {
      scene.addEventListener('renderstart', () => {
        const renderer = scene.renderer;
        if (renderer) {
          console.log('[Main] WebGL renderer info:', renderer.info);
        }
      });
    }
  }


  /* -----------------------------------------------------------
     Scene changed hook
     Update any scene-specific UI (accent colour, hint text, etc.)
     ----------------------------------------------------------- */
  function _onSceneChanged(evt) {
    const { sceneId, config } = evt.detail;
    if (APP_CONFIG.debug) console.log('[Main] Scene changed to:', sceneId, config);

    // Update app name colour to match scene accent
    const appName = document.querySelector('.app-name');
    if (appName && config.accent) {
      appName.style.color = config.accent;
      appName.style.textShadow = `0 0 24px ${config.accent}55`;
    }
  }


  /* -----------------------------------------------------------
     Device orientation permission (iOS 13+)
     Some experiences need gyro data — request it once on first tap.
     Optional: uncomment the block below if you use gyro.
     ----------------------------------------------------------- */
  /*
  function _requestOrientationPermission() {
    if (typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function') {
      DeviceOrientationEvent.requestPermission()
        .then(state => {
          if (state !== 'granted') {
            console.warn('[Main] Orientation permission denied');
          }
        })
        .catch(console.error);
    }
  }

  document.addEventListener('click', _requestOrientationPermission, { once: true });
  */


  /* -----------------------------------------------------------
     Service Worker registration (for PWA / offline use)
     Optional: creates sw.js at root to cache assets.
     ----------------------------------------------------------- */
  /*
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('[Main] SW registered:', reg.scope))
        .catch(err => console.warn('[Main] SW error:', err));
    });
  }
  */


  /* -----------------------------------------------------------
     Global error handler — catches uncaught exceptions
     and shows them in the error overlay (debug mode only)
     ----------------------------------------------------------- */
  window.addEventListener('error', (evt) => {
    console.error('[Main] Uncaught error:', evt.message, evt.filename, evt.lineno);
    if (APP_CONFIG.debug) {
      // Uncomment to surface runtime errors in the error overlay:
      // UIManager.showError(`JS Error: ${evt.message}`);
    }
  });

  window.addEventListener('unhandledrejection', (evt) => {
    console.error('[Main] Unhandled promise rejection:', evt.reason);
  });

})();
