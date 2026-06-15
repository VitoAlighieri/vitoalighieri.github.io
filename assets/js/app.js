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
  // Reduced-motion keeps the signature waveform alive but gentle; the jarring
  // motion (name slide-in, parallax, cursor ping, scroll jolts) is dropped below.
  var SCOPE_SPEED = REDUCED ? 0.5 : 1.0;
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
    var dotMat = new THREE.PointsMaterial({ color:0xFFE9C8, size: IS_TOUCH?10:14, sizeAttenuation:false, transparent:true, opacity:0.9 });
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
      head=new THREE.Sprite(hmat); head.scale.set(1.5,1.5,1); scene.add(head);
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
      // size the docked bar canvas
      DPR2 = Math.min(window.devicePixelRatio||1, 2);
      barW = barCanvas.clientWidth || window.innerWidth;
      barH = barCanvas.clientHeight || barPx;
      barCanvas.width = Math.round(barW*DPR2);
      barCanvas.height = Math.round(barH*DPR2);
      bctx.setTransform(DPR2,0,0,DPR2,0,0);
    }

    var mx=0, my=0, tmx=0, tmy=0;
    if (!IS_TOUCH && !REDUCED){
      window.addEventListener('pointermove', function(e){
        tmx = (e.clientX/window.innerWidth)*2-1;
        tmy = (e.clientY/window.innerHeight)*2-1;
      }, {passive:true});
    }

    var phase=0, last=performance.now();
    function frame(now){
      var dt = Math.min(0.05,(now-last)/1000); last=now;
      phase += dt*P.speed*SCOPE_SPEED;

      // ease camera parallax
      mx += (tmx-mx)*0.06; my += (tmy-my)*0.06;
      camera.position.x = mx*0.9*(1-P.dock);
      camera.position.y = -my*0.5*(1-P.dock);
      camera.lookAt(0,0,0);

      computeWave();

      // only pay for the 3D render while the hero (its only window) is visible
      if (P.dock < 0.985) renderer.render(scene,camera);

      // draw the docked strip's live 2D oscilloscope (cheap), once it's fading in
      if (P.dock > 0.02) drawBar();

      // telemetry readout
      if (teleRead){
        teleRead.textContent = 'f '+P.freq.toFixed(2)+' · A '+(P.amp).toFixed(2)+(P.noise>0.4?' · noise':'');
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
      var amp = P.amp*1.7*dockAmp;
      var thick = (0.15 + P.amp*0.05) * (1 - P.dock*0.45);
      var thickH = thick*2.9;
      var lastY=0, lastX=0;
      for (var s=0;s<SAMPLES;s++){
        var u = s/(SAMPLES-1);
        var x = -halfX + u*XSPAN;
        // blend two shapes for smooth section morphs; gentle multi-rate drift for life
        var ph = (u*Math.PI*2*P.freq) + phase*2.4 + Math.sin(phase*0.6)*0.3 + Math.sin(phase*0.27)*0.15;
        var yA = shapeVal(P.fromShape, ph);
        var yB = shapeVal(P.shape, ph);
        var base = yA + (yB-yA)*P.morph;
        if (P.noise>0.001){
          var nx = u*42 + phase*9.0;
          base += vnoise(nx)*P.noise*0.9 + vnoise(nx*2.3)*P.noise*0.4;
        }
        var y = base*amp;
        // cursor "ping": local amplitude bump near pointer (hero only)
        if (!IS_TOUCH && !REDUCED && P.dock<0.5){
          var px = mx*halfX;
          var dd = (x-px); var bump = Math.exp(-(dd*dd)/2.2);
          y += Math.sin(phase*6.0)*bump*0.5*(1-P.dock);
        }
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
      var mid = barH/2;
      var amp = mid*0.62*P.amp;
      // soft glow pass + crisp pass
      for (var pass=0; pass<2; pass++){
        bctx.beginPath();
        for (var x=0; x<=barW; x+=2){
          var u = x/barW;
          var ph = (u*Math.PI*2*P.freq*1.4) + phase*2.4;
          var yA = shapeVal(P.fromShape, ph);
          var yB = shapeVal(P.shape, ph);
          var base = yA + (yB-yA)*P.morph;
          if (P.noise>0.001){ base += vnoise(u*42 + phase*9.0)*P.noise*0.7; }
          var py = mid - base*amp;
          if (x===0) bctx.moveTo(x,py); else bctx.lineTo(x,py);
        }
        if (pass===0){ bctx.lineWidth=3.2; bctx.strokeStyle='rgba(255,173,58,.22)'; }
        else { bctx.lineWidth=1.4; bctx.strokeStyle='rgba(255,201,119,.9)'; }
        bctx.stroke();
      }
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

  /* =================================================================
     GSAP — hero intro, dock, per-section morph, reveals
     ================================================================= */
  if (window.gsap && window.ScrollTrigger){
    gsap.registerPlugin(ScrollTrigger);

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

    /* DOCK: crossfade the full-screen 3D scope into the top signal-strip.
       This is opacity-only (no positional motion), so it runs under reduced motion too. */
    ScrollTrigger.create({
      trigger:'#hero', start:'top top', end:'bottom top', scrub:0.5,
      onUpdate:function(self){
        var d = self.progress;
        P.dock = d;
        canvas.style.opacity = (1 - d);             // fade out the 3D layer
        var bar = Math.max(0, (d-0.35)/0.65);        // strip fades in a touch later
        gsap.set('#topbar', { opacity: bar });
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
    function tuneTo(cfg){
      // crossfade shape
      P.fromShape = P.shape;
      P.morph = 0;
      P.shape = cfg.shape;
      if (teleBand) teleBand.textContent = cfg.band;
      gsap.killTweensOf(P);   // prevent stacked/jittering tweens when scrolling fast
      gsap.to(P, { morph:1, duration:0.7, ease:'power2.inOut', overwrite:'auto' });
      gsap.to(P, { freq:cfg.freq, amp:cfg.amp, noise:cfg.noise, duration:1.0, ease:'power2.inOut', overwrite:'auto' });
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
     small static waveforms in the "Other signals" cards (2D canvas)
     ================================================================= */
  (function(){
    var cards = document.querySelectorAll('canvas.wf');
    cards.forEach(function(cv){
      var kind = cv.getAttribute('data-wf');
      function draw(){
        var dpr = Math.min(window.devicePixelRatio||1, 2);
        var w = cv.clientWidth, h = cv.clientHeight||34;
        cv.width = w*dpr; cv.height = h*dpr;
        var ctx = cv.getContext('2d'); ctx.scale(dpr,dpr);
        ctx.clearRect(0,0,w,h);
        ctx.lineWidth = 1.6; ctx.strokeStyle = '#FFAD3A'; ctx.shadowColor='rgba(255,173,58,.7)'; ctx.shadowBlur=8;
        ctx.beginPath();
        for (var x=0;x<=w;x++){
          var u = x/w, ph = u*Math.PI*2* (kind==='sine'?2.2:3.0), y;
          if (kind==='pulse'){ var t=(u*4)%1; y = (Math.exp(-t*6)*Math.sin(t*Math.PI*2*1.5))*1.3; }
          else { y = Math.sin(ph); }
          var py = h/2 - y*(h/2-4);
          if (x===0) ctx.moveTo(x,py); else ctx.lineTo(x,py);
        }
        ctx.stroke();
      }
      draw();
      window.addEventListener('resize', draw, {passive:true});
    });
  })();
})();
