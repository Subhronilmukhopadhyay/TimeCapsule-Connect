import React from 'react';
import { useSlate } from 'slate-react';
import { toggleMark, toggleBlock, isMarkActive, isBlockActive } from '../../../../services/editor-utils';
import styles from './TextFormatting.module.css';

const MarkButton = ({ format, label, children }) => {
  const editor = useSlate();
  const active = isMarkActive(editor, format);

  return (
    <button 
      className={`${styles.toolBtn} ${active ? styles.active : ''}`} 
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleMark(editor, format);
      }}
    >
      {children}
    </button>
  );
};

const BlockButton = ({ format, label, children }) => {
  const editor = useSlate();
  const active = isBlockActive(editor, format);

  return (
    <button 
      className={`${styles.toolBtn} ${active ? styles.active : ''}`} 
      title={label}
      onMouseDown={(e) => {
        e.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      {children}
    </button>
  );
};

const TextFormatting = () => {
  return (
    <div className={styles.toolSection}>
      <h3>Text Formatting</h3>

      <div className={styles.toolGroup}>
        <BlockButton format="paragraph" label="Normal Text">T</BlockButton>
        <BlockButton format="heading-one" label="Heading 1">H1</BlockButton>
        <BlockButton format="heading-two" label="Heading 2">H2</BlockButton>
        <BlockButton format="heading-three" label="Heading 3">H3</BlockButton>
      </div>

      <div className={styles.toolGroup}>
        <MarkButton format="bold" label="Bold"><strong>B</strong></MarkButton>
        <MarkButton format="italic" label="Italic"><em>I</em></MarkButton>
        <MarkButton format="underline" label="Underline"><u>U</u></MarkButton>
        <MarkButton format="strikethrough" label="Strikethrough"><s>S</s></MarkButton>
      </div>

      <div className={styles.toolGroup}>
        <BlockButton format="bulleted-list" label="Bullet List">•</BlockButton>
        <BlockButton format="numbered-list" label="Numbered List">1.</BlockButton>
        <BlockButton format="block-quote" label="Quote">❝</BlockButton>
        <BlockButton format="code" label="Code">&lt;/&gt;</BlockButton>
      </div>
    </div>
  );
};

export default TextFormatting;
