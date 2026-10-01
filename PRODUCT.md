# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: companies that commission security work.** These are teams that need offensive testing or help mapping technical findings to their obligations. Testing covers web and APIs, networks and systems, RF, hardware and firmware, and ICS/OT. The obligations are ISO/IEC 27001, NIS2, DORA and GDPR. They visit to judge quickly whether Biel is credible and right for their scope, then to open contact.
- **Also served: employers hiring for cybersecurity roles,** and anyone checking him behind his CV and LinkedIn. The page is his durable reference.
- **Two languages, both first-class:** Spanish-speaking readers (Spain, Mallorca) and international English readers. Many arrive on a phone.

## Product Purpose

The site (vitoalighieri.github.io) is the one-page portfolio of Biel Martínez Janer. It exists to win, in the owner's order:

1. freelance or contract security engagements;
2. a position in cybersecurity;
3. a lasting reference behind his CV and LinkedIn.

Success is a relevant inbound contact. Every path leads to one action, *Open a channel*, which means email (link plus copy key), GitHub or LinkedIn.

## Positioning

Security comes first. He is a cybersecurity specialist, with offensive security as a core capability rather than a closed job title, who also carries the communicative, business and strategic side (owner's words). The owner wants communication and the ability to lead projects to weigh almost as much as the security work. Each part is evidenced on the site:

- **Technical:**
  - he builds and leads production systems as technical lead of an industrial laser-cutting and metallurgy platform at Suministros Jogo, 2023 to now;
  - he does hands-on offensive security from RF and hardware to ICS/OT.
- **Business:**
  - he has founded and led his own projects end to end: vision, strategy, business plan, brand, legal and IP groundwork, team, launch. These are shown as his own projects, without naming the venture;
  - he translates technical findings into compliance obligations.

What a neighbouring candidate cannot truthfully copy is the combination. One person can scope security work, test it, explain it, and tie it to the business. He also builds the kind of systems he tests.

## Operating Context

- A single static page that the owner maintains through Claude sessions. It deploys from the repository root to GitHub Pages at vitoalighieri.github.io. The custom domain bielmartinez.com is no longer used; its `CNAME` was removed on 2026-10-01.
- Visitors judge it alongside his CV and LinkedIn.
- Contact runs only through email (mailto plus a copy key), GitHub and LinkedIn. There are no forms, no backend and no analytics.
- The desktop design is approved. Phones are a first-class target with their own layer below 720 px: thumb dock, channel index, swipe deck.

## Capabilities and Constraints

- **No build step.** The site is plain HTML, CSS and JS, with Three.js, GSAP and ScrollTrigger self-hosted in `assets/vendor/`. First-party CSS and JS carry a cache-busting `?v=N` that is bumped on every change.
- **Bilingual.** English is canonical in `index.html`, marked with `data-i18n` keys; Spanish lives in `assets/js/i18n.js`. Both languages share one URL, and the choice is remembered in `localStorage`.
- **One phone breakpoint.** A single 720 px gate is shared by every module. Phone rules never touch the desktop.
- **Computed experience counter.** The years-of-experience figure is computed from 2023, never hard-coded.
- **Graceful fallback.** The WebGL oscilloscope degrades cleanly, and the page works without it.
- **Undecided, owner to confirm:**
  - The canonical title for the founder and lead experience, now that the venture is not named. Today it appears as "Founder & CEO" (channel CH·03), "Founder · CEO · CTO" (work card) and "founder & CTO" (meta description).
  - Whether freelance engagements need stated availability, scope or terms, or a CV download. None exists today.
  - INE. It is named in the security summary but has no entry in the credentials list.

## Brand Commitments

- **Identity.** Biel Martínez Janer, based in Palma, Balearic Islands. The role line leads with a general cybersecurity identity. "Pentester" must not be the headline label (owner: "para no encasillarse"); the exact wording is decided in the clarify step. It currently reads "Software engineer / pentester / hardware hacker".
- **Thesis and vocabulary.** *I work in frequencies*, with the instrument vocabulary that carries it: channels and bands (CARRIER, BUILD, BREAK, LEAD, SYSTEMS, STACK, HUMAN), CH codes, "Open a channel", "Signal — Active", "End of transmission".
- **Voice.** First person, short sentences, the key phrase in bold. Nothing is claimed that cannot be backed.
- **Spanish.** Adapted rather than translated: it addresses the reader as *tú*, puts infinitives on buttons, and keeps industry English (pentester, hardening, MVP, go-to-market).
- **Owner rules, binding:**
  - never publish his phone number;
  - keep VeriFactu, ACTIC and the English C1 level off the site;
  - Grafana and Sentry appear only in the Stack section;
  - cybersecurity carries the most weight: the offensive-security work card comes first and the founder / own-projects card last;
  - do not name We Love Night (WLN) on the site, including meta tags and the Spanish copy. Present it as personal projects he has founded and led;
  - the *I work in frequencies* thesis stays as it is and where it is, the section after the hero;
  - no "audits" label;
  - the credentials list shows OSCC-SEC (OffSec), CJCA (Hack The Box), eJPT and the ESADE *Finance for Non-Financial Managers* course.

## Evidence on Hand

All of it is in `index.html`, with Spanish in `assets/js/i18n.js`:

- **Pitch and thesis.** "I build systems end to end — from the firmware on the bench to the platform in production — and I break them on purpose to find where they give."
- **Channels.** CH·01 BUILD *Software & architecture*, CH·02 BREAK *Offensive security*, CH·03 LEAD *Founder & CEO*.
- **Offensive-security work.** Nine domains: web and APIs; networks and systems; RF and signals; hardware and firmware; ICS/OT; vulnerability analysis (CVE, CVSS, OWASP, MITRE ATT&CK); hardening; compliance (ISO/IEC 27001, NIS2, DORA, GDPR); tooling and training. The named tools are Burp Suite, Nmap, Metasploit, Wireshark and Ghidra.
- **Suministros Jogo,** 2023 to now: technical lead and software developer on the laser-cutting and metallurgy platform.
- **His own venture** (We Love Night, which must not be named on the site), 2024 to now, in production: launch with zero incidents, key clients closed for 2026.
- **Credentials.**
  - Certifications and courses: Black Hat *Offensive Hardware Hacking*, eJPT, OSCC-SEC, CJCA, PCEP, CCNA content completed, ESADE finance course.
  - Education: a degree in Software Engineering; Honours in Network Security and Algebra; a professional cello degree from the Conservatori de Mallorca.
- **Stack and bench lists, contact links,** and the human side: cello, and semi-professional basketball in 3ª FEB.

Absent, and never to be fabricated:

- **Client proof:** client or employer logos, testimonials, named clients, press or awards.
- **Numbers:** metrics, prices or rates, funding figures, team sizes.
- **Credential detail:** dates, IDs or verification links for any certification.
- **Published work:** CVE IDs, write-ups, talks or named projects.
- **Imagery:** photos, a headshot, product screenshots, og:image or favicon.
- **Availability:** availability or open-to-work statements, and engagement terms.

## Product Principles

1. **Credibility a buyer can verify.** Lead with the security scope, tools and credentials that back it. Never add a claim the evidence cannot carry.
2. **Show the bridge.** Present technical depth in business terms: findings tied to obligations, systems tied to outcomes. Communication and leading projects end to end are proof of judgement, carried by the projects he has led.
3. **One channel, always within reach.** Opening contact must be effortless from any section, on any device.
4. **Truth over filler.** Mark what is missing as an open decision instead of filling it with invented proof.
5. **Two languages, one voice.** Spanish and English are equals, and both read as written in that language.

## Accessibility & Inclusion

- `prefers-reduced-motion` is honoured across every motion layer.
- Keyboard focus is always visible.
- The phone channel index is a proper modal dialog with focus management.
- Touch targets are at least 44 px.
- All content stays readable without JavaScript.
- Controls stay stable under pinch, browser and text zoom. This is an owner requirement.
