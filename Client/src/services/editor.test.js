/**
 * Behaviour tests for the capsule editor plugins.
 *
 * Run with:  npm run test  (from Client/)
 *
 * These drive the Slate editor directly — no React, no DOM — which is enough
 * to cover the things that used to go wrong: the caret getting stuck on media,
 * typing next to an image corrupting the document, and there being no way to
 * write above or below a picture.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createEditor, Editor, Node, Transforms } from 'slate';
import { withHistory } from 'slate-history';
import {
  withMedia,
  insertMedia,
  insertLink,
  isLinkActive,
  resolveMediaWidth,
} from './withMedia.js';
import { withShortcuts } from './withShortcuts.js';
import { toggleBlock, toggleAlign, isBlockActive } from './editor-utils.js';

const makeEditor = (children) => {
  const editor = withShortcuts(withMedia(withHistory(createEditor())));
  editor.children = children;
  editor.selection = null;
  Editor.normalize(editor, { force: true });
  return editor;
};

const para = (text = '') => ({ type: 'paragraph', children: [{ text }] });
const image = (props = {}) => ({
  type: 'image',
  url: 'blob:fake',
  name: 'photo.jpg',
  align: 'center',
  width: null,
  caption: '',
  children: [{ text: '' }],
  ...props,
});

const types = (editor) => editor.children.map((n) => n.type);

/* ------------------------------------------------------------------ */
/* Media behaves as a void block                                       */
/* ------------------------------------------------------------------ */

test('media blocks are void, so the caret cannot fall inside them', () => {
  const editor = makeEditor([para('hi'), image(), para('')]);

  assert.equal(editor.isVoid(image()), true);
  assert.equal(editor.isVoid(para()), false);
});

test('links are inline', () => {
  const editor = makeEditor([para('hi')]);
  assert.equal(editor.isInline({ type: 'link', url: '#', children: [{ text: 'x' }] }), true);
});

test('an image at the end always gets a paragraph after it to type into', () => {
  const editor = makeEditor([para('hi'), image()]);

  assert.deepEqual(types(editor), ['paragraph', 'image', 'paragraph']);
});

test('an image at the very start always gets a paragraph above it', () => {
  const editor = makeEditor([image(), para('hi')]);

  assert.deepEqual(types(editor), ['paragraph', 'image', 'paragraph']);
});

test('the document is never left empty', () => {
  const editor = makeEditor([]);

  assert.deepEqual(types(editor), ['paragraph']);
});

test('Enter on a selected image starts a new paragraph below it', () => {
  const editor = makeEditor([para('above'), image(), para('below')]);

  // Select the image itself.
  Transforms.select(editor, [1]);
  editor.insertBreak();

  assert.deepEqual(types(editor), ['paragraph', 'image', 'paragraph', 'paragraph']);
  // Caret should be in the new, empty paragraph directly under the image.
  assert.equal(editor.selection.anchor.path[0], 2);
  assert.equal(Node.string(editor.children[2]), '');
});

test('typing after inserting media lands in a paragraph, not inside the media', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  insertMedia(editor, { type: 'image', url: 'blob:x', name: 'a.png' });
  Editor.insertText(editor, 'caption text');

  const mediaIndex = editor.children.findIndex((n) => n.type === 'image');
  assert.ok(mediaIndex >= 0, 'image was inserted');
  // The typed text must live in a paragraph, never in the void image node.
  assert.equal(Node.string(editor.children[mediaIndex]), '');
  const full = editor.children.map((n) => Node.string(n)).join('');
  assert.ok(full.includes('caption text'));
});

test('backspace at the start of an empty block under media deletes the media', () => {
  const editor = makeEditor([para('above'), image(), para('')]);

  Transforms.select(editor, Editor.start(editor, [2]));
  editor.deleteBackward('character');

  assert.equal(types(editor).includes('image'), false, 'image should be gone');
});

/* ------------------------------------------------------------------ */
/* Markdown shortcuts                                                  */
/* ------------------------------------------------------------------ */

test('"# " converts a paragraph into a heading', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  Editor.insertText(editor, '#');
  Editor.insertText(editor, ' ');

  assert.equal(editor.children[0].type, 'heading-one');
  assert.equal(Node.string(editor.children[0]), '');
});

test('"### " converts to a level-three heading', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  '###'.split('').forEach((c) => Editor.insertText(editor, c));
  Editor.insertText(editor, ' ');

  assert.equal(editor.children[0].type, 'heading-three');
});

test('"- " starts a bulleted list', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  Editor.insertText(editor, '-');
  Editor.insertText(editor, ' ');

  assert.equal(editor.children[0].type, 'bulleted-list');
  assert.equal(editor.children[0].children[0].type, 'list-item');
});

test('"1. " starts a numbered list', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  '1.'.split('').forEach((c) => Editor.insertText(editor, c));
  Editor.insertText(editor, ' ');

  assert.equal(editor.children[0].type, 'numbered-list');
});

test('"> " starts a block quote', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  Editor.insertText(editor, '>');
  Editor.insertText(editor, ' ');

  assert.equal(editor.children[0].type, 'block-quote');
});

test('a shortcut prefix inside an existing heading stays literal text', () => {
  const editor = makeEditor([{ type: 'heading-one', children: [{ text: '' }] }, para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  Editor.insertText(editor, '#');
  Editor.insertText(editor, ' ');

  assert.equal(editor.children[0].type, 'heading-one');
  assert.equal(Node.string(editor.children[0]), '# ');
});

test('backspace at the start of a heading turns it back into a paragraph', () => {
  const editor = makeEditor([{ type: 'heading-two', children: [{ text: 'Title' }] }, para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  editor.deleteBackward('character');

  assert.equal(editor.children[0].type, 'paragraph');
  assert.equal(Node.string(editor.children[0]), 'Title', 'the text itself is kept');
});

/* ------------------------------------------------------------------ */
/* Structural normalisation                                            */
/* ------------------------------------------------------------------ */

test('a list may only contain list items', () => {
  const editor = makeEditor([
    { type: 'bulleted-list', children: [para('should become a list item')] },
    para(''),
  ]);

  assert.equal(editor.children[0].children[0].type, 'list-item');
});

test('a stray list item outside a list becomes a paragraph', () => {
  const editor = makeEditor([{ type: 'list-item', children: [{ text: 'orphan' }] }]);

  assert.equal(editor.children[0].type, 'paragraph');
});

/* ------------------------------------------------------------------ */
/* Links                                                               */
/* ------------------------------------------------------------------ */

test('inserting a link over a selection wraps it', () => {
  const editor = makeEditor([para('click here')]);
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [0, 0], offset: 5 },
  });

  insertLink(editor, 'https://example.com');

  const [link] = Editor.nodes(editor, {
    at: [],
    match: (n) => n.type === 'link',
  });
  assert.ok(link, 'a link node exists');
  assert.equal(link[0].url, 'https://example.com');
});

test('inserting a link with a collapsed caret inserts the url as text', () => {
  const editor = makeEditor([para('')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  insertLink(editor, 'https://example.com');

  assert.equal(isLinkActive(editor), true);
  assert.ok(Node.string(editor.children[0]).includes('https://example.com'));
});

/* ------------------------------------------------------------------ */
/* Undo grouping for resizes                                           */
/* ------------------------------------------------------------------ */

test('a resize is a single undo step', () => {
  const editor = makeEditor([para('a'), image({ width: null }), para('b')]);

  // MediaElement commits once on pointer-up rather than on every mouse move.
  Transforms.setNodes(editor, { width: 40 }, { at: [1] });
  assert.equal(editor.children[1].width, 40);

  editor.undo();
  // Slate stores "no width" as an absent key, so null and undefined are the
  // same state here — what matters is that a single undo cleared the resize.
  assert.equal(editor.children[1].width ?? null, null, 'one undo restores the original size');
});

/* ------------------------------------------------------------------ */
/* Backwards compatibility with capsules saved before v1.2.0           */
/* ------------------------------------------------------------------ */

test('a current percentage width renders as a percentage', () => {
  assert.deepEqual(resolveMediaWidth(50), { width: '50%', isSized: true });
  assert.deepEqual(resolveMediaWidth(100), { width: '100%', isSized: true });
});

test('no width means natural size', () => {
  for (const value of [null, undefined, 'auto', '']) {
    assert.deepEqual(
      resolveMediaWidth(value),
      { width: 'fit-content', isSized: false },
      `${JSON.stringify(value)} should mean natural size`
    );
  }
});

test('a legacy pixel width from an old capsule is still honoured', () => {
  // The pre-v1.2.0 resize handles wrote raw pixel numbers.
  assert.deepEqual(resolveMediaWidth(320), { width: '320px', isSized: true });
  assert.deepEqual(resolveMediaWidth('320px'), { width: '320px', isSized: true });
});

test('a legacy percentage string is passed through', () => {
  assert.deepEqual(resolveMediaWidth('50%'), { width: '50%', isSized: true });
});

/* ------------------------------------------------------------------ */
/* Toolbar helpers                                                     */
/* ------------------------------------------------------------------ */

test('the bullet list button toggles a list on and back off', () => {
  const editor = makeEditor([para('hello')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  toggleBlock(editor, 'bulleted-list');
  assert.equal(editor.children[0].type, 'bulleted-list');
  assert.equal(editor.children[0].children[0].type, 'list-item');
  assert.equal(isBlockActive(editor, 'bulleted-list'), true);

  toggleBlock(editor, 'bulleted-list');
  assert.equal(editor.children[0].type, 'paragraph');
  assert.equal(Node.string(editor.children[0]), 'hello', 'the text survives the round trip');
});

test('alignment lands on the block, not on the text node', () => {
  const editor = makeEditor([para('hi')]);
  Transforms.select(editor, Editor.start(editor, [0]));

  toggleAlign(editor, 'right');

  assert.equal(editor.children[0].align, 'right');
  assert.equal(editor.children[0].children[0].align, undefined);
});

test('block formatting across a selection skips void media', () => {
  const editor = makeEditor([para('a'), image(), para('b')]);
  Transforms.select(editor, {
    anchor: { path: [0, 0], offset: 0 },
    focus: { path: [2, 0], offset: 1 },
  });

  toggleBlock(editor, 'heading-one');

  assert.deepEqual(types(editor), ['heading-one', 'image', 'heading-one']);
});
