/* =============================================================
   scripts/ar-components.js
   Custom A-Frame components that power the per-target logic:
   — image-target-handler  : show/hide objects, animations, audio
   — tap-interaction       : tap-to-scale on AR objects
   — glow-pulse            : optional shader-free glow effect
   ============================================================= */

/* -------------------------------------------------------------
   Component: image-target-handler
   Attach to every <a-entity xrweb-image-target> element.
   Listens for 8th Wall's xrimagefound / xrimagelost events
   and drives all the per-target show/hide + animation logic.

   Usage (already in index.html via JS injection in main.js):
     entity.setAttribute('image-target-handler', '')
   ------------------------------------------------------------- */
AFRAME.registerComponent("image-target-handler", {
  init: function () {
    const el = this.el;

    const targetName = el.dataset.target;
    const sceneId = el.dataset.scene;

    const targetCfg = APP_CONFIG.targets.find((t) => t.id === targetName);

    if (!targetCfg) {
      console.warn("[ar-components] No config for target:", targetName);
      return;
    }

    console.log("[MindAR] Register target:", targetName);

    // TARGET FOUND
    el.addEventListener("targetFound", () => {
      console.log("[MindAR] FOUND:", targetName);

      // Always update scan status panel — even for wrong-scene targets
      // so the user can see which slot is being detected
      UIManager.updateScanStatus(targetName, 'found');

      if (SceneManager.getActive() !== sceneId) return;

      targetCfg.showOnFound.forEach((childId) => {
        const child = document.getElementById(childId);
        if (child) child.setAttribute("visible", true);
      });

      // Target B scale animation
      if (targetName === "target-b") {
        const modelB = document.getElementById("model-b");

        if (modelB) {
          modelB.setAttribute(
            "animation__scalein",
            `
            property: scale;
            from: 0 0 0;
            to: ${APP_CONFIG.scaleInTarget};
            dur: ${APP_CONFIG.scaleInDuration};
            easing: easeOutElastic
          `,
          );
        }
      }

      UIManager.showTargetFound(targetCfg.label, sceneId);
    });

    // TARGET LOST
    el.addEventListener("targetLost", () => {
      console.log("[MindAR] LOST:", targetName);

      // Revert scan status — show 'searching' if in active scene, else 'wrong-scene'
      const isActiveScene = SceneManager.getActive() === sceneId;
      UIManager.updateScanStatus(targetName, isActiveScene ? 'searching' : 'wrong-scene');

      targetCfg.showOnFound.forEach((childId) => {
        const child = document.getElementById(childId);

        if (child) {
          child.setAttribute("visible", false);
        }
      });

      if (targetName === "target-b") {
        const modelB = document.getElementById("model-b");

        if (modelB) {
          modelB.removeAttribute("animation__scalein");
          modelB.setAttribute("scale", "0 0 0");
        }
      }

      UIManager.showTargetLost();
    });
  },
});

/* -------------------------------------------------------------
   Component: tap-interaction
   Attach to any clickable AR object.
   Scales the object up on tap, plays a ripple, then restores.

   Usage in HTML:
     <a-entity tap-interaction></a-entity>
   ------------------------------------------------------------- */
AFRAME.registerComponent("tap-interaction", {
  schema: {
    scaleUp: { type: "vec3", default: { x: 1.15, y: 1.15, z: 1.15 } },
    duration: { type: "number", default: 200 },
  },

  init: function () {
    const el = this.el;
    const data = this.data;

    // Store the original scale so we can restore it
    this._originalScale = { ...el.object3D.scale };

    el.addEventListener("click", (evt) => {
      if (APP_CONFIG.debug) console.log("[tap-interaction] Tap on", el.id);

      // Scale up
      el.setAttribute("animation__tapup", {
        property: "scale",
        to: `${data.scaleUp.x} ${data.scaleUp.y} ${data.scaleUp.z}`,
        dur: data.duration,
        easing: "easeOutQuad",
      });

      // Then restore
      setTimeout(() => {
        el.setAttribute("animation__tapdown", {
          property: "scale",
          to: `${this._originalScale.x} ${this._originalScale.y} ${this._originalScale.z}`,
          dur: data.duration * 1.5,
          easing: "easeInOutQuad",
        });
      }, data.duration + 50);

      // Screen-space ripple effect
      UIManager.spawnRipple(
        evt.detail?.clientX ?? window.innerWidth / 2,
        evt.detail?.clientY ?? window.innerHeight / 2,
      );

      // Dispatch for external hooks
      document.dispatchEvent(
        new CustomEvent("arObjectTapped", {
          detail: { entityId: el.id },
        }),
      );
    });
  },
});

/* -------------------------------------------------------------
   Component: orbit-rotate
   Continuously rotates an entity around the Y axis.
   Useful as a fallback if A-Frame animation attribute is blocked
   by other animations.

   Usage:
     <a-entity orbit-rotate="speed: 60"></a-entity>
   ------------------------------------------------------------- */
AFRAME.registerComponent("orbit-rotate", {
  schema: {
    speed: { type: "number", default: 45 }, // degrees per second
    axis: { type: "string", default: "y" },
  },

  tick: function (time, deltaTime) {
    const delta = (deltaTime / 1000) * this.data.speed;
    const obj = this.el.object3D;

    if (this.data.axis === "y")
      obj.rotation.y += THREE.MathUtils.degToRad(delta);
    if (this.data.axis === "x")
      obj.rotation.x += THREE.MathUtils.degToRad(delta);
    if (this.data.axis === "z")
      obj.rotation.z += THREE.MathUtils.degToRad(delta);
  },
});

/* -------------------------------------------------------------
   Component: float-bob
   Makes an entity gently bob up and down using a sine wave.
   Runs entirely in JS — no A-Frame animation component needed.

   Usage:
     <a-entity float-bob="amplitude: 0.05; speed: 1.5"></a-entity>
   ------------------------------------------------------------- */
AFRAME.registerComponent("float-bob", {
  schema: {
    amplitude: { type: "number", default: 0.05 }, // metres
    speed: { type: "number", default: 1.2 }, // cycles per second
    baseY: { type: "number", default: 0.15 }, // resting Y position
  },

  tick: function (time) {
    const y =
      this.data.baseY +
      Math.sin((time / 1000) * this.data.speed * Math.PI * 2) *
        this.data.amplitude;
    this.el.object3D.position.y = y;
  },
});

/* =============================================================
   Global helper — attach image-target-handler to all targets
   Called from main.js after scene is loaded.
   ============================================================= */
function attachTargetHandlers() {
  const targets = document.querySelectorAll(".image-target");
  targets.forEach((el) => {
    el.setAttribute("image-target-handler", "");
    if (APP_CONFIG.debug)
      console.log("[ar-components] Handler attached to:", el.id);
  });
}

// Also attach tap-interaction to all AR objects
function attachTapInteractions() {
  const arObjects = document.querySelectorAll(".ar-object");
  arObjects.forEach((el) => {
    el.setAttribute("tap-interaction", "");
  });
}

window.attachTargetHandlers = attachTargetHandlers;
window.attachTapInteractions = attachTapInteractions;
