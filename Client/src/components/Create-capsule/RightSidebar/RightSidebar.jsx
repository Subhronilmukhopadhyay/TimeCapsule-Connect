import React from 'react';
import Collaborators from './sidebar-components/CollaboratorsList';
import Activity from './sidebar-components/ActivityFeed';
import styles from './RightSidebar.module.css';

const RightSidebar = () => {
  return (
    <aside className={styles.rightSidebar}>
      <Collaborators />
      <Activity />
    </aside>
  );
};

export default RightSidebar;