/* =============================================================
   scripts/config.js
   Centralised settings — edit values here to customise the
   entire experience without touching the core logic files.
   ============================================================= */

const APP_CONFIG = {

  // ── App identity ──────────────────────────────────────────
  appName: 'WebAR Experience',
  version: '1.0.0',

  // ── Debug mode ────────────────────────────────────────────
  // Set true during development to see console.log output.
  // Set false before publishing.
  debug: true,

  // ── Scenes ────────────────────────────────────────────────
  // Each scene maps to a group of image targets.
  // 'id' must match the data-scene attribute on HTML entities.
  // 'groupId' must match the <a-entity> id in index.html.
  scenes: [
    {
      id:       'scene1',
      label:    'Scene 1',
      groupId:  'scene1-group',
      tabId:    'tab-scene1',
      accent:   '#00e5ff',
    },
    {
      id:       'scene2',
      label:    'Scene 2',
      groupId:  'scene2-group',
      tabId:    'tab-scene2',
      accent:   '#a855f7',
    },
  ],

  // ── Image Targets ─────────────────────────────────────────
  // 'id' must exactly match the `name` attribute in the
  // xrweb-image-target component AND the name in 8th Wall console.
  targets: [
    {
      id:          'target-a',
      scene:       'scene1',
      label:       'Target A — Astronaut',
      entityId:    'target-a-entity',
      // IDs of child elements to show/hide on found/lost
      showOnFound: ['model-a', 'text-a', 'subtext-a', 'glow-a'],
    },
    {
      id:          'target-b',
      scene:       'scene1',
      label:       'Target B — Horse',
      entityId:    'target-b-entity',
      showOnFound: ['model-b', 'text-b', 'desc-b', 'ring-b'],
    },
    {
      id:          'target-c',
      scene:       'scene2',
      label:       'Target C — Explorer',
      entityId:    'target-c-entity',
      showOnFound: ['model-c', 'glow-rings-c', 'particles-c', 'text-c', 'subtext-c'],
    },
  ],

  // ── Animations ────────────────────────────────────────────
  // Target B scale-in animation parameters
  scaleInDuration: 500,   // ms
  scaleInTarget:  '0.35 0.35 0.35',
  scaleOutTarget: '0 0 0',

  // ── Audio ─────────────────────────────────────────────────
  // ✏️  REPLACE with real audio IDs from <a-assets> to enable
  audioEnabled:  false,
  sfxFound:      null,   // e.g. '#sfx-found'
  sfxLost:       null,

  // ── Loading bar ───────────────────────────────────────────
  // Simulated progress milestones (0–100)
  loadingMilestones: [10, 30, 55, 80, 100],
  loadingInterval:   400,   // ms between milestone steps

  // ── UI timings ────────────────────────────────────────────
  bannerHideDuration:  3000,  // auto-hide target-found banner after N ms
  sceneTransitionDur:  400,   // ms for wipe transition between scenes
};

// Export for module-style access (no bundler needed — plain globals)
window.APP_CONFIG = APP_CONFIG;

if (APP_CONFIG.debug) {
  console.log('[Config] Loaded:', APP_CONFIG);
}
