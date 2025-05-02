import api from './api';

/**
 * Replaces blob URLs in capsule content with Google Drive links
 * @param {Array} content - Editor content that may contain blob URLs
 * @returns {Promise<Array>} - Updated content with real URLs
 */
export const replaceBlobUrlsWithDriveLinks = async (content) => {
  // Helper to upload a blob URL and return new URL
  const uploadBlob = async (url, fileName = 'upload.file') => {
    const blob = await fetch(url).then((res) => res.blob());
    const formData = new FormData();
    formData.append('file', blob, fileName);

    const response = await api.post('/upload-temp-media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data.url;
  };

  return Promise.all(
    content.map(async (block) => {
      // Image block
      if (block.type === 'image' && block.url?.startsWith('blob:')) {
        try {
          const newUrl = await uploadBlob(block.url, block.name || 'upload.png');
          return { ...block, url: newUrl };
        } catch (error) {
          console.error(`Error uploading blob for ${block.name}:`, error);
          return block;
        }
      }

      // Generic media array (video, audio, etc.)
      if (Array.isArray(block.media)) {
        const media = await Promise.all(
          block.media.map(async (item) => {
            if (item.url?.startsWith('blob:')) {
              try {
                const newUrl = await uploadBlob(item.url, item.name);
                return { ...item, url: newUrl };
              } catch (error) {
                console.error(`Error uploading blob for ${item.name}:`, error);
                return item;
              }
            }
            return item;
          })
        );
        return { ...block, media };
      }

      // No blob to replace
      return block;
    })
  );
};
