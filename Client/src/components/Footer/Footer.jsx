import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <p>
        <a href="#about">About</a> |
        <a href="#contact">Contact</a> |
        <a href="/privacy-policy">Privacy Policy</a> |
        <a href="/terms-of-service">Terms of Service</a>
      </p>
      <p>&copy; 2025 TimeCapsule Connect. All rights reserved.</p>
    </footer>
  );
};

export default Footer;