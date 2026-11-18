
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Users,
  FileText,
  RefreshCw,
  Globe2,
  ArrowUpRight,
  Eye,
  ChartNoAxesCombined,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import StatCard from "../components/StatCard";

type Stats = {
  products: number;
  leads: number;
  visitors: number;
  blogs: number;
  pageViews: number;
};

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    leads: 0,
    visitors: 0,
    blogs: 0,
    pageViews: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [productsResult, leadsResult, blogsResult, visitsResult] =
        await Promise.all([
          supabase
            .from("products")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("leads")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("blog_posts")
            .select("*", { count: "exact", head: true }),

          supabase
            .from("website_visits")
            .select("visitor_id, created_at")
            .gte("created_at", thirtyDaysAgo.toISOString()),
        ]);

      const failed =
        productsResult.error ||
        leadsResult.error ||
        blogsResult.error ||
        visitsResult.error;

      if (failed) {
        setError(failed.message);
        return;
      }

      const visits = visitsResult.data ?? [];

      const uniqueVisitors = new Set(
        visits.map((visit) => visit.visitor_id)
      ).size;

      setStats({
        products: productsResult.count ?? 0,
        leads: leadsResult.count ?? 0,
        blogs: blogsResult.count ?? 0,
        visitors: uniqueVisitors,
        pageViews: visits.length,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading dashboard data."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return (
    <div className="dashboard">
      {/* PAGE HEADING */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">OVERVIEW</span>
          <h1>Good to see you.</h1>
          <p>
            Here's what's happening across your business.
          </p>
        </div>

        <button
          type="button"
          className="refresh-button"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={loading ? "refresh-spinning" : ""}
          />
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          Could not load dashboard data: {error}
        </div>
      )}

      {/* WELCOME BANNER */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <span>SHREEM SOLUTIONS · ADMIN WORKSPACE</span>

          <h2>Beyond Every Border.</h2>

          <p>
            Manage your global trade business, product catalogue,
            customer relationships and website performance from
            one place.
          </p>
        </div>

        <div className="banner-globe">
          <Globe2 size={76} strokeWidth={0.8} />
        </div>
      </section>

      {/* STATISTICS */}
      <div className="metrics-grid">
        <StatCard
          title="Total Products"
          value={loading ? "—" : stats.products}
          description="Products in catalogue"
          icon={Package}
        />

        <StatCard
          title="Total Leads"
          value={loading ? "—" : stats.leads}
          description="Business opportunities"
          icon={Users}
        />

        <StatCard
          title="Unique Visitors"
          value={loading ? "—" : stats.visitors}
          description="Visitors in the last 30 days"
          icon={Eye}
        />

        <StatCard
          title="Blog Articles"
          value={loading ? "—" : stats.blogs}
          description="Published and draft articles"
          icon={FileText}
        />
      </div>

      {/* WEBSITE PERFORMANCE */}
      <section className="panel dashboard-traffic-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">WEBSITE PERFORMANCE</span>
            <h3>Visitor activity</h3>
          </div>

          <Link to="/analytics" className="dashboard-view-link">
            View analytics
            <ArrowUpRight size={16} />
          </Link>
        </div>

        <div className="dashboard-traffic-stats">
          <div>
            <span className="traffic-stat-icon">
              <Eye size={18} />
            </span>
            <div>
              <strong>
                {loading ? "—" : stats.visitors.toLocaleString()}
              </strong>
              <span>Unique visitors · 30 days</span>
            </div>
          </div>

          <div>
            <span className="traffic-stat-icon">
              <Globe2 size={18} />
            </span>
            <div>
              <strong>
                {loading ? "—" : stats.pageViews.toLocaleString()}
              </strong>
              <span>Total page views · 30 days</span>
            </div>
          </div>
        </div>
      </section>

      {/* LOWER DASHBOARD */}
      <div className="dashboard-lower">
        {/* BUSINESS OVERVIEW */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">MANAGEMENT</span>
              <h3>Business overview</h3>
            </div>

            <span className="live-indicator">
              <span className="status-dot" />
              Live connection
            </span>
          </div>

          <p className="panel-description">
            Your admin workspace is connected to Supabase.
            Manage your catalogue, customer relationships,
            website content and business performance.
          </p>

          <div className="system-row">
            <div>
              <strong>Database connection</strong>
              <span>Supabase PostgreSQL</span>
            </div>
            <span className="system-connected">Connected</span>
          </div>

          <div className="system-row">
            <div>
              <strong>Product management</strong>
              <span>{stats.products} products in catalogue</span>
            </div>
            <span className="system-connected">Active</span>
          </div>

          <div className="system-row">
            <div>
              <strong>Lead management</strong>
              <span>{stats.leads} business opportunities</span>
            </div>
            <span className="system-connected">Active</span>
          </div>

          <div className="system-row">
            <div>
              <strong>Website analytics</strong>
              <span>Visitor tracking · Last 30 days</span>
            </div>
            <span className="system-connected">Active</span>
          </div>
        </section>

        {/* QUICK ACCESS */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">QUICK ACCESS</span>
              <h3>Workspace modules</h3>
            </div>
          </div>

          <Link to="/products" className="setup-step">
            <div className="setup-step-icon">
              <Package size={18} />
            </div>

            <div>
              <strong>Product catalogue</strong>
              <span>Manage products and images</span>
            </div>

            <ArrowUpRight size={17} />
          </Link>

          <Link to="/leads" className="setup-step">
            <div className="setup-step-icon">
              <Users size={18} />
            </div>

            <div>
              <strong>Leads and CRM</strong>
              <span>Manage customer enquiries and opportunities</span>
            </div>

            <ArrowUpRight size={17} />
          </Link>

          <Link to="/blogs" className="setup-step">
            <div className="setup-step-icon">
              <FileText size={18} />
            </div>

            <div>
              <strong>Blog management</strong>
              <span>Create and publish articles</span>
            </div>

            <ArrowUpRight size={17} />
          </Link>

          <Link to="/analytics" className="setup-step">
            <div className="setup-step-icon">
              <ChartNoAxesCombined size={18} />
            </div>

            <div>
              <strong>Business analytics</strong>
              <span>Explore business and website reports</span>
            </div>

            <ArrowUpRight size={17} />
          </Link>
        </section>
      </div>

      {/* FOOTER */}
      <footer className="admin-footer">
        <span>SHREEM SOLUTIONS</span>
        <span>Global Trade Management Workspace</span>
      </footer>
    </div>
  );
}
