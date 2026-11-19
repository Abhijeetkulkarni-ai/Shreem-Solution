
import {
  LayoutDashboard,
  Package,
  Users,
  FileText,
  ChartNoAxesCombined,
  Settings,
  LogOut,
  X,
  Globe2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

import { NavLink } from "react-router-dom";

type SidebarProps = {
  onLogout: () => void;
  onClose?: () => void;
  role: string;
};

const navigation = [
  { name: "Dashboard", path: "/", icon: LayoutDashboard },
  { name: "Products", path: "/products", icon: Package },
  { name: "Leads & CRM", path: "/leads", icon: Users },
  { name: "Blog Management", path: "/blogs", icon: FileText },
  { name: "Analytics", path: "/analytics", icon: ChartNoAxesCombined },
  { name: "Website Settings", path: "/settings", icon: Settings },
];

export default function Sidebar({
  onLogout,
  onClose,
  role,
}: SidebarProps) {
  const visibleNavigation = [
    ...navigation,
    ...(role === "super_admin"
      ? [
          {
            name: "User Management",
            path: "/users",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <>
      <div className="sidebar-brand">
        <div className="brand-symbol">S</div>

        <div>
          <strong>SHREEM SOLUTION</strong>
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
        {visibleNavigation.map(({ name, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === "/"}
            className={({ isActive }) =>
              `side-link ${isActive ? "side-link-active" : ""}`
            }
            onClick={onClose}
          >
            <Icon size={18} strokeWidth={1.8} />
            <span>{name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <a
          href="https://shreemsolution.co.in"
          target="_blank"
          rel="noopener noreferrer"
          className="sidebar-website-link"
        >
          <Globe2 size={17} />
          <span>Visit Public Website</span>
          <ExternalLink size={14} />
        </a>

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
