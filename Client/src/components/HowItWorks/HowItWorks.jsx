import React from "react";
import './HowItWorks.css';

const HowItWorks = () => {
  return (
    <>
        <section className="how-it-works" id="how-it-works">
            <h2>How It Works</h2>
            <div className="steps">
            <div className="step">
                <img src="icon-create.png" alt="Create Icon" />
                <h3>Create a Capsule</h3>
                <p>Begin your journey by creating a digital capsule of your memories.</p>
            </div>
            <div className="step">
                <img src="icon-collaborate.png" alt="Collaborate Icon" />
                <h3>Collaborate</h3>
                <p>Invite friends and family to contribute their moments and stories.</p>
            </div>
            <div className="step">
                <img src="icon-unlock.png" alt="Unlock Icon" />
                <h3>Unlock</h3>
                <p>Set conditions to unlock your capsule – by time or location.</p>
            </div>
            </div>
        </section>
    </>
  );
}

export default HowItWorks;