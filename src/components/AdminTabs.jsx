import { NavLink } from "react-router-dom";
import { BarChart3, Users } from "lucide-react";

// Switches between the two admin pages.
export default function AdminTabs() {
  const tab = ({ isActive }) =>
    `inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
      isActive ? "bg-navy text-white" : "text-ink hover:bg-card"
    }`;
  return (
    <nav aria-label="Admin" className="mb-6 flex gap-1">
      <NavLink to="/admin" end className={tab}>
        <Users size={15} aria-hidden="true" /> Accounts
      </NavLink>
      <NavLink to="/admin/progress" className={tab}>
        <BarChart3 size={15} aria-hidden="true" /> Progress
      </NavLink>
    </nav>
  );
}
