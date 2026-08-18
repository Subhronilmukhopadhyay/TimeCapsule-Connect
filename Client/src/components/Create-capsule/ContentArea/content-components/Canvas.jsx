// components/create-capsule/CanvasWorkspace.jsx
import React, { useCallback, useMemo, useState } from 'react';
import isHotkey from 'is-hotkey';
import { Editable, useSlate, ReactEditor } from 'slate-react';
import { Editor, Element as SlateElement, Node, Range, Transforms } from 'slate';
import { useEditor } from '../../../../services/EditorContext';
import { toggleMark, toggleBlock } from '../../../../services/editor-utils';
import { insertMedia, mediaTypeForFile, insertLink } from '../../../../services/withMedia';
import styles from './CanvasWorkspace.module.css';
import MediaElement from './MediaElement';

const MARK_HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
  'mod+shift+x': 'strikethrough',
};

const BLOCK_HOTKEYS = {
  'mod+alt+1': 'heading-one',
  'mod+alt+2': 'heading-two',
  'mod+alt+3': 'heading-three',
  'mod+alt+0': 'paragraph',
  'mod+shift+8': 'bulleted-list',
  'mod+shift+7': 'numbered-list',
  'mod+shift+9': 'block-quote',
};

const MEDIA_TYPES = ['image', 'video', 'audio', 'file'];
const MAX_INLINE_BYTES = 2000 * 1024 * 1024; // matches the upload service ceiling

/** Blocks that should not continue themselves when you press Enter at the end. */
const SINGLE_LINE_BLOCKS = ['heading-one', 'heading-two', 'heading-three'];

/**
 * `Editor.isBlock` answers true for text nodes as well, and Transforms default
 * to mode 'lowest', so an unguarded match writes block properties onto the text
 * node. Always pair it with an element check.
 */
const isBlockElement = (editor) => (n) =>
  !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n);

const CanvasWorkspace = () => {
  const { editor } = useEditor();
  const [dropActive, setDropActive] = useState(false);

  const renderElement = useCallback((props) => {
    const { element } = props;
    const type = element.type;

    if (MEDIA_TYPES.includes(type)) {
      return <MediaElement {...props} mediaType={type} />;
    }

    // Alignment applies to every text block.
    const style = element.align ? { textAlign: element.align } : undefined;

    switch (type) {
      case 'heading-one':
        return <h1 {...props.attributes} style={style}>{props.children}</h1>;
      case 'heading-two':
        return <h2 {...props.attributes} style={style}>{props.children}</h2>;
      case 'heading-three':
        return <h3 {...props.attributes} style={style}>{props.children}</h3>;
      case 'bulleted-list':
        return <ul {...props.attributes} className={styles.list}>{props.children}</ul>;
      case 'numbered-list':
        return <ol {...props.attributes} className={styles.list}>{props.children}</ol>;
      case 'list-item':
        return <li {...props.attributes} style={style}>{props.children}</li>;
      case 'block-quote':
        return <blockquote {...props.attributes} className={styles.quote} style={style}>{props.children}</blockquote>;
      case 'code-block':
        return (
          <pre {...props.attributes} className={styles.codeBlock}>
            <code>{props.children}</code>
          </pre>
        );
      case 'divider':
        return (
          <div {...props.attributes}>
            <div contentEditable={false}><hr className={styles.divider} /></div>
            {props.children}
          </div>
        );
      case 'link':
        return (
          <a
            {...props.attributes}
            href={element.url}
            className={styles.link}
            title={element.url}
            // Ctrl/Cmd-click to follow, like every other editor.
            onClick={(event) => {
              if (event.metaKey || event.ctrlKey) {
                window.open(element.url, '_blank', 'noopener,noreferrer');
              }
            }}
          >
            {props.children}
          </a>
        );
      default:
        return <p {...props.attributes} style={style}>{props.children}</p>;
    }
  }, []);

  const renderLeaf = useCallback((props) => {
    let { attributes, children, leaf } = props;

    if (leaf.bold) children = <strong>{children}</strong>;
    if (leaf.italic) children = <em>{children}</em>;
    if (leaf.underline) children = <u>{children}</u>;
    if (leaf.strikethrough) children = <s>{children}</s>;
    if (leaf.code) children = <code className={styles.inlineCode}>{children}</code>;

    const style = {};
    if (leaf.fontFamily) style.fontFamily = leaf.fontFamily;
    if (leaf.fontSize) style.fontSize = leaf.fontSize;
    if (leaf.color) style.color = leaf.color;
    if (leaf.backgroundColor) style.backgroundColor = leaf.backgroundColor;
    if (leaf.highlight) style.backgroundColor = leaf.highlight;

    return <span {...attributes} style={style}>{children}</span>;
  }, []);

  /** Turns dropped or pasted files into media blocks. */
  const insertFiles = useCallback(
    (files) => {
      Array.from(files).forEach((file) => {
        if (file.size > MAX_INLINE_BYTES) {
          window.alert(`"${file.name}" is larger than the 2GB upload limit.`);
          return;
        }

        insertMedia(editor, {
          type: mediaTypeForFile(file),
          url: URL.createObjectURL(file),
          name: file.name,
          mime: file.type,
          size: file.size,
        });
      });
    },
    [editor]
  );

  const handleKeyDown = useCallback(
    (event) => {
      if (!editor) return;

      for (const hotkey in MARK_HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault();
          toggleMark(editor, MARK_HOTKEYS[hotkey]);
          return;
        }
      }

      for (const hotkey in BLOCK_HOTKEYS) {
        if (isHotkey(hotkey, event)) {
          event.preventDefault();
          toggleBlock(editor, BLOCK_HOTKEYS[hotkey]);
          return;
        }
      }

      // Handled explicitly rather than left to the browser's native undo, which
      // does not reach Slate reliably and did nothing at all in collaborative
      // mode. Works for both slate-history and the Yjs undo manager.
      if (isHotkey('mod+z', event)) {
        event.preventDefault();
        editor.undo?.();
        return;
      }

      if (isHotkey('mod+shift+z', event) || isHotkey('mod+y', event)) {
        event.preventDefault();
        editor.redo?.();
        return;
      }

      if (isHotkey('mod+k', event)) {
        event.preventDefault();
        const url = window.prompt('Link URL:');
        if (url) insertLink(editor, url);
        return;
      }

      // Shift+Enter inserts a line break instead of a new block.
      if (isHotkey('shift+enter', event)) {
        event.preventDefault();
        Editor.insertText(editor, '\n');
        return;
      }

      if (event.key === 'Enter') {
        const { selection } = editor;
        if (!selection || !Range.isCollapsed(selection)) return;

        const block = Editor.above(editor, { match: isBlockElement(editor) });
        if (!block) return;

        const [node, path] = block;

        // Enter on an empty list item leaves the list rather than adding a blank bullet.
        if (node.type === 'list-item' && Node.string(node) === '') {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' }, { match: isBlockElement(editor) });
          Transforms.unwrapNodes(editor, {
            match: (n) =>
              SlateElement.isElement(n) && ['bulleted-list', 'numbered-list'].includes(n.type),
            split: true,
          });
          return;
        }

        // Enter at the end of a heading starts a normal paragraph.
        if (
          SINGLE_LINE_BLOCKS.includes(node.type) &&
          Editor.isEnd(editor, selection.anchor, path)
        ) {
          event.preventDefault();
          Transforms.insertNodes(editor, { type: 'paragraph', children: [{ text: '' }] });
          return;
        }

        // Enter twice in a quote or code block exits it.
        if (
          ['block-quote', 'code-block'].includes(node.type) &&
          Node.string(node) === ''
        ) {
          event.preventDefault();
          Transforms.setNodes(editor, { type: 'paragraph' }, { match: isBlockElement(editor) });
          return;
        }
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        Editor.insertText(editor, '    ');
      }
    },
    [editor]
  );

  const handlePaste = useCallback(
    (event) => {
      const files = event.clipboardData?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        insertFiles(files);
        return;
      }

      // Pasting a bare URL over selected text turns it into a link.
      const text = event.clipboardData?.getData('text/plain');
      if (text && /^https?:\/\/\S+$/i.test(text.trim())) {
        const { selection } = editor;
        if (selection && !Range.isCollapsed(selection)) {
          event.preventDefault();
          insertLink(editor, text.trim());
        }
      }
    },
    [editor, insertFiles]
  );

  const handleDrop = useCallback(
    (event) => {
      setDropActive(false);
      const files = event.dataTransfer?.files;
      if (files && files.length > 0) {
        event.preventDefault();
        // Drop at the caret position under the pointer when we can find one.
        try {
          const range = ReactEditor.findEventRange(editor, event);
          if (range) Transforms.select(editor, range);
        } catch {
          // Fall back to inserting at the current selection.
        }
        insertFiles(files);
      }
    },
    [editor, insertFiles]
  );

  return (
    <div className={styles.canvasContainer}>
      <div
        className={`${styles.canvasSheet} ${dropActive ? styles.canvasSheetDropping : ''}`}
        onDragOver={(event) => {
          if (event.dataTransfer?.types?.includes('Files')) {
            event.preventDefault();
            setDropActive(true);
          }
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setDropActive(false);
        }}
        onDrop={handleDrop}
      >
        {/* Free-positioned media is absolutely placed against this wrapper, and
            react-rnd bounds drags to it. It lives outside <Editable> so the
            coordinate system does not depend on Slate forwarding DOM props. */}
        <div className={styles.sheetPage} data-capsule-sheet="true">
          <Editable
            className={styles.canvasWorkspace}
            renderElement={renderElement}
            renderLeaf={renderLeaf}
            placeholder="Start writing here..."
            spellCheck
            autoFocus
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
          />
        </div>
        {dropActive && <div className={styles.dropHint}>Drop files to add them to your capsule</div>}
      </div>
      <StatusBar />
    </div>
  );
};

/** Live word/character counts, the way a notepad status bar works. */
const StatusBar = () => {
  const editor = useSlate();
  const { isSaving, lastSaved } = useEditor();

  const { words, characters } = useMemo(() => {
    const text = editor.children.map((n) => Node.string(n)).join(' ');
    const trimmed = text.trim();
    return {
      words: trimmed ? trimmed.split(/\s+/).length : 0,
      characters: text.length,
    };
  }, [editor.children]);

  return (
    <div className={styles.statusBar}>
      <span>{words} {words === 1 ? 'word' : 'words'}</span>
      <span>{characters} characters</span>
      <span className={styles.statusSpacer} />
      <span>
        {isSaving
          ? 'Saving...'
          : lastSaved
            ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
            : 'Not saved yet'}
      </span>
    </div>
  );
};

export default CanvasWorkspace;
