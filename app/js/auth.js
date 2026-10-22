// PLACEHOLDER auth (SR-01): compares against synthetic demo accounts and keeps the session in
// sessionStorage so each browser session needs a fresh login (A3 decision for shared devices).
// The backend login (team task 10) should replace verify() while keeping this interface.
import { validateLogin } from "./logic.js";

export class AuthError extends Error { constructor(m, errors) { super(m); this.name = "AuthError"; this.errors = errors || {}; } }

const SESSION_KEY = "stemmate.session";

export function createAuth(sessionStorageLike, accounts) {
  return {
    login(email, password) {
      const v = validateLogin({ email, password });
      if (!v.valid) throw new AuthError("Please fix the highlighted fields.", v.errors);
      const acc = accounts.find(a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password);
      if (!acc) throw new AuthError("Email or password is not correct. Check them and try again.", {});
      const user = { id: acc.id, name: acc.name };
      sessionStorageLike.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    },
    currentUser() {
      try { return JSON.parse(sessionStorageLike.getItem(SESSION_KEY)); } catch { return null; }
    },
    logout() { sessionStorageLike.removeItem(SESSION_KEY); },
  };
}
