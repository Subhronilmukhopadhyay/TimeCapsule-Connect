// components/create-capsule/sidebar/Collaborators.jsx
import React, { useState } from 'react';
import { useEditor } from '../../../../services/EditorContext';
import styles from './Collaborators.module.css';

/** "Subhronil Mukhopadhyay" -> "SM". Avatars were blank without this. */
const initialsFor = (name) => {
  if (!name) return '?';
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const AVATAR_COLORS = ['#4a6ef5', '#e2622f', '#0d8fc4', '#1f9d5f', '#8b5cf6', '#d3468d'];

/** Stable per-person colour, so someone keeps the same one across sessions. */
const colorFor = (id) => {
  const key = String(id ?? '');
  let hash = 0;
  for (let i = 0; i < key.length; i += 1) hash = (hash * 31 + key.charCodeAt(i)) % 997;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

const statusClass = (status) => String(status || 'viewing').toLowerCase().replace(/\s+/g, '');

const CollaboratorItem = ({ initials, name, status, color, isOwner, isCurrentUser }) => {
  const displayName = isCurrentUser ? `${name} (You)` : isOwner ? `${name} (Owner)` : name;

  return (
    <div className={styles.collaborator}>
      <div className={styles.collaboratorAvatar} style={color ? { backgroundColor: color } : undefined}>
        {initials}
      </div>
      <div className={styles.collaboratorInfo}>
        <div className={styles.collaboratorName}>{displayName}</div>
        <div className={`${styles.collaboratorStatus} ${styles[statusClass(status)]}`}>
          {status || 'Viewing'}
        </div>
      </div>
      <div className={`${styles.statusIndicator} ${styles[statusClass(status)]}`}></div>
    </div>
  );
};

const Collaborators = () => {
  const {
    collaborators,
    currentUser,
    capsuleId,
    isCollaborative,
    collaborationConnected,
    toggleCollaboration,
  } = useEditor();

  const [showSettings, setShowSettings] = useState(false);
  const [notice, setNotice] = useState('');

  // Opening this link in another browser joins the same capsule session.
  const shareLink = capsuleId ? `${window.location.origin}/create-capsule/${capsuleId}` : '';

  const flash = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(''), 2500);
  };

  /**
   * There is no server-side invite endpoint yet, so this shares the join link,
   * which is what actually lets someone else into the session today.
   */
  const handleAddCollaborator = async () => {
    if (!shareLink) {
      flash('Save the capsule first to get a link.');
      return;
    }

    try {
      await navigator.clipboard.writeText(shareLink);
      flash('Invite link copied to clipboard');
    } catch {
      // Clipboard is blocked outside a secure context or without permission.
      window.prompt('Copy this invite link:', shareLink);
    }
  };

  return (
    <div className={styles.collaboratorsSection}>
      <div className={styles.collaboratorsTitle}>
        <h3>Collaborators</h3>
        <button
          type="button"
          className={styles.toolBtn}
          title="Collaboration settings"
          aria-expanded={showSettings}
          onClick={() => setShowSettings((open) => !open)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>

      {showSettings && (
        <div className={styles.settingsPanel}>
          <div className={styles.settingsRow}>
            <span>Live collaboration</span>
            <strong>
              {!isCollaborative ? 'Off' : collaborationConnected ? 'Connected' : 'Connecting…'}
            </strong>
          </div>
          <button
            type="button"
            className={styles.settingsAction}
            onClick={() => toggleCollaboration(!isCollaborative)}
          >
            {isCollaborative ? 'Stop collaborating' : 'Start collaborating'}
          </button>
          {shareLink && <div className={styles.shareLink}>{shareLink}</div>}
        </div>
      )}

      <div className={styles.collaboratorsList}>
        {collaborators.length === 0 && (
          <p className={styles.emptyState}>
            {isCollaborative ? 'Waiting for others to join…' : 'Collaboration is off.'}
          </p>
        )}

        {collaborators.map((collaborator, index) => {
          const user = collaborator.user || {};
          const id = user.id ?? index;
          return (
            <CollaboratorItem
              key={id}
              initials={user.initials || initialsFor(user.name)}
              name={user.name || 'Unknown user'}
              status={user.status}
              color={user.color || colorFor(id)}
              isOwner={user.role === 'owner'}
              isCurrentUser={String(id) === String(currentUser?.id)}
            />
          );
        })}
      </div>

      {notice && <div className={styles.notice}>{notice}</div>}

      <button type="button" className={styles.addCollaboratorBtn} onClick={handleAddCollaborator}>
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
