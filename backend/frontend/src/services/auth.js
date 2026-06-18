const TOKEN_KEY = "qs_token";
const USER_KEY = "qs_user";

/* Centralizes every read/write to localStorage so the rest of the
   app never touches storage keys directly. */
export const auth = {
  saveSession({ token, user }) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser() {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(auth.getToken());
  },

  getRole() {
    return auth.getUser()?.role ?? null;
  },
};

export default auth;
