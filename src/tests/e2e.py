"""Automated browser tests (Playwright + headless Chromium).
Run:  python3 tests/e2e.py [label]      -> prints a table and writes docs/e2e-results-<label>.json
Needs: pip install playwright && playwright install chromium
"""
import json, subprocess, sys, time, os, datetime, contextlib
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = 8099
BASE = f"http://localhost:{PORT}/"
LABEL = sys.argv[1] if len(sys.argv) > 1 else "run"
U1 = ("facilitator1@example.org", "Demo-Pass-1")
U2 = ("facilitator2@example.org", "Demo-Pass-2")
results = []

def record(tid, name, fn, *a):
    t0 = time.time()
    try:
        detail = fn(*a) or ""
        results.append(dict(id=tid, name=name, result="PASS", detail=detail, ms=round((time.time()-t0)*1000)))
    except Exception as e:
        results.append(dict(id=tid, name=name, result="FAIL", detail=str(e)[:600], ms=round((time.time()-t0)*1000)))

def login(page, creds=U1):
    page.goto(BASE)
    page.get_by_role("link", name="Get Started").click()
    page.get_by_label("Email").fill(creds[0])
    page.get_by_label("Password").fill(creds[1])
    page.get_by_role("button", name="Log in").click()
    page.get_by_role("heading", name="Explore activities").wait_for()

def apply_filters(page, **kw):
    page.get_by_role("link", name="Filter activities").click()
    for k, v in kw.items():
        page.select_option(f"#{k}", v)
    page.get_by_role("button", name="Apply Filters").click()
    page.get_by_role("heading", name="Filtered activities").wait_for()

# ---- tests ----
def e01(br):
    ctx = br.new_context(); p = ctx.new_page(); login(p)
    apply_filters(p, level="Intermediate", topic="Electricity")
    assert "activities match" in p.inner_text("main") or "activity matches" in p.inner_text("main")
    p.get_by_role("link", name="View activity: Simple Circuit Challenge").click()
    p.get_by_role("heading", name="Simple Circuit Challenge").wait_for()
    p.get_by_role("button", name="Save for later").click()
    assert p.locator("dialog[open]").count() == 1
    p.get_by_role("button", name="Continue").click()
    assert "Saved on this device" in p.inner_text("main")
    p.get_by_role("link", name="Saved").click()
    p.get_by_role("heading", name="Saved activities").wait_for()
    assert "Simple Circuit Challenge" in p.inner_text("main")
    ctx.close(); return "login > filter > view > save > Saved list"

def e02(br):
    ctx = br.new_context(); p = ctx.new_page(); p.goto(BASE + "#/login")
    p.get_by_label("Email").fill(U1[0]); p.get_by_label("Password").fill("Wrong-Pass-9")
    p.get_by_role("button", name="Log in").click()
    assert p.get_by_role("alert").count() >= 1, "no alert shown"
    assert "#/login" in p.url
    ctx.close(); return "error alert shown, stayed on login"

def e02b(br):
    ctx = br.new_context(); p = ctx.new_page(); p.goto(BASE + "#/login")
    p.get_by_role("button", name="Log in").click()
    assert p.locator('[aria-invalid="true"]').count() == 2, "both empty fields should be marked invalid"
    assert p.evaluate("document.activeElement.id") == "email", "focus should move to first invalid field"
    ctx.close(); return "empty form: 2 fields flagged, focus on email"

def e03(br):
    ctx = br.new_context(); p = ctx.new_page(); login(p)
    p.evaluate("navigator.serviceWorker.ready.then(()=>1)")
    p.reload(); p.wait_for_load_state("networkidle")
    p.evaluate("navigator.serviceWorker.ready.then(()=>1)")
    p.get_by_role("link", name="View activity: Maths in Motion").click()
    p.get_by_role("button", name="Save for later").click(); p.get_by_role("button", name="Continue").click()
    ctx.set_offline(True)
    p.reload(); p.wait_for_load_state("domcontentloaded")
    p.get_by_role("link", name="Saved").click()
    p.get_by_role("link", name="Open saved activity: Maths in Motion").click()
    p.get_by_role("heading", name="Maths in Motion").wait_for()
    txt = p.inner_text("main")
    for must in ["Step by step", "Stopwatch", "Safety notes", "Estimated cost", "Run three trials"]:
        assert must in txt, f"missing '{must}' offline"
    assert "Offline" in p.inner_text("#conn-badge")
    ctx.close(); return "reloaded with network off; saved activity fully shown"

def e04(br):
    ctx = br.new_context(); p = ctx.new_page(); login(p)
    p.goto(BASE + "#/activity/act-03"); p.get_by_role("heading", name="Marshmallow Towers").wait_for()
    p.evaluate("""()=>{const o=Storage.prototype.setItem;window.__o=o;Storage.prototype.setItem=function(k,v){if(String(k).startsWith('stemmate.saved')){const e=new Error('q');e.name='QuotaExceededError';throw e;}return o.call(this,k,v);}}""")
    p.get_by_role("button", name="Save for later").click()
    p.get_by_role("heading", name="Save failed").wait_for()
    assert p.get_by_role("alert").count() >= 1
    for b in ["Try again", "Free up space (remove saved activities)", "Back to activity"]:
        assert p.get_by_text(b).count() >= 1, f"missing recovery action {b}"
    p.evaluate("()=>{Storage.prototype.setItem=window.__o}")
    p.get_by_role("button", name="Try again").click()
    p.get_by_role("button", name="Continue").click()
    assert "Saved on this device" in p.inner_text("main")
    ctx.close(); return "Save Failed shown with 3 recovery actions; retry succeeded after space freed"

def e05(br):
    ctx = br.new_context(viewport={"width": 360, "height": 720}); p = ctx.new_page()
    bad = []
    def chk(n):
        w = p.evaluate("[document.documentElement.scrollWidth, document.documentElement.clientWidth]")
        if w[0] > w[1]: bad.append(f"{n} (scrollWidth {w[0]} > {w[1]})")
    p.goto(BASE); chk("welcome"); p.goto(BASE + "#/login"); chk("login")
    login(p); chk("home")
    apply_filters(p); chk("results")
    p.goto(BASE + "#/filters"); chk("filters")
    p.goto(BASE + "#/activity/act-05"); chk("activity")
    p.goto(BASE + "#/saved"); chk("saved(empty)")
    p.goto(BASE + "#/savefailed/act-05"); chk("savefailed")
    assert not bad, "horizontal scroll on: " + ", ".join(bad)
    ctx.close(); return "8 screens at 360x720: no horizontal scroll"

TARGET_JS = """()=>{const out=[];document.querySelectorAll('a[href],button,input,select,summary').forEach(e=>{
 if(e.classList.contains('skip-link'))return;const r=e.getBoundingClientRect();
 if(r.width===0||r.height===0)return;const cs=getComputedStyle(e);if(cs.visibility==='hidden')return;
 if(r.width<44||r.height<44)out.push((e.tagName+' "'+(e.innerText||e.getAttribute('aria-label')||e.id||'').trim().slice(0,30)+'" '+Math.round(r.width)+'x'+Math.round(r.height)));});return out;}"""

def e06(br):
    ctx = br.new_context(viewport={"width": 360, "height": 720}); p = ctx.new_page(); small = []
    def chk(n):
        for s in p.evaluate(TARGET_JS): small.append(f"{n}: {s}")
    p.goto(BASE); chk("welcome"); p.goto(BASE + "#/login"); chk("login")
    login(p); chk("home"); apply_filters(p); chk("results")
    p.goto(BASE + "#/filters"); chk("filters"); p.goto(BASE + "#/activity/act-05"); chk("activity")
    p.goto(BASE + "#/saved"); chk("saved"); p.goto(BASE + "#/savefailed/act-05"); chk("savefailed")
    assert not small, f"{len(small)} targets under 44x44 px: " + "; ".join(small[:12])
    ctx.close(); return "all interactive controls >= 44x44 px on 8 screens"

LABEL_JS = """()=>{const bad=[];
 document.querySelectorAll('input,select').forEach(e=>{const l=e.id&&document.querySelector('label[for="'+e.id+'"]');if(!(l&&l.textContent.trim())&&!e.getAttribute('aria-label'))bad.push('control '+(e.id||e.name));});
 document.querySelectorAll('button,a[href]').forEach(e=>{const t=(e.getAttribute('aria-label')||e.textContent||'').trim();if(!t)bad.push('empty name: '+e.outerHTML.slice(0,60));});
 return bad;}"""

def e07(br):
    ctx = br.new_context(); p = ctx.new_page(); bad = []
    def chk(n):
        for s in p.evaluate(LABEL_JS): bad.append(f"{n}: {s}")
    p.goto(BASE); chk("welcome"); p.goto(BASE + "#/login"); chk("login")
    login(p); chk("home"); p.goto(BASE + "#/filters"); chk("filters"); p.get_by_role("button", name="Apply Filters").click(); chk("results")
    p.goto(BASE + "#/activity/act-05"); chk("activity"); p.goto(BASE + "#/saved"); chk("saved")
    assert not bad, "; ".join(bad)
    ctx.close(); return "all inputs/selects labelled; all buttons/links have names"

def e08(br):
    ctx = br.new_context(); p = ctx.new_page(); p.goto(BASE)
    assert p.inner_text("#conn-badge").strip() == "Online"
    ctx.set_offline(True); p.evaluate("window.dispatchEvent(new Event('offline'))")
    t = p.inner_text("#conn-badge"); assert t.startswith("Offline"), t
    ctx.set_offline(False); p.evaluate("window.dispatchEvent(new Event('online'))")
    assert p.inner_text("#conn-badge").strip() == "Online"
    ctx.close(); return "badge text changes Online <-> Offline (text, not colour only)"

def e09(br):
    ctx = br.new_context(); p = ctx.new_page(); p.goto(BASE + "#/login")
    order = []
    for _ in range(4):
        p.keyboard.press("Tab"); order.append(p.evaluate("document.activeElement.id||document.activeElement.className||document.activeElement.tagName"))
    assert "email" in order and "password" in order, order
    p.get_by_label("Email").focus(); p.keyboard.type(U1[0]); p.keyboard.press("Tab"); p.keyboard.type(U1[1]); p.keyboard.press("Enter")
    p.get_by_role("heading", name="Explore activities").wait_for()
    assert p.evaluate("document.activeElement.tagName") == "H1", "focus should move to page heading"
    ctx.close(); return "tab order " + ">".join(order) + "; Enter submits; focus lands on h1"

def e10(br):
    ctx = br.new_context(); p = ctx.new_page(); p.goto(BASE + "#/saved")
    p.get_by_role("heading", name="Log in").wait_for(); assert "#/login" in p.url
    ctx.close(); return "unauthenticated #/saved redirects to login"

def e11(br):
    ctx = br.new_context(); p = ctx.new_page(); login(p, U1)
    p.goto(BASE + "#/activity/act-02"); p.get_by_role("button", name="Save for later").click(); p.get_by_role("button", name="Continue").click()
    p.get_by_role("button", name="Sign out").click()
    login(p, U2); p.goto(BASE + "#/saved")
    assert "not saved any activities" in p.inner_text("main"), "user 2 can see user 1's saved data"
    ctx.close(); return "user 2 sees empty Saved list after user 1 saved an activity"

def e12(br):
    ctx = br.new_context(); p = ctx.new_page(); problems = []
    def chk(n):
        if p.evaluate("document.documentElement.lang") != "en": problems.append(n + ": no lang")
        if p.locator("main").count() != 1: problems.append(n + ": main landmark count")
        if p.locator("h1").count() != 1: problems.append(n + f": {p.locator('h1').count()} h1")
    p.goto(BASE); chk("welcome"); login(p); chk("home"); p.goto(BASE + "#/saved"); chk("saved"); p.goto(BASE + "#/activity/act-01"); chk("activity")
    t1 = p.title(); p.goto(BASE + "#/saved"); assert t1 != p.title(), "title does not change per screen"
    assert not problems, "; ".join(problems)
    ctx.close(); return "lang, one main, one h1 per screen, title changes per screen"

def e13(br):
    ctx = br.new_context(viewport={"width": 360, "height": 720}); p = ctx.new_page(); login(p)
    cdp = ctx.new_cdp_session(p); cdp.send("Emulation.setCPUThrottlingRate", {"rate": 6})
    p.get_by_role("link", name="Filter activities").click()
    p.select_option("#level", "Beginner"); p.select_option("#duration", "le30")
    t0 = time.time(); p.get_by_role("button", name="Apply Filters").click()
    p.get_by_role("heading", name="Filtered activities").wait_for()
    ms = round((time.time()-t0)*1000)
    assert ms <= 2000, f"{ms} ms > 2000 ms"
    ctx.close(); return f"apply-filters to results = {ms} ms with 6x CPU throttle (emulation, NOT a real 2 GB device)"

CONTRAST_JS = """()=>{
 const lum=c=>{const [r,g,b]=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*r+.7152*g+.0722*b};
 const parse=s=>{const m=s.match(/rgba?\\(([^)]+)\\)/);if(!m)return null;const p=m[1].split(',').map(Number);return {rgb:p.slice(0,3),a:p.length>3?p[3]:1}};
 const bg=e=>{while(e){const c=parse(getComputedStyle(e).backgroundColor);if(c&&c.a>0.9)return c.rgb;e=e.parentElement}return [255,255,255]};
 const bad=[];const seen=new Set();
 document.querySelectorAll('main *, header *, nav *, dialog *').forEach(e=>{
  if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))return;
  const cs=getComputedStyle(e);if(cs.visibility==='hidden'||e.getBoundingClientRect().width===0)return;
  const fg=parse(cs.color).rgb,b=bg(e);const L1=lum(fg),L2=lum(b);const r=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
  const big=parseFloat(cs.fontSize)>=24||(parseFloat(cs.fontSize)>=18.66&&parseInt(cs.fontWeight)>=700);
  const need=big?3:4.5;const key=cs.color+'|'+b;
  if(r<need&&!seen.has(key)){seen.add(key);bad.push(e.tagName+' '+r.toFixed(2)+' < '+need)}});
 return bad;}"""

def e14(br):
    ctx = br.new_context(); p = ctx.new_page(); bad = []
    def chk(n):
        for s in p.evaluate(CONTRAST_JS): bad.append(f"{n}: {s}")
    p.goto(BASE); chk("welcome"); p.goto(BASE + "#/login"); chk("login"); login(p); chk("home")
    p.goto(BASE + "#/activity/act-05"); chk("activity"); p.goto(BASE + "#/savefailed/act-05"); chk("savefailed")
    assert not bad, "; ".join(bad)
    ctx.close(); return "computed text/background contrast >= WCAG AA on 5 screens (approximate script, not a full audit)"

def e15(br):
    ctx = br.new_context(); p = ctx.new_page(); login(p)
    apply_filters(p, level="Advanced", topic="Biology")
    assert "No activities match" in p.inner_text("main")
    p.get_by_role("button", name="Clear filters").click()
    p.get_by_role("heading", name="Filter activities").wait_for()
    assert p.input_value("#level") == "", "filters not cleared"
    ctx.close(); return "empty result shows message and a Clear filters recovery"

def e16(br):
    url = "file://" + os.path.join(ROOT, "index.html")
    ctx = br.new_context(); p = ctx.new_page(); errs = []
    p.on("pageerror", lambda e: errs.append(str(e)))
    p.goto(url)
    p.get_by_role("link", name="Get Started").click()
    p.get_by_label("Email").fill(U1[0]); p.get_by_label("Password").fill(U1[1])
    p.get_by_role("button", name="Log in").click()
    p.get_by_role("heading", name="Explore activities").wait_for()
    p.get_by_role("link", name="View activity: Paper Plane Distances").click()
    p.get_by_role("button", name="Save for later").click(); p.get_by_role("button", name="Continue").click()
    p.get_by_role("link", name="Saved").click()
    p.get_by_role("heading", name="Saved activities").wait_for()
    assert "Paper Plane Distances" in p.inner_text("main")
    assert not errs, errs
    ctx.close(); return "opened index.html straight from disk (file://), no server: login > save > Saved"

TESTS = [("E01","End-to-end: login, filter, view, save, see in Saved",e01),("E02","Wrong password shows error and stays on login",e02),
("E03","Empty login flags both fields and moves focus",e02b),("E04","Airplane mode: saved activity opens fully after reload",e03),
("E05","Storage full shows Save Failed with recovery; retry works",e04),("E06","No horizontal scroll at 360x720 on all screens",e05),
("E07","Touch targets >= 44x44 px on all screens",e06),("E08","All form controls and buttons have accessible names",e07),
("E09","Connectivity badge uses text for Online/Offline",e08),("E10","Keyboard-only login and focus management",e09),
("E11","Protected screen redirects when not signed in",e10),("E12","Second user cannot see first user's saved activities",e11),
("E13","Page language, landmarks, one h1, titles",e12),("E14","Filter response <= 2 s under 6x CPU throttle",e13),
("E15","Text colour contrast meets WCAG AA (script check)",e14),("E16","No-match filter shows message and Clear filters",e15),
("E17","Works when index.html is double-clicked (file://, no server)",e16)]

if __name__ == "__main__":
    srv = subprocess.Popen([sys.executable, "-m", "http.server", str(PORT)], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    time.sleep(1)
    try:
        with sync_playwright() as pw:
            br = pw.chromium.launch()
            for tid, name, fn in TESTS: record(tid, name, fn, br)
            ver = br.version; br.close()
    finally:
        srv.terminate()
    out = dict(label=LABEL, when=datetime.datetime.now().isoformat(timespec="seconds"), browser="Chromium " + ver, results=results)
    json.dump(out, open(os.path.join(ROOT, "docs", f"e2e-results-{LABEL}.json"), "w"), indent=2)
    for r in results: print(f"{r['id']} {r['result']:4} {r['name']}\n      {r['detail']}")
    print(f"\n{sum(r['result']=='PASS' for r in results)}/{len(results)} passed")
    sys.exit(0 if all(r['result']=='PASS' for r in results) else 1)
