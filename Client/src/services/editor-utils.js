// services/editor-utils.js
import { Editor, Transforms, Element as SlateElement } from 'slate';

// Text formatting
export const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);
  
  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

export const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];

/** Media blocks are void; block formatting must never rewrite them. */
const isFormattableBlock = (editor) => (n) =>
  !Editor.isEditor(n) && SlateElement.isElement(n) && !editor.isVoid(n);

// Block formatting
export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      LIST_TYPES.includes(n.type),
    split: true,
  });

  const newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };

  Transforms.setNodes(editor, newProperties, { match: isFormattableBlock(editor) });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

export const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.type === format,
  });

  return !!match;
};

// Text alignment, stored as an `align` prop on the block.
export const toggleAlign = (editor, alignment) => {
  const isActive = isAlignActive(editor, alignment);
  Transforms.setNodes(
    editor,
    { align: isActive ? undefined : alignment },
    { match: isFormattableBlock(editor) }
  );
};

export const isAlignActive = (editor, alignment) => {
  const [match] = Editor.nodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      n.align === alignment,
  });

  return !!match;
};

export const undo = (editor) => {
  editor.undo();
};

export const redo = (editor) => {
  editor.redo();
};