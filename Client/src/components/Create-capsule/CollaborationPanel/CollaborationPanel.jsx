// components/Create-capsule/CollaborationPanel/CollaborationPanel.jsx
import React from 'react';
import styles from './CollaborationPanel.module.css';

/**
 * Displays the real-time collaboration panel for active collaborators.
 *
 * @param {Object} props
 * @param {Array<{ name: string, color: string, timestamp: number }>} props.collaborators - List of active collaborators.
 * @param {boolean} props.isConnected - WebSocket/Yjs connection status.
 * @param {Function} props.onClose - Function to close the panel.
 *
 * @returns {JSX.Element} The rendered collaboration panel UI.
 */
const CollaborationPanel = ({ collaborators, isConnected, onClose }) => {
  return (
    <div className={styles.collaborationPanel}>
      
      {/* Panel Header with Close Button */}
      <div className={styles.header}>
        <h3>Collaboration</h3>
        <button className={styles.closeButton} onClick={onClose}>
          ×
        </button>
      </div>

      {/* Real-time connection status indicator */}
      <div className={styles.status}>
        <div className={`${styles.indicator} ${isConnected ? styles.connected : styles.disconnected}`}>
          <span className={styles.dot}></span>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* List of collaborators */}
      <div className={styles.collaboratorsList}>
        <h4>Active Collaborators ({collaborators.length})</h4>
        
        {collaborators.length === 0 ? (
          <p className={styles.noCollaborators}>No other collaborators online</p>
        ) : (
          <ul className={styles.collaborators}>
            {collaborators.map((collaborator, index) => (
              <li key={index} className={styles.collaborator}>
                
                {/* Avatar with color and first initial */}
                <div 
                  className={styles.avatar} 
                  style={{ backgroundColor: collaborator.color }}
                >
                  {collaborator.name.charAt(0).toUpperCase()}
                </div>
                
                {/* Name and timestamp */}
                <div className={styles.info}>
                  <span className={styles.name}>{collaborator.name}</span>
                  <span className={styles.timestamp}>
                    {new Date(collaborator.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Share section with URL and copy button */}
      <div className={styles.shareSection}>
        <h4>Share this capsule</h4>
        <div className={styles.shareUrl}>
          <input 
            type="text" 
            value={window.location.href}
            readOnly
            className={styles.urlInput}
          />
          <button 
            className={styles.copyButton}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              // Optional: Add toast/tooltip notification for UX
            }}
          >
            Copy
          </button>
        </div>
        <p className={styles.shareNote}>
          Share this URL with others to collaborate in real-time
        </p>
      </div>
    </div>
  );
};

export default CollaborationPanel;