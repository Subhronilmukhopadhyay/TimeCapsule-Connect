// context/EditorContext.js
import React, { createContext, useState, useMemo, useContext } from 'react';
import { createEditor } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';

// Create a context for the editor
export const EditorContext = createContext();

export const EditorProvider = ({ children }) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  
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
  
  const contextValue = {
    editor,
    value,
    setValue,
    capsuleTitle,
    setCapsuleTitle
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