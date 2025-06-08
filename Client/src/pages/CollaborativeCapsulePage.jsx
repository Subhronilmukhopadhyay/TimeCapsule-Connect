// src/pages/CollaborativeCapsulePage.jsx
import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import CreateCapsule from './TimeCapsulePage'; // Adjust if CreateCapsule is in a different location

const CollaborativeCapsulePage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [isCollabMode, setIsCollabMode] = useState(false);
  
  return (
    <CreateCapsule
      capsuleId={id}
      collaborative={isCollabMode}
      websocketUrl="ws://localhost:1234" // use wss:// in production
      onSetCollaborative={setIsCollabMode}
    />
  );
};

export default CollaborativeCapsulePage;