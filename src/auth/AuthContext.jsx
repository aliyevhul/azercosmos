import { createContext, useCallback, useContext, useEffect, useState } from "react";

// Checks the session with the server before showing the site. The server
// already blocks signed-out visitors (middleware.js); this keeps the page in
// step when a session ends while it's open (account disabled, password
// reset, signed out in another tab).

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

// `npm run dev` has no API, so locally the site runs as a pretend admin.
const DEV_USER = { id: 0, email: "dev@localhost", name: "Local preview", role: "admin", dev: true };

export function goToLogin() {
  const here = window.location.pathname + window.location.search;
  if (window.location.pathname.startsWith("/login")) return; // never loop
  window.location.replace(here === "/" ? "/login" : `/login?next=${encodeURIComponent(here)}`);
}

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: "loading", user: null });

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin", headers: { Accept: "application/json" } });
      const isJson = (res.headers.get("content-type") || "").includes("application/json");
      if (!isJson && import.meta.env.DEV) return setState({ status: "ready", user: DEV_USER });
      if (res.status === 401) return goToLogin();
      if (!res.ok || !isJson) return setState({ status: "error", user: null });
      const { user } = await res.json();
      setState({ status: "ready", user });
    } catch {
      if (import.meta.env.DEV) return setState({ status: "ready", user: DEV_USER });
      setState({ status: "error", user: null });
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      window.location.replace("/login");
    }
  }, []);

  if (state.status === "loading") return <div className="min-h-screen bg-paper" aria-busy="true" />;

  if (state.status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-card px-4">
        <div className="max-w-sm rounded-xl bg-paper p-8 text-center shadow-sm">
          <p className="font-display text-lg font-semibold text-ink">Couldn't load the site</p>
          <p className="mt-2 text-sm text-slate">Check your connection and try again.</p>
          <button
            type="button"
            onClick={() => {
              setState({ status: "loading", user: null });
              load();
            }}
            className="mt-5 rounded-md bg-stage-2 px-5 py-2.5 font-display text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <AuthContext.Provider value={{ user: state.user, logout, reload: load }}>{children}</AuthContext.Provider>;
}
