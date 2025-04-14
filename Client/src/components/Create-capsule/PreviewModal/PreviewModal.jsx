import React from 'react';
import './PreviewModal.css';

const PreviewModal = ({ capsuleName, onClose }) => {
  return (
    <div className="modal preview-modal">
      <div className="modal-content">
        <h2>{capsuleName} - Preview</h2>
        <div className="preview-content">
          <div className="preview-capsule">
            <h1>My TimeCapsule</h1>
            <p>This is a preview of your time capsule. It shows exactly how your capsule will appear when it's unlocked.</p>
            <p>You can add text, images, videos, and more to your time capsule.</p>
            <p>This content will be locked until the date or location you specify.</p>
          </div>
        </div>
        <div className="modal-actions">
          <button className="modal-btn cancel-btn" onClick={onClose}>Close Preview</button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;