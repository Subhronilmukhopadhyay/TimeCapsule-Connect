import React, { useState, useRef, useEffect } from 'react';
import { useSlate } from 'slate-react';
import { toggleMark, isMarkActive } from '../../../services/editor-utils';
import styles from './FloatingToolbar.module.css';

const FloatingToolbar = () => {
  const editor = useSlate();
  const [position, setPosition] = useState({ x: 300, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const toolbarRef = useRef(null);

  // Function to check if text is selected
  const updateVisibility = () => {
    const { selection } = editor;
    if (!selection || selection.anchor.offset === selection.focus.offset) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
      
      // Position the toolbar near the selection
      const domSelection = window.getSelection();
      if (domSelection.rangeCount > 0) {
        const range = domSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setPosition({
          x: rect.left + window.scrollX + (rect.width / 2) - 100, // Center the toolbar
          y: rect.top + window.scrollY - 50 // Position above the selection
        });
      }
    }
  };

  // Use effect to monitor selection changes
  useEffect(() => {
    const handleSelectionChange = () => {
      updateVisibility();
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [editor]);

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

  if (!isVisible) return null;

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
      
      <button 
        className={`${styles.toolBtn} ${isMarkActive(editor, 'bold') ? styles.active : ''}`} 
        title="Bold"
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, 'bold');
        }}
      >
        <strong>B</strong>
      </button>
      
      <button 
        className={`${styles.toolBtn} ${isMarkActive(editor, 'italic') ? styles.active : ''}`} 
        title="Italic"
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, 'italic');
        }}
      >
        <em>I</em>
      </button>
      
      <button 
        className={`${styles.toolBtn} ${isMarkActive(editor, 'underline') ? styles.active : ''}`} 
        title="Underline"
        onMouseDown={(e) => {
          e.preventDefault();
          toggleMark(editor, 'underline');
        }}
      >
        <u>U</u>
      </button>
      
      <button 
        className={styles.toolBtn} 
        title="Text Color"
        onMouseDown={(e) => {
          e.preventDefault();
          // We'd normally show a color picker here
          toggleMark(editor, 'color', '#FF0000');
        }}
      >
        A
      </button>
      
      <button 
        className={`${styles.toolBtn} ${isMarkActive(editor, 'link') ? styles.active : ''}`} 
        title="Link"
        onMouseDown={(e) => {
          e.preventDefault();
          const url = prompt('Enter URL:');
          if (url) {
            editor.addMark('link', url);
          }
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
        </svg>
      </button>
    </div>
  );
};

export default FloatingToolbar;
