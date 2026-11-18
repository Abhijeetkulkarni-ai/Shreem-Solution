
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Search,
  Plus,
  Building2,
  Users,
  Target,
  Trophy,
  Pencil,
  Trash2,
  X,
  RefreshCw,
  CalendarClock,
  Mail,
  Phone,
  MapPin,
  Filter,
} from "lucide-react";
import { supabase } from "../lib/supabase";


type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "negotiation"
  | "won"
  | "lost";

type LeadPriority = "low" | "normal" | "high";

type Lead = {
  id: string;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  country: string | null;
  city: string | null;
  website: string | null;
  product_interest: string | null;
  estimated_value: number | null;
  currency: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  assigned_to: string | null;
  next_follow_up_at: string | null;
  notes: string | null;
  created_at: string;
};

type LeadForm = {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  website: string;
  product_interest: string;
  estimated_value: string;
  currency: string;
  source: string;
  status: LeadStatus;
  priority: LeadPriority;
  next_follow_up_at: string;
  notes: string;
};

const emptyForm: LeadForm = {
  company_name: "",
  contact_name: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  website: "",
  product_interest: "",
  estimated_value: "",
  currency: "USD",
  source: "manual",
  status: "new",
  priority: "normal",
  next_follow_up_at: "",
  notes: "",
};

const statuses: LeadStatus[] = [
  "new",
  "contacted",
  "qualified",
  "negotiation",
  "won",
  "lost",
];

function toLocalDateTime(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatCurrency(value: number | null, currency: string) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [form, setForm] = useState<LeadForm>(emptyForm);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError("");

    const { data, error: fetchError } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLeads([]);
    } else {
      setLeads((data || []) as Lead[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    const query = search.toLowerCase().trim();

    return leads.filter((lead) => {
      const matchesSearch =
        !query ||
        [
          lead.company_name,
          lead.contact_name,
          lead.email,
          lead.phone,
          lead.country,
          lead.product_interest,
        ]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" || lead.status === statusFilter;

      const matchesPriority =
        priorityFilter === "all" || lead.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [leads, search, statusFilter, priorityFilter]);

  const stats = useMemo(
    () => ({
      total: leads.length,
      new: leads.filter((lead) => lead.status === "new").length,
      qualified: leads.filter((lead) => lead.status === "qualified").length,
      won: leads.filter((lead) => lead.status === "won").length,
    }),
    [leads],
  );

  function openCreateModal() {
    setEditingLead(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(lead: Lead) {
    setEditingLead(lead);

    setForm({
      company_name: lead.company_name || "",
      contact_name: lead.contact_name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      country: lead.country || "",
      city: lead.city || "",
      website: lead.website || "",
      product_interest: lead.product_interest || "",
      estimated_value:
        lead.estimated_value !== null ? String(lead.estimated_value) : "",
      currency: lead.currency || "USD",
      source: lead.source || "manual",
      status: lead.status,
      priority: lead.priority,
      next_follow_up_at: toLocalDateTime(lead.next_follow_up_at),
      notes: lead.notes || "",
    });

    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingLead(null);
    setForm(emptyForm);
  }

  function updateField<K extends keyof LeadForm>(
    field: K,
    value: LeadForm[K],
  ) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const estimatedValue = form.estimated_value.trim()
      ? Number(form.estimated_value)
      : null;

    if (
      estimatedValue !== null &&
      (!Number.isFinite(estimatedValue) || estimatedValue < 0)
    ) {
      setError("Please enter a valid estimated value.");
      setSaving(false);
      return;
    }

    const payload = {
      company_name: form.company_name.trim(),
      contact_name: form.contact_name.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      country: form.country.trim() || null,
      city: form.city.trim() || null,
      website: form.website.trim() || null,
      product_interest: form.product_interest.trim() || null,
      estimated_value: estimatedValue,
      currency: form.currency,
      source: form.source,
      status: form.status,
      priority: form.priority,
      next_follow_up_at: form.next_follow_up_at
        ? new Date(form.next_follow_up_at).toISOString()
        : null,
      notes: form.notes.trim() || null,
    };

    let result;

    if (editingLead) {
      result = await supabase
        .from("leads")
        .update(payload)
        .eq("id", editingLead.id);
    } else {
      const { data: userData } = await supabase.auth.getUser();

      result = await supabase.from("leads").insert({
        ...payload,
        created_by: userData.user?.id ?? null,
      });
    }

    if (result.error) {
      setError(result.error.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    setModalOpen(false);
    setEditingLead(null);
    setForm(emptyForm);

    await fetchLeads();
  }

  async function handleDelete(lead: Lead) {
    const confirmed = window.confirm(
      `Delete the lead for "${lead.company_name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    const { error: deleteError } = await supabase
      .from("leads")
      .delete()
      .eq("id", lead.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setLeads((current) =>
      current.filter((item) => item.id !== lead.id),
    );
  }

  async function updateStatus(lead: Lead, status: LeadStatus) {
    const { error: updateError } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", lead.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setLeads((current) =>
      current.map((item) =>
        item.id === lead.id ? { ...item, status } : item,
      ),
    );
  }

  return (
    <div className="leads-page">
      <div className="leads-page-header">
        <div>
          <span className="leads-eyebrow">CUSTOMER RELATIONSHIP MANAGEMENT</span>
          <h1>Leads & CRM</h1>
          <p>Manage prospects, track opportunities and build relationships.</p>
        </div>

        <button className="leads-primary-button" onClick={openCreateModal}>
          <Plus size={17} />
          Add Lead
        </button>
      </div>

      <div className="leads-stats-grid">
        <div className="leads-stat-card">
          <div className="leads-stat-icon">
            <Building2 size={19} />
          </div>
          <div>
            <span>Total Leads</span>
            <strong>{stats.total}</strong>
            <small>All recorded prospects</small>
          </div>
        </div>

        <div className="leads-stat-card">
          <div className="leads-stat-icon leads-stat-blue">
            <Users size={19} />
          </div>
          <div>
            <span>New Leads</span>
            <strong>{stats.new}</strong>
            <small>Awaiting first contact</small>
          </div>
        </div>

        <div className="leads-stat-card">
          <div className="leads-stat-icon leads-stat-amber">
            <Target size={19} />
          </div>
          <div>
            <span>Qualified</span>
            <strong>{stats.qualified}</strong>
            <small>Potential opportunities</small>
          </div>
        </div>

        <div className="leads-stat-card">
          <div className="leads-stat-icon leads-stat-green">
            <Trophy size={19} />
          </div>
          <div>
            <span>Won Deals</span>
            <strong>{stats.won}</strong>
            <small>Successfully converted</small>
          </div>
        </div>
      </div>

      <div className="leads-content-card">
        <div className="leads-toolbar">
          <div>
            <h2>All Leads</h2>
            <p>{filteredLeads.length} records found</p>
          </div>

          <div className="leads-toolbar-controls">
            <div className="leads-search">
              <Search size={17} />
              <input
                type="search"
                placeholder="Search leads..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div className="leads-filter">
              <Filter size={15} />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All statuses</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="leads-filter">
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
              >
                <option value="all">All priorities</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>

            <button
              className="leads-icon-button"
              onClick={fetchLeads}
              title="Refresh leads"
              type="button"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {error && !modalOpen && (
          <div className="leads-error-banner">{error}</div>
        )}

        {loading ? (
          <div className="leads-state">
            <RefreshCw className="leads-spinner" size={22} />
            <span>Loading leads...</span>
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="leads-empty">
            <div className="leads-empty-icon">
              <Building2 size={25} />
            </div>
            <h3>{leads.length === 0 ? "No leads yet" : "No matching leads"}</h3>
            <p>
              {leads.length === 0
                ? "Start building your pipeline by adding your first lead."
                : "Try changing your search or filters."}
            </p>
            {leads.length === 0 && (
              <button className="leads-primary-button" onClick={openCreateModal}>
                <Plus size={16} />
                Add your first lead
              </button>
            )}
          </div>
        ) : (
          <div className="leads-table-wrapper">
            <table className="leads-table">
              <thead>
                <tr>
                  <th>Company / Contact</th>
                  <th>Contact Details</th>
                  <th>Interest</th>
                  <th>Est. Value</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Next Follow-up</th>
                  <th></th>
                </tr>
              </thead>

              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>
                      <div className="leads-company-cell">
                        <div className="leads-company-avatar">
                          {lead.company_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong>{lead.company_name}</strong>
                          <span>{lead.contact_name || "Contact not added"}</span>
                          {(lead.city || lead.country) && (
                            <small>
                              <MapPin size={11} />
                              {[lead.city, lead.country].filter(Boolean).join(", ")}
                            </small>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="leads-contact-cell">
                        {lead.email && (
                          <span><Mail size={12} />{lead.email}</span>
                        )}
                        {lead.phone && (
                          <span><Phone size={12} />{lead.phone}</span>
                        )}
                        {!lead.email && !lead.phone && <span>—</span>}
                      </div>
                    </td>

                    <td>
                      <span className="leads-interest">
                        {lead.product_interest || "General"}
                      </span>
                    </td>

                    <td className="leads-value">
                      {formatCurrency(lead.estimated_value, lead.currency)}
                    </td>

                    <td>
                      <select
                        className={`leads-status-select status-${lead.status}`}
                        value={lead.status}
                        onChange={(event) =>
                          updateStatus(lead, event.target.value as LeadStatus)
                        }
                        aria-label={`Status for ${lead.company_name}`}
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <span className={`leads-priority priority-${lead.priority}`}>
                        <span />
                        {lead.priority}
                      </span>
                    </td>

                    <td>
                      <div className="leads-followup">
                        <CalendarClock size={13} />
                        {formatDate(lead.next_follow_up_at)}
                      </div>
                    </td>

                    <td>
                      <div className="leads-row-actions">
                        <button
                          type="button"
                          title="Edit lead"
                          onClick={() => openEditModal(lead)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          title="Delete lead"
                          className="leads-delete-action"
                          onClick={() => handleDelete(lead)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="leads-modal-overlay" onMouseDown={closeModal}>
          <div
            className="leads-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="leads-modal-header">
              <div>
                <span className="leads-eyebrow">LEAD MANAGEMENT</span>
                <h2>{editingLead ? "Edit Lead" : "Add New Lead"}</h2>
                <p>
                  {editingLead
                    ? "Update the prospect's information."
                    : "Enter the details of your new prospect."}
                </p>
              </div>

              <button
                type="button"
                className="leads-modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="leads-form-body">
                <div className="leads-form-section">
                  <h3>Company & Contact</h3>

                  <div className="leads-form-grid">
                    <label className="leads-field full">
                      Company Name *
                      <input
                        required
                        value={form.company_name}
                        onChange={(event) =>
                          updateField("company_name", event.target.value)
                        }
                        placeholder="e.g. Global Trading LLC"
                      />
                    </label>

                    <label className="leads-field">
                      Contact Person
                      <input
                        value={form.contact_name}
                        onChange={(event) =>
                          updateField("contact_name", event.target.value)
                        }
                        placeholder="Full name"
                      />
                    </label>

                    <label className="leads-field">
                      Email Address
                      <input
                        type="email"
                        value={form.email}
                        onChange={(event) =>
                          updateField("email", event.target.value)
                        }
                        placeholder="name@company.com"
                      />
                    </label>

                    <label className="leads-field">
                      Phone Number
                      <input
                        value={form.phone}
                        onChange={(event) =>
                          updateField("phone", event.target.value)
                        }
                        placeholder="+971..."
                      />
                    </label>

                    <label className="leads-field">
                      Website
                      <input
                        value={form.website}
                        onChange={(event) =>
                          updateField("website", event.target.value)
                        }
                        placeholder="https://"
                      />
                    </label>

                    <label className="leads-field">
                      City
                      <input
                        value={form.city}
                        onChange={(event) =>
                          updateField("city", event.target.value)
                        }
                        placeholder="City"
                      />
                    </label>

                    <label className="leads-field">
                      Country
                      <input
                        value={form.country}
                        onChange={(event) =>
                          updateField("country", event.target.value)
                        }
                        placeholder="Country"
                      />
                    </label>
                  </div>
                </div>

                <div className="leads-form-section">
                  <h3>Opportunity Details</h3>

                  <div className="leads-form-grid">
                    <label className="leads-field full">
                      Product / Service Interest
                      <input
                        value={form.product_interest}
                        onChange={(event) =>
                          updateField("product_interest", event.target.value)
                        }
                        placeholder="e.g. Agricultural commodities"
                      />
                    </label>

                    <label className="leads-field">
                      Estimated Value
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.estimated_value}
                        onChange={(event) =>
                          updateField("estimated_value", event.target.value)
                        }
                        placeholder="0.00"
                      />
                    </label>

                    <label className="leads-field">
                      Currency
                      <select
                        value={form.currency}
                        onChange={(event) =>
                          updateField("currency", event.target.value)
                        }
                      >
                        <option value="USD">USD — US Dollar</option>
                        <option value="INR">INR — Indian Rupee</option>
                        <option value="AED">AED — UAE Dirham</option>
                        <option value="EUR">EUR — Euro</option>
                        <option value="GBP">GBP — British Pound</option>
                      </select>
                    </label>

                    <label className="leads-field">
                      Lead Source
                      <select
                        value={form.source}
                        onChange={(event) =>
                          updateField("source", event.target.value)
                        }
                      >
                        <option value="manual">Manual</option>
                        <option value="website">Website</option>
                        <option value="referral">Referral</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="trade_fair">Trade Fair</option>
                        <option value="email">Email</option>
                        <option value="other">Other</option>
                      </select>
                    </label>

                    <label className="leads-field">
                      Priority
                      <select
                        value={form.priority}
                        onChange={(event) =>
                          updateField("priority", event.target.value as LeadPriority)
                        }
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="leads-form-section">
                  <h3>Pipeline & Follow-up</h3>

                  <div className="leads-form-grid">
                    <label className="leads-field">
                      Lead Status
                      <select
                        value={form.status}
                        onChange={(event) =>
                          updateField("status", event.target.value as LeadStatus)
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="leads-field">
                      Next Follow-up
                      <input
                        type="datetime-local"
                        value={form.next_follow_up_at}
                        onChange={(event) =>
                          updateField("next_follow_up_at", event.target.value)
                        }
                      />
                    </label>

                    <label className="leads-field full">
                      Internal Notes
                      <textarea
                        rows={3}
                        value={form.notes}
                        onChange={(event) =>
                          updateField("notes", event.target.value)
                        }
                        placeholder="Add internal notes about this prospect..."
                      />
                    </label>
                  </div>
                </div>

                {error && <div className="leads-error-banner">{error}</div>}
              </div>

              <div className="leads-modal-footer">
                <button
                  type="button"
                  className="leads-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="leads-primary-button"
                  disabled={saving}
                >
                  {saving ? "Saving..." : editingLead ? "Save Changes" : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Leads;
