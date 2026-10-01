---
name: "Biel Martínez Janer"
description: "A live amber trace on a dark instrument panel: the bilingual one-page portfolio of a software engineer, pentester and hardware hacker."
colors:
  phosphor-amber: "#FFAD3A"
  phosphor-hot: "#FFC677"
  phosphor-glow: "rgba(255,173,58,.16)"
  phosphor-tint: "rgba(255,173,58,.12)"
  phosphor-wash: "rgba(255,173,58,.06)"
  on-phosphor: "#0a0a0a"
  night-ink: "#06080E"
  night-ink-lifted: "#080B12"
  panel-steel: "#0D121C"
  panel-steel-raised: "#111A28"
  panel-glass: "rgba(13,18,28,.45)"   # hover:none devices use .78 with no blur
  graticule-line: "#1A2230"
  bezel-edge: "#27303F"
  bone: "#ECE7DB"
  bone-soft: "#C5C8D2"
  bone-ash: "#8E8B85"
  silkscreen-grey: "#737C8E"
  silkscreen-grey-lit: "#8B94A6"
  tick-slate: "#535B6B"
typography:
  display:   # >720px; phones size each name line to the measure by its ink (mobile.css --fit/--lsb)
    fontFamily: "'Anybody Variable', 'Archivo Variable', system-ui, sans-serif"
    fontSize: "clamp(2.6rem,min(13.5vw,17.5vh),10.6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-.02em"
    fontVariation: "'wght' 825,'wdth' 122"
  headline:   # size >720px; phones: min(calc(var(--mw)/8.2), calc(9*var(--vh))), -.015em
    fontFamily: "'Anybody Variable', 'Archivo Variable', system-ui, sans-serif"
    fontSize: "clamp(2rem,5.5vw,4.2rem)"
    fontWeight: 800
    lineHeight: 0.92
    letterSpacing: "-.01em"
    fontVariation: "'wght' 760,'wdth' 112"
  title:   # size >720px; phones 1.45rem; letterSpacing inherited from body
    fontFamily: "'Anybody Variable', 'Archivo Variable', system-ui, sans-serif"
    fontSize: "clamp(1.5rem,3.4vw,2.5rem)"
    fontWeight: 740
    lineHeight: 1
    letterSpacing: ".005em"
    fontVariation: "'wght' 740,'wdth' 104"
  title-wordmark:
    fontFamily: "'Anybody Variable', 'Archivo Variable', system-ui, sans-serif"
    fontSize: ".95rem"
    fontWeight: 800
    letterSpacing: ".02em"
    fontVariation: "'wght' 800,'wdth' 120"
  body:
    fontFamily: "'Archivo Variable', system-ui, -apple-system, sans-serif"
    fontSize: "clamp(15px,1.05vw,17px)"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: ".005em"
  body-large:   # phones: the hero lede drops to 15px / 1.5
    fontFamily: "'Archivo Variable', system-ui, -apple-system, sans-serif"
    fontSize: "clamp(1rem,1.4vw,1.12rem)"
    fontWeight: 400
  label:   # modal tracking; real uses range .1em-.28em
    fontFamily: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: ".72rem"
    fontWeight: 500
    letterSpacing: ".2em"
  label-telemetry:   # desktop #topbar .tele is .75rem / .14em
    fontFamily: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: ".66rem"
    fontWeight: 500
    lineHeight: 1
    letterSpacing: ".16em"
    fontFeature: "'tnum'"
  label-chip:   # >720px only; phones flatten tags to .75rem / .04em
    fontFamily: "'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace"
    fontSize: ".7rem"
    fontWeight: 500
    letterSpacing: ".06em"
    fontFeature: "'tnum'"
rounded:
  none: "0"
  key: "3px"
  plate: "4px"
  pill: "999px"
  round: "50%"
spacing:
  gutter: "clamp(1.25rem, 5vw, 6rem)"   # rounded to whole px on phones
  section: "clamp(3.75rem,9vh,8.5rem)"   # >720px; phones: clamp(3.75rem,9svh,5rem) clamp(3.25rem,7svh,4.25rem)
  container: "1320px"
  strip: "60px"
  touch: "44px"
  card-gap: "clamp(1rem,2vw,1.4rem)"   # phones: .systems gap 1.1rem
components:
  button-primary:   # >720px; phones: the full-width key below
    backgroundColor: "{colors.panel-glass}"
    textColor: "{colors.phosphor-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "0 1.3rem"
    height: "44px"
  button-primary-hover:
    backgroundColor: "{colors.phosphor-amber}"
    textColor: "{colors.on-phosphor}"
  button-link:   # >720px only (hidden on phones); tracking .18em
    textColor: "{colors.phosphor-amber}"
    typography: "{typography.label}"
    padding: "0 .35rem"
    height: "44px"
  button-close:   # phones only (channel index)
    backgroundColor: "{colors.phosphor-tint}"
    textColor: "{colors.phosphor-amber}"
    rounded: "{rounded.round}"
    size: "44px"
  chip:   # >720px only
    backgroundColor: "{colors.panel-steel}"
    textColor: "{colors.bone-soft}"
    typography: "{typography.label-chip}"
    rounded: "{rounded.pill}"
    padding: ".32rem .7rem"
  chip-flat:   # <=720px; mono .75rem / .04em
    textColor: "{colors.silkscreen-grey-lit}"
    rounded: "{rounded.none}"
    padding: "0"
  card-instrument:   # padding >640px; 1.2rem <=640, 1.15rem 1rem <=600
    backgroundColor: "{colors.panel-steel}"
    textColor: "{colors.bone}"
    rounded: "{rounded.plate}"
    padding: "clamp(1.4rem,3.2vw,2.4rem)"
  card-instrument-hover:
    backgroundColor: "{colors.panel-steel-raised}"
  card-deck:   # phones only
    backgroundColor: "{colors.panel-steel}"
    textColor: "{colors.bone}"
    rounded: "{rounded.plate}"
    padding: "1.25rem 1.1rem 1.1rem"
  badge-credential:   # mono .66rem / .1em, tabular-nums
    backgroundColor: "{colors.phosphor-wash}"
    textColor: "{colors.phosphor-amber}"
    rounded: "{rounded.plate}"
    padding: ".3rem 0"
    width: "3.4rem"
  list-row-link:
    textColor: "{colors.bone}"
    rounded: "{rounded.none}"
    padding: "1.15rem .2rem"
  list-row-link-hover:   # hover-capable pointers only; touch phones pin padding-left .2rem
    padding: "1.15rem .2rem 1.15rem .8rem"
  toggle-language-option:   # hero .74rem/.2em, strip .66rem/.14em; phones 10.96px (8px caps)
    textColor: "{colors.silkscreen-grey}"
    rounded: "{rounded.pill}"
  toggle-language-option-active:
    textColor: "{colors.phosphor-amber}"
  toggle-language-indicator:
    backgroundColor: "{colors.phosphor-tint}"
    rounded: "{rounded.pill}"
  nav-strip:   # desktop readout is mono .75rem / .14em
    backgroundColor: "{colors.night-ink}"
    textColor: "{colors.silkscreen-grey}"
    height: "60px"
    padding: "0 clamp(1.25rem, 5vw, 6rem)"
  dock-tuner:   # phones only; a vertical gradient from #0F1520 to this ink
    backgroundColor: "{colors.night-ink-lifted}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    height: "60px"
    padding: "0 7px 0 16px"
  disclosure-summary:   # <=600px only; tracking .18em
    textColor: "{colors.phosphor-amber}"
    typography: "{typography.label}"
    rounded: "{rounded.key}"
    padding: "0 12px 0 14px"
    height: "44px"
  key-copy:   # phones only
    backgroundColor: "{colors.phosphor-wash}"
    textColor: "{colors.phosphor-amber}"
    typography: "{typography.label-telemetry}"
    rounded: "{rounded.pill}"
    padding: "0 calc(.9rem - .16em) 0 .9rem"
    height: "36px"
  key-copy-done:
    backgroundColor: "{colors.phosphor-amber}"
    textColor: "{colors.on-phosphor}"
  key-subchannel:   # phones only; tracking .14em (.1em <=380px)
    textColor: "{colors.bone-soft}"
    typography: "{typography.label-telemetry}"
    rounded: "{rounded.key}"
    height: "44px"
---

# Design System: Biel Martínez Janer

## Overview

**Creative North Star: "The Handheld Receiver"**

The page is a receiver you tune. It powers on with a flat line that finds its carrier. A live amber trace runs across a night-dark screen, and every section is a channel the instrument locks onto. The scope retunes its waveform per section, and the docked strip and the phone's thumb dock read out the current code (CH·00 CARRIER, CH·01 BUILD, CH·04 SYSTEMS…). Reading the page is tuning the dial. The interface is chrome around a signal: graticule rules, tick scales, viewfinder corners, mono readouts. The signal itself carries the colour.

It is **precise** and **alive**:
- **Precise.** Every small control is whole-pixel geometry that holds still under any zoom. Display lines are justified by their ink, not their boxes, and labels sit dead-centre in their frames.
- **Alive.** The trace moves and answers touch and scroll. Cards lock on, the dock kicks like a VU meter on every retune, and switching language is itself a retune.

Density is calm. There is one accent, generous dark space and hairline structure. The voice is a well-made bench instrument, warm and exact, never a costume. Two worlds are confirmed rejections: **generic SaaS** (same-size rounded cards, purple gradients, startup templates) and **cold sci-fi** (cyan/blue HUD glows, glass panels, game interfaces).

**Key Characteristics:**
- One phosphor-amber signal on night ink; everything else is steel, hairline and bone.
- A live WebGL trace as the hero material that retunes per section.
- Three type voices: wide heavy display, quiet humanist body, mono readouts.
- Viewfinder corners and tick-scale rules as the framing vocabulary.
- Flat panels; glow only marks what is live.
- Phone-first controls in the thumb zone, built to the pixel.

## Colors

A night-dark, blue-shifted instrument palette with a single warm phosphor accent.

### Primary
- **Phosphor Amber** (#FFAD3A): the only hue on the page. It carries the live trace, the primary action ("Open a channel"), the current channel and active switch state, viewfinder corners, section codes, the security register and every focus ring. Text selection and scrollbars are themed with it too.
- **Hot Phosphor** (#FFC677): the white-hot core of the beam. It appears only in scan-line centres, the scrollbar thumb on hover and the picked row in the channel index, never as a fill.
- **Phosphor Glow / Tint / Wash** (16% / 12% / 6% amber): the beam's falloff. Glow is the halo on lit elements, tint fills an active chip or close key, and wash fills quiet amber keys such as credential badges and the COPY key.
- **Carbon** (#0a0a0a): text on a solid amber fill (selection, hovered primary action, confirmed COPY).

### Neutral
- **Night Ink** (#06080E): the page ground, the strip and the meta theme colour; blue-shifted so the dark reads as night, not void.
- **Lifted Night Ink** (#080B12): alternate section grounds and the dock's floor; the one-step tonal lift between sections.
- **Panel Steel** (#0D121C) and **Raised Panel Steel** (#111A28): card and panel surfaces at rest and under the thumb or pointer.
- **Panel Glass** (13% steel at 45%): the translucent fill of controls that sit over the live trace. Touch devices use 78% opacity and no blur.
- **Graticule** (#1A2230): hairline rules, section boundaries and the faint screen grid.
- **Bezel Edge** (#27303F): borders of cards, keys, pills and the strip floor.
- **Bone** (#ECE7DB): primary text and the display name; warm, never pure white.
- **Soft Bone** (#C5C8D2): secondary text, lede and readout values.
- **Ash Bone** (#8E8B85): warm dim running copy and notes.
- **Silkscreen Grey** (#737C8E) and **Lit Silkscreen Grey** (#8B94A6): mono chrome labels, like the legends printed on an instrument's front panel. The lit step marks keys beside bright values.
- **Tick Slate** (#535B6B): major ticks, separators and the `/` between languages.

### Named Rules
**The One Signal Rule.** Phosphor Amber is the only hue on the page. Everything else is ink, steel and bone. A second accent, a gradient between hues or a cool tint breaks the instrument.

**The Lit-Means-Live Rule.** Amber light (glow, tint, the hot core) marks what is live, current or being touched: the trace, the active channel, the chosen language, a pressed key. A resting surface never glows to look important.

## Typography

**Display Font:** Anybody Variable (with Archivo Variable, system-ui)
**Body Font:** Archivo Variable (with system-ui, -apple-system)
**Label/Mono Font:** JetBrains Mono Variable (with ui-monospace, SF Mono, Menlo)

**Character:** a wide, heavy variable display that stretches on its width axis like a signal decompressing, set against a calm humanist body and a mono that prints the instrument's readouts. All three are self-hosted variable fonts.

### Hierarchy
- **Display** (800, wght 825 / wdth 122, clamp(2.6rem, min(13.5vw, 17.5vh), 10.6rem), 0.9): the name only. On phones it becomes a poster. Each line (Biel at wdth 150, Martínez and Janer at 122) is sized to the measure by its measured ink, so its first and last strokes sit exactly on the content edges. The power-on decompresses each line from wdth 50.
- **Headline** (800, wght 760 / wdth 112, clamp(2rem, 5.5vw, 4.2rem), 0.92): section headings, balanced. Phones size them to the measure (about 43px at 390px) and cap them by height in landscape.
- **Title** (740, wght 740 / wdth 104, clamp(1.5rem, 3.4vw, 2.5rem), 1): card titles (systems, channels, signals); 1.45rem on phones.
- **Wordmark** (800, wght 800 / wdth 120, .95rem, .02em): "BMJ." in the docked strip.
- **Body** (400, clamp(15px, 1.05vw, 17px), 1.65): running copy, 56–66ch measures, `text-wrap: pretty` (auto on narrow bullets). The lede sits one step up (clamp(1rem, 1.4vw, 1.12rem)) and returns to 15px on phones.
- **Label** (500, .72rem, .2em, uppercase): mono legends, such as section codes, card roles, the role line and action labels.
- **Telemetry** (500, .66rem, .16em, tabular numerals): live readouts, such as band codes, f/A values, dates, plate codes and sub-channel keys.

### Named Rules
**The Readout Rule.** Mono is for what an instrument would print: codes, measurements, coordinates, dates, keys. It is always uppercase-tracked and always uses tabular numerals for figures. Paragraphs never set in mono.

**The Ink-Not-Box Rule.** Display type aligns by its ink. Side bearings are measured and compensated, trailing letter-spacing is taken back out of centred and right-aligned labels, and on phones capitals are trimmed to the cap height (`text-box`) so they centre exactly.

## Layout

A single scrolling column. A full-viewport hero is followed by sections inside a 1320px container with a fluid gutter (clamp(1.25rem, 5vw, 6rem), rounded to whole pixels on phones). Sections open with an instrument rule (label, tick scale, CH code readout) and a headline. Sections alternate between Night Ink and Lifted Night Ink and are separated by a single Graticule hairline.

Responsive behaviour is a deliberate second layout, not a squeeze. One gate at **720px**, shared by every stylesheet and script, switches to the phone layer. Desktop is untouched below it, and these changes apply only below it:
- **Strip.** The docked strip becomes a pure scope screen.
- **Dock.** The controls move to the thumb zone: a floating tuner dock at the bottom edge, held clear of the home indicator, and a full-screen channel index.
- **Channels.** The channels become a centre-snapped swipe deck: each card is centred with an 18px gap and a 10px sliver of each neighbour, and the pager matches the card width.
- **Bench.** The bench becomes a two-up spec grid.
- **Accordions.** Job details fold into 44px accordions.
- **Hero header.** At 600px the hero header becomes one 24px row: the live readout at left and the language pill at right.

### Named Rules
**The Whole-Pixel Rule.** On phones, every small control is built from integer CSS pixels so each edge lands on a device pixel at 2× and 3×, and nothing re-rounds when zoomed. This covers marks, pills, chips, the +/− box, the language chip and its 8px capitals. The gutter rounds to whole pixels too.

**The Thumb Zone Rule.** On phones, navigation lives at the bottom edge (the tuner dock, the channel index's footer bar). The top strip only shows the signal.

## Elevation & Depth

Flat by construction. Depth comes from tonal steps (Night Ink → Lifted Night Ink → Panel Steel → Raised Panel Steel) and 1px hairlines (Graticule, Bezel Edge), not from shadows. Light is reserved for signal: a soft zero-offset phosphor glow surrounds what is live (the trace, the active language chip, the current channel's numeral and corners, the dock's needle and dot). That glow is the oscilloscope's phosphor, a material of this world, not elevation. One real shadow exists: the phone dock, a physical control floating over the page, casts a deep offset shadow. Legibility halos (a dark text-shadow behind the role line where the trace crosses it) are utility, not depth.

### Shadow Vocabulary
- **Dock lift** (`box-shadow: 0 0 0 1px rgba(0,0,0,.55), 0 18px 38px -10px rgba(0,0,0,.92), inset 0 1px 0 rgba(236,231,219,.06)`): the floating tuner dock and the channel index bar only.
- **Phosphor glow** (`box-shadow: 0 0 12px 1px var(--glow)`): lit chips and keys; the needle and dot use `0 0 8px` to `0 0 10px` amber halos.
- **Panel sheen** (`box-shadow: inset 0 1px 0 rgba(236,231,219,.04)`): a 1px top highlight on resting panels.
- **Ambient falloff** (`box-shadow: 0 24px 60px -36px rgba(0,0,0,.9)`): a long, very soft darkening under work cards that seats them on the ground; it reads as shade, not lift.

### Named Rules
**The Flat Panel Rule.** Surfaces are flat at rest; a step in ink is the only lift. A lifting shadow belongs to a physical control that floats (the dock), never to a card that wants attention; cards keep only the ambient falloff.

## Shapes

The form language is a measuring instrument's:
- **Hairlines and corners.** Square-cut 4px plates (cards, deck cards, badges) and 3px keys (sub-channel keys, the disclosure bar). Viewfinder corners are drawn as L-shaped 2px marks in Phosphor Amber at half strength:
  - **Hero:** the four hero corners sit 8px outside the content box: 22px on desktop, 16px on phones, where the live dot sits dead-centre in the top-left corner, 10px from both arms.
  - **Cards:** work and deck cards carry two brackets riding their border, and these grow from 20–22px to 34–40px when the card locks on.
- **Pills.** Only things you physically press or slide: the language switch and its chip, the dock, the COPY key and the desktop action.
- **Full circles.** The close key and the dock knob.
- **Scales.** Tick scales (minor and major graticule teeth) run along section rules, the strip floor and the dock dial.

### Named Rules
**The Viewfinder Rule.** Frames are implied by corners, not drawn as boxes. A bracket marks the region of interest; a full border is for a panel or a key.

## Components

Every control should feel like an instrument control: precise, tactile, and always showing its state.

### Buttons
- **Shape:** pill on desktop (999px); a 6px-cornered full-width key on phones, 48px tall, framed by the hero's bottom viewfinder corners 8px out.
- **Primary ("Open a channel"):** Panel Glass fill, a half-strength Phosphor Amber 1px border, amber tracked mono label with a trailing arrow; 44px minimum, padding 0 1.3rem.
- **Hover / Focus:** desktop hover floods the key with Phosphor Amber and turns the label Carbon (.35s on the house curve); focus is a 2px amber ring with 3px offset; on phones a slow amber scan sweeps the key and a press tints it.
- **Close (phones):** a 44px circle with Phosphor Tint fill, a full amber border and two drawn 16×2 bars, scaling to .92 on press.

### Chips
- **Style:** on desktop, mono spec chips are Panel Steel pills with Soft Bone text. On phones they flatten into a plain mono spec string in Lit Silkscreen Grey, each item preceded by a 3px amber square tick placed in the gap. The tick that would start a line is clipped away, so no line starts with a separator.
- **State:** chips are facts, not controls: no hover or press affordance on phones.

### Cards / Containers
- **Corner Style:** square-cut plates (4px).
- **Background:** Panel Steel with a faint amber radial in the top corner; Raised Panel Steel under the pointer or thumb.
- **Shadow Strategy:** flat (see Elevation), with a 1px inset top sheen.
- **Border:** 1px Bezel Edge, plus the two amber viewfinder brackets that grow on hover/press (.45s).
- **Internal Padding:** clamp(1.4rem, 3.2vw, 2.4rem) on desktop, 1.15rem 1rem on phones.
- **Channel deck card (phones):** opens on its own scope screen (the channel's live trace, full bleed, with its f/A caption). The channel numeral fills with amber when the card locks on. The spec line sits on a footer hairline so every card ends alike.

### Navigation
- **Docked strip:** 60px, Night Ink with a hairline floor and tick scale. It shows the BMJ. wordmark, a bounded live trace and the language switch; on desktop it adds the CH·xx readout and a compact action. Its controls only accept input once the strip has docked.
- **Tuner dock (phones):** a floating 60px pill in the thumb zone. It shows a live dot, the CH code over the band name, a dial with one detent per section and a moving needle, and a 44px knob whose three bars kick like a VU meter on every retune. It ducks during fast flings and returns on pause.
- **Channel index (phones):** full screen, grown out of the dock with a clip-path morph. It lists rows of a mono code and a display name with a mini trace, marks the current row in amber, and carries sub-channel keys for the three channels. The footer bar sits exactly where the dock was, holding the language switch, COPY and close.

### Language Switch (signature)
A slide switch, "EN / ES", whose amber chip glides between two fixed-width options. It is built entirely in CSS: the chip uses the same lengths as the options and follows the page language, so it never drifts at any zoom. On phones it is a 24px pill (1px border, 2px inset, 18px chip) whose capitals are exactly 8px tall. Press feedback dims the label; it never moves it.

### Disclosure ("Show detail", phones)
A 44px bar with a 1px Bezel Edge, amber tracked label at left and an 18px amber-bordered box at right, sitting 12px from the bar's top, right and bottom. The +/− is drawn by that one box: two 10×2 bars in a 16px field, and the vertical bar folds away about the same centre to make the −. Opening unrolls the list with an amber scan line riding the moving edge.

### Named Rules
**The Still-Label Rule.** Pressing a control may change its colour, fill or brightness, never the position of its label inside its frame.

## Do's and Don'ts

### Do:
- **Do** keep Phosphor Amber (#FFAD3A) the only hue, and spend it on signal: the trace, the current state, the primary action, focus.
- **Do** build depth from the ink steps and 1px Graticule / Bezel Edge hairlines; let only live elements glow.
- **Do** set codes, measurements, dates and keys in JetBrains Mono, uppercase-tracked with tabular numerals; keep sentences in Archivo.
- **Do** frame regions with 2px amber viewfinder corners instead of full boxes.
- **Do** build phone controls in whole pixels and verify them zoomed in, so nothing drifts under pinch, browser or text zoom.
- **Do** give every control a 44px target, a visible 2px amber focus ring and a press state.
- **Do** move on the house curve (cubic-bezier(.22,.61,.36,1)) with exponential ease-out entrances. Under reduced motion every move becomes instant or a plain fade, while the trace stays alive but gentle.
- **Do** keep wrapped lists free of dangling separators: no line may start or end with a lone "/", "·" or "—".

### Don't:
- **Don't** add a second accent, hue gradients or purple: generic SaaS is a rejected world.
- **Don't** use cyan or blue HUD glows, glass panels or game-interface chrome: cold sci-fi is a rejected world.
- **Don't** lift cards or panels with crisp drop shadows; the only lifting shadow belongs to the floating dock (cards keep the long ambient falloff).
- **Don't** soften cards past 4px or build pages from same-size rounded icon cards.
- **Don't** move a label inside its frame on press or hover.
- **Don't** set the neutrals to pure white or pure black; text is warm Bone (#ECE7DB) and the ground is blue-shifted Night Ink (#06080E).
