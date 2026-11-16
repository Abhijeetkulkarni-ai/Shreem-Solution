
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Certifications from "./components/Certifications";
import About from "./components/About";
import Services from "./components/Services";
import Products from "./components/Products";
import GlobalNetwork from "./components/GlobalNetwork";
import OurCommitment from "./components/OurCommitment"
import Contact from "./components/Contact"
;

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
        <Contact />
      </main>
    </>
  );
}

export default App;
