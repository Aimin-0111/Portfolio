/*
  Page UI: builds the text for each place from the content files, turns scrolling into travel,
  and opens a detail sheet for each project at #/work/<id>. #/work and #/about jump to a place.
  English and French: content text can be { en, fr } (see content/site.js); the button in the
  header switches, and the choice is remembered.
  Works without the 3D world too (no WebGL): everything stays readable.
*/

/* the interface's own words */
const WORDS = {
  en: { pieces: "pieces", more: "Read about it", prev: "Previous", next: "Next", close: "close", theme: "Switch light and dark mode", lang: "Lire en français", sections: "Sections", places: "Places" },
  fr: { pieces: "œuvres", more: "En savoir plus", prev: "Précédent", next: "Suivant", close: "fermer", theme: "Passer en mode clair ou sombre", lang: "Read in English", sections: "Sections", places: "Lieux" },
};
const LANGS = Object.keys(WORDS);
let lang = localStorage.getItem("lang") || ((navigator.language || "").toLowerCase().startsWith("fr") ? "fr" : "en");
if (!LANGS.includes(lang)) lang = "en";

/* pick the current language from a { en, fr } text; plain text and lists pass through */
const t = (v) => (v == null ? "" : Array.isArray(v) ? v.map(t) : typeof v === "object" && LANGS.some((l) => l in v) ? t(v[lang] ?? v.en) : v);
const W = () => WORDS[lang];

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const link = ({ label, url }) => `<a href="${esc(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""}>${esc(t(label))}</a>`;
const tags = (list = []) => `<ul class="tags">${list.map((x) => `<li>${esc(t(x))}</li>`).join("")}</ul>`;
const num = (n) => String(n).padStart(2, "0");
const shot = (p, cls) => (p.image?.src ? `<figure class="${cls}"><img src="${esc(p.image.src)}" alt="${esc(t(p.image.alt))}" loading="lazy"></figure>` : "");

/* the text shown at each stop */
const PANELS = {
  home: (site) => `
    <h1 class="mega">${t(site.home.title)}</h1>
    <p class="lede">${esc(t(site.home.intro))}</p>
    <button class="cta" type="button" data-go="work">${esc(t(site.home.cta))} <span aria-hidden="true">→</span></button>`,

  /* the gallery wall: every piece at a glance */
  work: (site, projects) => `
    <div class="wall">
      <p class="label">${projects.length} ${W().pieces}</p>
      <h2>${esc(t(site.work.title))}</h2>
      <p class="lede">${esc(t(site.work.intro))}</p>
      <ol class="guide">
        ${projects.map((p, i) => `
          <li><a href="#/work/${esc(p.id)}" data-piece="${i}">
            <span class="label">${num(i + 1)}</span><span class="t">${esc(t(p.title))}</span><span class="k">${esc(t(p.kind))}</span>
          </a></li>`).join("")}
      </ol>
    </div>`,

  notes: (site) => `
    <div class="wall">
      <h2>${esc(t(site.notes.title))}</h2>
      <p class="lede">${esc(t(site.notes.intro))}</p>
      <ol class="guide notes">
        ${site.notes.items.map((n, i) => `
          <li>${n.url ? `<a href="${esc(n.url)}">` : "<div>"}
            <span class="label">${num(i + 1)}</span>
            <span class="t">${esc(t(n.title))}${n.about ? `<span class="teaser">${esc(t(n.about))}</span>` : ""}</span>
            <span class="k label">${esc(t(n.date))}</span>
          ${n.url ? "</a>" : "</div>"}</li>`).join("")}
      </ol>
    </div>`,

  about: (site) => `
    <div class="wall">
      <h2>${esc(t(site.about.title))}</h2>
      ${t(site.about.text).map((p) => `<p>${esc(p)}</p>`).join("")}
      ${site.about.facts?.length ? `<dl class="facts">${site.about.facts.map((f) => `<div><dt class="label">${esc(t(f.label))}</dt><dd>${esc(t(f.text))}</dd></div>`).join("")}</dl>` : ""}
      <p class="links">${site.about.contact.map(link).join("")}</p>
    </div>`,
};

/* the wall label beside one piece */
const PIECE = (p, i, n) => `
  <article class="plaque">
    ${shot(p, "plaque-shot")}
    <p class="label">${num(i + 1)} <span class="muted">/ ${num(n)}</span></p>
    <h2>${esc(t(p.title))}</h2>
    <p class="medium">${esc(t(p.kind))}, ${esc(t(p.year))}</p>
    <p class="credit">${esc(t(p.role))}</p>
    <p class="desc">${esc(t(p.summary))}</p>
    <p class="label materials">${(p.tags || []).map((x) => esc(t(x))).join(" · ")}</p>
    <div class="plaque-foot">
      <a class="more" href="#/work/${esc(p.id)}">${W().more} <span aria-hidden="true">→</span></a>
      <span class="walk">
        <button type="button" data-walk="-1" aria-label="${W().prev}">←</button>
        <button type="button" data-walk="1" aria-label="${W().next}">→</button>
      </span>
    </div>
  </article>`;

/* the page scrolls in steps: one per stop, and at Work the wall first, then one step per piece */
export function buildSteps(site, projects) {
  const steps = [];
  site.stops.filter((id) => PANELS[id]).forEach((stop) => {
    steps.push({ stop });
    if (stop === "work") projects.forEach((p, piece) => steps.push({ stop, piece }));
  });
  return steps;
}

export function createUI({ site, projects }) {
  let world = null;
  const steps = buildSteps(site, projects);
  const stops = [...new Set(steps.map((s) => s.stop))];
  const first = (id) => steps.findIndex((s) => s.stop === id);
  const pieceStep = (i) => steps.findIndex((s) => s.stop === "work" && s.piece === i);
  const title = (id) => esc(t(site[id]?.title || id));
  const navName = (id) => esc(t(site[id]?.nav || site[id]?.title || id)).toLowerCase();
  const root = document.documentElement;
  const sheet = document.querySelector(".sheet");
  const body = sheet.querySelector(".sheet-body");
  let panels = [], dots = [], current = -1, lastFocus = null;

  /* build (or rebuild, after switching language) every piece of text on the page */
  function build() {
    root.lang = lang;
    document.querySelector(".brand").textContent = site.name;
    document.title = `${site.name} · portfolio`;
    document.querySelector(".nav-links").innerHTML = stops.slice(1).map((id) => `<button type="button" data-go="${id}">${navName(id)}</button>`).join("");
    document.querySelector(".site-header nav").setAttribute("aria-label", W().sections);
    document.querySelector(".stops").innerHTML = steps.map((s, k) => s.piece >= 0
      ? `<section class="stop stop-piece" data-step="${k}" aria-label="${esc(t(projects[s.piece].title))}">${PIECE(projects[s.piece], s.piece, projects.length)}</section>`
      : `<section class="stop stop-${s.stop}" data-step="${k}" aria-label="${title(s.stop)}">${PANELS[s.stop](site, projects)}</section>`).join("");
    const dotsNav = document.querySelector(".dots");
    dotsNav.setAttribute("aria-label", W().places);
    dotsNav.innerHTML = stops.map((id) => `<button type="button" data-go="${id}" aria-label="${title(id)}"><i></i><span>${navName(id)}</span></button>`).join("");
    const other = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    const langBtn = document.querySelector(".lang-toggle");
    langBtn.textContent = other.toUpperCase();
    langBtn.setAttribute("aria-label", W().lang);
    langBtn.setAttribute("lang", other);
    document.querySelector(".theme-toggle").setAttribute("aria-label", W().theme);
    sheet.querySelector(".sheet-close").textContent = `${W().close} ✕`;
    panels = [...document.querySelectorAll(".stop")];
    dots = [...document.querySelectorAll(".dots [data-go]")];
    /* pointing at a piece in the room guide lifts its frame */
    document.querySelectorAll("[data-piece]").forEach((a) => {
      a.addEventListener("pointerenter", () => world?.highlight(+a.dataset.piece));
      a.addEventListener("pointerleave", () => world?.highlight(-1));
    });
    if (current >= 0) render(current);
  }
  document.querySelector(".track").innerHTML = steps.map(() => "<div></div>").join("");

  /* scrolling = travelling */
  let progress = 0, near = 0;
  function onScroll() {
    progress = Math.min(steps.length - 1, Math.max(0, scrollY / innerHeight || 0));
    near = Math.round(progress);
    const on = Math.abs(progress - near) < .3 ? near : -1;
    panels.forEach((p) => p.classList.toggle("on", +p.dataset.step === on));
    dots.forEach((d) => d.classList.toggle("is-on", steps[near].stop === d.dataset.go));
    world?.setProgress(progress);
  }
  addEventListener("scroll", onScroll, { passive: true });
  const goStep = (k, behavior = "smooth") => scrollTo({ top: Math.max(0, Math.min(steps.length - 1, k)) * innerHeight, behavior });
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-go]"), walk = e.target.closest("[data-walk]");
    if (go) { e.preventDefault(); closeSheet(); goStep(first(go.dataset.go)); }
    if (walk) goStep(near + +walk.dataset.walk);
  });

  /* project detail sheet, routed by #/work/<id> */
  function render(i) {
    const p = projects[i];
    const prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length];
    body.innerHTML = `
      <p class="label">${num(i + 1)} / ${num(projects.length)} · ${esc(t(p.kind))} · ${esc(t(p.year))}</p>
      <h2 id="sheet-title">${esc(t(p.title))}</h2>
      <p class="role">${esc(t(p.role))}</p>
      ${shot(p, "shot")}
      <p class="lead">${esc(t(p.summary))}</p>
      ${t(p.details).map((d) => `<p>${esc(d)}</p>`).join("")}
      ${(p.gallery || []).map((g) => `<figure class="shot"><img src="${esc(g.src)}" alt="" loading="lazy"><figcaption>${esc(t(g.alt))}</figcaption></figure>`).join("")}
      ${tags(p.tags)}
      ${p.links?.length ? `<p class="links">${p.links.map(link).join("")}</p>` : ""}
      <nav class="sheet-nav">
        <a href="#/work/${esc(prev.id)}">← ${esc(t(prev.title))}</a>
        <a href="#/work/${esc(next.id)}">${esc(t(next.title))} →</a>
      </nav>`;
  }
  function openSheet(i) {
    if (current === -1) lastFocus = document.activeElement;
    current = i;
    render(i);
    sheet.scrollTop = 0;
    world?.highlight(-1);
    if (Math.abs(progress - pieceStep(i)) > .05) goStep(pieceStep(i), "instant");
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("open"));
    root.classList.add("sheet-open");
    world?.focusProject(i);
    sheet.querySelector(".sheet-close").focus({ preventScroll: true });
  }
  function closeSheet() {
    if (current === -1) return;
    current = -1;
    sheet.classList.remove("open");
    root.classList.remove("sheet-open");
    setTimeout(() => { if (current === -1) sheet.hidden = true; }, 400);
    world?.focusProject(-1);
    if (location.hash.startsWith("#/work/")) history.replaceState(null, "", location.pathname + location.search);
    lastFocus?.focus?.({ preventScroll: true });
  }
  /* #/work/<id> opens a project; #/<stop> (like #/about) goes to that place */
  function route(behavior = "smooth") {
    const m = location.hash.match(/^#\/([\w-]+)(?:\/([\w-]+))?/);
    const i = m && m[1] === "work" && m[2] ? projects.findIndex((p) => p.id === m[2]) : -1;
    if (i >= 0) return openSheet(i);
    closeSheet();
    if (m && first(m[1]) >= 0) goStep(first(m[1]), behavior);
  }
  addEventListener("hashchange", () => route());
  sheet.querySelector(".sheet-close").addEventListener("click", closeSheet);
  document.querySelector(".sheet-scrim").addEventListener("click", closeSheet);
  addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea") || e.ctrlKey || e.metaKey || e.altKey) return;
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Escape") closeSheet();
    /* ← → : the next project in the sheet, or the next piece while walking the gallery */
    if (dir && current >= 0) location.hash = `#/work/${projects[(current + dir + projects.length) % projects.length].id}`;
    else if (dir && steps[near].stop === "work" && steps[near + dir]?.stop === "work") goStep(near + dir);
    if (e.key.toLowerCase() === "m") {
      root.classList.toggle("ink");
      world?.setMode(root.classList.contains("ink") ? "ink" : "paint");
    }
  });

  /* light / dusk */
  document.querySelector(".theme-toggle").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  /* English / French */
  document.querySelector(".lang-toggle").addEventListener("click", () => {
    lang = LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length];
    localStorage.setItem("lang", lang);
    build();
    onScroll();
  });

  build();
  onScroll();
  route("instant");

  return {
    steps,
    /* connect the 3D world once it has loaded */
    attach(w) {
      world = w;
      w.jumpTo(progress);
      w.onPick((i) => { location.hash = `#/work/${projects[i].id}`; });
      if (current >= 0) w.focusProject(current);
    },
  };
}
