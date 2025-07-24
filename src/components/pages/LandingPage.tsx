import React from 'react';
import Header from '../layout/Header';
import Hero from '../sections/Hero';
import Features from '../sections/Features';
import HowItWorks from '../sections/HowItWorks';
import Testimonials from '../sections/Testimonials';
import Pricing from '../sections/Pricing';
import FAQ from '../sections/FAQ';
import About from '../sections/About';
import Contact from '../sections/Contact';
import Footer from '../layout/Footer';

const LandingPage: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FAQ />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage; 