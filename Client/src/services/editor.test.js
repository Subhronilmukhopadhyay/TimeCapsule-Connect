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
  resolveMediaPlacement,
  isFloatingMedia,
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
/* Free positioning                                                    */
/* ------------------------------------------------------------------ */

test('media with no x/y is docked in the text flow', () => {
  const element = image();

  assert.equal(isFloatingMedia(element), false);
  const { floating, block, media } = resolveMediaPlacement(element);
  assert.equal(floating, false);
  assert.deepEqual(block, {}, 'a docked block occupies normal flow space');
  assert.equal(media.position, undefined);
});

test('media with x/y floats at an absolute position', () => {
  const element = image({ x: 120, y: 340, w: 400, h: 250 });

  assert.equal(isFloatingMedia(element), true);
  const { floating, block, media } = resolveMediaPlacement(element);

  assert.equal(floating, true);
  assert.equal(media.position, 'absolute');
  assert.equal(media.left, '120px');
  assert.equal(media.top, '340px');
  assert.equal(media.width, '400px');
  assert.equal(media.height, '250px');
  // Critical: the block must collapse or it would also push the text down.
  assert.equal(block.height, 0);
});

test('x:0 / y:0 still counts as floating', () => {
  // A plain truthiness check would treat the top-left corner as "not placed".
  assert.equal(isFloatingMedia(image({ x: 0, y: 0 })), true);
});

test('floating survives a round trip through the document', () => {
  const editor = makeEditor([para('a'), image(), para('b')]);

  // Float it, as the "Free position" button does.
  Transforms.setNodes(editor, { x: 80, y: 200, w: 300, h: 180 }, { at: [1] });
  assert.equal(isFloatingMedia(editor.children[1]), true);

  // Dock it again.
  Transforms.setNodes(editor, { x: null, y: null, w: null, h: null }, { at: [1] });
  assert.equal(isFloatingMedia(editor.children[1]), false);
});

test('docking and floating are each a single undo step', () => {
  const editor = makeEditor([para('a'), image(), para('b')]);

  Transforms.setNodes(editor, { x: 80, y: 200, w: 300, h: 180 }, { at: [1] });
  assert.equal(isFloatingMedia(editor.children[1]), true);

  editor.undo();
  assert.equal(isFloatingMedia(editor.children[1]), false, 'one undo un-floats it');
});

test('a docked image can be resized to a non-proportional height', () => {
  // The aspect lock is gone: width and height are independent.
  const { media } = resolveMediaPlacement(image({ width: 50, h: 420 }));

  assert.equal(media.width, '50%');
  assert.equal(media.height, '420px');
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
