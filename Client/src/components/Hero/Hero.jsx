import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Hero.module.css';

/** Snapshot cards used for the illustration on the right of the hero. */
const CAPSULE_PREVIEWS = [
  {
    title: "Ram's 30th",
    meta: 'Unlocks 14 Mar 2032',
    detail: 'Goa, India · 6 contributors',
    tint: 'violet',
    progress: 62,
  },
  {
    title: 'Class of 2025',
    meta: 'Unlocks 01 Jun 2035',
    detail: 'Campus quad · 41 contributors',
    tint: 'amber',
    progress: 28,
  },
  {
    title: 'Letter to future me',
    meta: 'Unlocks 09 Sep 2030',
    detail: 'Private · 1 contributor',
    tint: 'teal',
    progress: 85,
  },
];

const STATS = [
  { value: '2 GB', label: 'per capsule' },
  { value: 'Real-time', label: 'co-editing' },
  { value: 'Time + place', label: 'unlock rules' },
];

const Hero = () => {
  return (
    <section className={styles.hero} id="hero">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} />
            Sealed today. Opened when it matters.
          </span>

          <h1 className={styles.title}>
            Preserve your memories,
            <br />
            <span className={styles.titleAccent}>unlock your legacy</span>
          </h1>

          <p className={styles.subtitle}>
            Write it together, seal it with a date and a place, and let it wait. TimeCapsule
            Connect keeps your photos, videos and words safe until the exact moment you chose
            to relive them.
          </p>

          <div className={styles.actions}>
            <Link to="/register" className={styles.primaryCta}>
              Create your first capsule
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
            <a href="#how-it-works" className={styles.secondaryCta}>
              See how it works
            </a>
          </div>

          <ul className={styles.stats}>
            {STATS.map((stat) => (
              <li key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.visualGlow} />
          {CAPSULE_PREVIEWS.map((capsule, index) => (
            <article
              key={capsule.title}
              className={`${styles.capsuleCard} ${styles[`card${index + 1}`]} ${styles[capsule.tint]}`}
            >
              <header className={styles.capsuleHead}>
                <span className={styles.lockBadge}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Sealed
                </span>
                <span className={styles.capsuleMeta}>{capsule.meta}</span>
              </header>

              <h3 className={styles.capsuleTitle}>{capsule.title}</h3>
              <p className={styles.capsuleDetail}>{capsule.detail}</p>

              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: `${capsule.progress}%` }} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
