// pages/CreateCapsule.jsx
import React, { useState, useEffect } from 'react';
import { Slate } from 'slate-react';

import { EditorProvider, useEditor } from '../services/EditorContext';

import NavBar from '../components/Create-capsule/Navbar/NavBar';
import LeftSidebar from '../components/Create-capsule/SidebarLeft/SidebarLeft';
import ContentArea from '../components/Create-capsule/ContentArea/ContentArea';
import RightSidebar from '../components/Create-capsule/RightSidebar/RightSidebar';
import FloatingToolbar from '../components/Create-capsule/FloatingToolbar/FloatingToolbar';
import PreviewModal from '../components/Create-capsule/modals/PreviewModal';
import LockModal from '../components/Create-capsule/modals/LockModal';
import CollaborationPanel from '../components/Create-capsule/CollaborationPanel/CollaborationPanel';
import styles from '../styles/Create-Capsule.module.css';

const CreateCapsuleContent = () => {
  const { 
    editor, 
    value, 
    setValue, 
    capsuleTitle, 
    setCapsuleTitle,
    isLoading,
    isSaving,
    isCollaborative,
    collaborationConnected,
    collaborators,
    toggleCollaboration
  } = useEditor();
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showLockModal, setShowLockModal] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  const openPreviewModal = () => setShowPreviewModal(true);
  const closePreviewModal = () => setShowPreviewModal(false);
  
  const openLockModal = () => setShowLockModal(true);
  const closeLockModal = () => setShowLockModal(false);

  const toggleCollaborationPanel = () => setShowCollaborationPanel(!showCollaborationPanel);

  const handleCollaborationToggle = (enable) => {
    toggleCollaboration(enable);
    if (enable) {
      setShowCollaborationPanel(true);
    }
  };

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
        <NavBar 
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
        
        <div className={styles.mainContainer}>
          <LeftSidebar />
          <ContentArea />
          <RightSidebar />
          {showCollaborationPanel && (
            <CollaborationPanel 
              collaborators={collaborators}
              isConnected={collaborationConnected}
              onClose={() => setShowCollaborationPanel(false)}
            />
          )}
        </div>

        <FloatingToolbar />
        
        {showPreviewModal && (
          <PreviewModal onClose={closePreviewModal} />
        )}
        
        {showLockModal && (
          <LockModal onClose={closeLockModal} />
        )}
      </div>
    </Slate>
  );
};

const CreateCapsule = ({ 
  capsuleId, 
  collaborative = false, 
  websocketUrl = 'ws://localhost:1234' 
}) => {
  const isNewCapsuleRoute = window.location.pathname === '/create-capsule';
  if (isNewCapsuleRoute) {
    localStorage.removeItem('currentCapsuleId');
  }

  // Identify capsule ID from URL or props
  const [idFromUrl, setIdFromUrl] = useState(null);
  
  useEffect(() => {
    // Extract ID from URL path, assuming format: /create-capsule/[id]
    const pathParts = window.location.pathname.split('/');
    const lastPathPart = pathParts[pathParts.length - 1];
    
    // Check if the last path part looks like a capsule ID
    if (lastPathPart && lastPathPart.includes('-')) {
      setIdFromUrl(lastPathPart);
      // Store in localStorage but don't overwrite if there's a direct prop
      if (!capsuleId) {
        localStorage.setItem('currentCapsuleId', lastPathPart);
      }
    }
    
    // Clean up any query parameters
    const url = new URL(window.location.href);
    if (url.search) {
      url.search = '';
      window.history.replaceState({}, '', url);
    }
  }, [capsuleId]);

  // Prioritize direct props over URL path over localStorage
  const effectiveId = capsuleId || idFromUrl || localStorage.getItem('currentCapsuleId');
  
  return (
    <EditorProvider 
      initialId={effectiveId}
      collaborative={collaborative}
      websocketUrl={websocketUrl}
    >
      <CreateCapsuleContent />
    </EditorProvider>
  );
};

export default CreateCapsule;