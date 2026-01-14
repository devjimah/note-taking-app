/**
 * Note Manager Module
 * Handles note data management and business logic
 */

import { saveNotes, loadNotes, saveCategories, loadCategories } from './storage.js';

// Initial data will be loaded via fetch if needed
let initialData = null;

/**
 * Note Class
 * Represents a single note with all its properties
 */
export class Note {
  constructor({ id, title, content, tags = [], category = 'Uncategorized', lastEdited, isArchived = false, location = null }) {
    this.id = id || generateId();
    this.title = title || '';
    this.content = content || '';
    this.tags = Array.isArray(tags) ? tags : [];
    this.category = category || 'Uncategorized';
    this.lastEdited = lastEdited || new Date().toISOString();
    this.isArchived = isArchived;
    this.location = location;
  }

  /**
   * Archive the note
   */
  archive() {
    this.isArchived = true;
    this.lastEdited = new Date().toISOString();
    return this;
  }

  /**
   * Restore the note from archive
   */
  restore() {
    this.isArchived = false;
    this.lastEdited = new Date().toISOString();
    return this;
  }

  /**
   * Add a tag to the note
   * @param {string} tag - Tag to add
   */
  addTag(tag) {
    const trimmedTag = tag.trim();
    if (trimmedTag && !this.tags.includes(trimmedTag)) {
      this.tags.push(trimmedTag);
      this.lastEdited = new Date().toISOString();
    }
    return this;
  }

  /**
   * Remove a tag from the note
   * @param {string} tag - Tag to remove
   */
  removeTag(tag) {
    const index = this.tags.indexOf(tag);
    if (index > -1) {
      this.tags.splice(index, 1);
      this.lastEdited = new Date().toISOString();
    }
    return this;
  }

  /**
   * Update note content
   * @param {Object} updates - Object with properties to update
   */
  update(updates) {
    if (updates.title !== undefined) this.title = updates.title;
    if (updates.content !== undefined) this.content = updates.content;
    if (updates.tags !== undefined) this.tags = updates.tags;
    if (updates.category !== undefined) this.category = updates.category;
    if (updates.isArchived !== undefined) this.isArchived = updates.isArchived;
    if (updates.location !== undefined) this.location = updates.location;
    this.lastEdited = new Date().toISOString();
    return this;
  }

  /**
   * Convert note to plain object
   */
  toJSON() {
    return {
      id: this.id,
      title: this.title,
      content: this.content,
      tags: this.tags,
      category: this.category,
      lastEdited: this.lastEdited,
      isArchived: this.isArchived,
      location: this.location
    };
  }
}

// Notes state
let notes = [];
let categories = [];

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
const generateId = () => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Load initial data from JSON file
 */
const loadInitialData = async () => {
  if (initialData) return initialData;
  
  try {
    const response = await fetch('./data.json');
    if (response.ok) {
      initialData = await response.json();
    }
  } catch (error) {
    console.warn('Could not load initial data:', error);
  }
  
  return initialData;
};

/**
 * Initialize notes from storage or default data
 * @param {boolean} async - Whether to load initial data asynchronously
 */
export const initializeNotes = async () => {
  // Load categories first
  categories = loadCategories();

  const storedNotes = loadNotes();
  
  if (storedNotes && storedNotes.length > 0) {
    notes = storedNotes.map(noteData => new Note({ ...noteData, id: noteData.id || generateId() }));
  } else {
    // Try to load from data.json if no stored notes
    await loadInitialData();
    
    if (initialData && initialData.notes) {
      notes = initialData.notes.map(noteData => new Note({ ...noteData, id: generateId() }));
      saveNotes(notes.map(n => n.toJSON()));
    } else {
      notes = [];
    }
  }
  
  return notes;
};

/**
 * Get all categories
 * @returns {Array<string>} Array of categories
 */
export const getCategories = () => {
  return [...categories];
};

/**
 * Add a new category
 * @param {string} category - Category name
 * @returns {boolean} Success
 */
export const addCategory = (category) => {
  const trimmed = category.trim();
  if (trimmed && !categories.includes(trimmed)) {
    categories.push(trimmed);
    categories.sort();
    saveCategories(categories);
    return true;
  }
  return false;
};

/**
 * Delete a category
 * @param {string} category - Category name
 * @returns {boolean} Success
 */
export const deleteCategory = (category) => {
  if (category === 'Uncategorized') return false; // Prevent deleting default
  
  const index = categories.indexOf(category);
  if (index > -1) {
    categories.splice(index, 1);
    saveCategories(categories);
    
    // Move notes in this category to 'Uncategorized'
    notes.forEach(note => {
      if (note.category === category) {
        note.category = 'Uncategorized';
      }
    });
    saveNotes(notes.map(n => n.toJSON()));
    return true;
  }
  return false;
};

/**
 * Filter notes by category
 * @param {string} category - Category name
 * @returns {Array<Note>} Filtered notes
 */
export const filterByCategory = (category) => {
   return notes.filter(n => n.category === category);
};

/**
 * Get all notes
 * @param {boolean} includeArchived - Whether to include archived notes
 * @returns {Array<Note>} Array of notes
 */
export const getAllNotes = (includeArchived = true) => {
  if (includeArchived) {
    return [...notes];
  }
  return notes.filter(note => !note.isArchived);
};

/**
 * Get active (non-archived) notes
 * @returns {Array<Note>} Array of active notes
 */
export const getActiveNotes = () => {
  return notes.filter(note => !note.isArchived);
};

/**
 * Get archived notes
 * @returns {Array<Note>} Array of archived notes
 */
export const getArchivedNotes = () => {
  return notes.filter(note => note.isArchived);
};

/**
 * Get a note by ID
 * @param {string} id - Note ID
 * @returns {Note|null} Note or null if not found
 */
export const getNoteById = (id) => {
  return notes.find(note => note.id === id) || null;
};

/**
 * Create a new note
 * @param {string} title - Note title
 * @param {string} content - Note content
 * @param {Array<string>} tags - Note tags
 * @returns {Note} Created note
 */
export const createNote = (title = '', content = '', tags = []) => {
  const note = new Note({
    title,
    content,
    tags: typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(t => t) : tags
  });
  
  notes.unshift(note); // Add to beginning
  saveNotes(notes.map(n => n.toJSON()));
  
  return note;
};

/**
 * Delete a note
 * @param {string} id - Note ID
 * @returns {boolean} Success status
 */
export const deleteNote = (id) => {
  const index = notes.findIndex(note => note.id === id);
  
  if (index > -1) {
    notes.splice(index, 1);
    saveNotes(notes.map(n => n.toJSON()));
    return true;
  }
  
  return false;
};

/**
 * Update a note
 * @param {string} id - Note ID
 * @param {Object} updates - Object with properties to update
 * @returns {Note|null} Updated note or null if not found
 */
export const updateNote = (id, updates) => {
  const note = getNoteById(id);
  
  if (note) {
    // Process tags if provided as string
    if (typeof updates.tags === 'string') {
      updates.tags = updates.tags.split(',').map(t => t.trim()).filter(t => t);
    }
    
    note.update(updates);
    saveNotes(notes.map(n => n.toJSON()));
    return note;
  }
  
  return null;
};

/**
 * Archive a note
 * @param {string} id - Note ID
 * @returns {Note|null} Archived note or null if not found
 */
export const archiveNote = (id) => {
  const note = getNoteById(id);
  
  if (note) {
    note.archive();
    saveNotes(notes.map(n => n.toJSON()));
    return note;
  }
  
  return null;
};

/**
 * Restore a note from archive
 * @param {string} id - Note ID
 * @returns {Note|null} Restored note or null if not found
 */
export const restoreNote = (id) => {
  const note = getNoteById(id);
  
  if (note) {
    note.restore();
    saveNotes(notes.map(n => n.toJSON()));
    return note;
  }
  
  return null;
};

/**
 * Search notes by title, content, and tags
 * @param {string} query - Search query
 * @param {boolean} includeArchived - Whether to include archived notes
 * @returns {Array<Note>} Matching notes
 */
export const searchNotes = (query, includeArchived = false) => {
  if (!query || query.trim() === '') {
    return includeArchived ? getAllNotes() : getActiveNotes();
  }
  
  const searchTerm = query.toLowerCase().trim();
  const notesToSearch = includeArchived ? notes : notes.filter(n => !n.isArchived);
  
  return notesToSearch.filter(note => {
    const titleMatch = note.title.toLowerCase().includes(searchTerm);
    const contentMatch = note.content.toLowerCase().includes(searchTerm);
    const tagMatch = note.tags.some(tag => tag.toLowerCase().includes(searchTerm));
    
    return titleMatch || contentMatch || tagMatch;
  });
};

/**
 * Filter notes by tag
 * @param {string} tag - Tag to filter by
 * @param {boolean} includeArchived - Whether to include archived notes
 * @returns {Array<Note>} Notes with the specified tag
 */
export const filterByTag = (tag, includeArchived = false) => {
  if (!tag) {
    return includeArchived ? getAllNotes() : getActiveNotes();
  }
  
  const notesToFilter = includeArchived ? notes : notes.filter(n => !n.isArchived);
  
  return notesToFilter.filter(note => 
    note.tags.some(t => t.toLowerCase() === tag.toLowerCase())
  );
};

/**
 * Get all unique tags from all notes
 * @param {boolean} includeArchived - Whether to include tags from archived notes
 * @returns {Array<string>} Array of unique tags
 */
export const getAllTags = (includeArchived = true) => {
  const notesToProcess = includeArchived ? notes : notes.filter(n => !n.isArchived);
  const tagsSet = new Set();
  
  notesToProcess.forEach(note => {
    note.tags.forEach(tag => tagsSet.add(tag));
  });
  
  return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
};

/**
 * Sort notes by different criteria
 * @param {Array<Note>} notesToSort - Notes to sort
 * @param {string} sortBy - Sort criteria ('date', 'title', 'tags')
 * @param {string} order - Sort order ('asc', 'desc')
 * @returns {Array<Note>} Sorted notes
 */
export const sortNotes = (notesToSort, sortBy = 'date', order = 'desc') => {
  const sorted = [...notesToSort];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'tags':
        comparison = a.tags.length - b.tags.length;
        break;
      case 'date':
      default:
        comparison = new Date(a.lastEdited) - new Date(b.lastEdited);
        break;
    }
    
    return order === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
};

/**
 * Export all notes as JSON
 */
export const exportNotes = () => {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes.map(n => n.toJSON()), null, 2));
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", "notes_export_" + new Date().toISOString().slice(0, 10) + ".json");
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};

/**
 * Import notes from JSON string
 * @param {string} jsonContent - JSON string content
 * @returns {Object} Result object { success: boolean, count: number, message: string }
 */
export const importNotes = (jsonContent) => {
  try {
    const importedData = JSON.parse(jsonContent);
    
    // Validate it's an array
    if (!Array.isArray(importedData)) {
      return { success: false, message: 'Invalid format: Root must be an array of notes' };
    }

    let addedCount = 0;
    const existingIds = new Set(notes.map(n => n.id));

    importedData.forEach(item => {
      // Basic validation: must have title or content
      if (typeof item !== 'object' || (!item.title && !item.content)) {
        return;
      }

      // Prevent duplicate notes by ID
      if (item.id && existingIds.has(item.id)) {
        return;
      }

      // Create new note
      const newNote = new Note({
        id: item.id, // Note constructor will generate ID if this is missing
        title: item.title,
        content: item.content,
        tags: item.tags,
        lastEdited: item.lastEdited,
        isArchived: item.isArchived,
        location: item.location
      });
      
      notes.push(newNote);
      existingIds.add(newNote.id);
      addedCount++;
    });

    if (addedCount > 0) {
      saveNotes(notes.map(n => n.toJSON()));
      return { success: true, count: addedCount, message: `Successfully imported ${addedCount} notes.` };
    } else {
      return { success: true, count: 0, message: 'No new notes found to import.' };
    }

  } catch (e) {
    console.error('Import error:', e);
    return { success: false, message: 'Invalid JSON file.' };
  }
};

