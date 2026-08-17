import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HowItWorks.module.css';

const steps = [
  {
    step: '01',
    title: 'Write it',
    description:
      'Open a blank capsule and fill it — text, photos, video, voice notes, files. The editor handles formatting and media so you can just get it down.',
    icon: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
      </>
    ),
  },
  {
    step: '02',
    title: 'Invite the others',
    description:
      'Share a link with the people who were there. Everyone writes into the same capsule at the same time, and you can see who added what.',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M19 8v6" />
        <path d="M22 11h-6" />
      </>
    ),
  },
  {
    step: '03',
    title: 'Seal it',
    description:
      'Choose the unlock date, and optionally a place on the map. Once sealed the contents are locked away from everyone, including you.',
    icon: (
      <>
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </>
    ),
  },
  {
    step: '04',
    title: 'Open it, years later',
    description:
      'When the date arrives — and you are standing in the right place — the capsule opens and everything is exactly as you left it.',
    icon: (
      <>
        <path d="M3 11V7a5 5 0 0 1 9.9-1" />
        <rect x="3" y="11" width="18" height="11" rx="2" />
        <circle cx="12" cy="16.5" r="1.4" />
      </>
    ),
  },
];

const HowItWorks = () => {
  return (
    <section className={styles.howItWorks} id="how-it-works">
      <div className={styles.inner}>
        <header className={styles.sectionHead}>
          <span className={styles.kicker}>How it works</span>
          <h2>Four steps between today and the day it opens</h2>
          <p>No setup, no storage to configure. Start writing and seal it when you are ready.</p>
        </header>

        <ol className={styles.steps}>
          {steps.map((step) => (
            <li className={styles.step} key={step.step}>
              <div className={styles.stepTop}>
                <span className={styles.stepIcon}>
                  <svg
                    width="21"
                    height="21"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    {step.icon}
                  </svg>
                </span>
                <span className={styles.stepNumber}>{step.step}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </li>
          ))}
        </ol>

        <div className={styles.footerCta}>
          <Link to="/register" className={styles.cta}>
            Start a capsule — it is free
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
