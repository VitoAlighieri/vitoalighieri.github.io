/* =====================================================================
   OPERATOR — interaction layer
   - Three.js oscilloscope (ribbon glow + crisp core + receding graticule)
   - docks from full-screen hero into a slim top "signal strip"
   - morphs waveform params per section via GSAP ScrollTrigger
   - reduced-motion + mobile aware
   ===================================================================== */
(function(){
  "use strict";
  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var IS_TOUCH = window.matchMedia('(hover: none)').matches;
  // Reduced-motion keeps the signature waveform alive but gentle; the bigger
  // motion (name slide-in, ambient drift, scroll jolts) is dropped below.
  var SCOPE_SPEED = REDUCED ? 0.5 : 1.0;
  var scrollVel = 0;   // 0..1, fed by the ScrollTrigger below, decays in frame(); the signal reacts to the reader's hand
  document.body.classList.add('is-ready');
  // failsafe: ensure hero/name are visible shortly after load no matter what
  setTimeout(function(){ document.documentElement.classList.add('motion-done'); }, 2600);

  /* ---------- small smooth value-noise for the RF look ---------- */
  var NS = 257, noiseTbl = new Float32Array(NS);
  for (var i=0;i<NS;i++) noiseTbl[i] = Math.random()*2-1;
  function vnoise(x){ // x in samples-space
    var xi = Math.floor(x), f = x-xi;
    var a = noiseTbl[((xi%256)+256)%256], b = noiseTbl[(((xi+1)%256)+256)%256];
    var u = f*f*(3-2*f);
    return a+(b-a)*u;
  }

  /* ---------- waveform shapes ---------- */
  function shapeVal(shape, ph){
    switch(shape){
      case 1: return Math.tanh(Math.sin(ph)*3.6);            // square-ish (digital)
      case 2: return Math.asin(Math.sin(ph))*(2/Math.PI);    // triangle
      case 3: { // pulse / kick envelope (the night)
        var t = (ph/(Math.PI*2)); t = t-Math.floor(t);
        return (Math.exp(-t*7.0)*Math.sin(t*Math.PI*2*1.5))*1.6;
      }
      case 4: // step (lead): a slow carrier riding on a half-rate square — one decisive level change per two cycles
        return 0.62*Math.sin(ph) + 0.38*Math.tanh(Math.sin(ph*0.5)*4.0);
      default: // smooth, continuous carrier — gentle 2nd harmonic for grace
        return (Math.sin(ph) + 0.16*Math.sin(2*ph + 0.5))*0.92;
    }
  }

  /* =================================================================
     MAIN SCOPE (Three.js)
     ================================================================= */
  var THREE_OK = !!window.THREE;
  var stage = document.getElementById('scope-stage');
  var canvas = document.getElementById('scope-canvas');

  var P = { freq:2.0, amp:1.0, noise:0.10, shape:0, fromShape:0, morph:1, glow:1, dock:0, speed:1.4 };
  var teleRead = document.getElementById('tele-read');
  var teleBand = document.getElementById('tele-band');
  // the strip readout's value nodes (f / A / noise flag) — written only when the text changes
  var teleF = teleRead ? teleRead.querySelector('.fv') : null,
      teleA = teleRead ? teleRead.querySelector('.av') : null,
      teleN = teleRead ? teleRead.querySelector('.nv') : null,
      teleLastF = '', teleLastA = '', teleLastN = '';

  // Quality tiers: reduced-motion gets a deliberately low-cost scope; full gets the works.
  var Q = REDUCED
    ? { dpr:1.2, samples:110, halo:false, head:false, gridOp:0.42 }
    : { dpr:(IS_TOUCH?1.6:1.9), samples:(IS_TOUCH?190:300), halo:true, head:true, gridOp:0.5 };

  var Scope = null;
  try { Scope = (function(){
    if (!THREE_OK) return null;
    var barPx = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--bar')) || 60;
    var barCanvas = document.getElementById('bar-scope');
    var bctx = barCanvas.getContext('2d');
    var barW = 1, barH = barPx, DPR2 = Math.min(window.devicePixelRatio||1, 2);
    // the strip trace draws only in the MEASURED lane between the mark and the
    // readouts (fixed-percent masks still crossed the labels between 900–1200px)
    var markEl = document.querySelector('#topbar .mark'), teleEl = document.querySelector('#topbar .tele');
    var laneX0 = 0, laneX1 = 1;
    function measureLane(){
      var b = barCanvas.getBoundingClientRect();
      var m = markEl ? markEl.getBoundingClientRect() : null, t = teleEl ? teleEl.getBoundingClientRect() : null;
      laneX0 = m ? (m.right - b.left + 18) : 0;
      laneX1 = t ? (t.left  - b.left - 18) : barW;
    }
    if ('ResizeObserver' in window && teleEl) new ResizeObserver(measureLane).observe(teleEl);   // EN/ES changes the readout width
    var renderer = new THREE.WebGLRenderer({ canvas:canvas, antialias:!REDUCED, alpha:true, powerPreference:'high-performance' });
    renderer.setClearColor(0x000000, 0);
    var DPRMAX = Q.dpr;
    var scene = new THREE.Scene();
    var INK = 0x06080E;
    scene.fog = new THREE.FogExp2(INK, 0.055);

    var camera = new THREE.PerspectiveCamera(48, 1, 0.1, 200);
    camera.position.set(0, 0, 9);

    /* ----- receding graticule (scope screen depth) ----- */
    var grid = new THREE.Group();
    var gmat = new THREE.LineBasicMaterial({ color:0x223047, transparent:true, opacity:Q.gridOp });
    var depth = 70, vcount = 26, hcount = 7, halfW = 18;
    // lines running into depth (verticals)
    for (var v=0; v<vcount; v++){
      var x = (v/(vcount-1))*2-1; x*=halfW;
      var g1 = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(x,-4,2), new THREE.Vector3(x,-4,-depth) ]);
      grid.add(new THREE.Line(g1, gmat));
    }
    // crossbars
    for (var h=0; h<hcount; h++){
      var z = -(h/(hcount-1))*depth + 2;
      var g2 = new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(-halfW,-4,z), new THREE.Vector3(halfW,-4,z) ]);
      grid.add(new THREE.Line(g2, gmat));
    }
    grid.rotation.x = -0.62;
    grid.position.y = 1.0;
    scene.add(grid);

    /* ----- the trace: glow ribbon + crisp core line ----- */
    var SAMPLES = Q.samples;
    var XSPAN = 11.5; // world units across (recomputed on resize for full-bleed)
    var ASPK = 1;     // portrait calibration: 1 on landscape desktops, down to .55 on tall phones

    // ribbon geometry (triangle strip → 2 verts per sample)
    var ribbonGeo = new THREE.BufferGeometry();
    var ribbonPos = new Float32Array(SAMPLES*2*3);
    var ribbonV   = new Float32Array(SAMPLES*2);     // 0..1 across thickness
    for (var s=0;s<SAMPLES;s++){ ribbonV[s*2]=0.0; ribbonV[s*2+1]=1.0; }
    ribbonGeo.setAttribute('position', new THREE.BufferAttribute(ribbonPos,3));
    ribbonGeo.setAttribute('aV', new THREE.BufferAttribute(ribbonV,1));
    var idx=[];
    for (var k=0;k<SAMPLES-1;k++){ var b=k*2; idx.push(b,b+1,b+2, b+1,b+3,b+2); }
    ribbonGeo.setIndex(idx);

    var ribbonMat = new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      uniforms:{ uColor:{value:new THREE.Color(0xFFAD3A)}, uOpacity:{value:1.0} },
      vertexShader:[
        'attribute float aV; varying float vV;',
        'void main(){ vV=aV; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }'
      ].join('\n'),
      fragmentShader:[
        'precision mediump float; varying float vV; uniform vec3 uColor; uniform float uOpacity;',
        'void main(){ float d=abs(vV-0.5)*2.0; float a=pow(1.0-d,2.2); gl_FragColor=vec4(uColor, a*uOpacity); }'
      ].join('\n')
    });
    var ribbon = new THREE.Mesh(ribbonGeo, ribbonMat);
    scene.add(ribbon);

    // wide soft halo (a second ribbon, thicker + softer) for layered bloom — full tier only
    var haloPos=null, haloGeo=null, haloMat=null;
    if (Q.halo){
      haloGeo = new THREE.BufferGeometry();
      haloPos = new Float32Array(SAMPLES*2*3);
      var haloV = new Float32Array(SAMPLES*2);
      for (var hs=0; hs<SAMPLES; hs++){ haloV[hs*2]=0.0; haloV[hs*2+1]=1.0; }
      haloGeo.setAttribute('position', new THREE.BufferAttribute(haloPos,3));
      haloGeo.setAttribute('aV', new THREE.BufferAttribute(haloV,1));
      var hidx=[]; for (var hk=0; hk<SAMPLES-1; hk++){ var hb2=hk*2; hidx.push(hb2,hb2+1,hb2+2, hb2+1,hb2+3,hb2+2); }
      haloGeo.setIndex(hidx);
      haloMat = new THREE.ShaderMaterial({
        transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
        uniforms:{ uColor:{value:new THREE.Color(0xFF9A1F)}, uOpacity:{value:0.5} },
        vertexShader:'attribute float aV; varying float vV; void main(){ vV=aV; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
        fragmentShader:'precision mediump float; varying float vV; uniform vec3 uColor; uniform float uOpacity; void main(){ float d=abs(vV-0.5)*2.0; float a=pow(1.0-d,1.4); gl_FragColor=vec4(uColor, a*uOpacity); }'
      });
      scene.add(new THREE.Mesh(haloGeo, haloMat));
    }

    // crisp core
    var coreGeo = new THREE.BufferGeometry();
    var corePos = new Float32Array(SAMPLES*3);
    coreGeo.setAttribute('position', new THREE.BufferAttribute(corePos,3));
    var coreMat = new THREE.LineBasicMaterial({ color:0xFFD9A0, transparent:true, opacity:0.95 });
    var core = new THREE.Line(coreGeo, coreMat);
    scene.add(core);

    // leading dot
    var dotGeo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0,0,0)]);
    var dotMat = new THREE.PointsMaterial({ color:0xFFE9C8, size: IS_TOUCH?8:14, sizeAttenuation:false, transparent:true, opacity:0.9 });
    var dot = new THREE.Points(dotGeo, dotMat);
    scene.add(dot);

    // soft glowing "scan head" sprite riding the leading edge — full tier only
    var head=null;
    if (Q.head){
      var hc=document.createElement('canvas'); hc.width=hc.height=64;
      var hg=hc.getContext('2d');
      var grd=hg.createRadialGradient(32,32,0,32,32,32);
      grd.addColorStop(0,'rgba(255,236,206,1)');
      grd.addColorStop(0.28,'rgba(255,173,58,0.7)');
      grd.addColorStop(1,'rgba(255,173,58,0)');
      hg.fillStyle=grd; hg.fillRect(0,0,64,64);
      var htex=new THREE.CanvasTexture(hc);
      var hmat=new THREE.SpriteMaterial({ map:htex, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:0.9 });
      head=new THREE.Sprite(hmat);
      var hsc = IS_TOUCH ? 1.0 : 1.5; head.scale.set(hsc,hsc,1);   // smaller on phones so it never blooms behind the role line
      scene.add(head);
    }

    var W=1,H=1;
    function resize(){
      var r = stage.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, DPRMAX));
      renderer.setSize(W, H, false);
      camera.aspect = W/H; camera.updateProjectionMatrix();
      // full-bleed: compute world half-width visible at z=0
      var vH = 2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.position.z;
      XSPAN = vH*camera.aspect*1.06;
      ASPK = Math.min(1, Math.max(0.55, camera.aspect/1.6));
      // size the docked bar canvas
      DPR2 = Math.min(window.devicePixelRatio||1, 2);
      barW = barCanvas.clientWidth || window.innerWidth;
      barH = barCanvas.clientHeight || barPx;
      barCanvas.width = Math.round(barW*DPR2);
      barCanvas.height = Math.round(barH*DPR2);
      bctx.setTransform(DPR2,0,0,DPR2,0,0);
      measureLane();
    }

    // Pointer-driven parallax has been removed by request: moving the mouse no
    // longer shifts the wave or the scene sideways. The hero now breathes on its
    // own with a calm, automatic, time-based drift (see frame()).
    var phase=0, last=performance.now();
    function frame(now){
      var dt = Math.min(0.05,(now-last)/1000); last=now;
      phase += dt*P.speed*SCOPE_SPEED*(1 + scrollVel*0.8);   // a flick makes the trace race (≤1.8×), then settle — mild enough for trackpad inertia
      scrollVel *= Math.pow(0.03, dt);   // ~1s to settle

      // gentle automatic ambient drift (no pointer coupling, no horizontal pan):
      // a slow vertical float + a faint inward "breath" so the scope feels alive
      // without ever yanking the scene sideways. Eases out as the hero docks.
      var amb = REDUCED ? 0 : (1 - P.dock);
      camera.position.x = 0;
      camera.position.y = Math.sin(phase*0.45) * 0.09 * amb;
      camera.position.z = 9 + (Math.cos(phase*0.32) - 1) * 0.10 * amb;
      camera.lookAt(0,0,0);

      computeWave();

      // only pay for the 3D render while the hero (its only window) is visible
      if (P.dock < 0.985) renderer.render(scene,camera);

      // draw the docked strip's live 2D oscilloscope (cheap), once it's fading in
      if (P.dock > 0.02) drawBar();

      // telemetry readout (three value nodes; DOM writes only on change)
      if (teleF){
        var tf = P.freq.toFixed(2), ta = P.amp.toFixed(2), tn = P.noise>0.4 ? ' · ' + T('noise') : '';
        if (tf !== teleLastF){ teleF.textContent = tf; teleLastF = tf; }
        if (ta !== teleLastA){ teleA.textContent = ta; teleLastA = ta; }
        if (tn !== teleLastN){ teleN.textContent = tn; teleLastN = tn; }
      }
      raf = requestAnimationFrame(frame);
    }

    function computeWave(){
      var dockAmp = 1 - P.dock*0.55;
      gmat.opacity = Q.gridOp*(1-P.dock);
      grid.visible = P.dock < 0.98;
      ribbonMat.uniforms.uOpacity.value = (0.95 - P.dock*0.25) * P.glow;
      if (haloMat) haloMat.uniforms.uOpacity.value = (0.55 - P.dock*0.25) * P.glow;
      coreMat.opacity = 0.98;

      var halfX = XSPAN/2;
      var amp = P.amp*1.7*dockAmp*ASPK;   // portrait: one calm swing through the name instead of two full-height peaks
      var fq  = P.freq*(0.6 + 0.4*ASPK);
      var thick = (0.15 + P.amp*0.05) * (1 - P.dock*0.45);
      var thickH = thick*2.9;
      var lastY=0, lastX=0;
      for (var s=0;s<SAMPLES;s++){
        var u = s/(SAMPLES-1);
        var x = -halfX + u*XSPAN;
        // blend two shapes for smooth section morphs; gentle multi-rate drift for life
        var ph = (u*Math.PI*2*fq) + phase*2.4 + Math.sin(phase*0.6)*0.3 + Math.sin(phase*0.27)*0.15;
        var yA = shapeVal(P.fromShape, ph);
        var yB = shapeVal(P.shape, ph);
        var base = yA + (yB-yA)*P.morph;
        if (P.noise>0.001){
          var nx = u*42 + phase*9.0;
          base += vnoise(nx)*P.noise*0.9 + vnoise(nx*2.3)*P.noise*0.4;
        }
        var y = base*amp;
        corePos[s*3]=x; corePos[s*3+1]=y; corePos[s*3+2]=0;
        var bi=s*2*3;
        ribbonPos[bi]  =x; ribbonPos[bi+1]=y+thick; ribbonPos[bi+2]=0;
        ribbonPos[bi+3]=x; ribbonPos[bi+4]=y-thick; ribbonPos[bi+5]=0;
        if (haloPos){
          haloPos[bi]  =x; haloPos[bi+1]=y+thickH; haloPos[bi+2]=0;
          haloPos[bi+3]=x; haloPos[bi+4]=y-thickH; haloPos[bi+5]=0;
        }
        lastY=y; lastX=x;
      }
      coreGeo.attributes.position.needsUpdate=true;
      ribbonGeo.attributes.position.needsUpdate=true;
      if (haloGeo) haloGeo.attributes.position.needsUpdate=true;
      dotGeo.attributes.position.array[0]=lastX;
      dotGeo.attributes.position.array[1]=lastY;
      dotGeo.attributes.position.needsUpdate=true;
      dotMat.opacity = 0.9*(1-P.dock*0.4);
      if (head){ head.position.set(lastX,lastY,0.02); head.material.opacity = 0.9*(1-P.dock*0.6); }
    }

    function drawBar(){
      bctx.clearRect(0,0,barW,barH);
      var low = (laneX1 - laneX0) < 120;                 // no room between the mark and the readouts → a floor band under the labels
      var x0 = low ? 0 : laneX0, x1 = low ? barW : laneX1;
      var mid = low ? barH - 11 : barH/2;
      var amp = (low ? 5 : mid*0.40) * P.amp;
      bctx.globalAlpha = P.glow;                          // dips briefly on retune (see tuneTo)
      // soft glow pass + crisp pass, each faded out at both ends of the lane
      for (var pass=0; pass<2; pass++){
        var g = bctx.createLinearGradient(x0,0,x1,0);
        var c = pass===0 ? '255,173,58' : '255,201,119', a = pass===0 ? .22 : .9;
        g.addColorStop(0,'rgba('+c+',0)'); g.addColorStop(.14,'rgba('+c+','+a+')');
        g.addColorStop(.86,'rgba('+c+','+a+')'); g.addColorStop(1,'rgba('+c+',0)');
        bctx.beginPath();
        for (var x=x0; x<=x1; x+=2){
          var u = x/barW;
          var ph = (u*Math.PI*2*P.freq*1.4) + phase*2.4;
          var yA = shapeVal(P.fromShape, ph);
          var yB = shapeVal(P.shape, ph);
          var base = yA + (yB-yA)*P.morph;
          if (P.noise>0.001){ base += vnoise(u*42 + phase*9.0)*P.noise*0.7; }
          var py = mid - base*amp;
          if (x===x0) bctx.moveTo(x,py); else bctx.lineTo(x,py);
        }
        bctx.lineWidth = pass===0 ? 3.2 : 1.4; bctx.strokeStyle = g; bctx.stroke();
      }
      // lane terminators: a short tick at each end of the trace lane, so the trace reads as a
      // bounded scope window rather than a line that stops dead before the readout
      if (!low){
        bctx.fillStyle = 'rgba(255,173,58,.55)';
        bctx.fillRect(Math.round(x0), Math.round(mid-6), 1, 12);
        bctx.fillRect(Math.round(x1), Math.round(mid-6), 1, 12);
      }
      bctx.globalAlpha = 1;
    }

    var raf=null, running=false;
    function start(){ if(running) return; running=true; last=performance.now(); raf=requestAnimationFrame(frame); }
    function stop(){ running=false; if(raf) cancelAnimationFrame(raf); }
    document.addEventListener('visibilitychange', function(){ if(document.hidden) stop(); else start(); });

    return { resize:resize, start:start, stop:stop, renderOnce:function(){ phase = 0.6; computeWave(); renderer.render(scene,camera); } };
  })(); } catch(e){ if(window.console) console.warn('Scope init failed; continuing without WebGL:', e); Scope = null; }

  /* =================================================================
     RESIZE wiring + boot
     ================================================================= */
  function sizeStageVar(){ /* set --bar in px already; nothing dynamic */ }
  if (Scope){
    Scope.resize();
    Scope.start();
    var ro = ('ResizeObserver' in window) ? new ResizeObserver(function(){ Scope.resize(); }) : null;
    if (ro) ro.observe(stage);
    window.addEventListener('resize', function(){ Scope.resize(); }, {passive:true});
    window.addEventListener('orientationchange', function(){ setTimeout(function(){Scope.resize();},200); });
  }

  /* ---------- generated instrument chrome (band names, trace captions) ----------
     The words are English in the markup; i18n.js translates them per word for the current language
     (BMJ_I18N.chrome) and fires 'bmj:lang' on a switch, so everything below re-renders in place. */
  function T(word){ return (window.BMJ_I18N && window.BMJ_I18N.chrome) ? window.BMJ_I18N.chrome(word) : word; }
  // 'CH·04 — SYSTEMS' → <b>CH·04</b><span class="nm"> — SISTEMAS</span>; a 'BUILD / BREAK / LEAD' list translates word by word
  function bandHTML(band, cls){
    var parts = (band || 'CH·00').split(' — ');
    var name = parts[1] ? parts[1].split(' / ').map(T).join(' / ') : '';
    return '<b>' + parts[0] + '</b>' + (name ? '<span class="' + cls + '"> — ' + name + '</span>' : '');
  }
  var SHAPE_NAMES = ['SINE', 'SQUARE', 'TRIANGLE', 'PULSE', 'STEP'];

  /* section rule readouts: generated from the section's own data-band (or data-rule where the rule should
     describe more than the entry band — the channels section spans CH·01–03), so the rule and the docked
     strip always print the same codes (one numbering system, no page index) */
  var secRules = Array.prototype.slice.call(document.querySelectorAll('main > section.section'));
  function renderRules(){
    secRules.forEach(function(sec){
      var sn = sec.querySelector('.s-head .s-n'); if (!sn) return;
      sn.innerHTML = bandHTML(sec.getAttribute('data-rule') || sec.getAttribute('data-band'), 'nm');
    });
  }
  /* channel trace captions: 'SQUARE · f 3.20 · A 0.86' — the strip's own f/A vocabulary, read from the
     article's data-* so the caption and the strip agree when that channel is tuned */
  var chTeles = Array.prototype.slice.call(document.querySelectorAll('.channel .ch-tele'));
  function renderCaptions(){
    chTeles.forEach(function(el){
      var art = el.closest ? el.closest('[data-band]') : null; if (!art) return;
      var shp = parseInt(art.getAttribute('data-shape')||'0',10), nz = parseFloat(art.getAttribute('data-noise')||'0');
      el.innerHTML = '<b>' + T(SHAPE_NAMES[shp] || SHAPE_NAMES[0]) + '</b> · f <b>' + parseFloat(art.getAttribute('data-freq')||'2').toFixed(2) +
                     '</b> · A <b>' + parseFloat(art.getAttribute('data-amp')||'1').toFixed(2) + '</b>' + (nz > 0.4 ? ' · ' + T('noise') : '');
    });
  }
  renderRules(); renderCaptions();
  document.addEventListener('bmj:lang', function(){ renderRules(); renderCaptions(); teleLastN = ''; });   // '' forces the strip's noise flag to re-print next frame

  /* hero readout: the year count is computed from the start year so it never goes stale ('2023 → now' is live) */
  (function(){
    var yrs = document.querySelector('.readout .rd-v b'); if (!yrs) return;
    var n = Math.max(3, new Date().getFullYear() - 2023);
    yrs.textContent = (n < 10 ? '0' : '') + n;
  })();

  /* work cards: the bullet lists sit in <details class="sys-more" open>. Desktop keeps them open
     (the summary is hidden in CSS); on phones the two job cards start closed so head + summary + tags stay
     scannable (the security card carries data-keep and stays open: its domains are the differentiator),
     and a native summary tap expands them. Runs before the ScrollTriggers are built so their positions are
     measured against the collapsed height; later USER toggles refresh them. */
  (function(){
    var ds = Array.prototype.slice.call(document.querySelectorAll('details.sys-more'));
    if (!ds.length || !window.matchMedia) return;
    var mq = window.matchMedia('(max-width:600px)');
    function sync(fromChange){
      ds.forEach(function(d){
        var want = !mq.matches || d.hasAttribute('data-user') || d.hasAttribute('data-keep');
        // 'toggle' fires (async) only when the state really changes — flag exactly those, so the
        // listener can tell a programmatic sync from a reader's tap (and never marks data-user for it)
        if (d.open !== want){ d._sync = true; d.open = want; }
      });
      if (fromChange && window.ScrollTrigger) ScrollTrigger.refresh();   // one refresh per rotation, not one per card
    }
    sync(false);
    var onChange = function(){ sync(true); };
    if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    ds.forEach(function(d){
      d.addEventListener('toggle', function(){
        if (d._sync){ d._sync = false; return; }
        if (mq.matches) d.setAttribute('data-user', '1');   // a card the reader opened stays open across a rotation
        if (window.ScrollTrigger) ScrollTrigger.refresh();
      });
    });
  })();

  /* =================================================================
     GSAP — hero intro, dock, per-section morph, reveals
     ================================================================= */
  if (window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize:true });   // the address-bar collapse no longer refreshes every trigger mid-scroll
    if (!REDUCED){
      // scroll velocity → the shared phase (frame()): the trace races with a flick and settles with the page
      ScrollTrigger.create({ start:0, end:'max', onUpdate:function(self){ scrollVel = Math.min(1, Math.abs(self.getVelocity())/4000); } });
    }

    var topbarEl = document.getElementById('topbar');

    /* hero name reveal — always animates: a slide reveal normally, a gentle fade under reduced motion */
    if (!REDUCED){
      var tl = gsap.timeline({ delay:0.12 });
      tl.fromTo('.hero-mid .name .ln > span', { yPercent:115 }, { yPercent:0, duration:1.05, ease:'expo.out', stagger:0.09 })
        .fromTo('.hero-mid .role', { opacity:0, y:14 }, { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.5')
        .fromTo('.hero-top .id', { opacity:0, y:-10 }, { opacity:1, y:0, duration:0.6, ease:'power2.out', stagger:0.08 }, '-=0.6')
        .fromTo('.hero-bot', { opacity:0, y:16 }, { opacity:1, y:0, duration:0.7, ease:'power2.out' }, '-=0.4');
    } else {
      // reduced motion: gentle fade-in (no large positional motion) — still clearly animated
      gsap.set('.hero-mid .name .ln > span', { yPercent:0 });
      gsap.fromTo('.hero-mid .name .ln > span', { opacity:0 }, { opacity:1, duration:0.9, ease:'power2.out', stagger:0.08, delay:0.1 });
      gsap.fromTo(['.hero-mid .role','.hero-top .id','.hero-bot'], { opacity:0 }, { opacity:1, duration:0.9, ease:'power2.out', stagger:0.06, delay:0.25 });
    }

    /* DOCK: the full-screen 3D scope fades out while the signal strip DOCKS — it slides in from above as a
       solid panel over the last 30% of the hero scroll, so its readouts never crossfade through the lede and
       CTA underneath (an opacity fade from 35% did exactly that for a whole scroll beat). Reduced motion keeps
       the panel still and fades it over the same short window (no positional motion). */
    ScrollTrigger.create({
      trigger:'#hero', start:'top top', end:'bottom top', scrub:0.5,
      onUpdate:function(self){
        var d = self.progress;
        P.dock = d;
        canvas.style.opacity = (1 - d);             // fade out the 3D layer
        var bar = Math.max(0, (d-0.7)/0.3);          // 0 → 1 over the last 30%
        if (REDUCED) gsap.set('#topbar', { opacity: bar, yPercent: 0 });
        else gsap.set('#topbar', { opacity: bar > 0 ? 1 : 0, yPercent: -100*(1-bar) });
        // only let the docked strip capture clicks/focus once it's half in (i18n.js gates on the same 85%
        // of the hero; its controls + lang switch are gated on this class in i18n.css)
        if (topbarEl) topbarEl.classList.toggle('is-docked', bar > 0.5);
      }
    });

    /* per-section waveform morph */
    function readBand(el){
      return {
        band: el.getAttribute('data-band') || 'CH·00',
        shape: parseInt(el.getAttribute('data-shape')||'0',10),
        freq: parseFloat(el.getAttribute('data-freq')||'2'),
        amp: parseFloat(el.getAttribute('data-amp')||'1'),
        noise: parseFloat(el.getAttribute('data-noise')||'0.05')
      };
    }
    var lastRetune = -1e9, tuned = false, curBand = 'CH·00 — CARRIER';
    // <b>code</b> + a hide-sm name, so phones keep 'CH·02' and the dot belongs to something; re-rendered on a language switch
    function renderBand(){ if (teleBand) teleBand.innerHTML = bandHTML(curBand, 'hide-sm'); }
    document.addEventListener('bmj:lang', renderBand);
    function tuneTo(cfg){
      // crossfade shape
      P.fromShape = P.shape;
      P.morph = 0;
      P.shape = cfg.shape;
      curBand = cfg.band; renderBand();
      gsap.killTweensOf(P);   // prevent stacked/jittering tweens when scrolling fast
      P.glow = 1;             // a kill mid-dip must never leave the trace dimmed
      gsap.to(P, { morph:1, duration:0.7, ease:'power2.inOut', overwrite:'auto' });
      gsap.to(P, { freq:cfg.freq, amp:cfg.amp, noise:cfg.noise, duration:1.0, ease:'power2.inOut', overwrite:'auto' });
      // retune flicker: a brief glow dip (ribbon, halo and strip share P.glow) + the strip readouts blink
      var now = performance.now();
      if (tuned && !REDUCED && now - lastRetune > 600){   // boot tune is silent; a fast flick gets one dip, not seven
        lastRetune = now;
        gsap.fromTo(P, { glow:0.45 }, { glow:1, duration:0.55, ease:'power2.out' });
        if (topbarEl){ topbarEl.classList.remove('retune'); void topbarEl.offsetWidth; topbarEl.classList.add('retune'); }
      }
      tuned = true;
    }
    var sections = Array.prototype.slice.call(document.querySelectorAll('[data-band]'));
    sections.forEach(function(sec){
      ScrollTrigger.create({
        trigger:sec, start:'top center', end:'bottom center',
        onEnter:function(){ tuneTo(readBand(sec)); },
        onEnterBack:function(){ tuneTo(readBand(sec)); }
      });
    });

    /* reveals */
    gsap.utils.toArray('.reveal').forEach(function(el){
      ScrollTrigger.create({
        trigger:el, start:'top 86%', once:true,
        onEnter:function(){ el.classList.add('in'); }
      });
    });

    ScrollTrigger.refresh();
  } else {
    // no gsap: just show everything
    document.querySelectorAll('.reveal').forEach(function(e){ e.classList.add('in'); });
  }

  /* =================================================================
     small 2D waveforms — 'Other signals' cards (sine | pulse: one static frame,
     unchanged look) and the per-channel traces (data-wf="shape:N": the article's
     own data-shape/freq/amp/noise drawn with the scope's shapeVal/vnoise).
     Channel traces animate only on fine pointers, only while on screen, at 30fps;
     touch and reduced-motion get one static frame.
     ================================================================= */
  (function(){
    var cards = Array.prototype.slice.call(document.querySelectorAll('canvas.wf'));
    var LIVE = !REDUCED && !IS_TOUCH && ('IntersectionObserver' in window);
    var FPS = 30;
    cards.forEach(function(cv){
      var kind = cv.getAttribute('data-wf') || 'sine';
      var shp  = kind.indexOf('shape:') === 0 ? parseInt(kind.slice(6),10) : -1;
      var host = (shp >= 0 && cv.closest) ? cv.closest('[data-band]') : null;
      var cfg  = {
        freq:  host ? Math.min(6, parseFloat(host.getAttribute('data-freq')||'2')) : 2,
        amp:   host ? parseFloat(host.getAttribute('data-amp')||'1') : 1,
        noise: host ? parseFloat(host.getAttribute('data-noise')||'0') : 0
      };
      var live = LIVE && shp >= 0;
      var ctx = cv.getContext('2d'), w = 0, h = 0, ph = 0.4, lastT = 0, raf = null, inView = false, hov = false;
      function size(){
        var dpr = Math.min(window.devicePixelRatio||1, 2);
        w = cv.clientWidth; h = cv.clientHeight||34;
        cv.width = Math.round(w*dpr); cv.height = Math.round(h*dpr);
        ctx.setTransform(dpr,0,0,dpr,0,0);
      }
      function sample(u){
        if (shp >= 0){
          var y = shapeVal(shp, u*Math.PI*2*cfg.freq*0.9 + ph)*0.85*cfg.amp;
          if (cfg.noise > 0.001) y += vnoise(u*42 + ph*3.5)*cfg.noise*0.55;
          return Math.max(-1, Math.min(1, y));
        }
        if (kind === 'pulse'){ var t = (u*4)%1; return (Math.exp(-t*6)*Math.sin(t*Math.PI*2*1.5))*1.3; }
        return Math.sin(u*Math.PI*2*2.2);
      }
      function trace(step){
        ctx.beginPath();
        for (var x=0; x<=w; x+=step){
          var py = h/2 - sample(x/w)*(h/2-4);
          if (x===0) ctx.moveTo(x,py); else ctx.lineTo(x,py);
        }
      }
      function draw(){
        if (!w) return;                                   // hidden canvas: nothing to draw
        ctx.clearRect(0,0,w,h);
        if (!live){                                       // static frame: the original glow look
          ctx.lineWidth = 1.6; ctx.strokeStyle = '#FFAD3A'; ctx.shadowColor = 'rgba(255,173,58,.7)'; ctx.shadowBlur = 8;
          trace(1); ctx.stroke(); return;
        }
        ctx.shadowBlur = 0;                               // animated: two strokes, no per-frame software blur
        ctx.lineWidth = 5;   ctx.strokeStyle = 'rgba(255,173,58,.18)'; trace(2); ctx.stroke();
        ctx.lineWidth = 1.6; ctx.strokeStyle = hov ? '#FFC677' : '#FFAD3A'; trace(2); ctx.stroke();
      }
      function loop(t){
        raf = null; if (!inView) return;
        if (t - lastT >= 1000/FPS){ lastT = t; ph += 0.045*(hov ? 2 : 1); draw(); }
        raf = requestAnimationFrame(loop);
      }
      size(); draw();
      if (live){
        if (host){
          host.addEventListener('mouseenter', function(){ hov = true; });
          host.addEventListener('mouseleave', function(){ hov = false; });
        }
        new IntersectionObserver(function(en){
          inView = en[0].isIntersecting;
          if (inView && !raf) raf = requestAnimationFrame(loop);
        }, { threshold:0.1 }).observe(cv);
      }
      window.addEventListener('resize', function(){ size(); draw(); }, {passive:true});
    });
  })();
})();
