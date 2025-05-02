import React, { useState, useEffect, useRef } from 'react';
import { useSlate } from 'slate-react';
import { Editor } from 'slate';
import styles from './Colors.module.css';

const ColorButton = ({ color, selected, onClick }) => (
  <button
    className={`${styles.colorBtn} ${selected ? styles.selected : ''}`}
    style={{ backgroundColor: color }}
    onClick={onClick}
  />
);

// Convert HEX to RGBA
const hexToRgba = (hex, alpha) => {
  const bigint = parseInt(hex.replace('#', ''), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const Colors = () => {
  const editor = useSlate();

  const [activeHighlight, setActiveHighlight] = useState(null); // { type, color }
  const [bgOpacity, setBgOpacity] = useState(0); // 0 to 100%
  const [selectedBgColor, setSelectedBgColor] = useState(null);
  const timeoutRef = useRef(null);

  const textColors = ['#000000', '#ff0000', '#0000ff', '#00cc00', '#ff9900'];
  const bgColors = ['#ffffff', '#ffeeee', '#eeeeff', '#eeffee', '#fff9ee'];

  const applyTextColor = (color) => {
    Editor.addMark(editor, 'color', color);
    setActiveHighlight({ type: 'text', color });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveHighlight(null), 500);
  };

  const applyBgColor = (color) => {
    setSelectedBgColor(color);
    setActiveHighlight({ type: 'background', color });
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setActiveHighlight(null), 500);
  };

  useEffect(() => {
    if (selectedBgColor) {
      const rgba = hexToRgba(selectedBgColor, bgOpacity / 100);
      Editor.addMark(editor, 'backgroundColor', rgba);
    }
  }, [selectedBgColor, bgOpacity, editor]);

  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div className={styles.toolSection}>
      <h3>Colors</h3>

      <div className={styles.colorRow}>
        <span>Text</span>
        <div className={styles.colorOptions}>
          {textColors.map((color, index) => (
            <ColorButton
              key={`text-${index}`}
              color={color}
              selected={activeHighlight?.type === 'text' && activeHighlight.color === color}
              onClick={() => applyTextColor(color)}
            />
          ))}
        </div>
      </div>

      <div className={styles.colorRow}>
        <span>Background</span>
        <div className={styles.colorOptions}>
          {bgColors.map((color, index) => (
            <ColorButton
              key={`bg-${index}`}
              color={color}
              selected={activeHighlight?.type === 'background' && activeHighlight.color === color}
              onClick={() => applyBgColor(color)}
            />
          ))}
        </div>
      </div>

      <div className={styles.sliderSection}>
        <label htmlFor="bgOpacity">BG Opacity: {bgOpacity}%</label>
        <input
          type="range"
          id="bgOpacity"
          min="0"
          max="100"
          value={bgOpacity}
          onChange={(e) => setBgOpacity(parseInt(e.target.value))}
          className={styles.slider}
        />
      </div>
    </div>
  );
};

export default Colors;
