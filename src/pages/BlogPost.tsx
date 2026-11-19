
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { supabase } from "../lib/supabase";
import {
  cachedFetch,
  CACHE_KEYS,
  invalidateCache,
} from "../lib/cache";

type BlogArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  published_at: string | null;
  tags: string[];
  category: {
    name: string;
    slug: string;
  } | null;
};

const BLOG_POST_CACHE_TTL = 5 * 60 * 1000;

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();

  const [post, setPost] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      if (!slug) {
        setPost(null);
        setError("Article not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setPost(null);

      try {
        const article = await cachedFetch<BlogArticle | null>(
          `${CACHE_KEYS.blogDetails}${slug}`,
          async () => {
            const { data, error: fetchError } = await supabase
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
                category:blog_categories (
                  name,
                  slug
                )
              `)
              .eq("slug", slug)
              .eq("status", "published")
              .maybeSingle();

            if (fetchError) {
              throw fetchError;
            }

            if (!data) {
              return null;
            }

            const category = Array.isArray(data.category)
              ? data.category[0] ?? null
              : data.category;

            return {
              ...data,
              category,
              tags: data.tags ?? [],
            } as BlogArticle;
          },
          BLOG_POST_CACHE_TTL
        );

        if (!active) return;

        if (!article) {
          setError("This article could not be found.");
        } else {
          setPost(article);
        }
      } catch (fetchError) {
        console.error("Blog fetch error:", fetchError);

        if (active) {
          setError("Unable to load this article.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      active = false;
    };
  }, [slug, retryCount]);

  const handleRetry = () => {
    if (slug) {
      invalidateCache(`${CACHE_KEYS.blogDetails}${slug}`);
    }

    setRetryCount((count) => count + 1);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "Recently published";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <main className="blog-article-page">
      <div className="blog-container">

        <Link to="/blog" className="blog-back-link">
          <ArrowLeft size={17} />
          Back to journal
        </Link>

        {loading && (
          <div className="blog-message">
            Loading article...
          </div>
        )}

        {!loading && error && (
          <div className="blog-message">
            <h2>{error}</h2>

            {error === "Unable to load this article." && (
              <button
                type="button"
                className="blog-back-link"
                onClick={handleRetry}
              >
                <RefreshCw size={16} />
                Try again
              </button>
            )}

            <Link to="/blog">
              Return to the journal
            </Link>
          </div>
        )}

        {!loading && post && (
          <article>
            <header className="blog-article-header">
              <div className="blog-post-meta">
                <span>
                  {post.category?.name ?? "Global Trade"}
                </span>

                <span className="blog-meta-dot" />

                <span>
                  <CalendarDays size={14} />
                  {formatDate(post.published_at)}
                </span>
              </div>

              <h1>{post.title}</h1>

              {post.excerpt && (
                <p className="blog-article-excerpt">
                  {post.excerpt}
                </p>
              )}
            </header>

            {post.featured_image_url && (
              <div className="blog-article-cover">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                />
              </div>
            )}

            <div className="blog-article-body">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  a: ({ ...props }) => (
                    <a
                      {...props}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>

            {post.tags.length > 0 && (
              <div className="blog-article-tags">
                <span>TOPICS</span>

                {post.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            )}

            <div className="blog-article-footer">
              <span>END OF ARTICLE</span>

              <Link to="/blog">
                Explore more articles
                <ArrowLeft size={16} />
              </Link>
            </div>
          </article>
        )}

      </div>
    </main>
  );
}
