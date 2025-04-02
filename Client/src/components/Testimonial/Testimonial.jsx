import React from "react";
import './Testimonial.css';

const Testimonials = () => {
  return (
    <>
        <section className="testimonials">
            <h2>What Our Users Say</h2>
            <div className="testimonial-item">
            <p>"TimeCapsule Connect brought my family's memories back to life. An unforgettable experience!"</p>
            <span>- Jane Doe</span>
            </div>
            <div className="testimonial-item">
            <p>"A truly innovative platform for preserving our history together."</p>
            <span>- John Smith</span>
            </div>
        </section>
    </>
  );
}

export default Testimonials;