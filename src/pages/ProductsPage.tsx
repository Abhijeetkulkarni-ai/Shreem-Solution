
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Search,
  X,
  Package,
  SlidersHorizontal,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import {
  cachedFetch,
  CACHE_KEYS,
  invalidateCache,
} from "../lib/cache";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

interface Product {
  id: string;
  category_id: string | null;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  featured_image_url: string | null;
  sort_order: number;
}

interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
  is_featured: boolean;
}

interface DisplayProduct extends Product {
  image: string;
  categoryName: string;
  categorySlug: string;
}

interface CatalogueData {
  categories: ProductCategory[];
  products: DisplayProduct[];
}

const CATALOGUE_CACHE_KEY = CACHE_KEYS.products;
const CATALOGUE_CACHE_TTL = 5 * 60 * 1000;

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  const selectedCategory = searchParams.get("category") || "";

  useEffect(() => {
    let cancelled = false;

    const fetchCatalogue = async () => {
      setLoading(true);
      setError("");

      try {
        const catalogue = await cachedFetch<CatalogueData>(
          CATALOGUE_CACHE_KEY,
          async () => {
            const [
              { data: categoryData, error: categoryError },
              { data: productData, error: productError },
            ] = await Promise.all([
              supabase
                .from("product_categories")
                .select("id, name, slug, description, sort_order")
                .eq("is_active", true)
                .order("sort_order", { ascending: true }),

              supabase
                .from("products")
                .select(`
                  id,
                  category_id,
                  name,
                  slug,
                  short_description,
                  description,
                  featured_image_url,
                  sort_order
                `)
                .eq("status", "published")
                .order("sort_order", { ascending: true }),
            ]);

            if (categoryError) throw categoryError;
            if (productError) throw productError;

            const safeCategories =
              (categoryData || []) as ProductCategory[];

            const safeProducts =
              (productData || []) as Product[];

            if (safeProducts.length === 0) {
              return {
                categories: safeCategories,
                products: [],
              };
            }

            // Fetch all product images together.
            const productIds = safeProducts.map(
              (product) => product.id
            );

            const { data: imageData, error: imageError } =
              await supabase
                .from("product_images")
                .select(`
                  id,
                  product_id,
                  image_url,
                  sort_order,
                  is_featured
                `)
                .in("product_id", productIds)
                .order("sort_order", { ascending: true });

            if (imageError) throw imageError;

            const images = (imageData || []) as ProductImage[];

            // Group images by product.
            const imageMap = new Map<string, ProductImage[]>();

            images.forEach((image) => {
              const existing =
                imageMap.get(image.product_id) || [];

              existing.push(image);
              imageMap.set(image.product_id, existing);
            });

            // Create a category lookup map.
            const categoryMap = new Map(
              safeCategories.map((category) => [
                category.id,
                category,
              ])
            );

            // Format products.
            const formattedProducts: DisplayProduct[] =
              safeProducts
                .map((product) => {
                  const productImages =
                    imageMap.get(product.id) || [];

                  const featuredImage = productImages.find(
                    (image) => image.is_featured
                  );

                  const category = product.category_id
                    ? categoryMap.get(product.category_id)
                    : undefined;

                  const image =
                    featuredImage?.image_url ||
                    product.featured_image_url ||
                    productImages[0]?.image_url ||
                    "";

                  return {
                    ...product,
                    image,
                    categoryName:
                      category?.name || "Uncategorized",
                    categorySlug: category?.slug || "",
                  };
                })
                .filter((product) => Boolean(product.image));

            return {
              categories: safeCategories,
              products: formattedProducts,
            };
          },
          CATALOGUE_CACHE_TTL
        );

        if (cancelled) return;

        setCategories(catalogue.categories);
        setProducts(catalogue.products);
      } catch (err) {
        console.error("Catalogue loading error:", err);

        if (!cancelled) {
          setError(
            "Unable to load products. Please try again later."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchCatalogue();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  // Search and category filtering.
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        !selectedCategory ||
        product.categorySlug === selectedCategory;

      const searchTerm = search.trim().toLowerCase();

      const matchesSearch =
        !searchTerm ||
        product.name.toLowerCase().includes(searchTerm) ||
        (product.short_description || "")
          .toLowerCase()
          .includes(searchTerm) ||
        product.categoryName.toLowerCase().includes(searchTerm);

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const activeCategory = categories.find(
    (category) => category.slug === selectedCategory
  );

  const selectCategory = (slug: string) => {
    if (slug) {
      setSearchParams({ category: slug });
    } else {
      setSearchParams({});
    }
  };

  const retryLoading = () => {
    invalidateCache(CATALOGUE_CACHE_KEY);
    setRetryCount((previous) => previous + 1);
  };

  return (
    <main className="catalogue-page">

      {/* EDITORIAL HERO */}

      <section className="catalogue-hero">
        <div className="catalogue-hero-inner">

          <div className="catalogue-breadcrumb">
            <Link to="/">HOME</Link>
            <ChevronRight size={13} />
            <span>OUR PRODUCTS</span>
          </div>

          <div className="catalogue-hero-content">
            <div>
              <span className="catalogue-eyebrow">
                OUR GLOBAL PRODUCT PORTFOLIO
              </span>

              <h1>
                Products that
                <br />
                <span>move the world.</span>
              </h1>
            </div>

            <p>
              Explore our carefully sourced portfolio of agricultural
              commodities, industrial products and specialised solutions
              connecting businesses across international markets.
            </p>
          </div>

          <div className="catalogue-hero-bottom">
            <span>QUALITY SOURCING. GLOBAL REACH.</span>
            <span>INDIA · WORLDWIDE</span>
          </div>

        </div>
      </section>

      {/* CATALOGUE */}

      <section className="catalogue-section">
        <div className="catalogue-container">

          {/* HEADER */}

          <div className="catalogue-toolbar">

            <div className="catalogue-results">
              <span className="catalogue-section-label">
                DISCOVER OUR RANGE
              </span>

              <h2>
                {activeCategory
                  ? activeCategory.name
                  : "Explore our products"}
              </h2>

              <p>
                {loading
                  ? "Loading our product portfolio..."
                  : `Showing ${filteredProducts.length} of ${products.length} products`}
              </p>
            </div>

            <div className="catalogue-search">
              <Search size={19} />

              <input
                type="search"
                placeholder="Search products, categories..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search products"
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={17} />
                </button>
              )}
            </div>

          </div>

          {/* CATEGORY FILTERS */}

          <div className="catalogue-filter-area">

            <div className="catalogue-filter-heading">
              <SlidersHorizontal size={16} />
              <span>FILTER BY CATEGORY</span>
            </div>

            <div className="catalogue-category-list">

              <button
                type="button"
                className={`catalogue-filter-chip ${
                  !selectedCategory ? "active" : ""
                }`}
                onClick={() => selectCategory("")}
              >
                All Products
                <span>{products.length}</span>
              </button>

              {categories.map((category) => {
                const count = products.filter(
                  (product) =>
                    product.categorySlug === category.slug
                ).length;

                if (count === 0) return null;

                return (
                  <button
                    type="button"
                    key={category.id}
                    className={`catalogue-filter-chip ${
                      selectedCategory === category.slug
                        ? "active"
                        : ""
                    }`}
                    onClick={() => selectCategory(category.slug)}
                  >
                    {category.name}
                    <span>{count}</span>
                  </button>
                );
              })}

            </div>
          </div>

          {/* ACTIVE FILTER */}

          {selectedCategory && (
            <div className="catalogue-active-filter">
              <span>
                Showing:{" "}
                <strong>
                  {activeCategory?.name || selectedCategory}
                </strong>
              </span>

              <button
                type="button"
                onClick={() => selectCategory("")}
              >
                Clear filter <X size={14} />
              </button>
            </div>
          )}

          {/* PRODUCTS */}

          {loading && (
            <div className="catalogue-loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <div className="catalogue-skeleton" key={index}>
                  <div className="catalogue-skeleton-image" />
                  <div className="catalogue-skeleton-line" />
                  <div className="catalogue-skeleton-line short" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="catalogue-state">
              <Package size={38} />
              <h3>Something went wrong</h3>
              <p>{error}</p>

              <button type="button" onClick={retryLoading}>
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="catalogue-state">
              <Package size={42} />
              <h3>No products found</h3>

              <p>
                Try another search term or explore a different category.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  selectCategory("");
                }}
              >
                View all products
                <ArrowRight size={16} />
              </button>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="catalogue-product-grid">

              {filteredProducts.map((product, index) => (
                <Link
                  to={`/products/${product.slug}`}
                  className="catalogue-product-card"
                  key={product.id}
                >

                  <div className="catalogue-product-image">

                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                    />

                    <div className="catalogue-image-overlay" />

                    <span className="catalogue-product-number">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                    <span className="catalogue-product-category-tag">
                      {product.categoryName}
                    </span>

                    <span className="catalogue-product-arrow">
                      <ArrowRight size={20} />
                    </span>

                    <span className="catalogue-image-bottom-label">
                      SHREEM SOLUTION
                    </span>

                  </div>

                  <div className="catalogue-product-info">

                    <div className="catalogue-product-meta">
                      <span>
                        PRODUCT / {String(index + 1).padStart(2, "0")}
                      </span>
                      <span>INDIA</span>
                    </div>

                    <h3>{product.name}</h3>

                    <p>
                      {product.short_description ||
                        product.description ||
                        "Contact our team for product specifications and export enquiries."}
                    </p>

                    <div className="catalogue-product-link">
                      <span>EXPLORE PRODUCT</span>
                      <ArrowRight size={16} />
                    </div>

                  </div>

                </Link>
              ))}

            </div>
          )}

          {/* BOTTOM NOTE */}

          {!loading && !error && products.length > 0 && (
            <div className="catalogue-bottom-note">
              <span>LOOKING FOR SOMETHING SPECIFIC?</span>

              <Link to="/#contact">
                Discuss your requirements
                <ArrowRight size={16} />
              </Link>
            </div>
          )}

        </div>
      </section>

    </main>
  );
}
