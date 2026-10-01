/* =====================================================================
   MOBILE — the handheld receiver (phones ≤720px). Loaded AFTER app.js.
   The docked strip is the SCREEN; the controls live in the thumb zone:
   - TUNER dock: live channel readout, a scale with one detent per section, a needle that tracks the page
   - CHANNEL INDEX: full-screen, focus-trapped navigation that grows out of the dock
   - CHANNEL DECK: the three channels as a swipe deck — swiping retunes the whole page
   - HERO: touch the scope — a tap strikes a wave packet, a sideways drag stretches the trace
   - accordions that unroll, copy-email, rule codes that decode, end-of-transmission
   Talks to the scope ONLY through window.BMJ_SCOPE (null-safe). Above 720px the CSS hides every
   piece of phone chrome and the handlers below bail out on PHONE.matches.
   ===================================================================== */
(function(){
  "use strict";
  var mm = function(q){ return window.matchMedia ? window.matchMedia(q) : { matches:false }; };
  var REDUCED = mm('(prefers-reduced-motion: reduce)').matches;
  var PHONE = mm('(max-width:720px)');
  var G = window.gsap || null, ST = window.ScrollTrigger || null;
  var S = window.BMJ_SCOPE || null;
  function T(w){ return (window.BMJ_I18N && window.BMJ_I18N.chrome) ? window.BMJ_I18N.chrome(w) : w; }
  function $(s, r){ return (r||document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r||document).querySelectorAll(s)); }
  function onPhoneChange(fn){ if (PHONE.addEventListener) PHONE.addEventListener('change', fn); else if (PHONE.addListener) PHONE.addListener(fn); }
  // haptics: Android only (iOS has no Vibration API) and only on explicit gestures — never on passive scroll
  var lastBuzz = 0;
  function buzz(p){
    if (REDUCED || !navigator.vibrate) return;
    var n = performance.now(); if (n - lastBuzz < 40) return; lastBuzz = n;
    try { navigator.vibrate(p); } catch(e){}
  }
  // iOS only fires :active on non-link controls when a touchstart listener exists somewhere in the page
  document.addEventListener('touchstart', function(){}, { passive:true });

  /* -----------------------------------------------------------------
     DECODE — mono chrome resolves out of glyph noise, left to right.
     Text nodes only (child <b>/<i> survive) and monospace, so nothing reflows.
     Used sparingly: rule codes, the dock code, the hero's power-on ids.
     ----------------------------------------------------------------- */
  var GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/<>=+';
  function decode(el, dur){
    if (!el || REDUCED) return;
    if (el._dec) el._dec.finish();
    var tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), nodes = [], total = 0;
    while (tw.nextNode()){ var n = tw.currentNode; if (n.nodeValue.trim()){ nodes.push({ n:n, v:n.nodeValue }); total += n.nodeValue.length; } }
    if (!total) return;
    var t0 = performance.now(), raf = 0, lastT = 0;
    var job = { finish:function(){ cancelAnimationFrame(raf); nodes.forEach(function(o){ o.n.nodeValue = o.v; }); el._dec = null; } };
    el._dec = job;
    (function step(t){
      var k = Math.min(1, (t - t0)/(dur || 500));
      if (k >= 1){ job.finish(); return; }
      if (t - lastT > 33){                                   // ~30fps is plenty for a scramble
        lastT = t;
        var locked = Math.floor(total*(k*k*(3 - 2*k))), i = 0;
        nodes.forEach(function(o){
          var out = '';
          for (var c=0; c<o.v.length; c++, i++){
            var ch = o.v[c];
            out += (i < locked || ch === ' ' || ch === ' ' || ch === '·' || ch === '—' || ch === '–') ? ch : GLYPHS[(Math.random()*GLYPHS.length)|0];
          }
          o.n.nodeValue = out;
        });
      }
      raf = requestAnimationFrame(step);
    })(t0);
  }
  document.addEventListener('bmj:decode', function(e){
    if (!e.detail || !e.detail.sel) return;
    $$(e.detail.sel).forEach(function(el){ decode(el, e.detail.dur); });
  });

  /* =================================================================
     1 · TUNER DOCK
     ================================================================= */
  var topbar = $('#topbar'), dock = $('#tuner'), btn = dock && $('.tuner-btn', dock), ix = $('#chindex');
  var codeEl = dock && $('.tn-code', dock), nameEl = dock && $('.tn-name', dock), live = $('#tn-live');
  var curBand = (S && S.band) ? S.band() : 'CH·00 — CARRIER', msgUntil = 0;

  function renderBand(animate){
    if (!dock) return;
    var p = curBand.split(' — '), code = p[0], name = p[1] ? T(p[1]) : '';
    codeEl.textContent = code; if (animate) decode(codeEl, 320);
    if (performance.now() > msgUntil) nameEl.textContent = name;
    var ixNow = ix && $('.ix-now', ix); if (ixNow) ixNow.textContent = code;
    markDetent();
  }
  // app.js dispatches bmj:band from tuneTo(); the readout decodes and the VU bars kick on every retune
  document.addEventListener('bmj:band', function(e){
    var band = e.detail && e.detail.band; if (!band || band === curBand) return;
    curBand = band; renderBand(PHONE.matches);
    if (dock && !REDUCED && PHONE.matches){ dock.classList.remove('retune'); void dock.offsetWidth; dock.classList.add('retune'); }
  });
  document.addEventListener('bmj:lang', function(){ renderBand(false); });

  /* detents: one per destination, at the scroll progress where its band tunes in (section top crosses the centre line) */
  var DEST = ['hero', 'channels', 'systems', 'stack', 'signals', 'contact'];
  var dets = [], detWrap = dock && $('.tn-dets', dock);
  if (detWrap) DEST.forEach(function(){ var d = document.createElement('span'); d.className = 'tn-det'; detWrap.appendChild(d); dets.push(d); });
  function placeDetents(){
    if (!dets.length) return;
    if (window.visualViewport && visualViewport.scale > 1.01) return;   // zoomed in: innerHeight is the zoomed view — keep the detents where they are
    var max = Math.max(1, document.documentElement.scrollHeight - innerHeight), vh = innerHeight;
    DEST.forEach(function(id, i){
      var el = document.getElementById(id); if (!el) return;
      var top = el.getBoundingClientRect().top + (window.pageYOffset || 0);
      dets[i].style.setProperty('--x', (Math.max(0, Math.min(1, (top - vh/2)/max))*100).toFixed(2) + '%');
    });
  }
  function markDetent(){
    var parts = curBand.split(' — '), code = parts[0], idx = 0;
    if (/CH·0[1-3]/.test(code)) idx = 1; else if (code === 'CH·04') idx = 2; else if (code === 'CH·05') idx = 3; else if (code === 'CH·06') idx = 4;
    else if ((window.pageYOffset || 0) > innerHeight*2) idx = 5;   // CH·00 again, but past the hero: contact
    dets.forEach(function(d, i){ d.classList.toggle('is-on', i === idx); });
  }

  /* visibility: the dock arrives WITH the docked strip (never over the hero, whose thumb zone belongs to its CTA),
     and ducks out of the way while a fast fling is in progress; any upward move or a pause brings it back */
  var isQuiet = false, quietT = null;
  function unduck(){ clearTimeout(quietT); if (isQuiet){ isQuiet = false; dock.classList.remove('is-quiet'); } }
  function duck(){ if (!isQuiet){ isQuiet = true; dock.classList.add('is-quiet'); } clearTimeout(quietT); quietT = setTimeout(unduck, 550); }
  function syncDock(){
    if (!dock) return;
    var on = PHONE.matches && !!topbar && topbar.classList.contains('is-docked');
    if (on !== dock.classList.contains('is-on')){ dock.classList.toggle('is-on', on); if (on) placeDetents(); }
  }
  if (dock){
    if (topbar && 'MutationObserver' in window) new MutationObserver(syncDock).observe(topbar, { attributes:true, attributeFilter:['class'] });
    if (ST){
      ST.create({ start:0, end:'max', onUpdate:function(s){
        dock.style.setProperty('--p', s.progress.toFixed(4));
        var v = s.getVelocity();
        if (v > 2400 && s.progress < 0.96) duck(); else if (v < -120 || s.progress >= 0.96) unduck();   // only a real fling ducks it, not reading speed
      }});
      ST.addEventListener('refresh', placeDetents);
    }
    placeDetents(); renderBand(false); syncDock();
    window.addEventListener('load', placeDetents);
    onPhoneChange(syncDock);
    btn.addEventListener('click', function(){ openIndex(); });
  }
  function flashMsg(word){
    if (!dock) return;
    msgUntil = performance.now() + 1600;
    nameEl.textContent = T(word); dock.classList.add('is-msg'); unduck();
    if (live) live.textContent = T(word);
    clearTimeout(flashMsg.t);
    flashMsg.t = setTimeout(function(){ dock.classList.remove('is-msg'); msgUntil = 0; renderBand(false); if (live) live.textContent = ''; }, 1650);
  }

  /* =================================================================
     2 · CHANNEL INDEX (full-screen dialog that grows out of the dock)
     ================================================================= */
  var isOpen = false, pushed = false, pending = null, lastFocus = null, ixTl = null, bgAnim = null, scanAnim = null;
  var outside = [$('main'), topbar, $('footer'), dock].filter(Boolean);
  var bg = ix && $('.ix-bg', ix), scan = ix && $('.ix-scan', ix), head = ix && $('.ix-head', ix), ixFoot = ix && $('.ix-foot', ix);
  var rows = ix ? $$('.ix-list > li', ix) : [], names = ix ? $$('.ix-name', ix) : [];
  var EXPO = 'cubic-bezier(.87,0,.13,1)';   // ≈ expo.inOut, for the compositor-friendly WAAPI clip morph
  function setInert(on){
    outside.forEach(function(el){
      if (on){ el.setAttribute('inert', ''); el.setAttribute('aria-hidden', 'true'); }
      else { el.removeAttribute('inert'); el.removeAttribute('aria-hidden'); }
    });
  }
  function pillClip(){
    var r = btn.getBoundingClientRect(), vw = innerWidth, vh = innerHeight;
    return 'inset(' + r.top.toFixed(1) + 'px ' + (vw - r.right).toFixed(1) + 'px ' + (vh - r.bottom).toFixed(1) + 'px ' + r.left.toFixed(1) + 'px round 30px)';
  }
  function curTarget(){
    var code = curBand.split(' — ')[0];
    return { 'CH·01':'ch01', 'CH·02':'ch02', 'CH·03':'ch03', 'CH·04':'systems', 'CH·05':'stack', 'CH·06':'signals' }[code] ||
           ((window.pageYOffset || 0) > innerHeight*2 ? 'contact' : 'hero');
  }
  function markCurrent(){
    var t = curTarget(), top = /^ch0/.test(t) ? 'channels' : t;
    $$('[data-go]', ix).forEach(function(a){
      var g = a.getAttribute('data-go'), on = (g === top) || (g === t);
      a.classList.toggle('is-cur', on);
      if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
    });
  }
  function openIndex(){
    if (isOpen || !ix || !PHONE.matches) return;
    // Safari never focuses a tapped <button>, so activeElement is <body>: fall back to the dock button itself
    var ae = document.activeElement;
    isOpen = true; pending = null; lastFocus = (ae && ae !== document.body) ? ae : btn; markCurrent();
    var from = pillClip(), r = btn.getBoundingClientRect();
    ix.classList.add('is-open'); document.documentElement.classList.add('ix-open'); setInert(true); btn.setAttribute('aria-expanded', 'true');
    try { history.pushState({ bmjIx:1 }, ''); pushed = true; } catch(e){ pushed = false; }
    sizeTraces(); startTraces();
    var focusEl = $('.ix-row.is-cur', ix) || $('.ix-row', ix);
    buzz(6);
    if (!G || REDUCED || !bg.animate){
      if (G) G.fromTo(ix, { opacity:0 }, { opacity:1, duration:.25, ease:'none' });
      if (focusEl) focusEl.focus({ preventScroll:true }); return;
    }
    if (ixTl) ixTl.kill();
    if (bgAnim) bgAnim.cancel();
    bgAnim = bg.animate([{ clipPath:from }, { clipPath:'inset(0px 0px 0px 0px round 0px)' }], { duration:620, easing:EXPO, fill:'both' });
    scanAnim = scan.animate([
      { transform:'translateY(' + r.top.toFixed(1) + 'px)', opacity:1 },
      { transform:'translateY(0px)', opacity:1, offset:.8 },
      { transform:'translateY(0px)', opacity:0 }
    ], { duration:760, easing:EXPO, fill:'both' });
    ixTl = G.timeline({ defaults:{ overwrite:'auto' } })
      .fromTo(head, { opacity:0, y:-10 }, { opacity:1, y:0, duration:.45, ease:'power2.out' }, .3)
      .fromTo(rows, { opacity:0, y:34 }, { opacity:1, y:0, duration:.7, ease:'expo.out', stagger:.055 }, .28)
      .fromTo(names, { '--w':64 }, { '--w':112, duration:.75, ease:'expo.out', stagger:.055 }, .28)
      .fromTo(ixFoot, { opacity:0, y:16 }, { opacity:1, y:0, duration:.45, ease:'power3.out' }, .4);
    if (focusEl) focusEl.focus({ preventScroll:true });
  }
  function finishClose(){
    ix.classList.remove('is-open'); document.documentElement.classList.remove('ix-open'); setInert(false);
    btn.setAttribute('aria-expanded', 'false'); stopTraces();
    if (bgAnim){ bgAnim.cancel(); bgAnim = null; } if (scanAnim){ scanAnim.cancel(); scanAnim = null; }
    if (G) G.set([head, ixFoot, ix].concat(rows, names), { clearProps:'all' });
    $$('.is-pick', ix).forEach(function(a){ a.classList.remove('is-pick'); });
    var then = pending; pending = null;
    if (then) then();
    else if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll:true });
    else btn.focus({ preventScroll:true });
  }
  function closeIndex(){
    if (!isOpen) return; isOpen = false;
    if (!G || REDUCED || !bg.animate){
      if (G) G.to(ix, { opacity:0, duration:.18, ease:'none', onComplete:finishClose }); else finishClose();
      return;
    }
    if (ixTl) ixTl.kill();
    ixTl = G.timeline()
      .to(rows.slice().reverse(), { opacity:0, y:18, duration:.24, ease:'power2.in', stagger:.03 }, 0)
      .to([head, ixFoot], { opacity:0, duration:.2, ease:'power1.in' }, 0);
    if (bgAnim) bgAnim.cancel();
    bgAnim = bg.animate([{ clipPath:'inset(0px 0px 0px 0px round 0px)' }, { clipPath:pillClip() }], { duration:460, delay:120, easing:EXPO, fill:'both' });
    bgAnim.onfinish = finishClose;
  }
  // every UI close goes through history, so the Android back gesture and the close button share one path.
  // A second ✕ / Esc while the index is already closing is ignored, and never drops a destination already picked.
  function requestClose(then){
    if (then) pending = then;
    if (!isOpen) return;
    if (pushed){ pushed = false; history.back(); } else closeIndex();
  }
  window.addEventListener('popstate', function(){ if (isOpen){ pushed = false; closeIndex(); } });
  function goTo(id){
    var el = document.getElementById(id); if (!el) return;
    var card = el.classList.contains('channel') ? el : null;
    if (card){ deckTo(cards.indexOf(card), 'auto'); el = document.getElementById('channels'); }
    el.scrollIntoView({ behavior:REDUCED ? 'auto' : 'smooth', block:'start' });
    var f = el.querySelector('h2, h1');
    if (f){ f.setAttribute('tabindex', '-1'); f.focus({ preventScroll:true }); }
  }
  if (ix){
    ix.addEventListener('click', function(e){
      var a = e.target.closest('[data-go]');
      if (a){
        e.preventDefault(); var id = a.getAttribute('data-go'); a.classList.add('is-pick'); buzz(8);
        pending = function(){ goTo(id); };                     // the pick is kept even if ✕ / Esc lands during the flash
        setTimeout(function(){ requestClose(); }, REDUCED ? 0 : 140);
        return;
      }
      if (e.target.closest('.ix-close')) requestClose();
    });
    ix.addEventListener('keydown', function(e){
      if (e.key === 'Escape'){ e.preventDefault(); requestClose(); return; }
      if (e.key !== 'Tab') return;                          // belt and braces: inert already keeps focus inside
      var f = $$('a[href], button:not([disabled])', ix).filter(function(n){ return n.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]){ e.preventDefault(); f[f.length-1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length-1]){ e.preventDefault(); f[0].focus(); }
    });
    onPhoneChange(function(){ if (!PHONE.matches && isOpen) requestClose(); });
  }

  /* live mini traces in the index rows: 30fps, only while the index is open */
  var ixCv = ix ? $$('.ix-wf', ix) : [], trRaf = null, trLast = 0, trPh = 0;
  function bandOf(el){ return { shape:+(el.getAttribute('data-shape')||0), freq:+(el.getAttribute('data-freq')||2), amp:+(el.getAttribute('data-amp')||1), noise:+(el.getAttribute('data-noise')||0) }; }
  var ixCfg = ixCv.map(function(cv){ var row = cv.closest('[data-go]'), sec = row && document.getElementById(row.getAttribute('data-go')); return sec ? bandOf(sec) : { shape:0, freq:2, amp:1, noise:0 }; });
  function shapeVal(sh, ph){ return (S && S.shapeVal) ? S.shapeVal(sh, ph) : Math.sin(ph); }
  function sizeTraces(){
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    ixCv.forEach(function(cv){ var w = cv.clientWidth, h = cv.clientHeight || 16; cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr); cv.getContext('2d').setTransform(dpr,0,0,dpr,0,0); cv._w = w; cv._h = h; });
  }
  function drawTraces(){
    ixCv.forEach(function(cv, i){
      var c = cv.getContext('2d'), w = cv._w, h = cv._h, cfg = ixCfg[i]; if (!w) return;
      var cur = cv.closest('.ix-row').classList.contains('is-cur');
      c.clearRect(0,0,w,h); c.beginPath();
      for (var x=0; x<=w; x+=2){
        var u = x/w, y = shapeVal(cfg.shape, u*Math.PI*2*Math.min(5, cfg.freq)*0.9 + trPh)*0.8*cfg.amp;
        if (cfg.noise > .1) y += (Math.sin(u*97 + trPh*7)*.5 + Math.sin(u*41 - trPh*5)*.5)*cfg.noise*.35;
        var py = h/2 - Math.max(-1, Math.min(1, y))*(h/2 - 1.5);
        if (x === 0) c.moveTo(x, py); else c.lineTo(x, py);
      }
      c.lineWidth = cur ? 1.6 : 1.2; c.strokeStyle = cur ? '#FFAD3A' : 'rgba(139,148,166,.7)'; c.stroke();
    });
  }
  function trLoop(t){ trRaf = requestAnimationFrame(trLoop); if (t - trLast < 33) return; trLast = t; if (document.documentElement.classList.contains('scope-hold')) return; trPh += 0.06; drawTraces(); }
  function startTraces(){ drawTraces(); if (!REDUCED && !trRaf) trRaf = requestAnimationFrame(trLoop); }
  function stopTraces(){ if (trRaf) cancelAnimationFrame(trRaf); trRaf = null; }

  /* =================================================================
     3 · CHANNEL DECK (horizontal snap inside #channels, phones only)
     ================================================================= */
  var chSec = $('#channels'), deck = $('#channels .channels'), pager = $('.ch-pager');
  var cards = deck ? $$('.channel', deck) : [], pgBtns = pager ? $$('button', pager) : [], curCard = -1, deckBooted = false;
  // the deck snaps each card to its CENTRE (mobile.css), so tuning to a card brings its centre to the deck's centre
  function deckTo(i, beh){
    var c = cards[i]; if (!c || !deck) return;
    var cr = c.getBoundingClientRect(), dr = deck.getBoundingClientRect();
    var dx = (cr.left + cr.width / 2) - (dr.left + deck.clientLeft + deck.clientWidth / 2);
    deck.scrollTo({ left:deck.scrollLeft + dx, behavior:beh || (REDUCED ? 'auto' : 'smooth') });
  }
  function setCard(i){
    if (!PHONE.matches){
      curCard = -1; cards.forEach(function(c){ c.classList.remove('is-cur'); });
      if (S){ S.deckCard = null; S.resolve(); }
      return;
    }
    if (i === curCard || !cards[i]) return; curCard = i;
    cards.forEach(function(c, k){ c.classList.toggle('is-cur', k === i); });
    pgBtns.forEach(function(b, k){ b.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    if (S){ S.deckCard = cards[i]; S.resolve(); }        // the whole page retunes to the card you swiped to
    if (deckBooted){
      buzz(6); if (chSec) chSec.classList.add('deck-seen');
      var cv = $('canvas.wf', cards[i]); if (cv && cv.bmjKick) cv.bmjKick(0.06, 0.9);   // the lock-on transient runs across the card's trace
    }
  }
  if (deck && pager && cards.length){
    pgBtns.forEach(function(b, i){ b.addEventListener('click', function(){ deckTo(i); }); });
    var dpRaf = null;
    deck.addEventListener('scroll', function(){
      if (dpRaf) return;
      dpRaf = requestAnimationFrame(function(){
        dpRaf = null;
        var max = deck.scrollWidth - deck.clientWidth, p = max > 0 ? deck.scrollLeft/max : 0;
        pager.style.setProperty('--dp', p.toFixed(4));
      });
    }, { passive:true });
    if ('IntersectionObserver' in window){
      var io = new IntersectionObserver(function(en){
        if (PHONE.matches) en.forEach(function(e){ if (e.isIntersecting && e.intersectionRatio >= .6) setCard(cards.indexOf(e.target)); });
        deckBooted = true;
      }, { root:deck, threshold:[.6] });
      cards.forEach(function(c){ io.observe(c); });
    }
    setCard(0);
    onPhoneChange(function(){ curCard = -1; setCard(0); });
    // tap a card's trace: a packet runs out from the tap
    cards.forEach(function(c){
      var side = $('.ch-side', c), cv = side && $('canvas.wf', side); if (!cv) return;
      side.addEventListener('pointerup', function(e){
        if (!PHONE.matches || !cv.bmjKick) return;
        var r = cv.getBoundingClientRect(); cv.bmjKick((e.clientX - r.left)/Math.max(1, r.width), 1); buzz(5);
      }, { passive:true });
    });
  }

  /* =================================================================
     4 · SYSTEMS — accordions that unroll (≤600, where app.js collapses the job cards)
     ================================================================= */
  var ACC = mm('(max-width:600px)');
  $$('details.sys-more').forEach(function(d){
    var sum = $('summary', d), body = sum && sum.nextElementSibling;
    if (!sum || !body) return;
    sum.addEventListener('click', function(e){
      if (!ACC.matches || !G || REDUCED) return;               // desktop: no summary; reduced motion: the native instant toggle
      e.preventDefault();
      if (d._anim) return;
      d._anim = true;
      var opening = !d.open;
      d.classList.add('is-anim', opening ? 'is-opening' : 'is-closing');   // the label flips at once, not after the tween
      var done = function(){ d._anim = false; d.classList.remove('is-anim', 'is-opening', 'is-closing'); G.set(body, { clearProps:'height,overflow' }); if (ST) ST.refresh(); };
      if (opening){
        d._sync = true; d.open = true; d.setAttribute('data-user', '1');   // open first so the content can be measured
        var h = body.scrollHeight;
        G.fromTo(body, { height:0, overflow:'hidden' }, { height:h, duration:.6, ease:'expo.out', onComplete:done });
        G.fromTo($$('li, h4', body), { opacity:0, y:10 }, { opacity:1, y:0, duration:.45, ease:'power2.out', stagger:.035, delay:.08, clearProps:'opacity,transform' });
      } else {
        G.fromTo(body, { height:body.offsetHeight, overflow:'hidden' }, { height:0, duration:.45, ease:'power3.inOut',
          onComplete:function(){ d._sync = true; d.open = false; d.removeAttribute('data-user'); done(); } });
      }
      buzz(5);
    });
  });

  /* =================================================================
     5 · COPY EMAIL (contact row + index footer) → confirmed in the dock readout, and the strip trace rings
     ================================================================= */
  function copyText(txt, el){
    function ok(){
      if (el){ el.classList.add('is-done'); clearTimeout(el._t); el._t = setTimeout(function(){ el.classList.remove('is-done'); }, 1600); }
      flashMsg('COPIED'); buzz([6, 40, 6]); if (S) S.kick(0.5, 0.8);
    }
    // both copy paths refused (a locked-down browser): select the address on the page so a long-press / ⌘C finishes
    // the job, and say so in the dock and the live region — never a silent tap
    function fail(){
      var v = document.querySelector('.mail-wrap .link-row .v');
      if (v && window.getSelection){ var r = document.createRange(); r.selectNodeContents(v); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      flashMsg('SELECTED');
    }
    function legacy(){
      var ta = document.createElement('textarea'), done = false; ta.value = txt; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;';
      document.body.appendChild(ta); ta.select(); try { done = document.execCommand('copy'); } catch(e){} document.body.removeChild(ta);
      if (done) ok(); else fail();
    }
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(txt).then(ok, legacy); else legacy();
  }
  $$('button[data-copy]').forEach(function(b){ b.addEventListener('click', function(){ copyText(b.getAttribute('data-copy'), b); }); });

  /* =================================================================
     6 · HERO — touch the signal (phones, touch/pen only; the page keeps every vertical drag)
     tap → a wave packet runs out from the finger · sideways drag → the trace stretches around the thumb like a
     detented tuning knob, and springs home with an overshoot on release (LOCK)
     ================================================================= */
  function gesture(el, h){
    var g = null;
    el.addEventListener('pointerdown', function(e){
      if (!e.isPrimary || (h.skip && h.skip(e))) return;     // a second finger (pinch, palm) never hijacks the gesture in flight
      if (g && g.mode === 'drag' && h.dragEnd) h.dragEnd(g, e);
      g = { id:e.pointerId, x0:e.clientX, y0:e.clientY, t0:performance.now(), mode:'?' };
      if (h.down) h.down(g, e);
    }, { passive:true });
    el.addEventListener('pointermove', function(e){
      if (!g || e.pointerId !== g.id) return;
      var dx = e.clientX - g.x0, dy = e.clientY - g.y0;
      if (g.mode === '?' && (Math.abs(dx) > 9 || Math.abs(dy) > 9)){   // direction lock: only a clearly sideways move tunes
        g.mode = (h.drag && Math.abs(dx) > Math.abs(dy)*1.2) ? 'drag' : 'pass';
        if (g.mode === 'drag'){ try { el.setPointerCapture(e.pointerId); } catch(_){} if (h.dragStart) h.dragStart(g, e); }
      }
      if (g.mode === 'drag') h.drag(g, e, dx);
    }, { passive:true });
    function end(e, cancelled){
      if (!g || e.pointerId !== g.id) return;
      if (g.mode === 'drag'){ if (h.dragEnd) h.dragEnd(g, e); }
      else if (g.mode === '?' && !cancelled && h.tap && performance.now() - g.t0 < 420) h.tap(g, e);
      g = null;
    }
    el.addEventListener('pointerup', function(e){ end(e, false); }, { passive:true });
    el.addEventListener('pointercancel', function(e){ end(e, true); }, { passive:true });        // the browser took a vertical pan
    // …or our capture was lost (only el's own: touch starts with an implicit capture on the inner target, which it hands to el)
    el.addEventListener('lostpointercapture', function(e){ if (e.target === el) end(e, true); }, { passive:true });
  }
  var hero = $('#hero'), probe = hero && $('.probe', hero), ring = hero && $('.tapring', hero), hint = hero && $('.touchhint', hero);
  if (hero && probe && S && S.ok){
    // the hero's LAYOUT width, not innerWidth: on iOS a pinch-zoom shrinks innerWidth to the zoomed view, and the probe
    // would then map the thumb onto the wrong part of the trace
    var TR = S.TR, W = hero.clientWidth || innerWidth, lastDet = 0, followRaf = null;
    var prF = $('.pr-f', probe), prX = $('.pr-x', probe);
    window.addEventListener('resize', function(){ W = hero.clientWidth || innerWidth; }, { passive:true });
    var uOf = function(x){ return Math.max(0, Math.min(1, 0.5 + (x/W - 0.5)/1.06)); };   // the trace is overscanned 1.06× full-bleed
    var xOf = function(u){ return (0.5 + (u - 0.5)*1.06)*W; };
    var probeAt = function(x){   // the cursor sits under the thumb; its chip is pushed back inside the edges
      var cx = Math.max(12, Math.min(W - 12, x));
      probe.style.transform = 'translateX(' + cx.toFixed(1) + 'px)';
      probe.style.setProperty('--cx', (Math.max(88, Math.min(W - 88, cx)) - cx).toFixed(1) + 'px');
    };
    var readProbe = function(){
      var f = S.P.freq*TR.det, d = Math.round(f*4)/4;      // a detent every 0.25
      prF.textContent = f.toFixed(2); prX.textContent = '×' + TR.det.toFixed(2);
      if (d !== lastDet){ if (lastDet && TR.held) buzz(4); lastDet = d; }
    };
    var follow = function(){
      readProbe();
      followRaf = (TR.probe >= 0 || Math.abs(TR.det - 1) > .002) ? requestAnimationFrame(follow) : null;
      if (!followRaf) prX.textContent = '×1.00';
    };
    var ringAt = function(x, y){
      if (!ring || REDUCED || !ring.animate) return;
      var hr = hero.getBoundingClientRect(), tx = 'translate(' + (x - hr.left).toFixed(1) + 'px,' + (y - hr.top).toFixed(1) + 'px)';
      ring.animate([{ transform:tx + ' scale(.12)', opacity:1 }, { transform:tx + ' scale(1.6)', opacity:0 }], { duration:750, easing:'cubic-bezier(.2,.7,.2,1)' });
    };
    var hintOff = function(remember){
      if (!hint) return;
      hint.classList.remove('on'); hint.classList.add('off');
      if (remember){ try { localStorage.setItem('bmj-touched', '1'); } catch(e){} }
    };
    gesture(hero, {
      skip:function(e){
        return !PHONE.matches || e.pointerType === 'mouse' || window.scrollY > hero.offsetHeight*0.6 ||
               !!(e.target.closest && e.target.closest('a, button, .lang-switch'));
      },
      down:function(){ hintOff(true); },
      tap:function(g, e){
        var u = uOf(e.clientX); S.kick(u, 0.95); S.race(0.55); ringAt(e.clientX, e.clientY); buzz(6);
        TR.probe = u; setTimeout(function(){ if (!TR.held) TR.probe = -1; }, 280);   // the beam flashes at the struck point
      },
      drag:REDUCED ? null : function(g, e, dx){
        TR.probe = uOf(e.clientX); probeAt(e.clientX);
        TR.detTo = Math.max(0.35, Math.min(3.2, g.det0*Math.exp(dx/(W*0.42))));   // right = higher, left = lower; exponential, like a real knob
      },
      dragStart:function(g){
        TR.held = true; if (Math.abs(TR.det - 1) < 0.02) TR.anch = uOf(g.x0);   // grab the wave where the thumb landed
        TR.detTo = TR.det; g.det0 = TR.det; probeAt(g.x0); probe.classList.add('on'); probe.classList.remove('lock');
        if (!followRaf) followRaf = requestAnimationFrame(follow);
      },
      dragEnd:function(){
        TR.held = false; TR.probe = -1; S.race(0.35);
        probe.classList.add('lock'); buzz([4, 60, 10]);
        setTimeout(function(){ probe.classList.remove('on'); }, 650);
        if (!followRaf) followRaf = requestAnimationFrame(follow);
      }
    });

    /* discoverability: once per visitor, after the power-on, the scope demonstrates itself — a ghost touch lands ON
       the trace (its position read from the scope), a packet runs out from it and 'Touch the signal ⟷' appears */
    var seen = false; try { seen = localStorage.getItem('bmj-touched') === '1'; } catch(e){}
    if (hint && !seen && !REDUCED && PHONE.matches){
      setTimeout(function(){
        if (window.scrollY > 40 || TR.probe >= 0 || document.documentElement.classList.contains('ix-open')) return;
        var u = 0.7, lo = -1e9;
        for (var su = 0.5; su <= 0.9; su += 0.01){ var sy = S.toScreen(S.waveY(su)); if (sy > lo){ lo = sy; u = su; } }   // the lowest point, below the role line
        var x = Math.min(W - 46, xOf(u));
        requestAnimationFrame(function(){
          var hr = hero.getBoundingClientRect(), y = S.toScreen(S.waveY(u)) - hr.top;
          // the label lives in the empty band between the role line and the readout, whatever the viewport height
          var role = $('.hero-mid .role', hero), rd = $('.readout', hero);
          var lo2 = role ? role.getBoundingClientRect().bottom - hr.top + 10 : y + 30, hi = rd ? rd.getBoundingClientRect().top - hr.top - 34 : y + 30;
          hint.style.setProperty('--ly', (Math.max(lo2, Math.min(hi, y + 30)) - y).toFixed(1) + 'px');
          hint.classList.toggle('nolabel', hi < lo2 - 4);   // no band left on a short screen (long Spanish lede): the ring alone, never a label over the readout
          hint.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
          hint.classList.toggle('left', x < W*0.5);
          hint.classList.add('on', 'play');
          S.kick(u, 0.75); setTimeout(function(){ if (TR.probe < 0) S.kick(u, 0.55); }, 1500);
          setTimeout(function(){ hintOff(false); }, 5200);
        });
      }, 2900);
    }
  }

  /* =================================================================
     7 · SECTION CHOREOGRAPHY (phones): the rule's tick scale draws in (CSS) and its codes decode once;
     'frequencies.' stretches across the glass once; the strip signs off at the footer
     ================================================================= */
  if (ST && PHONE.matches && !REDUCED){
    $$('.s-head').forEach(function(h){
      ST.create({ trigger:h, start:'top 86%', once:true, onEnter:function(){
        decode($('.s-rule .idx', h), 600);
        setTimeout(function(){ decode($('.s-n', h), 450); }, 650);
      }});
    });
  }
  var big = $('.thesis-grid .big');
  if (G && ST && big && PHONE.matches && !REDUCED && big.getBoundingClientRect().top > innerHeight){
    var emPre = $('em', big); if (emPre) emPre.style.fontVariationSettings = "'wght' 800,'wdth' 58";   // preset below the fold: no flash
    var stretched = false;
    var stretch = function(){
      if (stretched) return; stretched = true;
      var em = $('em', big); if (!em) return;
      var o = { w:58 };
      G.to(o, { w:100, duration:1.2, ease:'expo.out', delay:.15,
        onUpdate:function(){ em.style.fontVariationSettings = "'wght' 800,'wdth' " + o.w.toFixed(1); },
        onComplete:function(){ em.style.fontVariationSettings = ''; } });
    };
    ST.create({ trigger:big, start:'top 80%', once:true, onEnter:stretch });
    document.addEventListener('bmj:lang', function(){ if (!stretched){ stretched = true; var em = $('em', big); if (em) em.style.fontVariationSettings = ''; } });   // a swap rebuilds the <em> at full width
  }
  var foot = $('footer');
  if (ST && S && foot){
    var signOff = function(on){
      if (on && !PHONE.matches) return;
      foot.classList.toggle('eot-on', on);
      if (G && !REDUCED) G.to(S.TR, { barEnv:on ? 0 : 1, duration:on ? 1.1 : 0.6, ease:on ? 'power3.in' : 'power2.out', overwrite:'auto' });
      else S.TR.barEnv = on ? 0 : 1;
    };
    ST.create({ trigger:foot, start:'top 85%', onEnter:function(){ signOff(true); }, onLeaveBack:function(){ signOff(false); } });
    onPhoneChange(function(){ if (!PHONE.matches){ foot.classList.remove('eot-on'); S.TR.barEnv = 1; S.TR.head = 1; } });
  }
})();
