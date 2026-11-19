
export interface Testimonial {
  number: string;
  quote: string;
  name: string;
  company: string;
  location: string;
  category: string;
}

export const testimonials: Testimonial[] = [
  {
    number: "01",
    quote:
      "Add genuine client feedback about their experience with product sourcing, communication, or trade coordination.",
    name: "Client Name",
    company: "Company Name",
    location: "Country",
    category: "IMPORT / EXPORT",
  },
  {
    number: "02",
    quote:
      "Add an approved client review describing how SHREEM SOLUTION supported their sourcing or supplier coordination requirements.",
    name: "Client Name",
    company: "Company Name",
    location: "Country",
    category: "PRODUCT SOURCING",
  },
  {
    number: "03",
    quote:
      "Add genuine feedback highlighting reliability, transparency, and the quality of the business relationship.",
    name: "Client Name",
    company: "Company Name",
    location: "Country",
    category: "TRADE PARTNERSHIP",
  },
];
