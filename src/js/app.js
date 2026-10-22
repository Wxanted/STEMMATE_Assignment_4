import { ACTIVITIES, TOPICS, LEVELS, MATERIALS, DEMO_ACCOUNTS } from "./data.js";
import { filterActivities, DURATION_BUCKETS, formatCost, describeFilters } from "./logic.js";
import { createSavedStore, StorageFullError, IncompleteActivityError, PayloadTooLargeError } from "./storage.js";
import { createAuth, AuthError } from "./auth.js";

const store = createSavedStore(window.localStorage);
const auth = createAuth(window.sessionStorage, DEMO_ACCOUNTS);
const main = document.getElementById("main");
const tabbar = document.getElementById("tabbar");
const badge = document.getElementById("conn-badge");
const dlg = document.getElementById("dlg");
let criteria = { level: "", topic: "", duration: "any", material: "" };
let firstRender = true;

const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const byId = id => ACTIVITIES.find(a => a.id === id);
const user = () => auth.currentUser();

function updateBadge() {
  const online = navigator.onLine;
  badge.className = "badge" + (online ? "" : " offline");
  badge.textContent = online ? "Online" : "Offline: saved activities still work";
}
window.addEventListener("online", updateBadge);
window.addEventListener("offline", updateBadge);

function card(a, saved) {
  return `<li class="card"><h2>${esc(a.title)}</h2>
    <p class="meta">${esc(a.level)} · ${a.minutes} min · ${esc(a.topic)} · Ages ${esc(a.ages)}${saved ? " · Saved" : ""}</p>
    <a class="btn-link secondary" href="#/activity/${a.id}" aria-label="View activity: ${esc(a.title)}">View activity</a></li>`;
}

const screens = {
  welcome() {
    return `<h1 tabindex="-1">Welcome to STEMMate</h1>
      <p class="logo" aria-hidden="true">STEMmate</p>
      <p>Find STEM activities and save them to use without internet.</p>
      <a class="btn-link btn block" href="#/login">Get Started</a>`;
  },
  login(state = {}) {
    const e = state.errors || {};
    const summary = state.message ? `<div class="error-summary" role="alert">${esc(state.message)}</div>` : "";
    const field = (id, label, type, extra) => `<div class="field"><label for="${id}">${label}</label>
      <input id="${id}" name="${id}" type="${type}" ${extra} value="${id === "email" ? esc(state.email || "") : ""}"
      ${e[id] ? `aria-invalid="true" aria-describedby="${id}-err"` : ""}>
      ${e[id] ? `<p class="error" id="${id}-err">${esc(e[id])}</p>` : ""}</div>`;
    return `<h1 tabindex="-1">Log in</h1>${summary}
      <form id="login-form" novalidate>
        ${field("email", "Email", "email", 'autocomplete="username" inputmode="email"')}
        ${field("password", "Password", "password", 'autocomplete="current-password"')}
        <button class="btn block" type="submit">Log in</button>
      </form>
      <details><summary>Class demonstration accounts (synthetic)</summary>
        <p>${DEMO_ACCOUNTS.map(a => `${esc(a.email)} / ${esc(a.password)}`).join("<br>")}</p></details>`;
  },
  home() {
    const saved = new Set(store.list(user().id).map(a => a.id));
    return `<h1 tabindex="-1">Explore activities</h1>
      <a class="btn-link btn block" href="#/filters">Filter activities</a>
      <p class="meta" aria-live="polite">${ACTIVITIES.length} activities available</p>
      <ul class="cards">${ACTIVITIES.map(a => card(a, saved.has(a.id))).join("")}</ul>`;
  },
  filters() {
    const sel = (id, label, opts, val) => `<div class="field"><label for="${id}">${label}</label><select id="${id}" name="${id}">${opts.map(([v, t]) => `<option value="${esc(v)}"${v === val ? " selected" : ""}>${esc(t)}</option>`).join("")}</select></div>`;
    return `<h1 tabindex="-1">Filter activities</h1>
      <form id="filter-form">
        ${sel("level", "Level", [["", "Any level"], ...LEVELS.map(l => [l, l])], criteria.level)}
        ${sel("duration", "Duration", DURATION_BUCKETS.map(b => [b.id, b.label]), criteria.duration)}
        ${sel("topic", "Topic", [["", "Any topic"], ...TOPICS.map(t => [t, t])], criteria.topic)}
        ${sel("material", "Materials", [["", "Any materials"], ...MATERIALS.map(m => [m, m])], criteria.material)}
        <button class="btn block" type="submit">Apply Filters</button>
        <button class="btn secondary block" type="button" id="clear-filters">Clear filters</button>
      </form>
      <a class="btn-link secondary btn block" href="#/home">Back to Explore</a>`;
  },
  results() {
    const res = filterActivities(ACTIVITIES, criteria);
    const chips = describeFilters(criteria);
    const saved = new Set(store.list(user().id).map(a => a.id));
    return `<h1 tabindex="-1">Filtered activities</h1>
      ${chips.length ? `<ul class="chips" aria-label="Active filters">${chips.map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : ""}
      <p role="status">${res.length} ${res.length === 1 ? "activity matches" : "activities match"} your filters</p>
      ${res.length ? `<ul class="cards">${res.map(a => card(a, saved.has(a.id))).join("")}</ul>`
        : `<p>No activities match. Try fewer filters.</p><button class="btn block" type="button" id="clear-filters">Clear filters</button>`}
      <a class="btn-link secondary btn block" href="#/filters">Change filters</a>`;
  },
  activity(id, note) {
    const a = byId(id) || store.get(user().id, id);
    if (!a) return `<h1 tabindex="-1">Activity not found</h1><p>This activity is not available on this device.</p><a class="btn-link secondary btn block" href="#/home">Back to Explore</a>`;
    const saved = store.isSaved(user().id, a.id);
    return `<h1 tabindex="-1">${esc(a.title)}</h1>
      <p class="meta">${esc(a.level)} · ${a.minutes} minutes · ${esc(a.topic)} · Ages ${esc(a.ages)}</p>
      ${note ? `<p class="status-ok" role="status">${esc(note)}</p>` : ""}
      ${saved ? `<p class="status-ok" role="status">Saved on this device. Works without internet.</p>
        <button class="btn secondary block" type="button" id="remove-btn" data-id="${a.id}">Remove from saved</button>`
        : `<button class="btn block" type="button" id="save-btn" data-id="${a.id}">Save for later</button>`}
      <h2>Estimated cost</h2><p>${esc(formatCost(a.costNAD))}</p>
      <h2>What you will need</h2><ul>${a.materials.map(m => `<li>${esc(m)}</li>`).join("")}</ul>
      <div class="safety" role="note"><strong>Safety notes</strong>${esc(a.safety)}</div>
      <h2>Step by step</h2><ol>${a.steps.map(s => `<li>${esc(s)}</li>`).join("")}</ol>
      <a class="btn-link secondary btn block" href="#/home">Back to Explore</a>`;
  },
  saved() {
    const items = store.list(user().id);
    return `<h1 tabindex="-1">Saved activities</h1>
      ${items.length ? `<p class="meta">${items.length} saved on this device. They work without internet.</p>
        <ul class="cards">${items.map(a => `<li class="card"><h2>${esc(a.title)}</h2>
          <p class="meta">${esc(a.level)} · ${a.minutes} min · ${esc(a.topic)}</p>
          <div class="actions"><a class="btn-link secondary" href="#/activity/${a.id}" aria-label="Open saved activity: ${esc(a.title)}">Open</a>
          <button class="secondary remove-saved" type="button" data-id="${a.id}" aria-label="Remove ${esc(a.title)} from saved">Remove</button></div></li>`).join("")}</ul>`
        : `<p>You have not saved any activities yet. Open an activity and choose Save for later.</p><a class="btn-link btn block" href="#/home">Find activities</a>`}`;
  },
  savefailed(id, cause) {
    return `<h1 tabindex="-1">Save failed</h1>
      <div class="status-fail" role="alert">${esc(cause)}</div>
      <p>The activity was not saved. Anything you saved before is still safe.</p>
      <button class="btn block" type="button" id="retry-btn" data-id="${esc(id)}">Try again</button>
      <a class="btn-link secondary btn block" href="#/saved">Free up space (remove saved activities)</a>
      <a class="btn-link secondary btn block" href="#/activity/${esc(id)}">Back to activity</a>`;
  },
};

function route() {
  updateBadge();
  const parts = (location.hash || "#/welcome").slice(2).split("/");
  const name = parts[0] || "welcome";
  const protectedRoutes = ["home", "filters", "results", "activity", "saved", "savefailed"];
  if (protectedRoutes.includes(name) && !user()) { location.hash = "#/login"; return; }
  if (name === "login" && user()) { location.hash = "#/home"; return; }
  let html;
  if (name === "activity") html = screens.activity(parts[1]);
  else if (name === "savefailed") html = screens.savefailed(parts[1], sessionStorage.getItem("stemmate.lastFailure") || "The activity could not be saved.");
  else html = (screens[name] || screens.welcome)();
  paint(html, name);
}

function paint(html, name) {
  main.innerHTML = html;
  const loggedIn = !!user();
  tabbar.hidden = !loggedIn;
  tabbar.querySelectorAll("[data-tab]").forEach(a => {
    const on = (a.dataset.tab === "home" && ["home", "filters", "results", "activity"].includes(name)) || (a.dataset.tab === "saved" && name === "saved");
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });
  document.title = (main.querySelector("h1")?.textContent || "STEMMate") + " | STEMMate Namibia";
  if (!firstRender) main.querySelector("h1")?.focus();
  firstRender = false;
  wire();
}

function wire() {
  const $ = s => main.querySelector(s);
  $("#login-form")?.addEventListener("submit", ev => {
    ev.preventDefault();
    const email = $("#email").value, password = $("#password").value;
    try { auth.login(email, password); location.hash = "#/home"; route(); }
    catch (e) {
      if (!(e instanceof AuthError)) throw e;
      paint(screens.login({ errors: e.errors, message: e.message, email }), "login");
      const first = main.querySelector('[aria-invalid="true"]') || main.querySelector("#email");
      first.focus();
    }
  });
  $("#filter-form")?.addEventListener("submit", ev => {
    ev.preventDefault();
    criteria = { level: $("#level").value, topic: $("#topic").value, duration: $("#duration").value, material: $("#material").value };
    location.hash = "#/results";
  });
  main.querySelectorAll("#clear-filters").forEach(b => b.addEventListener("click", () => {
    criteria = { level: "", topic: "", duration: "any", material: "" };
    location.hash = "#/filters"; route();
  }));
  const doSave = id => {
    const a = byId(id);
    try {
      store.save(user().id, a);
      dlg.querySelector("#dlg-title").textContent = "Your activity has been saved";
      dlg.querySelector("#dlg-body").textContent = "You can open it from Saved, even without internet.";
      dlg.showModal();
    } catch (e) {
      if (e instanceof StorageFullError || e instanceof IncompleteActivityError || e instanceof PayloadTooLargeError) {
        sessionStorage.setItem("stemmate.lastFailure", e.message);
        location.hash = "#/savefailed/" + id;
      } else throw e;
    }
  };
  $("#save-btn")?.addEventListener("click", ev => doSave(ev.currentTarget.dataset.id));
  $("#retry-btn")?.addEventListener("click", ev => doSave(ev.currentTarget.dataset.id));
  $("#remove-btn")?.addEventListener("click", ev => { store.remove(user().id, ev.currentTarget.dataset.id); paint(screens.activity(ev.currentTarget.dataset.id, "Removed from saved."), "activity"); main.querySelector("h1").focus(); });
  main.querySelectorAll(".remove-saved").forEach(b => b.addEventListener("click", ev => { store.remove(user().id, ev.currentTarget.dataset.id); paint(screens.saved(), "saved"); main.querySelector("h1").focus(); }));
}

dlg.querySelector("#dlg-ok").addEventListener("click", () => {
  dlg.close();
  const id = (location.hash.split("/")[2]) || "";
  paint(screens.activity(id, "Activity saved."), "activity");
  main.querySelector("h1").focus();
});
document.getElementById("signout").addEventListener("click", () => { auth.logout(); location.hash = "#/welcome"; route(); });
window.addEventListener("hashchange", route);
route();

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => { /* app still works online without it */ });
}
