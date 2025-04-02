import React from "react";
import './Features.css';

const Features = () => {
  return (
    <>
        <section className="features" id="features">
            <h2>Features</h2>
            <div className="feature-list">
            <div className="feature-item">
                <img src="icon-collaboration.png" alt="Collaboration Icon" />
                <h3>Real-Time Collaboration</h3>
                <p>Edit and contribute together in real time, just like a live document.</p>
            </div>
            <div className="feature-item">
                <img src="icon-geolocation.png" alt="Geolocation Icon" />
                <h3>Geolocation Unlocking</h3>
                <p>Set location-based unlocks to reveal memories when you’re at a specific spot.</p>
            </div>
            <div className="feature-item">
                <img src="icon-security.png" alt="Security Icon" />
                <h3>Secure Digital Legacy</h3>
                <p>Your memories are safely stored and easily accessible for future generations.</p>
            </div>
            </div>
        </section>
    </>
  );
}

export default Features;