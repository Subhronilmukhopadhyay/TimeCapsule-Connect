// pages/create-capsule.jsx
import React from 'react';
import NavBar from '../components/Create-capsule/Navbar/NavBar';
import LeftSidebar from '../components/Create-capsule/SidebarLeft/SidebarLeft';
import ContentArea from '../components/Create-capsule/ContentArea/ContentArea';
import RightSidebar from '../components/Create-capsule/RightSidebar/RightSidebar';
import FloatingToolbar from '../components/Create-capsule/FloatingToolbar/FloatingToolbar';
import PreviewModal from '../components/Create-capsule/modals/PreviewModal';
import LockModal from '../components/Create-capsule/modals/LockModal';
import { EditorProvider, useEditor } from '../context/EditorContext';
import styles from '../styles/Create-Capsule.module.css';

const CreateCapsuleContent = () => {
  const { value, capsuleTitle, setCapsuleTitle } = useEditor();
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [showLockModal, setShowLockModal] = React.useState(false);
  
  const openPreviewModal = () => setShowPreviewModal(true);
  const closePreviewModal = () => setShowPreviewModal(false);
  
  const openLockModal = () => setShowLockModal(true);
  const closeLockModal = () => setShowLockModal(false);

  return (
    <div className={styles.createCapsulePage}>
      <NavBar 
        title={capsuleTitle}
        onTitleChange={(e) => setCapsuleTitle(e.target.value)}
        onPreview={openPreviewModal} 
        onLock={openLockModal} 
      />
      
      <div className={styles.mainContainer}>
        <LeftSidebar />
        <ContentArea />
        <RightSidebar />
      </div>

      <FloatingToolbar />
      
      {showPreviewModal && (
        <PreviewModal 
          onClose={closePreviewModal} 
          content={value} // Pass the current editor content
          title={capsuleTitle}
        />
      )}
      
      {showLockModal && (
        <LockModal 
          onClose={closeLockModal} 
          content={value}
          title={capsuleTitle}
        />
      )}
    </div>
  );
};

const CreateCapsule = () => {
  return (
    <EditorProvider>
      <CreateCapsuleContent />
    </EditorProvider>
  );
};

export default CreateCapsule;