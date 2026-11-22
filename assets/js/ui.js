/*
  Page UI: builds the panels from the content files, turns scrolling into travel,
  and opens a detail sheet for each project at #/work/<id>.
  Works without the 3D world too (no WebGL): everything stays readable.
*/

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const link = ({ label, url }) => `<a href="${esc(url)}"${/^https?:/.test(url) ? ' target="_blank" rel="noopener"' : ""}>${esc(label)}</a>`;
const tags = (list = []) => `<ul class="tags">${list.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;

const PANELS = {
  home: (site) => `
    <h1 class="mega">${site.home.title}</h1>
    <p class="lede">${esc(site.home.intro)}</p>
    <button class="cta" type="button" data-go="work">See the work <span aria-hidden="true">→</span></button>`,

  work: (site, projects) => `
    <div class="panel wide">
      <div class="panel-head"><h2>${esc(site.work.title)}</h2><p class="muted">${esc(site.work.intro)}</p></div>
      <div class="cards">
        ${projects.map((p, i) => `
          <a class="card" href="#/work/${esc(p.id)}" data-project="${i}">
            <span class="label">${esc(p.kind)} · ${esc(p.year)}</span>
            <strong>${esc(p.title)}</strong>
            <span class="summary">${esc(p.summary)}</span>
            ${tags(p.tags)}
          </a>`).join("")}
      </div>
    </div>`,

  notes: (site) => `
    <div class="panel">
      <h2>${esc(site.notes.title)}</h2>
      <p class="muted">${esc(site.notes.intro)}</p>
      <ul class="notes">${site.notes.items.map((n) => `<li><span class="label">${esc(n.date)}</span>${n.url ? link({ label: n.title, url: n.url }) : esc(n.title)}</li>`).join("")}</ul>
    </div>`,

  about: (site) => `
    <div class="panel">
      <h2>${esc(site.about.title)}</h2>
      ${site.about.text.map((p) => `<p>${esc(p)}</p>`).join("")}
      <p class="links">${site.about.contact.map(link).join("")}</p>
    </div>`,
};

export function createUI({ site, projects }) {
  let world = null;
  const stops = site.stops.filter((id) => PANELS[id]);
  const index = (id) => stops.indexOf(id);
  const root = document.documentElement;

  /* build the page */
  document.querySelector(".brand").textContent = site.name;
  document.title = `${site.name} · portfolio`;
  document.querySelector(".nav-links").innerHTML = stops.slice(1).map((id) => `<button type="button" data-go="${id}">${esc(site[id]?.title || id).toLowerCase()}</button>`).join("");
  document.querySelector(".stops").innerHTML = stops.map((id) => `<section class="stop stop-${id}" data-stop="${index(id)}" aria-label="${esc(site[id]?.title || id)}">${PANELS[id](site, projects)}</section>`).join("");
  document.querySelector(".dots").innerHTML = stops.map((id) => `<button type="button" data-go="${id}" aria-label="${esc(site[id]?.title || id)}"><i></i><span>${esc(id)}</span></button>`).join("");
  document.querySelector(".track").innerHTML = stops.map(() => "<div></div>").join("");

  /* scrolling = travelling */
  const panels = [...document.querySelectorAll(".stop")];
  const dots = [...document.querySelectorAll(".dots [data-go]")];
  let progress = 0;
  function onScroll() {
    progress = Math.min(stops.length - 1, Math.max(0, scrollY / innerHeight));
    const near = Math.round(progress);
    const on = Math.abs(progress - near) < .3 ? near : -1;
    panels.forEach((p) => p.classList.toggle("on", +p.dataset.stop === on));
    dots.forEach((d) => d.classList.toggle("is-on", index(d.dataset.go) === near));
    world?.setProgress(progress);
  }
  addEventListener("scroll", onScroll, { passive: true });
  const go = (id, behavior = "smooth") => scrollTo({ top: index(id) * innerHeight, behavior });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-go]");
    if (b) { e.preventDefault(); closeSheet(); go(b.dataset.go); }
  });

  /* hovering a project card flies toward its island */
  document.querySelectorAll(".card").forEach((c) => {
    c.addEventListener("pointerenter", () => world?.focusProject(+c.dataset.project));
    c.addEventListener("pointerleave", () => { if (!sheet.classList.contains("open")) world?.focusProject(-1); });
  });

  /* project detail sheet, routed by #/work/<id> */
  const sheet = document.querySelector(".sheet");
  const body = sheet.querySelector(".sheet-body");
  let current = -1, lastFocus = null;
  function render(i) {
    const p = projects[i];
    const prev = projects[(i - 1 + projects.length) % projects.length], next = projects[(i + 1) % projects.length];
    body.innerHTML = `
      <p class="label">${esc(p.kind)} · ${esc(p.year)}</p>
      <h2 id="sheet-title">${esc(p.title)}</h2>
      <p class="role">${esc(p.role)}</p>
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
    sheet.hidden = false;
    requestAnimationFrame(() => sheet.classList.add("open"));
    root.classList.add("sheet-open");
    if (Math.abs(progress - index("work")) > .05) go("work", "instant");
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
    if (e.target.closest?.("input, textarea")) return;
    if (e.key === "Escape") closeSheet();
    if (current >= 0 && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
      const j = (current + (e.key === "ArrowRight" ? 1 : -1) + projects.length) % projects.length;
      location.hash = `#/work/${projects[j].id}`;
    }
    if (e.key.toLowerCase() === "m" && !e.ctrlKey && !e.metaKey) {
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
    /* connect the 3D world once it has loaded */
    attach(w) {
      world = w;
      w.jumpTo(progress);
      if (current >= 0) w.focusProject(current);
    },
  };
}
