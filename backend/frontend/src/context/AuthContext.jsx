import { createContext, useContext, useState, useCallback } from "react";
import { authApi } from "../services/api";
import auth from "../services/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => auth.getUser());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError("");
    try {
      const { data } = await authApi.login(email, password);
      // Expected shape: { access_token, role, name, email }
      const sessionUser = {
        email: data.email ?? email,
        name: data.name ?? email,
        role: data.role,
      };
      auth.saveSession({ token: data.access_token, user: sessionUser });
      setUser(sessionUser);
      return sessionUser;
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Invalid email or password.";
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    auth.clearSession();
    setUser(null);
  }, []);

  const value = {
    user,
    role: user?.role ?? null,
    isAuthenticated: Boolean(user),
    login,
    logout,
    loading,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
