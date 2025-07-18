// utils/capsule-storage.js
import DOMPurify from 'dompurify';
import api from './api';
import { processContentBeforeSave } from './blob-upload';

/**
 * Creates a new capsule or updates an existing one
 * @param {string} title - The capsule title
 * @param {Array} content - The capsule content
 * @param {string|null} id - Existing capsule ID (null for new capsules)
 * @returns {Promise<string>} - Returns the capsule ID
 */
export const saveCapsule = async (title, content, id = null) => {
  try {
    const sanitizedTitle = DOMPurify.sanitize(title);
    // console.log(content);
    // Process blob URLs before saving
    const processedContent = await processContentBeforeSave(id, content);
    const sanitizedContent = sanitizeContent(processedContent);
    
    if (id) {
      // Update existing capsule
      await api.patch(`/create/capsule/${id}`, {
        title: sanitizedTitle,
        content: sanitizedContent,
      });
      return id;
    } else {
      // Create new capsule without page reload
      const { data } = await api.post(`/create/capsule`, {
        title: sanitizedTitle,
        content: sanitizedContent,
      });
      
      // Use history.replaceState instead of pushState to avoid adding to browser history stack
      window.history.replaceState(
        { capsuleId: data.id },
        '',
        `/create-capsule/${data.id}`
      );
      
      return data.id;
    }
  } catch (error) {
    console.error('Error saving capsule:', error);
    throw error;
  }
};

/**
 * Auto-saves capsule with debouncing
 * @param {string} id - The capsule ID
 * @param {string} title - The capsule title
 * @param {Array} content - The capsule content
 * @returns {Promise<void>}
 */
export const autoSaveCapsule = async (id, title, content) => {
  if (!id) return null;
  
  try {
    const sanitizedTitle = DOMPurify.sanitize(title);
    // console.log(content);
    // Process blob URLs before saving
    const processedContent = await processContentBeforeSave(id, content);
    const sanitizedContent = sanitizeContent(processedContent);
    
    await api.patch(`/create/capsule/${id}`, {
      title: sanitizedTitle,
      content: sanitizedContent,
    });
    
    console.log('Auto-saved capsule:', id);
    return id;
  } catch (error) {
    console.error('Error auto-saving capsule:', error);
    throw error;
  }
};

/**
 * Loads a capsule by ID for only-view
 * @param {string} id - The capsule ID to load
 * @returns {Promise<Object>} - The capsule data
 */
export const loadViewCapsule = async (id) => {
  try {
    const { data } = await api.get(`/view/capsule/${id}`);
    return data;
  } catch (error) {
    console.error('Error loading capsule:', error);
    throw error;
  }
};

/**
 * Loads a capsule by ID
 * @param {string} id - The capsule ID to load
 * @returns {Promise<Object>} - The capsule data
 */
export const loadCapsule = async (id) => {
  try {
    const { data } = await api.get(`/create/capsule/${id}`);
    return data;
  } catch (error) {
    console.error('Error loading capsule:', error);
    throw error;
  }
};

/**
 * Locks a capsule with specified settings
 * @param {string} id - The capsule ID
 * @param {Object} lockSettings - The lock settings
 * @returns {Promise<boolean>} - Success status
 */
export const lockCapsule = async (id, lockSettings) => {
  try {
    await api.patch(`/create/capsule/${id}/lock`, { lockSettings });
    return true;
  } catch (error) {
    console.error('Error locking capsule:', error);
    throw error;
  }
};

/**
 * Sanitizes content before saving
 * @param {Array} content - The content to sanitize
 * @returns {Array} - Sanitized content
 */
export const sanitizeContent = (content) => {
  return content.map(item => {
    if (item.children) {
      return {
        ...item,
        children: item.children.map(child => ({
          ...child,
          text: child.text ? DOMPurify.sanitize(child.text) : '',
        })),
      };
    } else if (item.value) {
      return { ...item, value: DOMPurify.sanitize(item.value) };
    }
    return item;
  });
};
