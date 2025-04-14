import React from 'react';
import NavBar from '../components/Create-capsule/Navbar/NavBar';
import LeftSidebar from '../components/Create-capsule/SidebarLeft/SidebarLeft';
import ContentArea from '../components/Create-capsule/ContentArea/ContentArea';
import RightSidebar from '../components/Create-capsule/RightSidebar/RightSidebar';
import FloatingToolbar from '../components/Create-capsule/FloatingToolbar/FloatingToolbar';
import PreviewModal from '../components/Create-capsule/modals/PreviewModal';
import LockModal from '../components/Create-capsule/modals/LockModal';
import styles from '../styles/Create-Capsule.module.css';


const CreateCapsule = () => {
  const [showPreviewModal, setShowPreviewModal] = React.useState(false);
  const [showLockModal, setShowLockModal] = React.useState(false);
  
  const openPreviewModal = () => setShowPreviewModal(true);
  const closePreviewModal = () => setShowPreviewModal(false);
  
  const openLockModal = () => setShowLockModal(true);
  const closeLockModal = () => setShowLockModal(false);

  return (
    <div className={styles.createCapsulePage}>
      <NavBar 
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
        <PreviewModal onClose={closePreviewModal} />
      )}
      
      {showLockModal && (
        <LockModal onClose={closeLockModal} />
      )}
    </div>
  );
};

export default CreateCapsule;