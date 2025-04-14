import React from 'react';
import styles from './Features.module.css';

const Features = () => {
  const featureData = [
    {
      icon: "/images/icon-collaboration.png",
      title: "Real-Time Collaboration",
      description: "Edit and contribute together in real time, just like a live document."
    },
    {
      icon: "/images/icon-geolocation.png",
      title: "Geolocation Unlocking",
      description: "Set location-based unlocks to reveal memories when you're at a specific spot."
    },
    {
      icon: "/images/icon-security.png",
      title: "Secure Digital Legacy",
      description: "Your memories are safely stored and easily accessible for future generations."
    }
  ];

  return (
    <section className={styles.features} id="features">
      <h2>Features</h2>
      <div className={styles.featureList}>
        {featureData.map((feature, index) => (
          <div className={styles.featureItem} key={index}>
            <img src={feature.icon} alt={`${feature.title} Icon`} />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;