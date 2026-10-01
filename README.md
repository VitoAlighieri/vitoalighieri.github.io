# Biel Martínez Janer — portfolio

A single-page site for a cybersecurity specialist who also communicates and leads projects. The page is built as a
**handheld receiver**: a live amber oscilloscope (WebGL) fills the hero, then docks into a signal strip that retunes its
waveform for every section. On phones the controls move to the thumb zone: a tuner dock and a full-screen channel index.

- **Bilingual (EN · ES):** English is the canonical copy in the HTML; Spanish is adapted, not translated.
- **Accessible:** keyboard-first, a still trace under `prefers-reduced-motion`, a HOLD switch on the hero's live dot
  that stops every ambient motion, forced-colours support, and controls that hold their geometry at any zoom.
- **No build step:** plain HTML, CSS and JS. The libraries are self-hosted.

Design and product records for the [Impeccable](https://impeccable.style) design skill (installed in `.claude/`):
`PRODUCT.md` (who the site is for, owner rules), `DESIGN.md` + `.impeccable/design.json` (the visual system), and
`.impeccable/` (critique and audit snapshots, briefs). `_config.yml` keeps them off the published site.

---

## Run it

Serve the folder with any static server; opening `index.html` over `file://` can block the fonts:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy it

GitHub Pages serves the repository root (`main`) at **vitoalighieri.github.io**. Any static host works the same way.
After changing CSS or JS, bump the `?v=N` query on every asset reference in `index.html` (cache-busting).

---

## Structure

```
index.html                 # markup + the canonical English copy (data-i18n keys)
assets/
├─ css/
│  ├─ styles.css           # tokens (:root), base layout, desktop design, the instrument system, forced colours
│  ├─ i18n.css             # the EN/ES switch (pure CSS geometry) + the language-retune transition
│  ├─ cursor.css           # the oscilloscope reticle cursor (fine pointers only)
│  ├─ mobile.css           # the phone layer (≤720px): dock, channel index, swipe deck, poster hero
│  └─ fonts.css            # @font-face for the three variable families
├─ js/
│  ├─ i18n.js              # runs first: Spanish dictionary, META, language switch, the strip's docked state
│  ├─ app.js               # the scope (Three.js), HOLD, band resolver, section choreography, mini traces, the dial
│  ├─ mobile.js            # phone layer: dock, channel index, deck, accordions, copy key, touch on the scope
│  └─ cursor.js            # the reticle cursor
├─ fonts/                  # Anybody, Archivo, JetBrains Mono (variable woff2, Latin subset)
└─ vendor/                 # three.min.js (r160), gsap.min.js + ScrollTrigger.min.js (3.12.5)
```

## Editing

- **Copy:** English in `index.html`, Spanish under the same `data-i18n` key in the `ES` dictionary of
  `assets/js/i18n.js` (titles and meta tags in `META`; generated instrument words such as band names in `CHROME_ES`).
  Keys must stay one-to-one; a missing Spanish key falls back to English.
- **Sections and the scope:** every `<section>` carries `data-band` (`CH·04 — TUNING`), `data-shape` (0 sine, 1 square,
  2 triangle, 3 pulse, 4 step), `data-freq`, `data-amp` and `data-noise`; the scope, the strip, the dock and the
  channel index all read them. Codes run CH·00 (hero + thesis), CH·01–03 (BREAK / BUILD / LEAD), CH·04 TUNING,
  CH·05 SYSTEMS, CH·06 STACK, CH·07 SIGNALS, then TX (contact).
- **Design system:** read `DESIGN.md` first. One accent (`--amber`), its transparencies via `--amber-rgb`, three type
  voices, whole-pixel geometry for small phone controls.

## Credits

Fonts: Anybody, Archivo and JetBrains Mono (SIL Open Font License). Three.js (MIT). GSAP 3.12.5 and ScrollTrigger
(GSAP standard no-charge licence). Impeccable design skill (Apache-2.0).
