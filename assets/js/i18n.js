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
      title:   'Biel Martínez Janer — Cybersecurity · Communication · Project leadership',
      desc:    'Cybersecurity in Palma. I test web, networks, RF, hardware and ICS/OT, explain each finding to engineers and management, and map it to ISO 27001, NIS2 and DORA.',
      ogTitle: 'Biel Martínez Janer — Cybersecurity · Communication · Project leadership',
      ogDesc:  'I test systems the way an attacker would, explain each finding in terms your engineers and management can act on, and lead projects end to end.',
      locale:  'en_US',
      mail:    'Open a channel'
    },
    es: {
      title:   'Biel Martínez Janer — Ciberseguridad · Comunicación · Liderazgo de proyectos',
      desc:    'Ciberseguridad en Palma. Pruebo web, redes, RF, hardware e ICS/OT, explico cada hallazgo a técnicos y a dirección y lo traduzco a ISO 27001, NIS2 y DORA.',
      ogTitle: 'Biel Martínez Janer — Ciberseguridad · Comunicación · Liderazgo de proyectos',
      ogDesc:  'Pruebo sistemas como lo haría un atacante, explico cada hallazgo a técnicos y a dirección en su idioma y lidero proyectos de principio a fin.',
      locale:  'es_ES',
      mail:    'Abre un canal'
    }
  };

  /* ---- instrument chrome that app.js generates at runtime (band names in the section rules and the
          docked strip, the shape word and noise flag in the trace captions). These are not data-i18n nodes,
          so they translate through BMJ_I18N.chrome(word); app.js re-renders them on the 'bmj:lang' event. ---- */
  var CHROME_ES = {
    CARRIER:'PORTADORA', BUILD:'CONSTRUIR', BREAK:'ROMPER', LEAD:'LIDERAR', SYSTEMS:'SISTEMAS', STACK:'STACK', SIGNALS:'SEÑALES', TUNING:'SINTONÍA', CONTACT:'CONTACTO',
    SINE:'SENO', SQUARE:'CUADRADA', TRIANGLE:'TRIÁNGULO', PULSE:'PULSO', STEP:'ESCALÓN', noise:'ruido',
    COPIED:'COPIADO', SELECTED:'SELECCIONADO', 'Pause the signal':'Pausar la señal'
  };

  /* ---- Spanish body copy, keyed by data-i18n.
          Adapted, not literal, where a more natural turn of phrase reads better. ---- */
  var ES = {
    /* hero */
    'hero.signal': 'Señal&nbsp;—&nbsp;Activa',
    'hero.hold':   'Señal&nbsp;—&nbsp;En&nbsp;pausa',
    'hero.place':  'Palma<span class="sep">&nbsp;·&nbsp;</span>Islas Baleares',
    'hero.role':   '<span class="ri"><i>Ciberseguridad</i><span class="sep">/</span></span><span class="ri">comunicación<span class="sep">/</span></span><span class="ri">liderazgo de proyectos</span>',
    'hero.scopek':   'Ámbito',
    'hero.scope':    '<span>WEB</span><span>NET</span><span>RF</span><span>HW</span><span>ICS/OT</span>',
    'hero.lede':   'Pruebo tus sistemas como lo haría un atacante, explico cada hallazgo a tu equipo y a tu dirección <b>en su idioma</b> y lidero la corrección hasta que aguante.',
    'hero.cta':    '<span class="cl">Abrir un canal</span><span class="ar" aria-hidden="true">↗</span>',
    'hero.scroll': 'desliza',

    /* topbar */
    'topbar.cta': 'ABRIR CANAL',

    /* thesis */
    'thesis.h2': 'Trabajo en <em>frecuencias.</em>',
    'thesis.p1': 'Audio, radio, datos y el pulso de un viernes por la noche. Distintas bandas, una misma forma de pensar: descomponer una señal compleja, entender exactamente cómo se comporta y reconstruirla más limpia.',
    'thesis.p2': 'Eso va desde una <b>frase de violonchelo</b> a una <b>captura de RF</b> o a un flujo de pagos que no puede permitirse perder una sola transacción.',

    /* channels */
    'channels.h2':  'Lo que hago.',
    'build.verb': 'Construir',
    'build.h3':   'Software y arquitectura',
    'build.body': 'Sistemas full-stack en C#/.NET y Python: modelos de datos, APIs, eventos en tiempo real y despliegue en producción. El trabajo que no se ve —&#8288;un pipeline de importación que normaliza y valida miles de filas desordenadas, verificación biométrica de identidad, gestión de clientes y proveedores, la capa de datos corporativa sobre la que se sostiene todo lo demás.',
    'break.verb': 'Romper',
    'break.h3':   'Seguridad ofensiva',
    'break.body': 'Seguridad ofensiva práctica en web (OWASP), redes y sistemas, radiofrecuencia y señales, hardware e ingeniería inversa de firmware —&#8288;y también en sistemas industriales (ICS / OT). Hallazgos clasificados según CVE y MITRE ATT&amp;CK, puntuados con CVSS, y las herramientas y el hardening necesarios para cerrarlos.',
    'break.meta': '<span class="tag">web / OWASP</span><span class="tag">redes</span><span class="tag">RF / señales</span><span class="tag">hardware / firmware</span><span class="tag">ICS / OT</span>',
    'lead.verb': 'Liderar',
    'lead.h3':   'Proyectos que fundé y lidero',
    'lead.body': '<p>He fundado proyectos propios y los lidero de principio a fin: visión, estrategia, equipo y un MVP en producción desde 2024.</p><p><b>Liderar también es explicar</b>: al equipo, a clientes, a inversores. Por eso llevo la otra mitad: plan de negocio, marca, base legal y de propiedad intelectual, un lanzamiento sin incidencias y clientes clave cerrados para 2026.</p>',
    'lead.meta': '<span class="tag">estrategia</span><span class="tag">equipo</span><span class="tag">producto</span><span class="tag">plan de negocio</span><span class="tag">marca</span>',
    'how.h2': 'Cómo trabajo.',
    'how.intro': 'Cada proyecto pide algo distinto, así que <b>sintonizo con la frecuencia que necesita cada uno</b>.',
    'how.dial.k': 'Adaptación',
    'how.dial.p': 'Firmware, una plataforma o un plan de negocio: cambio el enfoque, nunca el listón.',
    'how.q1.k': 'Detalle',
    'how.q1.p': 'Al píxel y al byte: de un volcado de firmware al maquetado de esta página.',
    'how.q2.k': 'Responsabilidad',
    'how.q2.p': 'Me ciño al alcance acordado, guardo la confidencialidad y respondo de cada prueba.',
    'how.q3.k': 'Revisión',
    'how.q3.p': 'Compruebo, hago retest y vuelvo a revisar: nada se cierra hasta confirmar que aguanta.',
    'how.q4.k': 'Comunicación',
    'how.q4.p': 'Un hallazgo, dos lectores: el arreglo para técnicos, riesgo y obligaciones para dirección.',

    /* systems */
    'systems.h2':  'Sistemas, de cerca.',

    'sys.own.role':   '<span>Fundador</span><span>dirección de proyectos</span>',
    'sys.own.h3': 'Proyectos que fundé y lidero',
    'sys.own.when':   '2024 → hoy · en producción',
    'sys.own.sum':    'Proyectos propios, de la página en blanco al lanzamiento público. Dirijo las dos mitades: el negocio y el sistema que lo sostiene.',
    'sys.own.points': '<li>Marco la dirección&nbsp;—&#8288;visión, estrategia, hoja de ruta de producto y equipo.</li><li>Dirijo el negocio: estudio de viabilidad, plan de negocio, registro de marca y propiedad intelectual, base legal y de privacidad, y materiales para inversores.</li><li>Diseñé la arquitectura de software y el modelo de datos, y llevé el MVP a producción con monitorización y pasarelas de pago en marcha.</li><li>Aseguré la plataforma en producción y me encargo de mantenerla.</li><li>Dirigí el lanzamiento sin una sola incidencia y cerré clientes clave para 2026.</li>',
    'sys.own.foot':   '<span class="tag">estrategia</span><span class="tag">plan de negocio</span><span class="tag">equipo</span><span class="tag">.NET</span><span class="tag">PostgreSQL</span><span class="tag">pagos</span>',
    /* phone-only 'show / hide detail' control on each work card (one key per card: data-i18n keys are unique) */
    'sys.own.more':   '<span class="show">Ver detalle</span><span class="less">Ocultar detalle</span>',
    'sys.jogo.more':  '<span class="show">Ver detalle</span><span class="less">Ocultar detalle</span>',
    'sys.lab.more':   '<span class="show">Ver detalle</span><span class="less">Ocultar detalle</span>',

    /* one Suministros Jogo tenure&nbsp;— the groups block is a single key so the swap keeps its h4/ul structure */
    'sys.jogo.h3':     'Plataforma y software industrial',
    'sys.jogo.role':   '<span>Responsable técnico</span><span>Desarrollador de software</span>',
    'sys.jogo.when':   'Suministros Jogo · 2023 → hoy',
    'sys.jogo.sum':    'Máximo responsable técnico de la plataforma web que gestiona procesos industriales reales de corte por láser —&#8288;y de la automatización, el backend y las herramientas internas de una empresa metalúrgica. Planificación, coordinación del equipo, UI/UX, arquitectura, modelos de datos y APIs.',
    'sys.jogo.points': '<div class="sys-g"><h4>Plataforma</h4><ul class="sys-points"><li>Anidado automático de piezas para corte por láser; procesamiento avanzado de DXF —&#8288;leer, validar, convertir, optimizar.</li><li>SignalR para eventos en tiempo real; usuarios y roles; pasarelas de pago y facturación autónoma.</li><li>Módulos de seguridad, auditoría y logging avanzado; optimización de rendimiento y despliegue en producción.</li></ul></div><div class="sys-g"><h4>Automatización y herramientas</h4><ul class="sys-points"><li>Gestión integral de clientes y proveedores —&#8288;fichas, tarifas, pedidos, facturación y la arquitectura de datos corporativa que hay detrás.</li><li>Importación inteligente de tarifas —&#8288;normalización, validación estructural y procesamiento masivo.</li><li>Verificación biométrica de identidad; SMS y mailing automatizados; un planificador que genera y asigna eventos al personal.</li><li>Visor de documentos y control interno de archivos, on-premise y en la nube.</li></ul></div>',
    'sys.jogo.foot':   '<span class="tag">ASP.NET Core</span><span class="tag">SignalR</span><span class="tag">SQL Server</span><span class="tag">DXF / anidado</span><span class="tag">C# / .NET</span><span class="tag">Python</span>',

    'sys.lab.h3':     'Seguridad ofensiva',
    'sys.lab.role':   '<span>Pentesting</span><span>red team</span><span>investigación</span>',
    'sys.lab.when':   'en curso',
    'sys.lab.sum':    'Seguridad ofensiva en toda la pila —&#8288;de las ondas de radio a la aplicación web y a la planta industrial&#8288;—, sobre los sistemas industriales que construyo en Suministros Jogo y en proyectos propios, curtida en objetivos reales y en laboratorio. Certificado por OffSec, Hack The Box e INE; formado en Black Hat.',
    'sys.lab.points': '<li><b>Web y APIs</b>&nbsp;— pruebas guiadas por OWASP de autenticación, control de acceso y lógica de negocio.</li><li><b>Redes y sistemas</b>&nbsp;— pentesting de infraestructura, pivoting y escalada de privilegios.</li><li><b>Radiofrecuencia y señales</b>&nbsp;— captura y análisis de RF, wireless e IoT (ESP32 / ESP8266).</li><li><b>Hardware y firmware</b>&nbsp;— hardware hacking, extracción de firmware e ingeniería inversa.</li><li><b>Sistemas industriales (ICS / OT)</b>&nbsp;— seguridad de los procesos y plataformas industriales que también construyo.</li><li><b>Análisis de vulnerabilidades</b>&nbsp;— evaluación, triaje y puntuación con estándares reconocidos (CVE, CVSS, OWASP, MITRE ATT&amp;CK).</li><li><b>Hardening</b>&nbsp;— fortificación de sistemas, redes y aplicaciones con configuraciones seguras por defecto.</li><li><b>Normativa y estándares</b>&nbsp;— ISO/IEC 27001 (SGSI, controles del Anexo A), NIS2, DORA y RGPD; traduzco los hallazgos técnicos a las obligaciones que activan.</li><li><b>Herramientas y formación</b>&nbsp;— herramientas clave del sector (Burp Suite, Nmap, Metasploit, Wireshark, Ghidra) junto a mis propias herramientas de automatización de auditorías en Python/C#; formación interna en seguridad que preparo para el equipo.</li>',

    /* stack */
    'stack.h2':  'Stack y formación.',
    'stack.h.languages':     'Lenguajes',
    'stack.h.data':          'Datos',
    'stack.h.infra':         'Infra y ops',
    'stack.h.observability': 'Observabilidad',
    'stack.h.security':      'Seguridad',
    'stack.h.design':        'Diseño',
    'stack.ul.data':          '<li>SQL Server</li><li>PostgreSQL</li><li>MySQL</li><li>modelado de datos</li>',
    'stack.ul.observability': '<li>Grafana</li><li>Sentry</li><li>telemetría</li>',
    'stack.ul.security':      '<li>web / OWASP</li><li>redes</li><li>RF / wireless / IoT</li><li>hardware / firmware</li><li>ICS / OT</li><li>hardening</li><li>ISO/IEC 27001</li><li>NIS2 / DORA / RGPD</li>',
    'stack.ul.industrial':    '<li>integración de corte por láser</li><li>DXF</li><li>anidado automático</li>',
    'stack.ul.design':        '<li>Figma</li><li>arquitectura UX</li><li>diseño de interacción</li>',

    'creds.cert.h4': 'Certificaciones y formación',
    'creds.cert.ul': '<li><span class="k">SEC</span><span><b>Offensive Hardware Hacking</b>&nbsp;— Black Hat</span></li><li><span class="k">PEN</span><span><b>eJPT</b>&nbsp;— Junior Penetration Tester, INE</span></li><li><span class="k">SEC</span><span><b>OSCC-SEC</b>&nbsp;— OffSec</span></li><li><span class="k">SEC</span><span><b>CJCA</b>&nbsp;— Hack The Box</span></li><li><span class="k">PY</span><span><b>PCEP</b>&nbsp;— Programador Python certificado de nivel inicial</span></li><li><span class="k">NET</span><span>Contenido <b>CCNA</b> completado&nbsp;— Cisco</span></li><li><span class="k">FIN</span><span><b>Programa Finanzas para no Financieros</b>&nbsp;— ESADE</span></li>',
    'creds.edu.h4': 'Formación y distinciones',
    'creds.edu.ul': '<li><span class="k">BSC</span><span><b>Grado en Ingeniería del Software</b> <span class="sub">Mención en Computadores</span></span></li><li><span class="k">HON</span><span><b>Matrícula de honor</b>&nbsp;— Seguridad en Redes · Álgebra</span></li><li><span class="k">MUS</span><span><b>Título profesional de violonchelo</b>&nbsp;— Conservatori de Mallorca</span></li>',

    /* other signals */
    'signals.h2':  'Otras señales.',
    'cello.k':  'Baja frecuencia · sostenida',
    'cello.h3': 'Violonchelo',
    'cello.p':  'Un título profesional del Conservatori de Mallorca. Años leyendo una partitura, sosteniendo una línea y aguzando el oído para esa única nota que desafina —&#8288;el mismo oído que aplico a un sistema.',
    'bball.k':  'Transitorio · alta energía',
    'bball.h3': 'Baloncesto',
    'bball.p':  'Semiprofesional, compitiendo a nivel nacional en 3ª FEB. Donde aprendí a rendir bajo presión, a leer la jugada dos movimientos por delante y a confiar en que un equipo haga su trabajo.',

    /* contact */
    'contact.h2':      'Abre un <em>canal.</em>',
    'contact.sub':     '¿Tienes un sistema que poner a prueba o proteger, o un puesto en ciberseguridad que cubrir? Cuéntame qué es, el alcance aproximado y tus plazos: leo todo lo que llega.',
    'contact.email.k': 'Correo',
    'contact.github.note': 'Repos públicos&nbsp;— scrapers, herramientas de pentesting, microservicios y el código de esta web.',

    /* footer (closing readout) */
    'footer.top':     '↑&nbsp;Arriba',
    'footer.sig.k':   'Señal',
    'footer.sig.v':   '<span>Ciberseguridad</span><span>comunicación</span><span>liderazgo de proyectos</span>',
    'footer.type.k':  'Tipografía',
    'footer.trace.k': 'Traza',
    'footer.trace.v': 'Un osciloscopio WebGL en vivo: una onda real que se resintoniza en cada sección y se queda quieta si activas el movimiento reducido.',
    'footer.loc':     'Palma, Islas Baleares · <span class="yr">2026</span>',
    'footer.eot':     'Fin de la transmisión',

    /* phone chrome: tuner dock, channel index, channel deck, copy, touch hint */
    'tuner.open':      'Abrir el índice de canales',
    'ix.title':        'Índice&nbsp;de&nbsp;canales',
    'ix.hero':         'Inicio',
    'ix.hero.sub':     'Perfil · tesis',
    'ix.channels':     'Lo que hago',
    'ix.channels.sub': 'Seguridad · software · proyectos',
    'ix.method': 'Cómo trabajo',
    'ix.method.sub': 'Según el proyecto',
    'ix.ch01':         'Romper',
    'ix.ch02':         'Construir',
    'ix.ch03':         'Liderar',
    'ix.systems':      'Sistemas',
    'ix.systems.sub':  'Trabajo seleccionado',
    'ix.stack':        'Stack',
    'ix.stack.sub':    'Herramientas · títulos',
    'ix.signals':      'Señales',
    'ix.signals.sub':  'Chelo · baloncesto',
    'ix.contact':      'Contacto',
    'ix.contact.sub':  'Correo · GitHub · LinkedIn',
    'ix.copy':         'Copiar correo',
    'ix.close':        'Cerrar el índice',
    'deck.ch01':       'Romper',
    'deck.ch02':       'Construir',
    'deck.ch03':       'Liderar',
    'deck.swipe':      'Desliza para resintonizar',
    'contact.copy':    'Copiar',
    'contact.copy.sr':   ' la dirección de correo',
    'ix.name':           'Índice de canales',
    'deck.pager':        'Canales',
    'hero.touch':      'Toca la señal'
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
    document.querySelectorAll('a[data-mail]').forEach(function(a){ a.setAttribute('href', 'mailto:' + a.getAttribute('data-mail') + '?subject=' + encodeURIComponent(m.mail)); });

    document.querySelectorAll('.lang-opt').forEach(function(b){
      var on = (b.getAttribute('data-lang-set') === lang);
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    current = lang;
    // let app.js re-render the chrome it generates (band names, trace captions) in the new language
    try { document.dispatchEvent(new CustomEvent('bmj:lang', { detail:{ lang:lang } })); } catch (e){}
  }
  /* translate one word of generated instrument chrome for the current language (English is the identity) */
  function chrome(word){ return (current === 'es' && CHROME_ES[word] != null) ? CHROME_ES[word] : word; }

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
    retune(lang);
  });

  /* on phones a reader's switch reads as a RETUNE: where View Transitions exist (and motion is welcome) the old copy
     dims while the new language scans in from the top and the name glides to its new place (i18n.css). Desktop and
     tablets keep the approved instant swap. The new state is a live snapshot, so the scope keeps running. set() stays instant. */
  var RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var PHONE = window.matchMedia ? window.matchMedia('(max-width:720px)') : { matches:false };
  var edge = null;   // the bright scan edge that rides the reveal: it exists only in the NEW state, so only it animates in
  function retune(lang){
    var root = document.documentElement;
    if (RM || !PHONE.matches || !document.startViewTransition){ apply(lang); return; }
    if (!edge){ edge = document.createElement('div'); edge.className = 'vt-edge'; edge.setAttribute('aria-hidden', 'true'); }
    root.classList.add('vt-lang');
    try {
      var vt = document.startViewTransition(function(){ document.body.appendChild(edge); apply(lang); });
      var done = function(){ root.classList.remove('vt-lang'); if (edge.parentNode) edge.parentNode.removeChild(edge); };
      vt.finished.then(done, done);
    } catch (err){ root.classList.remove('vt-lang'); apply(lang); }
  }

  /* ---- the gliding chip is pure CSS (i18n.css: it follows html[lang]) — nothing to measure, so nothing can drift.
     Its glide is only switched on once the page has settled, so only a reader's own switch ever animates it. ---- */
  function enableGlide(){
    var list = document.querySelectorAll('.lang-switch');
    for (var i=0;i<list.length;i++) list[i].classList.add('lang-ready');
  }
  if (document.fonts && document.fonts.ready){ document.fonts.ready.then(enableGlide); }
  window.addEventListener('load', enableGlide);
  setTimeout(enableGlide, 1200);

  /* expose a tiny hook (handy for the console / future controls) */
  window.BMJ_I18N = { set:function(l){ if (SUPPORTED.indexOf(l) >= 0){ remember(l); apply(l); } }, get:function(){ return current; }, chrome:chrome };
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
    var docked = y > h * 0.85;   // the strip slides in over the last 30% of the hero (app.js); it is half in at 85%
    topbar.classList.toggle('is-docked', docked);
    // until it has docked the strip is invisible (opacity 0): keep it out of the tab order and the accessibility tree,
    // so Tab never lands on a control nobody can see (index.html starts it inert; no-JS keeps it inert)
    if (docked) topbar.removeAttribute('inert'); else topbar.setAttribute('inert', '');
  }
  update();
  window.addEventListener('scroll', update, { passive:true });
  window.addEventListener('resize', update, { passive:true });
})();

