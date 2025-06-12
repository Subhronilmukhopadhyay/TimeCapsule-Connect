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

// Utility to get user status based on activity
const getUserStatus = (lastActivity, isEditing) => {
  if (isEditing) return 'Editing now';
  
  const now = Date.now();
  const timeDiff = now - lastActivity;
  
  if (timeDiff < 30000) return 'Viewing'; // Active in last 30 seconds
  if (timeDiff < 300000) return 'Idle'; // Active in last 5 minutes
  return 'Away';
};

// Create a React context to share editor state globally
export const EditorContext = createContext();

/**
 * EditorProvider component that wraps app parts needing access to the editor state
 */
export const EditorProvider = ({ 
  children, 
  initialId = null, 
  collaborative = false,
  websocketUrl = 'ws://localhost:1234',
  currentUser = null // Pass current user from backend
}) => {
  // Collaboration state
  const [isCollaborative, setIsCollaborative] = useState(collaborative);
  const [collaborationConnected, setCollaborationConnected] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [activities, setActivities] = useState([]);
  const [cursors, setCursors] = useState(new Map());
  
  // Y.js refs for collaboration
  const yDocRef = useRef(null);
  const sharedTypeRef = useRef(null);
  const providerRef = useRef(null);
  const awarenessRef = useRef(null);
  
  // Activity tracking
  const lastActivityRef = useRef(Date.now());
  const isEditingRef = useRef(false);
  const activityTimeoutRef = useRef(null);
  
  // Store previous collaborators to track changes
  const previousCollaboratorsRef = useRef([]);

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
   * Add activity to the feed
   */
  const addActivity = useCallback((user, action, timestamp = Date.now()) => {
    setActivities(prev => {
      const newActivity = {
        id: Date.now() + Math.random(),
        time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        user: user.name,
        action,
        timestamp
      };
      
      // Keep only the last 50 activities
      const updated = [newActivity, ...prev].slice(0, 50);
      return updated;
    });
  }, []);

  /**
   * Update user activity status
   */
  const updateUserActivity = useCallback((isEditing = false) => {
    lastActivityRef.current = Date.now();
    isEditingRef.current = isEditing;
    
    if (awarenessRef.current && currentUser) {
      awarenessRef.current.setLocalStateField('user', {
        ...currentUser,
        status: getUserStatus(lastActivityRef.current, isEditing),
        lastActivity: lastActivityRef.current,
        isEditing,
        timestamp: Date.now()
      });
    }
    
    // Clear existing timeout
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    // Set timeout to update status to "Idle" after inactivity
    activityTimeoutRef.current = setTimeout(() => {
      isEditingRef.current = false;
      if (awarenessRef.current && currentUser) {
        awarenessRef.current.setLocalStateField('user', {
          ...currentUser,
          status: getUserStatus(lastActivityRef.current, false),
          lastActivity: lastActivityRef.current,
          isEditing: false,
          timestamp: Date.now()
        });
      }
    }, 30000); // 30 seconds of inactivity
  }, [currentUser]);

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
      awarenessRef.current = yProvider.awareness;

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
        const validCollaborators = states.filter(state => state.user);
        
        setCollaborators(validCollaborators);
        
        // Update cursors for live cursor display
        const cursorMap = new Map();
        validCollaborators.forEach((state, index) => {
          if (state.cursor && state.user) {
            cursorMap.set(state.user.id || index, {
              ...state.cursor,
              user: state.user
            });
          }
        });
        setCursors(cursorMap);
        
        // Track user join/leave activities using ref to avoid dependency issues
        const currentUserIds = new Set(validCollaborators.map(c => c.user.id));
        const previousUserIds = new Set(previousCollaboratorsRef.current.map(c => c.user.id));
        
        // Check for new users
        validCollaborators.forEach(collaborator => {
          if (!previousUserIds.has(collaborator.user.id) && collaborator.user.id !== currentUser?.id) {
            addActivity(collaborator.user, 'joined the capsule');
          }
        });
        
        // Check for users who left
        previousCollaboratorsRef.current.forEach(collaborator => {
          if (!currentUserIds.has(collaborator.user.id) && collaborator.user.id !== currentUser?.id) {
            addActivity(collaborator.user, 'left the capsule');
          }
        });
        
        // Update the ref with current collaborators
        previousCollaboratorsRef.current = validCollaborators;
      });

      // Set current user info
      if (currentUser) {
        awareness.setLocalStateField('user', {
          ...currentUser,
          status: 'Viewing',
          lastActivity: Date.now(),
          isEditing: false,
          timestamp: Date.now()
        });
        
        addActivity(currentUser, 'joined the capsule');
      }

      console.log('Collaboration initialized for room:', room);
    } catch (err) {
      console.error('Failed to initialize collaboration:', err);
      setError('Failed to start collaborative editing');
    }
  }, [capsuleId, websocketUrl, currentUser, addActivity]); // Removed collaborators dependency

  /**
   * Update cursor position for live cursors
   */
  const updateCursorPosition = useCallback((selection) => {
    if (awarenessRef.current && currentUser && selection) {
      awarenessRef.current.setLocalStateField('cursor', {
        anchor: selection.anchor,
        focus: selection.focus,
        timestamp: Date.now()
      });
    }
  }, [currentUser]);

  /**
   * Cleanup collaboration
   */
  const cleanupCollaboration = useCallback(() => {
    if (activityTimeoutRef.current) {
      clearTimeout(activityTimeoutRef.current);
    }
    
    if (currentUser) {
      addActivity(currentUser, 'left the capsule');
    }
    
    if (providerRef.current) {
      providerRef.current.destroy();
      providerRef.current = null;
    }
    if (yDocRef.current) {
      yDocRef.current.destroy();
      yDocRef.current = null;
    }
    sharedTypeRef.current = null;
    awarenessRef.current = null;
    previousCollaboratorsRef.current = [];
    setCollaborationConnected(false);
    setCollaborators([]);
    setCursors(new Map());
  }, [currentUser, addActivity]);

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
          
          // Add save activity
          if (currentUser) {
            addActivity(currentUser, 'saved the capsule');
          }
          
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
  }, [isModified, capsuleId, capsuleTitle, value, isSaving, isCollaborative, editor, collaborationConnected, initializeCollaboration, currentUser, addActivity]);

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
            
            // Add activity for opening capsule
            if (currentUser) {
              addActivity(currentUser, 'opened the capsule');
            }
            
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
  }, [initialId, isCollaborative, initializeCollaboration, currentUser, addActivity]);

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
    
    // Update user activity as editing
    updateUserActivity(true);
  }, [isCollaborative, updateUserActivity]);

  /**
   * Handler for when the capsule title changes.
   */
  const handleTitleChange = useCallback((newTitle) => {
    setCapsuleTitle(newTitle);
    setIsModified(true);
    
    // Add activity for title change
    if (currentUser) {
      addActivity(currentUser, 'changed the title');
    }
    
    // Update user activity
    updateUserActivity(true);
  }, [currentUser, addActivity, updateUserActivity]);

  /**
   * Handler for selection change (for live cursors)
   */
  const handleSelectionChange = useCallback((selection) => {
    updateCursorPosition(selection);
    updateUserActivity(false); // Just viewing/navigating
  }, [updateCursorPosition, updateUserActivity]);

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
    activities,
    cursors,
    toggleCollaboration,
    updateUserActivity,
    addActivity,
    handleSelectionChange,
    currentUser,
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