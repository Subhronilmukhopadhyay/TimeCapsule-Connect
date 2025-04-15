// components/create-capsule/CanvasWorkspace.jsx
import React, { useCallback, useState } from 'react';
import isHotkey from 'is-hotkey';
import { Editable } from 'slate-react';
import { Transforms, Editor } from 'slate';
import { useEditor } from '../../../../services/EditorContext';
import styles from './CanvasWorkspace.module.css';
import MediaElement from './MediaElement';

// Define hotkeys
const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

// Define a helper to create a default paragraph element
const createParagraphNode = () => ({
  type: 'paragraph',
  children: [{ text: '' }]
});

const CanvasWorkspace = () => {
  const { editor, value, setValue } = useEditor(); // Use custom hook to access context

  const renderElement = useCallback(props => {
    const type = props.element.type;
    
    switch (type) {
      case 'image':
      case 'video':
      case 'audio':
      case 'file':
        return <MediaElement {...props} mediaType={type} />;
      case 'heading-one':
        return <h1 {...props.attributes}>{props.children}</h1>;
      case 'heading-two':
        return <h2 {...props.attributes}>{props.children}</h2>;
      case 'heading-three':
        return <h3 {...props.attributes}>{props.children}</h3>;
      case 'bulleted-list':
        return <ul {...props.attributes}>{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes}>{props.children}</ol>;
      case 'list-item':
        return <li {...props.attributes}>{props.children}</li>;
      case 'block-quote':
        return <blockquote {...props.attributes}>{props.children}</blockquote>;
      default:
        return <p {...props.attributes}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback(props => {
    let { attributes, children, leaf } = props;
    
    if (leaf.bold) {
      children = <strong>{children}</strong>;
    }
    
    if (leaf.italic) {
      children = <em>{children}</em>;
    }
    
    if (leaf.underline) {
      children = <u>{children}</u>;
    }
    
    if (leaf.strikethrough) {
      children = <s>{children}</s>;
    }
    
    if (leaf.code) {
      children = <code>{children}</code>;
    }

    // Add font styling
    const style = {};
    
    if (leaf.fontFamily) {
      style.fontFamily = leaf.fontFamily;
    }
    
    if (leaf.fontSize) {
      style.fontSize = leaf.fontSize;
    }
    
    if (leaf.color) {
      style.color = leaf.color;
    }
    
    if (leaf.backgroundColor) {
      style.backgroundColor = leaf.backgroundColor;
    }
    
    return <span {...attributes} style={style}>{children}</span>;
  }, []);

  const handleKeyDown = useCallback(
    event => {
      if (!editor) return;

      // 🔥 Handle formatting hotkeys
      for (const hotkey in HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault();
          const mark = HOTKEYS[hotkey];
          toggleMark(editor, mark);
          return;
        }
      }
      
      // Handle Enter key
      if (event.key === 'Enter') {
        const { selection } = editor;
        
        if (selection) {
          const [node, path] = Editor.node(editor, selection);
          
          // Find the closest block element to the cursor
          const [block, blockPath] = Editor.above(editor, {
            match: n => Editor.isBlock(editor, n),
          }) || [];
          
          // Check if the block is a media element or its parent is
          if (block && ['image', 'video', 'audio', 'file'].includes(block.type)) {
            event.preventDefault();
            
            // Insert a new paragraph after the media block
            Transforms.insertNodes(
              editor,
              createParagraphNode(),
              { at: [blockPath[0] + 1] }
            );
            
            // Move the cursor to the new paragraph
            Transforms.select(editor, [blockPath[0] + 1, 0]);
            return;
          }
          
          // Also check if we're inside a wrapper that contains a media element
          const nodeEntry = Editor.parent(editor, path);
          if (nodeEntry) {
            const [parentNode, parentPath] = nodeEntry;
            
            if (parentNode && ['image', 'video', 'audio', 'file'].includes(parentNode.type)) {
              event.preventDefault();
              
              // Insert a new paragraph after the media block
              Transforms.insertNodes(
                editor,
                createParagraphNode(),
                { at: [parentPath[0] + 1] }
              );
              
              // Move the cursor to the new paragraph
              Transforms.select(editor, [parentPath[0] + 1, 0]);
              return;
            }
          }
        }
      }
    },
    [editor]
  );

  return (
    <div className={styles.canvasContainer}>
      <Editable
        className={styles.canvasWorkspace}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Start writing here..."
        spellCheck
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default CanvasWorkspace;
