// components/create-capsule/modals/LockModal.jsx
import React, { useState } from 'react';
import styles from './Modals.module.css';

const LockModal = ({ onClose }) => {
  const [lockDate, setLockDate] = useState('');
  const [lockLocation, setLockLocation] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Locking capsule with:', { lockDate, lockLocation });
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Lock TimeCapsule</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.modalBody}>
            <div className={styles.lockOptions}>
              <h3>Lock Configuration</h3>

              <div className={styles.dateSelector}>
                <h4>
                  Select Unlock Date&nbsp;
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                </h4>
                <input 
                  type="date" 
                  className={styles.datePicker}
                  value={lockDate}
                  onChange={(e) => setLockDate(e.target.value)}
                  min={(new Date()).toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className={styles.locationSelector}>
                <h4>
                  Set Unlock Location&nbsp;
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </h4>
                <input 
                  type="text"
                  className={styles.locationInput}
                  placeholder="Enter address or landmark"
                  value={lockLocation}
                  onChange={(e) => setLockLocation(e.target.value)}
                  required
                />
                <div className={styles.mapPlaceholder}>
                  <div className={styles.map}>
                    Map will go here
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" className={styles.secondaryBtn} onClick={onClose}>Cancel</button>
            <button type="submit" className={styles.primaryBtn}>Lock Capsule</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LockModal;
