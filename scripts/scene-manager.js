/* =============================================================
   scripts/scene-manager.js
   Manages active scene, shows/hides A-Frame groups, handles
   scene switching with a wipe transition.
   ============================================================= */

const SceneManager = (function () {

  // ── State ───────────────────────────────────────────────
  let _activeScene   = null;   // current scene id string
  let _transitioning = false;  // block rapid switching

  // ── Private helpers ─────────────────────────────────────

  /**
   * Returns the config object for a scene id.
   * @param {string} sceneId
   * @returns {object|undefined}
   */
  function _getSceneConfig(sceneId) {
    return APP_CONFIG.scenes.find(s => s.id === sceneId);
  }

  /**
   * Show one A-Frame scene group; hide all others.
   * @param {string} sceneId
   */
  function _toggleGroups(sceneId) {
    APP_CONFIG.scenes.forEach(scene => {
      const group = document.getElementById(scene.groupId);
      if (!group) return;

      if (scene.id === sceneId) {
        group.setAttribute('visible', 'true');
        if (APP_CONFIG.debug) console.log(`[SceneManager] Show group: #${scene.groupId}`);
      } else {
        group.setAttribute('visible', 'false');
        // Also hide all AR objects in the hidden group to avoid ghost renders
        _hideAllObjectsInGroup(group);
      }
    });
  }

  /**
   * Force-hide every tracked AR object inside a scene group.
   * Called when switching scenes so objects don't linger.
   * @param {Element} groupEl A-Frame entity element
   */
  function _hideAllObjectsInGroup(groupEl) {
    const targets = groupEl.querySelectorAll('.image-target');
    targets.forEach(targetEl => {
      const cfg = APP_CONFIG.targets.find(
        t => t.entityId === targetEl.id
      );
      if (!cfg) return;
      cfg.showOnFound.forEach(childId => {
        const child = document.getElementById(childId);
        if (child) child.setAttribute('visible', 'false');
      });
    });
  }

  /**
   * Update scene-tab button styles.
   * @param {string} sceneId
   */
  function _updateTabs(sceneId) {
    APP_CONFIG.scenes.forEach(scene => {
      const tab = document.getElementById(scene.tabId);
      if (!tab) return;
      tab.classList.toggle('active', scene.id === sceneId);
    });
  }

  /**
   * Brief black-screen wipe transition.
   * @param {Function} callback  run at the midpoint of the wipe
   * @returns {Promise}
   */
  function _wipeTransition(callback) {
    return new Promise(resolve => {
      // Create (or reuse) the wipe element
      let wipe = document.querySelector('.scene-transition');
      if (!wipe) {
        wipe = document.createElement('div');
        wipe.className = 'scene-transition';
        document.body.appendChild(wipe);
      }

      const half = APP_CONFIG.sceneTransitionDur / 2;

      // Fade to black
      wipe.classList.add('in');

      setTimeout(() => {
        if (callback) callback();

        // Fade back
        setTimeout(() => {
          wipe.classList.remove('in');
          wipe.classList.add('out');

          setTimeout(() => {
            wipe.classList.remove('out');
            resolve();
          }, half);
        }, 50);

      }, half);
    });
  }

  // ── Public API ──────────────────────────────────────────

  /**
   * Switch to a named scene.
   * @param {string} sceneId
   */
  async function switchTo(sceneId) {
    if (_transitioning)   return;
    if (sceneId === _activeScene) return;

    const cfg = _getSceneConfig(sceneId);
    if (!cfg) {
      console.warn('[SceneManager] Unknown scene:', sceneId);
      return;
    }

    if (APP_CONFIG.debug) console.log('[SceneManager] Switching to:', sceneId);

    _transitioning = true;

    await _wipeTransition(() => {
      _activeScene = sceneId;
      _toggleGroups(sceneId);
      _updateTabs(sceneId);

      // Update scan-hint reticle colour to match scene accent
      const reticleCorners = document.querySelectorAll('.reticle-corner');
      reticleCorners.forEach(el => {
        el.style.borderColor = cfg.accent;
      });

      // Emit custom event so other modules can react
      document.dispatchEvent(new CustomEvent('sceneChanged', {
        detail: { sceneId, config: cfg }
      }));
    });

    _transitioning = false;
  }

  /**
   * Return the currently active scene id.
   * @returns {string|null}
   */
  function getActive() {
    return _activeScene;
  }

  /**
   * Initialise — activates the first scene by default.
   */
  function init() {
    const firstScene = APP_CONFIG.scenes[0];
    if (!firstScene) {
      console.error('[SceneManager] No scenes defined in APP_CONFIG.scenes');
      return;
    }

    // Set up tab click handlers
    APP_CONFIG.scenes.forEach(scene => {
      const tab = document.getElementById(scene.tabId);
      if (!tab) return;
      tab.addEventListener('click', () => {
        switchTo(scene.id);
      });
    });

    // Activate first scene (no transition on load)
    _activeScene = firstScene.id;
    _toggleGroups(firstScene.id);
    _updateTabs(firstScene.id);

    if (APP_CONFIG.debug) console.log('[SceneManager] Init complete. Active:', _activeScene);
  }

  return { init, switchTo, getActive };

})();

window.SceneManager = SceneManager;
