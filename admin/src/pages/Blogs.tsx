
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  ImagePlus,
  FileText,
  Eye,
  CalendarDays,
  Tag,
  Upload,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import "./blog.css";
/* =========================================
   TYPES
========================================= */

type BlogStatus = "draft" | "scheduled" | "published" | "archived";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type BlogPost = {
  id: string;
  category_id: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string | null;
  status: BlogStatus;
  published_at: string | null;
  tags: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

type BlogForm = {
  title: string;
  slug: string;
  category_id: string;
  excerpt: string;
  content: string;
  featured_image_url: string;
  status: BlogStatus;
  published_at: string;
  tags: string;
  seo_title: string;
  seo_description: string;
};

const emptyForm: BlogForm = {
  title: "",
  slug: "",
  category_id: "",
  excerpt: "",
  content: "",
  featured_image_url: "",
  status: "draft",
  published_at: "",
  tags: "",
  seo_title: "",
  seo_description: "",
};

/* =========================================
   HELPERS
========================================= */

function makeSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function localDateTime(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function dateLabel(value: string | null) {
  if (!value) return "Not scheduled";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not scheduled";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* =========================================
   COMPONENT
========================================= */

export default function Blogs() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);

  const [form, setForm] = useState<BlogForm>(emptyForm);

  /* =========================================
     FETCH DATA
  ========================================= */

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [postsResult, categoriesResult] = await Promise.all([
        supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false }),

        supabase
          .from("blog_categories")
          .select("*")
          .order("name"),
      ]);

      if (postsResult.error) throw postsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setPosts((postsResult.data || []) as BlogPost[]);
      setCategories((categoriesResult.data || []) as Category[]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load blog articles."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  /* =========================================
     FILTERS
  ========================================= */

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return posts.filter((post) => {
      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        post.slug.toLowerCase().includes(query) ||
        (post.tags || []).some((tag) =>
          tag.toLowerCase().includes(query)
        );

      const matchesStatus =
        statusFilter === "all" || post.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((post) => post.status === "published").length,
      drafts: posts.filter((post) => post.status === "draft").length,
      scheduled: posts.filter((post) => post.status === "scheduled").length,
    }),
    [posts]
  );

  /* =========================================
     FORM HELPERS
  ========================================= */

  function updateField<K extends keyof BlogForm>(
    key: K,
    value: BlogForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openCreate() {
    setEditingPost(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEdit(post: BlogPost) {
    setEditingPost(post);

    setForm({
      title: post.title,
      slug: post.slug,
      category_id: post.category_id || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      featured_image_url: post.featured_image_url || "",
      status: post.status,
      published_at: localDateTime(post.published_at),
      tags: (post.tags || []).join(", "),
      seo_title: post.seo_title || "",
      seo_description: post.seo_description || "",
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving || uploading) return;

    setModalOpen(false);
    setEditingPost(null);
    setForm(emptyForm);
    setError("");
  }

  /* =========================================
     IMAGE UPLOAD
  ========================================= */

  async function uploadImage(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    setUploading(true);
    setError("");

    try {
      const extension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const path = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("blog-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("blog-images")
        .getPublicUrl(path);

      if (!data.publicUrl) {
        throw new Error("Could not generate the image URL.");
      }

      updateField("featured_image_url", data.publicUrl);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Image upload failed."
      );
    } finally {
      setUploading(false);
    }
  }

  /* =========================================
     SAVE / PUBLISH ARTICLE
  ========================================= */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const title = form.title.trim();
      const slug = makeSlug(form.slug || title);

      if (!title || !slug) {
        throw new Error("Please enter a valid article title.");
      }

      if (!form.content.trim()) {
        throw new Error("Please enter the article content.");
      }

      if (form.status === "scheduled" && !form.published_at) {
        throw new Error("Please select a schedule date and time.");
      }

      if (
        form.published_at &&
        Number.isNaN(new Date(form.published_at).getTime())
      ) {
        throw new Error("Please enter a valid publishing date.");
      }

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError) throw userError;

      const publishedAt =
        form.status === "published"
          ? form.published_at
            ? new Date(form.published_at).toISOString()
            : new Date().toISOString()
          : form.status === "scheduled"
            ? new Date(form.published_at).toISOString()
            : null;

      const payload = {
        title,
        slug,
        category_id: form.category_id || null,
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim(),
        featured_image_url: form.featured_image_url.trim() || null,
        status: form.status,
        published_at: publishedAt,
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
        seo_title: form.seo_title.trim() || null,
        seo_description: form.seo_description.trim() || null,
        author_id:
          editingPost?.author_id || userData.user?.id || null,
      };

      if (editingPost) {
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update(payload)
          .eq("id", editingPost.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("blog_posts")
          .insert(payload);

        if (insertError) throw insertError;
      }

      setModalOpen(false);
      setEditingPost(null);
      setForm(emptyForm);

      await fetchData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while saving the article."
      );
    } finally {
      setSaving(false);
    }
  }

  /* =========================================
     DELETE ARTICLE
  ========================================= */

  async function deletePost(post: BlogPost) {
    const confirmed = window.confirm(
      `Delete "${post.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", post.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setPosts((current) =>
      current.filter((item) => item.id !== post.id)
    );
  }

  /* =========================================
     ADD CATEGORY
  ========================================= */

  async function addCategory() {
    const name = window.prompt("Enter the new blog category name:");

    if (!name?.trim()) return;

    const slug = makeSlug(name);

    if (!slug) {
      setError("Please enter a valid category name.");
      return;
    }

    const { data, error: categoryError } = await supabase
      .from("blog_categories")
      .insert({
        name: name.trim(),
        slug,
      })
      .select()
      .single();

    if (categoryError) {
      setError(categoryError.message);
      return;
    }

    setCategories((current) => [...current, data as Category]);
    updateField("category_id", data.id);
  }

  function categoryName(id: string | null) {
    return (
      categories.find((category) => category.id === id)?.name ||
      "Uncategorised"
    );
  }

  /* =========================================
     UI
  ========================================= */

  return (
    <div className="blogs-page">

      {/* PAGE HEADER */}

      <div className="blogs-heading">
        <div>
          <span className="blogs-eyebrow">CONTENT MANAGEMENT</span>
          <h1>Blog Management</h1>
          <p>
            Create articles, manage publishing and improve your website's content.
          </p>
        </div>

        <button
          className="blogs-primary-button"
          onClick={openCreate}
        >
          <Plus size={17} />
          Create Article
        </button>
      </div>

      {/* STATISTICS */}

      <div className="blogs-stats">

        <div className="blogs-stat">
          <span className="blogs-stat-icon">
            <FileText size={19} />
          </span>
          <div>
            <small>Total Articles</small>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="blogs-stat">
          <span className="blogs-stat-icon published">
            <Eye size={19} />
          </span>
          <div>
            <small>Published</small>
            <strong>{stats.published}</strong>
          </div>
        </div>

        <div className="blogs-stat">
          <span className="blogs-stat-icon drafts">
            <Pencil size={19} />
          </span>
          <div>
            <small>Drafts</small>
            <strong>{stats.drafts}</strong>
          </div>
        </div>

        <div className="blogs-stat">
          <span className="blogs-stat-icon scheduled">
            <CalendarDays size={19} />
          </span>
          <div>
            <small>Scheduled</small>
            <strong>{stats.scheduled}</strong>
          </div>
        </div>

      </div>

      {/* ARTICLES PANEL */}

      <section className="blogs-panel">

        <div className="blogs-toolbar">
          <div>
            <h2>All Articles</h2>
            <p>{filteredPosts.length} articles found</p>
          </div>

          <div className="blogs-controls">

            <div className="blogs-search">
              <Search size={16} />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search articles..."
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All statuses</option>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="published">Published</option>
              <option value="archived">Archived</option>
            </select>

            <button
              className="blogs-refresh"
              onClick={() => void fetchData()}
              title="Refresh"
              type="button"
            >
              <RefreshCw size={16} />
            </button>

          </div>
        </div>

        {error && !modalOpen && (
          <div className="blogs-error">{error}</div>
        )}

        {loading ? (
          <div className="blogs-empty">Loading articles...</div>
        ) : filteredPosts.length === 0 ? (
          <div className="blogs-empty">
            <FileText size={30} />
            <h3>No articles found</h3>
            <p>Create your first article to start building your blog.</p>

            <button
              className="blogs-primary-button"
              onClick={openCreate}
            >
              <Plus size={16} />
              Create Article
            </button>
          </div>
        ) : (
          <div className="blogs-list">

            {filteredPosts.map((post) => (
              <article className="blogs-row" key={post.id}>

                <div className="blogs-thumbnail">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                    />
                  ) : (
                    <ImagePlus size={23} />
                  )}
                </div>

                <div className="blogs-row-main">
                  <h3>{post.title}</h3>

                  <p>
                    {post.excerpt || "No excerpt added yet."}
                  </p>

                  <div className="blogs-meta">
                    <span>{categoryName(post.category_id)}</span>

                    <span>
                      {dateLabel(post.published_at || post.created_at)}
                    </span>

                    {(post.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag}>
                        <Tag size={11} />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="blogs-row-end">
                  <span className={`blogs-status status-${post.status}`}>
                    {post.status}
                  </span>

                  <div className="blogs-actions">
                    <button
                      title="Edit article"
                      onClick={() => openEdit(post)}
                    >
                      <Pencil size={15} />
                    </button>

                    <button
                      title="Delete article"
                      className="delete"
                      onClick={() => void deletePost(post)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

              </article>
            ))}

          </div>
        )}

      </section>

      {/* CREATE / EDIT MODAL */}

      {modalOpen && (
        <div
          className="blogs-overlay"
          onMouseDown={closeModal}
        >

          <div
            className="blogs-modal"
            onMouseDown={(event) => event.stopPropagation()}
          >

            {/* MODAL HEADER */}

            <header className="blogs-modal-header">
              <div>
                <span className="blogs-eyebrow">ARTICLE EDITOR</span>

                <h2>
                  {editingPost ? "Edit Article" : "Create Article"}
                </h2>

                <p>
                  Write and manage your Shreem Solutions blog content.
                </p>
              </div>

              <button
                className="blogs-close"
                type="button"
                onClick={closeModal}
                disabled={saving || uploading}
              >
                <X size={19} />
              </button>
            </header>

            <form onSubmit={handleSubmit}>

              <div className="blogs-form-body">

                {/* ARTICLE DETAILS */}

                <div className="blogs-form-section">
                  <h3>Article Details</h3>

                  <label className="blogs-field">
                    Article Title *

                    <input
                      required
                      value={form.title}
                      onChange={(event) => {
                        const title = event.target.value;

                        setForm((current) => ({
                          ...current,
                          title,
                          slug: editingPost
                            ? current.slug
                            : makeSlug(title),
                        }));
                      }}
                      placeholder="Enter article title"
                    />
                  </label>

                  <label className="blogs-field">
                    URL Slug *

                    <input
                      required
                      value={form.slug}
                      onChange={(event) =>
                        updateField(
                          "slug",
                          makeSlug(event.target.value)
                        )
                      }
                      placeholder="article-url-slug"
                    />
                  </label>

                  <label className="blogs-field">
                    Excerpt

                    <textarea
                      rows={2}
                      value={form.excerpt}
                      onChange={(event) =>
                        updateField("excerpt", event.target.value)
                      }
                      placeholder="A short summary for article cards..."
                    />
                  </label>

                  <label className="blogs-field">
                    Article Content *

                    <textarea
                      className="blogs-content-input"
                      rows={12}
                      required
                      value={form.content}
                      onChange={(event) =>
                        updateField("content", event.target.value)
                      }
                      placeholder="Write your article content here..."
                    />

                    <small>
                      Use blank lines to separate paragraphs.
                    </small>
                  </label>
                </div>

                {/* FEATURED IMAGE */}

                <div className="blogs-form-section">
                  <h3>Featured Image</h3>

                  {form.featured_image_url && (
                    <div className="blogs-image-preview-wrap">
                      <img
                        className="blogs-image-preview"
                        src={form.featured_image_url}
                        alt="Featured image preview"
                      />

                      <button
                        type="button"
                        className="blogs-remove-image"
                        onClick={() =>
                          updateField("featured_image_url", "")
                        }
                      >
                        <X size={15} />
                        Remove image
                      </button>
                    </div>
                  )}

                  <label className="blogs-upload">

                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      disabled={uploading}
                      onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                          void uploadImage(file);
                        }

                        event.target.value = "";
                      }}
                    />

                    <span className="blogs-upload-icon">
                      {uploading ? (
                        <RefreshCw size={22} />
                      ) : (
                        <Upload size={22} />
                      )}
                    </span>

                    <span className="blogs-upload-text">
                      {uploading
                        ? "Uploading image..."
                        : "Click to upload an image"}
                    </span>

                    <small>
                      PNG, JPG or WebP · Maximum 5 MB
                    </small>

                  </label>

                  <label className="blogs-field">
                    Or paste an image URL

                    <input
                      type="url"
                      value={form.featured_image_url}
                      onChange={(event) =>
                        updateField(
                          "featured_image_url",
                          event.target.value
                        )
                      }
                      placeholder="https://example.com/image.jpg"
                    />
                  </label>
                </div>

                {/* CATEGORY & PUBLISHING */}

                <div className="blogs-form-section">
                  <h3>Category & Publishing</h3>

                  <label className="blogs-field">
                    Category

                    <div className="blogs-category-control">
                      <select
                        value={form.category_id}
                        onChange={(event) =>
                          updateField("category_id", event.target.value)
                        }
                      >
                        <option value="">Uncategorised</option>

                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => void addCategory()}
                      >
                        Add category
                      </button>
                    </div>
                  </label>

                  <label className="blogs-field">
                    Tags
                    <small>Separate tags with commas</small>

                    <input
                      value={form.tags}
                      onChange={(event) =>
                        updateField("tags", event.target.value)
                      }
                      placeholder="Global Trade, Export, Logistics"
                    />
                  </label>

                  <div className="blogs-form-grid">

                    <label className="blogs-field">
                      Status

                      <select
                        value={form.status}
                        onChange={(event) =>
                          updateField(
                            "status",
                            event.target.value as BlogStatus
                          )
                        }
                      >
                        <option value="draft">Draft</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="published">Published</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>

                    <label className="blogs-field">
                      Publish / Schedule Date

                      <input
                        type="datetime-local"
                        value={form.published_at}
                        onChange={(event) =>
                          updateField("published_at", event.target.value)
                        }
                      />
                    </label>

                  </div>

                  <small>
                    Selecting Published makes the article visible on your website.
                  </small>
                </div>

                {/* SEO */}

                <div className="blogs-form-section">
                  <h3>Search Engine Optimisation</h3>

                  <label className="blogs-field">
                    SEO Title

                    <input
                      value={form.seo_title}
                      onChange={(event) =>
                        updateField("seo_title", event.target.value)
                      }
                      placeholder="SEO page title"
                    />
                  </label>

                  <label className="blogs-field">
                    SEO Description

                    <textarea
                      rows={3}
                      value={form.seo_description}
                      onChange={(event) =>
                        updateField("seo_description", event.target.value)
                      }
                      placeholder="Meta description for search engines..."
                    />
                  </label>
                </div>

                {error && (
                  <div className="blogs-error">
                    {error}
                  </div>
                )}

              </div>

              {/* MODAL FOOTER */}

              <footer className="blogs-modal-footer">

                <button
                  type="button"
                  className="blogs-cancel"
                  onClick={closeModal}
                  disabled={saving || uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="blogs-primary-button"
                  disabled={saving || uploading}
                >
                  {uploading
                    ? "Uploading..."
                    : saving
                      ? "Saving..."
                      : form.status === "published"
                        ? "Publish Article"
                        : editingPost
                          ? "Save Changes"
                          : "Create Article"}
                </button>

              </footer>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
