// context/EditorContext.js
import React, { createContext, useState, useMemo, useContext, useEffect } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

// Create a context for the editor
export const EditorContext = createContext();

export const EditorProvider = ({ children, initialId= null }) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withReact(withHistory(createEditor())), []);

  // Track the current capsule ID
  const [capsuleId, setCapsuleId] = useState(initialId);
  
  // Add the initial value when setting up our state.
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

  // Auto-save on value changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (capsuleId) {
        // We'd call an update API here
        console.log('Auto-saving capsule...', capsuleId);
        // updateCapsule(capsuleId, capsuleTitle, value);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timeoutId);
  }, [value, capsuleTitle, capsuleId]);

  // Load capsule if initialId is provided
  useEffect(() => {
    if (initialId) {
      // We'd load from API here
      // const capsule = loadCapsule(initialId);
      // if (capsule) {
      //   setCapsuleTitle(capsule.title);
      //   setValue(capsule.content);
      // }
    }
  }, [initialId]);
  
  const contextValue = {
    editor,
    value,
    setValue,
    capsuleTitle,
    setCapsuleTitle,
    capsuleId,
    setCapsuleId
  };
  
  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use the editor context
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};