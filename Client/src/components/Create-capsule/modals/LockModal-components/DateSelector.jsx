import React from 'react';
import styles from '../Modals.module.css';

const DateSelector = ({ lockDate, setLockDate }) => {
  // Calculate minimum date (today)
  const today = new Date().toISOString().split('T')[0];
  
  return (
    <div className={styles.dateSelector}>
      <h4>Select Unlock Date</h4>
      <input 
        type="date" 
        className={styles.datePicker}
        value={lockDate}
        onChange={(e) => setLockDate(e.target.value)}
        min={today}
        required
        aria-label="Select unlock date"
      />
    </div>
  );
};

export default React.memo(DateSelector);