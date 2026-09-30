# Wedding Invitation Website - Standalone & Server Ready

The wedding invitation website is 100% self-contained, offline-ready, and has zero external dependencies on `external CDN servers` or third-party CDNs. All assets (fonts, high-resolution images, scripts, audio) are hosted locally within the project.

- **Production Root Entrypoint**: [`index.html`](file://./index.html) (Standard default root file for web server deployment)
- **Preview / Secondary Template**: [`demo.html`](file://./demo.html)
- **Local Assets Folder**: [`assets/`](file://./assets/) (`images/`, `fonts/`, `js/`, `icons/`, `data/`)
- **Full Technical Specification & Cloning Guide**: [`SITE_ARCHITECTURE_AND_CHANGELOG.md`](file://./SITE_ARCHITECTURE_AND_CHANGELOG.md)

---

## Deploying to a Web Server

To host the invitation online, simply upload the following root files and folder to your web server (e.g. Apache `public_html/`, Nginx `/var/www/html/`, GitHub Pages, Firebase Hosting, Netlify, Vercel, S3, or VPS):

```text
Wedding/
├── index.html              <-- Main landing page (served automatically at yourdomain.com)
├── demo.html               <-- Preview page
├── wedding_config.json     <-- Wedding data config
├── wedding_config.js       <-- Compiled JS config
├── music/                  <-- Dedicated audio folder (playlists with crossfade)
│   ├── Insecurities.mp3
│   ├── song2.mp3
│   └── song3.mp3
├── murugan_image.png       <-- Deity portrait
└── assets/                 <-- ALL fonts, images, scripts, icons (upload this entire folder)
    ├── images/
    ├── fonts/
    ├── js/
    ├── icons/
    └── data/
```

All file paths are relative (`./assets/...`), so the site works at any domain root (`https://example.com/`) or in any sub-folder (`https://example.com/wedding/`).

---

## How to Customize Your Details

### Step 1: Open and Edit `wedding_config.json`
Open [wedding_config.json](file://./wedding_config.json) in any text editor and fill in your details:
- **Couple**: Groom name, bride name, title format, tagline, connector, mantra, hashtag, and Instagram handle.
- **Groom's Family**: Parents, grandparents, blessing lead, connector, and invite notes.
- **Bride's Family**: Parents, grandparents, and invite notes.
- **Events**: Titles, dates, times, venues, descriptions, and Google Maps links.
- **RSVP on WhatsApp**: Contact phone number and custom message.
- **Live Countdown Timer**: Wedding target date and time.
- **Music & Auto-Scroll**: Music title, auto-scroll speed, delay.

### Step 2: Apply the Changes & Preview Locally

Modern browsers block JavaScript ES modules when opened directly from the file system (`file:///`), causing CORS errors (`net::ERR_FAILED`). To view the site locally with full audio, animations, and countdown:

- **Windows (One-Click)**: Double-click **`run_preview.bat`**. It starts the local server and automatically launches `http://localhost:8000` in your default browser.
- **Mac (One-Click)**: Double-click **`update_wedding.command`** in Finder.
- **Terminal (Cross-Platform)**:
  ```bash
  # Synchronize configuration
  python update_wedding.py

  # Start local preview server
  python preview.py
  ```
- **Node.js / npm**:
  ```bash
  npm start
  ```


The invitation page uses one stable central content frame for phone, tablet, and desktop widths. The background keeps its portrait frame ratio, while the deity image, invitation text, couple names, and event heading stay inside the central frame during window resizing.

---

## Built-In Features
1. **100% Self-Contained**: Zero external CDN calls to `external CDN servers` or `external tracking`.
2. **Standard Web Server Structure**: `index.html` root entrypoint with organized `assets/` directory.
3. **Floating Music & Speed Capsule**: Minimizable audio controller with shuffled playlist support, smooth equal-power crossfade mixing between songs, track navigation, and 1x / 2x speed switching that does not interrupt auto-scroll.
4. **Cinematic Auto-Scroll**: Smooth slow auto-scroll that pauses on user touch/scroll and resumes automatically.
5. **Live Interactive Countdown & Dual Venues**: Ticking live countdown timer and venue location cards.
6. **Direct WhatsApp RSVP**: Pre-fills a personalized RSVP message directly to your phone number.
