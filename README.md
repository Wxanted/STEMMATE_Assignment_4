# STEMMate Namibia - SDN621S Assessment 4 (Group 06)

Offline-first facilitator attendance for a low-resource STEM learning context.
Synthetic data only. Not production-ready.

## Team
| Name | Student number | Role |
|---|---|---|
| Nangolo Nombili | 225009145 | Project manager and report |
| Lydia Amutenya | 225121506 | Requirements |
| Dinilson Nathinge | 225050579 | Architecture |
| Naobeb DB | 223124680 | Development (backend and data) |
| Alfons Beukes | 225068125 | Development (interface) and testing |
| Mouton JM | 223128503 | Evaluation and redesign |

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
