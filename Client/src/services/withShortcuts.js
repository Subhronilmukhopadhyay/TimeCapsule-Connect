// services/withShortcuts.js
import { Editor, Element as SlateElement, Point, Range, Transforms } from 'slate';

/** Markdown-ish prefixes that convert the current block when you press space. */
const BLOCK_SHORTCUTS = {
  '*': 'list-item',
  '-': 'list-item',
  '+': 'list-item',
  '1.': 'list-item',
  '1)': 'list-item',
  '>': 'block-quote',
  '#': 'heading-one',
  '##': 'heading-two',
  '###': 'heading-three',
  '```': 'code-block',
};

const ORDERED_PREFIXES = ['1.', '1)'];

/**
 * `Editor.isBlock` alone is not a safe match: it answers true for text nodes
 * too, and `Transforms.setNodes` defaults to mode 'lowest', so the block type
 * would land on the text node instead of the block. Always pair it with an
 * element check.
 */
const isBlockElement = (editor) => (n) =>
  !Editor.isEditor(n) && SlateElement.isElement(n) && Editor.isBlock(editor, n);

/**
 * Autoformatting so the editor behaves like the notepads people already know:
 * type "# " for a heading, "- " for a bullet, "> " for a quote, and backspace
 * at the start of a converted block turns it back into a paragraph.
 */
export const withShortcuts = (editor) => {
  const { deleteBackward, insertText } = editor;

  editor.insertText = (text) => {
    const { selection } = editor;

    if (text.endsWith(' ') && selection && Range.isCollapsed(selection)) {
      const { anchor } = selection;
      const block = Editor.above(editor, { match: isBlockElement(editor) });

      const path = block ? block[1] : [];
      const start = Editor.start(editor, path);
      const range = { anchor, focus: start };
      const beforeText = Editor.string(editor, range) + text.slice(0, -1);
      const type = BLOCK_SHORTCUTS[beforeText];

      // Only convert a plain paragraph, so "# " inside a heading stays literal.
      if (type && block && block[0].type === 'paragraph') {
        // The retype and the wrap have to land as one change. Normalisation
        // between them would see a list-item sitting directly under the editor,
        // rule it an orphan, and turn it straight back into a paragraph — which
        // left the wrap with nothing to match and the bullet never appeared.
        Editor.withoutNormalizing(editor, () => {
          Transforms.select(editor, range);

          if (!Range.isCollapsed(range)) {
            Transforms.delete(editor);
          }

          Transforms.setNodes(editor, { type }, { match: isBlockElement(editor) });

          if (type === 'list-item') {
            const listType = ORDERED_PREFIXES.includes(beforeText)
              ? 'numbered-list'
              : 'bulleted-list';
            Transforms.wrapNodes(
              editor,
              { type: listType, children: [] },
              { match: (n) => SlateElement.isElement(n) && n.type === 'list-item' }
            );
          }
        });

        return;
      }
    }

    insertText(text);
  };

  editor.deleteBackward = (...args) => {
    const { selection } = editor;

    if (selection && Range.isCollapsed(selection)) {
      const block = Editor.above(editor, { match: isBlockElement(editor) });

      if (block) {
        const [node, path] = block;
        const start = Editor.start(editor, path);

        // Media is void; deleting into it is handled by withMedia instead.
        if (editor.isVoid(node)) {
          deleteBackward(...args);
          return;
        }

        if (
          node.type !== 'paragraph' &&
          node.type !== 'list-item' &&
          Point.equals(selection.anchor, start)
        ) {
          Transforms.setNodes(editor, { type: 'paragraph' }, { match: isBlockElement(editor) });
          return;
        }

        // Backspacing at the head of the first list item unwraps the list.
        if (node.type === 'list-item' && Point.equals(selection.anchor, start)) {
          Transforms.setNodes(editor, { type: 'paragraph' }, { match: isBlockElement(editor) });
          Transforms.unwrapNodes(editor, {
            match: (n) =>
              SlateElement.isElement(n) && ['bulleted-list', 'numbered-list'].includes(n.type),
            split: true,
          });
          return;
        }
      }
    }

    deleteBackward(...args);
  };

  return editor;
};
