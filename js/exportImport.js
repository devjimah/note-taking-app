/**
 * Export/Import Module
 * Handles exporting and importing notes as JSON files
 */

import * as noteManager from './noteManager.js';
import { showToast } from './ui.js';

/**
 * Export all notes to a JSON file
 * Downloads a JSON file containing all notes
 */
export const exportNotes = () => {
  const notes = noteManager.getAllNotes(true); // Include archived notes
  
  if (notes.length === 0) {
    showToast('No notes to export', 'info');
    return;
  }
  
  const exportData = {
    exportDate: new Date().toISOString(),
    version: '1.0',
    notesCount: notes.length,
    notes: notes.map(note => note.toJSON ? note.toJSON() : note)
  };
  
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `notes-export-${formatDateForFilename(new Date())}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  showToast(`Successfully exported ${notes.length} notes`, 'success');
};

/**
 * Format date for filename
 * @param {Date} date - Date object
 * @returns {string} Formatted date string (YYYY-MM-DD)
 */
const formatDateForFilename = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * Validate imported data structure
 * @param {Object} data - Imported data object
 * @returns {Object} Validation result { valid: boolean, errors: string[], notes: Array }
 */
export const validateImportData = (data) => {
  const errors = [];
  let validNotes = [];
  
  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid file format: expected JSON object');
    return { valid: false, errors, notes: [] };
  }
  
  // Check for notes array (support both wrapped and unwrapped formats)
  let notesArray = data.notes || data;
  
  if (!Array.isArray(notesArray)) {
    // Try to handle single note object
    if (data.id && (data.title !== undefined || data.content !== undefined)) {
      notesArray = [data];
    } else {
      errors.push('Invalid file format: notes array not found');
      return { valid: false, errors, notes: [] };
    }
  }
  
  // Validate each note
  notesArray.forEach((note, index) => {
    const noteErrors = validateNote(note, index);
    if (noteErrors.length === 0) {
      validNotes.push(normalizeNote(note));
    } else {
      errors.push(...noteErrors);
    }
  });
  
  return {
    valid: validNotes.length > 0,
    errors,
    notes: validNotes
  };
};

/**
 * Validate a single note object
 * @param {Object} note - Note object to validate
 * @param {number} index - Index in the array
 * @returns {Array} Array of error messages
 */
const validateNote = (note, index) => {
  const errors = [];
  
  if (!note || typeof note !== 'object') {
    errors.push(`Note at index ${index}: invalid note object`);
    return errors;
  }
  
  // Note must have at least a title or content
  if (!note.title && !note.content) {
    errors.push(`Note at index ${index}: must have title or content`);
  }
  
  // Validate tags if present
  if (note.tags !== undefined && !Array.isArray(note.tags)) {
    if (typeof note.tags === 'string') {
      // Allow comma-separated string, will be converted
    } else {
      errors.push(`Note at index ${index}: tags must be an array`);
    }
  }
  
  return errors;
};

/**
 * Normalize note data to ensure consistent structure
 * @param {Object} note - Note object
 * @returns {Object} Normalized note object
 */
const normalizeNote = (note) => {
  let tags = note.tags || [];
  
  // Convert comma-separated string to array
  if (typeof tags === 'string') {
    tags = tags.split(',').map(t => t.trim()).filter(t => t);
  }
  
  return {
    id: note.id || null, // Will be regenerated if duplicate
    title: note.title || '',
    content: note.content || '',
    tags: tags,
    lastEdited: note.lastEdited || new Date().toISOString(),
    isArchived: note.isArchived || false,
    location: note.location || null
  };
};

/**
 * Check for duplicate notes
 * @param {Object} importedNote - Note being imported
 * @param {Array} existingNotes - Array of existing notes
 * @returns {Object|null} Existing note if duplicate found, null otherwise
 */
const findDuplicateNote = (importedNote, existingNotes) => {
  return existingNotes.find(existing => {
    // Check by ID first
    if (importedNote.id && existing.id === importedNote.id) {
      return true;
    }
    // Check by exact title and content match
    if (existing.title === importedNote.title && 
        existing.content === importedNote.content &&
        existing.title && existing.content) {
      return true;
    }
    return false;
  });
};

/**
 * Import notes from JSON data
 * @param {Object} data - Validated import data
 * @param {Object} options - Import options
 * @returns {Object} Import result { imported: number, skipped: number, duplicates: number }
 */
export const importNotes = (data, options = { skipDuplicates: true }) => {
  const existingNotes = noteManager.getAllNotes(true);
  let imported = 0;
  let skipped = 0;
  let duplicates = 0;
  
  data.notes.forEach(noteData => {
    // Check for duplicates
    const duplicate = findDuplicateNote(noteData, existingNotes);
    
    if (duplicate && options.skipDuplicates) {
      duplicates++;
      return;
    }
    
    // Create new note (ID will be regenerated)
    try {
      const newNote = noteManager.createNote(
        noteData.title,
        noteData.content,
        noteData.tags
      );
      
      // Update additional properties if needed
      if (noteData.isArchived) {
        noteManager.archiveNote(newNote.id);
      }
      
      imported++;
    } catch (error) {
      console.error('Error importing note:', error);
      skipped++;
    }
  });
  
  return { imported, skipped, duplicates };
};

/**
 * Handle file input change for import
 * @param {Event} event - File input change event
 * @param {Function} onComplete - Callback function after import
 */
export const handleImportFile = (event, onComplete) => {
  const file = event.target.files?.[0];
  
  if (!file) {
    return;
  }
  
  // Validate file type
  if (!file.name.endsWith('.json')) {
    showToast('Please select a JSON file', 'error');
    event.target.value = '';
    return;
  }
  
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      const validation = validateImportData(data);
      
      if (!validation.valid) {
        showToast('Invalid file format. Please check the file structure.', 'error');
        console.error('Import validation errors:', validation.errors);
        event.target.value = '';
        return;
      }
      
      // Show confirmation if there are validation warnings
      if (validation.errors.length > 0) {
        console.warn('Import warnings:', validation.errors);
      }
      
      const result = importNotes(validation);
      
      let message = `Imported ${result.imported} notes`;
      if (result.duplicates > 0) {
        message += `, ${result.duplicates} duplicates skipped`;
      }
      if (result.skipped > 0) {
        message += `, ${result.skipped} failed`;
      }
      
      showToast(message, result.imported > 0 ? 'success' : 'info');
      
      // Reset file input
      event.target.value = '';
      
      // Call completion callback
      if (onComplete) {
        onComplete(result);
      }
      
    } catch (error) {
      console.error('Error parsing import file:', error);
      showToast('Error reading file. Please ensure it is valid JSON.', 'error');
      event.target.value = '';
    }
  };
  
  reader.onerror = () => {
    showToast('Error reading file', 'error');
    event.target.value = '';
  };
  
  reader.readAsText(file);
};
