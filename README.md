# STEMMate Namibia - interface slice (SDN621S A4, Group 06)

Working, accessible interface for **A3 priority workflow 1: find and save an activity for offline use**
(FR-01, FR-02, FR-03, QR-01, QR-02, AR-01, plus a placeholder login for SR-01).
Plain HTML, CSS and JavaScript modules. No build step, no dependencies, no network calls, synthetic data only.

## Run it
**Easiest:** double-click `index.html` (works from disk; the offline service worker only activates on localhost).

<<<<<<< HEAD
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
=======
## What this project contains
The interface slice lets a facilitator log in, filter a catalogue of STEM activities, open one, save it on the device and open it again with no internet connection. Session planning and server synchronisation are not part of the verified slice. The traceability matrix in `docs/` shows the status of every requirement.

## Folders
- `docs/` - requirements, traceability matrix, architecture diagram, evaluation and redesign report
- `src/` - the app (`index.html`, `js/`, `css/`, `sw.js`), the tests (`tests/`), and the test register and results (`src/docs/`)

## How to run
You need a web browser (Chrome or Edge). Python is used only to start a small local web server.

1. Get the code: `git clone https://github.com/Wxanted/STEMMATE_Assignment_4.git`, or click **Code > Download ZIP** on GitHub and extract it.
2. Open a terminal in the `src` folder.
3. Start the server:
   - Windows: `py -m http.server 8080`
   - macOS or Linux: `python3 -m http.server 8080`
4. Open http://localhost:8080 in Chrome or Edge.
5. Press `Ctrl+C` in the terminal to stop the server.

You can also double-click `src/index.html`. The app opens, but the offline cache only works through `localhost`.

### Demo accounts (synthetic)
| Email | Password |
|---|---|
| facilitator1@example.org | Demo-Pass-1 |
| facilitator2@example.org | Demo-Pass-2 |

### Try the offline behaviour
1. Log in, then filter and open an activity, and choose **Save for later**.
2. Press `F12`, open the **Network** tab and set it to **Offline**. The badge changes to "Offline".
3. Reload the page and open **Saved**. The activity still opens with all its details.

## How to test
Unit and integration tests (needs Node.js 20 or newer):

```
cd src
node --test tests/unit.test.mjs
```
Expected: 15 pass, 0 fail.

Browser tests (needs Python 3 and Playwright):

```
cd src
py -m pip install playwright
py -m playwright install chromium
py tests/e2e.py mytest
```
Use `python3` instead of `py` on macOS or Linux. Expected: 17/17 passed. The run writes `src/docs/e2e-results-mytest.json`, which you can delete.

If you change a file in `src/js/`, rebuild the bundle that `index.html` loads:

```
cd src
node build.mjs
```

## Status and known limits
- Data is synthetic. No real names, photos or school records are used.
- Login is a placeholder against demo accounts. Saved data is not encrypted.
- Speed was measured on a desktop browser with the CPU slowed down, not on a real low-cost phone.
- Five manual tests (screen reader, real device, first-time user, 200% zoom, independent audit) are listed in `src/docs/TEST_REGISTER.md` and were not run there.
- A small usability test with five people is written up in `docs/STEMMate_A4_Evaluation_and_Redesign_Report.docx`.
>>>>>>> origin/main
