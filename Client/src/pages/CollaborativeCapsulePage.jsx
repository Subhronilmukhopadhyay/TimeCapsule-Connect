// src/pages/CollaborativeCapsulePage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import CreateCapsule from './TimeCapsulePage';
import { fetchCollabMode } from '../services/collabMode';

const CollaborativeCapsulePage = () => {
  const { id } = useParams();
  const [isCollabMode, setIsCollabMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getMode = async () => {
      try {
        const mode = await fetchCollabMode(id);
        setIsCollabMode(mode);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    getMode();
  }, [id]);

  if (loading) return <div>Loading capsule...</div>;

  return (
    <CreateCapsule
      capsuleId={id}
      collaborative={isCollabMode}
      websocketUrl="ws://localhost:1234"
      onSetCollaborative={setIsCollabMode}
    />
  );
};

export default CollaborativeCapsulePage;
