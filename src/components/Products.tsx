
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { cachedFetch, CACHE_KEYS } from "../lib/cache";

interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
}

interface DisplayProduct {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
}

interface CategorySection {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  product: DisplayProduct;
}

interface HomepageProductsData {
  categories: CategorySection[];
}

const PRODUCTS_CACHE_TTL = 5 * 60 * 1000;

export default function Products() {
  const [categories, setCategories] = useState<CategorySection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const result = await cachedFetch<HomepageProductsData>(
          `${CACHE_KEYS.products}:homepage`,
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

            if (!categoryData?.length || !productData?.length) {
              return { categories: [] };
            }

            const productIds = productData.map(
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

            const imagesByProduct = new Map<
              string,
              NonNullable<typeof imageData>
            >();

            (imageData ?? []).forEach((image) => {
              const existing =
                imagesByProduct.get(image.product_id) ?? [];

              existing.push(image);
              imagesByProduct.set(image.product_id, existing);
            });

            const productsByCategory = new Map<
              string,
              DisplayProduct[]
            >();

            productData.forEach((product) => {
              if (!product.category_id) return;

              const productImages =
                imagesByProduct.get(product.id) ?? [];

              const featuredImage = productImages.find(
                (image) => image.is_featured
              );

              const image =
                featuredImage?.image_url ||
                product.featured_image_url ||
                productImages[0]?.image_url ||
                "";

              if (!image) return;

              const displayProduct: DisplayProduct = {
                id: product.id,
                slug: product.slug,
                title: product.name,
                description:
                  product.short_description ||
                  product.description ||
                  "Contact us for more information about this product.",
                image,
              };

              const existing =
                productsByCategory.get(product.category_id) ?? [];

              existing.push(displayProduct);
              productsByCategory.set(
                product.category_id,
                existing
              );
            });

            const categorySections: CategorySection[] =
              categoryData
                .map((category: ProductCategory) => {
                  const selectedProduct =
                    productsByCategory.get(category.id)?.[0];

                  if (!selectedProduct) return null;

                  return {
                    id: category.id,
                    name: category.name,
                    slug: category.slug,
                    description: category.description,
                    product: selectedProduct,
                  };
                })
                .filter(
                  (category): category is CategorySection =>
                    category !== null
                )
                .slice(0, 4);

            return { categories: categorySections };
          },
          PRODUCTS_CACHE_TTL
        );

        if (active) {
          setCategories(result.categories);
        }
      } catch (err) {
        console.error("Products loading error:", err);

        if (active) {
          setError(
            "Unable to load products. Please try again later."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="products-section" id="products">
      <div className="products-inner">
        <div className="products-heading">
          <div>
            <span className="section-eyebrow">
              PRODUCTS WE TRADE
            </span>

            <h2>
              Diverse Products.
              <br />
              <span>Limitless Opportunities.</span>
            </h2>
          </div>

          <Link
            to="/products"
            className="products-enquiry-link"
          >
            EXPLORE ALL PRODUCTS
            <ArrowRight size={15} />
          </Link>
        </div>

        {loading && (
          <div className="products-track">
            <p>Loading products...</p>
          </div>
        )}

        {!loading && error && (
          <div className="products-track">
            <p role="alert">{error}</p>
          </div>
        )}

        {!loading && !error && categories.length === 0 && (
          <div className="products-track">
            <p>
              Our product catalogue is being updated.
              Please check back soon.
            </p>
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <div className="product-category-grid">
            {categories.map((category, index) => (
              <article
                className="product-category-card"
                key={category.id}
              >
                <Link
                  to={`/products?category=${encodeURIComponent(
                    category.slug
                  )}`}
                  className="product-category-image"
                  aria-label={`Explore ${category.name}`}
                >
                  <img
                    src={category.product.image}
                    alt={category.product.title}
                    loading="lazy"
                  />

                  <span className="product-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="product-category-overlay">
                    <ArrowRight size={20} />
                  </span>
                </Link>

                <div className="product-category-card-content">
                  <span className="product-category-label">
                    CATEGORY {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{category.name}</h3>

                  <p>{category.product.title}</p>

                  <Link
                    to={`/products?category=${encodeURIComponent(
                      category.slug
                    )}`}
                    className="product-category-link"
                  >
                    EXPLORE CATEGORY
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="products-bottom">
          <p>
            From agricultural produce to industrial equipment,
            we connect your business with reliable global
            supply opportunities.
          </p>

          <a
            href="#contact"
            className="products-enquiry-link"
          >
            ENQUIRE ABOUT OUR PRODUCTS
            <ArrowRight size={15} />
          </a>
        </div>
      </div>
    </section>
  );
}
