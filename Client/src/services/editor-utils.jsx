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

// Block formatting
export const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = ['numbered-list', 'bulleted-list'].includes(format);
  
  Transforms.unwrapNodes(editor, {
    match: n => 
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      ['numbered-list', 'bulleted-list'].includes(n.type),
    split: true,
  });
  
  const newProperties = {
    type: isActive ? 'paragraph' : isList ? 'list-item' : format,
  };
  
  Transforms.setNodes(editor, newProperties);
  
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

export const undo = (editor) => {
  editor.undo();
};

export const redo = (editor) => {
  editor.redo();
};