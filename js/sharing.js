/**
 * Note Sharing Module
 * Handles generating shareable links and managing shared notes
 */

import { showToast } from './ui.js';

// Storage key for shared notes
const SHARED_NOTES_KEY = 'notes_app_shared';

/**
 * Generate a unique share ID
 * @returns {string} Unique share ID
 */
const generateShareId = () => {
  // Create a URL-safe unique ID
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${timestamp}-${randomPart}`;
};

/**
 * Load shared notes from localStorage
 * @returns {Object} Object mapping share IDs to note data
 */
export const loadSharedNotes = () => {
  try {
    const stored = localStorage.getItem(SHARED_NOTES_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Error loading shared notes:', error);
    return {};
  }
};

/**
 * Save shared notes to localStorage
 * @param {Object} sharedNotes - Object mapping share IDs to note data
 * @returns {boolean} Success status
 */
const saveSharedNotes = (sharedNotes) => {
  try {
    localStorage.setItem(SHARED_NOTES_KEY, JSON.stringify(sharedNotes));
    return true;
  } catch (error) {
    console.error('Error saving shared notes:', error);
    return false;
  }
};

/**
 * Create a shareable link for a note
 * @param {Object} note - Note object to share
 * @returns {Object} { shareId, shareUrl }
 */
export const createShareLink = (note) => {
  if (!note) {
    throw new Error('Note is required to create share link');
  }
  
  const sharedNotes = loadSharedNotes();
  
  // Check if note is already shared
  const existingShareId = Object.keys(sharedNotes).find(
    id => sharedNotes[id].noteId === note.id
  );
  
  if (existingShareId) {
    // Update the existing shared note data
    sharedNotes[existingShareId] = {
      ...sharedNotes[existingShareId],
      title: note.title,
      content: note.content,
      tags: note.tags,
      updatedAt: new Date().toISOString()
    };
    saveSharedNotes(sharedNotes);
    
    return {
      shareId: existingShareId,
      shareUrl: getShareUrl(existingShareId)
    };
  }
  
  // Create new share
  const shareId = generateShareId();
  
  sharedNotes[shareId] = {
    noteId: note.id,
    title: note.title,
    content: note.content,
    tags: note.tags || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  saveSharedNotes(sharedNotes);
  
  return {
    shareId,
    shareUrl: getShareUrl(shareId)
  };
};

/**
 * Get the share URL for a given share ID
 * @param {string} shareId - Share ID
 * @returns {string} Full share URL
 */
export const getShareUrl = (shareId) => {
  const baseUrl = window.location.origin + window.location.pathname.replace(/\/[^\/]*$/, '');
  return `${baseUrl}/shared.html?id=${shareId}`;
};

/**
 * Get shared note data by share ID
 * @param {string} shareId - Share ID
 * @returns {Object|null} Shared note data or null if not found
 */
export const getSharedNote = (shareId) => {
  const sharedNotes = loadSharedNotes();
  return sharedNotes[shareId] || null;
};

/**
 * Revoke a share link (delete shared note)
 * @param {string} shareId - Share ID to revoke
 * @returns {boolean} Success status
 */
export const revokeShareLink = (shareId) => {
  const sharedNotes = loadSharedNotes();
  
  if (sharedNotes[shareId]) {
    delete sharedNotes[shareId];
    saveSharedNotes(sharedNotes);
    return true;
  }
  
  return false;
};

/**
 * Revoke share link by note ID
 * @param {string} noteId - Note ID to revoke shares for
 * @returns {boolean} Success status
 */
export const revokeShareByNoteId = (noteId) => {
  const sharedNotes = loadSharedNotes();
  
  const shareId = Object.keys(sharedNotes).find(
    id => sharedNotes[id].noteId === noteId
  );
  
  if (shareId) {
    delete sharedNotes[shareId];
    saveSharedNotes(sharedNotes);
    return true;
  }
  
  return false;
};

/**
 * Check if a note is currently shared
 * @param {string} noteId - Note ID to check
 * @returns {string|null} Share ID if shared, null otherwise
 */
export const getShareIdForNote = (noteId) => {
  const sharedNotes = loadSharedNotes();
  
  return Object.keys(sharedNotes).find(
    id => sharedNotes[id].noteId === noteId
  ) || null;
};

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
export const copyToClipboard = async (text) => {
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const result = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return result;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};

/**
 * Share a note and copy the link to clipboard
 * @param {Object} note - Note to share
 * @returns {Promise<Object>} { success, shareUrl }
 */
export const shareNoteAndCopy = async (note) => {
  try {
    const { shareUrl } = createShareLink(note);
    const copied = await copyToClipboard(shareUrl);
    
    if (copied) {
      showToast('Share link copied to clipboard!', 'success');
    } else {
      showToast('Share link created. Please copy manually: ' + shareUrl, 'info', 5000);
    }
    
    return { success: true, shareUrl };
  } catch (error) {
    console.error('Error sharing note:', error);
    showToast('Failed to create share link', 'error');
    return { success: false, shareUrl: null };
  }
};

/**
 * Update shared note when original note is updated
 * @param {string} noteId - Note ID
 * @param {Object} updates - Updates to apply
 */
export const updateSharedNote = (noteId, updates) => {
  const sharedNotes = loadSharedNotes();
  
  const shareId = Object.keys(sharedNotes).find(
    id => sharedNotes[id].noteId === noteId
  );
  
  if (shareId) {
    sharedNotes[shareId] = {
      ...sharedNotes[shareId],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveSharedNotes(sharedNotes);
  }
};

/**
 * Get all shared notes for the current user
 * @returns {Array} Array of shared note objects with share IDs
 */
export const getAllSharedNotes = () => {
  const sharedNotes = loadSharedNotes();
  
  return Object.entries(sharedNotes).map(([shareId, data]) => ({
    shareId,
    ...data,
    shareUrl: getShareUrl(shareId)
  }));
};
