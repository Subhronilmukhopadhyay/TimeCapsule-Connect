import React, { useCallback, useRef, useState } from 'react';
import { Rnd } from 'react-rnd';
import { ReactEditor, useSelected, useFocused, useSlateStatic } from 'slate-react';
import { Transforms } from 'slate';
import { resolveMediaWidth } from '../../../../services/withMedia';
import styles from './CanvasWorkspace.module.css';

/** Width presets for docked media, as a percentage of the writing column. */
const SIZE_PRESETS = [
  { label: 'S', value: 25, title: 'Small (25%)' },
  { label: 'M', value: 50, title: 'Medium (50%)' },
  { label: 'L', value: 75, title: 'Large (75%)' },
  { label: 'Full', value: 100, title: 'Full width' },
];

const MIN_WIDTH_PERCENT = 10;
const MAX_WIDTH_PERCENT = 100;
const MIN_PX = 60;
const DEFAULT_FLOAT_WIDTH = 320;

const formatBytes = (bytes) => {
  if (!bytes && bytes !== 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[unit]}`;
};

/**
 * A void media block: image, video, audio or file attachment.
 *
 * It has two modes.
 *
 * **Docked** is the default on insert, so a freshly added image appears where
 * the caret was rather than jumping to a corner. It stays in the document flow,
 * and all eight handles resize it — width and height independently, with no
 * aspect-ratio lock.
 *
 * **Floating** is entered with "Free position", which measures where the media
 * currently sits and pins it there as absolute x/y against the writing sheet.
 * From then on it can be dragged anywhere and resized from any edge or corner,
 * overlapping text freely. "Dock" returns it to the flow.
 *
 * Both modes write to the document only when a gesture ends, so a drag or
 * resize is one undo step instead of one per mouse movement.
 */
const MediaElement = ({ attributes, children, element, mediaType }) => {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const isActive = selected && focused;

  const wrapperRef = useRef(null);
  const dragStateRef = useRef(null);

  const [draftWidth, setDraftWidth] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const isFloating = typeof element.x === 'number' && typeof element.y === 'number';
  const storedWidth = element.width ?? null;
  const align = element.align || 'center';
  const isResizable = mediaType !== 'file';

  const updateNode = useCallback(
    (props) => {
      const path = ReactEditor.findPath(editor, element);
      Transforms.setNodes(editor, props, { at: path });
    },
    [editor, element]
  );

  const removeNode = useCallback(() => {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, { at: path });
  }, [editor, element]);

  /* ---------------- Docked <-> floating ---------------- */

  /** Pins the media where it currently renders so it can then be dragged. */
  const floatHere = useCallback(() => {
    const node = wrapperRef.current;
    const sheet = node ? node.closest('[data-capsule-sheet]') : null;
    if (!node || !sheet) return;

    const nodeRect = node.getBoundingClientRect();
    const sheetRect = sheet.getBoundingClientRect();

    updateNode({
      x: Math.max(0, Math.round(nodeRect.left - sheetRect.left)),
      y: Math.max(0, Math.round(nodeRect.top - sheetRect.top)),
      w: Math.round(nodeRect.width),
      h: Math.round(nodeRect.height),
    });
  }, [updateNode]);

  /** Returns the media to the document flow. */
  const dockInline = useCallback(() => {
    updateNode({ x: null, y: null, w: null, h: null });
  }, [updateNode]);

  /* ---------------- Docked resizing ---------------- */

  const startDockedResize = useCallback(
    (direction) => (event) => {
      event.preventDefault();
      event.stopPropagation();

      const node = wrapperRef.current;
      if (!node) return;

      const columnWidth = node.parentElement ? node.parentElement.clientWidth : node.clientWidth;
      if (!columnWidth) return;

      const rect = node.getBoundingClientRect();
      dragStateRef.current = {
        direction,
        startX: event.clientX,
        startY: event.clientY,
        startWidthPx: rect.width,
        startHeightPx: rect.height,
        columnWidth,
        latestWidth: storedWidth,
        latestHeight: element.h == null ? null : element.h,
      };

      const onMove = (moveEvent) => {
        const drag = dragStateRef.current;
        if (!drag) return;

        const dx = moveEvent.clientX - drag.startX;
        const dy = moveEvent.clientY - drag.startY;

        // Horizontal: left-side handles grow when dragged outward (leftward).
        if (drag.direction.includes('left') || drag.direction.includes('right')) {
          const signed = drag.direction.includes('left') ? -dx : dx;
          const nextPx = drag.startWidthPx + signed;
          const percent = Math.round((nextPx / drag.columnWidth) * 100);
          drag.latestWidth = Math.min(MAX_WIDTH_PERCENT, Math.max(MIN_WIDTH_PERCENT, percent));
          setDraftWidth(drag.latestWidth);
        }

        // Vertical: height is free, which is what unlocks non-proportional resizing.
        if (drag.direction.includes('top') || drag.direction.includes('bottom')) {
          const signed = drag.direction.includes('top') ? -dy : dy;
          drag.latestHeight = Math.max(MIN_PX, Math.round(drag.startHeightPx + signed));
        }
      };

      const onUp = () => {
        const drag = dragStateRef.current;
        dragStateRef.current = null;
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);

        if (drag) {
          const next = {};
          if (drag.latestWidth != null && drag.latestWidth !== storedWidth) {
            next.width = drag.latestWidth;
          }
          const previousHeight = element.h == null ? null : element.h;
          if (drag.latestHeight != null && drag.latestHeight !== previousHeight) {
            next.h = drag.latestHeight;
          }
          if (Object.keys(next).length > 0) updateNode(next);
        }
        setDraftWidth(null);
      };

      window.addEventListener('pointermove', onMove);
      window.addEventListener('pointerup', onUp);
    },
    [storedWidth, element.h, updateNode]
  );

  /* ---------------- Rendering ---------------- */

  const mediaStyle = (fill) => {
    const sized = resolveMediaWidth(storedWidth).isSized;
    return {
      display: 'block',
      width: fill || sized ? '100%' : 'auto',
      height: fill || element.h ? '100%' : 'auto',
      maxWidth: '100%',
      objectFit: 'contain',
    };
  };

  const renderMedia = (fill = false) => {
    if (loadFailed) {
      return (
        <div className={styles.mediaError}>
          <strong>{element.name || 'Media'}</strong>
          <span>This file could not be loaded. It may still be uploading.</span>
        </div>
      );
    }

    switch (mediaType) {
      case 'image':
        return (
          <img
            src={element.url}
            alt={element.caption || element.name || 'Capsule image'}
            style={mediaStyle(fill)}
            className={styles.mediaImage}
            draggable={false}
            onError={() => setLoadFailed(true)}
          />
        );
      case 'video':
        return (
          <video
            controls
            preload="metadata"
            src={element.url}
            style={mediaStyle(fill)}
            className={styles.mediaVideo}
            onError={() => setLoadFailed(true)}
          />
        );
      case 'audio':
        return (
          <div className={styles.audioCard}>
            <div className={styles.audioTitle}>{element.name || 'Audio clip'}</div>
            <audio
              controls
              preload="metadata"
              src={element.url}
              style={{ width: '100%' }}
              onError={() => setLoadFailed(true)}
            />
          </div>
        );
      case 'file':
      default:
        return (
          <a
            className={styles.fileAttachment}
            href={element.url}
            download={element.name || 'file'}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className={styles.fileMeta}>
              <span className={styles.fileName}>{element.name || 'Attachment'}</span>
              {element.size ? <span className={styles.fileSize}>{formatBytes(element.size)}</span> : null}
            </span>
          </a>
        );
    }
  };

  const stopPress = (event) => event.preventDefault();

  const toolbar = (
    <div className={styles.mediaToolbar} contentEditable={false}>
      {isFloating ? (
        <button type="button" title="Put this back into the text flow" onMouseDown={stopPress} onClick={dockInline}>
          Dock
        </button>
      ) : (
        <>
          <button
            type="button"
            title="Align left"
            className={align === 'left' ? styles.activeAlign : ''}
            onMouseDown={stopPress}
            onClick={() => updateNode({ align: 'left' })}
          >
            ⇤
          </button>
          <button
            type="button"
            title="Align center"
            className={align === 'center' ? styles.activeAlign : ''}
            onMouseDown={stopPress}
            onClick={() => updateNode({ align: 'center' })}
          >
            ⇔
          </button>
          <button
            type="button"
            title="Align right"
            className={align === 'right' ? styles.activeAlign : ''}
            onMouseDown={stopPress}
            onClick={() => updateNode({ align: 'right' })}
          >
            ⇥
          </button>

          {isResizable && (
            <>
              <span className={styles.toolbarDivider} />
              {SIZE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  type="button"
                  title={preset.title}
                  className={storedWidth === preset.value ? styles.activeAlign : ''}
                  onMouseDown={stopPress}
                  onClick={() => updateNode({ width: preset.value, h: null })}
                >
                  {preset.label}
                </button>
              ))}
              <button type="button" title="Reset to natural size" onMouseDown={stopPress} onClick={() => updateNode({ width: null, h: null })}>
                ⤢
              </button>
            </>
          )}

          <span className={styles.toolbarDivider} />
          <button type="button" title="Free position — drag it anywhere on the page" onMouseDown={stopPress} onClick={floatHere}>
            ✥ Free
          </button>
        </>
      )}

      <span className={styles.toolbarDivider} />
      <button type="button" title="Remove" className={styles.dangerBtn} onMouseDown={stopPress} onClick={removeNode}>
        ✕
      </button>
    </div>
  );

  const caption =
    (isActive || element.caption) && mediaType !== 'file' ? (
      <input
        className={styles.mediaCaption}
        style={{ textAlign: isFloating ? 'center' : align }}
        value={element.caption || ''}
        placeholder={isActive ? 'Add a caption...' : ''}
        onChange={(event) => updateNode({ caption: event.target.value })}
        onKeyDown={(event) => event.stopPropagation()}
      />
    ) : null;

  /* ---------------- Floating mode ---------------- */

  if (isFloating) {
    return (
      <div {...attributes} className={styles.mediaBlockFloating}>
        <div contentEditable={false}>
          <Rnd
            className={`${styles.floatingMedia} ${isActive ? styles.mediaWrapperActive : ''}`}
            // Bounded by the writing sheet, not "parent" — the parent block is
            // collapsed to zero height, which would pin the media in place.
            bounds="[data-capsule-sheet]"
            position={{ x: element.x, y: element.y }}
            size={{ width: element.w || DEFAULT_FLOAT_WIDTH, height: element.h || 'auto' }}
            minWidth={MIN_PX}
            minHeight={MIN_PX}
            // Every edge and corner, with no aspect ratio locked.
            enableResizing={{
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: true,
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }}
            // Committed once per gesture so undo steps stay meaningful.
            onDragStop={(_event, data) => updateNode({ x: Math.round(data.x), y: Math.round(data.y) })}
            onResizeStop={(_event, _direction, ref, _delta, position) =>
              updateNode({
                w: Math.round(ref.offsetWidth),
                h: Math.round(ref.offsetHeight),
                x: Math.round(position.x),
                y: Math.round(position.y),
              })
            }
          >
            {renderMedia(true)}
            {isActive && toolbar}
          </Rnd>
        </div>
        {children}
      </div>
    );
  }

  /* ---------------- Docked mode ---------------- */

  const resolved =
    draftWidth != null ? { width: `${draftWidth}%`, isSized: true } : resolveMediaWidth(storedWidth);

  const wrapperStyle = {
    width: resolved.width,
    height: element.h ? `${element.h}px` : undefined,
    maxWidth: '100%',
    marginLeft: align === 'left' ? 0 : 'auto',
    marginRight: align === 'right' ? 0 : 'auto',
  };

  const handles = [
    'left',
    'right',
    'top',
    'bottom',
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ];

  return (
    <div {...attributes} className={styles.mediaBlock}>
      <div contentEditable={false} className={styles.mediaOuter}>
        <div
          ref={wrapperRef}
          className={`${styles.mediaWrapper} ${isActive ? styles.mediaWrapperActive : ''}`}
          style={wrapperStyle}
        >
          {renderMedia()}

          {isActive && (
            <>
              {isResizable &&
                handles.map((direction) => (
                  <span
                    key={direction}
                    role="presentation"
                    className={`${styles.resizeHandle} ${styles[toHandleClass(direction)]}`}
                    onPointerDown={startDockedResize(direction)}
                  />
                ))}

              {draftWidth != null && <span className={styles.sizeBadge}>{draftWidth}%</span>}

              {toolbar}
            </>
          )}
        </div>

        {caption}
      </div>
      {children}
    </div>
  );
};

/** 'top-left' -> 'topLeft' so it matches the CSS module class names. */
const toHandleClass = (direction) => direction.replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());

export default MediaElement;
