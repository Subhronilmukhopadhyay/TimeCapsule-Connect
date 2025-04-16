import React from 'react';
import styles from '../Modals.module.css';

const DateSelector = ({ lockDate, setLockDate }) => (
  <div className={styles.dateSelector}>
    <h4>Select Unlock Date</h4>
    <input 
      type="date" 
      className={styles.datePicker}
      value={lockDate}
      onChange={(e) => setLockDate(e.target.value)}
      min={new Date().toISOString().split('T')[0]}
      required
    />
  </div>
);

export default DateSelector;