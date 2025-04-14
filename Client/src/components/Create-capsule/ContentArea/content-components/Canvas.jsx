// components/create-capsule/CanvasWorkspace.jsx
import React from 'react';
import styles from './CanvasWorkspace.module.css';

const CanvasWorkspace = () => {
  return (
    <div className={styles.canvasContainer}>
      <div 
        className={styles.canvasWorkspace} 
        contentEditable="true"
        suppressContentEditableWarning={true}
      >
        <h1>My TimeCapsule</h1>
        <p>Start writing your memories, thoughts, and messages here...</p>
        <p>You can add text, images, videos, and more to your time capsule.</p>
        <p>This content will be locked until the date or location you specify.</p>
      </div>
    </div>
  );
};

export default CanvasWorkspace;