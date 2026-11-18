
import { useCallback, useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  RefreshCw,
  ShieldCheck,
  Search,
  Clock3,
  CheckCircle2,
  XCircle,
  Mail,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./UserManagement.css";
type UserRole =
  | "super_admin"
  | "admin"
  | "sales"
  | "content_editor"
  | "viewer";

type TeamMember = {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_sign_in_at: string | null;
};

type ActivityLog = {
  id: string;
  actor_id: string | null;
  target_user_id: string | null;
  action: string;
  details: string | null;
  created_at: string;
};

const roles: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super Admin" },
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Sales" },
  { value: "content_editor", label: "Content Editor" },
  { value: "viewer", label: "Viewer" },
];

const roleLabel = (role: string) =>
  roles.find((item) => item.value === role)?.label ?? role;

export default function UserManagement() {
  const [users, setUsers] = useState<TeamMember[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"members" | "activity">(
    "members",
  );

  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<UserRole>("viewer");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const callManageUsers = useCallback(
    async (body: Record<string, unknown>) => {
      const { data, error } = await supabase.functions.invoke(
        "manage-users",
        { body },
      );

      if (error) {
        let message = error.message;

        try {
          const response = error.context as Response | undefined;
          if (response && typeof response.json === "function") {
            const payload = await response.json();
            message = payload.error || message;
          }
        } catch {
          // Keep the original invocation error.
        }

        throw new Error(message);
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data;
    },
    [],
  );

  const loadUsers = useCallback(async () => {
    const data = await callManageUsers({ action: "list" });
    setUsers(data.users ?? []);
  }, [callManageUsers]);

  const loadActivities = useCallback(async () => {
    const { data, error } = await supabase
      .from("user_activity_logs")
      .select(
        "id, actor_id, target_user_id, action, details, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    setActivities((data ?? []) as ActivityLog[]);
  }, []);

  const loadAll = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);

    setError("");

    try {
      await Promise.all([loadUsers(), loadActivities()]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load user management data.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadUsers, loadActivities]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  async function inviteUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const result = await callManageUsers({
        action: "invite",
        full_name: inviteName.trim(),
        email: inviteEmail.trim(),
        role: inviteRole,
      });

      setSuccess(result.message || "Invitation sent successfully.");
      setInviteName("");
      setInviteEmail("");
      setInviteRole("viewer");
      setShowInvite(false);

      await loadAll(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to invite user.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changeRole(user: TeamMember, role: UserRole) {
    if (user.role === role) return;

    const confirmed = window.confirm(
      `Change ${user.full_name || user.email}'s role to ${roleLabel(role)}?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      await callManageUsers({
        action: "update_role",
        user_id: user.id,
        role,
      });

      setSuccess("User role updated successfully.");
      await loadAll(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update role.",
      );
    }
  }

  async function toggleStatus(user: TeamMember) {
    const nextStatus = !user.is_active;

    const confirmed = window.confirm(
      nextStatus
        ? `Activate ${user.full_name || user.email}'s account?`
        : `Deactivate ${user.full_name || user.email}'s account?`,
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const result = await callManageUsers({
        action: "set_active",
        user_id: user.id,
        is_active: nextStatus,
      });

      setSuccess(result.message || "Account status updated.");
      await loadAll(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update account status.",
      );
    }
  }

  const filteredUsers = users.filter((user) => {
    const term = search.toLowerCase();

    return (
      user.full_name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      roleLabel(user.role).toLowerCase().includes(term)
    );
  });

  const activeUsers = users.filter((user) => user.is_active).length;
  const inactiveUsers = users.length - activeUsers;

  if (loading) {
    return (
      <div className="um-loading">
        <RefreshCw size={20} className="um-spin" />
        <span>Loading team management...</span>
      </div>
    );
  }

  return (
    <div className="user-management-page">
      <div className="um-heading">
        <div>
          <span className="um-eyebrow">ADMINISTRATION</span>
          <h1>User Management</h1>
          <p>
            Manage team access, permissions and account activity.
          </p>
        </div>

        <button
          className="um-primary-button"
          onClick={() => setShowInvite(true)}
        >
          <UserPlus size={17} />
          Invite User
        </button>
      </div>

      {error && (
        <div className="um-alert um-alert-error">
          <XCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="um-alert um-alert-success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="um-stat-grid">
        <div className="um-stat-card">
          <div className="um-stat-icon">
            <Users size={20} />
          </div>
          <span>Total team members</span>
          <strong>{users.length}</strong>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-green">
            <CheckCircle2 size={20} />
          </div>
          <span>Active accounts</span>
          <strong>{activeUsers}</strong>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon um-stat-muted">
            <XCircle size={20} />
          </div>
          <span>Inactive accounts</span>
          <strong>{inactiveUsers}</strong>
        </div>

        <div className="um-stat-card">
          <div className="um-stat-icon">
            <ShieldCheck size={20} />
          </div>
          <span>Super Admins</span>
          <strong>
            {users.filter((user) => user.role === "super_admin").length}
          </strong>
        </div>
      </div>

      <div className="um-content-card">
        <div className="um-toolbar">
          <div className="um-tabs">
            <button
              className={activeTab === "members" ? "active" : ""}
              onClick={() => setActiveTab("members")}
            >
              Team members
            </button>

            <button
              className={activeTab === "activity" ? "active" : ""}
              onClick={() => setActiveTab("activity")}
            >
              Activity history
            </button>
          </div>

          <button
            className="um-refresh-button"
            onClick={() => void loadAll(true)}
            disabled={refreshing}
            aria-label="Refresh user management"
          >
            <RefreshCw
              size={16}
              className={refreshing ? "um-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {activeTab === "members" ? (
          <>
            <div className="um-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search by name, email or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="um-table-wrap">
              <table className="um-table">
                <thead>
                  <tr>
                    <th>Team member</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last sign in</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div className="um-user-cell">
                          <div className="um-avatar">
                            {(user.full_name || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>
                              {user.full_name || "Unnamed user"}
                            </strong>
                            <span>{user.email}</span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <select
                          className="um-role-select"
                          value={user.role}
                          onChange={(e) =>
                            void changeRole(
                              user,
                              e.target.value as UserRole,
                            )
                          }
                        >
                          {roles.map((role) => (
                            <option
                              key={role.value}
                              value={role.value}
                            >
                              {role.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td>
                        <span
                          className={`um-status ${
                            user.is_active
                              ? "um-status-active"
                              : "um-status-inactive"
                          }`}
                        >
                          <span />
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>
                        <span className="um-date">
                          {user.last_sign_in_at
                            ? new Date(
                                user.last_sign_in_at,
                              ).toLocaleDateString()
                            : "Never"}
                        </span>
                      </td>

                      <td>
                        <button
                          className={`um-action-button ${
                            user.is_active ? "danger" : "positive"
                          }`}
                          onClick={() => void toggleStatus(user)}
                        >
                          {user.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={5} className="um-empty">
                        No team members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="um-activity-list">
            {activities.length === 0 ? (
              <div className="um-empty">
                <Clock3 size={25} />
                <p>No activity recorded yet.</p>
              </div>
            ) : (
              activities.map((activity) => (
                <div className="um-activity-item" key={activity.id}>
                  <div className="um-activity-icon">
                    <Clock3 size={17} />
                  </div>

                  <div className="um-activity-details">
                    <strong>
                      {activity.action.replaceAll("_", " ")}
                    </strong>
                    <span>
                      {activity.details ||
                        `Target user: ${
                          activity.target_user_id?.slice(0, 8) ?? "N/A"
                        }`}
                    </span>
                    <small>
                      {new Date(activity.created_at).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showInvite && (
        <div
          className="um-modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setShowInvite(false);
            }
          }}
        >
          <section className="um-modal">
            <div className="um-modal-heading">
              <div>
                <span className="um-eyebrow">TEAM ACCESS</span>
                <h2>Invite a team member</h2>
                <p>
                  Send an invitation to join Shreem Solutions.
                </p>
              </div>

              <button
                className="um-modal-close"
                onClick={() => setShowInvite(false)}
                aria-label="Close invitation form"
              >
                ×
              </button>
            </div>

            <form className="um-invite-form" onSubmit={inviteUser}>
              <label htmlFor="invite-name">Full name</label>
              <input
                id="invite-name"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Enter full name"
                maxLength={120}
                required
              />

              <label htmlFor="invite-email">Email address</label>
              <input
                id="invite-email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@company.com"
                maxLength={254}
                required
              />

              <label htmlFor="invite-role">Assign role</label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) =>
                  setInviteRole(e.target.value as UserRole)
                }
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>

              <div className="um-role-note">
                <ShieldCheck size={17} />
                <span>
                  The invited user will receive an email to set up
                  their account.
                </span>
              </div>

              <div className="um-modal-actions">
                <button
                  type="button"
                  className="um-secondary-button"
                  onClick={() => setShowInvite(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="um-primary-button"
                  disabled={saving}
                >
                  <Mail size={16} />
                  {saving ? "Sending..." : "Send invitation"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
