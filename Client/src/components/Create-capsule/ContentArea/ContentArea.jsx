import React from 'react';
import Toolbar from './content-components/Toolbar';
import CanvasWorkspace from './content-components/Canvas';
import styles from './ContentArea.module.css';

const ContentArea = () => {
  return (
    <div className={styles.contentArea}>
      <Toolbar />
      <CanvasWorkspace />
    </div>
  );
};

export default ContentArea;