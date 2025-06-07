// services/EditorContext.jsx
import React, { createContext, useState, useMemo, useContext, useEffect, useCallback, useRef } from 'react';
import { createEditor, Editor, Transforms } from 'slate';
import { withReact } from 'slate-react';
import { withHistory } from 'slate-history';
import { withYjs, YjsEditor } from '@slate-yjs/core';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';
import { saveCapsule, autoSaveCapsule, loadCapsule } from './capsule-storage';

// Default initial content of the editor when no capsule is loaded or created
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

// Create a React context to share editor state globally
export const EditorContext = createContext();

/**
 * EditorProvider component that wraps app parts needing access to the editor state
 * @param {Object} props
 * @param {React.ReactNode} props.children - child components that consume the editor context
 * @param {string|null} [props.initialId=null] - Optional initial capsule ID to load an existing capsule
 * @param {boolean} [props.collaborative=false] - Enable collaborative editing mode
 * @param {string} [props.websocketUrl='ws://localhost:1234'] - WebSocket server URL for collaboration
 * @returns {JSX.Element}
 */
export const EditorProvider = ({ 
  children, 
  initialId = null, 
  collaborative = false,
  websocketUrl = 'ws://localhost:1234'
}) => {
  // Collaboration state
  const [isCollaborative, setIsCollaborative] = useState(collaborative);
  const [collaborationConnected, setCollaborationConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  
  // Y.js refs for collaboration
  const yDocRef = useRef(null);
  const sharedTypeRef = useRef(null);
  const providerRef = useRef(null);

  // Create a Slate editor instance enhanced with React, History, and optionally Yjs
  const editor = useMemo(() => {
    let editorInstance;
    
    if (isCollaborative && sharedTypeRef.current) {
      // Create collaborative editor with Yjs
      editorInstance = withReact(withYjs(createEditor(), sharedTypeRef.current));
      
      // Custom normalization to ensure empty editor has initial content
      const { normalizeNode } = editorInstance;
      editorInstance.normalizeNode = (entry, options) => {
        const [node] = entry;
        if (!Editor.isEditor(node) || node.children.length > 0) {
          return normalizeNode(entry, options);
        }
        Transforms.insertNodes(editorInstance, INITIAL_EDITOR_VALUE, { at: [0] });
      };
    } else {
      // Create standard editor with history
      editorInstance = withReact(withHistory(createEditor()));
    }
    
    return editorInstance;
  }, [isCollaborative, sharedTypeRef.current]);

  // State variables for capsule and editor state
  const [capsuleId, setCapsuleId] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModified, setIsModified] = useState(false);
  const [value, setValue] = useState(INITIAL_EDITOR_VALUE);
  const [capsuleTitle, setCapsuleTitle] = useState('Untitled Capsule');
  const [lastSaved, setLastSaved] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  /**
   * Initialize collaboration setup
   */
  const initializeCollaboration = useCallback((roomId) => {
    if (providerRef.current) return; // Already initialized

    try {
      const yDoc = new Y.Doc();
      const sharedDoc = yDoc.get('slate', Y.XmlText);
      const room = roomId || capsuleId || 'default-room';
      const yProvider = new WebsocketProvider(websocketUrl, room, yDoc);

      // Save to refs
      yDocRef.current = yDoc;
      sharedTypeRef.current = sharedDoc;
      providerRef.current = yProvider;

      // Connection events
      yProvider.on('sync', (isSynced) => {
        setCollaborationConnected(isSynced);
        console.log('Collaboration sync:', isSynced);
      });

      yProvider.on('status', (event) => {
        console.log('Collaboration status:', event.status);
        setCollaborationConnected(event.status === 'connected');
      });

      yProvider.on('connection-close', (event) => {
        console.error('Collaboration connection closed:', event);
        setCollaborationConnected(false);
      });

      yProvider.on('connection-error', (event) => {
        console.error('Collaboration connection error:', event);
        setCollaborationConnected(false);
        setError('Collaboration connection failed');
      });

      // Awareness (cursors, user presence)
      const awareness = yProvider.awareness;
      awareness.on('change', () => {
        const states = Array.from(awareness.getStates().values());
        setCollaborators(states.filter(state => state.user));
      });

      // Set current user info
      awareness.setLocalStateField('user', {
        name: 'User ' + Math.floor(Math.random() * 1000),
        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
        timestamp: Date.now()
      });

      console.log('Collaboration initialized for room:', room);
    } catch (err) {
      console.error('Failed to initialize collaboration:', err);
      setError('Failed to start collaborative editing');
    }
  }, [capsuleId, websocketUrl]);

  /**
   * Cleanup collaboration
   */
  const cleanupCollaboration = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      yDocRef.current = null;
    }
    sharedTypeRef.current = null;
    setCollaborationConnected(false);
    setCollaborators([]);
  }, []);

  /**
   * Toggle collaboration mode
   */
  const toggleCollaboration = useCallback((enable = true, roomId = null) => {
    if (enable && !isCollaborative) {
      setIsCollaborative(true);
      initializeCollaboration(roomId);
    } else if (!enable && isCollaborative) {
      setIsCollaborative(false);
      cleanupCollaboration();
    }
  }, [isCollaborative, initializeCollaboration, cleanupCollaboration]);

  /**
   * Connect/disconnect Yjs editor
   */
  useEffect(() => {
    if (isCollaborative && editor && sharedTypeRef.current) {
      YjsEditor.connect(editor);
      return () => {
        try {
          YjsEditor.disconnect(editor);
        } catch (err) {
          console.warn('Error disconnecting YjsEditor:', err);
        }
      };
    }
  }, [editor, isCollaborative]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      cleanupCollaboration();
    };
  }, [cleanupCollaboration]);

  /**
   * Save or update the capsule content and title.
   * Creates a new capsule if no ID exists.
   */
  const createOrUpdateCapsule = useCallback(async (forceSave = false) => {
    if ((forceSave || isModified) && !isSaving) {
      try {
        setIsSaving(true);
        setIsLoading(true);
        
        // Get current editor content (works for both collaborative and non-collaborative)
        const currentValue = isCollaborative ? editor.children : value;
        
        const newCapsuleId = await saveCapsule(capsuleTitle, currentValue, capsuleId);

        if (newCapsuleId) {
          setCapsuleId(newCapsuleId);
          setIsModified(false);
          setLastSaved(new Date());
          localStorage.setItem('currentCapsuleId', newCapsuleId);
          
          // If switching to collaborative mode and we have a new capsule ID
          if (isCollaborative && !collaborationConnected) {
            initializeCollaboration(newCapsuleId);
          }
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
  }, [isModified, capsuleId, capsuleTitle, value, isSaving, isCollaborative, editor, collaborationConnected, initializeCollaboration]);

  /**
   * Extract a Google Drive thumbnail URL from a full Google Drive URL.
   */
  function getDriveThumbnailUrl(url) {
    const match = url.match(/\/d\/([^/]+)/) || url.match(/id=([^&]+)/);
    return match ? `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600` : url;
  }

  /**
   * Load capsule content by ID on initial mount or when ID changes.
   */
  useEffect(() => {
    const loadInitialCapsule = async () => {
      if (initialId) {
        try {
          setIsLoading(true);
          const data = await loadCapsule(initialId);

          if (data) {
            setCapsuleTitle(data.title || 'Untitled Capsule');

            const withImageUrlsFixed = data.content.map(item => {
              if (item.type === 'image') {
                return { ...item, url: getDriveThumbnailUrl(item.url) };
              }
              return item;
            });

            // Only set value for non-collaborative mode
            // Collaborative mode will sync content through Yjs
            if (!isCollaborative) {
              setValue(withImageUrlsFixed || INITIAL_EDITOR_VALUE);
            }
            
            setCapsuleId(initialId);
            setLastSaved(new Date());
            
            // Initialize collaboration with the loaded capsule ID
            if (isCollaborative) {
              initializeCollaboration(initialId);
            }
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
  }, [initialId, isCollaborative, initializeCollaboration]);

  // Refs for debouncing
  const initialCreationTimeoutRef = useRef(null);
  const autoSaveTimeoutRef = useRef(null);

  /**
   * Effect to create a new capsule if user modifies content but no capsule ID exists yet.
   */
  useEffect(() => {
    if (isModified && !capsuleId && !isSaving) {
      if (initialCreationTimeoutRef.current) {
        clearTimeout(initialCreationTimeoutRef.current);
      }

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

  /**
   * Effect to auto-save the capsule 2 seconds after the user stops editing.
   */
  useEffect(() => {
    if (!isModified || !capsuleId || isSaving) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSaving(true);
        
        // Get current content from appropriate source
        const currentValue = isCollaborative ? editor.children : value;
        
        await autoSaveCapsule(capsuleId, capsuleTitle, currentValue);
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
  }, [value, capsuleTitle, capsuleId, isModified, isSaving, isCollaborative, editor]);

  /**
   * Warn user about unsaved changes
   */
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

  /**
   * Handler for when the editor value changes.
   */
  const handleValueChange = useCallback((newValue) => {
    // In collaborative mode, changes are handled by Yjs
    if (!isCollaborative) {
      setValue(newValue);
    }
    setIsModified(true);
  }, [isCollaborative]);

  /**
   * Handler for when the capsule title changes.
   */
  const handleTitleChange = useCallback((newTitle) => {
    setCapsuleTitle(newTitle);
    setIsModified(true);
  }, []);

  /**
   * Manually force a save of the capsule.
   */
  const forceSave = useCallback(() => {
    return createOrUpdateCapsule(true);
  }, [createOrUpdateCapsule]);

  // Show loading state while collaboration is connecting
  if (isCollaborative && !collaborationConnected && !error) {
    return <div className="loading-container">Connecting to collaboration server...</div>;
  }

  // The context object value that consumers will use
  const contextValue = {
    editor,
    value: isCollaborative ? editor?.children || INITIAL_EDITOR_VALUE : value,
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
    // Collaboration-specific
    isCollaborative,
    collaborationConnected,
    collaborators,
    toggleCollaboration,
  };

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

/**
 * Hook to access editor context.
 */
export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};