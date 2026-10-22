# SDN621S A4 - Test register and honest results (STEMMate Namibia, interface slice)

Total documented tests: **37** (32 automated, 5 manual not yet run). Required: 12+ tests, 4+ automated.

Automated result (final runs): **32/32 pass (run 3: browser 17/17, unit 15/15)**. Runs: unit `docs/unit-results-run2.tap`; browser `docs/e2e-results-run1.json` (14/16, two failures kept) then `docs/e2e-results-run2.json` (16/16).

Browser: Chromium 141.0.7390.37 headless. Run dates: 2026-10-20T09:45:06 and 2026-10-20T09:45:34 (container clock).

Requirement IDs follow A3 (FR-01 to FR-07, QR-01, QR-02, PR-01, SR-01, AR-01). A3 writes them both with and without a hyphen; confirm the final form with the requirements owner.

## Results

| Test ID | Requirement | Component | Type | Automation | What it checks | Result | Evidence file | Issue |
|---|---|---|---|---|---|---|---|---|
| U01 | FR-01 | filterActivities | Unit/integration | Automated (node --test) | FR-01: filter by level returns only that level | PASS | docs/unit-results-run2.tap |  |
| U02 | FR-01 | filterActivities | Unit/integration | Automated (node --test) | FR-01: combined level+topic+duration+materials filter returns only matching records | PASS | docs/unit-results-run2.tap |  |
| U03 | FR-01 | filterActivities | Unit/integration | Automated (node --test) | FR-01: duration bucket boundaries (30, 31, 45, 46, 60, 61) | PASS | docs/unit-results-run2.tap |  |
| U04 | FR-01 | filterActivities | Unit/integration | Automated (node --test) | FR-01: a filter with no matches returns an empty list (no crash) | PASS | docs/unit-results-run2.tap |  |
| U05 | FR-02 | data.js + isCompleteActivity | Unit/integration | Automated (node --test) | FR-02 / A3 check: catalogue has >=30 activities and every one has all required fields | PASS | docs/unit-results-run2.tap |  |
| U06 | QR-02 / FR-03 | payloadBytes | Unit/integration | Automated (node --test) | QR-02 / A3 check: every activity payload is <= 1 MB | PASS | docs/unit-results-run2.tap |  |
| U07 | SR-01 | validateLogin | Unit/integration | Automated (node --test) | SR-01: login validation rejects bad email, empty and short passwords | PASS | docs/unit-results-run2.tap |  |
| U08 | SR-01 | auth.js | Unit/integration | Automated (node --test) | SR-01: wrong password is rejected, right password creates a session, logout clears it | PASS | docs/unit-results-run2.tap |  |
| U09 | FR-03 | storage.js | Unit/integration | Automated (node --test) | FR-03: saved activity persists (a NEW store over the same storage still reads it) | PASS | docs/unit-results-run2.tap |  |
| U10 | FR-03 | storage.js | Unit/integration | Automated (node --test) | FR-03: saving the same activity twice does not duplicate it | PASS | docs/unit-results-run2.tap |  |
| U11 | FR-03 (failure) | storage.js | Unit/integration | Automated (node --test) | FR-03 failure: storage full raises StorageFullError and earlier saves stay intact | PASS | docs/unit-results-run2.tap |  |
| U12 | SR-01 | storage.js | Unit/integration | Automated (node --test) | SR-01: one user's saved activities are not visible to another profile | PASS | docs/unit-results-run2.tap |  |
| U13 | FR-03 (recovery) | storage.js | Unit/integration | Automated (node --test) | recovery: corrupted saved data does not crash, is set aside, and saving works again | PASS | docs/unit-results-run2.tap |  |
| U14 | FR-02 | storage.js | Unit/integration | Automated (node --test) | FR-02: an incomplete activity (no safety notes) is refused and not stored | PASS | docs/unit-results-run2.tap |  |
| U15 | FR-03 | storage.js | Unit/integration | Automated (node --test) | FR-03: remove deletes only the chosen activity | PASS | docs/unit-results-run2.tap |  |
| E01 | FR-01, FR-02, FR-03, QR-01 | Whole interface slice (app.js) | End-to-end / accessibility / failure | Automated (Playwright) | End-to-end: login, filter, view, save, see in Saved | PASS | docs/e2e-results-run2.json |  |
| E02 | SR-01 | Login screen | End-to-end / accessibility / failure | Automated (Playwright) | Wrong password shows error and stays on login | PASS | docs/e2e-results-run2.json |  |
| E03 | SR-01, AR-01 | Login screen | End-to-end / accessibility / failure | Automated (Playwright) | Empty login flags both fields and moves focus | PASS | docs/e2e-results-run2.json |  |
| E04 | FR-03 | app.js + sw.js (offline shell) + storage.js | End-to-end / accessibility / failure | Automated (Playwright) | Airplane mode: saved activity opens fully after reload | PASS on run 2 (FAILED on run 1: missing 'Step by step' offline) | docs/e2e-results-run1.json, run2.json | ISS-02 |
| E05 | FR-03 (failure) | Save Failed screen | End-to-end / accessibility / failure | Automated (Playwright) | Storage full shows Save Failed with recovery; retry works | PASS | docs/e2e-results-run2.json |  |
| E06 | QR-02, AR-01 | Layout / CSS | End-to-end / accessibility / failure | Automated (Playwright) | No horizontal scroll at 360x720 on all screens | PASS | docs/e2e-results-run2.json |  |
| E07 | AR-01 | Layout / CSS | End-to-end / accessibility / failure | Automated (Playwright) | Touch targets >= 44x44 px on all screens | PASS on run 2 (FAILED on run 1: 3 targets under 44x44 px: results: A "Change filters" 119x20; filters: A "Back to Explore" 133x20; activity: A) | docs/e2e-results-run1.json, run2.json | ISS-01 |
| E08 | AR-01 | All screens (labels) | End-to-end / accessibility / failure | Automated (Playwright) | All form controls and buttons have accessible names | PASS | docs/e2e-results-run2.json |  |
| E09 | AR-01, FR-03 | Connectivity badge | End-to-end / accessibility / failure | Automated (Playwright) | Connectivity badge uses text for Online/Offline | PASS | docs/e2e-results-run2.json |  |
| E10 | AR-01 | Focus and keyboard handling | End-to-end / accessibility / failure | Automated (Playwright) | Keyboard-only login and focus management | PASS | docs/e2e-results-run2.json |  |
| E11 | SR-01 | Route guard | End-to-end / accessibility / failure | Automated (Playwright) | Protected screen redirects when not signed in | PASS | docs/e2e-results-run2.json |  |
| E12 | SR-01 | Per-user saved store | End-to-end / accessibility / failure | Automated (Playwright) | Second user cannot see first user's saved activities | PASS | docs/e2e-results-run2.json |  |
| E13 | AR-01 | Page structure | End-to-end / accessibility / failure | Automated (Playwright) | Page language, landmarks, one h1, titles | PASS | docs/e2e-results-run2.json |  |
| E14 | QR-02 | Filter flow (emulated device) | End-to-end / accessibility / failure | Automated (Playwright) | Filter response <= 2 s under 6x CPU throttle | PASS | docs/e2e-results-run2.json |  |
| E15 | AR-01 | Colour / CSS | End-to-end / accessibility / failure | Automated (Playwright) | Text colour contrast meets WCAG AA (script check) | PASS | docs/e2e-results-run2.json |  |
| E16 | FR-01 | Results screen | End-to-end / accessibility / failure | Automated (Playwright) | No-match filter shows message and Clear filters | PASS | docs/e2e-results-run2.json |  |
| M01 | AR-01 | Whole interface | Manual / accessibility | Manual | Screen reader (TalkBack on Android): log in, filter, save an activity using speech only | NOT RUN |  |  |
| M02 | QR-02 | Whole interface | Manual / accessibility | Manual | Real 2 GB RAM / 720p Android device: filter and open saved activity within the time target | NOT RUN |  |  |
| M03 | QR-01 | Whole interface | Manual / accessibility | Manual | First-time user completes login > filter > save unaided (done by the evaluation lead with classmates) | NOT RUN |  |  |
| M04 | AR-01 | Whole interface | Manual / accessibility | Manual | Browser zoom / text size at 200%: no loss of content or function | NOT RUN |  |  |
| M05 | AR-01 | Whole interface | Manual / accessibility | Manual | Independent contrast and accessibility audit tool run (e.g. Lighthouse / WAVE) on all screens | NOT RUN |  |  |
| E17 | FR-03, QR-01 | Whole interface (file:// start) | End-to-end / accessibility / failure | Automated (Playwright) | Works when index.html is double-clicked (no server) | PASS (run 3: 17/17) | docs/e2e-results-run3.json | ISS-07 |

## Issues log

| ID | Found by | Description | Status |
|---|---|---|---|
| ISS-01 | E07 (run 1) | Three text links ("Change filters", "Back to Explore" x2) were 20 px tall, below the 44x44 px target in AR-01. | Fixed: links restyled as full-width buttons; E07 passes on run 2. Before/after is redesign evidence. |
| ISS-02 | E04 (run 1) | Test read the page before navigation finished. Defect in the test, not the app (diagnosed by repeating the steps manually: saved activity rendered fully offline). | Fixed in test: waits for the heading. |
| ISS-03 | Not tested | SR-01 encryption at rest and in transit is not implemented in this slice. Saved data is plain text in browser storage; separation is by user id only. | OPEN residual risk. Needs backend/crypto work. |
| ISS-04 | Design gap | Login is a placeholder against synthetic demo accounts. It is not yet connected to the backend login task. | OPEN, depends on backend owner. |
| ISS-05 | M02 not run | QR-02 timing was measured only with 6x CPU throttling on a desktop browser, not on a real 2 GB device. | OPEN until M02 is done. |
| ISS-07 | Reported by user after hand-over | Opening index.html by double-click showed a blank app: browsers block ES module scripts on file://. My tests only used a web server, so they missed it. | Fixed: build.mjs bundles the modules into js/app.bundle.js (classic script). New test E17 covers it. |
| ISS-06 | Scope | Sign-up, session planning (FR-04), sync (FR-05), booking (FR-06), school management (FR-07) are not in this slice. | OPEN, by design (A3 priority workflow 1 only). |

## How honest results were kept

- Run 1 is kept unedited next to run 2 so the failure and the fix are both visible.
- Manual tests are marked NOT RUN, not passed. Fill the Result column only after a person has actually run them.
- Test E15 (contrast) and E14 (timing) are script approximations. State that limit in the report.