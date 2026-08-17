import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ReactEditor, useSelected, useFocused, useSlateStatic } from 'slate-react';
import { Transforms } from 'slate';
import { resolveMediaWidth } from '../../../../services/withMedia';
import styles from './CanvasWorkspace.module.css';

/** Width presets, as a percentage of the writing column. */
const SIZE_PRESETS = [
  { label: 'S', value: 25, title: 'Small (25%)' },
  { label: 'M', value: 50, title: 'Medium (50%)' },
  { label: 'L', value: 75, title: 'Large (75%)' },
  { label: 'Full', value: 100, title: 'Full width' },
];

const MIN_WIDTH_PERCENT = 10;
const MAX_WIDTH_PERCENT = 100;

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
 * Resizing works on width only and lets height follow the natural aspect ratio,
 * so media can never be squashed. The drag itself is tracked in local state and
 * written back to the document once on release, which keeps the editor from
 * re-rendering on every mouse move and leaves a single undo step per resize.
 * Width is stored as a percentage of the writing column so a capsule opened
 * years later on a different screen still lays out the way it was composed.
 */
const MediaElement = ({ attributes, children, element, mediaType }) => {
  const selected = useSelected();
  const focused = useFocused();
  const editor = useSlateStatic();
  const isActive = selected && focused;

  const wrapperRef = useRef(null);
  const dragStateRef = useRef(null);

  // Non-null only while a resize drag is in flight.
  const [draftWidth, setDraftWidth] = useState(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const storedWidth = element.width ?? null;
  const align = element.align || 'center';
  const isResizable = mediaType === 'image' || mediaType === 'video' || mediaType === 'audio';

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

  const startResize = useCallback(
    (direction) => (event) => {
      // Let Slate keep its selection and stop the canvas from starting a drag.
      event.preventDefault();
      event.stopPropagation();

      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const columnWidth = wrapper.parentElement?.clientWidth || wrapper.clientWidth;
      if (!columnWidth) return;

      dragStateRef.current = {
        direction,
        startX: event.clientX,
        startWidthPx: wrapper.getBoundingClientRect().width,
        columnWidth,
        latest: storedWidth,
      };

      event.currentTarget.setPointerCapture?.(event.pointerId);
    },
    [storedWidth]
  );

  const handlePointerMove = useCallback((event) => {
    const drag = dragStateRef.current;
    if (!drag) return;

    const delta = event.clientX - drag.startX;
    // Dragging a left-side handle outward means moving left, hence the flip.
    const signed = drag.direction.includes('left') ? -delta : delta;
    const nextPx = drag.startWidthPx + signed;

    const percent = Math.round((nextPx / drag.columnWidth) * 100);
    const clamped = Math.min(MAX_WIDTH_PERCENT, Math.max(MIN_WIDTH_PERCENT, percent));

    drag.latest = clamped;
    setDraftWidth(clamped);
  }, []);

  const endResize = useCallback(() => {
    const drag = dragStateRef.current;
    dragStateRef.current = null;

    if (drag && drag.latest != null && drag.latest !== storedWidth) {
      updateNode({ width: drag.latest });
    }
    setDraftWidth(null);
  }, [storedWidth, updateNode]);

  // Track the drag on the window so it survives the pointer leaving the handle.
  useEffect(() => {
    const onMove = (event) => {
      if (dragStateRef.current) handlePointerMove(event);
    };
    const onUp = () => {
      if (dragStateRef.current) endResize();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [handlePointerMove, endResize]);

  // While dragging, the draft value is always a percentage.
  const resolved =
    draftWidth != null
      ? { width: `${draftWidth}%`, isSized: true }
      : resolveMediaWidth(storedWidth);

  const wrapperStyle = {
    width: resolved.width,
    maxWidth: '100%',
    marginLeft: align === 'left' ? 0 : 'auto',
    marginRight: align === 'right' ? 0 : 'auto',
  };

  const mediaStyle = {
    width: resolved.isSized ? '100%' : 'auto',
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
  };

  const renderMedia = () => {
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
            style={mediaStyle}
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
            style={mediaStyle}
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
            contentEditable={false}
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

  const handles = ['left', 'right', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];

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
                    onPointerDown={startResize(direction)}
                  />
                ))}

              {draftWidth != null && <span className={styles.sizeBadge}>{draftWidth}%</span>}

              <div className={styles.mediaToolbar} contentEditable={false}>
                <button
                  type="button"
                  title="Align left"
                  className={align === 'left' ? styles.activeAlign : ''}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => updateNode({ align: 'left' })}
                >
                  ⇤
                </button>
                <button
                  type="button"
                  title="Align center"
                  className={align === 'center' ? styles.activeAlign : ''}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => updateNode({ align: 'center' })}
                >
                  ⇔
                </button>
                <button
                  type="button"
                  title="Align right"
                  className={align === 'right' ? styles.activeAlign : ''}
                  onMouseDown={(e) => e.preventDefault()}
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
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => updateNode({ width: preset.value })}
                      >
                        {preset.label}
                      </button>
                    ))}
                    <button
                      type="button"
                      title="Reset to natural size"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => updateNode({ width: null })}
                    >
                      ⤢
                    </button>
                  </>
                )}

                <span className={styles.toolbarDivider} />
                <button
                  type="button"
                  title="Remove"
                  className={styles.dangerBtn}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={removeNode}
                >
                  ✕
                </button>
              </div>
            </>
          )}
        </div>

        {(isActive || element.caption) && mediaType !== 'file' && (
          <input
            className={styles.mediaCaption}
            style={{ textAlign: align }}
            value={element.caption || ''}
            placeholder={isActive ? 'Add a caption...' : ''}
            onChange={(event) => updateNode({ caption: event.target.value })}
            // Keep keystrokes out of the Slate document.
            onKeyDown={(event) => event.stopPropagation()}
          />
        )}
      </div>
      {children}
    </div>
  );
};

/** 'top-left' -> 'topLeft' so it matches the CSS module class names. */
const toHandleClass = (direction) =>
  direction.replace(/-([a-z])/g, (_, chr) => chr.toUpperCase());

export default MediaElement;
