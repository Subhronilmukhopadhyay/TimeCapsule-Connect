import React from "react"
import './Footer.css'

const Footer = () => {
  return (
    <>
      <footer className="footer">
        <p>
          <a href="#about">About</a> |
          <a href="#contact">Contact</a> |
          <a href="#privacy">Privacy Policy</a> |
          <a href="#terms">Terms of Service</a>
        </p>
        <p>&copy; 2025 TimeCapsule Connect. All rights reserved.</p>
      </footer>
    </>
  );
};

export default Footer;
