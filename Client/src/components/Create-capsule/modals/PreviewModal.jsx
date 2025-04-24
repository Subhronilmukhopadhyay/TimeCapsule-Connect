// components/create-capsule/modals/PreviewModal.jsx
import React, { useCallback } from 'react';
import { createEditor } from 'slate';
import { Slate, Editable, withReact } from 'slate-react';
import styles from './Modals.module.css';
import ReadOnlyMediaElement from './PreviewModal-Components/ReadOnlyMediaElement';

const PreviewModal = ({ onClose, content, title }) => {
   const editor = React.useMemo(() => withReact(createEditor()), []);
  const renderElement = useCallback(props => {
    const type = props.element.type;
    
    switch (type) {
      case 'image':
      case 'video':
      case 'audio':
      case 'file':
        return <ReadOnlyMediaElement {...props} mediaType={type} />;
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

  return (
    <div className={`${styles.modalOverlay} ${styles.previewModal}`}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Preview TimeCapsule</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>
        
        <div className={styles.previewContent}>
          <div className={styles.previewDocument}>
            <h1>{title}</h1>
            <Slate
              editor={editor}
              initialValue={content}
              onChange={() => {}}
            >
              <Editable
                readOnly
                renderElement={renderElement}
                renderLeaf={renderLeaf}
              />
            </Slate>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.primaryBtn} onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;