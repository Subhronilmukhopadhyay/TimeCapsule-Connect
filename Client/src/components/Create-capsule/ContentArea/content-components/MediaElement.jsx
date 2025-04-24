import React, { useContext, useState, useRef } from 'react';
import { useSelected, useFocused } from 'slate-react';
import { Editor, Transforms } from 'slate';
import { EditorContext } from '../../../../services/EditorContext'; // Use EditorContext here
import styles from './CanvasWorkspace.module.css';

const MediaElement = ({ attributes, children, element, mediaType }) => {
  const selected = useSelected();
  const focused = useFocused();
  const { editor } = useContext(EditorContext); // Use the correct context
  const isResizing = useRef(false);

  const [size, setSize] = useState({
    width: element.width || 'auto',
    height: element.height || 'auto'
  });

  const [position, setPosition] = useState({
    align: element.align || 'center'
  });

  const getPath = () => {
    try {
      return Editor.path(editor, element);
    } catch {
      return [];
    }
  };

  const updateSize = (width, height) => {
    const path = getPath();
    Transforms.setNodes(editor, { width, height }, { at: path });
    setSize({ width, height });
  };

  const updatePosition = (align) => {
    const path = getPath();
    Transforms.setNodes(editor, { align }, { at: path });
    setPosition({ align });
  };

  const handleResize =(direction) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    isResizing.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = e.target.parentElement.offsetWidth;
    const startHeight = e.target.parentElement.offsetHeight;

    const handleMouseMove = (moveEvent) => {
      if (!isResizing.current) return;
      
      let deltaX = moveEvent.clientX - startX;
      let deltaY = moveEvent.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;

      if (['right', 'top-right', 'bottom-right'].includes(direction)) {
        newWidth = startWidth + deltaX;
      }
      if (['left', 'top-left', 'bottom-left'].includes(direction)) {
        newWidth = startWidth - deltaX;
      }
      if (['bottom', 'bottom-left', 'bottom-right'].includes(direction)) {
        newHeight = startHeight + deltaY;
      }
      if (['top', 'top-left', 'top-right'].includes(direction)) {
        newHeight = startHeight - deltaY;
      }

      updateSize(Math.max(50, newWidth), Math.max(50, newHeight));
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const commonStyle = {
    display: 'block',
    width: size.width,
    height: size.height,
    margin: position.align === 'center' ? '0 auto' :
            position.align === 'left' ? '0 auto 0 0' : '0 0 0 auto',
    boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
  };

  const renderMedia = () => {
    switch (mediaType) {
      case 'image':
        return <img src={element.url} alt={element.name || 'image'} style={commonStyle} />;
      case 'video':
        return <video controls src={element.url} style={commonStyle} />;
      case 'audio':
        return <audio controls src={element.url} style={commonStyle} />;
      case 'file':
        return (
          <div style={{ ...commonStyle, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
            <a href={element.url} download={element.name || 'file'}>{element.name || 'Download File'}</a>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div {...attributes} className="media-element-wrapper">
      <div
        contentEditable={false}
        style={{ position: 'relative', marginBottom: 8 }}
        className="media-content"
      >
        {renderMedia()}
        {selected && focused && (
          <>
            {/* Resize Handle */}
            <div className={styles.resizeHandle + ' ' + styles.topLeft} onMouseDown={handleResize('top-left')} />
            <div className={styles.resizeHandle + ' ' + styles.top} onMouseDown={handleResize('top')} />
            <div className={styles.resizeHandle + ' ' + styles.topRight} onMouseDown={handleResize('top-right')} />
            <div className={styles.resizeHandle + ' ' + styles.right} onMouseDown={handleResize('right')} />
            <div className={styles.resizeHandle + ' ' + styles.bottomRight} onMouseDown={handleResize('bottom-right')} />
            <div className={styles.resizeHandle + ' ' + styles.bottom} onMouseDown={handleResize('bottom')} />
            <div className={styles.resizeHandle + ' ' + styles.bottomLeft} onMouseDown={handleResize('bottom-left')} />
            <div className={styles.resizeHandle + ' ' + styles.left} onMouseDown={handleResize('left')} />

            <div className={styles.imageControls}>
              <button onClick={() => updatePosition('left')}>Left</button>
              <button onClick={() => updatePosition('center')}>Center</button>
              <button onClick={() => updatePosition('right')}>Right</button>
              <button onClick={() => updateSize('auto', 'auto')}>Reset</button>
            </div>
          </>
        )}
      </div>
      {/* This is where we place the children which contains the cursor */}
      <span className="media-spacer" style={{ userSelect: 'none' }}>
        {children}
      </span>
    </div>
  );
};

export default MediaElement;
