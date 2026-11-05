// Saved-activity store (FR-03). Storage is injected so tests can use a fake.
// This is the interface-side adapter; the backend task can replace it behind the same methods.
import { isCompleteActivity, payloadBytes, MAX_ACTIVITY_BYTES } from "./logic.js";

export class StorageFullError extends Error { constructor(m) { super(m); this.name = "StorageFullError"; } }
export class PayloadTooLargeError extends Error { constructor(m) { super(m); this.name = "PayloadTooLargeError"; } }
export class IncompleteActivityError extends Error { constructor(m) { super(m); this.name = "IncompleteActivityError"; } }

const key = userId => "stemmate.saved.v1." + userId;
const backupKey = userId => "stemmate.saved.v1.corrupt-backup." + userId;

function isQuotaError(e) {
  return !!e && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22 || e.code === 1014);
}

export function createSavedStore(storage) {
  function read(userId) {
    const raw = storage.getItem(key(userId));
    if (raw == null) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) throw new Error("not an array");
      return parsed;
    } catch {
      // Recovery: keep the unreadable text aside, start with an empty list instead of crashing.
      try { storage.setItem(backupKey(userId), raw); } catch { /* ignore */ }
      try { storage.removeItem(key(userId)); } catch { /* ignore */ }
      return [];
    }
  }
  return {
    list: userId => read(userId),
    get: (userId, id) => read(userId).find(a => a.id === id) || null,
    isSaved: (userId, id) => read(userId).some(a => a.id === id),
    save(userId, activity) {
      if (!isCompleteActivity(activity)) throw new IncompleteActivityError("This activity is missing instructions, materials, cost or safety notes, so it cannot be saved.");
      if (payloadBytes(activity) > MAX_ACTIVITY_BYTES) throw new PayloadTooLargeError("This activity is larger than 1 MB.");
      const items = read(userId).filter(a => a.id !== activity.id); // replace, never duplicate
      items.push({ ...activity, savedAt: new Date().toISOString() });
      try {
        storage.setItem(key(userId), JSON.stringify(items));
      } catch (e) {
        if (isQuotaError(e)) throw new StorageFullError("There is not enough space on this device to save the activity.");
        throw e;
      }
      return items.length;
    },
    remove(userId, id) {
      const items = read(userId).filter(a => a.id !== id);
      storage.setItem(key(userId), JSON.stringify(items));
      return items.length;
    },
  };
}
