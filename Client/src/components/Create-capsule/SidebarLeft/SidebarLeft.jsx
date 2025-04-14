// components/create-capsule/LeftSidebar.jsx
import React from 'react';
import TextFormatting from './sidebar-components/TextFormatting';
import FontStyle from './sidebar-components/FontStyle';
import Colors from './sidebar-components/Colors';
import MediaInsert from './sidebar-components/MediaInsert';
import styles from './LeftSidebar.module.css';

const LeftSidebar = () => {
  return (
    <aside className={styles.leftSidebar}>
      <TextFormatting />
      
      <div className={styles.separator} />
      
      <FontStyle />
      
      <div className={styles.separator} />
      
      <Colors />
      
      <div className={styles.separator} />
      
      <MediaInsert />
    </aside>
  );
};

export default LeftSidebar;