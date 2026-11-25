/* =========================================================
   The Cosmo Studio · Arma tu paquete de clickers (mayoreo)
   Página estática: sin servidor, sin pagos en línea.
   ========================================================= */
(function () {
  "use strict";

  // ---------- Datos fijos (no cambiar) ----------
  const PALETTE = [
    { name: "Rojo",       hex: "#E53935" },
    { name: "Naranja",    hex: "#F26D21" },
    { name: "Amarillo",   hex: "#F9C80E", light: true },
    { name: "Beige",      hex: "#E8DCC8", light: true },
    { name: "Blanco",     hex: "#FFFFFF", light: true, border: true },
    { name: "Azul claro", hex: "#8CBEEB", light: true },
    { name: "Azul rey",   hex: "#1D4ED8" },
    { name: "Morado",     hex: "#7C3AED" },
    { name: "Negro",      hex: "#1A1A1A" }
  ];

  // kind: "dual" = base + teclas · "single" = 1 color · "fixed" = color fijo
  // labels: nombre de cada parte que se pinta · layers: capa de imagen -> color que la pinta
  const MODELS = [
    { id: "consola",   name: "Consola",   kind: "dual",
      labels: { base: "Cuerpo", top: "Pantalla" }, layers: { cuerpo: "base", pantalla: "top" } },
    { id: "waffle",    name: "Waffle",    kind: "fixed", fixedNote: "beige/café con amarillo" },
    { id: "doble",     name: "Doble",     kind: "dual",
      labels: { base: "Cuerpo", top: "Teclas" }, layers: { cuerpo: "base", teclas: "top" } },
    { id: "dumpling",  name: "Dumpling",  kind: "fixed", fixedNote: "beige/café con blanco" },
    { id: "estrella",  name: "Estrella",  kind: "single",
      labels: { base: "Color" }, layers: { pieza: "base" } },
    { id: "corazon",   name: "Corazón",   kind: "dual",
      labels: { base: "Cuerpo y tapa", top: "Letras" }, layers: { "cuerpo-y-tapa": "base", letras: "top" } },
    { id: "cuadruple", name: "Cuádruple", kind: "dual", locked: true,
      labels: { base: "Cuerpo", top: "Teclado" }, layers: { cuerpo: "base", teclado: "top" } }
  ];

  const PACKS = [
    { id: "surtido", name: "Pack Surtido", pieces: 24,  price: 931,  old: 1095, off: 15, combos: 1,
      base: { consola: 6,  waffle: 4,  doble: 4,  dumpling: 4,  estrella: 3,  corazon: 2, cuadruple: 1 } },
    { id: "tienda",  name: "Pack Tienda",  pieces: 48,  price: 1643, old: 2190, off: 25, combos: 2,
      base: { consola: 12, waffle: 8,  doble: 8,  dumpling: 8,  estrella: 6,  corazon: 4, cuadruple: 2 } },
    { id: "grande",  name: "Pack Grande",  pieces: 100, price: 2736, old: 4560, off: 40, combos: 4,
      base: { consola: 25, waffle: 17, doble: 17, dumpling: 17, estrella: 12, corazon: 8, cuadruple: 4 } }
  ];

  const CONDITIONS = [
    "60% de anticipo",
    "Entrega de 15 a 20 días hábiles",
    "Consulta el precio sugerido",
    "Pedidos por Instagram: @thecosmostudio.mx"
  ];
  const IG_CHAT = "https://ig.me/m/thecosmostudio.mx";

  // ---------- Estado ----------
  const state = { pack: null, qty: {}, variants: {}, nombre: "", view: {} };

  // ---------- Utilidades ----------
  const $ = (s) => document.querySelector(s);
  const money = (n) => "$" + n.toLocaleString("en-US");
  const img = (id) => "img/thumb-" + id + ".jpg";
  const model = (id) => MODELS.find((m) => m.id === id);
  const isCustom = (m) => m.kind !== "fixed";
  const sumQty = () => MODELS.reduce((a, m) => a + (state.qty[m.id] || 0), 0);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function emptyVariant() { return { qty: 0, base: null, top: null }; }

  // La combinación 1 siempre se queda con lo que no se asignó a las demás.
  function rebalance(id) {
    const v = state.variants[id];
    if (!v) return;
    const total = state.qty[id];
    let others = v.slice(1).reduce((a, x) => a + x.qty, 0);
    for (let i = v.length - 1; i >= 1 && others > total; i--) {
      const cut = Math.min(v[i].qty, others - total);
      v[i].qty -= cut; others -= cut;
    }
    v[0].qty = total - others;
  }

  // ---------- Paso 1: packs ----------
  function renderPacks() {
    $("#packs").innerHTML = PACKS.map((p) => {
      const content = MODELS.map((m) => p.base[m.id] + " " + m.name).join(" · ");
      return `<button type="button" class="pack pack--${p.id}" data-pack="${p.id}" role="radio" aria-checked="false">
        <div class="pack__head"><h3>${p.name}</h3><p>${p.pieces} piezas</p></div>
        <div class="pack__body">
          <div class="pack__price">${money(p.price)}</div>
          <div class="pack__old"><s>${money(p.old)}</s><span class="badge">-${p.off}%</span></div>
          <p class="pack__content">${content}</p>
          <p class="pack__content"><strong>${p.combos} ${p.combos === 1 ? "combinación" : "combinaciones"}</strong> de colores</p>
        </div>
      </button>`;
    }).join("");
    $("#packs").addEventListener("click", (e) => {
      const b = e.target.closest("[data-pack]");
      if (b) selectPack(b.dataset.pack);
    });
  }

  function selectPack(id) {
    const p = PACKS.find((x) => x.id === id);
    if (state.pack && state.pack.id === id) return;
    // Conserva los colores ya elegidos en lo posible.
    const prev = state.variants;
    state.pack = p;
    state.qty = Object.assign({}, p.base);
    state.variants = {};
    MODELS.filter(isCustom).forEach((m) => {
      const arr = [];
      for (let i = 0; i < p.combos; i++) {
        const old = prev[m.id] && prev[m.id][i];
        arr.push({ qty: 0, base: old ? old.base : null, top: old ? old.top : null });
      }
      state.variants[m.id] = arr;
      rebalance(m.id);
    });
    document.querySelectorAll(".pack").forEach((el) => {
      const on = el.dataset.pack === id;
      el.classList.toggle("is-selected", on);
      el.setAttribute("aria-checked", on ? "true" : "false");
    });
    renderQty();
    renderColors();
    update();
    setTimeout(() => $("#paso-2").scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  // ---------- Paso 2: cantidades ----------
  function renderQty() {
    $("#qty-list").innerHTML = MODELS.map((m) => {
      const note = m.locked
        ? `<span class="tag tag--lock">Cantidad fija</span>`
        : m.kind === "fixed" ? `<span class="tag">color fijo</span>` : "";
      return `<div class="qty-row" data-model="${m.id}">
        <img class="thumb" src="${img(m.id)}" alt="${m.name}" loading="lazy">
        <div class="qty-row__info"><div class="qty-row__name">${m.name}</div><div class="qty-row__note">${note}</div></div>
        <div class="stepper">
          ${m.locked ? "" : `<button type="button" data-step="-1" aria-label="Quitar ${m.name}">−</button>`}
          <output>${state.qty[m.id]}</output>
          ${m.locked ? "" : `<button type="button" data-step="1" aria-label="Agregar ${m.name}">+</button>`}
        </div>
      </div>`;
    }).join("");
  }

  function onQtyClick(e) {
    const b = e.target.closest("[data-step]");
    if (!b) return;
    const id = b.closest("[data-model]").dataset.model;
    const m = model(id);
    if (m.locked) return;
    const d = Number(b.dataset.step);
    const next = state.qty[id] + d;
    if (next < 0) return;
    if (d > 0 && sumQty() >= state.pack.pieces) return;
    state.qty[id] = next;
    rebalance(id);
    renderColors();
    update();
  }

  // ---------- Paso 3: colores ----------
  function swatchRow(label, modelId, vi, key, selected) {
    const sel = selected != null ? PALETTE[selected].name : "elige uno";
    return `<div class="swatch-row">
      <div class="swatch-row__label">${label}: <em>${sel}</em></div>
      <div class="swatches" role="radiogroup" aria-label="${label}">
        ${PALETTE.map((c, i) => `<button type="button" class="swatch${c.border ? " swatch--blanco" : ""}${c.light ? " swatch--light" : ""}${selected === i ? " is-on" : ""}"
            style="background:${c.hex}" data-model="${modelId}" data-vi="${vi}" data-key="${key}" data-color="${i}"
            role="radio" aria-checked="${selected === i}" aria-label="${c.name}" title="${c.name}"></button>`).join("")}
      </div>
    </div>`;
  }

  // Combinación que se ve (pestaña activa) de cada modelo.
  function activeTab(id) { return Math.min(state.view[id] || 0, state.pack.combos - 1); }

  function renderColors() {
    if (!state.pack) return;
    const n = state.pack.combos;
    $("#combo-hint").textContent = n === 1
      ? "Tu pack incluye 1 combinación: todas las piezas de cada modelo salen del mismo color."
      : `Tu pack incluye ${n} combinaciones: reparte las piezas de cada modelo entre las pestañas "Combinación 1 a ${n}".`;

    $("#color-list").innerHTML = MODELS.map((m) => {
      const q = state.qty[m.id];
      if (m.kind === "fixed") {
        return `<div class="model-card is-fixed">
          <div class="model-card__head">
            <img class="model-card__photo" src="${img(m.id)}" alt="${m.name}" loading="lazy">
            <div><h3 class="model-card__name">${m.name} <span class="tag">color fijo</span></h3>
            <div class="model-card__qty">${q} ${q === 1 ? "pieza" : "piezas"} · viene en sus colores de siempre (${m.fixedNote})</div></div>
          </div>
          <div class="preview3d preview3d--fixed">
            <div class="preview3d__head"><span>Vista previa ✨</span><span class="tag">color fijo</span></div>
            <img class="preview3d__fixed" src="${PREVIEW_DIR}${m.id}-frente.png" alt="${m.name} en sus colores de siempre" loading="lazy">
          </div>
        </div>`;
      }
      if (q === 0) {
        return `<div class="model-card is-fixed">
          <div class="model-card__head">
            <img class="model-card__photo" src="${img(m.id)}" alt="${m.name}" loading="lazy">
            <div><h3 class="model-card__name">${m.name}</h3><div class="model-card__qty">0 piezas · no lo incluiste</div></div>
          </div></div>`;
      }
      const v = state.variants[m.id];
      const t = activeTab(m.id);
      const x = v[t];
      // Pestañas de combinación (solo packs de 48 y 100)
      let tabs = "", ctrl = "";
      if (n > 1) {
        tabs = `<div class="tabs${n === 4 ? " tabs--4" : ""}" role="tablist" aria-label="Combinaciones de ${m.name}">
          ${v.map((y, i) => `<button type="button" role="tab" class="tab${i === t ? " is-on" : ""}${y.qty === 0 ? " is-empty" : ""}"
              aria-selected="${i === t}" data-tab="${i}" data-model="${m.id}">
              <span class="tab__name">Combinación ${i + 1}</span>
              <span class="tab__meta">${y.qty} pz ${dot(y.base)}${m.kind === "dual" ? dot(y.top) : ""}</span>
            </button>`).join("")}
        </div>`;
        ctrl = t === 0
          ? `<div class="combo__head"><span class="combo__title">Piezas en esta combinación</span><span class="combo__auto">${x.qty}</span></div>
             <p class="combo__help">La combinación 1 se queda con las piezas que no repartas en las otras.</p>`
          : `<div class="combo__head"><span class="combo__title">Piezas en esta combinación</span>
              <div class="stepper">
                <button type="button" data-vstep="-1" data-model="${m.id}" data-vi="${t}" ${x.qty === 0 ? "disabled" : ""} aria-label="Quitar pieza de la combinación ${t + 1}">−</button>
                <output>${x.qty}</output>
                <button type="button" data-vstep="1" data-model="${m.id}" data-vi="${t}" ${v[0].qty === 0 ? "disabled" : ""} aria-label="Agregar pieza a la combinación ${t + 1}">+</button>
              </div></div>`;
      }
      const L = m.labels;
      const rows = m.kind === "single"
        ? swatchRow(L.base, m.id, t, "base", x.base)
        : swatchRow(L.base, m.id, t, "base", x.base) + swatchRow(L.top, m.id, t, "top", x.top);
      const sub = m.kind === "single" ? "1 color" : `2 colores: ${L.base.toLowerCase()} + ${L.top.toLowerCase()}`;
      return `<div class="model-card">
        <div class="model-card__head">
          <img class="model-card__photo" src="${img(m.id)}" alt="${m.name}" loading="lazy">
          <div><h3 class="model-card__name">${m.name}</h3>
          <div class="model-card__qty">${q} ${q === 1 ? "pieza" : "piezas"} · ${sub}</div></div>
        </div>
        ${tabs}
        ${previewHTML(m, t)}
        <div class="combo${x.qty === 0 ? " is-empty" : ""}">${ctrl}${rows}</div>
      </div>`;
    }).join("");
    hookPreviews();
  }

  // ---------- Vista previa (imágenes pre-renderizadas que se pintan en vivo) ----------
  const PREVIEW_DIR = "previews/";
  const VIEWS = [
    { key: "frente", label: "Frente" },
    { key: "lado",   label: "Lado" },
    { key: "atras",  label: "Atrás" }
  ];
  const GRIS = "#BFB8C2";               // color mientras no se elige
  const layerCache = {};                // url -> Promise<{w,h,data}>
  const ready = {};                     // modelo -> true cuando sus capas ya cargaron

  function previewHTML(m, t) {
    const n = state.pack.combos;
    return `<div class="preview3d" data-preview="${m.id}">
      <div class="preview3d__head"><span>Vista previa ✨</span>${n > 1 ? `<span class="preview3d__combo">Combinación ${t + 1}</span>` : ""}</div>
      <div class="preview3d__grid">
        ${VIEWS.map((v, i) => `<figure class="preview3d__view${i === 0 ? " is-main" : ""}"><canvas data-view="${v.key}" aria-label="${m.name}, vista de ${v.label.toLowerCase()}"></canvas><figcaption>${v.label}</figcaption></figure>`).join("")}
      </div>
      <p class="preview3d__note" data-note>Cargando vista previa…</p>
    </div>`;
  }

  // Lee una capa PNG: R = sombreado, G = brillo, A = silueta.
  function loadLayer(url) {
    if (!layerCache[url]) {
      layerCache[url] = new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => {
          const c = document.createElement("canvas");
          c.width = im.naturalWidth; c.height = im.naturalHeight;
          const x = c.getContext("2d", { willReadFrequently: true });
          x.drawImage(im, 0, 0);
          res({ w: c.width, h: c.height, data: x.getImageData(0, 0, c.width, c.height).data });
        };
        im.onerror = () => rej(new Error("No cargó " + url));
        im.src = url;
      });
    }
    return layerCache[url];
  }

  function layerUrls(m, view) {
    return Object.keys(m.layers).map((ln) => `${PREVIEW_DIR}${m.id}-${view}-${ln}.png`);
  }

  function loadModel(id) {
    const m = model(id);
    const all = [];
    VIEWS.forEach((v) => layerUrls(m, v.key).forEach((u) => all.push(loadLayer(u))));
    return Promise.all(all).then(() => { ready[id] = true; });
  }

  // Tabla sRGB -> lineal y lineal -> sRGB (para pintar rápido).
  const TO_LIN = new Float32Array(256);
  for (let i = 0; i < 256; i++) TO_LIN[i] = Math.pow(i / 255, 2.2);
  const GAMMA_N = 4096, GAMMA_MAX = 1.5;
  const TO_SRGB = new Uint8ClampedArray(GAMMA_N + 1);
  for (let i = 0; i <= GAMMA_N; i++) TO_SRGB[i] = Math.round(255 * Math.pow(Math.min(1, (i / GAMMA_N) * GAMMA_MAX), 1 / 2.2));
  const rgbOf = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };

  /**
   * Pinta las capas de una vista con sus colores y devuelve un canvas.
   * layers: [{w,h,data}] en orden (cuerpo primero), hexes: colores en el mismo orden.
   */
  function tint(layers, hexes) {
    const { w, h } = layers[0];
    const cv = document.createElement("canvas");
    cv.width = w; cv.height = h;
    const ctx = cv.getContext("2d");
    const out = ctx.createImageData(w, h);
    const o = out.data;
    layers.forEach((L, li) => {
      const c = rgbOf(hexes[li]);
      const cr = TO_LIN[c[0]], cg = TO_LIN[c[1]], cb = TO_LIN[c[2]];
      const d = L.data;
      for (let p = 0; p < d.length; p += 4) {
        const a = d[p + 3];
        if (!a) continue;
        const K = d[p] * (1.6 / 255), S = d[p + 1] * (0.5 / 255);
        let r = cr * K + S, g = cg * K + S, b = cb * K + S;
        r = r / (1 + 0.25 * r); g = g / (1 + 0.25 * g); b = b / (1 + 0.25 * b);
        const R = TO_SRGB[Math.min(GAMMA_N, (r / GAMMA_MAX * GAMMA_N) | 0)];
        const G = TO_SRGB[Math.min(GAMMA_N, (g / GAMMA_MAX * GAMMA_N) | 0)];
        const B = TO_SRGB[Math.min(GAMMA_N, (b / GAMMA_MAX * GAMMA_N) | 0)];
        // capa encima de lo anterior (mezcla "normal")
        const A = a / 255, oa = o[p + 3] / 255, na = A + oa * (1 - A);
        o[p]     = (R * A + o[p] * oa * (1 - A)) / na;
        o[p + 1] = (G * A + o[p + 1] * oa * (1 - A)) / na;
        o[p + 2] = (B * A + o[p + 2] * oa * (1 - A)) / na;
        o[p + 3] = na * 255;
      }
    });
    ctx.putImageData(out, 0, 0);
    return cv;
  }

  // Colores (en orden de capas) para una combinación; gris si falta elegir.
  function hexesFor(m, x) {
    return Object.keys(m.layers).map((ln) => {
      const key = m.layers[ln];
      return x && x[key] != null ? PALETTE[x[key]].hex : GRIS;
    });
  }

  async function paintedView(m, x, view) {
    const ls = await Promise.all(layerUrls(m, view).map(loadLayer));
    return tint(ls, hexesFor(m, x));
  }

  function paintPreview(el) {
    const id = el.dataset.preview, m = model(id);
    if (!ready[id]) return;
    const x = state.variants[id][activeTab(id)];
    const hexes = hexesFor(m, x);
    el.querySelectorAll("canvas").forEach((cv) => {
      Promise.all(layerUrls(m, cv.dataset.view).map(loadLayer)).then((ls) => {
        const src = tint(ls, hexes);
        cv.width = src.width; cv.height = src.height;
        cv.getContext("2d").drawImage(src, 0, 0);
      });
    });
    const missing = x.base == null || (m.kind === "dual" && x.top == null);
    el.querySelector("[data-note]").textContent = missing ? "Elige tu color y aquí lo verás pintado." : "";
    el.classList.add("is-ready");
  }

  // Carga perezosa: las capas de un modelo se descargan cuando su tarjeta aparece en pantalla.
  const io = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      startModel(en.target.dataset.preview);
    });
  }, { rootMargin: "250px" }) : null;

  function startModel(id) {
    loadModel(id)
      .then(() => document.querySelectorAll(`[data-preview="${id}"]`).forEach(paintPreview))
      .catch(() => document.querySelectorAll(`[data-preview="${id}"]`).forEach((el) => el.remove()));
  }

  function hookPreviews() {
    document.querySelectorAll("[data-preview]").forEach((el) => {
      const id = el.dataset.preview;
      if (ready[id]) paintPreview(el);
      else if (io) io.observe(el);
      else startModel(id);
    });
  }

  function keepScroll(fn) {
    const y = window.scrollY;
    fn();
    window.scrollTo(0, y);
  }

  function onColorClick(e) {
    const tab = e.target.closest("[data-tab]");
    if (tab) {
      state.view[tab.dataset.model] = Number(tab.dataset.tab);
      keepScroll(() => { renderColors(); update(); });
      return;
    }
    const sw = e.target.closest("[data-color]");
    if (sw) {
      const x = state.variants[sw.dataset.model][Number(sw.dataset.vi)];
      x[sw.dataset.key] = Number(sw.dataset.color);
      keepScroll(() => { renderColors(); update(); });
      return;
    }
    const st = e.target.closest("[data-vstep]");
    if (st) {
      const v = state.variants[st.dataset.model];
      const i = Number(st.dataset.vi);
      const d = Number(st.dataset.vstep);
      if (d > 0 && v[0].qty > 0) { v[i].qty++; v[0].qty--; }
      if (d < 0 && v[i].qty > 0) { v[i].qty--; v[0].qty++; }
      keepScroll(() => { renderColors(); update(); });
    }
  }

  // ---------- Orden / validación ----------
  function orderLines() {
    return MODELS.filter((m) => state.qty[m.id] > 0).map((m) => {
      const line = { model: m, qty: state.qty[m.id], variants: [] };
      if (isCustom(m)) line.variants = state.variants[m.id].filter((x) => x.qty > 0);
      return line;
    });
  }

  function problems() {
    const out = [];
    if (!state.pack) return ["Elige un pack."];
    const s = sumQty();
    if (s !== state.pack.pieces) out.push(`Las cantidades deben sumar ${state.pack.pieces} piezas (llevas ${s}).`);
    MODELS.filter(isCustom).forEach((m) => {
      if (!state.qty[m.id]) return;
      state.variants[m.id].forEach((x, i) => {
        if (!x.qty) return;
        const c = state.pack.combos > 1 ? ` (combinación ${i + 1})` : "";
        const ART = { "Cuerpo": "el cuerpo", "Cuerpo y tapa": "el cuerpo y la tapa", "Pantalla": "la pantalla", "Teclas": "las teclas", "Teclado": "el teclado", "Letras": "las letras" };
        if (x.base == null) out.push(`${m.name}${c}: elige el color${m.kind === "dual" ? " de " + ART[m.labels.base] : ""}.`);
        if (m.kind === "dual" && x.top == null) out.push(`${m.name}${c}: elige el color de ${ART[m.labels.top]}.`);
      });
    });
    if (!state.nombre.trim()) out.push("Escribe tu nombre.");
    return out;
  }

  function variantText(m, x) {
    const b = x.base != null ? PALETTE[x.base].name : "sin elegir";
    if (m.kind === "single") return b;
    const t = x.top != null ? PALETTE[x.top].name : "sin elegir";
    return `${m.labels.base.toLowerCase()} ${b} + ${m.labels.top.toLowerCase()} ${t}`;
  }

  function dot(i) {
    if (i == null) return `<span class="dot" style="background:repeating-linear-gradient(45deg,#eee 0 3px,#fff 3px 6px)"></span>`;
    const c = PALETTE[i];
    return `<span class="dot${c.border ? " dot--blanco" : ""}" style="background:${c.hex}" title="${c.name}"></span>`;
  }

  function renderSummary() {
    const p = state.pack;
    if (!p) { $("#summary").innerHTML = ""; return; }
    const lines = orderLines().map((l) => {
      const m = l.model;
      let detail;
      if (m.kind === "fixed") detail = `<span class="tag">color fijo</span>`;
      else detail = l.variants.map((x) => `<span class="variant">${p.combos > 1 ? `<b>${x.qty}</b>` : ""} ${dot(x.base)}${m.kind === "dual" ? dot(x.top) : ""} ${variantText(m, x)}</span>`).join("");
      return `<li><img class="thumb" src="${img(m.id)}" alt="" loading="lazy">
        <div><div class="summary__model">${l.qty} ${m.name}</div><div class="summary__variants">${detail}</div></div></li>`;
    }).join("");
    $("#summary").innerHTML = `
      <p class="summary__who">${state.nombre.trim() ? "Pedido de " + esc(state.nombre.trim()) : "Pedido de (tu nombre)"}</p>
      <h3>${p.name} · ${p.pieces} piezas</h3>
      <ul class="summary__lines">${lines}</ul>
      <div class="summary__total"><span>Total a pagar</span><strong>${money(p.price)}</strong></div>`;
  }

  function update() {
    const p = state.pack;
    $("#paso-2").classList.toggle("is-locked", !p);
    if (!p) return;
    const s = sumQty();
    const ok = s === p.pieces;
    const c = $("#counter");
    c.className = "counter " + (ok ? "is-ok" : "is-bad");
    c.textContent = ok
      ? `¡Listo! Llevas ${s} de ${p.pieces} piezas ✨`
      : s < p.pieces
        ? `Llevas ${s} de ${p.pieces} piezas · te faltan ${p.pieces - s}`
        : `Llevas ${s} de ${p.pieces} piezas · te sobran ${s - p.pieces}`;

    // Botones + / − del paso 2
    document.querySelectorAll("#qty-list [data-model]").forEach((row) => {
      const id = row.dataset.model;
      row.querySelector("output").textContent = state.qty[id];
      const minus = row.querySelector('[data-step="-1"]');
      const plus = row.querySelector('[data-step="1"]');
      if (minus) minus.disabled = state.qty[id] <= 0;
      if (plus) plus.disabled = s >= p.pieces;
    });

    ["#paso-3", "#paso-4", "#paso-5"].forEach((sel) => $(sel).classList.toggle("is-locked", !ok));
    renderSummary();
    const probs = problems();
    $("#missing").innerHTML = probs.map((x) => `<li>${esc(x)}</li>`).join("");
    $("#btn-imagen").disabled = probs.length > 0;
    $("#btn-ig").disabled = probs.length > 0;
  }

  // ---------- Mensaje para Instagram ----------
  function orderMessage() {
    const p = state.pack;
    const out = [
      "¡Hola, Cosmo! ✨ Quiero hacer un pedido de mayoreo:",
      "",
      "Nombre: " + state.nombre.trim(),
      `${p.name} (${p.pieces} piezas) - ${money(p.price)}`,
      ""
    ];
    orderLines().forEach((l) => {
      const m = l.model;
      if (m.kind === "fixed") { out.push(`• ${l.qty} ${m.name} (color fijo)`); return; }
      if (l.variants.length === 1) { out.push(`• ${l.qty} ${m.name}: ${variantText(m, l.variants[0])}`); return; }
      out.push(`• ${l.qty} ${m.name}:`);
      l.variants.forEach((x) => out.push(`   - ${x.qty} ${variantText(m, x)}`));
    });
    out.push("", "Total a pagar: " + money(p.price));
    return out.join("\n");
  }

  function copyText(text) {
    // Copia síncrona (funciona en iOS dentro del clic) + API moderna como respaldo.
    let ok = false;
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", "");
      ta.style.cssText = "position:fixed;top:0;left:0;opacity:0;font-size:16px";
      document.body.appendChild(ta);
      ta.select(); ta.setSelectionRange(0, text.length);
      ok = document.execCommand("copy");
      document.body.removeChild(ta);
    } catch (_) { ok = false; }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).catch(() => {});
      ok = true;
    }
    return ok;
  }

  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => (t.textContent = ""), 7000);
  }

  function onInstagram() {
    if (problems().length) return;
    const ok = copyText(orderMessage());
    toast(ok
      ? "📋 ¡Pedido copiado! En el chat de Instagram solo pega y envía (o manda la imagen)."
      : "Abrimos Instagram. Si no se copió el mensaje, manda la imagen de tu pedido.");
    const w = window.open(IG_CHAT, "_blank", "noopener");
    if (!w) setTimeout(() => { window.location.href = IG_CHAT; }, 600);
  }

  // ---------- Imagen 1080 x 1080 ----------
  const thumbs = {};
  function loadThumb(id) {
    if (thumbs[id]) return thumbs[id];
    thumbs[id] = new Promise((res) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = img(id);
    });
    return thumbs[id];
  }

  // Recorta un dibujo a su silueta (sin márgenes transparentes).
  const trimCache = new WeakMap();
  function trimmed(src) {
    if (trimCache.has(src)) return trimCache.get(src);
    const w = src.width || src.naturalWidth, h = src.height || src.naturalHeight;
    const c = document.createElement("canvas"); c.width = w; c.height = h;
    const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(src, 0, 0);
    const d = x.getImageData(0, 0, w, h).data;
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) {
      if (d[(yy * w + xx) * 4 + 3] > 10) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
    }
    if (x1 < 0) { trimCache.set(src, c); return c; }
    const o = document.createElement("canvas"); o.width = x1 - x0 + 1; o.height = y1 - y0 + 1;
    o.getContext("2d").drawImage(c, x0, y0, o.width, o.height, 0, 0, o.width, o.height);
    trimCache.set(src, o);
    return o;
  }
  // Dibuja `src` dentro de un cuadro (x, y, s) sin deformarlo, centrado.
  function drawFit(ctx, src, x, y, s) {
    const t = trimmed(src), k = Math.min(s / t.width, s / t.height);
    const w = t.width * k, h = t.height * k;
    ctx.drawImage(t, x + (s - w) / 2, y + (s - h) / 2, w, h);
  }

  const images = {};
  function loadImage(url) {
    if (!images[url]) {
      images[url] = new Promise((res, rej) => {
        const im = new Image();
        im.onload = () => res(im);
        im.onerror = () => rej(new Error("No cargó " + url));
        im.src = url;
      });
    }
    return images[url];
  }

  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function cdot(ctx, x, y, r, i) {
    const c = PALETTE[i];
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = c.hex; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = c.border ? "#BDBDBD" : "rgba(0,0,0,.12)"; ctx.stroke();
  }

  function fitFont(ctx, text, weight, size, maxW, min) {
    let s = size;
    ctx.font = `${weight} ${s}px Poppins, sans-serif`;
    while (ctx.measureText(text).width > maxW && s > min) { s -= 1; ctx.font = `${weight} ${s}px Poppins, sans-serif`; }
    return s;
  }

  async function drawOrder() {
    if (document.fonts) {
      await Promise.all(["400", "500", "700"].map((w) => document.fonts.load(`${w} 30px Poppins`).catch(() => {})));
    }
    const p = state.pack;
    const lines = orderLines();
    const imgs = {};
    await Promise.all(lines.map(async (l) => { imgs[l.model.id] = await loadThumb(l.model.id); }));
    // Modelitos pintados con los colores elegidos (vista de frente pre-renderizada).
    const minis = {};
    await Promise.all(lines.map(async (l) => {
      const m = l.model;
      try {
        if (m.kind === "fixed") minis[m.id] = [await loadImage(`${PREVIEW_DIR}${m.id}-frente.png`)];
        else minis[m.id] = await Promise.all(l.variants.map((x) => paintedView(m, x, "frente")));
      } catch (_) { minis[m.id] = null; }
    }));

    const W = 1080, H = 1080, M = 54;
    const cv = $("#canvas");
    const ctx = cv.getContext("2d");
    const NAVY = "#1E2352", PINK = "#F27FB1", SOFT = "#5A5F86";
    ctx.textBaseline = "alphabetic";
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";

    // Fondo
    ctx.fillStyle = "#FDEEF4"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(80, 0, 0, 80, 0, 520);
    g.addColorStop(0, "#FFE0EE"); g.addColorStop(1, "rgba(253,238,244,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

    // Títulos
    ctx.textAlign = "center"; ctx.fillStyle = NAVY;
    ctx.font = "700 58px Poppins, sans-serif";
    ctx.fillText("Paquete de Clickers - Mayoreo", W / 2, 96);
    ctx.fillStyle = PINK; ctx.font = "700 34px Poppins, sans-serif";
    ctx.fillText("The Cosmo Studio", W / 2, 142);

    // Tarjeta de cliente y pack
    const packColors = { surtido: ["#A8E6C5", NAVY], tienda: ["#A78BFA", "#FFFFFF"], grande: ["#F27FB1", "#FFFFFF"] };
    const [pc, pt] = packColors[p.id];
    let y = 172;
    ctx.fillStyle = "#FFFFFF"; rr(ctx, M, y, W - 2 * M, 112, 28); ctx.fill();
    ctx.textAlign = "left";
    ctx.fillStyle = SOFT; ctx.font = "500 22px Poppins, sans-serif";
    ctx.fillText("Pedido de", M + 30, y + 42);
    ctx.fillStyle = NAVY;
    fitFont(ctx, state.nombre.trim(), 700, 36, 430, 20);
    ctx.fillText(state.nombre.trim(), M + 30, y + 86);
    const pillW = 420, pillX = W - M - 20 - pillW;
    ctx.fillStyle = pc; rr(ctx, pillX, y + 16, pillW, 80, 22); ctx.fill();
    ctx.fillStyle = pt; ctx.textAlign = "left";
    ctx.font = "700 30px Poppins, sans-serif"; ctx.fillText(p.name, pillX + 24, y + 52);
    ctx.font = "500 22px Poppins, sans-serif"; ctx.fillText(`${p.pieces} piezas`, pillX + 24, y + 82);
    ctx.textAlign = "right"; ctx.font = "700 40px Poppins, sans-serif";
    ctx.fillText(money(p.price), pillX + pillW - 22, y + 70);

    // Lista de modelos
    y = 304;
    const legend = lines.some((l) => l.model.kind === "dual" && l.variants.length > 1);
    const listH = legend ? 552 : 572;
    ctx.fillStyle = "#FFFFFF"; rr(ctx, M, y, W - 2 * M, listH, 28); ctx.fill();
    const rowH = Math.min(78, (listH - 24) / Math.max(lines.length, 1));
    const thumb = Math.min(60, rowH - 14);
    let ry = y + 12 + (listH - 24 - rowH * lines.length) / 2;
    const xThumb = M + 22, xQty = xThumb + thumb + 62, xName = xQty + 16, xDet = 420, maxDet = W - M - 18 - xDet;
    const MS = Math.min(64, rowH - 10);          // tamaño del modelito pintado

    const setF = (w, s) => { ctx.font = `${w} ${s}px Poppins, sans-serif`; };
    const textW = (t, w, s) => { setF(w, s); return ctx.measureText(t).width; };

    lines.forEach((l, idx) => {
      const m = l.model, cy = ry + rowH / 2;
      if (idx > 0) { ctx.strokeStyle = "#F6E1EA"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(M + 22, ry); ctx.lineTo(W - M - 22, ry); ctx.stroke(); }
      const im = imgs[m.id];
      if (im) {
        ctx.save(); rr(ctx, xThumb, cy - thumb / 2, thumb, thumb, 14); ctx.clip();
        ctx.drawImage(im, xThumb, cy - thumb / 2, thumb, thumb); ctx.restore();
      }
      ctx.textAlign = "right"; ctx.fillStyle = PINK; setF(700, 32);
      ctx.fillText(String(l.qty), xQty + 6, cy + 11);
      ctx.textAlign = "left"; ctx.fillStyle = NAVY; setF(700, 29);
      ctx.fillText(m.name, xName, cy + 10);

      const mm = minis[m.id];
      let cx = xDet;
      const putMini = (i, size) => {
        const s = size || MS;
        if (!mm || !mm[i]) return 0;
        drawFit(ctx, mm[i], cx, cy - s / 2, s);
        return s + 10;
      };

      if (m.kind === "fixed") {
        cx += putMini(0);
        setF(700, 20);
        const t = "color fijo", tw = ctx.measureText(t).width + 30;
        ctx.fillStyle = "#FFF7F0"; rr(ctx, cx, cy - 18, tw, 36, 18); ctx.fill();
        ctx.setLineDash([5, 4]); ctx.strokeStyle = SOFT; ctx.lineWidth = 1.5; ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = SOFT; ctx.fillText(t, cx + 15, cy + 7);
        ry += rowH; return;
      }

      const vs = l.variants, R = 13, dual = m.kind === "dual";
      if (vs.length === 1) {
        // Una combinación: modelito + colores con nombre
        const x = vs[0];
        cx += putMini(0);
        const pairs = dual
          ? [[m.labels.base, x.base], [m.labels.top, x.top]]
          : [[null, x.base]];
        const full = pairs.reduce((a, [lab, c]) => a + (lab ? textW(lab, 500, 19) + 8 : 0) + 2 * R + 8 + textW(PALETTE[c].name, 700, 21) + 22, 0);
        const showLab = cx + full <= xDet + maxDet;
        pairs.forEach(([lab, c]) => {
          if (lab && showLab) { setF(500, 19); ctx.fillStyle = SOFT; ctx.fillText(lab, cx, cy + 7); cx += ctx.measureText(lab).width + 8; }
          cdot(ctx, cx + R, cy, R, c); cx += 2 * R + 8;
          setF(700, 21); ctx.fillStyle = NAVY; ctx.fillText(PALETTE[c].name, cx, cy + 7); cx += ctx.measureText(PALETTE[c].name).width + 22;
        });
      } else {
        // Varias combinaciones: "N×" + modelito + circulitos apilados
        const r2 = 9, ms = Math.min(MS, 58);
        const chipW = vs.map((x) => textW(`${x.qty}×`, 700, 21) + 4 + ms + 4 + 2 * r2);
        const total = chipW.reduce((a, b) => a + b, 0);
        const gap = Math.max(6, Math.min(30, (maxDet - total) / Math.max(1, vs.length - 1)));
        vs.forEach((x, i) => {
          setF(700, 21); ctx.fillStyle = PINK;
          const pre = `${x.qty}×`; ctx.fillText(pre, cx, cy + 7); cx += ctx.measureText(pre).width + 4;
          if (mm && mm[i]) drawFit(ctx, mm[i], cx, cy - ms / 2, ms);
          cx += ms + 4;
          if (dual) { cdot(ctx, cx + r2, cy - r2 - 2, r2, x.base); cdot(ctx, cx + r2, cy + r2 + 2, r2, x.top); }
          else cdot(ctx, cx + r2, cy, r2, x.base);
          cx += 2 * r2 + gap;
        });
      }
      ry += rowH;
    });

    if (legend) {
      ctx.textAlign = "center"; ctx.fillStyle = SOFT; setF(500, 18);
      ctx.fillText("Circulitos: arriba = cuerpo (en el Corazón, cuerpo y tapa) · abajo = pantalla, teclas o letras", W / 2, 878);
    }

    // Total
    y = 896;
    ctx.fillStyle = PINK; rr(ctx, M, y, W - 2 * M, 84, 28); ctx.fill();
    ctx.fillStyle = "#FFFFFF"; ctx.textAlign = "left"; setF(700, 30);
    ctx.fillText("Total a pagar", M + 30, y + 53);
    ctx.textAlign = "right"; setF(700, 48);
    ctx.fillText(money(p.price), W - M - 30, y + 60);

    // Condiciones
    ctx.textAlign = "center"; ctx.fillStyle = NAVY; setF(500, 22);
    ctx.fillText(CONDITIONS.slice(0, 3).join("  ·  "), W / 2, 1020);
    const a = "Pedidos por Instagram: ", b = "@thecosmostudio.mx";
    const aw = textW(a, 500, 22), bw = textW(b, 700, 22); const sx = W / 2 - (aw + bw) / 2;
    ctx.textAlign = "left"; setF(500, 22); ctx.fillStyle = NAVY; ctx.fillText(a, sx, 1054);
    setF(700, 22); ctx.fillStyle = PINK; ctx.fillText(b, sx + aw, 1054);

    return cv;
  }

  function fileName() {
    const n = state.nombre.trim().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toLowerCase();
    return `pedido-clickers-${state.pack.id}${n ? "-" + n : ""}.png`;
  }

  let lastBlob = null;
  async function onImage() {
    if (problems().length) return;
    const btn = $("#btn-imagen");
    btn.disabled = true; btn.textContent = "Generando… ✨";
    try {
      const cv = await drawOrder();
      const url = cv.toDataURL("image/png");
      $("#preview-img").src = url;
      const dl = $("#btn-descargar");
      dl.href = url; dl.download = fileName();
      lastBlob = await new Promise((r) => cv.toBlob(r, "image/png"));
      const canShare = lastBlob && navigator.canShare && navigator.canShare({ files: [new File([lastBlob], fileName(), { type: "image/png" })] });
      $("#btn-compartir").hidden = !canShare;
      $("#preview").hidden = false;
      $("#preview").scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      btn.disabled = false; btn.textContent = "📸 Generar imagen de mi pedido";
    }
  }

  async function onShare() {
    if (!lastBlob) return;
    const file = new File([lastBlob], fileName(), { type: "image/png" });
    try { await navigator.share({ files: [file], title: "Mi pedido de clickers", text: orderMessage() }); } catch (_) {}
  }

  // ---------- Inicio ----------
  renderPacks();
  $("#qty-list").addEventListener("click", onQtyClick);
  $("#color-list").addEventListener("click", onColorClick);
  $("#nombre").addEventListener("input", (e) => { state.nombre = e.target.value; update(); });
  $("#btn-imagen").addEventListener("click", onImage);
  $("#btn-ig").addEventListener("click", onInstagram);
  $("#btn-compartir").addEventListener("click", onShare);
  MODELS.forEach((m) => loadThumb(m.id));
  update();

  // Acceso para pruebas automáticas (no afecta a los clientes).
  window.__cosmo = { state, selectPack, drawOrder, orderMessage, problems, update, renderColors, rebalance, paintedView };
})();
