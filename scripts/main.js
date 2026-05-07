/* =============================================================
   scripts/main.js
   Bootstrap / entry point.
   Wires MindAR + A-Frame lifecycle events to UIManager
   and SceneManager.

   FIXED: Removed all 8th Wall events (xrloaded, xrnopermissions,
   xrerror, xrnotfound). MindAR fires arReady / arError on the
   <a-scene> element — completely different from 8th Wall.
   ============================================================= */

(function () {
  "use strict";

  if (APP_CONFIG.debug)
    console.log("[Main] Bootstrapping WebAR app v" + APP_CONFIG.version);

  // ── Wait for DOM ready ───────────────────────────────────
  document.addEventListener("DOMContentLoaded", onDOMReady);

  function onDOMReady() {
    if (APP_CONFIG.debug) console.log("[Main] DOM ready");

    // Initialise UI event listeners (buttons, etc.)
    UIManager.init();

    // Wire MindAR + A-Frame scene events
    _wireSceneEvents();

    // Wire scene-changed event to update accent colours etc.
    document.addEventListener("sceneChanged", _onSceneChanged);

    // Debug event listeners
    if (APP_CONFIG.debug) {
      document.addEventListener("arObjectTapped", (e) => {
        console.log("[Main] arObjectTapped event:", e.detail);
      });
    }
  }

  /* -----------------------------------------------------------
     MindAR + A-Frame scene lifecycle
     ─────────────────────────────────────────────────────────
     Event order with MindAR:
       1. scene "loaded"  → A-Frame is ready, components exist
                            Safe to attach handlers + init SceneManager
       2. scene "arReady" → MindAR camera feed is live
                            Safe to hide loading screen + show HUD
       3. scene "arError" → Camera denied or tracking init failed
     ----------------------------------------------------------- */
  function _wireSceneEvents() {
    const scene = document.getElementById("ar-scene");
    if (!scene) {
      console.error("[Main] #ar-scene not found in DOM");
      return;
    }

    // ── Step 1: A-Frame ready ────────────────────────────────
    // Attach custom components and init scene manager.
    // Do NOT hide the loading screen here — MindAR camera isn't
    // up yet at this point.
    scene.addEventListener("loaded", () => {
      if (APP_CONFIG.debug) console.log("[Main] A-Frame scene loaded");

      // Attach custom A-Frame components to image-target entities
      attachTargetHandlers();
      attachTapInteractions();

      // Initialise SceneManager (shows Scene 1 by default)
      SceneManager.init();

      UIManager.setLoadingTip("Camera starting…");
      UIManager.setLoadingProgress(60);
    });

    // ── Step 2: MindAR ready ─────────────────────────────────
    // Camera feed is live and MindAR is tracking.
    // This is the MindAR equivalent of 8th Wall's xrloaded.
    scene.addEventListener("arReady", () => {
      if (APP_CONFIG.debug) console.log("[Main] MindAR arReady — camera live");

      UIManager.setLoadingProgress(100);
      UIManager.setLoadingTip("AR ready — point at a target!");
      UIManager.hideLoadingScreen();
      UIManager.showMainUI();
    });

    // ── Step 3: MindAR error ─────────────────────────────────
    // Replaces 8th Wall's xrnopermissions / xrerror / xrnotfound.
    // MindAR error types:
    //   USER_VIDEO_ACCESS_ERROR  → camera permission denied
    //   (others)                 → generic AR init failure
    scene.addEventListener("arError", (evt) => {
      const errCode = evt.detail?.error || "";
      console.error("[Main] MindAR arError:", errCode, evt.detail);

      UIManager.hideLoadingScreen();

      if (errCode === "USER_VIDEO_ACCESS_ERROR") {
        UIManager.showCameraPermissionOverlay();
      } else {
        UIManager.showError(
          "AR could not start (" +
            (errCode || "unknown error") +
            "). " +
            "Please use Chrome on Android or Safari 15+ on iOS, " +
            "served over HTTPS.",
        );
      }
    });

    // ── Asset load failures (non-fatal) ──────────────────────
    scene.addEventListener("assetloadfailed", (evt) => {
      console.warn("[Main] Asset failed to load:", evt.detail);
    });

    // ── Debug: renderer info ──────────────────────────────────
    if (APP_CONFIG.debug) {
      scene.addEventListener("renderstart", () => {
        const renderer = scene.renderer;
        if (renderer) {
          console.log("[Main] WebGL renderer info:", renderer.info);
        }
      });
    }
  }

  /* -----------------------------------------------------------
     Scene changed hook
     Updates accent colour on app name when user switches scenes.
     ----------------------------------------------------------- */
  function _onSceneChanged(evt) {
    const { sceneId, config } = evt.detail;
    if (APP_CONFIG.debug)
      console.log("[Main] Scene changed to:", sceneId, config);

    const appName = document.querySelector(".app-name");
    if (appName && config.accent) {
      appName.style.color = config.accent;
      appName.style.textShadow = `0 0 24px ${config.accent}55`;
    }
  }

  /* -----------------------------------------------------------
     Global error handler — catches uncaught JS exceptions.
     ----------------------------------------------------------- */
  window.addEventListener("error", (evt) => {
    console.error(
      "[Main] Uncaught error:",
      evt.message,
      evt.filename,
      evt.lineno,
    );
  });

  window.addEventListener("unhandledrejection", (evt) => {
    console.error("[Main] Unhandled promise rejection:", evt.reason);
  });
})();
