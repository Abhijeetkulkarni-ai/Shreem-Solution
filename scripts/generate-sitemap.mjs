import { createClient } from "@supabase/supabase-js";
import { loadEnv } from "vite";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SITE_URL = "https://shreemsolutions.co.in";
const OUTPUT_DIR = path.resolve("dist");

const env = loadEnv("production", process.cwd(), "VITE_");

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const today = new Date().toISOString().split("T")[0];

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

async function fetchAllRows(table) {
  const rows = [];
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select("slug,status")
      .range(from, from + pageSize - 1);

    if (error) {
      throw new Error(`Could not fetch ${table}: ${error.message}`);
    }

    rows.push(...(data ?? []));

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  return rows;
}

async function generateSitemap() {
  console.log("Generating Shreem Solution sitemap...");

  const [products, blogs] = await Promise.all([
    fetchAllRows("products"),
    fetchAllRows("blog_posts"),
  ]);

  const staticPages = [
    { path: "/", priority: "1.0", changefreq: "weekly" },
    { path: "/products", priority: "0.9", changefreq: "daily" },
    { path: "/blog", priority: "0.8", changefreq: "daily" },
  ];

  const productPages = products
    .filter((product) =>
      ["published", "active"].includes(
        String(product.status ?? "").toLowerCase(),
      ),
    )
    .filter((product) => product.slug)
    .map((product) => ({
      path: `/products/${encodeURIComponent(product.slug)}`,
      priority: "0.8",
      changefreq: "weekly",
    }));

  const blogPages = blogs
    .filter((blog) => String(blog.status ?? "").toLowerCase() === "published")
    .filter((blog) => blog.slug)
    .map((blog) => ({
      path: `/blog/${encodeURIComponent(blog.slug)}`,
      priority: "0.7",
      changefreq: "monthly",
    }));

  const allPages = [...staticPages, ...productPages, ...blogPages];

  const urls = allPages
    .map(
      (page) => `
  <url>
    <loc>${escapeXml(`${SITE_URL}${page.path}`)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`,
    )
    .join("");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

  await mkdir(OUTPUT_DIR, { recursive: true });

  await writeFile(path.join(OUTPUT_DIR, "sitemap.xml"), sitemap.trim(), "utf8");

  console.log(`Sitemap generated successfully.`);
  console.log(`Static pages: ${staticPages.length}`);
  console.log(`Product pages: ${productPages.length}`);
  console.log(`Blog pages: ${blogPages.length}`);
  console.log(`Total URLs: ${allPages.length}`);
}

generateSitemap().catch((error) => {
  console.error("Sitemap generation failed:", error);
  process.exit(1);
});
