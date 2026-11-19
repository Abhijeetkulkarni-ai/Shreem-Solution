
import { useEffect, useState, type FormEvent } from "react";
import {
  Save,
  RefreshCw,
  Building2,
  Phone,
  Globe,
  Search,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "../lib/supabase";
import "./settings.css";

type SiteSettings = {
  id?: string;
  company_name: string;
  tagline: string;
  description: string;
  email: string;
  phone: string;
  alternate_phone: string;
  address: string;
  city: string;
  country: string;
  business_hours: string;
  website_url: string;
  facebook_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  seo_title: string;
  seo_description: string;
};

const initialSettings: SiteSettings = {
  company_name: "SHREEM SOLUTION",
  tagline: "Beyond Every Border.",
  description: "",
  email: "",
  phone: "",
  alternate_phone: "",
  address: "",
  city: "",
  country: "India",
  business_hours: "",
  website_url: "",
  facebook_url: "",
  instagram_url: "",
  linkedin_url: "",
  youtube_url: "",
  seo_title: "",
  seo_description: "",
};

export default function Setting() {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    setLoading(true);
    setError("");

    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error) {
      setError(error.message);
    } else if (data) {
      setSettings({ ...initialSettings, ...data });
    }

    setLoading(false);
  }

  function updateField(field: keyof SiteSettings, value: string) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));
    setSuccess("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setSuccess("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const payload = {
      ...settings,
      updated_by: user?.id ?? null,
    };

    const query = settings.id
      ? supabase
          .from("site_settings")
          .update(payload)
          .eq("id", settings.id)
      : supabase
          .from("site_settings")
          .insert(payload)
          .select()
          .single();

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      if (data) {
        setSettings({ ...initialSettings, ...data });
      }
      setSuccess("Website settings saved successfully.");
      await loadSettings();
    }

    setSaving(false);
  }

  function input(
    label: string,
    field: keyof SiteSettings,
    placeholder = "",
    type = "text"
  ) {
    return (
      <label className="settings-field">
        <span>{label}</span>
        <input
          type={type}
          value={settings[field] ?? ""}
          placeholder={placeholder}
          onChange={(event) => updateField(field, event.target.value)}
        />
      </label>
    );
  }

  function textarea(
    label: string,
    field: keyof SiteSettings,
    placeholder = ""
  ) {
    return (
      <label className="settings-field settings-field-full">
        <span>{label}</span>
        <textarea
          value={settings[field] ?? ""}
          placeholder={placeholder}
          rows={4}
          onChange={(event) => updateField(field, event.target.value)}
        />
      </label>
    );
  }

  if (loading) {
    return (
      <div className="settings-loading">
        <RefreshCw size={20} className="settings-spin" />
        Loading website settings...
      </div>
    );
  }

  return (
    <div className="settings-page">
      <div className="settings-heading">
        <div>
          <span className="settings-eyebrow">WEBSITE CONFIGURATION</span>
          <h1>Website Settings</h1>
          <p>Manage your company information and website details.</p>
        </div>

        <button
          className="settings-save"
          onClick={() =>
            (document.getElementById("settings-form") as HTMLFormElement | null)?.requestSubmit()
          }
          disabled={saving}
        >
          <Save size={17} />
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && <div className="settings-alert error">{error}</div>}
      {success && (
        <div className="settings-alert success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      <form id="settings-form" onSubmit={handleSubmit}>
        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">
              <Building2 size={19} />
            </div>
            <div>
              <h2>Company Information</h2>
              <p>Your business identity and introduction.</p>
            </div>
          </div>

          <div className="settings-grid">
            {input("Company Name", "company_name")}
            {input("Tagline", "tagline")}
            {textarea("Company Description", "description")}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">
              <Phone size={19} />
            </div>
            <div>
              <h2>Contact Information</h2>
              <p>How customers can reach your company.</p>
            </div>
          </div>

          <div className="settings-grid">
            {input("Business Email", "email", "info@example.com", "email")}
            {input("Primary Phone", "phone", "+91 00000 00000", "tel")}
            {input("Alternate Phone", "alternate_phone", "+91 00000 00000", "tel")}
            {input("Business Hours", "business_hours", "Mon–Sat, 9 AM–6 PM")}
            {textarea("Office Address", "address")}
            {input("City", "city")}
            {input("Country", "country")}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">
              <Globe size={19} />
            </div>
            <div>
              <h2>Online Presence</h2>
              <p>Your website and social media profiles.</p>
            </div>
          </div>

          <div className="settings-grid">
            {input("Website URL", "website_url", "https://example.com")}
            {input("Facebook URL", "facebook_url", "https://facebook.com/...")}
            {input("Instagram URL", "instagram_url", "https://instagram.com/...")}
            {input("LinkedIn URL", "linkedin_url", "https://linkedin.com/...")}
            {input("YouTube URL", "youtube_url", "https://youtube.com/...")}
          </div>
        </section>

        <section className="settings-card">
          <div className="settings-card-heading">
            <div className="settings-icon">
              <Search size={19} />
            </div>
            <div>
              <h2>SEO Settings</h2>
              <p>Improve how your website appears in search engines.</p>
            </div>
          </div>

          <div className="settings-grid">
            {input("SEO Page Title", "seo_title", "SHREEM SOLUTION | Global Trade")}
            {textarea(
              "SEO Meta Description",
              "seo_description",
              "Describe your company for search engine results..."
            )}
          </div>
        </section>

        <div className="settings-bottom">
          <span>Changes are saved to your Supabase database.</span>
          <button type="submit" className="settings-save" disabled={saving}>
            <Save size={17} />
            {saving ? "Saving..." : "Save All Settings"}
          </button>
        </div>
      </form>
    </div>
  );
}
