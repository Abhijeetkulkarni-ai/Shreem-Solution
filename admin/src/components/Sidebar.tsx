
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Leads & CRM", path: "/leads", icon: Users },
  { name: "Blog Management", path: "/blogs", icon: FileText },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "Website Settings", path: "/settings", icon: Settings },
];

type SidebarProps = {
  onLogout: () => void;
  onClose?: () => void;
};

export default function Sidebar({ onLogout, onClose }: SidebarProps) {
  return (
    <>
      <div className="sidebar-brand">
        <div className="brand-symbol">S</div>

        <div>
          <strong>SHREEM SOLUTIONS</strong>
          <span>GLOBAL TRADE PARTNER</span>
        </div>

        {onClose && (
          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        )}
      </div>

      <div className="workspace-label">WORKSPACE</div>

      <nav className="side-navigation">
        {navigation.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `side-link ${isActive ? "side-link-active" : ""}`
            }
            onClick={onClose}
          >
            <Icon size={18} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-status">
          <span className="status-dot" />
          <div>
            <strong>System Operational</strong>
            <span>Admin workspace</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={onLogout}
        >
          <LogOut size={17} />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}
