import React, { createContext, useState, useMemo, useContext, useEffect, useCallback, useRef } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { saveCapsule, autoSaveCapsule, loadCapsule } from './capsule-storage';

// Default initial value for the editor
const INITIAL_EDITOR_VALUE = [
  {
    type: 'heading-one',
    children: [{ text: 'My TimeCapsule' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'Start writing your memories, thoughts, and messages here...' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'You can add text, images, videos, and more to your time capsule.' }],
  },
  {
    type: 'paragraph',
    children: [{ text: 'This content will be locked until the date or location you specify.' }],
  },
];

export const EditorContext = createContext();

export const EditorProvider = ({ children, initialId = null }) => {
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);

  const [capsuleId, setCapsuleId] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [value, setValue] = useState(INITIAL_EDITOR_VALUE);
  const [capsuleTitle, setCapsuleTitle] = useState('Untitled Capsule');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Handle saving capsule
  const createOrUpdateCapsule = useCallback(async (forceSave = false) => {
    if ((forceSave || isModified) && !isSaving) {
      try {
        setIsSaving(true);
        setIsLoading(true);
        const newCapsuleId = await saveCapsule(capsuleTitle, value, capsuleId);
        
        if (newCapsuleId) {
          setCapsuleId(newCapsuleId);
          setIsModified(false);
          setLastSaved(new Date());
          localStorage.setItem('currentCapsuleId', newCapsuleId);
        }
        return newCapsuleId;
      } catch (err) {
        setError(err?.response?.data?.message || 'Error saving capsule');
        console.error('Error saving capsule:', err);
        return null;
      } finally {
        setIsLoading(false);
        setIsSaving(false);
      }
    }
    return capsuleId;
  }, [isModified, capsuleId, capsuleTitle, value, isSaving]);

  function getDriveThumbnailUrl(url) {
    const match = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600` : url;
  }

  // Load capsule on initial render if ID is provided
  useEffect(() => {
    const loadInitialCapsule = async () => {
      if (initialId) {
        try {
          setIsLoading(true);
          const data = await loadCapsule(initialId);
          // console.log(data);
          if (data) {
            setCapsuleTitle(data.title || 'Untitled Capsule');
            const withImageUrlsFixed = data.content.map(item => {
              if (item.type === 'image') {
                return { ...item, url: getDriveThumbnailUrl(item.url) };
              }
              return item;
            });
            setValue(withImageUrlsFixed || INITIAL_EDITOR_VALUE);
            setCapsuleId(initialId);
            setLastSaved(new Date());
          }
        } catch (err) {
          console.error('Error loading capsule:', err);
          setError(err?.response?.data?.message || 'Error loading capsule');
          localStorage.removeItem('currentCapsuleId');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    if (initialId) {
      loadInitialCapsule();
    }
  }, [initialId]);

  // Create capsule when user starts editing and no ID exists
  // Using a separate effect with a different dependency array from the auto-save effect
  const initialCreationTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Only trigger for initial creation when no ID exists yet
    if (isModified && !capsuleId && !isSaving) {
      // Clear any existing timeout
      if (initialCreationTimeoutRef.current) {
        clearTimeout(initialCreationTimeoutRef.current);
      }
      
      // Set a short timeout to avoid creating multiple capsules during rapid edits
      initialCreationTimeoutRef.current = setTimeout(() => {
        createOrUpdateCapsule(true);
      }, 500);
    }
    
    return () => {
      if (initialCreationTimeoutRef.current) {
        clearTimeout(initialCreationTimeoutRef.current);
      }
    };
  }, [isModified, capsuleId, isSaving, createOrUpdateCapsule]);

  // Auto-save existing capsule
  const autoSaveTimeoutRef = useRef(null);
  
  useEffect(() => {
    // Only auto-save when we already have a capsule ID
    if (!isModified || !capsuleId || isSaving) return;

    // Clear any existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        await autoSaveCapsule(capsuleId, capsuleTitle, value);
        setLastSaved(new Date());
        setIsModified(false);
      } catch (err) {
        console.error('Error auto-saving capsule:', err);
      } finally {
        setIsSaving(false);
      }
    }, 2000);

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [value, capsuleTitle, capsuleId, isModified, isSaving]);

  // Set up window unload event handler to warn user if unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isModified) {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModified]);

  // Handle value changes
  const handleValueChange = useCallback((newValue) => {
    setValue(newValue);
    setIsModified(true);
  }, []);

  // Handle title changes
  const handleTitleChange = useCallback((newTitle) => {
    setCapsuleTitle(newTitle);
    setIsModified(true);
  }, []);

  // Force save function that can be called manually
  const forceSave = useCallback(() => {
    return createOrUpdateCapsule(true);
  }, [createOrUpdateCapsule]);

  const contextValue = {
    editor,
    value,
    setValue: handleValueChange,
    capsuleTitle,
    setCapsuleTitle: handleTitleChange,
    capsuleId,
    setCapsuleId,
    isModified,
    isLoading,
    isSaving,
    error,
    lastSaved,
    forceSave,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};