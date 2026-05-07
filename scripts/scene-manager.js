/* =============================================================
   scripts/scene-manager.js
   Manages the active scene and scene switching.

   FIX: The original version hid a parent <a-entity> group that
   wrapped mindar-image-target entities. MindAR requires image
   targets to be DIRECT children of <a-scene> — wrapping them
   breaks tracking entirely.

   This version instead hides/shows the AR content (children)
   inside each target entity based on the active scene.
   ============================================================= */

const SceneManager = (function () {
  // ── State ───────────────────────────────────────────────
  let _activeScene = null;
  let _transitioning = false;

  // ── Private helpers ─────────────────────────────────────

  function _getSceneConfig(sceneId) {
    return APP_CONFIG.scenes.find((s) => s.id === sceneId);
  }

  /**
   * Hide all AR content that belongs to a scene other than sceneId.
   * This prevents content from the wrong scene showing after a switch.
   * @param {string} sceneId  The newly active scene
   */
  function _hideOtherSceneContent(sceneId) {
    APP_CONFIG.targets.forEach((targetCfg) => {
      if (targetCfg.scene === sceneId) return; // skip active scene targets

      // Hide all children registered for this target
      targetCfg.showOnFound.forEach((childId) => {
        const child = document.getElementById(childId);
        if (child) child.setAttribute("visible", "false");
      });

      // Special case: reset Target B scale
      if (targetCfg.id === "target-b") {
        const modelB = document.getElementById("model-b");
        if (modelB) {
          modelB.removeAttribute("animation__scalein");
          modelB.setAttribute("scale", "0 0 0");
        }
      }
    });
  }

  /**
   * Update scene-tab button styles.
   */
  function _updateTabs(sceneId) {
    APP_CONFIG.scenes.forEach((scene) => {
      const tab = document.getElementById(scene.tabId);
      if (!tab) return;
      tab.classList.toggle("active", scene.id === sceneId);
    });
  }

  /**
   * Brief black-screen wipe transition.
   */
  function _wipeTransition(callback) {
    return new Promise((resolve) => {
      let wipe = document.querySelector(".scene-transition");
      if (!wipe) {
        wipe = document.createElement("div");
        wipe.className = "scene-transition";
        document.body.appendChild(wipe);
      }

      const half = APP_CONFIG.sceneTransitionDur / 2;

      wipe.classList.add("in");

      setTimeout(() => {
        if (callback) callback();

        setTimeout(() => {
          wipe.classList.remove("in");
          wipe.classList.add("out");

          setTimeout(() => {
            wipe.classList.remove("out");
            resolve();
          }, half);
        }, 50);
      }, half);
    });
  }

  // ── Public API ──────────────────────────────────────────

  async function switchTo(sceneId) {
    if (_transitioning) return;
    if (sceneId === _activeScene) return;

    const cfg = _getSceneConfig(sceneId);
    if (!cfg) {
      console.warn("[SceneManager] Unknown scene:", sceneId);
      return;
    }

    if (APP_CONFIG.debug) console.log("[SceneManager] Switching to:", sceneId);

    _transitioning = true;

    await _wipeTransition(() => {
      _activeScene = sceneId;

      // Hide content that belongs to other scenes
      _hideOtherSceneContent(sceneId);

      _updateTabs(sceneId);

      // Update reticle corner colour to match scene accent
      document.querySelectorAll(".reticle-corner").forEach((el) => {
        el.style.borderColor = cfg.accent;
      });

      // Notify other modules
      document.dispatchEvent(
        new CustomEvent("sceneChanged", {
          detail: { sceneId, config: cfg },
        }),
      );

      // Dismiss any visible banner
      document.getElementById("target-banner")?.classList.add("hidden");
      document.getElementById("target-lost-banner")?.classList.add("hidden");

      // Re-show the scan reticle
      document.querySelector(".scan-hint")?.classList.remove("fade");
    });

    _transitioning = false;
  }

  function getActive() {
    return _activeScene;
  }

  function init() {
    const firstScene = APP_CONFIG.scenes[0];
    if (!firstScene) {
      console.error("[SceneManager] No scenes defined in APP_CONFIG.scenes");
      return;
    }

    // Wire tab click handlers
    APP_CONFIG.scenes.forEach((scene) => {
      const tab = document.getElementById(scene.tabId);
      if (!tab) return;
      tab.addEventListener("click", () => switchTo(scene.id));
    });

    // Activate first scene immediately (no transition on load)
    _activeScene = firstScene.id;
    _hideOtherSceneContent(firstScene.id);
    _updateTabs(firstScene.id);

    if (APP_CONFIG.debug)
      console.log("[SceneManager] Init. Active:", _activeScene);
  }

  return { init, switchTo, getActive };
})();

window.SceneManager = SceneManager;
