// Automated unit/integration tests (Node built-in runner, no dependencies): node --test tests/unit.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import { ACTIVITIES, DEMO_ACCOUNTS } from "../js/data.js";
import { filterActivities, isCompleteActivity, validateLogin, payloadBytes, MAX_ACTIVITY_BYTES } from "../js/logic.js";
import { createSavedStore, StorageFullError, IncompleteActivityError } from "../js/storage.js";
import { createAuth, AuthError } from "../js/auth.js";

class FakeStorage {
  constructor(limitBytes = Infinity) { this.m = new Map(); this.limit = limitBytes; }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null; }
  setItem(k, v) {
    const used = [...this.m].filter(([key]) => key !== k).reduce((n, [, val]) => n + val.length, 0);
    if (used + v.length > this.limit) { const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; }
    this.m.set(k, String(v));
  }
  removeItem(k) { this.m.delete(k); }
}

test("U01 FR-01: filter by level returns only that level", () => {
  const r = filterActivities(ACTIVITIES, { level: "Beginner" });
  assert.ok(r.length > 0);
  assert.ok(r.every(a => a.level === "Beginner"));
});

test("U02 FR-01: combined level+topic+duration+materials filter returns only matching records", () => {
  const c = { level: "Intermediate", topic: "Electricity", duration: "31-45", material: "Battery" };
  const r = filterActivities(ACTIVITIES, c);
  assert.ok(r.length >= 1);
  assert.ok(r.every(a => a.level === c.level && a.topic === c.topic && a.minutes > 30 && a.minutes <= 45 && a.materials.includes("Battery")));
});

test("U03 FR-01: duration bucket boundaries (30, 31, 45, 46, 60, 61)", () => {
  const mk = m => ({ minutes: m, materials: [], level: "x", topic: "x" });
  const L = [mk(30), mk(31), mk(45), mk(46), mk(60), mk(61)];
  const mins = d => filterActivities(L, { duration: d }).map(a => a.minutes);
  assert.deepEqual(mins("le30"), [30]);
  assert.deepEqual(mins("31-45"), [31, 45]);
  assert.deepEqual(mins("46-60"), [46, 60]);
  assert.deepEqual(mins("gt60"), [61]);
});

test("U04 FR-01: a filter with no matches returns an empty list (no crash)", () => {
  assert.deepEqual(filterActivities(ACTIVITIES, { level: "Beginner", topic: "Electricity", duration: "gt60" }), []);
});

test("U05 FR-02 / A3 check: catalogue has >=30 activities and every one has all required fields", () => {
  assert.ok(ACTIVITIES.length >= 30);
  const bad = ACTIVITIES.filter(a => !isCompleteActivity(a)).map(a => a.id);
  assert.deepEqual(bad, []);
});

test("U06 QR-02 / A3 check: every activity payload is <= 1 MB", () => {
  assert.ok(ACTIVITIES.every(a => payloadBytes(a) <= MAX_ACTIVITY_BYTES));
});

test("U07 SR-01: login validation rejects bad email, empty and short passwords", () => {
  assert.equal(validateLogin({ email: "", password: "" }).valid, false);
  assert.ok(validateLogin({ email: "not-an-email", password: "longenough1" }).errors.email);
  assert.ok(validateLogin({ email: "a@b.org", password: "short" }).errors.password);
  assert.equal(validateLogin({ email: "a@b.org", password: "longenough1" }).valid, true);
});

test("U08 SR-01: wrong password is rejected, right password creates a session, logout clears it", () => {
  const auth = createAuth(new FakeStorage(), DEMO_ACCOUNTS);
  assert.throws(() => auth.login(DEMO_ACCOUNTS[0].email, "Wrong-Pass-9"), AuthError);
  assert.equal(auth.currentUser(), null);
  const u = auth.login(DEMO_ACCOUNTS[0].email, DEMO_ACCOUNTS[0].password);
  assert.equal(u.id, "u1");
  assert.equal(auth.currentUser().id, "u1");
  auth.logout();
  assert.equal(auth.currentUser(), null);
});

test("U09 FR-03: saved activity persists (a NEW store over the same storage still reads it)", () => {
  const ls = new FakeStorage();
  createSavedStore(ls).save("u1", ACTIVITIES[0]);
  const after = createSavedStore(ls).list("u1"); // simulates app restart
  assert.equal(after.length, 1);
  assert.equal(after[0].id, ACTIVITIES[0].id);
  assert.deepEqual(after[0].steps, ACTIVITIES[0].steps);
});

test("U10 FR-03: saving the same activity twice does not duplicate it", () => {
  const s = createSavedStore(new FakeStorage());
  s.save("u1", ACTIVITIES[0]); s.save("u1", ACTIVITIES[0]);
  assert.equal(s.list("u1").length, 1);
});

test("U11 FR-03 failure: storage full raises StorageFullError and earlier saves stay intact", () => {
  const one = JSON.stringify([{ ...ACTIVITIES[0], savedAt: new Date().toISOString() }]).length;
  const ls = new FakeStorage(one + 50); // room for one activity only
  const s = createSavedStore(ls);
  s.save("u1", ACTIVITIES[0]);
  assert.throws(() => s.save("u1", ACTIVITIES[1]), StorageFullError);
  const kept = s.list("u1");
  assert.equal(kept.length, 1);
  assert.equal(kept[0].id, ACTIVITIES[0].id);
});

test("U12 SR-01: one user's saved activities are not visible to another profile", () => {
  const s = createSavedStore(new FakeStorage());
  s.save("u1", ACTIVITIES[0]);
  assert.equal(s.list("u2").length, 0);
  assert.equal(s.isSaved("u2", ACTIVITIES[0].id), false);
});

test("U13 recovery: corrupted saved data does not crash, is set aside, and saving works again", () => {
  const ls = new FakeStorage();
  ls.setItem("stemmate.saved.v1.u1", "{{not json");
  const s = createSavedStore(ls);
  assert.deepEqual(s.list("u1"), []);
  assert.equal(ls.getItem("stemmate.saved.v1.corrupt-backup.u1"), "{{not json");
  s.save("u1", ACTIVITIES[0]);
  assert.equal(s.list("u1").length, 1);
});

test("U14 FR-02: an incomplete activity (no safety notes) is refused and not stored", () => {
  const s = createSavedStore(new FakeStorage());
  const broken = { ...ACTIVITIES[0], safety: "" };
  assert.throws(() => s.save("u1", broken), IncompleteActivityError);
  assert.equal(s.list("u1").length, 0);
});

test("U15 FR-03: remove deletes only the chosen activity", () => {
  const s = createSavedStore(new FakeStorage());
  s.save("u1", ACTIVITIES[0]); s.save("u1", ACTIVITIES[1]);
  s.remove("u1", ACTIVITIES[0].id);
  assert.deepEqual(s.list("u1").map(a => a.id), [ACTIVITIES[1].id]);
});
