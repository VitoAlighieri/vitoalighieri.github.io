/* =====================================================================
   I18N — bilingual layer (EN · ES)
   - English is the canonical copy that lives in the HTML (SEO + no-JS).
   - Spanish lives in the dictionary below and is swapped in by data-i18n key.
   - Runs BEFORE app.js, while the hero/sections are still hidden (opacity 0),
     so switching to Spanish never flashes the English copy.
   - The choice is remembered (localStorage) and first-visit language is taken
     from the browser. Honors a clean fallback: a missing key just stays English.
   ===================================================================== */
(function(){
  "use strict";

  var STORE_KEY = 'bmj-lang';
  var SUPPORTED = ['en', 'es'];
  var DEFAULT   = 'en';

  /* ---- document <head> copy (title / meta / open-graph) ---- */
  var META = {
    en: {
      title:   'Biel Martínez Janer — Software engineer · pentester · hardware hacker',
      desc:    'Biel Martínez Janer — software engineer, pentester and hardware hacker, founder & CTO. Building systems end to end and breaking them on purpose. Palma, Balearic Islands.',
      ogTitle: 'Biel Martínez Janer — Software engineer · pentester · hardware hacker',
      ogDesc:  'I work in frequencies: audio, radio, data, and the pulse of a Friday night. Building systems end to end and breaking them on purpose.',
      locale:  'en_US'
    },
    es: {
      title:   'Biel Martínez Janer — Ingeniero de software · pentester · hacker de hardware',
      desc:    'Biel Martínez Janer — ingeniero de software, pentester y hacker de hardware, fundador y CTO. Construyo sistemas de principio a fin y los rompo a propósito. Palma, Islas Baleares.',
      ogTitle: 'Biel Martínez Janer — Ingeniero de software · pentester · hacker de hardware',
      ogDesc:  'Trabajo en frecuencias: audio, radio, datos y el pulso de un viernes por la noche. Construyo sistemas de principio a fin y los rompo a propósito.',
      locale:  'es_ES'
    }
  };

  /* ---- Spanish body copy, keyed by data-i18n.
          Adapted, not literal, where a more natural turn of phrase reads better. ---- */
  var ES = {
    /* hero */
    'hero.signal': '<i class="live"></i>Señal&nbsp;—&nbsp;Activa',
    'hero.place':  'Palma&nbsp;·&nbsp;Islas&nbsp;Baleares',
    'hero.role':   '<i>Ingeniero de software</i><span class="sep">/</span><span>pentester</span><span class="sep">/</span><span>hacker de hardware</span>',
    'hero.lede':   'Construyo sistemas de principio a fin —del firmware en la mesa de trabajo a la plataforma en producción— y los <b>rompo a propósito</b> para encontrar dónde ceden.',
    'hero.scroll': 'desliza',

    /* topbar */
    'topbar.cta': 'ABRIR CANAL ↗',

    /* thesis */
    'thesis.h2': 'Trabajo en <em>frecuencias.</em>',
    'thesis.p1': 'Audio, radio, datos y el pulso de un viernes por la noche. Distintas bandas, una misma forma de pensar: descomponer una señal compleja, entender exactamente cómo se comporta y reconstruirla más limpia.',
    'thesis.p2': 'Eso va desde una <b>frase de violonchelo</b> a una <b>captura de RF</b> o a un flujo de pagos que no puede permitirse perder una sola transacción.',

    /* channels */
    'channels.idx': '[ CANALES ]',
    'channels.h2':  'Lo que sintonizo.',
    'ch01.verb': 'Construir',
    'ch01.h3':   'Software y arquitectura',
    'ch01.body': 'Sistemas full-stack en C#/.NET y Python: modelos de datos, APIs, eventos en tiempo real y despliegue en producción. El trabajo que no se ve —un pipeline de importación que normaliza y valida miles de filas desordenadas, verificación biométrica de identidad, gestión de clientes y proveedores, la capa de datos corporativa sobre la que se sostiene todo lo demás.',
    'ch02.verb': 'Romper',
    'ch02.h3':   'Seguridad ofensiva',
    'ch02.body': 'Seguridad ofensiva práctica en web (OWASP), redes y sistemas, radiofrecuencia y señales, hardware e ingeniería inversa de firmware —y también en sistemas industriales (ICS / OT). Análisis de vulnerabilidades con estándares reconocidos (CVE, CVSS, MITRE ATT&amp;CK), las herramientas clave del sector (Burp Suite, Nmap, Metasploit, Ghidra) junto a las mías en Python/C#, hardening de sistemas, y material de seguridad que escribo para formar a quienes me rodean. Certificado por OffSec, Hack The Box, INE (eJPT) y Black Hat.',
    'ch02.meta': '<span class="tag">web · OWASP</span><span class="tag">redes</span><span class="tag">RF · señales</span><span class="tag">hardware · firmware</span><span class="tag">ICS / OT</span>',
    'ch03.verb': 'Liderar',
    'ch03.h3':   'Fundador y CEO',
    'ch03.body': 'Fundé We Love Night y la dirijo como CEO y CTO —fijando la visión, la estrategia y la hoja de ruta técnica, diseñando el sistema y el modelo de datos y llevando el MVP a producción. Y luego la mitad del trabajo que lo decide todo: dirigir el negocio —plan de negocio, marca, base legal y de propiedad intelectual, captación de inversión y alianzas, el lanzamiento sin una sola incidencia y los clientes de 2026 ya firmados.',
    'ch03.meta': '<span class="tag">producto</span><span class="tag">arquitectura</span><span class="tag">observabilidad</span><span class="tag">go-to-market</span><span class="tag">equipo</span>',

    /* systems */
    'systems.idx': '[ TRABAJO&nbsp;SELECCIONADO ]',
    'systems.h2':  'Sistemas en producción.',

    'sys.wln.role':   'Fundador · CEO · CTO',
    'sys.wln.when':   '2024 → hoy · en producción',
    'sys.wln.sum':    'Una empresa tecnológica que fundé y dirijo, que construye ticketing avanzado, analítica y digitalización de negocio para la economía nocturna —llevada de una página en blanco a un lanzamiento público.',
    'sys.wln.points': '<li>Marco la dirección de la empresa como CEO y CTO —visión, estrategia, hoja de ruta de producto y equipo.</li><li>Dirijo el negocio de principio a fin: estudio de viabilidad, plan de negocio, registro de marca y propiedad intelectual, base legal y de privacidad y materiales para inversores.</li><li>Diseñé toda la arquitectura de software y el modelo de datos y llevé el MVP a producción —con monitorización, pasarelas de pago y analítica en marcha.</li><li>Impulso el go-to-market y las alianzas; aseguré y mantengo la plataforma de producción.</li><li>Dirigí el evento de lanzamiento sin una sola incidencia y cerré clientes clave para 2026.</li>',
    'sys.wln.foot':   '<span class="tag">estrategia</span><span class="tag">go-to-market</span><span class="tag">.NET</span><span class="tag">PostgreSQL</span><span class="tag">pagos</span><span class="tag">Linux</span>',

    'sys.iwp.h3':     'Plataforma web industrial',
    'sys.iwp.role':   'Jefe de proyecto · Desarrollador principal',
    'sys.iwp.when':   'Suministros Jogo · 2023 → hoy',
    'sys.iwp.sum':    'Máximo responsable técnico de una plataforma web que gestiona procesos industriales reales de corte por láser.',
    'sys.iwp.points': '<li>Anidado automático de piezas para corte por láser; procesamiento avanzado de DXF —leer, validar, convertir, optimizar.</li><li>SignalR para eventos en tiempo real; usuarios y roles; pasarelas de pago y facturación autónoma.</li><li>Módulos de seguridad, auditoría y logging avanzado; optimización de rendimiento y despliegue en producción.</li><li>Lideré el proyecto: planificación, coordinación del equipo, UI/UX, arquitectura, modelos de datos y APIs.</li>',
    'sys.iwp.foot':   '<span class="tag">ASP.NET Core</span><span class="tag">DXF · anidado</span><span class="tag">SignalR</span><span class="tag">SQL Server</span>',

    'sys.isw.h3':     'Software industrial',
    'sys.isw.role':   'Desarrollador de software',
    'sys.isw.when':   'Suministros Jogo · 2023 → hoy',
    'sys.isw.sum':    'Automatización, backend, gestión de clientes y proveedores y herramientas internas para una empresa de metalurgia.',
    'sys.isw.points': '<li>Gestión integral de clientes y proveedores —fichas, tarifas, pedidos, facturación y la arquitectura de datos corporativa que hay detrás.</li><li>Importación inteligente de tarifas —normalización, validación estructural y procesamiento masivo.</li><li>Verificación biométrica de identidad; SMS y mailing automatizados; planificador que genera y asigna eventos al personal.</li><li>Visor de documentos y control interno de archivos, tanto on-premise como en la nube.</li>',
    'sys.isw.foot':   '<span class="tag">C# / .NET</span><span class="tag">Python</span><span class="tag">automatización</span><span class="tag">clientes · proveedores</span>',

    'sys.lab.h3':     'Seguridad ofensiva',
    'sys.lab.role':   'Pentesting · red team · investigación',
    'sys.lab.when':   'en curso',
    'sys.lab.sum':    'Trabajo independiente de seguridad ofensiva en toda la pila —de las ondas de radio a la aplicación web y a la planta industrial—, afilado en objetivos reales y laboratorios. Certificado por OffSec, Hack The Box, INE y Black Hat.',
    'sys.lab.points': '<li><b>Web y APIs</b> — pruebas guiadas por OWASP de autenticación, control de acceso y lógica de negocio.</li><li><b>Redes y sistemas</b> — pentesting de infraestructura, pivoting y escalada de privilegios.</li><li><b>Radiofrecuencia y señales</b> — captura y análisis de RF, wireless e IoT (ESP32 / ESP8266).</li><li><b>Hardware y firmware</b> — hardware hacking, extracción de firmware e ingeniería inversa.</li><li><b>Sistemas industriales (ICS / OT)</b> — seguridad de los procesos y plataformas industriales que también construyo.</li><li><b>Análisis de vulnerabilidades</b> — evaluación, triaje y puntuación con estándares reconocidos (CVE, CVSS, OWASP, MITRE ATT&amp;CK).</li><li><b>Hardening</b> — fortificación de sistemas, redes y aplicaciones con configuraciones seguras por defecto.</li><li><b>Herramientas y formación</b> — herramientas clave del sector (Burp Suite, Nmap, Metasploit, Wireshark, Ghidra) junto a las mías en Python/C#; material de seguridad que escribo para formar a otros.</li>',
    'sys.lab.foot':   '<span class="tag">web · OWASP</span><span class="tag">redes</span><span class="tag">RF · señales</span><span class="tag">hardware · firmware</span><span class="tag">ICS / OT</span><span class="tag">CVSS · CVE</span><span class="tag">MITRE ATT&amp;CK</span><span class="tag">hardening</span><span class="tag">Burp · Nmap · Ghidra</span>',

    /* stack */
    'stack.idx': '[ CAPACIDADES ]',
    'stack.h2':  'El banco de trabajo.',
    'stack.h.languages':     'Lenguajes',
    'stack.h.data':          'Datos',
    'stack.h.infra':         'Infra y ops',
    'stack.h.observability': 'Observabilidad',
    'stack.h.security':      'Seguridad',
    'stack.h.design':        'Diseño',
    'stack.ul.data':          '<li>SQL Server</li><li>PostgreSQL</li><li>MySQL</li><li>modelado de datos</li>',
    'stack.ul.observability': '<li>Grafana</li><li>Sentry</li><li>telemetría</li>',
    'stack.ul.security':      '<li>web · OWASP</li><li>redes</li><li>radiofrecuencia</li><li>hardware</li><li>firmware · RE</li><li>wireless · IoT</li><li>ICS / OT</li><li>CVSS · CVE</li><li>MITRE ATT&amp;CK</li><li>hardening</li>',
    'stack.ul.industrial':    '<li>integración de corte por láser</li><li>DXF</li><li>anidado automático</li>',
    'stack.ul.design':        '<li>Figma</li><li>arquitectura UX</li><li>diseño de interacción</li>',

    'creds.cert.h4': 'Certificaciones',
    'creds.cert.ul': '<li><span class="k">SEC</span><span><b>Offensive Hardware Hacking</b> — Black Hat</span></li><li><span class="k">PEN</span><span><b>eJPT</b> — Junior Penetration Tester</span></li><li><span class="k">SEC</span><span><b>OSCC-SEC</b> — OffSec</span></li><li><span class="k">SEC</span><span><b>CJCA</b> — Hack The Box</span></li><li><span class="k">PY</span><span><b>PCEP</b> — Programador Python certificado de nivel inicial</span></li><li><span class="k">NET</span><span>Contenido <b>CCNA</b> completado — Cisco</span></li><li><span class="k">FIN</span><span><b>Finanzas para Directivos No Financieros</b> — ESADE</span></li>',
    'creds.edu.h4': 'Formación y distinciones',
    'creds.edu.ul': '<li><span class="k">BSC</span><span><b>Grado en Ingeniería de Software</b> <span class="sub">· Mención en Computadores</span></span></li><li><span class="k">HON</span><span><b>Matrícula de honor</b> — Seguridad de Redes</span></li><li><span class="k">HON</span><span><b>Matrícula de honor</b> — Álgebra</span></li><li><span class="k">MUS</span><span><b>Título profesional de violonchelo</b> — Conservatori de Mallorca</span></li>',

    /* other signals */
    'signals.idx': '[ FUERA&nbsp;DE&nbsp;HORAS ]',
    'signals.h2':  'Otras señales.',
    'cello.k':  'Baja frecuencia · sostenida',
    'cello.h3': 'Violonchelo',
    'cello.p':  'Un título profesional del Conservatori de Mallorca. Años leyendo una partitura, sosteniendo una línea y aguzando el oído para esa única nota que desafina —el mismo oído que aplico a un sistema.',
    'bball.k':  'Transitorio · alta energía',
    'bball.h3': 'Baloncesto',
    'bball.p':  'Semiprofesional, compitiendo a nivel nacional en 3ª FEB. Donde aprendí a rendir bajo presión, a leer la jugada dos movimientos por delante y a confiar en que un equipo haga su trabajo.',

    /* contact */
    'contact.h2':      'Abre un <em>canal.</em>',
    'contact.sub':     'Vacantes, colaboraciones, trabajo de seguridad o simplemente para intercambiar impresiones sobre hardware. Leo todo lo que llega.',
    'contact.email.k': 'Correo',

    /* footer */
    'footer.colo': 'Ingeniero de software · pentester · hacker de hardware — Palma, Islas Baleares · 2026.<br><b>Tipografía:</b> Anybody, Archivo y JetBrains Mono. <b>Firma:</b> un osciloscopio en vivo renderizado en WebGL; su forma es una onda real que se resintoniza en cada sección. Respeta la preferencia de movimiento reducido.'
  };

  /* ---- cache the canonical English so we can always switch back losslessly ---- */
  var nodes = Array.prototype.slice.call(document.querySelectorAll('[data-i18n]'));
  var EN = {};
  nodes.forEach(function(n){ EN[n.getAttribute('data-i18n')] = n.innerHTML; });

  var titleEl = document.querySelector('title');
  var descEl  = document.querySelector('meta[name="description"]');
  var ogtEl   = document.querySelector('meta[property="og:title"]');
  var ogdEl   = document.querySelector('meta[property="og:description"]');
  var oglEl   = document.querySelector('meta[property="og:locale"]');

  function setMeta(el, val){ if (el && val != null) el.setAttribute('content', val); }

  function apply(lang){
    if (SUPPORTED.indexOf(lang) < 0) lang = DEFAULT;
    var es = (lang === 'es');

    nodes.forEach(function(n){
      var key = n.getAttribute('data-i18n');
      var val = es ? (ES[key] != null ? ES[key] : EN[key]) : EN[key];
      if (val != null && n.innerHTML !== val) n.innerHTML = val;
    });

    var m = META[lang] || META[DEFAULT];
    if (titleEl) titleEl.textContent = m.title;
    setMeta(descEl, m.desc);
    setMeta(ogtEl,  m.ogTitle);
    setMeta(ogdEl,  m.ogDesc);
    setMeta(oglEl,  m.locale);

    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('.lang-opt').forEach(function(b){
      var on = (b.getAttribute('data-lang-set') === lang);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    placeAll();

    current = lang;
  }

  function stored(){
    try { return localStorage.getItem(STORE_KEY); } catch (e){ return null; }
  }
  function remember(lang){
    try { localStorage.setItem(STORE_KEY, lang); } catch (e){}
  }
  function detect(){
    var s = stored();
    if (s && SUPPORTED.indexOf(s) >= 0) return s;
    var nav = (navigator.language || navigator.userLanguage || DEFAULT).toLowerCase();
    return nav.indexOf('es') === 0 ? 'es' : DEFAULT;
  }

  var current = DEFAULT;
  apply(detect());

  /* delegated click handling covers both switch instances (hero + docked strip) */
  document.addEventListener('click', function(e){
    var btn = e.target.closest ? e.target.closest('.lang-opt') : null;
    if (!btn) return;
    var lang = btn.getAttribute('data-lang-set');
    if (SUPPORTED.indexOf(lang) < 0 || lang === current) return;
    remember(lang);
    apply(lang);
  });

  /* ---- the gliding indicator: measure the active option, move the chip ---- */
  function placeIndicator(sw){
    var ind = sw.querySelector('.lang-ind');
    var on  = sw.querySelector('.lang-opt.is-on') || sw.querySelector('.lang-opt');
    if (!ind || !on) return;
    ind.style.width  = on.offsetWidth + 'px';
    ind.style.height = on.offsetHeight + 'px';
    ind.style.transform = 'translate(' + on.offsetLeft + 'px,' + on.offsetTop + 'px)';
  }
  function placeAll(){
    var list = document.querySelectorAll('.lang-switch');
    for (var i=0;i<list.length;i++) placeIndicator(list[i]);
  }
  function enableGlide(){
    placeAll();
    var list = document.querySelectorAll('.lang-switch');
    for (var i=0;i<list.length;i++) list[i].classList.add('lang-ready');
  }
  // place instantly once layout/fonts have settled, then enable the glide so
  // only user-initiated changes animate — never the first paint
  if (document.fonts && document.fonts.ready){ document.fonts.ready.then(enableGlide); }
  window.addEventListener('load', enableGlide);
  setTimeout(enableGlide, 1200);
  window.addEventListener('resize', placeAll, { passive:true });

  /* expose a tiny hook (handy for the console / future controls) */
  window.BMJ_I18N = { set:function(l){ if (SUPPORTED.indexOf(l) >= 0){ remember(l); apply(l); } }, get:function(){ return current; } };
})();

/* ---------------------------------------------------------------------
   DOCK STATE — flag the moment the signal strip has docked in, so its
   controls (mark, OPEN CHANNEL, language switch) only capture clicks and
   focus once it's actually visible. Owned here so the language module
   carries its own interaction gating end to end, with no app.js coupling.
   --------------------------------------------------------------------- */
(function(){
  "use strict";
  var topbar = document.getElementById('topbar');
  var hero = document.getElementById('hero');
  if (!topbar || !hero) return;
  function update(){
    var h = hero.offsetHeight || window.innerHeight || 1;
    var y = window.pageYOffset || document.documentElement.scrollTop || 0;
    topbar.classList.toggle('is-docked', y > h * 0.6);
  }
  update();
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update, { passive:true });
})();

