
import { Bell, Menu, ChevronRight, Globe } from "lucide-react";

type HeaderProps = {
  title: string;
  email: string;
  fullName: string;
  role: string;
  onMenuClick: () => void;
};

export default function Header({
  title,
  email,
  fullName,
  role,
  onMenuClick,
}: HeaderProps) {
  const displayName = fullName || email.split("@")[0] || "Admin";

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          type="button"
          className="mobile-menu"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <div className="breadcrumb">
          <span>Workspace</span>
          <ChevronRight size={14} />
          <strong>{title}</strong>
        </div>
      </div>

      <div className="topbar-actions">
        <a
          href="https://shreemsolution.co.in"
          target="_blank"
          rel="noreferrer"
          className="website-link"
        >
          <Globe size={15} />
          <span>Visit Website</span>
        </a>

        <button
          type="button"
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>

        <div className="user-menu">
          <div className="user-avatar">
            {displayName.charAt(0).toUpperCase()}
          </div>

          <div className="user-details">
            <strong>{displayName}</strong>
            <span>{role.replace("_", " ")}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
