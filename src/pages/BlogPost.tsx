
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "../lib/supabase";

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

export default function BlogPost() {
  const { slug } = useParams();

  const [post, setPost] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchPost = async () => {
      if (!slug) {
        setError("Article not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setPost(null);

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

      if (!active) return;

      if (fetchError) {
        console.error("Blog fetch error:", fetchError);
        setError("Unable to load this article.");
      } else if (!data) {
        setError("This article could not be found.");
      } else {
        const category = Array.isArray(data.category)
          ? data.category[0] ?? null
          : data.category;

        setPost({
          ...data,
          category,
          tags: data.tags ?? [],
        } as BlogArticle);
      }

      setLoading(false);
    };

    fetchPost();

    return () => {
      active = false;
    };
  }, [slug]);

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
            <Link to="/blog">Return to the journal</Link>
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
