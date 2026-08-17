import React from 'react';
import styles from './Testimonials.module.css';

/**
 * Placeholder social proof. Swap these for real quotes before launch — the
 * names below are illustrative sample content, not actual customers.
 */
const testimonials = [
  {
    quote:
      'We started one for our daughter the week she was born. Her grandparents add to it every year, and none of us can open it until she turns eighteen.',
    author: 'Sample review',
    role: 'Family capsule',
    initials: 'FC',
    tint: 'violet',
  },
  {
    quote:
      'Forty of us wrote into the same capsule on our last day of college. It unlocks on campus in 2035 — you have to physically be there to read it.',
    author: 'Sample review',
    role: 'Class capsule',
    initials: 'CC',
    tint: 'amber',
  },
  {
    quote:
      'I write one letter to myself every New Year and seal it for a decade. Opening the first one last year was the strangest, best thing.',
    author: 'Sample review',
    role: 'Personal capsule',
    initials: 'PC',
    tint: 'teal',
  },
];

const Testimonials = () => {
  return (
    <section className={styles.testimonials} id="stories">
      <div className={styles.inner}>
        <header className={styles.sectionHead}>
          <span className={styles.kicker}>Stories</span>
          <h2>What people are sealing away</h2>
          <p>A few of the ways capsules get used — from single letters to forty-person archives.</p>
        </header>

        <div className={styles.grid}>
          {testimonials.map((testimonial) => (
            <figure className={styles.testimonialItem} key={testimonial.quote}>
              <svg
                className={styles.quoteMark}
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c.4 0 .8 0 1.1-.1-.5 1.9-2 3.3-4 3.8l.6 2.3c3.7-.9 6.3-4.2 6.3-8.4V10.5C11.5 8 9.9 6 7.5 6zm10 0C15 6 13 8 13 10.5s2 4.5 4.5 4.5c.4 0 .8 0 1.1-.1-.5 1.9-2 3.3-4 3.8l.6 2.3c3.7-.9 6.3-4.2 6.3-8.4V10.5C21.5 8 19.9 6 17.5 6z" />
              </svg>

              <blockquote>{testimonial.quote}</blockquote>

              <figcaption>
                <span className={`${styles.avatar} ${styles[testimonial.tint]}`}>
                  {testimonial.initials}
                </span>
                <span className={styles.person}>
                  <strong>{testimonial.author}</strong>
                  <span>{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
