/**
 * Categories Module
 * Handles note categories/folders management
 */

import { saveNotes, loadNotes } from './storage.js';

// Storage key for categories
const CATEGORIES_KEY = 'notes_app_categories';

// Default categories
const DEFAULT_CATEGORIES = [
  { id: 'personal', name: 'Personal', color: '#335cff' },
  { id: 'work', name: 'Work', color: '#21c55d' },
  { id: 'ideas', name: 'Ideas', color: '#f59e0b' }
];

/**
 * Load categories from localStorage
 * @returns {Array} Array of category objects
 */
export const loadCategories = () => {
  try {
    const stored = localStorage.getItem(CATEGORIES_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    // Initialize with default categories
    saveCategories(DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  } catch (error) {
    console.error('Error loading categories:', error);
    return DEFAULT_CATEGORIES;
  }
};

/**
 * Save categories to localStorage
 * @param {Array} categories - Array of category objects
 * @returns {boolean} Success status
 */
export const saveCategories = (categories) => {
  try {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error saving categories:', error);
    return false;
  }
};

/**
 * Generate unique category ID
 * @returns {string} Unique ID
 */
const generateCategoryId = () => {
  return `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Create a new category
 * @param {string} name - Category name
 * @param {string} color - Category color (hex)
 * @returns {Object} Created category
 */
export const createCategory = (name, color = '#717784') => {
  const categories = loadCategories();
  
  // Check for duplicate names
  const exists = categories.some(
    cat => cat.name.toLowerCase() === name.toLowerCase()
  );
  
  if (exists) {
    throw new Error('A category with this name already exists');
  }
  
  const newCategory = {
    id: generateCategoryId(),
    name: name.trim(),
    color: color
  };
  
  categories.push(newCategory);
  saveCategories(categories);
  
  return newCategory;
};

/**
 * Update a category
 * @param {string} categoryId - Category ID
 * @param {Object} updates - Updates to apply
 * @returns {Object|null} Updated category or null
 */
export const updateCategory = (categoryId, updates) => {
  const categories = loadCategories();
  const index = categories.findIndex(cat => cat.id === categoryId);
  
  if (index === -1) {
    return null;
  }
  
  // Check for duplicate names if name is being updated
  if (updates.name) {
    const duplicate = categories.some(
      cat => cat.id !== categoryId && 
             cat.name.toLowerCase() === updates.name.toLowerCase()
    );
    if (duplicate) {
      throw new Error('A category with this name already exists');
    }
  }
  
  categories[index] = { ...categories[index], ...updates };
  saveCategories(categories);
  
  return categories[index];
};

/**
 * Delete a category
 * @param {string} categoryId - Category ID
 * @returns {boolean} Success status
 */
export const deleteCategory = (categoryId) => {
  const categories = loadCategories();
  const index = categories.findIndex(cat => cat.id === categoryId);
  
  if (index === -1) {
    return false;
  }
  
  categories.splice(index, 1);
  saveCategories(categories);
  
  // Also remove this category from all notes
  removeCategoryFromAllNotes(categoryId);
  
  return true;
};

/**
 * Get a category by ID
 * @param {string} categoryId - Category ID
 * @returns {Object|null} Category object or null
 */
export const getCategoryById = (categoryId) => {
  const categories = loadCategories();
  return categories.find(cat => cat.id === categoryId) || null;
};

/**
 * Get a category by name
 * @param {string} name - Category name
 * @returns {Object|null} Category object or null
 */
export const getCategoryByName = (name) => {
  const categories = loadCategories();
  return categories.find(
    cat => cat.name.toLowerCase() === name.toLowerCase()
  ) || null;
};

/**
 * Get all categories
 * @returns {Array} Array of category objects
 */
export const getAllCategories = () => {
  return loadCategories();
};

/**
 * Remove category from all notes
 * @param {string} categoryId - Category ID to remove
 */
const removeCategoryFromAllNotes = (categoryId) => {
  const notes = loadNotes();
  if (!notes) return;
  
  let modified = false;
  notes.forEach(note => {
    if (note.category === categoryId) {
      note.category = null;
      modified = true;
    }
  });
  
  if (modified) {
    saveNotes(notes);
  }
};

/**
 * Get notes count per category
 * @param {Array} notes - Array of notes
 * @returns {Object} Object mapping category IDs to counts
 */
export const getNotesCountByCategory = (notes) => {
  const counts = { uncategorized: 0 };
  const categories = loadCategories();
  
  // Initialize counts for all categories
  categories.forEach(cat => {
    counts[cat.id] = 0;
  });
  
  // Count notes per category
  notes.forEach(note => {
    if (note.category && counts[note.category] !== undefined) {
      counts[note.category]++;
    } else {
      counts.uncategorized++;
    }
  });
  
  return counts;
};

/**
 * Predefined colors for categories
 */
export const CATEGORY_COLORS = [
  { name: 'Blue', value: '#335cff' },
  { name: 'Green', value: '#21c55d' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#fb3748' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Gray', value: '#717784' }
];
