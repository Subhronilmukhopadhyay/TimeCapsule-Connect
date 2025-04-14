// components/create-capsule/modals/LockModal.jsx
import React from 'react';
import styles from './Modals.module.css';

const LockModal = ({ onClose }) => {
  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Lock Time Capsule</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.lockSettings}>
          <div className={styles.settingGroup}>
            <label>Unlock Date</label>
            <input type="date" />
          </div>
          
          <div className={styles.settingGroup}>
            <label>Unlock Time</label>
            <input type="time" />
          </div>
          
          <div className={styles.settingGroup}>
            <label>Unlock Location (Optional)</label>
            <input type="text" placeholder="Enter address or coordinates" />
          </div>
          
          <div className={styles.settingGroup}>
            <label>Message</label>
            <input 
              type="text" 
              placeholder="Display a message to recipients when the capsule is locked"
              className={styles.messageInput} 
            />
          </div>
          
          <div className={styles.settingGroup}>
            <label>Recipients</label>
            <div className={styles.recipientsContainer}>
              <div className={styles.selectedRecipients}>
                <span className={styles.recipientTag}>John Doe <button className={styles.removeRecipient}>×</button></span>
                <span className={styles.recipientTag}>Emily Morgan <button className={styles.removeRecipient}>×</button></span>
              </div>
              <input type="text" placeholder="Add more recipients..." />
            </div>
          </div>
          
          <div className={styles.settingGroup}>
            <label>Privacy Settings</label>
            <select className={styles.privacySelect}>
              <option>Only recipients can view</option>
              <option>Anyone with the link can view</option>
              <option>Public (searchable)</option>
            </select>
          </div>
        </div>
        
        <div className={styles.modalActions}>
          <button className={`${styles.modalBtn} ${styles.cancelBtn}`} onClick={onClose}>
            Cancel
          </button>
          <button className={`${styles.modalBtn} ${styles.confirmBtn}`}>
            Lock Capsule
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockModal;