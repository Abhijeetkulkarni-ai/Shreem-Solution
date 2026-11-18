
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Certifications from "./components/Certifications";
import About from "./components/About";
import Services from "./components/Services";
import Products from "./components/Products";
import GlobalNetwork from "./components/GlobalNetwork";
import OurCommitment from "./components/OurCommitment"
import Testimonials from "./components/Testimonials";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import Footer from "./components/Footer";

function App() {
  return (
    <>
      <Navbar />

      <main>
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
      </main>
      <Footer />
    </>
  );
}

export default App;
