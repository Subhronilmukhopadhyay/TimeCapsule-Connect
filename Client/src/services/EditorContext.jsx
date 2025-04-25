// context/EditorContext.js
import React, { createContext, useState, useMemo, useContext, useEffect, useCallback } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import api from './api';
import DOMPurify from 'dompurify';

// Create a context for the editor
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

  const sanitizeContent = (content) => {
    return content.map(item => ({
      ...item,
      children: item.children.map(child => ({
        ...child,
        text: DOMPurify.sanitize(child.text),
      })),
    }));
  };

  const createCapsule = useCallback(async () => {
    if (isModified && !capsuleId) {
      try {
        setIsLoading(true);
        const sanitizedTitle = DOMPurify.sanitize(capsuleTitle);
        const sanitizedContent = sanitizeContent(value);
        // console.log(sanitizedContent);
        const { data } = await api.post(`/create/capsule`, {
          title: sanitizedTitle,
          content: sanitizedContent,
        });

        const newCapsuleId = data.id;
        setCapsuleId(newCapsuleId);

        window.history.pushState(
          { capsuleId: newCapsuleId },
          '',
          `/create-capsule/${newCapsuleId}`
        );

        return newCapsuleId;
      } catch (err) {
        setError(err?.response?.data?.message || 'Error creating new capsule');
        console.error('Error creating new capsule:', err);
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
        const sanitizedTitle = DOMPurify.sanitize(capsuleTitle);
        const sanitizedContent = sanitizeContent(value);

        await api.patch(`/create/capsule/${capsuleId}`, {
          title: sanitizedTitle,
          content: sanitizedContent,
        });

        console.log('Auto-saved capsule:', capsuleId);
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
          const { data } = await api.get(`/capsules/${initialId}`);
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