import React, { useRef } from 'react';
import { useSlate } from 'slate-react';
import { insertMedia } from '../../../../services/withMedia';
import styles from './MediaInsert.module.css';

/** Matches the ceiling enforced by the chunked upload service. */
const MAX_UPLOAD_BYTES = 2000 * 1024 * 1024;

const MediaButton = ({ icon, label, type }) => {
  const editor = useSlate();
  const fileInputRef = useRef(null);

  const handleInsert = () => {
    // Trigger file input click to open file dialog
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files || []);

    files.forEach((file) => {
      if (file.size > MAX_UPLOAD_BYTES) {
        window.alert(`"${file.name}" is larger than the 2GB upload limit.`);
        return;
      }

      // The blob URL is a local preview; processContentBeforeSave swaps it for
      // the uploaded URL when the capsule is saved.
      insertMedia(editor, {
        type,
        url: URL.createObjectURL(file),
        name: file.name,
        mime: file.type,
        size: file.size,
      });
    });

    // Reset so picking the same file twice still fires a change event.
    event.target.value = null;
  };

  // Determine accepted file types based on the button type
  const getAcceptedFileTypes = () => {
    switch (type) {
      case 'image': return 'image/*';
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      case 'file': return '.pdf,.doc,.docx,.txt,.rtf,.md,.csv,.xls,.xlsx,.ppt,.pptx,.zip';
      default: return '';
    }
  };

  return (
    <>
      <button className={styles.actionBtn} onClick={handleInsert} type="button">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {icon}
        </svg>
        {label}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={getAcceptedFileTypes()}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
};

const MediaInsert = () => {
  const mediaOptions = [
    {
      label: "Insert Image",
      type: "image",
      icon: (
        <>
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <circle cx="8.5" cy="8.5" r="1.5"></circle>
          <polyline points="21 15 16 10 5 21"></polyline>
        </>
      )
    },
    {
      label: "Insert Video",
      type: "video",
      icon: (
        <>
          <polygon points="23 7 16 12 23 17 23 7"></polygon>
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
        </>
      )
    },
    {
      label: "Insert Audio",
      type: "audio",
      icon: (
        <>
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </>
      )
    },
    {
      label: "Insert File",
      type: "file",
      icon: (
        <>
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
          <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
          <line x1="12" y1="22.08" x2="12" y2="12"></line>
        </>
      )
    }
  ];

  return (
    <div className={styles.toolSection}>
      <h3>Insert Media</h3>
      
      {mediaOptions.map((option, index) => (
        <div key={index} className={index > 0 ? styles.mediaButtonSpacing : ''}>
          <MediaButton 
            icon={option.icon} 
            label={option.label} 
            type={option.type} 
          />
        </div>
      ))}
    </div>
  );
};

export default MediaInsert;