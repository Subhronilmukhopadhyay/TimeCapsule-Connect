// components/PreviewArea/ReadOnlyMediaElement.jsx
import React from 'react';
import { resolveMediaPlacement } from '../../../../services/withMedia';

/**
 * Preview-side twin of MediaElement.
 *
 * Placement goes through resolveMediaPlacement so the preview matches the
 * editor exactly: free-positioned media lands at its absolute x/y, docked media
 * keeps its percentage width and alignment, and capsules saved before v1.2.0
 * (which stored raw CSS widths) still render as they were composed.
 */
const ReadOnlyMediaElement = ({ attributes, children, element, mediaType }) => {
  const align = element.align || 'center';
  const { floating, block, media } = resolveMediaPlacement(element);
  const { isSized, ...mediaStyle } = media;

  const wrapperStyle = floating
    ? mediaStyle
    : { ...mediaStyle, marginTop: '1em', marginBottom: '1em' };

  const innerStyle = {
    display: 'block',
    width: floating || isSized ? '100%' : 'auto',
    height: floating || element.h ? '100%' : 'auto',
    maxWidth: '100%',
    objectFit: 'contain',
    borderRadius: 6,
  };

  const renderMedia = () => {
    switch (mediaType) {
      case 'image':
        return (
          <img src={element.url} alt={element.caption || element.name || 'image'} style={innerStyle} />
        );
      case 'video':
        return <video controls preload="metadata" src={element.url} style={innerStyle} />;
      case 'audio':
        return <audio controls preload="metadata" src={element.url} style={{ width: '100%' }} />;
      case 'file':
      default:
        return (
          <a
            href={element.url}
            download={element.name || 'file'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              padding: 12,
              border: '1px solid #e2e4eb',
              borderRadius: 8,
              background: '#f6f7fb',
              color: '#1f2430',
              textDecoration: 'none',
            }}
          >
            {element.name || 'Download File'}
          </a>
        );
    }
  };

  return (
    <div {...attributes} style={block}>
      <div contentEditable={false} style={wrapperStyle}>
        {renderMedia()}
        {element.caption ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: '#6b7280',
              fontStyle: 'italic',
              textAlign: floating ? 'center' : align,
            }}
          >
            {element.caption}
          </div>
        ) : null}
      </div>
      {children}
    </div>
  );
};

export default ReadOnlyMediaElement;
