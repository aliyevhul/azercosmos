import { NavLink } from "react-router-dom";
import { LogOut, ShieldCheck, UserRound } from "lucide-react";
import { useAuth } from "../auth/AuthContext";

// Slim bar above the main navigation: who is signed in, Admin (for admins)
// and Log out.
export default function AccountBar() {
  const { user, logout } = useAuth();
  if (!user) return null;

  return (
    <div className="bg-navy text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-1.5 text-xs md:px-8">
        <span className="flex min-w-0 items-center gap-1.5 text-white/80">
          <UserRound size={14} aria-hidden="true" className="shrink-0" />
          <span className="truncate">
            {user.dev ? "Local preview — login is off" : <>Signed in as <span className="text-white">{user.name || user.email}</span></>}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-1">
          {user.role === "admin" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 rounded px-2 py-1 font-medium hover:bg-white/10 ${isActive ? "bg-white/15" : ""}`
              }
            >
              <ShieldCheck size={14} aria-hidden="true" />
              Admin
            </NavLink>
          )}
          {!user.dev && (
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1 rounded px-2 py-1 font-medium hover:bg-white/10"
            >
              <LogOut size={14} aria-hidden="true" />
              Log out
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
