/**
 * Storage Module
 * Handles all localStorage and sessionStorage operations
 */

const STORAGE_KEYS = {
  NOTES: 'notes_app_notes',
  PREFERENCES: 'notes_app_preferences',
  DRAFT: 'notes_app_draft'
};

/**
 * Save notes to localStorage
 * @param {Array} notes - Array of note objects
 */
export const saveNotes = (notes) => {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
    return true;
  } catch (error) {
    console.error('Error saving notes:', error);
    // Handle quota exceeded error
    if (error.name === 'QuotaExceededError') {
      alert('Storage quota exceeded. Please delete some notes to continue.');
    }
    return false;
  }
};

/**
 * Load notes from localStorage
 * @returns {Array} Array of note objects
 */
export const loadNotes = () => {
  try {
    const notes = localStorage.getItem(STORAGE_KEYS.NOTES);
    return notes ? JSON.parse(notes) : null;
  } catch (error) {
    console.error('Error loading notes:', error);
    return null;
  }
};

/**
 * Save user preferences to localStorage
 * @param {Object} prefs - User preferences object
 */
export const savePreferences = (prefs) => {
  try {
    const currentPrefs = loadPreferences() || {};
    const updatedPrefs = { ...currentPrefs, ...prefs };
    localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

/**
 * Load user preferences from localStorage
 * @returns {Object} User preferences object
 */
export const loadPreferences = () => {
  try {
    const prefs = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
    return prefs ? JSON.parse(prefs) : getDefaultPreferences();
  } catch (error) {
    console.error('Error loading preferences:', error);
    return getDefaultPreferences();
  }
};

/**
 * Get default preferences
 * @returns {Object} Default preferences object
 */
const getDefaultPreferences = () => ({
  colorTheme: 'light',
  fontTheme: 'sans-serif'
});

/**
 * Save draft note to sessionStorage
 * @param {Object} draft - Draft note object
 */
export const saveDraft = (draft) => {
  try {
    sessionStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    return true;
  } catch (error) {
    console.error('Error saving draft:', error);
    return false;
  }
};

/**
 * Load draft note from sessionStorage
 * @returns {Object|null} Draft note object or null
 */
export const loadDraft = () => {
  try {
    const draft = sessionStorage.getItem(STORAGE_KEYS.DRAFT);
    return draft ? JSON.parse(draft) : null;
  } catch (error) {
    console.error('Error loading draft:', error);
    return null;
  }
};

/**
 * Clear draft from sessionStorage
 */
export const clearDraft = () => {
  try {
    sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
    return true;
  } catch (error) {
    console.error('Error clearing draft:', error);
    return false;
  }
};

/**
 * Clear all app data from storage
 */
export const clearAllData = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.NOTES);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    sessionStorage.removeItem(STORAGE_KEYS.DRAFT);
    return true;
  } catch (error) {
    console.error('Error clearing data:', error);
    return false;
  }
};

/**
 * Check if localStorage is available
 * @returns {boolean}
 */
export const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (error) {
    return false;
  }
};

