import React from 'react';
import styles from './Hero.module.css';

const Hero = () => {
  return (
    <section className={styles.hero} id="hero">
      <h1>Preserve Your Memories, Unlock Your Legacy</h1>
      <p>Create, collaborate, and rediscover your past in a digital time capsule.</p>
      <button className={styles.ctaButton}>Get Started</button>
    </section>
  );
};

export default Hero;