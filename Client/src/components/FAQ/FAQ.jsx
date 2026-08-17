import React from 'react';
import styles from './FAQ.module.css';

const faqs = [
  {
    question: 'Can I open my own capsule early?',
    answer:
      'No — that is rather the point. Once a capsule is sealed, its contents stay locked until the unlock date passes, and until the location condition is met if you set one. Choose your date carefully.',
  },
  {
    question: 'What happens if a collaborator leaves?',
    answer:
      'Their contributions stay in the capsule. Collaborators can be removed from future editing, but nothing they already wrote is deleted, so the record of who was there stays intact.',
  },
  {
    question: 'How large can a capsule get?',
    answer:
      'Individual files can be up to 2 GB. Large uploads are chunked and resumable, so a dropped connection picks up where it left off instead of starting over.',
  },
  {
    question: 'How does location unlocking actually work?',
    answer:
      'You pick a point on the map when you seal the capsule. When someone tries to open it after the unlock date, their device location is checked against that point before the contents are released.',
  },
  {
    question: 'Is my content private?',
    answer:
      'Capsules are private by default and only visible to people you invite. Sealed contents are not readable from the dashboard, in search, or by anyone you have not explicitly added.',
  },
  {
    question: 'What if I signed up with email and now want to use Google?',
    answer:
      'Sign in with Google using the same email address and the two are linked automatically — same account, same capsules, either sign-in method from then on.',
  },
];

const FAQ = () => {
  return (
    <section className={styles.faq} id="faq">
      <div className={styles.inner}>
        <header className={styles.sectionHead}>
          <span className={styles.kicker}>Questions</span>
          <h2>Before you seal anything</h2>
        </header>

        <div className={styles.list}>
          {faqs.map((faq, index) => (
            <details className={styles.item} key={faq.question} open={index === 0}>
              <summary>
                {faq.question}
                <span className={styles.chevron} aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </span>
              </summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
