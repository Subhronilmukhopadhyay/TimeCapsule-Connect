// components/create-capsule/modals/PreviewModal.jsx
import React from 'react';
import styles from './Modals.module.css';

const PreviewModal = ({ onClose }) => {
  return (
    <div className={styles.modal}>
      <div className={`${styles.modalContent} ${styles.previewModal}`}>
        <div className={styles.modalHeader}>
          <h2>Preview Time Capsule</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.previewContent}>
          <h1>My TimeCapsule</h1>
          <p>Start writing your memories, thoughts, and messages here...</p>
          <p>You can add text, images, videos, and more to your time capsule.</p>
          <p>This content will be locked until the date or location you specify.</p>
        </div>
        
        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.cancelBtn}`} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;