/*
  Page UI: builds the text for each place from the content files, turns scrolling into travel,
  and opens a detail sheet for each project at #/work/<id>.
  Works without the 3D world too (no WebGL): everything stays readable.
*/

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const link = ({ label, url }) => `<a href="${esc(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}</a>`;
const tags = (list = []) => `<ul class="tags">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
const num = (n) => String(n).padStart(2, "0");
const shot = (p, cls) => (p.image?.src ? `<figure class="${cls}"><img src="${esc(p.image.src)}" alt="${esc(p.image.alt || "")}" loading="lazy"></figure>` : "");

/* the text shown at each stop */
const PANELS = {
  home: (site) => `
    <h1 class="mega">${site.home.title}</h1>
    <p class="lede">${esc(site.home.intro)}</p>
    <button class="cta" type="button" data-go="work">See the work <span aria-hidden="true">→</span></button>`,

  /* the gallery wall: every piece at a glance */
  work: (site, projects) => `
    <div class="wall">
      <p class="label">${projects.length} pieces</p>
      <h2>${esc(site.work.title)}</h2>
      <p class="lede">${esc(site.work.intro)}</p>
      <ol class="guide">
        ${projects.map((p, i) => `
          <li><a href="#/work/${esc(p.id)}" data-piece="${i}">
            <span class="label">${num(i + 1)}</span><span class="t">${esc(p.title)}</span><span class="k">${esc(p.kind)}</span>
          </a></li>`).join("")}
      </ol>
    </div>`,

  notes: (site) => `
    <div class="wall">
      <h2>${esc(site.notes.title)}</h2>
      <p class="lede">${esc(site.notes.intro)}</p>
      <ol class="guide notes">
        ${site.notes.items.map((n, i) => `
          <li>${n.url ? `<a href="${esc(n.url)}">` : "<div>"}
            <span class="label">${num(i + 1)}</span>
            <span class="t">${esc(n.title)}${n.about ? `<span class="teaser">${esc(n.about)}</span>` : ""}</span>
            <span class="k label">${esc(n.date)}</span>
          ${n.url ? "</a>" : "</div>"}</li>`).join("")}
      </ol>
    </div>`,

  about: (site) => `
    <div class="wall">
      <h2>${esc(site.about.title)}</h2>
      ${site.about.text.map((p) => `<p>${esc(p)}</p>`).join("")}
      <p class="links">${site.about.contact.map(link).join("")}</p>
    </div>`,
};

/* the wall label beside one piece */
const PIECE = (p, i, n) => `
  <article class="plaque">
    ${shot(p, "plaque-shot")}
    <p class="label">${num(i + 1)} <span class="muted">/ ${num(n)}</span></p>
    <h2>${esc(p.title)}</h2>
    <p class="medium">${esc(p.kind)}, ${esc(p.year)}</p>
    <p class="credit">${esc(p.role)}</p>
    <p class="desc">${esc(p.summary)}</p>
    <p class="label materials">${p.tags.map(esc).join(" · ")}</p>
    <div class="plaque-foot">
      <a class="more" href="#/work/${esc(p.id)}">Read about it <span aria-hidden="true">→</span></a>
      <span class="walk">
        <button type="button" data-walk="-1" aria-label="Previous">←</button>
        <button type="button" data-walk="1" aria-label="Next">→</button>
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
  const title = (id) => esc(site[id]?.title || id);
  const root = document.documentElement;

  /* build the page */
  document.querySelector(".brand").textContent = site.name;
  document.title = `${site.name} · portfolio`;
  document.querySelector(".nav-links").innerHTML = stops.slice(1).map((id) => `<button type="button" data-go="${id}">${title(id).toLowerCase()}</button>`).join("");
  document.querySelector(".stops").innerHTML = steps.map((s, k) => s.piece >= 0
    ? `<section class="stop stop-piece" data-step="${k}" aria-label="${esc(projects[s.piece].title)}">${PIECE(projects[s.piece], s.piece, projects.length)}</section>`
    : `<section class="stop stop-${s.stop}" data-step="${k}" aria-label="${title(s.stop)}">${PANELS[s.stop](site, projects)}</section>`).join("");
  document.querySelector(".dots").innerHTML = stops.map((id) => `<button type="button" data-go="${id}" aria-label="${title(id)}"><i></i><span>${esc(id)}</span></button>`).join("");
  document.querySelector(".track").innerHTML = steps.map(() => "<div></div>").join("");

  /* scrolling = travelling */
  const panels = [...document.querySelectorAll(".stop")];
  const dots = [...document.querySelectorAll(".dots [data-go]")];
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

  /* pointing at a piece in the room guide lifts its frame */
  document.querySelectorAll("[data-piece]").forEach((a) => {
    a.addEventListener("pointerenter", () => world?.highlight(+a.dataset.piece));
    a.addEventListener("pointerleave", () => world?.highlight(-1));
  });

  /* project detail sheet, routed by #/work/<id> */
  const sheet = document.querySelector(".sheet");
  const body = sheet.querySelector(".sheet-body");
  let current = -1, lastFocus = null;
  function render(i) {
    const p = projects[i];
    const prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length];
    body.innerHTML = `
      <p class="label">${num(i + 1)} / ${num(projects.length)} · ${esc(p.kind)} · ${esc(p.year)}</p>
      <h2 id="sheet-title">${esc(p.title)}</h2>
      <p class="role">${esc(p.role)}</p>
      ${shot(p, "shot")}
      <p class="lead">${esc(p.summary)}</p>
      ${p.details.map((d) => `<p>${esc(d)}</p>`).join("")}
      ${tags(p.tags)}
      ${p.links.length ? `<p class="links">${p.links.map(link).join("")}</p>` : ""}
      <nav class="sheet-nav">
        <a href="#/work/${esc(prev.id)}">← ${esc(prev.title)}</a>
        <a href="#/work/${esc(next.id)}">${esc(next.title)} →</a>
      </nav>`;
  }
  function openSheet(i) {
    if (current === -1) lastFocus = document.activeElement;
    current = i;
    render(i);
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
  function route() {
    const m = location.hash.match(/^#\/work\/([\w-]+)/);
    const i = m ? projects.findIndex((p) => p.id === m[1]) : -1;
    if (i >= 0) openSheet(i); else closeSheet();
  }
  addEventListener("hashchange", route);
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

  onScroll();
  route();

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
