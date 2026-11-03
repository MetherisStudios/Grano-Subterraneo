/* =========================================================
   Grano Subterráneo · funciones de la web
   ---------------------------------------------------------
   TODO LO QUE SE CAMBIA SEGUIDO ESTÁ EN "CONFIG", ACÁ ABAJO.
   No hace falta tocar nada más del archivo.
   ========================================================= */
const CONFIG = {
  // WhatsApp: número completo con código de país, sin + ni espacios. Ej: "59899123456".
  // Mientras esté vacío, los botones usan el link de Instagram (wa.link) y el
  // mensaje armado se copia para que el visitante lo pegue.
  whatsapp: "",
  whatsappLink: "https://wa.link/3aozlh",

  // Clave de Web3Forms (se crea con el mail del comercio en web3forms.com)
  web3formsKey: "",

  direccion: "Calle 22 esq. Calle 1 y 11, Atlántida, Canelones",
  busquedaMapa: "Grano Subterráneo, Arquitecto Walter Gonzalez 41, Atlántida, Canelones",

  // Link directo para dejar reseña en Google (Perfil de empresa > "Pedir opiniones").
  // Si queda vacío, se abre la ficha del local en Google Maps.
  googleResena: "",
  ratingGoogle: "4,8",

  instagram: "https://www.instagram.com/granosubterraneo/",
  tiktok: "https://www.tiktok.com/@grano.subterraneo",
  pedidosYa: "", // pegar el link completo de PedidosYa; si queda vacío, el botón no aparece

  // Horarios: "HH:MM-HH:MM". Día sin turnos = cerrado.
  horarios: {
    lunes: [],
    martes: ["15:00-20:30"],
    miercoles: ["09:00-12:30", "15:00-20:30"],
    jueves: ["09:00-12:30", "15:00-20:30"],
    viernes: ["09:00-12:30", "15:00-20:30"],
    sabado: ["09:00-12:30", "15:00-20:30"],
    domingo: ["09:00-12:30", "15:00-20:30"],
  },
  zonaHoraria: "America/Montevideo",
};

/* ---------- utilidades ---------- */
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DIAS_TXT = { domingo: "Domingo", lunes: "Lunes", martes: "Martes", miercoles: "Miércoles", jueves: "Jueves", viernes: "Viernes", sabado: "Sábado" };
const DIAS_CORTO = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const ORDEN = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];

const aMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const aHora = (min) => `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
const turnos = (dia) => (CONFIG.horarios[dia] || []).map((t) => t.split("-").map(aMin));
const txtTurnos = (dia) => (CONFIG.horarios[dia] || []).length ? CONFIG.horarios[dia].map((t) => t.replace("-", " a ")).join(" · ") : "Cerrado";

/* Fecha y hora actual en Uruguay, aunque el visitante esté en otro huso */
function ahoraUY() {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-US", {
    timeZone: CONFIG.zonaHoraria, year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", hour12: false,
  }).formatToParts(new Date()).map((x) => [x.type, x.value]));
  const fecha = new Date(+p.year, +p.month - 1, +p.day);
  return { fecha, minutos: (+p.hour % 24) * 60 + +p.minute };
}

/* ---------- WhatsApp ---------- */
function linkWA(texto) {
  const n = CONFIG.whatsapp.replace(/\D/g, "");
  if (n) return `https://wa.me/${n}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;
  return CONFIG.whatsappLink;
}
async function abrirWA(texto) {
  let copiado = false;
  if (!CONFIG.whatsapp && texto && navigator.clipboard) {
    try { await navigator.clipboard.writeText(texto); copiado = true; } catch (e) { /* sin permiso */ }
  }
  window.open(linkWA(texto), "_blank", "noopener");
  return copiado;
}

/* ---------- intro, header y navegación ---------- */
function iniciarIntro() {
  document.body.classList.add("cargando");
  const fin = () => {
    $("#intro").classList.add("fuera");
    document.body.classList.remove("cargando");
    document.body.classList.add("listo");
    $$(".portada .revelar").forEach((el) => el.classList.add("visible"));
  };
  const ya = sessionStorageSeguro("intro-vista");
  setTimeout(fin, ya ? 300 : 2000);
  sessionStorageSeguro("intro-vista", "1");
}
function sessionStorageSeguro(k, v) {
  try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
}

function iniciarHeader() {
  const header = $("#header");
  const boton = $("#hamburguesa");
  const menu = $("#menu");
  addEventListener("scroll", () => header.classList.toggle("con-sombra", scrollY > 10), { passive: true });
  boton.addEventListener("click", () => {
    const abierto = boton.getAttribute("aria-expanded") === "true";
    boton.setAttribute("aria-expanded", String(!abierto));
    menu.classList.toggle("abierto", !abierto);
  });
  $$("a", menu).forEach((a) => a.addEventListener("click", () => {
    boton.setAttribute("aria-expanded", "false");
    menu.classList.remove("abierto");
  }));

  // sección activa (menú + indicador de niveles)
  const secciones = ["inicio", "carta", "tu-cafe", "eventos", "el-lugar", "visitanos", "reservar"].map((id) => document.getElementById(id));
  const obs = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      $$(".menu a").forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === "#" + id));
      $$(".niveles a").forEach((a) => a.classList.toggle("activo", a.dataset.nivel === id));
      document.body.classList.toggle("sobre-oscuro", id === "tu-cafe");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  secciones.forEach((s) => s && obs.observe(s));

  // revelado suave
  const rev = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("visible"); rev.unobserve(e.target); } });
  }, { threshold: 0.15 });
  $$(".revelar").forEach((el) => { if (!el.closest(".portada")) rev.observe(el); });
}

/* ---------- datos del comercio en la página ---------- */
function cargarDatos() {
  const mapsBusqueda = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.busquedaMapa);
  const comoLlegar = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(CONFIG.busquedaMapa);

  $$("[data-direccion]").forEach((el) => (el.textContent = CONFIG.direccion));
  $$("[data-rating]").forEach((el) => (el.textContent = CONFIG.ratingGoogle));
  $$("[data-como-llegar]").forEach((a) => (a.href = comoLlegar));
  $$("[data-resena]").forEach((a) => (a.href = CONFIG.googleResena || mapsBusqueda));
  $$("[data-instagram]").forEach((a) => (a.href = CONFIG.instagram));
  $$("[data-tiktok]").forEach((a) => (a.href = CONFIG.tiktok));
  $$("[data-pedidosya]").forEach((a) => { if (CONFIG.pedidosYa) { a.href = CONFIG.pedidosYa; a.hidden = false; } });

  $$("[data-wa]").forEach((a) => {
    a.href = linkWA(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // el mapa se carga recién cuando el visitante se acerca, para que la web abra rápido
  const mapa = $("#mapa");
  const obs = new IntersectionObserver((e) => {
    if (e[0].isIntersecting) {
      mapa.src = "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.busquedaMapa) + "&z=16&output=embed";
      obs.disconnect();
    }
  }, { rootMargin: "400px" });
  obs.observe(mapa);

  $("#anio").textContent = new Date().getFullYear();
}

/* ---------- horarios y "abierto ahora" ---------- */
function iniciarHorarios() {
  const { fecha, minutos } = ahoraUY();
  const hoy = DIAS[fecha.getDay()];

  $("#horarios").innerHTML = ORDEN.map((d) =>
    `<tr class="${d === hoy ? "hoy" : ""}"><td>${DIAS_TXT[d]}</td><td>${txtTurnos(d)}</td></tr>`).join("");

  // pie: agrupa los días con el mismo horario
  const grupos = [];
  ORDEN.forEach((d) => {
    const t = txtTurnos(d);
    const ult = grupos[grupos.length - 1];
    if (ult && ult.t === t) ult.dias.push(d); else grupos.push({ t, dias: [d] });
  });
  $("#pie-horarios").innerHTML = grupos.map((g) => {
    const nom = g.dias.length > 1 ? `${DIAS_TXT[g.dias[0]]} a ${DIAS_TXT[g.dias[g.dias.length - 1]].toLowerCase()}` : DIAS_TXT[g.dias[0]];
    return `<li><b>${nom}</b> ${g.t}</li>`;
  }).join("");

  actualizarEstado();
  setInterval(actualizarEstado, 60000);
}

function actualizarEstado() {
  const { fecha, minutos } = ahoraUY();
  const hoy = DIAS[fecha.getDay()];
  const t = turnos(hoy);
  const actual = t.find(([a, c]) => minutos >= a && minutos < c);
  let texto, detalle, abierto = !!actual;

  if (actual) {
    const falta = actual[1] - minutos;
    texto = falta <= 30 ? `Abierto · cierra en ${falta} min` : `Abierto ahora · hasta las ${aHora(actual[1])}`;
  } else {
    // próxima apertura
    const luego = t.find(([a]) => a > minutos);
    if (luego) texto = `Cerrado · abre a las ${aHora(luego[0])}`;
    else {
      for (let i = 1; i <= 7; i++) {
        const d = DIAS[(fecha.getDay() + i) % 7];
        const td = turnos(d);
        if (td.length) { texto = `Cerrado · abre ${i === 1 ? "mañana" : DIAS_TXT[d].toLowerCase()} a las ${aHora(td[0][0])}`; break; }
      }
    }
  }
  $$("[data-estado]").forEach((el) => {
    el.classList.toggle("abierto", abierto);
    el.classList.toggle("cerrado", !abierto);
    $("span", el).textContent = texto;
  });

  // dato de la portada
  detalle = t.length ? (abierto ? `hasta las ${aHora(actual[1])}` : txtTurnos(hoy).replace(/ a /g, "–")) : "cerrado";
  $("[data-hoy]").textContent = abierto ? "Abierto" : "Hoy";
  $("[data-hoy-detalle]").textContent = detalle;
}

/* ---------- carta ---------- */
function iniciarCarta() {
  const tabs = $$(".carta-tabs [role=tab]");
  const img = $("#carta-img");
  const pie = $("#carta-pie");

  const elegir = (tab, foco) => {
    tabs.forEach((t) => {
      const sel = t === tab;
      t.setAttribute("aria-selected", String(sel));
      t.tabIndex = sel ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !sel;
    });
    if (foco) tab.focus();
    if (img.getAttribute("src") !== tab.dataset.foto) {
      img.classList.add("cambiando");
      setTimeout(() => {
        img.src = tab.dataset.foto;
        img.alt = tab.dataset.pie;
        pie.textContent = tab.dataset.pie;
        img.onload = () => img.classList.remove("cambiando");
        setTimeout(() => img.classList.remove("cambiando"), 400);
      }, 250);
    }
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => elegir(t));
    t.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") elegir(tabs[(i + 1) % tabs.length], true);
      if (e.key === "ArrowLeft") elegir(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
}

/* ---------- tu café: capas y recomendador ---------- */
const CAPAS = {
  cafe: { nombre: "Café", color: "#4A2312" },
  crema: { nombre: "Crema de café", color: "#B9814A" },
  leche: { nombre: "Leche", color: "#E9D8C3" },
  espuma: { nombre: "Espuma de leche", color: "#FFF8EE" },
  agua: { nombre: "Agua", color: "#8FBFD3" },
};
const CAFES = {
  "Espresso": { capas: [["cafe", 26], ["crema", 7]], desc: "Corto e intenso. La base de todo." },
  "Espresso doble": { capas: [["cafe", 46], ["crema", 8]], desc: "Dos shots: el doble de cuerpo." },
  "Cortado": { capas: [["cafe", 32], ["leche", 26], ["espuma", 6]], desc: "Espresso con un toque de leche." },
  "Latte": { capas: [["cafe", 20], ["leche", 58], ["espuma", 14]], desc: "Mucha leche: suave y cremoso." },
  "Americano": { capas: [["cafe", 22], ["agua", 56], ["crema", 6]], desc: "Espresso alargado con agua caliente." },
  "Cappuccino": { capas: [["cafe", 26], ["leche", 30], ["espuma", 32]], desc: "Café, leche y bastante espuma." },
  "Flat white": { capas: [["cafe", 32], ["leche", 46], ["espuma", 6]], desc: "Más café que leche, con espuma finita." },
  "Long black": { capas: [["agua", 50], ["cafe", 26], ["crema", 8]], desc: "Primero el agua, arriba el espresso: conserva la crema." },
};

function iniciarTuCafe() {
  const capasEl = $("#capas");
  const nombreEl = $("#taza-nombre");
  const leyenda = $("#leyenda");
  const chips = $("#cafes-chips");

  // armado fijo de las 5 capas, después solo cambia la altura
  const capaEls = {};
  Object.entries(CAPAS).forEach(([k, c]) => {
    const d = document.createElement("div");
    d.className = "capa"; d.style.background = c.color;
    capaEls[k] = d;
  });

  const mostrar = (nombre) => {
    const cafe = CAFES[nombre];
    if (!cafe) return;
    capasEl.replaceChildren(...cafe.capas.map(([k]) => capaEls[k]));
    Object.values(capaEls).forEach((el) => (el.style.height = "0"));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      cafe.capas.forEach(([k, alto]) => (capaEls[k].style.height = alto + "%"));
    }));
    capasEl.style.height = "100%";
    nombreEl.textContent = nombre;
    leyenda.innerHTML = cafe.capas.slice().reverse()
      .map(([k], i) => `<li style="animation-delay:${i * 80}ms"><i style="background:${CAPAS[k].color}"></i>${CAPAS[k].nombre}</li>`).join("")
      + `<li style="animation-delay:300ms;opacity:.7;font-size:.85rem;max-width:220px">${cafe.desc}</li>`;
    $$("button", chips).forEach((b) => b.classList.toggle("activo", b.textContent === nombre));
  };

  chips.innerHTML = Object.keys(CAFES).map((n) => `<button type="button">${n}</button>`).join("");
  $$("button", chips).forEach((b) => b.addEventListener("click", () => mostrar(b.textContent)));
  capasEl.style.height = "100%";
  mostrar("Cappuccino");

  /* recomendador */
  const RECO = {
    "caliente-nada-natural": ["Long black", "Intenso pero largo, para tomarlo con calma.", "Scon de queso"],
    "caliente-nada-dulce": ["Espresso", "Corto e intenso. El dulce lo pone lo que lo acompaña.", "Alfajor de chocolate blanco con dulce de leche"],
    "caliente-poca-natural": ["Cortado", "Espresso con un toque de leche. Un clásico que no falla.", "Medialuna simple grande"],
    "caliente-poca-dulce": ["Caramel macchiato", "Latte con syrup de caramelo.", "Cookie de chispas de chocolate"],
    "caliente-mucha-natural": ["Cappuccino", "Cremoso y con buena espuma. Si lo querés más suave, pedí un latte.", "Croissant relleno de queso crema, rúcula y bondiola"],
    "caliente-mucha-dulce": ["Latte Subterráneo", "El de autor de la casa: espresso, leche, syrup de dulce de leche, crema batida y salsa de caramelo.", "Roll de canela"],
    "frio-nada-natural": ["Iced americano", "Espresso y agua con hielo. Refrescante y con todo el sabor del café.", "Chipá de jamón y queso"],
    "frio-nada-dulce": ["Iced americano", "Frío y liviano, para acompañar con algo dulce.", "Brownie de chocolate"],
    "frio-poca-natural": ["Iced latte", "Café con leche fría y hielo.", "Scon de queso"],
    "frio-poca-dulce": ["Iced dulce de leche", "Frío, con el dulce justo.", "Cookie de chocolate con dulce de leche"],
    "frio-mucha-natural": ["Iced latte", "Suave y cremoso, con hielo.", "Avocado toast"],
    "frio-mucha-dulce": ["Frappé Subterráneo", "Espresso, leche, syrup de dulce de leche, crema batida y salsa de caramelo.", "Brownie de chocolate"],
    "sincafe-natural": ["Té de blends seleccionados", "Para una pausa tranquila. Si hace calor, probá la Limo Subterránea.", "Budín de limón glaseado"],
    "sincafe-dulce": ["Submarino", "Para los que no toman café. Si hace calor, un smoothie de frutos rojos.", "Medialuna rellena de jamón y queso"],
  };
  const MUESTRA = { "Long black": "Long black", "Espresso": "Espresso", "Cortado": "Cortado", "Cappuccino": "Cappuccino", "Caramel macchiato": "Latte", "Latte Subterráneo": "Latte" };

  const pasos = $$(".pregunta");
  const barras = $$(".buscador-pasos i");
  const resultado = $("#resultado");
  let resp = [];

  const irA = (n) => {
    pasos.forEach((p) => p.classList.toggle("activa", +p.dataset.paso === n));
    barras.forEach((b, i) => b.classList.toggle("activo", i < n));
    resultado.hidden = true;
  };
  pasos.forEach((p) => $$("button", p).forEach((b) => b.addEventListener("click", () => {
    const paso = +p.dataset.paso;
    resp = resp.slice(0, paso - 1);
    resp[paso - 1] = b.dataset.r;
    if (paso === 1 && b.dataset.r === "sincafe") { resp[1] = null; irA(3); return; }
    if (paso < 3) { irA(paso + 1); return; }
    const clave = resp.filter(Boolean).join("-");
    const [nombre, desc, acomp] = RECO[clave] || RECO["caliente-mucha-natural"];
    pasos.forEach((x) => x.classList.remove("activa"));
    barras.forEach((x) => x.classList.add("activo"));
    $("#res-nombre").textContent = nombre;
    $("#res-desc").textContent = desc;
    $("#res-acomp").textContent = acomp;
    resultado.hidden = false;
    if (MUESTRA[nombre]) mostrar(MUESTRA[nombre]);
  })));
  $("#res-otra").addEventListener("click", () => { resp = []; irA(1); });
}

/* ---------- asistente de reserva ---------- */
function iniciarReserva() {
  const estado = { modo: "mesa", personas: 2, dia: null, hora: null, tipo: "Cumpleaños" };
  const diasEl = $("#dias"), horasEl = $("#horas"), preview = $("#preview"), nombre = $("#as-nombre");
  const evPersonas = $("#ev-personas"), evFecha = $("#ev-fecha"), aviso = $("#aviso-wa");
  const fmt = (d) => `${d.getDate()}/${d.getMonth() + 1}`;

  // modos
  const ponerModo = (m) => {
    estado.modo = m;
    $$(".modos button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.modo === m)));
    $$(".modo-panel").forEach((p) => (p.hidden = p.dataset.panel !== m));
    armar();
  };
  $$(".modos button").forEach((b) => b.addEventListener("click", () => ponerModo(b.dataset.modo)));
  $$("[data-modo-evento]").forEach((a) => a.addEventListener("click", () => ponerModo("evento")));

  // personas
  const out = $("#personas");
  $("[data-menos]").addEventListener("click", () => { estado.personas = Math.max(1, estado.personas - 1); out.value = estado.personas; armar(); });
  $("[data-mas]").addEventListener("click", () => {
    if (estado.personas >= 12) { ponerModo("evento"); evPersonas.value = 13; armar(); return; }
    estado.personas++; out.value = estado.personas; armar();
  });

  // próximos días abiertos
  const { fecha, minutos } = ahoraUY();
  const dias = [];
  for (let i = 0; dias.length < 7 && i < 14; i++) {
    const d = new Date(fecha); d.setDate(d.getDate() + i);
    const t = turnos(DIAS[d.getDay()]);
    if (!t.length) continue;
    if (i === 0 && !t.some(([, c]) => c - 30 > minutos + 30)) continue; // hoy ya no quedan horarios
    dias.push({ fecha: d, i });
  }
  diasEl.innerHTML = dias.map((d, k) => {
    const nom = d.i === 0 ? "Hoy" : d.i === 1 ? "Mañana" : DIAS_CORTO[d.fecha.getDay()];
    return `<button type="button" class="chip" data-k="${k}">${nom}<small>${fmt(d.fecha)}</small></button>`;
  }).join("");
  $$(".chip", diasEl).forEach((b) => b.addEventListener("click", () => elegirDia(+b.dataset.k)));

  function elegirDia(k) {
    estado.dia = dias[k]; estado.hora = null;
    $$(".chip", diasEl).forEach((b) => b.classList.toggle("activo", +b.dataset.k === k));
    const t = turnos(DIAS[estado.dia.fecha.getDay()]);
    const slots = [];
    t.forEach(([a, c]) => { for (let m = a; m <= c - 30; m += 30) if (estado.dia.i > 0 || m > minutos + 30) slots.push(m); });
    horasEl.innerHTML = slots.length
      ? slots.map((m) => `<button type="button" class="chip">${aHora(m)}</button>`).join("")
      : `<span class="chips-vacio">No quedan horarios para ese día.</span>`;
    $$(".chip", horasEl).forEach((b) => b.addEventListener("click", () => {
      estado.hora = b.textContent;
      $$(".chip", horasEl).forEach((x) => x.classList.toggle("activo", x === b));
      armar();
    }));
    armar();
  }
  if (dias.length) elegirDia(0);

  // evento
  const hoyISO = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-${String(fecha.getDate()).padStart(2, "0")}`;
  evFecha.min = hoyISO;
  $$("#tipo-evento .chip").forEach((b) => b.addEventListener("click", () => {
    estado.tipo = b.textContent;
    $$("#tipo-evento .chip").forEach((x) => x.classList.toggle("activo", x === b));
    armar();
  }));
  [nombre, evPersonas, evFecha].forEach((el) => el.addEventListener("input", armar));

  function mensaje() {
    const n = nombre.value.trim();
    if (estado.modo === "mesa") {
      const dia = estado.dia ? `${DIAS_TXT[DIAS[estado.dia.fecha.getDay()]].toLowerCase()} ${fmt(estado.dia.fecha)}` : "(elegí un día)";
      return `Hola! Quiero reservar una mesa en Grano Subterráneo.\n• Personas: ${estado.personas}\n• Día: ${dia}\n• Hora: ${estado.hora || "(elegí una hora)"}\n• A nombre de: ${n || "(tu nombre)"}`;
    }
    let f = "(a definir)";
    if (evFecha.value) { const [y, m, d] = evFecha.value.split("-"); f = `${+d}/${+m}/${y}`; }
    return `Hola! Quiero consultar por un evento con Grano Subterráneo.\n• Tipo: ${estado.tipo}\n• Personas (aprox.): ${evPersonas.value || "(a definir)"}\n• Fecha: ${f}\n• Nombre: ${n || "(tu nombre)"}`;
  }
  function armar() { preview.textContent = mensaje(); }
  armar();

  $("#enviar-wa").addEventListener("click", async () => {
    aviso.classList.remove("ok");
    const n = nombre.value.trim();
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]{2,40}$/.test(n)) {
      aviso.textContent = "Escribí tu nombre (solo letras) para la reserva.";
      nombre.focus(); return;
    }
    if (estado.modo === "mesa" && (!estado.dia || !estado.hora)) {
      aviso.textContent = "Elegí el día y la hora."; return;
    }
    const copiado = await abrirWA(mensaje());
    aviso.classList.add("ok");
    aviso.textContent = copiado
      ? "Copiamos tu mensaje: pegalo en el chat de WhatsApp que se abrió y envialo."
      : "Se abrió WhatsApp con tu mensaje. La reserva queda confirmada cuando te respondan.";
  });
}

/* ---------- formulario ---------- */
function iniciarFormulario() {
  const form = $("#formulario");
  const estadoEl = $("#form-estado");
  const boton = $("#f-enviar");
  $("#f-key").value = CONFIG.web3formsKey;

  const LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' ]+$/;
  const reglas = {
    "f-nombre": (v) => !v ? "Escribí tu nombre." : !LETRAS.test(v) ? "Usá solo letras, sin números ni símbolos." : v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "").length < 2 ? "El nombre es muy corto." : "",
    "f-apellido": (v) => !v ? "Escribí tu apellido." : !LETRAS.test(v) ? "Usá solo letras, sin números ni símbolos." : v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "").length < 2 ? "El apellido es muy corto." : "",
    "f-correo": (v) => !v ? "Escribí tu correo." : !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? "Revisá el correo, por ejemplo: nombre@gmail.com" : "",
    "f-telefono": (v) => {
      const n = v.replace(/[\s\-().]/g, "");
      if (!n) return "Escribí un teléfono para contactarte.";
      return /^(?:\+?598)?(?:0?9\d{7}|[24]\d{7})$/.test(n) ? "" : "Escribí un teléfono uruguayo: celular 09X XXX XXX o fijo de 8 cifras.";
    },
    "f-tipo": (v) => !v ? "Elegí el tipo de consulta." : "",
    "f-mensaje": (v) => {
      if (!v) return "Contanos tu consulta.";
      const letras = v.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
      if (letras.length < 15) return "Contanos un poco más (al menos 15 letras).";
      if (v.split(/\s+/).filter((p) => /[A-Za-zÁÉÍÓÚáéíóúñÑ]{2,}/.test(p)).length < 3) return "Escribí tu consulta con algunas palabras más.";
      if (new Set(letras.toLowerCase()).size < 6 || /(.)\1{5,}/.test(v)) return "El mensaje no parece una consulta. Contanos qué necesitás.";
      return "";
    },
  };

  const validar = (id) => {
    const el = document.getElementById(id);
    const campo = el.closest(".campo");
    const msj = reglas[id](el.value.trim());
    campo.classList.toggle("invalido", !!msj);
    campo.classList.toggle("valido", !msj);
    el.setAttribute("aria-invalid", String(!!msj));
    $(".error", campo).textContent = msj;
    return !msj;
  };
  Object.keys(reglas).forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener("blur", () => el.value && validar(id));
    el.addEventListener("input", () => el.closest(".campo").classList.contains("invalido") && validar(id));
    el.addEventListener("change", () => id === "f-tipo" && validar(id));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    estadoEl.className = "form-estado"; estadoEl.textContent = "";
    const ok = Object.keys(reglas).map(validar).every(Boolean);
    if (!ok) { form.querySelector(".invalido input, .invalido select, .invalido textarea")?.focus(); return; }
    if (!CONFIG.web3formsKey) {
      estadoEl.className = "form-estado mal";
      estadoEl.textContent = "No pudimos enviar la consulta en este momento. Escribinos por WhatsApp.";
      return;
    }
    $("#f-replyto").value = $("#f-correo").value.trim();
    boton.disabled = true; boton.textContent = "Enviando…";
    try {
      const datos = Object.fromEntries(new FormData(form));
      const r = await fetch("https://api.web3forms.com/submit", {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(datos),
      });
      const j = await r.json();
      if (!j.success) throw new Error(j.message);
      form.reset();
      $$(".campo", form).forEach((c) => c.classList.remove("valido", "invalido"));
      estadoEl.className = "form-estado ok";
      estadoEl.textContent = "¡Gracias! Recibimos tu consulta y te respondemos al correo.";
    } catch (err) {
      estadoEl.className = "form-estado mal";
      estadoEl.textContent = "No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.";
    } finally {
      boton.disabled = false; boton.textContent = "Enviar consulta";
    }
  });

  // si viene desde "Eventos", deja elegido el tipo de consulta
  $$("[data-modo-evento]").forEach((a) => a.addEventListener("click", () => { $("#f-tipo").value = "Evento o catering"; }));
}

/* ---------- arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  iniciarIntro();
  cargarDatos();
  iniciarHeader();
  iniciarHorarios();
  iniciarCarta();
  iniciarTuCafe();
  iniciarReserva();
  iniciarFormulario();
});
