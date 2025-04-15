// components/create-capsule/sidebar/FontStyle.jsx
import React from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import styles from './FontStyle.module.css';

const FontStyle = () => {
  const editor = useSlate();
  
  const handleFontChange = (e) => {
    const fontFamily = e.target.value;
    Editor.addMark(editor, 'fontFamily', fontFamily);
  };
  
  const handleSizeChange = (e) => {
    const fontSize = e.target.value + 'px';
    Editor.addMark(editor, 'fontSize', fontSize);
  };

  return (
    <div className={styles.toolSection}>
      <h3>Font Style</h3>
      
      <select 
        className={styles.actionBtn} 
        style={{ justifyContent: 'space-between' }}
        onChange={handleFontChange}
      >
        <option value="Arial, sans-serif">Default Sans</option>
        <option value="Georgia, serif">Serif</option>
        <option value="Consolas, monospace">Monospace</option>
        <option value="'Comic Sans MS', cursive">Handwriting</option>
      </select>
      
      <div className={styles.sizeControl}>
        <div className={styles.sizeLabels}>
          <span>Size</span>
          <span id="font-size-display">16px</span>
        </div>
        <input 
          type="range" 
          min="8" 
          max="72" 
          defaultValue="16" 
          className={styles.sizeRange} 
          onChange={handleSizeChange}
        />
      </div>
    </div>
  );
};

export default FontStyle;