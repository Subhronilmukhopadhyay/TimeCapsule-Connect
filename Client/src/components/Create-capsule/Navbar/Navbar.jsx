// components/create-capsule/Navbar/NavBar.jsx
import { Link } from 'react-router-dom';
import React from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ title, onTitleChange, onPreview, onLock }) => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link to="/" className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          TimeCapsule
        </Link>

        <div className={styles.capsuleTitle}>
          <input 
            type="text" 
            id="capsule-name" 
            placeholder="Untitled Capsule" 
            className={styles.capsuleName}
            value={title}
            onChange={onTitleChange}
          />
        </div>
      </div>
    
      <div className={styles.navRight}>
        <div className={styles.capsuleActions}>
          <button className={`${styles.capsuleBtn} ${styles.previewBtn}`} onClick={onPreview}>
            Preview
          </button>
          <button className={`${styles.capsuleBtn} ${styles.lockBtn}`} onClick={onLock}>
            Lock Capsule
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;