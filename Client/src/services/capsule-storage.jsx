// utils/capsule-storage.js
export const saveCapsule = (title, content) => {
    const capsule = {
      id: generateId(),
      title,
      content,
      lastEdited: new Date().toISOString(),
      locked: false
    };
    console.log(capsule);
    // For now, store in localStorage. In production, this would be an API call
    const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
    capsules.push(capsule);
    localStorage.setItem('timeCapsules', JSON.stringify(capsules));
    
    return capsule.id;
  };
  
  export const loadCapsule = (id) => {
    const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
    return capsules.find(capsule => capsule.id === id);
  };
  
  export const lockCapsule = (id, lockSettings) => {
    const capsules = JSON.parse(localStorage.getItem('timeCapsules') || '[]');
    const index = capsules.findIndex(capsule => capsule.id === id);
    console.log(lockSettings);
    if (index !== -1) {
      capsules[index].locked = true;
      capsules[index].lockSettings = lockSettings;
      localStorage.setItem('timeCapsules', JSON.stringify(capsules));
    }
    
    return index !== -1;
  };
  
  // Helper function to generate a simple ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };