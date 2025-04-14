// components/create-capsule/FloatingToolbar.jsx
import React, { useState, useRef, useEffect } from 'react';
import styles from './FloatingToolbar.module.css';

const FloatingToolbar = () => {
  const [position, setPosition] = useState({ x: 300, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const toolbarRef = useRef(null);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    const rect = toolbarRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div 
      className={styles.floatingToolbar}
      ref={toolbarRef}
      style={{ left: position.x, top: position.y }}
    >
      <div 
        className={styles.floatingToolbarHandle}
        onMouseDown={handleMouseDown}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" 
          stroke="currentColor" strokeWidth="2">
          <circle cx="8" cy="8" r="2" />
          <circle cx="8" cy="16" r="2" />
          <circle cx="16" cy="8" r="2" />
          <circle cx="16" cy="16" r="2" />
        </svg>
      </div>
      
      <button className={styles.toolBtn} title="Bold"><strong>B</strong></button>
      <button className={styles.toolBtn} title="Italic"><em>I</em></button>
      <button className={styles.toolBtn} title="Underline"><u>U</u></button>
      <button className={styles.toolBtn} title="Text Color">A</button>
      <button className={styles.toolBtn} title="Link">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
    </div>
  );
};

export default FloatingToolbar;