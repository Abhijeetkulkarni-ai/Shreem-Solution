
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  Package,
} from "lucide-react";
import { supabase } from "../lib/supabase";

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

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [activeImage, setActiveImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      try {
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

        if (!data) {
          if (isMounted) setError("This product is unavailable.");
          return;
        }

        const { data: imageData, error: imageError } = await supabase
          .from("product_images")
          .select("id, image_url, alt_text, sort_order, is_featured")
          .eq("product_id", data.id)
          .order("sort_order", { ascending: true });

        if (imageError) throw imageError;

        let category = "";

        if (data.category_id) {
          const { data: categoryData, error: categoryError } =
            await supabase
              .from("product_categories")
              .select("name")
              .eq("id", data.category_id)
              .maybeSingle();

          if (categoryError) throw categoryError;
          category = categoryData?.name || "";
        }

        if (!isMounted) return;

        const loadedImages = imageData || [];

        setProduct(data as Product);
        setImages(loadedImages);
        setCategoryName(category);

        const featured =
          loadedImages.find((image) => image.is_featured)?.image_url ||
          data.featured_image_url ||
          loadedImages[0]?.image_url ||
          "";

        setActiveImage(featured);
      } catch (err) {
        console.error("Product detail error:", err);

        if (isMounted) {
          setError("Unable to load this product. Please try again later.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProduct();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="product-detail-state">
        <p>Loading product...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="product-detail-state">
        <Package size={34} />
        <h1>Product unavailable</h1>
        <p>{error || "We couldn't find this product."}</p>
        <Link to="/" className="product-back-link">
          <ArrowLeft size={16} />
          Back to homepage
        </Link>
      </main>
    );
  }

  const specifications = product.specifications || {};

  const galleryImages = [
    ...(product.featured_image_url &&
    !images.some((image) => image.image_url === product.featured_image_url)
      ? [{
          id: "featured",
          image_url: product.featured_image_url,
          alt_text: product.name,
          sort_order: -1,
          is_featured: true,
        }]
      : []),
    ...images,
  ];

  return (
    <main className="product-detail-page">
      <div className="product-detail-container">
        <Link to="/" className="product-back-link">
          <ArrowLeft size={16} />
          Back to homepage
        </Link>

        <div className="product-detail-grid">
          <div className="product-gallery">
            <div className="product-main-image">
              {activeImage ? (
                <img src={activeImage} alt={product.name} />
              ) : (
                <div className="product-image-placeholder">
                  <Package size={42} />
                  <span>Image coming soon</span>
                </div>
              )}
            </div>

            {galleryImages.length > 1 && (
              <div className="product-thumbnail-list">
                {galleryImages.map((image) => (
                  <button
                    type="button"
                    key={image.id}
                    className={`product-thumbnail ${
                      activeImage === image.image_url ? "active" : ""
                    }`}
                    onClick={() => setActiveImage(image.image_url)}
                    aria-label={`View ${image.alt_text || product.name}`}
                  >
                    <img
                      src={image.image_url}
                      alt={image.alt_text || product.name}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <span className="product-detail-eyebrow">
              {categoryName || "OUR PRODUCTS"}
            </span>

            <h1>{product.name}</h1>

            {product.short_description && (
              <p className="product-detail-intro">
                {product.short_description}
              </p>
            )}

            {product.description && (
              <div className="product-detail-description">
                {product.description}
              </div>
            )}

            <div className="product-detail-meta">
              {product.origin_country && (
                <div>
                  <span>COUNTRY OF ORIGIN</span>
                  <strong>{product.origin_country}</strong>
                </div>
              )}

              {product.target_markets?.length > 0 && (
                <div>
                  <span>TARGET MARKETS</span>
                  <strong>{product.target_markets.join(", ")}</strong>
                </div>
              )}
            </div>

            <a href="/#contact" className="product-detail-enquiry">
              Enquire about this product
              <ArrowRight size={17} />
            </a>

            <p className="product-detail-note">
              <Globe2 size={15} />
              Connecting your business with global supply opportunities.
            </p>
          </div>
        </div>

        {Object.keys(specifications).length > 0 && (
          <section className="product-specifications">
            <span className="product-detail-eyebrow">
              PRODUCT INFORMATION
            </span>
            <h2>Specifications</h2>

            <div className="product-specifications-grid">
              {Object.entries(specifications).map(([key, value]) => (
                <div className="product-specification" key={key}>
                  <span>
                    {key.replace(/[_-]/g, " ")}
                  </span>
                  <strong>
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </strong>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
