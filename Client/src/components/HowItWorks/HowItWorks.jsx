import React from 'react';
import styles from './HowItWorks.module.css';

const HowItWorks = () => {
  const steps = [
    {
      icon: "/images/icon-create.png",
      title: "Create a Capsule",
      description: "Begin your journey by creating a digital capsule of your memories."
    },
    {
      icon: "/images/icon-collaborate.png",
      title: "Collaborate",
      description: "Invite friends and family to contribute their moments and stories."
    },
    {
      icon: "/images/icon-unlock.png",
      title: "Unlock",
      description: "Set conditions to unlock your capsule – by time or location."
    }
  ];

  return (
    <section className={styles.howItWorks} id="how-it-works">
      <h2>How It Works</h2>
      <div className={styles.steps}>
        {steps.map((step, index) => (
          <div className={styles.step} key={index}>
            <img src={step.icon} alt={`${step.title} Icon`} />
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;