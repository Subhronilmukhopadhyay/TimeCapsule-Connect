// components/create-capsule/sidebar/Collaborators.jsx
import React from 'react';
import styles from './Collaborators.module.css';

const CollaboratorItem = ({ initials, name, status, color }) => {
  return (
    <div className={styles.collaborator}>
      <div 
        className={styles.collaboratorAvatar} 
        style={color ? { backgroundColor: color } : undefined}
      >
        {initials}
      </div>
      <div className={styles.collaboratorInfo}>
        <div className={styles.collaboratorName}>{name}</div>
        <div className={styles.collaboratorStatus}>{status}</div>
      </div>
    </div>
  );
};

const Collaborators = () => {
  const collaborators = [
    { initials: 'YS', name: 'You (Owner)', status: 'Editing now' },
    { initials: 'JD', name: 'John Doe', status: 'Viewing', color: '#FF5733' },
    { initials: 'EM', name: 'Emily Morgan', status: 'Idle', color: '#33A1FF' },
  ];

  return (
    <div className={styles.collaboratorsSection}>
      <div className={styles.collaboratorsTitle}>
        <h3>Collaborators</h3>
        <button className={styles.toolBtn} title="Collaborator Settings">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
      
      <div className={styles.collaboratorsList}>
        {collaborators.map((collaborator, index) => (
          <CollaboratorItem 
            key={index}
            initials={collaborator.initials}
            name={collaborator.name}
            status={collaborator.status}
            color={collaborator.color}
          />
        ))}
      </div>
      
      <button className={styles.addCollaboratorBtn}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="8.5" cy="7" r="4"></circle>
          <line x1="20" y1="8" x2="20" y2="14"></line>
          <line x1="23" y1="11" x2="17" y2="11"></line>
        </svg>
        Add collaborator
      </button>
    </div>
  );
};

export default Collaborators;