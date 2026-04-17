
The user wants their app installable on phones (Add to Home Screen) without the App Store hassle. Per PWA guidelines, since they don't need offline support, the simplest approach is a web app manifest only — no service workers, no `vite-plugin-pwa`. This avoids breaking the Lovable preview iframe.

## Make the app installable (PWA-lite)

### What this gets you
- Users can "Add to Home Screen" on iOS and Android
- App opens fullscreen (no browser chrome) like a native app
- Custom icon on the home screen
- No App Store, no $99/yr fee, no review process
- Works immediately on the published URL: elliotscalendar.lovable.app

### What this does NOT include
- Offline support (requires service workers — causes preview issues)
- Push notifications (separate setup)
- App Store distribution (that's Capacitor)

### Changes

**1. `public/manifest.json`** (new)
- App name: "Elliot's Calendar"
- Short name: "Elliot's"
- `display: "standalone"` (fullscreen, no browser bar)
- `theme_color` and `background_color` matching the app's design
- Icon references (192x192 and 512x512)
- `start_url: "/"`

**2. `public/icon-192.png` and `public/icon-512.png`** (new)
- Generate simple branded icons for home screen display

**3. `index.html`**
- Add `<link rel="manifest" href="/manifest.json">`
- Add `<meta name="theme-color" content="...">`
- Add Apple-specific tags: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `apple-touch-icon`

### How users install
- **iOS Safari**: Share button → "Add to Home Screen"
- **Android Chrome**: Menu → "Install app" (or auto-prompt)

### Note
Install behavior only works on the **published URL** (elliotscalendar.lovable.app), not in the Lovable editor preview.
