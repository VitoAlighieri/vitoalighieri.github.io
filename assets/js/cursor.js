/* =====================================================================
   CUSTOM CURSOR — reticle controller
   - precise amber dot tracks the pointer 1:1; ring trails with easing
   - opens/warms over interactive targets, dips on press
   - fine-pointer only (native cursor kept for touch); honours reduced-motion
   - self-enables/disables if a mouse is plugged in or removed
   ===================================================================== */
(function(){
  "use strict";

  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var INTERACTIVE = 'a, button, [role="button"], input, textarea, select, summary, label';

  var wrap, ring, dot;
  var mx = window.innerWidth/2, my = window.innerHeight/2, rx = mx, ry = my;
  var built = false, active = false, shown = false, raf = null;

  function build(){
    if (built) return;
    wrap = document.createElement('div'); wrap.id = 'cursor'; wrap.setAttribute('aria-hidden','true');
    ring = document.createElement('div'); ring.className = 'cursor-ring'; ring.appendChild(document.createElement('i'));
    dot  = document.createElement('div'); dot.className  = 'cursor-dot';  dot.appendChild(document.createElement('i'));
    wrap.appendChild(ring); wrap.appendChild(dot);
    document.body.appendChild(wrap);
    built = true;
  }
  // position the point only; the inner <i> centres itself (and scales on press)
  // in CSS, so press-feedback can never disturb the location
  function place(el, x, y){ el.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)'; }
  function show(){ if (active && !shown){ shown = true; wrap.classList.add('on'); } }
  function hide(){ if (shown){ shown = false; wrap.classList.remove('on'); } }

  function onMove(e){
    mx = e.clientX; my = e.clientY;
    place(dot, mx, my);
    if (!shown) show();
    if (REDUCED){ rx = mx; ry = my; place(ring, rx, ry); }
    else kick();
  }
  function loop(){
    rx += (mx - rx) * 0.2; ry += (my - ry) * 0.2;
    place(ring, rx, ry);
    if (Math.abs(mx - rx) > 0.1 || Math.abs(my - ry) > 0.1) raf = requestAnimationFrame(loop);
    else raf = null;
  }
  function kick(){ if (!raf) raf = requestAnimationFrame(loop); }

  function onOver(e){ if (e.target.closest && e.target.closest(INTERACTIVE)) wrap.classList.add('hot'); }
  function onOut(e){
    if (!(e.target.closest && e.target.closest(INTERACTIVE))) return;
    var to = e.relatedTarget;
    if (!to || !(to.closest && to.closest(INTERACTIVE))) wrap.classList.remove('hot');
  }
  function onDown(){ wrap.classList.add('down'); }
  function onUp(){ wrap.classList.remove('down'); }
  function onLeave(){ hide(); }
  function onEnter(){ show(); }
  function onVis(){ if (document.hidden && raf){ cancelAnimationFrame(raf); raf = null; } }

  function enable(){
    if (active) return; active = true;
    build();
    root.classList.add('has-cursor');
    place(dot, mx, my); place(ring, rx, ry);
    document.addEventListener('mousemove', onMove, {passive:true});
    document.addEventListener('mouseover', onOver, {passive:true});
    document.addEventListener('mouseout',  onOut,  {passive:true});
    document.addEventListener('mousedown', onDown, {passive:true});
    document.addEventListener('mouseup',   onUp,   {passive:true});
    document.addEventListener('mouseleave', onLeave, {passive:true});
    document.addEventListener('mouseenter', onEnter, {passive:true});
    document.addEventListener('visibilitychange', onVis);
  }
  function disable(){
    if (!active) return; active = false;
    root.classList.remove('has-cursor');
    hide();
    if (raf){ cancelAnimationFrame(raf); raf = null; }
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseover', onOver);
    document.removeEventListener('mouseout',  onOut);
    document.removeEventListener('mousedown', onDown);
    document.removeEventListener('mouseup',   onUp);
    document.removeEventListener('mouseleave', onLeave);
    document.removeEventListener('mouseenter', onEnter);
    document.removeEventListener('visibilitychange', onVis);
  }

  if (fine.matches) enable();
  // react to a mouse being plugged in / removed (hybrid devices)
  try { fine.addEventListener('change', function(e){ e.matches ? enable() : disable(); }); }
  catch(_){ if (fine.addListener) fine.addListener(function(e){ e.matches ? enable() : disable(); }); }
})();
