# 🌐 WebAR Experience — Complete Project

A beginner-friendly, production-structured WebAR project built with
**8th Wall + A-Frame + Vanilla JavaScript**.

Works directly in mobile browsers — no app install required.

---

## 📁 Folder Structure

```
webar-project/
│
├── index.html              ← Main AR scene + all HTML
│
├── styles/
│   ├── main.css            ← Base variables, reset, loading screen, overlays
│   └── ui.css              ← HUD, scene switcher, banners, reticle, info panel
│
├── scripts/
│   ├── config.js           ← All settings in one place (edit this first!)
│   ├── scene-manager.js    ← Scene switching logic
│   ├── ar-components.js    ← Custom A-Frame components
│   ├── ui.js               ← Loading, banners, buttons, ripples
│   └── main.js             ← Bootstrap / entry point
│
├── assets/
│   ├── models/             ← Place your .glb files here
│   ├── images/             ← Place your image target reference images here
│   └── audio/              ← Place your .mp3 / .ogg files here
│
├── netlify.toml            ← Netlify deployment config
├── vercel.json             ← Vercel deployment config
└── README.md               ← This file
```

---

## ⚡ Quick Start

### Step 1 — Get an 8th Wall account
1. Go to https://www.8thwall.com and create a free account.
2. Create a new **Web (A-Frame)** project.
3. Copy your **App Key** (shown in project settings).

### Step 2 — Add your App Key
Open `index.html` and replace the placeholder:
```html
<!-- BEFORE -->
<script async src="//apps.8thwall.com/xrweb?appKey=REPLACE_WITH_YOUR_8TH_WALL_APP_KEY"></script>

<!-- AFTER (example) -->
<script async src="//apps.8thwall.com/xrweb?appKey=AbC123xYz456_your_key_here"></script>
```

### Step 3 — Upload Image Targets
1. In the 8th Wall console, open your project → **Image Targets** tab.
2. Upload 3 images and name them **exactly**:
   - `target-a`
   - `target-b`
   - `target-c`
3. (Names are case-sensitive and must match `config.js` → `targets[].id`)

### Step 4 — Test locally
Because 8th Wall requires HTTPS, use one of:
- **8th Wall's built-in editor** (upload files directly in the console)
- **ngrok** to tunnel your localhost over HTTPS:
  ```bash
  npx serve .          # or python -m http.server 8080
  ngrok http 8080
  ```
- Deploy to Netlify/Vercel (see Deployment section)

### Step 5 — Open on phone
Scan the HTTPS URL with your phone's camera or paste it in Chrome/Safari.
Allow camera access → scan an image target → see AR content!

---

## 🎯 Image Target Guide

### What makes a good image target?
| ✅ Good                                  | ❌ Bad                             |
|------------------------------------------|------------------------------------|
| High contrast, sharp edges               | Plain colours / gradients          |
| Lots of unique detail (logos, photos)    | Symmetric / repetitive patterns    |
| Flat matte surface                       | Shiny/reflective surfaces          |
| Minimum 300×300 px, ideally 1000×1000 px | Very low resolution                |
| Printed on regular paper                 | Screen-displayed images            |
| Non-square aspect ratio is fine          | Minimal texture / blank areas      |

### Recommended workflow
1. Choose a high-detail photo or graphic (e.g., a magazine cover, artwork, event poster).
2. Export as **JPEG or PNG**, at least **800×800 px**.
3. Upload to 8th Wall console → Image Targets.
4. The console will show a **star rating** (1–5). Aim for **4–5 stars**.
5. Low-rated targets track poorly — try a different image.

### Tips for better tracking
- More unique regions = better tracking (complex textures beat flat colours).
- Avoid images with large empty areas.
- Lighting matters: brightly, evenly lit targets track better.
- The physical print should be at least A5 (15×21 cm) for easy scanning.

---

## 🔄 Replacing Assets

### Replace a 3D model (GLB)
1. Copy your `.glb` file to `assets/models/my-model.glb`.
2. In `index.html`, find the `<a-assets>` block and update the `src`:
   ```html
   <!-- BEFORE -->
   <a-asset-item id="model-astronaut"
     src="https://modelviewer.dev/shared-assets/models/Astronaut.glb">
   </a-asset-item>

   <!-- AFTER -->
   <a-asset-item id="model-astronaut"
     src="assets/models/my-model.glb">
   </a-asset-item>
   ```
3. Adjust `scale`, `position`, `rotation` on the `<a-entity gltf-model>` as needed.

### Replace image targets
1. Upload new images in the 8th Wall console, keeping the same names
   (`target-a`, `target-b`, `target-c`).
2. No code changes needed — names already match `config.js`.

### Replace textures
Add textures in `<a-assets>`:
```html
<img id="my-texture" src="assets/images/my-texture.jpg" />
```
Then reference on a material:
```html
<a-entity material="src: #my-texture"></a-entity>
```

### Add animations (Mixamo)
1. Download an animated FBX from https://www.mixamo.com.
2. Convert to GLB using https://products.aspose.app/3d/conversion/fbx-to-glb
   or Blender.
3. Replace model src and set `animation-mixer="clip: *; loop: repeat"`.

### Add audio
```html
<!-- In <a-assets> -->
<audio id="sfx-found" src="assets/audio/found.mp3" preload="auto"></audio>
```
Then in `config.js`:
```js
audioEnabled: true,
sfxFound:     '#sfx-found',
```

---

## 🌍 Deployment

### Netlify (recommended — free tier)
1. Create account at https://www.netlify.com
2. Drag-and-drop the **entire `webar-project` folder** onto the Netlify dashboard.
   OR connect your GitHub repo and set:
   - **Build command**: *(leave blank — no build step)*
   - **Publish directory**: `.`
3. Netlify auto-provides HTTPS — required for camera access.
4. Your site is live at `https://your-site-name.netlify.app`.

> `netlify.toml` in the project root handles all headers automatically.

### Vercel (alternative)
1. Create account at https://vercel.com
2. Install Vercel CLI: `npm i -g vercel`
3. In project folder: `vercel --prod`
4. OR connect GitHub repo — Vercel auto-deploys on push.

> `vercel.json` handles CORS/security headers automatically.

### GitHub Pages
1. Push to a GitHub repo.
2. Go to Settings → Pages → Source: `main` branch, `/ (root)`.
3. ⚠️ GitHub Pages does NOT support custom headers.
   You may need a workaround or use Netlify instead.

### HTTPS is required
Camera access (`getUserMedia`) is blocked on plain HTTP.
All three platforms above provide free HTTPS.

---

## 🐛 Troubleshooting

| Problem | Fix |
|---------|-----|
| Black screen, no camera | Check App Key is correct in `index.html` |
| "Camera permission denied" | Reload; allow camera in browser prompt |
| Model doesn't appear | Check model URL is accessible (no CORS error) |
| Target not detected | Re-upload image; improve lighting; check name matches config |
| Works on desktop but not phone | Must be served over HTTPS; use Netlify or ngrok |
| A-Frame version mismatch | Pin aframe to `1.5.0` as in the HTML |
| 8th Wall key error | Key must match the domain you're serving from |
| Target B doesn't scale in | Check `animation__scalein` in ar-components.js console |
| Models too big / small | Adjust `scale` attribute on `<a-entity gltf-model>` |
| Text appears backwards | Add `rotation="0 180 0"` to the `<a-text>` entity |

---

## 📦 Free Asset Sources

| Source | URL | Type |
|--------|-----|------|
| Model Viewer Samples | https://modelviewer.dev | GLB (CC-BY) |
| Three.js Samples | https://threejs.org/examples | GLB (CC0) |
| KhronosGroup glTF Samples | https://github.com/KhronosGroup/glTF-Sample-Models | GLB |
| Kenney | https://www.kenney.nl/assets | All types (CC0) |
| Poly Pizza | https://poly.pizza | GLB (CC-BY) |
| Mixamo | https://mixamo.com | Animated FBX/GLB (free with Adobe account) |
| Sketchfab | https://sketchfab.com/features/free-3d-models | GLB (various) |

---

## 🔑 8th Wall Setup Checklist

- [ ] 8th Wall account created
- [ ] New project created (type: Web / A-Frame)
- [ ] App Key copied and pasted into `index.html`
- [ ] 3 image targets uploaded and named: `target-a`, `target-b`, `target-c`
- [ ] Image tracking **enabled** in project settings
- [ ] Project deployed to HTTPS URL
- [ ] Tested on real device with camera

---

## 💡 Architecture Notes

```
main.js
  ├── UIManager.init()          Wire buttons, loading bar
  ├── _wire8thWallEvents()      xrloaded, xrnopermissions, xrerror
  └── _wireAFrameEvents()
        ├── scene:loaded
        │     ├── attachTargetHandlers()   → image-target-handler component
        │     ├── attachTapInteractions()  → tap-interaction component
        │     └── SceneManager.init()      Show scene1, hide scene2
        └── asset load errors

SceneManager.switchTo(sceneId)
  ├── Wipe transition (CSS)
  ├── Toggle A-Frame group visibility
  └── Update tab UI

image-target-handler (A-Frame component)
  ├── xrimagefound → show child objects, trigger animations
  └── xrimagelost  → hide child objects, reset animations
```

---

MIT License — use freely, attribute if you share.
