import React from 'react';
import styles from './Features.module.css';

/* Icons are inline SVG rather than /images/*.png, which never existed in the
   repo and rendered as broken images. */
const featureData = [
  {
    title: 'Real-time collaboration',
    description:
      'Invite family or friends and write together on the same capsule. Every keystroke syncs live, with no version conflicts to untangle.',
    accent: 'violet',
    icon: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  },
  {
    title: 'Time-locked by design',
    description:
      'Pick the exact date your capsule opens. Until then it stays sealed — even for you. Anticipation is part of the gift.',
    accent: 'amber',
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3.2 1.9" />
      </>
    ),
  },
  {
    title: 'Unlock at a place',
    description:
      'Add a location and the capsule only opens when someone is standing there. Return to the spot to relive the moment.',
    accent: 'teal',
    icon: (
      <>
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
  },
  {
    title: 'Rich media, properly handled',
    description:
      'Drop in photos, video, audio and documents up to 2 GB. Resize and align them inline, and large uploads resume if your connection drops.',
    accent: 'rose',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </>
    ),
  },
  {
    title: 'A writing surface that behaves',
    description:
      'Headings, lists, quotes, code and links with markdown shortcuts and keyboard hotkeys — the editor gets out of your way.',
    accent: 'indigo',
    icon: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
      </>
    ),
  },
  {
    title: 'Yours, and kept safe',
    description:
      'Capsules are private by default, sealed contents stay encrypted at rest, and you decide exactly who gets an invite.',
    accent: 'green',
    icon: (
      <>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
];

const Features = () => {
  return (
    <section className={styles.features} id="features">
      <div className={styles.inner}>
        <header className={styles.sectionHead}>
          <span className={styles.kicker}>Why TimeCapsule Connect</span>
          <h2>Everything a memory needs to survive the years</h2>
          <p>
            Built for the long wait — collaborative while you write, locked while you wait,
            and intact when it finally opens.
          </p>
        </header>

        <div className={styles.featureList}>
          {featureData.map((feature) => (
            <article className={styles.featureItem} key={feature.title}>
              <span className={`${styles.iconWrap} ${styles[feature.accent]}`}>
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {feature.icon}
                </svg>
              </span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
