
import { useRef, useState, useEffect } from "react";

import { ArrowLeft, ArrowRight } from "lucide-react";

interface Product {
  number: string;
  title: string;
  shortTitle: string;
  description: string;
  image: string;
}

const products: Product[] = [
  {
    number: "01",
    title: "Agricultural Commodities",
    shortTitle: "AGRI COMMODITIES",
    description:
      "Quality agricultural produce sourced to meet international market requirements.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "02",
    title: "Spices & Food",
    shortTitle: "SPICES & FOOD",
    description:
      "A selection of spices and food products connecting producers with global buyers.",
    image:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "03",
    title: "Textiles",
    shortTitle: "TEXTILES",
    description:
      "Textile materials and fabrics sourced for diverse commercial requirements.",
    image:
      "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "04",
    title: "Chemicals",
    shortTitle: "CHEMICALS",
    description:
      "Industrial and specialty chemical sourcing through suitable supply partners.",
    image:
      "https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "05",
    title: "Machinery",
    shortTitle: "MACHINERY",
    description:
      "Industrial machinery and equipment for businesses across multiple sectors.",
    image:
      "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "06",
    title: "Electronics",
    shortTitle: "ELECTRONICS",
    description:
      "Electronic components and products sourced to match business specifications.",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "07",
    title: "Construction Materials",
    shortTitle: "CONSTRUCTION",
    description:
      "Building materials and industrial supplies for commercial projects.",
    image:
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "08",
    title: "Metals & Minerals",
    shortTitle: "METALS & MINERALS",
    description:
      "Metal products and mineral resources sourced for industrial applications.",
    image:
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "09",
    title: "Packaging Materials",
    shortTitle: "PACKAGING",
    description:
      "Packaging products and materials for manufacturing and distribution needs.",
    image:
      "https://images.unsplash.com/photo-1607166452427-7e4477079cb9?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "10",
    title: "Automotive Components",
    shortTitle: "AUTOMOTIVE",
    description:
      "Automotive parts and components for a range of business requirements.",
    image:
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "11",
    title: "Paper & Paper Products",
    shortTitle: "PAPER PRODUCTS",
    description:
      "Paper, boards and related products for commercial and industrial use.",
    image:
      "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=900&q=85",
  },
  {
    number: "12",
    title: "Industrial Equipment",
    shortTitle: "INDUSTRIAL EQUIPMENT",
    description:
      "Specialized equipment and tools sourced for operational requirements.",
    image:
      "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=900&q=85",
  },
];

export default function Products() {
  const sliderRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [maxIndex, setMaxIndex] = useState<number>(products.length - 1);

  const updateCarousel = () => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards = Array.from(
      slider.querySelectorAll<HTMLElement>(".product-card")
    );

    if (!cards.length) return;

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
  };

  const scrollToCard = (index: number) => {
    const slider = sliderRef.current;

    if (!slider) return;

    const cards = slider.querySelectorAll<HTMLElement>(".product-card");
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

          <div className="products-controls">
            <button
              type="button"
              className="products-control"
              aria-label="Previous products"
              onClick={() => moveSlider(-1)}
              disabled={activeIndex === 0}
            >
              <ArrowLeft size={17} />
            </button>

            <button
              type="button"
              className="products-control products-control-next"
              aria-label="Next products"
              onClick={() => moveSlider(1)}
              disabled={activeIndex >= maxIndex}
            >
              <ArrowRight size={17} />
            </button>

            <div
              className="products-dots"
              aria-label="Product slides"
            >
              {products.map((product, index) => (
                <button
                  key={product.number}
                  type="button"
                  className={`products-dot ${
                    activeIndex === index ? "active" : ""
                  }`}
                  aria-label={`Show ${product.title}`}
                  aria-current={
                    activeIndex === index ? "true" : undefined
                  }
                  onClick={() => scrollToCard(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div
          className="products-track"
          ref={sliderRef}
          onScroll={updateCarousel}
        >
          {products.map((product) => (
            <a
              href="#contact"
              className="product-card"
              key={product.number}
              aria-label={`Enquire about ${product.title}`}
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
            </a>
          ))}
        </div>

        <div className="products-bottom">
          <p>
            From agricultural produce to industrial equipment,
            we help connect your requirements with the right supply sources.
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
