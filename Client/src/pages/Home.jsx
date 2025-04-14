import React from "react";
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import Footer from '../components/Footer/Footer';
import Features from "../components/Features/Features";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import Testimonials from "../components/Testimonial/Testimonial";
import styles from '../styles/Home.module.css'

const Home = () => {
  return (
    <>
      <div className={styles.container}>
        <Navbar />
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    </>
  );
};
export default Home;
