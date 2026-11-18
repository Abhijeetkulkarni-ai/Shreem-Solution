
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

import ProductDetails from "./pages/ProductDetails";
import BlogPost from "./pages/BlogPost";
import VisitorTracker from "./components/VisitorTracker";

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
      <Navbar />
<VisitorTracker />
      <Routes>
        {/* Homepage */}
        <Route
          path="/"
          element={<HomePage />}
        />

        {/* Product Details */}
        <Route
          path="/products/:slug"
          element={<ProductDetails />}
        />

        {/* Blog Listing */}
        <Route
          path="/blog"
          element={<Blog />}
        />

        {/* Individual Blog Article */}
        <Route
          path="/blog/:slug"
          element={<BlogPost />}
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
