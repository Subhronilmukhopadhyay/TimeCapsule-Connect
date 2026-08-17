// components/PreviewArea/ReadOnlyMediaElement.jsx
import React from 'react';
import { resolveMediaWidth } from '../../../../services/withMedia';

/**
 * Preview-side twin of MediaElement. Width handling goes through
 * resolveMediaWidth so capsules saved before v1.2.0 — which stored raw CSS
 * rather than a percentage — still preview the way they were composed.
 */
const ReadOnlyMediaElement = ({ attributes, children, element, mediaType }) => {
  const align = element.align || 'center';
  const resolved = resolveMediaWidth(element.width);

  const wrapperStyle = {
    width: resolved.width,
    maxWidth: '100%',
    marginTop: '1em',
    marginBottom: '1em',
    marginLeft: align === 'left' ? 0 : 'auto',
    marginRight: align === 'right' ? 0 : 'auto',
  };

  const mediaStyle = {
    display: 'block',
    width: resolved.isSized ? '100%' : 'auto',
    maxWidth: '100%',
    height: 'auto',
    borderRadius: 6,
  };

  const renderMedia = () => {
    switch (mediaType) {
      case 'image':
        return (
          <img src={element.url} alt={element.caption || element.name || 'image'} style={mediaStyle} />
        );
      case 'video':
        return <video controls preload="metadata" src={element.url} style={mediaStyle} />;
      case 'audio':
        return <audio controls preload="metadata" src={element.url} style={{ width: '100%' }} />;
      case 'file':
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
      default:
        return <span>Unsupported media</span>;
    }
  };

  return (
    <div {...attributes}>
      <div contentEditable={false} style={wrapperStyle}>
        {renderMedia()}
        {element.caption ? (
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: '#6b7280',
              fontStyle: 'italic',
              textAlign: align,
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
