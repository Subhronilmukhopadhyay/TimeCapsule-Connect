// services/withMedia.js
import { Editor, Element as SlateElement, Node, Path, Transforms } from 'slate';

export const MEDIA_TYPES = ['image', 'video', 'audio', 'file'];

/** Blocks that only ever contain other blocks. */
export const LIST_TYPES = ['bulleted-list', 'numbered-list'];

export const isMediaNode = (node) =>
  SlateElement.isElement(node) && MEDIA_TYPES.includes(node.type);

export const createParagraph = (text = '') => ({
  type: 'paragraph',
  children: [{ text }],
});

/**
 * Teaches the editor about media and links.
 *
 * Media blocks used to be plain elements holding an empty text child. Slate
 * then treated them as editable text, which is what made the cursor snag on
 * images, deleting behave unpredictably, and typing next to media corrupt the
 * document. Declaring them void fixes all of that at the source, so the
 * hand-rolled Enter workarounds in the canvas are no longer needed.
 */
export const withMedia = (editor) => {
  const { isVoid, isInline, normalizeNode, insertBreak, deleteBackward } = editor;

  editor.isVoid = (element) => (MEDIA_TYPES.includes(element.type) ? true : isVoid(element));

  editor.isInline = (element) => (element.type === 'link' ? true : isInline(element));

  /**
   * Pressing Enter on a selected media block should start a fresh paragraph
   * under it rather than trying to split a void.
   */
  editor.insertBreak = () => {
    const { selection } = editor;

    if (selection) {
      const [entry] = Editor.nodes(editor, {
        match: (n) => isMediaNode(n),
      });

      if (entry) {
        const [, path] = entry;
        Transforms.insertNodes(editor, createParagraph(), { at: Path.next(path) });
        Transforms.select(editor, Editor.start(editor, Path.next(path)));
        return;
      }
    }

    insertBreak();
  };

  /**
   * Backspacing at the very start of a block sitting under media removes the
   * media instead of merging an empty paragraph into a void node.
   */
  editor.deleteBackward = (unit) => {
    const { selection } = editor;

    if (selection && selection.anchor.offset === 0) {
      const block = Editor.above(editor, {
        match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
      });

      if (block) {
        const [node, path] = block;
        const isEmpty = Node.string(node).length === 0;

        if (isEmpty && path[path.length - 1] > 0) {
          const previousPath = Path.previous(path);
          const [previous] = Editor.node(editor, previousPath);

          if (isMediaNode(previous)) {
            Transforms.removeNodes(editor, { at: previousPath });
            return;
          }
        }
      }
    }

    deleteBackward(unit);
  };

  editor.normalizeNode = (entry, options) => {
    const [node, path] = entry;

    // The document must never be empty, or there is nowhere to place the caret.
    if (Editor.isEditor(node) && node.children.length === 0) {
      Transforms.insertNodes(editor, createParagraph(), { at: [0] });
      return;
    }

    // A media block as the very first or very last node leaves the user with no
    // way to type above or below it. Guarantee a paragraph on either side.
    if (Editor.isEditor(node)) {
      const first = node.children[0];
      if (first && isMediaNode(first)) {
        Transforms.insertNodes(editor, createParagraph(), { at: [0] });
        return;
      }

      const lastIndex = node.children.length - 1;
      const last = node.children[lastIndex];
      if (last && isMediaNode(last)) {
        Transforms.insertNodes(editor, createParagraph(), { at: [lastIndex + 1] });
        return;
      }
    }

    // Lists may only contain list items.
    if (SlateElement.isElement(node) && LIST_TYPES.includes(node.type)) {
      for (const [child, childPath] of Node.children(editor, path)) {
        if (SlateElement.isElement(child) && child.type !== 'list-item') {
          Transforms.setNodes(editor, { type: 'list-item' }, { at: childPath });
          return;
        }
      }

      // An emptied-out list should disappear rather than linger as a stub.
      if (node.children.length === 0) {
        Transforms.removeNodes(editor, { at: path });
        return;
      }
    }

    // A list item that escaped its list becomes a paragraph again.
    if (SlateElement.isElement(node) && node.type === 'list-item') {
      const parent = Node.parent(editor, path);
      if (!SlateElement.isElement(parent) || !LIST_TYPES.includes(parent.type)) {
        Transforms.setNodes(editor, { type: 'paragraph' }, { at: path });
        return;
      }
    }

    // Links must always have visible text.
    if (SlateElement.isElement(node) && node.type === 'link' && Node.string(node) === '') {
      Transforms.removeNodes(editor, { at: path });
      return;
    }

    normalizeNode(entry, options);
  };

  return editor;
};

/**
 * Inserts a media block and leaves the caret in a paragraph below it.
 *
 * @param {import('slate').Editor} editor
 * @param {object} attrs - node fields (type, url, name, mime, size...)
 */
export const insertMedia = (editor, attrs) => {
  const node = {
    align: 'center',
    width: null, // percent of the writing column; null means natural size
    caption: '',
    ...attrs,
    children: [{ text: '' }],
  };

  Transforms.insertNodes(editor, node);
  // normalizeNode guarantees a trailing paragraph, so just move into it.
  Transforms.move(editor);
};

/** Wraps the current selection in a link, replacing any existing one. */
export const insertLink = (editor, url, text) => {
  if (!url) return;

  const { selection } = editor;
  const isCollapsed = selection && Editor.string(editor, selection) === '';

  unwrapLink(editor);

  const link = {
    type: 'link',
    url,
    children: isCollapsed ? [{ text: text || url }] : [],
  };

  if (isCollapsed) {
    Transforms.insertNodes(editor, link);
  } else {
    Transforms.wrapNodes(editor, link, { split: true });
    Transforms.collapse(editor, { edge: 'end' });
  }
};

export const unwrapLink = (editor) => {
  Transforms.unwrapNodes(editor, {
    match: (n) => SlateElement.isElement(n) && n.type === 'link',
  });
};

export const isLinkActive = (editor) => {
  const [link] = Editor.nodes(editor, {
    match: (n) => SlateElement.isElement(n) && n.type === 'link',
  });
  return !!link;
};

/**
 * Resolves a media node's stored width to CSS.
 *
 * Capsules saved before v1.2.0 stored width as raw CSS — either the string
 * 'auto' or a pixel number produced by the old resize handles. Current nodes
 * store a percentage of the writing column. Both have to keep rendering, since
 * a capsule may have been sealed years ago and cannot be migrated in place.
 *
 * A bare number of 100 or less is read as a percentage; anything larger could
 * only ever have been pixels.
 *
 * @returns {{width: string, isSized: boolean}}
 */
export const resolveMediaWidth = (width) => {
  if (width == null || width === 'auto' || width === '') {
    return { width: 'fit-content', isSized: false };
  }

  if (typeof width === 'number') {
    return width <= 100
      ? { width: `${width}%`, isSized: true }
      : { width: `${width}px`, isSized: true };
  }

  // Legacy CSS string such as '320px' or '50%'.
  return { width: String(width), isSized: true };
};

/** Maps a File to the media node type used by the editor. */
export const mediaTypeForFile = (file) => {
  const mime = file.type || '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  return 'file';
};
