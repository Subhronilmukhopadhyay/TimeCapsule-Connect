// components/create-capsule/modals/PreviewModal.jsx
import React from 'react';
import styles from './Modals.module.css';

const PreviewModal = ({ onClose, content }) => {
  return (
    <div className={`${styles.modalOverlay} ${styles.previewModal}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Preview TimeCapsule</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.previewContent}>
          {/* Render preview content here */}
          <div className={styles.previewDocument}>
            <h1>My TimeCapsule</h1>
            <p>This is how your TimeCapsule will appear when opened.</p>
            {/* We'll populate this with actual content later */}
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.primaryBtn} onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;