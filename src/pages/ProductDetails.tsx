
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  Package,
  ChevronRight,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import {
  cachedFetch,
  CACHE_KEYS,
  invalidateCache,
} from "../lib/cache";

interface ProductImage {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_featured: boolean;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  specifications: Record<string, unknown>;
  origin_country: string | null;
  target_markets: string[];
  featured_image_url: string | null;
  category_id: string | null;
}

interface ProductDetailsData {
  product: Product;
  images: ProductImage[];
  categoryName: string;
}

const PRODUCT_CACHE_TTL = 5 * 60 * 1000;

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchProduct = async () => {
      if (!slug) {
        setError("Product not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      setActiveImage("");

      try {
        const result = await cachedFetch<ProductDetailsData | null>(
          `${CACHE_KEYS.productDetails}${slug}`,
          async () => {
            const { data, error: productError } = await supabase
              .from("products")
              .select(`
                id,
                name,
                slug,
                short_description,
                description,
                specifications,
                origin_country,
                target_markets,
                featured_image_url,
                category_id
              `)
              .eq("slug", slug)
              .eq("status", "published")
              .maybeSingle();

            if (productError) throw productError;

            if (!data) return null;

            const [
              { data: imageData, error: imageError },
              { data: categoryData, error: categoryError },
            ] = await Promise.all([
              supabase
                .from("product_images")
                .select("id, image_url, alt_text, sort_order, is_featured")
                .eq("product_id", data.id)
                .order("sort_order", { ascending: true }),

              data.category_id
                ? supabase
                    .from("product_categories")
                    .select("name")
                    .eq("id", data.category_id)
                    .maybeSingle()
                : Promise.resolve({
                    data: null,
                    error: null,
                  }),
            ]);

            if (imageError) throw imageError;
            if (categoryError) throw categoryError;

            return {
              product: {
                ...data,
                specifications: data.specifications ?? {},
                target_markets: data.target_markets ?? [],
              } as Product,
              images: (imageData ?? []) as ProductImage[],
              categoryName: categoryData?.name ?? "",
            };
          },
          PRODUCT_CACHE_TTL
        );

        if (!isMounted) return;

        if (!result) {
          setProduct(null);
          setImages([]);
          setCategoryName("");
          setError("This product is unavailable.");
          return;
        }

        setProduct(result.product);
        setImages(result.images);
        setCategoryName(result.categoryName);

        const featured =
          result.images.find((image) => image.is_featured)?.image_url ||
          result.product.featured_image_url ||
          result.images[0]?.image_url ||
          "";

        setActiveImage(featured);
      } catch (err) {
        console.error("Product detail error:", err);

        if (isMounted) {
          setError("Unable to load this product. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug, retryCount]);

  const handleRetry = () => {
    if (slug) {
      invalidateCache(`${CACHE_KEYS.productDetails}${slug}`);
    }

    setRetryCount((count) => count + 1);
  };

  if (loading) {
    return (
      <main className="product-detail-state">
        <div className="product-detail-loading">
          <div className="product-loading-image" />

          <div className="product-loading-content">
            <div />
            <div />
            <div />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-state">
        <Package size={42} />

        <span className="product-detail-eyebrow">
          PRODUCT INFORMATION
        </span>

        <h1>Product unavailable</h1>

        <p>{error || "We couldn't find this product."}</p>

        {error.includes("Unable to load") && (
          <button
            type="button"
            className="product-back-link"
            onClick={handleRetry}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        )}

        <Link to="/products" className="product-back-link">
          <ArrowLeft size={16} />
          Explore all products
        </Link>
      </main>
    );
  }

  const specifications = product.specifications || {};

  const galleryImages = [
    ...(product.featured_image_url &&
    !images.some(
      (image) => image.image_url === product.featured_image_url
    )
      ? [
          {
            id: "featured",
            image_url: product.featured_image_url,
            alt_text: product.name,
            sort_order: -1,
            is_featured: true,
          },
        ]
      : []),
    ...images,
  ];

  const currentImageIndex = galleryImages.findIndex(
    (image) => image.image_url === activeImage
  );

  const formatSpecification = (value: unknown): string => {
    if (value === null || value === undefined) return "";

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const enquiryLink = "/#contact";

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">

        <div className="product-detail-breadcrumb">
          <Link to="/">HOME</Link>
          <ChevronRight size={13} />

          <Link to="/products">PRODUCTS</Link>
          <ChevronRight size={13} />

          <span>{product.name}</span>
        </div>

        <section className="product-detail-grid">

          <div className="product-gallery">
            <div className="product-main-image">

              {activeImage ? (
                <img
                  key={activeImage}
                  src={activeImage}
                  alt={product.name}
                />
              ) : (
                <div className="product-image-placeholder">
                  <Package size={48} />
                  <span>Image coming soon</span>
                </div>
              )}

              <span className="product-image-index">
                SHREEM SOLUTION / PRODUCT
              </span>

              {categoryName && (
                <span className="product-image-category">
                  {categoryName}
                </span>
              )}

            </div>

            {galleryImages.length > 1 && (
              <div className="product-thumbnail-section">

                <div className="product-thumbnail-heading">
                  <span>PRODUCT GALLERY</span>

                  <span>
                    {currentImageIndex >= 0
                      ? currentImageIndex + 1
                      : 1}{" "}
                    / {galleryImages.length}
                  </span>
                </div>

                <div className="product-thumbnail-list">
                  {galleryImages.map((image, index) => (
                    <button
                      type="button"
                      key={image.id}
                      className={`product-thumbnail ${
                        activeImage === image.image_url ? "active" : ""
                      }`}
                      onClick={() => setActiveImage(image.image_url)}
                      aria-label={`View image ${index + 1}`}
                      aria-pressed={activeImage === image.image_url}
                    >
                      <img
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        loading="lazy"
                      />
                    </button>
                  ))}
                </div>

              </div>
            )}

          </div>

          <div className="product-detail-info">

            <div className="product-detail-topline">
              <span className="product-detail-eyebrow">
                {categoryName || "OUR PRODUCT PORTFOLIO"}
              </span>

              <span className="product-availability">
                <CheckCircle2 size={14} />
                Available for enquiry
              </span>
            </div>

            <h1>{product.name}</h1>

            {product.short_description && (
              <p className="product-detail-intro">
                {product.short_description}
              </p>
            )}

            <div className="product-detail-divider" />

            {product.description && (
              <div className="product-detail-description">
                <h3>About this product</h3>
                <p>{product.description}</p>
              </div>
            )}

            <div className="product-detail-meta">

              {product.origin_country && (
                <div className="product-meta-item">
                  <div className="product-meta-icon">
                    <Globe2 size={18} />
                  </div>

                  <div>
                    <span>COUNTRY OF ORIGIN</span>
                    <strong>{product.origin_country}</strong>
                  </div>
                </div>
              )}

              {product.target_markets?.length > 0 && (
                <div className="product-meta-item">
                  <div className="product-meta-icon">
                    <Package size={18} />
                  </div>

                  <div>
                    <span>TARGET MARKETS</span>
                    <strong>
                      {product.target_markets.join(", ")}
                    </strong>
                  </div>
                </div>
              )}

            </div>

            <div className="product-enquiry-panel">
              <span>INTERESTED IN THIS PRODUCT?</span>

              <h3>
                Let's discuss your
                <br />
                sourcing requirements.
              </h3>

              <Link
                to={enquiryLink}
                className="product-detail-enquiry"
                state={{ productName: product.name }}
              >
                Enquire about this product
                <ArrowRight size={18} />
              </Link>

              <p>
                Our team can assist with product details, availability
                and international trade enquiries.
              </p>
            </div>

            <div className="product-detail-note">
              <Globe2 size={16} />
              Connecting businesses with global supply opportunities.
            </div>

          </div>

        </section>

        {Object.keys(specifications).length > 0 && (
          <section className="product-specifications">

            <div className="product-specifications-heading">
              <div>
                <span className="product-detail-eyebrow">
                  PRODUCT INFORMATION
                </span>

                <h2>
                  Specifications<span>.</span>
                </h2>
              </div>

              <p>
                Important product details and technical information.
              </p>
            </div>

            <div className="product-specifications-grid">
              {Object.entries(specifications)
                .filter(([, value]) => value !== null && value !== undefined)
                .map(([key, value]) => (
                  <div className="product-specification" key={key}>
                    <span>
                      {key
                        .replace(/[_-]/g, " ")
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                    </span>

                    <strong>
                      {formatSpecification(value)}
                    </strong>
                  </div>
                ))}
            </div>

          </section>
        )}

        <div className="product-detail-footer">
          <Link to="/products">
            <ArrowLeft size={17} />
            Back to product catalogue
          </Link>

          <span>SHREEM SOLUTION · GLOBAL TRADE</span>
        </div>

      </div>
    </main>
  );
}
