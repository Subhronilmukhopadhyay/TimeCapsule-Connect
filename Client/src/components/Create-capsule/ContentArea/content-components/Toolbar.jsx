// components/create-capsule/Toolbar.jsx
import React from 'react';
import { useSlate } from 'slate-react';
import { toggleMark, toggleBlock, isMarkActive, isBlockActive, undo, redo } from '../../../../services/editor-utils';
import styles from './Toolbar.module.css';

const ToolButton = ({ title, format, icon, children, type = 'mark', onClick }) => {
  const editor = useSlate();
  
  const isActive = type === 'mark' 
    ? isMarkActive(editor, format)
    : isBlockActive(editor, format);

    const handleMouseDown = event => {
      event.preventDefault();
      if (onClick) {
        // Custom click handler (e.g. undo/redo)
        onClick(editor);
      } else {
        if (type === 'mark') {
          toggleMark(editor, format);
        } else {
          toggleBlock(editor, format);
        }
      }
    };

  return (
    <button 
      className={`${styles.toolBtn} ${isActive ? styles.active : ''}`} 
      title={title}
      onMouseDown={handleMouseDown}
    >
      {icon ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icon}
        </svg>
      ) : children}
    </button>
  );
};

const Divider = () => <div className={styles.divider} />;

const Toolbar = () => {
  return (
    <div className={styles.toolbar}>
      <ToolButton 
        title="Undo" 
        icon={
          <>
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h14a4 4 0 0 1 0 8h-5" />
          </>
        }
        onClick={undo}
      />

      <ToolButton 
        title="Redo" 
        icon={
          <>
            <path d="m15 14 5-5-5-5" />
            <path d="M20 9H6a4 4 0 0 0 0 8h5" />
          </>
        }
        onClick={redo}
      />
      
      <Divider />
      
      <ToolButton title="Paragraph" format="paragraph" type="block">¶</ToolButton>
      <ToolButton title="Bold" format="bold">
        <strong>B</strong>
      </ToolButton>
      <ToolButton title="Italic" format="italic">
        <em>I</em>
      </ToolButton>
      <ToolButton title="Underline" format="underline">
        <u>U</u>
      </ToolButton>
      <ToolButton title="Strikethrough" format="strikethrough">
        <s>S</s>
      </ToolButton>
      
      <Divider />
      
      <ToolButton title="Bullet List" format="bulleted-list" type="block">•</ToolButton>
      <ToolButton title="Numbered List" format="numbered-list" type="block">1.</ToolButton>
      <ToolButton title="Block Quote" format="block-quote" type="block">❞</ToolButton>
      
      <Divider />
      
      <ToolButton 
        title="Insert Link" 
        format="link"
        icon={
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </>
        } 
      />
      <ToolButton 
        title="Insert Image" 
        icon={
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </>
        } 
      />
      <ToolButton 
        title="Insert Video" 
        icon={
          <>
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </>
        } 
      />
    </div>
  );
};

export default Toolbar;