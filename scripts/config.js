/* =============================================================
   scripts/config.js
   Centralised settings — edit values here to customise the
   entire experience without touching the core logic files.
   ============================================================= */

const APP_CONFIG = {
  // ── App identity ──────────────────────────────────────────
  appName: "WebAR Experience",
  version: "1.0.0",

  // ── Debug mode ────────────────────────────────────────────
  // Set true during development; false before publishing.
  debug: true,

  // ── Scenes ────────────────────────────────────────────────
  // 'id' must match data-scene on image-target entities.
  // 'tabId' must match the id on the <button> in HTML.
  // 'accent' is used for UI colour theming.
  scenes: [
    {
      id: "scene1",
      label: "Scene 1",
      tabId: "tab-scene1",
      accent: "#00e5ff",
    },
    {
      id: "scene2",
      label: "Scene 2",
      tabId: "tab-scene2",
      accent: "#a855f7",
    },
  ],

  // ── Image Targets ─────────────────────────────────────────
  // 'id'       → must match data-target on the <a-entity>
  // 'scene'    → must match a scene id above
  // 'entityId' → must match the id of the <a-entity mindar-image-target>
  // 'showOnFound' → ids of child elements to toggle visible on found/lost
  targets: [
    {
      id: "target-a",
      scene: "scene1",
      label: "Target A — Astronaut",
      entityId: "target-a-entity",
      showOnFound: ["model-a", "text-a", "subtext-a", "glow-a"],
    },
    {
      id: "target-b",
      scene: "scene1",
      label: "Target B — Horse",
      entityId: "target-b-entity",
      showOnFound: ["model-b", "text-b", "desc-b", "ring-b"],
    },
    {
      id: "target-c",
      scene: "scene2",
      label: "Target C — Explorer",
      entityId: "target-c-entity",
      showOnFound: [
        "model-c",
        "glow-rings-c",
        "particles-c",
        "text-c",
        "subtext-c",
      ],
    },
  ],

  // ── Target B scale animation ──────────────────────────────
  scaleInDuration: 500, // ms
  scaleInTarget: "0.35 0.35 0.35",
  scaleOutTarget: "0 0 0",

  // ── Audio ─────────────────────────────────────────────────
  audioEnabled: false,
  sfxFound: null,
  sfxLost: null,

  // ── Loading bar ───────────────────────────────────────────
  loadingMilestones: [10, 30, 55, 80, 100],
  loadingInterval: 400, // ms between milestone steps

  // ── UI timings ────────────────────────────────────────────
  bannerHideDuration: 3000, // ms
  sceneTransitionDur: 400, // ms
};

window.APP_CONFIG = APP_CONFIG;

if (APP_CONFIG.debug) {
  console.log("[Config] Loaded:", APP_CONFIG);
}
