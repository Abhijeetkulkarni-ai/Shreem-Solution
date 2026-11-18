
import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Users,
  UserPlus,
  Target,
  Trophy,
  Package,
  FileText,
  TrendingUp,
  BarChart3,
  Eye,
  Globe,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./analytics.css";

type Lead = {
  id: string;
  company_name: string;
  product_interest: string | null;
  source: string;
  status: string;
  created_at: string;
};

type Product = {
  id: string;
  status: string;
};

type Blog = {
  id: string;
  status: string;
};

type WebsiteVisit = {
  id: string;
  visitor_id: string;
  page_path: string;
  referrer: string | null;
  created_at: string;
};

const pipelineStatuses = [
  { key: "new", label: "New" },
  { key: "contacted", label: "Contacted" },
  { key: "qualified", label: "Qualified" },
  { key: "negotiation", label: "Negotiation" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
];

const numberFormat = new Intl.NumberFormat("en-IN");

function getLastSixMonths() {
  const months: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);

    months.push({
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-IN", { month: "short" }),
    });
  }

  return months;
}

export default function Analytics() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [visits, setVisits] = useState<WebsiteVisit[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAnalytics() {
    setLoading(true);
    setError("");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      leadsResult,
      productsResult,
      blogsResult,
      visitsResult,
    ] = await Promise.all([
      supabase
        .from("leads")
        .select("id, company_name, product_interest, source, status, created_at")
        .order("created_at", { ascending: false }),

      supabase
        .from("products")
        .select("id, status"),

      supabase
        .from("blog_posts")
        .select("id, status"),

      supabase
        .from("website_visits")
        .select("id, visitor_id, page_path, referrer, created_at")
        .gte("created_at", thirtyDaysAgo.toISOString())
        .order("created_at", { ascending: false }),
    ]);

    const errors = [
      leadsResult.error,
      productsResult.error,
      blogsResult.error,
      visitsResult.error,
    ].filter(Boolean);

    if (errors.length) {
      setError(errors.map((item) => item?.message).join(" | "));
    }

    setLeads((leadsResult.data ?? []) as Lead[]);
    setProducts((productsResult.data ?? []) as Product[]);
    setBlogs((blogsResult.data ?? []) as Blog[]);
    setVisits((visitsResult.data ?? []) as WebsiteVisit[]);

    setLoading(false);
  }

  useEffect(() => {
    loadAnalytics();
  }, []);

  // BUSINESS METRICS

  const metrics = useMemo(() => {
    const total = leads.length;

    const newLeads = leads.filter(
      (lead) => lead.status === "new"
    ).length;

    const qualified = leads.filter(
      (lead) => lead.status === "qualified"
    ).length;

    const won = leads.filter(
      (lead) => lead.status === "won"
    ).length;

    const lost = leads.filter(
      (lead) => lead.status === "lost"
    ).length;

    const closed = won + lost;
    const conversion = closed > 0 ? (won / closed) * 100 : 0;

    const now = new Date();

    const thisMonth = leads.filter((lead) => {
      const date = new Date(lead.created_at);

      return (
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;

    return {
      total,
      newLeads,
      qualified,
      won,
      lost,
      conversion,
      thisMonth,
      active: total - won - lost,
    };
  }, [leads]);

  // MONTHLY LEAD GENERATION

  const monthlyData = useMemo(() => {
    const months = getLastSixMonths();

    return months.map((month) => ({
      ...month,
      count: leads.filter((lead) => {
        const date = new Date(lead.created_at);

        const key = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        return key === month.key;
      }).length,
    }));
  }, [leads]);

  // LEAD PIPELINE

  const pipeline = useMemo(
    () =>
      pipelineStatuses.map((status) => ({
        ...status,
        count: leads.filter(
          (lead) => lead.status === status.key
        ).length,
      })),
    [leads]
  );

  // LEAD SOURCES

  const sources = useMemo(() => {
    const counts = new Map<string, number>();

    leads.forEach((lead) => {
      const source = lead.source?.trim() || "unknown";

      counts.set(
        source,
        (counts.get(source) ?? 0) + 1
      );
    });

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [leads]);

  // PRODUCT INTEREST

  const productInterests = useMemo(() => {
    const counts = new Map<string, number>();

    leads.forEach((lead) => {
      const product = lead.product_interest?.trim();

      if (product) {
        counts.set(
          product,
          (counts.get(product) ?? 0) + 1
        );
      }
    });

    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [leads]);

  // WEBSITE VISITOR METRICS

  const visitorMetrics = useMemo(() => {
    const today = new Date().toDateString();

    const uniqueVisitors = new Set(
      visits.map((visit) => visit.visitor_id)
    );

    const todayVisitors = new Set(
      visits
        .filter(
          (visit) =>
            new Date(visit.created_at).toDateString() === today
        )
        .map((visit) => visit.visitor_id)
    );

    return {
      unique: uniqueVisitors.size,
      pageViews: visits.length,
      today: todayVisitors.size,
    };
  }, [visits]);

  // MOST VISITED PAGES

  const topPages = useMemo(() => {
    const counts = new Map<string, number>();

    visits.forEach((visit) => {
      counts.set(
        visit.page_path,
        (counts.get(visit.page_path) ?? 0) + 1
      );
    });

    return [...counts.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [visits]);

  // DAILY UNIQUE VISITORS - LAST 30 DAYS

  const dailyVisitors = useMemo(() => {
    const days: {
      key: string;
      label: string;
      visitors: Set<string>;
    }[] = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      days.push({
        key: date.toDateString(),
        label: date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        }),
        visitors: new Set<string>(),
      });
    }

    const dayMap = new Map(
      days.map((day) => [day.key, day])
    );

    visits.forEach((visit) => {
      const key = new Date(
        visit.created_at
      ).toDateString();

      dayMap.get(key)?.visitors.add(visit.visitor_id);
    });

    return days.map((day) => ({
      key: day.key,
      label: day.label,
      count: day.visitors.size,
    }));
  }, [visits]);

  // CHART LIMITS

  const maxMonthly = Math.max(
    ...monthlyData.map((item) => item.count),
    1
  );

  const maxPipeline = Math.max(
    ...pipeline.map((item) => item.count),
    1
  );

  const maxSource = Math.max(
    ...sources.map((item) => item.count),
    1
  );

  const maxInterest = Math.max(
    ...productInterests.map((item) => item.count),
    1
  );

  const maxDailyVisitors = Math.max(
    ...dailyVisitors.map((day) => day.count),
    1
  );

  const maxTopPage = Math.max(
    ...topPages.map((page) => page.count),
    1
  );

  if (loading) {
    return (
      <div className="analytics-loading">
        <RefreshCw className="analytics-spin" size={20} />
        Loading business analytics...
      </div>
    );
  }

  return (
    <div className="analytics-page">

      {/* HEADER */}

      <header className="analytics-heading">
        <div>
          <span className="analytics-eyebrow">
            BUSINESS INTELLIGENCE
          </span>

          <h1>Analytics</h1>

          <p>
            Understand your leads, website traffic and business activity.
          </p>
        </div>

        <button
          className="analytics-refresh"
          onClick={loadAnalytics}
          disabled={loading}
        >
          <RefreshCw size={16} />
          Refresh data
        </button>
      </header>

      {error && (
        <div className="analytics-error">
          Some analytics data could not be loaded: {error}
        </div>
      )}

      {/* BUSINESS OVERVIEW */}

      <section className="analytics-stat-grid">

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>Total Leads</span>
            <span className="analytics-stat-icon">
              <Users size={19} />
            </span>
          </div>
          <strong>{numberFormat.format(metrics.total)}</strong>
          <small>All recorded leads</small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>New This Month</span>
            <span className="analytics-stat-icon">
              <UserPlus size={19} />
            </span>
          </div>
          <strong>{numberFormat.format(metrics.thisMonth)}</strong>
          <small>Leads created this month</small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>Qualified Leads</span>
            <span className="analytics-stat-icon">
              <Target size={19} />
            </span>
          </div>
          <strong>{numberFormat.format(metrics.qualified)}</strong>
          <small>Currently qualified</small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>Deals Won</span>
            <span className="analytics-stat-icon">
              <Trophy size={19} />
            </span>
          </div>
          <strong>{numberFormat.format(metrics.won)}</strong>
          <small>Successfully converted</small>
        </article>

      </section>

      {/* BUSINESS SUMMARY */}

      <section className="analytics-stat-grid analytics-secondary-stats">

        <article className="analytics-mini-stat">
          <Package size={18} />
          <div>
            <strong>{numberFormat.format(products.length)}</strong>
            <span>Total Products</span>
          </div>
        </article>

        <article className="analytics-mini-stat">
          <FileText size={18} />
          <div>
            <strong>{numberFormat.format(blogs.length)}</strong>
            <span>Total Blog Posts</span>
          </div>
        </article>

        <article className="analytics-mini-stat">
          <TrendingUp size={18} />
          <div>
            <strong>{metrics.conversion.toFixed(1)}%</strong>
            <span>Closed-deal conversion</span>
          </div>
        </article>

        <article className="analytics-mini-stat">
          <BarChart3 size={18} />
          <div>
            <strong>{numberFormat.format(metrics.active)}</strong>
            <span>Open Pipeline Leads</span>
          </div>
        </article>

      </section>

      {/* WEBSITE VISITOR OVERVIEW */}

      <div className="analytics-section-heading">
        <div>
          <span className="analytics-eyebrow">
            WEBSITE PERFORMANCE
          </span>
          <h2>Website Visitors</h2>
          <p>Traffic and visitor activity over the last 30 days.</p>
        </div>
        <Globe size={23} />
      </div>

      <section className="analytics-stat-grid analytics-visitor-stats">

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>Unique Visitors</span>
            <span className="analytics-stat-icon">
              <Users size={19} />
            </span>
          </div>
          <strong>
            {numberFormat.format(visitorMetrics.unique)}
          </strong>
          <small>Last 30 days</small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>Page Views</span>
            <span className="analytics-stat-icon">
              <Eye size={19} />
            </span>
          </div>
          <strong>
            {numberFormat.format(visitorMetrics.pageViews)}
          </strong>
          <small>Last 30 days</small>
        </article>

        <article className="analytics-stat-card">
          <div className="analytics-stat-top">
            <span>Visitors Today</span>
            <span className="analytics-stat-icon">
              <UserPlus size={19} />
            </span>
          </div>
          <strong>
            {numberFormat.format(visitorMetrics.today)}
          </strong>
          <small>Unique visitors today</small>
        </article>

      </section>

      {/* WEBSITE TRAFFIC AND TOP PAGES */}

      <div className="analytics-main-grid">

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Website Traffic</h2>
              <p>Daily unique visitors over the last 30 days</p>
            </div>
            <span className="analytics-card-label">
              30 DAYS
            </span>
          </div>

          <div className="visitor-chart">
            {dailyVisitors.map((day) => (
              <div
                className="visitor-chart-column"
                key={day.key}
                title={`${day.label}: ${day.count} visitors`}
              >
                <span className="visitor-chart-value">
                  {day.count || ""}
                </span>

                <div className="visitor-chart-track">
                  <div
                    className="visitor-chart-bar"
                    style={{
                      height: `${
                        day.count
                          ? Math.max(
                              (day.count / maxDailyVisitors) * 100,
                              5
                            )
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="visitor-chart-footer">
            <span>{dailyVisitors[0]?.label}</span>
            <span>{dailyVisitors[29]?.label}</span>
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Most Visited Pages</h2>
              <p>Top pages by page views</p>
            </div>
          </div>

          {topPages.length ? (
            <div className="analytics-bars">
              {topPages.map((page) => (
                <div className="analytics-bar-item" key={page.path}>
                  <div className="analytics-bar-info">
                    <span>{page.path}</span>
                    <strong>{page.count}</strong>
                  </div>

                  <div className="analytics-horizontal-track">
                    <div
                      className="analytics-horizontal-fill"
                      style={{
                        width: `${(page.count / maxTopPage) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="analytics-empty">
              No website visits recorded yet.
            </p>
          )}
        </section>

      </div>

      {/* LEAD GENERATION AND PIPELINE */}

      <div className="analytics-main-grid">

        <section className="analytics-card analytics-trend-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Lead Generation</h2>
              <p>New leads over the last six months</p>
            </div>
            <span className="analytics-card-label">
              6 MONTHS
            </span>
          </div>

          <div className="analytics-chart">
            {monthlyData.map((item) => (
              <div
                className="analytics-chart-column"
                key={item.key}
              >
                <span className="analytics-chart-value">
                  {item.count}
                </span>

                <div className="analytics-chart-track">
                  <div
                    className="analytics-chart-bar"
                    style={{
                      height: `${
                        Math.max(
                          (item.count / maxMonthly) * 100,
                          item.count ? 5 : 0
                        )
                      }%`,
                    }}
                  />
                </div>

                <span className="analytics-chart-label">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Lead Pipeline</h2>
              <p>Current distribution by status</p>
            </div>
          </div>

          <div className="analytics-bars">
            {pipeline.map((item) => (
              <div
                className="analytics-bar-item"
                key={item.key}
              >
                <div className="analytics-bar-info">
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>

                <div className="analytics-horizontal-track">
                  <div
                    className={`analytics-horizontal-fill status-${item.key}`}
                    style={{
                      width: `${(item.count / maxPipeline) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* LEAD SOURCES */}

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Lead Sources</h2>
              <p>Where your leads come from</p>
            </div>
          </div>

          {sources.length ? (
            <div className="analytics-bars">
              {sources.map((item) => (
                <div
                  className="analytics-bar-item"
                  key={item.name}
                >
                  <div className="analytics-bar-info">
                    <span className="analytics-capitalize">
                      {item.name}
                    </span>
                    <strong>{item.count}</strong>
                  </div>

                  <div className="analytics-horizontal-track">
                    <div
                      className="analytics-horizontal-fill"
                      style={{
                        width: `${(item.count / maxSource) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="analytics-empty">
              No lead source data available yet.
            </p>
          )}
        </section>

        {/* PRODUCT INTEREST */}

        <section className="analytics-card">
          <div className="analytics-card-heading">
            <div>
              <h2>Product Interest</h2>
              <p>Most requested products in your leads</p>
            </div>
          </div>

          {productInterests.length ? (
            <div className="analytics-bars">
              {productInterests.map((item) => (
                <div
                  className="analytics-bar-item"
                  key={item.name}
                >
                  <div className="analytics-bar-info">
                    <span>{item.name}</span>
                    <strong>{item.count}</strong>
                  </div>

                  <div className="analytics-horizontal-track">
                    <div
                      className="analytics-horizontal-fill interest-fill"
                      style={{
                        width: `${(item.count / maxInterest) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="analytics-empty">
              No product interest recorded yet.
            </p>
          )}
        </section>

      </div>

      {/* RECENT LEADS */}

      <section className="analytics-card analytics-table-card">
        <div className="analytics-card-heading">
          <div>
            <h2>Recent Leads</h2>
            <p>Your latest recorded business enquiries</p>
          </div>

          <span className="analytics-card-label">
            LATEST 5
          </span>
        </div>

        {leads.length ? (
          <div className="analytics-table-wrap">
            <table className="analytics-table">
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Product Interest</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {leads.slice(0, 5).map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.company_name}</td>
                    <td>{lead.product_interest || "—"}</td>
                    <td className="analytics-capitalize">
                      {lead.source || "—"}
                    </td>
                    <td>
                      <span
                        className={`analytics-status status-${lead.status}`}
                      >
                        {lead.status}
                      </span>
                    </td>
                    <td>
                      {new Date(
                        lead.created_at
                      ).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="analytics-empty">
            Your recent leads will appear here.
          </p>
        )}
      </section>

      <p className="analytics-footnote">
        Business analytics use your CRM records. Website visitor
        metrics show recorded browser IDs and page views from the
        last 30 days.
      </p>

    </div>
  );
}
