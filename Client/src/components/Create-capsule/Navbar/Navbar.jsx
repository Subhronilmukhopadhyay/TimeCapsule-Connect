// components/create-capsule/Navbar/NavBar.jsx
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import styles from './Navbar.module.css';

const Navbar = ({ 
  title, 
  onTitleChange, 
  onPreview, 
  onLock, 
  onCollaboration,
  isSaving,
  isCollaborative,
  collaborationConnected,
  collaborators = [],
  onToggleCollaborationPanel
}) => {
  const [showCollaborationMenu, setShowCollaborationMenu] = useState(false);

  const handleCollaborationClick = () => {
    if (isCollaborative) {
      onToggleCollaborationPanel();
    } else {
      setShowCollaborationMenu(!showCollaborationMenu);
    }
  };

  const enableCollaboration = () => {
    onCollaboration(true);
    setShowCollaborationMenu(false);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link to="/" className={styles.logo}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          TimeCapsule
        </Link>

        <div className={styles.capsuleTitle}>
          <input 
            type="text" 
            id="capsule-name" 
            placeholder="Untitled Capsule" 
            className={styles.capsuleName}
            value={title}
            onChange={onTitleChange}
          />
          {isSaving && (
            <span className={styles.savingIndicator}>Saving...</span>
          )}
        </div>
      </div>
    
      <div className={styles.navRight}>
        <div className={styles.capsuleActions}>
          {/* Collaboration Button */}
          <div className={styles.collaborationContainer}>
            <button
              className={`${styles.collaborationButton} ${
                isCollaborative ? styles.active : ''
              }`}
              onClick={handleCollaborationClick}
              title={isCollaborative ? 'View collaborators' : 'Enable collaboration'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 18v-1c0-2.66 5.33-4 8-4s8 1.34 8 4v1H4zM12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/>
              </svg>
              {isCollaborative && (
                <>
                  <span className={styles.collaboratorCount}>{collaborators.length}</span>
                  <span className={`${styles.connectionStatus} ${
                    collaborationConnected ? styles.connected : styles.disconnected
                  }`}></span>
                </>
              )}
            </button>

            {/* Collaboration Menu */}
            {showCollaborationMenu && !isCollaborative && (
              <div className={styles.collaborationMenu}>
                <div className={styles.menuHeader}>
                  <h4>Real-time Collaboration</h4>
                </div>
                <p className={styles.menuDescription}>
                  Enable real-time collaborative editing. Others can join using a shared link.
                </p>
                <div className={styles.menuActions}>
                  <button 
                    className={styles.enableButton}
                    onClick={enableCollaboration}
                  >
                    Enable Collaboration
                  </button>
                  <button 
                    className={styles.cancelButton}
                    onClick={() => setShowCollaborationMenu(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <button 
            className={`${styles.capsuleBtn} ${styles.previewBtn}`} 
            onClick={onPreview}
            title="Preview capsule"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            Preview
          </button>
          
          <button 
            className={`${styles.capsuleBtn} ${styles.lockBtn}`} 
            onClick={onLock}
            title="Lock capsule"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            Lock Capsule
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;