import React from 'react';
import styles from './Testimonials.module.css';

const Testimonials = () => {
  const testimonials = [
    {
      quote: "TimeCapsule Connect brought my family's memories back to life. An unforgettable experience!",
      author: "Jane Doe"
    },
    {
      quote: "A truly innovative platform for preserving our history together.",
      author: "John Smith"
    }
  ];

  return (
    <section className={styles.testimonials}>
      <h2>What Our Users Say</h2>
      {testimonials.map((testimonial, index) => (
        <div className={styles.testimonialItem} key={index}>
          <p>"{testimonial.quote}"</p>
          <span>- {testimonial.author}</span>
        </div>
      ))}
    </section>
  );
};

export default Testimonials;