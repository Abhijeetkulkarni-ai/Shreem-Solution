
import { useRef, useState, useEffect, useCallback } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";



interface DisplayProduct {
  id: string;
  slug: string;
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
}

export default function Products() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<DisplayProduct[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch published products and their images
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError("");

      try {
        const { data: productData, error: productError } =
          await supabase
            .from("products")
            .select(`
              id,
              name,
              slug,
              short_description,
              description,
              featured_image_url,
              sort_order
            `)
            .eq("status", "published")
            .order("sort_order", { ascending: true });

        if (productError) throw productError;

        if (!productData || productData.length === 0) {
          setProducts([]);
          return;
        }

        const productIds = productData.map((product) => product.id);

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

        const formattedProducts: DisplayProduct[] =
          productData
            .map((product, index) => {
              const productImages = (imageData || [])
                .filter((image) => image.product_id === product.id)
                .sort((a, b) => a.sort_order - b.sort_order);

              const featuredImage = productImages.find(
                (image) => image.is_featured
              );

              const image =
                featuredImage?.image_url ||
                product.featured_image_url ||
                productImages[0]?.image_url ||
                "";

              return {
                id: product.id,
                slug: product.slug,
                number: String(index + 1).padStart(2, "0"),
                title: product.name,
                shortTitle: product.name.toUpperCase(),
                description:
                  product.short_description ||
                  product.description ||
                  "Contact us for more information about this product.",
                image,
              };
            })
            .filter((product) => product.image);

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Products loading error:", err);
        setError("Unable to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const updateCarousel = useCallback(() => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards = Array.from(
      slider.querySelectorAll<HTMLElement>(".product-card")
    );

    if (!cards.length) {
      setActiveIndex(0);
      setMaxIndex(0);
      return;
    }

    const maxScroll = slider.scrollWidth - slider.clientWidth;

    const lastReachableIndex = cards.reduce(
      (last, card, index) => {
        const cardPosition = card.offsetLeft - slider.offsetLeft;

        return cardPosition <= maxScroll + 2 ? index : last;
      },
      0
    );

    setMaxIndex(lastReachableIndex);

    const current = cards.reduce(
      (closest, card, index) => {
        const distance = Math.abs(
          card.offsetLeft -
          slider.offsetLeft -
          slider.scrollLeft
        );

        return distance < closest.distance
          ? { index, distance }
          : closest;
      },
      { index: 0, distance: Infinity }
    );

    setActiveIndex(
      Math.min(current.index, lastReachableIndex)
    );
  }, []);

  const scrollToCard = (index: number) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards =
      slider.querySelectorAll<HTMLElement>(".product-card");

    const card = cards[index];

    if (!card) return;

    slider.scrollTo({
      left: card.offsetLeft - slider.offsetLeft,
      behavior: "smooth",
    });
  };

  const moveSlider = (direction: number) => {
    const nextIndex = Math.max(
      0,
      Math.min(maxIndex, activeIndex + direction)
    );

    scrollToCard(nextIndex);
  };

  useEffect(() => {
    updateCarousel();

    const slider = sliderRef.current;

    if (!slider) return;

    const resizeObserver = new ResizeObserver(updateCarousel);

    resizeObserver.observe(slider);

    return () => resizeObserver.disconnect();
  }, [products, updateCarousel]);

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

          <div className="products-controls">
            <button
              type="button"
              className="products-control"
              aria-label="Previous products"
              onClick={() => moveSlider(-1)}
              disabled={activeIndex === 0 || loading}
            >
              <ArrowLeft size={17} />
            </button>

            <button
              type="button"
              className="products-control products-control-next"
              aria-label="Next products"
              onClick={() => moveSlider(1)}
              disabled={
                activeIndex >= maxIndex ||
                loading ||
                products.length === 0
              }
            >
              <ArrowRight size={17} />
            </button>

            {products.length > 0 && (
              <div
                className="products-dots"
                aria-label="Product slides"
              >
                {products.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`products-dot ${activeIndex === index ? "active" : ""
                      }`}
                    aria-label={`Show ${product.title}`}
                    aria-current={
                      activeIndex === index ? "true" : undefined
                    }
                    onClick={() => scrollToCard(index)}
                  />
                ))}
              </div>
            )}
          </div>
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

        {!loading && !error && products.length === 0 && (
          <div className="products-track">
            <p>
              Our product catalogue is being updated.
              Please check back soon.
            </p>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div
            className="products-track"
            ref={sliderRef}
            onScroll={updateCarousel}
          >
            {products.map((product) => (
              <Link
                to={`/products/${product.slug}`}
                className="product-card"
                key={product.id}
                aria-label={`View ${product.title}`}
                title={product.description}
              >
                <div className="product-image-wrap">
                  <img
                    src={product.image}
                    alt={product.title}
                    loading="lazy"
                  />

                  <span className="product-number">
                    {product.number}
                  </span>
                </div>

                <div className="product-card-footer">
                  <span>{product.shortTitle}</span>

                  <span className="product-card-arrow">
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="products-bottom">
          <p>
            From agricultural produce to industrial equipment,
            we help connect your requirements with the right
            supply sources.
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
