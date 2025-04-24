// components/PreviewArea/ReadOnlyMediaElement.jsx
import React from 'react';

const ReadOnlyMediaElement = ({ attributes, children, element, mediaType }) => {
  const style = {
    display: 'block',
    width: element.width || 'auto',
    margin: element.align === 'center' ? '0 auto' :
            element.align === 'left' ? '0 auto 0 0' : '0 0 0 auto',
  };

  switch (mediaType) {
    case 'image':
      return <img {...attributes} src={element.url} alt={element.name || 'image'} style={style} />;
    case 'video':
      return <video {...attributes} controls src={element.url} style={style} />;
    case 'audio':
      return <audio {...attributes} controls src={element.url} style={style} />;
    case 'file':
      return (
        <div {...attributes} style={{ ...style, padding: 8, border: '1px solid #ccc', borderRadius: 4 }}>
          <a href={element.url} download>{element.name || 'Download File'}</a>
        </div>
      );
    default:
      return <div {...attributes}>Unsupported Media</div>;
  }
};

export default ReadOnlyMediaElement;