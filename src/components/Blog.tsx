
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Search,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import {
  cachedFetch,
  CACHE_KEYS,
  invalidateCache,
} from "../lib/cache";

type BlogCategory = {
  id: string;
  name: string;
  slug: string;
};

type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  published_at: string | null;
  tags: string[];
  category_id: string | null;
  category: BlogCategory | null;
};

type BlogData = {
  posts: BlogPost[];
  categories: BlogCategory[];
};

const BLOG_CACHE_TTL = 5 * 60 * 1000;

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchBlog = async () => {
      setLoading(true);
      setError("");

      try {
        const blogData = await cachedFetch<BlogData>(
          CACHE_KEYS.blogs,
          async () => {
            const [postsResult, categoriesResult] = await Promise.all([
              supabase
                .from("blog_posts")
                .select(`
                  id,
                  title,
                  slug,
                  excerpt,
                  content,
                  featured_image_url,
                  published_at,
                  tags,
                  category_id,
                  category:blog_categories (
                    id,
                    name,
                    slug
                  )
                `)
                .eq("status", "published")
                .order("published_at", { ascending: false }),

              supabase
                .from("blog_categories")
                .select("id, name, slug")
                .order("name", { ascending: true }),
            ]);

            if (postsResult.error) {
              throw postsResult.error;
            }

            if (categoriesResult.error) {
              throw categoriesResult.error;
            }

            const formattedPosts = (postsResult.data ?? []).map((post) => ({
              ...post,
              category: Array.isArray(post.category)
                ? post.category[0] ?? null
                : post.category,
              tags: post.tags ?? [],
            })) as BlogPost[];

            return {
              posts: formattedPosts,
              categories: categoriesResult.data ?? [],
            };
          },
          BLOG_CACHE_TTL
        );

        if (!active) return;

        setPosts(blogData.posts);
        setCategories(blogData.categories);
      } catch (fetchError) {
        console.error("Blog fetch error:", fetchError);

        if (active) {
          setError("Unable to load articles. Please try again later.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchBlog();

    return () => {
      active = false;
    };
  }, [retryCount]);

  const handleRetry = () => {
    invalidateCache(CACHE_KEYS.blogs);
    setRetryCount((count) => count + 1);
  };

  const filteredPosts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "all" ||
        post.category?.slug === activeCategory;

      const matchesSearch =
        !query ||
        post.title.toLowerCase().includes(query) ||
        (post.excerpt ?? "").toLowerCase().includes(query) ||
        post.tags?.some((tag) => tag.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [posts, activeCategory, search]);

  const featuredPost = filteredPosts[0];
  const remainingPosts = filteredPosts.slice(1);

  const formatDate = (date: string | null) => {
    if (!date) return "Recently published";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="blog-page">
      <section className="blog-hero">
        <div className="blog-container">
          <div className="blog-eyebrow">
            <span className="blog-eyebrow-line" />
            SHREEM JOURNAL
          </div>

          <div className="blog-hero-content">
            <div>
              <h1>
                Perspectives that
                <br />
                <span>move business forward.</span>
              </h1>
            </div>

            <p>
              Insights, ideas and perspectives on global trade, international
              markets, sourcing and the opportunities shaping tomorrow's
              businesses.
            </p>
          </div>

          <div className="blog-hero-bottom">
            <span>KNOWLEDGE BEYOND BORDERS</span>
            <span>GLOBAL TRADE · MARKET INSIGHTS · BUSINESS</span>
          </div>
        </div>
      </section>

      <section className="blog-content-section">
        <div className="blog-container">
          <div className="blog-toolbar">
            <div className="blog-categories">
              <button
                type="button"
                className={activeCategory === "all" ? "active" : ""}
                onClick={() => setActiveCategory("all")}
              >
                All articles
              </button>

              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={
                    activeCategory === category.slug ? "active" : ""
                  }
                  onClick={() => setActiveCategory(category.slug)}
                >
                  {category.name}
                </button>
              ))}
            </div>

            <label className="blog-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search articles..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          {loading && (
            <div className="blog-message">
              Loading articles...
            </div>
          )}

          {!loading && error && (
            <div className="blog-message blog-error">
              <p>{error}</p>

              <button
                type="button"
                className="blog-back-link"
                onClick={handleRetry}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredPosts.length === 0 && (
            <div className="blog-message">
              <h3>No articles found.</h3>
              <p>Try another category or search term.</p>
            </div>
          )}

          {!loading && !error && featuredPost && (
            <>
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="blog-featured"
              >
                <div className="blog-featured-image">
                  {featuredPost.featured_image_url ? (
                    <img
                      src={featuredPost.featured_image_url}
                      alt={featuredPost.title}
                    />
                  ) : (
                    <div className="blog-image-placeholder">
                      SHREEM JOURNAL
                    </div>
                  )}

                  <span className="blog-image-label">
                    FEATURED ARTICLE
                  </span>
                </div>

                <div className="blog-featured-info">
                  <div className="blog-post-meta">
                    <span>
                      {featuredPost.category?.name ?? "Global Trade"}
                    </span>

                    <span className="blog-meta-dot" />

                    <span>
                      <CalendarDays size={14} />
                      {formatDate(featuredPost.published_at)}
                    </span>
                  </div>

                  <h2>{featuredPost.title}</h2>

                  <p>
                    {featuredPost.excerpt ||
                      "Explore insights and perspectives from SHREEM SOLUTION."}
                  </p>

                  <span className="blog-read-link">
                    Read article <ArrowUpRight size={18} />
                  </span>
                </div>
              </Link>

              {remainingPosts.length > 0 && (
                <div className="blog-list-heading">
                  <div>
                    <span className="blog-section-label">
                      THE LATEST
                    </span>
                    <h2>More perspectives.</h2>
                  </div>

                  <span>{filteredPosts.length} ARTICLES</span>
                </div>
              )}

              <div className="blog-grid">
                {remainingPosts.map((post) => (
                  <Link
                    to={`/blog/${post.slug}`}
                    className="blog-card"
                    key={post.id}
                  >
                    <div className="blog-card-image">
                      {post.featured_image_url ? (
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          loading="lazy"
                        />
                      ) : (
                        <div className="blog-image-placeholder">
                          SHREEM JOURNAL
                        </div>
                      )}

                      <span className="blog-card-arrow">
                        <ArrowUpRight size={20} />
                      </span>
                    </div>

                    <div className="blog-card-content">
                      <div className="blog-post-meta">
                        <span>
                          {post.category?.name ?? "Global Trade"}
                        </span>

                        <span className="blog-meta-dot" />

                        <span>{formatDate(post.published_at)}</span>
                      </div>

                      <h3>{post.title}</h3>

                      <p>
                        {post.excerpt ||
                          "Discover insights from the world of international trade."}
                      </p>

                      <span className="blog-card-read">
                        Read more <ArrowRight size={15} />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="blog-cta">
        <div className="blog-container blog-cta-inner">
          <div>
            <span>LET'S EXPLORE WHAT'S POSSIBLE</span>
            <h2>
              Your next opportunity
              <br />
              could be global.
            </h2>
          </div>

          <Link to="#contact" className="blog-cta-link">
            Talk to our team <ArrowUpRight size={19} />
          </Link>
        </div>
      </section>
    </main>
  );
}
