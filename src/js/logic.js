// Pure application logic (no DOM). Covers FR-01, FR-02, QR-02 and login validation.

export const DURATION_BUCKETS = [
  { id: "any", label: "Any duration", test: () => true },
  { id: "le30", label: "Up to 30 minutes", test: m => m <= 30 },
  { id: "31-45", label: "31 to 45 minutes", test: m => m > 30 && m <= 45 },
  { id: "46-60", label: "46 to 60 minutes", test: m => m > 45 && m <= 60 },
  { id: "gt60", label: "Over 60 minutes", test: m => m > 60 },
];

export const MAX_ACTIVITY_BYTES = 1024 * 1024; // A3: saved activity payload <= 1 MB

/** criteria: { level, topic, duration, material } where "" or "any" means no filter. */
export function filterActivities(list, criteria = {}) {
  const { level = "", topic = "", duration = "any", material = "" } = criteria;
  const bucket = DURATION_BUCKETS.find(b => b.id === duration) || DURATION_BUCKETS[0];
  return list.filter(a =>
    (!level || a.level === level) &&
    (!topic || a.topic === topic) &&
    bucket.test(a.minutes) &&
    (!material || a.materials.includes(material))
  );
}

/** FR-02: instructions, materials, cost and safety must all be present. */
export function isCompleteActivity(a) {
  return !!a && typeof a.title === "string" && a.title.trim() !== "" &&
    Array.isArray(a.steps) && a.steps.length > 0 && a.steps.every(s => String(s).trim() !== "") &&
    Array.isArray(a.materials) && a.materials.length > 0 &&
    typeof a.costNAD === "number" && a.costNAD >= 0 &&
    typeof a.safety === "string" && a.safety.trim() !== "";
}

export function formatCost(n) {
  return n === 0 ? "No cost (free or found materials)" : "About N$ " + n;
}

export function payloadBytes(obj) {
  return new TextEncoder().encode(JSON.stringify(obj)).length;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns { valid, errors: { email?, password? } } with plain-language messages. */
export function validateLogin({ email = "", password = "" } = {}) {
  const errors = {};
  if (!email.trim()) errors.email = "Enter your email address.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter an email address like name@example.org.";
  if (!password) errors.password = "Enter your password.";
  else if (password.length < 8) errors.password = "Your password must be at least 8 characters.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function describeFilters(criteria) {
  const parts = [];
  if (criteria.level) parts.push("Level: " + criteria.level);
  if (criteria.topic) parts.push("Topic: " + criteria.topic);
  if (criteria.duration && criteria.duration !== "any") {
    parts.push("Duration: " + DURATION_BUCKETS.find(b => b.id === criteria.duration).label);
  }
  if (criteria.material) parts.push("Materials: " + criteria.material);
  return parts;
}
