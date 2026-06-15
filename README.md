# Biel Martínez Janer — portfolio landing page

An awards-style, single-page site built around one idea: **you work in frequencies** —
audio (cello), radio (RF / hardware), data (software), and the pulse of the night
(*We Love Night*). The signature is a **live oscilloscope** rendered in WebGL that docks
into a top "signal strip" on scroll and re-tunes its waveform per section.

Built with **Three.js** (the scope) and **GSAP + ScrollTrigger** (choreography).
Fully responsive, keyboard-focusable, and it honors `prefers-reduced-motion`
(static trace, no animation).

---

## Run it

Because the multi-file version loads fonts and scripts as separate files, open it through
a **local web server** (opening `index.html` directly via `file://` can block font loading
in some browsers):

```bash
cd biel-martinez-portfolio
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works (`npx serve`, VS Code "Live Server", etc.).

> Prefer a zero-setup file? A second build, **`index.html` in the parent folder**, is a single
> self-contained file (fonts + Three.js + GSAP all inlined). You can double-click that one and it
> just works offline — handy for quick previews, though it's less convenient to edit.

## Deploy it

It's a static site — drop the folder on any host:

- **GitHub Pages:** push the folder, enable Pages on the branch/root.
- **Netlify / Vercel / Cloudflare Pages:** drag-and-drop the folder, or point it at the repo. No build step.

---

## Structure

```
biel-martinez-portfolio/
├─ index.html              # markup + content (edit your copy here)
└─ assets/
   ├─ css/
   │  ├─ styles.css        # all styles + design tokens (:root variables)
   │  └─ fonts.css         # @font-face for the three families
   ├─ js/
   │  └─ app.js            # the oscilloscope + scroll choreography
   ├─ fonts/               # self-hosted variable fonts (woff2)
   └─ vendor/              # three.min.js, gsap.min.js, ScrollTrigger.min.js
```

## Customizing

- **Copy / sections:** edit `index.html`. Content is plain HTML, section by section.
- **Colors:** `assets/css/styles.css`, the `:root` block at the top. The whole palette is a
  handful of CSS variables; `--amber` is the single accent.
- **Type:** display = *Anybody* (variable, run wide+heavy), body = *Archivo*, data = *JetBrains Mono*.
  Swap in `fonts.css` + the `--d / --b / --m` variables.
- **The waveform per section:** each `<section>` carries `data-shape`, `data-freq`, `data-amp`,
  `data-noise`, and `data-band` attributes. Change those to re-tune the scope as the reader scrolls
  (`shape`: 0 = sine, 1 = square/digital, 2 = triangle, 3 = pulse). Logic lives in `app.js`.
- **Contact links:** already wired in the contact section of `index.html`
  (email, github.com/VitoAlighieri, LinkedIn).

## Notes & credits

- **Fonts** are subset to Latin. Anybody & Archivo (SIL Open Font License), JetBrains Mono (SIL OFL).
- **Three.js** r160 and **GSAP** 3.12.5 (standard "no-charge" GSAP license for the core + ScrollTrigger).
- Performance: device-pixel-ratio is capped, the 3D scene only renders while the hero is on screen,
  and rendering pauses when the tab is hidden.
