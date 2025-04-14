// components/create-capsule/sidebar/FontStyle.jsx
import React from 'react';
import styles from './FontStyle.module.css';

const FontStyle = () => {
  return (
    <div className={styles.toolSection}>
      <h3>Font Style</h3>
      
      <select className={styles.actionBtn} style={{ justifyContent: 'space-between' }}>
        <option>Default Sans</option>
        <option>Serif</option>
        <option>Monospace</option>
        <option>Handwriting</option>
      </select>
      
      <div className={styles.sizeControl}>
        <div className={styles.sizeLabels}>
          <span>Size</span>
          <span>16px</span>
        </div>
        <input 
          type="range" 
          min="8" 
          max="72" 
          defaultValue="16" 
          className={styles.sizeRange} 
        />
      </div>
    </div>
  );
};

export default FontStyle;