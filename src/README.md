# STEMMate Namibia - interface slice (SDN621S A4, Group 06)

Working, accessible interface for **A3 priority workflow 1: find and save an activity for offline use**
(FR-01, FR-02, FR-03, QR-01, QR-02, AR-01, plus a placeholder login for SR-01).
Plain HTML, CSS and JavaScript modules. No build step, no dependencies, no network calls, synthetic data only.

## Run it
**Easiest:** double-click `index.html` (works from disk; the offline service worker only activates on localhost).

**Or with a server (recommended, enables offline caching):**
1. `cd stemmate`
2. `python3 -m http.server 8080` (or `npm start`)
3. Open http://localhost:8080 in Chrome or Edge (use localhost; the offline service worker needs it).
4. Log in with a synthetic demo account:
   - facilitator1@example.org / Demo-Pass-1
   - facilitator2@example.org / Demo-Pass-2

## Try the offline behaviour
1. Log in, open any activity, choose **Save for later**.
2. Turn the network off (DevTools > Network > Offline, or airplane mode). The badge changes to "Offline".
3. Reload. Open **Saved**, then the saved activity: all instructions, materials, cost and safety notes still show.
4. Storage full: in DevTools console run
   `const o=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).startsWith('stemmate.saved')){const e=new Error('q');e.name='QuotaExceededError';throw e}return o.call(this,k,v)}`
   then try to save: the **Save failed** screen appears with Try again / Free up space / Back.

## Run the tests
- Unit/integration (Node 20+, no install): `node --test tests/unit.test.mjs`
- Browser tests: `pip install playwright && playwright install chromium`, then `python3 tests/e2e.py <label>`
- Results, issues and the register: `docs/TEST_REGISTER.md`, `docs/test-register.csv`

## Editing the code
Source is in `js/*.js` (modules, used by the unit tests). `index.html` loads the generated `js/app.bundle.js`.
After changing any `js/*.js` file run `node build.mjs` to rebuild the bundle, or your change will not show.

## Layout
- `js/logic.js` filter, validation, formatting (pure functions)
- `js/storage.js` saved-activity store with storage-full and corruption recovery
- `js/auth.js` PLACEHOLDER login and per-session sign-in (replace with backend login)
- `js/app.js` screens, routing, focus handling; `sw.js` offline app shell
- `docs/screenshots/` screens at 360x720

## Known limitations (also in the issues log)
No encryption at rest/in transit (SR-01 gap). Login is a stub. No sign-up, planning, sync, booking.
Performance only measured on a throttled desktop browser. Manual accessibility tests not yet run.
