import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { saveCapsule, autoSaveCapsule, loadCapsule } from './capsule-storage';

export const EditorContext = createContext();

export const EditorProvider = ({ children, initialId = null }) => {
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);

  const [capsuleId, setCapsuleId] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);

  const [value, setValue] = useState([
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
  ]);

  const [capsuleTitle, setCapsuleTitle] = useState('Untitled Capsule');

  const createCapsule = useCallback(async () => {
    if (!capsuleId || isModified) {
      try {
        setIsLoading(true);
        const newCapsuleId = await saveCapsule(capsuleTitle, value, capsuleId);
        setCapsuleId(newCapsuleId);
        return newCapsuleId;
      } catch (err) {
        setError(err?.response?.data?.message || 'Error saving capsule');
        console.error('Error saving capsule:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    }
    return capsuleId;
  }, [isModified, capsuleId, capsuleTitle, value]);

  useEffect(() => {
    if (isModified && !capsuleId) {
      createCapsule();
    }
  }, [isModified, capsuleId, createCapsule]);

  useEffect(() => {
    if (!isModified || !capsuleId) return;

    const timeoutId = setTimeout(async () => {
      try {
        await autoSaveCapsule(capsuleId, capsuleTitle, value);
      } catch (err) {
        console.error('Error auto-saving capsule:', err);
      }
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [value, capsuleTitle, capsuleId, isModified]);

  useEffect(() => {
    const loadInitialCapsule = async () => {
      if (initialId) {
        try {
          setIsLoading(true);
          const data = await loadCapsule(initialId);
          setCapsuleTitle(data.title);
          setValue(data.content);
        } catch (err) {
          setError(err?.response?.data?.message || 'Error loading capsule');
          console.error('Error loading capsule:', err);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadInitialCapsule();
  }, [initialId]);

  const handleValueChange = useCallback((newValue) => {
    setValue(newValue);
    if (!isModified) {
      setIsModified(true);
    }
  }, [isModified]);

  const handleTitleChange = useCallback((newTitle) => {
    setCapsuleTitle(newTitle);
    setIsModified(true);
  }, []);

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
    error,
    createCapsule,
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