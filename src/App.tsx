
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Certifications from "./components/Certifications";
import About from "./components/About";
import Services from "./components/Services";
import Products from "./components/Products";
import GlobalNetwork from "./components/GlobalNetwork";
import OurCommitment from "./components/OurCommitment";
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Blog from "./components/Blog";
import Footer from "./components/Footer";

import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ProductsPage from "./pages/ProductsPage";
import ProductDetails from "./pages/ProductDetails";
import BlogPost from "./pages/BlogPost";

import VisitorTracker from "./components/VisitorTracker";
import ScrollToTop from "./components/ScrollToTop";


function HomePage() {
  return (
    <>
      <Hero />
      <Certifications />
      <About />
      <Services />
      <Products />
      <GlobalNetwork />
      <OurCommitment />
      <Testimonials />
      <FAQ />
      <Contact />
      <Blog />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <VisitorTracker />

      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Products */}
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductDetails />} />

        {/* Blog */}
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />

        {/* Legal Pages */}
        <Route
          path="/terms-and-conditions"
          element={<TermsAndConditions />}
        />

        <Route
          path="/privacy-policy"
          element={<PrivacyPolicy />}
        />

        {/* 404 Page */}
        <Route
          path="*"
          element={
            <main className="product-detail-state">
              <h1>Page not found</h1>
              <a href="/">Back to homepage</a>
            </main>
          }
        />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
}

export default App;
