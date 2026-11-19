
import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import type { FormEvent } from "react";
import type { Session } from "@supabase/supabase-js";

import { ShieldCheck, Globe2 } from "lucide-react";

import { supabase } from "./lib/supabase";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Leads from "./pages/Leads";
import Blogs from "./pages/Blogs";
import Setting from "./pages/Setting";
import Analytics from "./pages/Analytics";
import UserManagement from "./pages/UserManagement";

import "./index.css";

type Profile = {
  full_name: string | null;
  role: string;
  is_active: boolean;
};

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  }

  return (
    <main className="login-screen">
      <section className="login-panel">
        <div className="login-brand">
          <div className="brand-symbol">S</div>
          <div>
            <strong>SHREEM SOLUTION</strong>
            <span>GLOBAL TRADE PARTNER</span>
          </div>
        </div>

        <div className="login-heading">
          <span className="eyebrow">ADMINISTRATION PORTAL</span>
          <h1>Welcome back.</h1>
          <p>
            Sign in to manage your products, enquiries and global
            business operations.
          </p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <label htmlFor="admin-email">Email address</label>
          <input
            id="admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {error && <p className="form-error">{error}</p>}

          <button
            className="login-button"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-security">
          <ShieldCheck size={16} />
          <span>Secure access for authorised personnel only</span>
        </div>
      </section>

      <section className="login-visual">
        <div className="visual-topline">
          <Globe2 size={17} />
          <span>SHREEM SOLUTION</span>
        </div>

        <div className="visual-content">
          <span>YOUR PARTNER IN GLOBAL TRADE</span>
          <h2>
            Beyond
            <br />
            Every Border.
          </h2>
          <p>
            Connecting markets and creating opportunities through
            reliable global sourcing and trade solutions.
          </p>
        </div>

        <div className="visual-footer">
          <span>CONNECTING MARKETS.</span>
          <span>INDIA · WORLDWIDE</span>
        </div>
      </section>
    </main>
  );
}

function AdminWorkspace({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setProfileLoading(true);
      setProfileError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, role, is_active")
        .eq("id", session.user.id)
        .single();

      if (!active) return;

      if (error) {
        setProfileError(error.message);
        setProfile(null);
      } else {
        setProfile(data as Profile);
      }

      setProfileLoading(false);
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [session.user.id]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  if (profileLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">S</div>
        <span>Loading your workspace...</span>
      </div>
    );
  }

  if (!profile || !profile.is_active) {
    return (
      <div className="access-denied">
        <h1>Admin profile unavailable</h1>
        <p>
          {profileError ||
            "Your account is not active or does not have an admin profile."}
        </p>
        <button onClick={onLogout}>Sign Out</button>
      </div>
    );
  }

  const allowedRoles = [
    "super_admin",
    "admin",
    "sales",
    "content_editor",
  ];

  if (!allowedRoles.includes(profile.role)) {
    return (
      <div className="access-denied">
        <h1>Access restricted</h1>
        <p>
          Your account does not have permission to access this workspace.
        </p>
        <button onClick={onLogout}>Sign Out</button>
      </div>
    );
  }

  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/products": "Products",
    "/leads": "Leads & CRM",
    "/blogs": "Blog Management",
    "/analytics": "Analytics",
    "/settings": "Website Settings",
    "/users": "User Management",
  };

  return (
    <div className="admin-shell">
      {mobileOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <Sidebar
          onLogout={onLogout}
          onClose={() => setMobileOpen(false)}
          role={profile.role}
        />
      </div>

      <main className="admin-main">
        <Header
          title={titles[location.pathname] ?? "Admin"}
          email={session.user.email ?? ""}
          fullName={profile.full_name ?? ""}
          role={profile.role}
          onMenuClick={() => setMobileOpen(true)}
        />

        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/blogs" element={<Blogs />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Setting />} />

            <Route
              path="/users"
              element={
                profile.role === "super_admin" ? (
                  <UserManagement />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

function AppContent() {
  const [session, setSession] = useState<Session | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data, error }) => {
      console.log("SUPABASE SESSION CHECK:", {
        error: error?.message ?? null,
        userId: data.session?.user?.id ?? null,
        email: data.session?.user?.email ?? null,
        hasAccessToken: Boolean(data.session?.access_token),
      });
    });
  }, []);
  useEffect(() => {
    let active = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      if (active) {
        setSession(currentSession);
        setChecking(false);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;

      if (error) {
        setSession(null);
      } else {
        setSession(data.session);
      }

      setChecking(false);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    await supabase.auth.signOut();
  }

  if (checking) {
    return (
      <div className="loading-screen">
        <div className="loading-mark">S</div>
        <span>Preparing your workspace...</span>
      </div>
    );
  }

  if (!session) {
    return <Login />;
  }

  return <AdminWorkspace session={session} onLogout={logout} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
