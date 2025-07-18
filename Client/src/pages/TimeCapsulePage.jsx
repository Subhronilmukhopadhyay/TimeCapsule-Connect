// pages/CreateCapsule.jsx
import React, { useState, useEffect } from 'react';
import { Slate } from 'slate-react';

import { EditorProvider, useEditor } from '../services/EditorContext';

// Capsule UI Components
import NavBar from '../components/Create-capsule/Navbar/Navbar';
import LeftSidebar from '../components/Create-capsule/SidebarLeft/SidebarLeft';
import ContentArea from '../components/Create-capsule/ContentArea/ContentArea';
import RightSidebar from '../components/Create-capsule/RightSidebar/RightSidebar';
import FloatingToolbar from '../components/Create-capsule/FloatingToolbar/FloatingToolbar';
import PreviewModal from '../components/Create-capsule/modals/PreviewModal';
import LockModal from '../components/Create-capsule/modals/LockModal';
import CollaborationPanel from '../components/Create-capsule/CollaborationPanel/CollaborationPanel';
import { getCurrentUser } from '../services/collabMode';
import styles from '../styles/Create-Capsule.module.css';

/**
 * Renders the main capsule creation UI.
 * Integrates the Slate editor, NavBar, toolbars, sidebars, and modals.
 *
 * @returns {JSX.Element} The capsule creation interface inside a Slate editor context.
 */
const CreateCapsuleContent = () => {
  // Destructure editor states and actions from context
  const {
    editor,
    value,
    setValue,
    capsuleTitle,
    setCapsuleTitle,
    capsuleId,
    isLoading,
    isSaving,
    isCollaborative,
    collaborationConnected,
    collaborators,
    toggleCollaboration
  } = useEditor();

  // UI state for various modals and panels
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  /** @returns {void} Opens the preview modal */
  const openPreviewModal = () => setShowPreviewModal(true);

  /** @returns {void} Closes the preview modal */
  const closePreviewModal = () => setShowPreviewModal(false);

  /** @returns {void} Opens the lock modal */
  const openLockModal = () => setShowLockModal(true);

  /** @returns {void} Closes the lock modal */
  const closeLockModal = () => setShowLockModal(false);

  /** @returns {void} Toggles the visibility of the collaboration panel */
  const toggleCollaborationPanel = () => setShowCollaborationPanel(!showCollaborationPanel);

  /**
   * Enables or disables collaboration and optionally opens the collaboration panel.
   * 
   * @param {boolean} enable - Whether to enable collaborative editing.
   * @returns {void}
   */
  const handleCollaborationToggle = (enable) => {
    toggleCollaboration(enable);
    if (enable) {
      setShowCollaborationPanel(true);
    }
  };

  // Show loading UI if capsule is still loading from backend
  if (isLoading && !isSaving) {
    return <div className={styles.loadingContainer || ''}>Loading capsule...</div>;
  }

  return (
    <Slate 
      editor={editor}
      initialValue={value}
      onChange={newValue => setValue(newValue)}
    >
      <div className={styles.createCapsulePage}>
        {/* Top navigation bar */}
        <NavBar
          capsuleId={capsuleId} 
          title={capsuleTitle}
          onTitleChange={(e) => setCapsuleTitle(e.target.value)}
          onPreview={openPreviewModal}
          onLock={openLockModal}
          onCollaboration={handleCollaborationToggle}
          isSaving={isSaving}
          isCollaborative={isCollaborative}
          collaborationConnected={collaborationConnected}
          collaborators={collaborators}
          onToggleCollaborationPanel={toggleCollaborationPanel}
        />

        {/* Main layout: left sidebar, content editor, right sidebar */}
        <div className={styles.mainContainer}>
          <LeftSidebar />
          <ContentArea />
          <RightSidebar />

          {/* Show real-time collaborators if panel is open */}
          {showCollaborationPanel && (
            <CollaborationPanel 
              collaborators={collaborators}
              isConnected={collaborationConnected}
              onClose={() => setShowCollaborationPanel(false)}
            />
          )}
        </div>

        {/* Floating formatting toolbar */}
        <FloatingToolbar />

        {/* Conditional modals */}
        {showPreviewModal && <PreviewModal onClose={closePreviewModal} />}
        {showLockModal && <LockModal onClose={closeLockModal} />}
      </div>
    </Slate>
  );
};

/**
 * Entry point component for the Create Capsule page.
 * Determines the capsule ID to load (from props, URL, or localStorage),
 * and wraps the editor in context via `EditorProvider`.
 *
 * @param {Object} props
 * @param {string} [props.capsuleId] - Capsule ID explicitly provided via props (optional).
 * @param {boolean} [props.collaborative=false] - Whether to start in collaborative mode.
 * @param {string} [props.websocketUrl='ws://localhost:1234'] - Yjs websocket server URL.
 *
 * @returns {JSX.Element} Fully initialized Slate-based capsule editor page.
 */
const CreateCapsule = ({ 
  capsuleId, 
  collaborative = false, 
  websocketUrl = 'ws://localhost:1234' 
}) => {
  // If it's the initial new capsule route, clear saved capsule ID
  const isNewCapsuleRoute = window.location.pathname === '/create-capsule';
  if (isNewCapsuleRoute) {
    localStorage.removeItem('currentCapsuleId');
  }

  const [idFromUrl, setIdFromUrl] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  /**
   * Effect to extract capsule ID from the URL path and set it locally.
   * Also removes query parameters from the URL.
   *
   * @returns {void}
   */
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const lastPathPart = pathParts[pathParts.length - 1];

    // Assume capsule IDs contain hyphens (e.g., KSUID format)
    if (lastPathPart && lastPathPart.includes('-')) {
      setIdFromUrl(lastPathPart);

      // Store the ID in localStorage if it's not passed directly
      if (!capsuleId) {
        localStorage.setItem('currentCapsuleId', lastPathPart);
      }
    }

    // Clean up any query strings in the URL
    const url = new URL(window.location.href);
    if (url.search) {
      url.search = '';
      window.history.replaceState({}, '', url);
    }
  }, [capsuleId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getCurrentUser(); // Expects { name: '...' }
        setCurrentUser({
          id: 'user-' + Date.now(), // Optional: generate temp id, or fetch actual user ID if returned
          name: data.name,
        });
      } catch (err) {
        console.error('Error fetching current user:', err);
      }
    };

    fetchUser();
  }, []);

  // Determine effective capsule ID to use in the session
  const effectiveId = capsuleId || idFromUrl || localStorage.getItem('currentCapsuleId');

  return (
    <EditorProvider 
      initialId={effectiveId}
      collaborative={collaborative}
      websocketUrl={websocketUrl}
      currentUser={currentUser}
    >
      <CreateCapsuleContent />
    </EditorProvider>
  );
};

export default CreateCapsule;