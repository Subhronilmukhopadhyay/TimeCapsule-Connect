// components/create-capsule/Toolbar.jsx
import React, { useRef } from 'react';
import { useSlate } from 'slate-react';
import { Transforms } from 'slate';
import {
  toggleMark,
  toggleBlock,
  isMarkActive,
  isBlockActive,
  isAlignActive,
  toggleAlign,
  undo,
  redo,
} from '../../../../services/editor-utils';
import { insertMedia, insertLink, unwrapLink, isLinkActive, mediaTypeForFile } from '../../../../services/withMedia';
import styles from './Toolbar.module.css';

const ToolButton = ({ title, format, icon, children, type = 'mark', onClick, active }) => {
  const editor = useSlate();

  let isActive = active;
  if (isActive === undefined) {
    if (type === 'mark') isActive = isMarkActive(editor, format);
    else if (type === 'align') isActive = isAlignActive(editor, format);
    else if (type === 'link') isActive = isLinkActive(editor);
    else isActive = isBlockActive(editor, format);
  }

    const handleMouseDown = event => {
      event.preventDefault();
      if (onClick) {
        onClick(editor);
      } else if (type === 'mark') {
        toggleMark(editor, format);
      } else if (type === 'align') {
        toggleAlign(editor, format);
      } else {
        toggleBlock(editor, format);
      }
    };

  return (
    <button 
      className={`${styles.toolBtn} ${isActive ? styles.active : ''}`} 
      title={title}
      onMouseDown={handleMouseDown}
    >
      {icon ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icon}
        </svg>
      ) : children}
    </button>
  );
};

const Divider = () => <div className={styles.divider} />;

/** Opens a file picker and drops the chosen files in as media blocks. */
const MediaPickerButton = ({ title, accept, icon }) => {
  const editor = useSlate();
  const inputRef = useRef(null);

  const handleChange = (event) => {
    Array.from(event.target.files || []).forEach((file) => {
      insertMedia(editor, {
        type: mediaTypeForFile(file),
        url: URL.createObjectURL(file),
        name: file.name,
        mime: file.type,
        size: file.size,
      });
    });
    event.target.value = null;
  };

  return (
    <>
      <button
        type="button"
        className={styles.toolBtn}
        title={title}
        onMouseDown={(event) => {
          event.preventDefault();
          inputRef.current?.click();
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icon}
        </svg>
      </button>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={handleChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

const handleLink = (editor) => {
  if (isLinkActive(editor)) {
    unwrapLink(editor);
    return;
  }
  const url = window.prompt('Link URL:');
  if (url) insertLink(editor, url);
};

const insertDivider = (editor) => {
  Transforms.insertNodes(editor, { type: 'divider', children: [{ text: '' }] });
  Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
};

const Toolbar = () => {
  return (
    <div className={styles.toolbar}>
      <ToolButton 
        title="Undo" 
        icon={
          <>
            <path d="M9 14 4 9l5-5" />
            <path d="M4 9h14a4 4 0 0 1 0 8h-5" />
          </>
        }
        onClick={undo}
      />

      <ToolButton 
        title="Redo" 
        icon={
          <>
            <path d="m15 14 5-5-5-5" />
            <path d="M20 9H6a4 4 0 0 0 0 8h5" />
          </>
        }
        onClick={redo}
      />
      
      <Divider />
      
      <ToolButton title="Paragraph" format="paragraph" type="block">¶</ToolButton>
      <ToolButton title="Heading 1" format="heading-one" type="block">H1</ToolButton>
      <ToolButton title="Heading 2" format="heading-two" type="block">H2</ToolButton>
      <ToolButton title="Heading 3" format="heading-three" type="block">H3</ToolButton>

      <Divider />

      <ToolButton title="Bold" format="bold">
        <strong>B</strong>
      </ToolButton>
      <ToolButton title="Italic" format="italic">
        <em>I</em>
      </ToolButton>
      <ToolButton title="Underline" format="underline">
        <u>U</u>
      </ToolButton>
      <ToolButton title="Strikethrough" format="strikethrough">
        <s>S</s>
      </ToolButton>
      <ToolButton title="Inline code" format="code">
        <code>{'<>'}</code>
      </ToolButton>

      <Divider />

      <ToolButton title="Align left" format="left" type="align">⇤</ToolButton>
      <ToolButton title="Align center" format="center" type="align">⇔</ToolButton>
      <ToolButton title="Align right" format="right" type="align">⇥</ToolButton>

      <Divider />

      <ToolButton title="Bullet List" format="bulleted-list" type="block">•</ToolButton>
      <ToolButton title="Numbered List" format="numbered-list" type="block">1.</ToolButton>
      <ToolButton title="Block Quote" format="block-quote" type="block">❞</ToolButton>
      <ToolButton title="Code block" format="code-block" type="block">{'{ }'}</ToolButton>
      <ToolButton title="Divider" onClick={insertDivider}>―</ToolButton>

      <Divider />

      <ToolButton
        title="Insert Link (Ctrl+K)"
        type="link"
        onClick={handleLink}
        icon={
          <>
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
          </>
        }
      />
      <MediaPickerButton
        title="Insert Image"
        accept="image/*"
        icon={
          <>
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </>
        }
      />
      <MediaPickerButton
        title="Insert Video"
        accept="video/*"
        icon={
          <>
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </>
        }
      />
    </div>
  );
};

export default Toolbar;