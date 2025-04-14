// components/create-capsule/sidebar/TextFormatting.jsx
import React from 'react';
import styles from './TextFormatting.module.css';

const TextFormatting = () => {
  return (
    <div className={styles.toolSection}>
      <h3>Text Formatting</h3>
      
      <div className={styles.toolGroup}>
        <button className={`${styles.toolBtn} ${styles.active}`} title="Normal Text">T</button>
        <button className={styles.toolBtn} title="Heading 1">H1</button>
        <button className={styles.toolBtn} title="Heading 2">H2</button>
        <button className={styles.toolBtn} title="Heading 3">H3</button>
      </div>
      
      <div className={styles.toolGroup}>
        <button className={styles.toolBtn} title="Bold"><strong>B</strong></button>
        <button className={styles.toolBtn} title="Italic"><em>I</em></button>
        <button className={styles.toolBtn} title="Underline"><u>U</u></button>
        <button className={styles.toolBtn} title="Strikethrough"><s>S</s></button>
      </div>
      
      <div className={styles.toolGroup}>
        <button className={styles.toolBtn} title="Bullet List">•</button>
        <button className={styles.toolBtn} title="Numbered List">1.</button>
        <button className={styles.toolBtn} title="Quote">❝</button>
        <button className={styles.toolBtn} title="Code">&lt;/&gt;</button>
      </div>
    </div>
  );
};

export default TextFormatting;