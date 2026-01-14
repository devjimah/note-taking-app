/**
 * Main Application Module
 * Entry point - handles initialization and event listeners
 */

import * as storage from './storage.js';
import * as noteManager from './noteManager.js';
import * as ui from './ui.js';
import * as themes from './themes.js';
import * as sharing from './sharing.js';

// Application State
const state = {
  currentView: 'all', // 'all', 'archived', 'tag', 'category'
  currentTag: null,
  currentCategory: null,
  activeNoteId: null,
  isEditing: false,
  hasUnsavedChanges: false
};

// DOM Elements Cache
const elements = {};

// Mobile note viewing state
let isMobileNoteViewing = false;

/**
 * Initialize DOM element references
 */
const initElements = () => {
  // Sidebars
  elements.sidebarNav = document.getElementById('sidebarNav');
  elements.sidebarNotes = document.getElementById('sidebarNotes');
  elements.sidebarActions = document.getElementById('sidebarActions');
  
  // Navigation
  elements.navLinks = document.querySelectorAll('.nav-link[data-view]');
  elements.tagList = document.getElementById('tagList');
  elements.categoryList = document.getElementById('categoryList');
  elements.addCategoryBtn = document.getElementById('addCategoryBtn');
  elements.mobileTagList = document.getElementById('mobileTagList');
  elements.mobileNav = document.getElementById('mobileNav');
  elements.mobileNavItems = document.querySelectorAll('.mobile-nav__item[data-view]');
  
  // Page Header
  elements.pageTitle = document.getElementById('pageTitle');
  elements.searchInput = document.getElementById('searchInput');
  elements.mobileSearchInput = document.getElementById('mobileSearchInput');
  
  // Notes List
  elements.notesList = document.getElementById('notesList');
  elements.mobileNotesList = document.getElementById('mobileNotesList');
  elements.createNoteBtn = document.getElementById('createNoteBtn');
  
  // Note Editor
  elements.noteEditor = document.getElementById('noteEditor');
  elements.emptyState = document.getElementById('emptyState');
  elements.noteContent = document.getElementById('noteContent');
  elements.noteTitle = document.getElementById('noteTitle');
  elements.noteTags = document.getElementById('noteTags');
  elements.noteCategory = document.getElementById('noteCategory');
  elements.noteLastEdited = document.getElementById('noteLastEdited');
  elements.noteBody = document.getElementById('noteBody');
  
  // Action Buttons
  elements.saveNoteBtn = document.getElementById('saveNoteBtn');
  elements.cancelNoteBtn = document.getElementById('cancelNoteBtn');
  elements.archiveNoteBtn = document.getElementById('archiveNoteBtn');
  elements.deleteNoteBtn = document.getElementById('deleteNoteBtn');
  elements.shareNoteBtn = document.getElementById('shareNoteBtn');
  
  // FAB
  elements.fabCreateNote = document.getElementById('fabCreateNote');
  
  // Modals
  elements.deleteModal = document.getElementById('deleteModal');
  elements.archiveModal = document.getElementById('archiveModal');
  elements.confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  elements.confirmArchiveBtn = document.getElementById('confirmArchiveBtn');
  
  // Overlays
  elements.searchOverlay = document.getElementById('searchOverlay');
  elements.tagsOverlay = document.getElementById('tagsOverlay');
  elements.closeSearchBtn = document.getElementById('closeSearchBtn');
  elements.closeTagsBtn = document.getElementById('closeTagsBtn');
  elements.searchResults = document.getElementById('searchResults');
  
  // Toast
  elements.toast = document.getElementById('toast');
  
  // Mobile Note Header
  elements.mobileNoteHeader = document.getElementById('mobileNoteHeader');
  elements.goBackBtn = document.getElementById('goBackBtn');
  elements.mobileDeleteBtn = document.getElementById('mobileDeleteBtn');
  elements.mobileArchiveBtn = document.getElementById('mobileArchiveBtn');
  elements.mobileCancelBtn = document.getElementById('mobileCancelBtn');
  elements.mobileSaveBtn = document.getElementById('mobileSaveBtn');
};

/**
 * Get notes based on current view
 */
const getNotesForCurrentView = () => {
  let notes;
  
  switch (state.currentView) {
    case 'archived':
      notes = noteManager.getArchivedNotes();
      break;
    case 'tag':
      notes = noteManager.filterByTag(state.currentTag, false);
      break;
    case 'category':
      notes = noteManager.filterByCategory(state.currentCategory);
      break;
    case 'all':
    default:
      notes = noteManager.getActiveNotes();
      break;
  }
  
  return noteManager.sortNotes(notes, 'date', 'desc');
};

/**
 * Check if we're in mobile view
 */
const isMobileView = () => {
  return window.innerWidth <= 1024;
};

/**
 * Enter mobile note viewing mode
 */
const enterMobileNoteView = () => {
  if (!isMobileView()) return;
  
  isMobileNoteViewing = true;
  document.getElementById('app')?.classList.add('note-viewing');
  elements.noteEditor?.classList.add('note-viewing');
  
  // Show mobile header
  if (elements.mobileNoteHeader) {
    elements.mobileNoteHeader.hidden = false;
  }
};

/**
 * Exit mobile note viewing mode (go back to notes list)
 */
const exitMobileNoteView = () => {
  isMobileNoteViewing = false;
  document.getElementById('app')?.classList.remove('note-viewing');
  elements.noteEditor?.classList.remove('note-viewing');
  
  // Hide mobile header
  if (elements.mobileNoteHeader) {
    elements.mobileNoteHeader.hidden = true;
  }
  
  // Deselect note and show notes list
  state.activeNoteId = null;
  state.hasUnsavedChanges = false;
  ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
  ui.toggleSidebarActions(false, elements.sidebarActions);
  
  renderNotesList();
};

/**
 * Update mobile archive button based on note status
 */
const updateMobileArchiveButton = (isArchived) => {
  if (!elements.mobileArchiveBtn) return;
  
  const icon = elements.mobileArchiveBtn.querySelector('img');
  
  if (isArchived) {
    if (icon) icon.src = './assets/images/icon-restore.svg';
    elements.mobileArchiveBtn.setAttribute('aria-label', 'Restore note');
  } else {
    if (icon) icon.src = './assets/images/icon-archive.svg';
    elements.mobileArchiveBtn.setAttribute('aria-label', 'Archive note');
  }
};

/**
 * Render the notes list
 */
const renderNotesList = () => {
  const notes = getNotesForCurrentView();
  ui.renderAllNotes(notes, state.activeNoteId, elements.notesList);
  
  // Also render in mobile list if in mobile view
  if (isMobileView() && elements.mobileNotesList) {
    ui.renderAllNotes(notes, state.activeNoteId, elements.mobileNotesList);
  }
};

/**
 * Render the tags list
 */
const renderTagsList = () => {
  const tags = noteManager.getAllTags(true);
  ui.renderTagList(tags, state.currentTag, elements.tagList);
  
  if (elements.mobileTagList) {
    ui.renderTagList(tags, state.currentTag, elements.mobileTagList);
  }
};

/**
 * Render the categories list
 */
const renderCategoryList = () => {
   const categories = noteManager.getCategories();
   ui.renderCategoryList(categories, state.currentCategory, elements.categoryList);
   
   // Update the select dropdown in note editor
   if (elements.noteCategory) {
       const currentVal = elements.noteCategory.value;
       elements.noteCategory.innerHTML = categories.map(c => 
           `<option value="${escapeHTML(c)}">${escapeHTML(c)}</option>`
       ).join('');
       
       // Restore value if it exists in the new list, otherwise default is 'Uncategorized' (first usually if Uncategorized is first)
       // Uncategorized should be available.
       if (categories.includes(currentVal)) {
           elements.noteCategory.value = currentVal;
       } else {
           elements.noteCategory.value = 'Uncategorized';
       }
   }
};

/**
 * Select a note for viewing/editing
 */
const selectNote = (noteId) => {
  // Check for unsaved changes
  if (state.hasUnsavedChanges) {
    const confirmLeave = confirm('You have unsaved changes. Do you want to discard them?');
    if (!confirmLeave) return;
  }
  
  state.activeNoteId = noteId;
  state.hasUnsavedChanges = false;
  
  const note = noteManager.getNoteById(noteId);
  
  if (note) {
    ui.renderNoteContent(note, {
      titleInput: elements.noteTitle,
      tagsInput: elements.noteTags,
      lastEditedSpan: elements.noteLastEdited,
      bodyTextarea: elements.noteBody,
      categorySelect: elements.noteCategory
    });
    
    ui.toggleEmptyState(false, elements.emptyState, elements.noteContent);
    ui.toggleSidebarActions(true, elements.sidebarActions);
    
    // Update archive button text based on note status
    updateArchiveButton(note.isArchived);
    updateMobileArchiveButton(note.isArchived);
    
    // Enter mobile note viewing mode if on mobile/tablet
    enterMobileNoteView();
  } else {
    ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
    ui.toggleSidebarActions(false, elements.sidebarActions);
  }
  
  renderNotesList();
};

/**
 * Update archive button based on note status
 */
const updateArchiveButton = (isArchived) => {
  if (!elements.archiveNoteBtn) return;
  
  const icon = elements.archiveNoteBtn.querySelector('img');
  const text = elements.archiveNoteBtn.querySelector('span');
  
  if (isArchived) {
    if (icon) icon.src = './assets/images/icon-restore.svg';
    if (text) text.textContent = 'Restore Note';
  } else {
    if (icon) icon.src = './assets/images/icon-archive.svg';
    if (text) text.textContent = 'Archive Note';
  }
};

/**
 * Handle Go Back button click (mobile/tablet)
 */
const handleGoBack = () => {
  // Check for unsaved changes
  if (state.hasUnsavedChanges) {
    const confirmLeave = confirm('You have unsaved changes. Do you want to discard them?');
    if (!confirmLeave) return;
  }
  
  // If it's a new empty note, delete it
  const note = noteManager.getNoteById(state.activeNoteId);
  if (note && !note.title && !note.content) {
    noteManager.deleteNote(state.activeNoteId);
  }
  
  exitMobileNoteView();
};

/**
 * Handle mobile Cancel button click
 */
const handleMobileCancel = () => {
  cancelEditing();
  
  // Exit mobile view after canceling
  if (isMobileView()) {
    exitMobileNoteView();
  }
};

/**
 * Handle mobile Save button click
 */
const handleMobileSave = () => {
  saveCurrentNote();
};

/**
 * Create a new note
 */
const createNewNote = () => {
  // Check for unsaved changes
  if (state.hasUnsavedChanges) {
    const confirmLeave = confirm('You have unsaved changes. Do you want to discard them?');
    if (!confirmLeave) return;
  }
  
  const note = noteManager.createNote('', '', []);
  state.activeNoteId = note.id;
  state.isEditing = true;
  state.hasUnsavedChanges = false;
  
  // Render empty note content
  ui.renderNoteContent(note, {
    titleInput: elements.noteTitle,
    tagsInput: elements.noteTags,
    lastEditedSpan: elements.noteLastEdited,
    bodyTextarea: elements.noteBody,
    categorySelect: elements.noteCategory
  });
  
  ui.toggleEmptyState(false, elements.emptyState, elements.noteContent);
  ui.toggleSidebarActions(true, elements.sidebarActions);
  
  // Update mobile archive button for new note (not archived)
  updateMobileArchiveButton(false);
  
  // Enter mobile note viewing mode if on mobile/tablet
  enterMobileNoteView();
  
  renderNotesList();
  renderTagsList();
  renderCategoryList();
  
  // Focus on title input
  if (elements.noteTitle) {
    elements.noteTitle.focus();
  }
};

/**
 * Save the current note
 */
const saveCurrentNote = () => {
  if (!state.activeNoteId) return;
  
  const title = elements.noteTitle?.value.trim() || '';
  const content = elements.noteBody?.value || '';
  const tags = elements.noteTags?.value || '';
  const category = elements.noteCategory?.value || 'Uncategorized';
  
  // Validate
  if (!title) {
    ui.showValidationError(elements.noteTitle, 'Title is required');
    elements.noteTitle?.focus();
    return;
  }
  
  ui.hideValidationError(elements.noteTitle);
  
  // Update note
  const updatedNote = noteManager.updateNote(state.activeNoteId, {
    title,
    content,
    tags,
    category
  });
  
  if (updatedNote) {
    state.hasUnsavedChanges = false;
    
    // Update last edited display
    if (elements.noteLastEdited) {
      elements.noteLastEdited.textContent = ui.formatDate(updatedNote.lastEdited);
    }
    
    renderNotesList();
    renderTagsList();
    renderCategoryList();
    
    ui.showToast('Note saved successfully!', 'success');
  }
};

/**
 * Cancel editing and discard changes
 */
const cancelEditing = () => {
  if (state.hasUnsavedChanges) {
    const confirmCancel = confirm('Are you sure you want to discard your changes?');
    if (!confirmCancel) return;
  }
  
  // If it's a new empty note, delete it
  const note = noteManager.getNoteById(state.activeNoteId);
  if (note && !note.title && !note.content) {
    noteManager.deleteNote(state.activeNoteId);
    state.activeNoteId = null;
  }
  
  state.hasUnsavedChanges = false;
  
  // Reload note content or show empty state
  if (state.activeNoteId) {
    selectNote(state.activeNoteId);
  } else {
    ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
    ui.toggleSidebarActions(false, elements.sidebarActions);
  }
  
  renderNotesList();
};

/**
 * Archive/Restore the current note
 */
const toggleArchiveNote = () => {
  if (!state.activeNoteId) return;
  
  const note = noteManager.getNoteById(state.activeNoteId);
  if (!note) return;
  
  if (note.isArchived) {
    // Restore note
    noteManager.restoreNote(state.activeNoteId);
    ui.showToast('Note restored to active notes.', 'success', 3000, { text: 'All Notes', href: '#' });
    
    // Update UI
    updateArchiveButton(false);
    updateMobileArchiveButton(false);
    renderNotesList();
    renderTagsList();
    
    // If viewing archived notes and restoring, deselect and exit mobile view
    if (state.currentView === 'archived') {
      state.activeNoteId = null;
      ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
      ui.toggleSidebarActions(false, elements.sidebarActions);
      
      if (isMobileView()) {
        exitMobileNoteView();
      }
    }
  } else {
    // Show confirmation modal
    ui.showModal(elements.archiveModal);
  }
};

/**
 * Confirm archive action
 */
const confirmArchive = () => {
  if (!state.activeNoteId) return;
  
  noteManager.archiveNote(state.activeNoteId);
  ui.hideModal(elements.archiveModal);
  ui.showToast('Note archived.', 'success', 3000, { text: 'Archived Notes', href: '#' });
  
  // Deselect note after archiving
  state.activeNoteId = null;
  ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
  ui.toggleSidebarActions(false, elements.sidebarActions);
  
  // Exit mobile view after archiving
  if (isMobileView()) {
    exitMobileNoteView();
  }
  
  renderNotesList();
  renderTagsList();
};

/**
 * Delete the current note
 */
const deleteCurrentNote = () => {
  if (!state.activeNoteId) return;
  
  // Show confirmation modal
  ui.showModal(elements.deleteModal);
};

/**
 * Share the current note
 */
const shareCurrentNote = async () => {
  if (!state.activeNoteId) return;
  
  const note = noteManager.getNoteById(state.activeNoteId);
  if (!note) return;
  
  // Check if note has content
  if (!note.title) {
    ui.showToast('Please add a title before sharing', 'error');
    return;
  }
  
  // Save note first to ensure latest content is shared
  saveCurrentNote();
  
  // Share and copy link
  await sharing.shareNoteAndCopy(note);
};

/**
 * Confirm delete action
 */
const confirmDelete = () => {
  if (!state.activeNoteId) return;
  
  noteManager.deleteNote(state.activeNoteId);
  ui.hideModal(elements.deleteModal);
  ui.showToast('Note permanently deleted.', 'success');
  
  state.activeNoteId = null;
  state.hasUnsavedChanges = false;
  
  ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
  ui.toggleSidebarActions(false, elements.sidebarActions);
  
  // Exit mobile view after deleting
  if (isMobileView()) {
    exitMobileNoteView();
  }
  
  renderNotesList();
  renderTagsList();
};

/**
 * Handle search input
 */
const handleSearch = ui.debounce((query) => {
  if (!query.trim()) {
    renderNotesList();
    return;
  }
  
  const includeArchived = state.currentView === 'archived';
  const results = noteManager.searchNotes(query, includeArchived);
  
  ui.renderAllNotes(results, state.activeNoteId, elements.notesList);
}, 300);

/**
 * Handle mobile search
 */
const handleMobileSearch = ui.debounce((query) => {
  if (!query.trim()) {
    if (elements.searchResults) {
      elements.searchResults.innerHTML = '<p class="empty-state__text">Start typing to search...</p>';
    }
    return;
  }
  
  const results = noteManager.searchNotes(query, true);
  ui.renderSearchResults(results, query, elements.searchResults);
}, 300);

/**
 * Change view (All Notes, Archived, Tag, Category)
 */
const changeView = (view, filterValue = null) => {
  state.currentView = view;
  state.currentTag = view === 'tag' ? filterValue : null;
  state.currentCategory = view === 'category' ? filterValue : null;
  
  // Update page title
  if (elements.pageTitle) {
    switch (view) {
      case 'archived':
        elements.pageTitle.textContent = 'Archived Notes';
        break;
      case 'tag':
        elements.pageTitle.textContent = filterValue ? `Tag: ${filterValue}` : 'Tagged Notes';
        break;
      case 'category':
        elements.pageTitle.textContent = filterValue || 'Category';
        break;
      default:
        elements.pageTitle.textContent = 'All Notes';
    }
  }
  
  // Update navigation active states
  ui.updateNavActiveState(view, elements.navLinks);
  
  // Update Category active state manually as it's not in standard navLinks
  if (elements.categoryList) {
      const links = elements.categoryList.querySelectorAll('.nav-link');
      links.forEach(l => {
          const isActive = view === 'category' && l.dataset.category === filterValue;
          l.classList.toggle('nav-link--active', isActive);
          l.setAttribute('aria-pressed', isActive);
      });
  }

  ui.updateMobileNavActiveState(view, elements.mobileNavItems);
  
  // Clear search
  if (elements.searchInput) elements.searchInput.value = '';
  
  // Deselect current note
  state.activeNoteId = null;
  ui.toggleEmptyState(true, elements.emptyState, elements.noteContent);
  ui.toggleSidebarActions(false, elements.sidebarActions);
  
  renderNotesList();
  renderTagsList();
  renderCategoryList();
};

/**
 * Set up event listeners
 */
const setupEventListeners = () => {
  // Navigation links
  elements.navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const view = link.dataset.view;
      changeView(view);
    });
  });
  
  // Mobile navigation
  elements.mobileNavItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const view = item.dataset.view;
      if (view) {
        e.preventDefault();
        changeView(view);
      }
    });
  });
  
  // Mobile actions (search, tags)
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = btn.dataset.action;
      
      if (action === 'search') {
        elements.searchOverlay.hidden = false;
        elements.mobileSearchInput?.focus();
      } else if (action === 'tags') {
        elements.tagsOverlay.hidden = false;
      }
    });
  });
  
  // Close overlays
  elements.closeSearchBtn?.addEventListener('click', () => {
    elements.searchOverlay.hidden = true;
    if (elements.mobileSearchInput) elements.mobileSearchInput.value = '';
  });
  
  elements.closeTagsBtn?.addEventListener('click', () => {
    elements.tagsOverlay.hidden = true;
  });
  
  // Tag list clicks (event delegation)
  elements.tagList?.addEventListener('click', (e) => {
    const tagItem = e.target.closest('.tag-item');
    if (tagItem) {
      const tag = tagItem.dataset.tag;
      changeView('tag', tag);
    }
  });
  
  elements.mobileTagList?.addEventListener('click', (e) => {
    const tagItem = e.target.closest('.tag-item');
    if (tagItem) {
      const tag = tagItem.dataset.tag;
      changeView('tag', tag);
      elements.tagsOverlay.hidden = true;
    }
  });

  // Category list clicks (event delegation)
  elements.categoryList?.addEventListener('click', (e) => {
    // Check if delete button
    const deleteBtn = e.target.closest('.delete-category-btn');
    if (deleteBtn) {
        e.stopPropagation(); 
        const category = deleteBtn.dataset.category;
        if (confirm(`Delete category "${category}"? Notes will be moved to Uncategorized.`)) {
            noteManager.deleteCategory(category);
            renderCategoryList();
            // If current view was this category, switch to all
            if (state.currentView === 'category' && state.currentCategory === category) {
                changeView('all');
            } else {
                renderNotesList(); 
            }
        }
        return;
    }

    const navLink = e.target.closest('.nav-link');
    if (navLink) {
        const category = navLink.dataset.category;
        changeView('category', category); 
    }
  });

  // Add category button
  elements.addCategoryBtn?.addEventListener('click', () => {
    const category = prompt('Enter new category name:');
    if (category) {
        if (noteManager.addCategory(category)) {
            renderCategoryList();
        } else {
            alert('Category already exists, invalid, or empty.');
        }
    }
  });
  
  // Notes list clicks (event delegation)
  const handleNoteClick = (e) => {
    const noteItem = e.target.closest('.note-item');
    if (noteItem) {
      const noteId = noteItem.dataset.noteId;
      selectNote(noteId);
    }
  };
  
  elements.notesList?.addEventListener('click', handleNoteClick);
  elements.mobileNotesList?.addEventListener('click', handleNoteClick);
  
  // Keyboard navigation for notes list
  const handleNoteKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const noteItem = e.target.closest('.note-item');
      if (noteItem) {
        e.preventDefault();
        const noteId = noteItem.dataset.noteId;
        selectNote(noteId);
      }
    }
  };
  
  elements.notesList?.addEventListener('keydown', handleNoteKeydown);
  elements.mobileNotesList?.addEventListener('keydown', handleNoteKeydown);
  
  // Search results clicks
  elements.searchResults?.addEventListener('click', (e) => {
    const noteItem = e.target.closest('.note-item');
    if (noteItem) {
      const noteId = noteItem.dataset.noteId;
      elements.searchOverlay.hidden = true;
      selectNote(noteId);
    }
  });
  
  // Create note buttons
  elements.createNoteBtn?.addEventListener('click', createNewNote);
  elements.fabCreateNote?.addEventListener('click', createNewNote);
  
  // Save/Cancel buttons
  elements.saveNoteBtn?.addEventListener('click', saveCurrentNote);
  elements.cancelNoteBtn?.addEventListener('click', cancelEditing);
  
  // Archive/Delete/Share buttons
  elements.archiveNoteBtn?.addEventListener('click', toggleArchiveNote);
  elements.deleteNoteBtn?.addEventListener('click', deleteCurrentNote);
  elements.shareNoteBtn?.addEventListener('click', shareCurrentNote);
  
  // Mobile header buttons
  elements.goBackBtn?.addEventListener('click', handleGoBack);
  elements.mobileDeleteBtn?.addEventListener('click', deleteCurrentNote);
  elements.mobileArchiveBtn?.addEventListener('click', toggleArchiveNote);
  elements.mobileCancelBtn?.addEventListener('click', handleMobileCancel);
  elements.mobileSaveBtn?.addEventListener('click', handleMobileSave);
  
  // Modal confirmations
  elements.confirmDeleteBtn?.addEventListener('click', confirmDelete);
  elements.confirmArchiveBtn?.addEventListener('click', confirmArchive);
  
  // Modal close buttons
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal');
      if (modal) ui.hideModal(modal);
    });
  });
  
  // Search inputs
  elements.searchInput?.addEventListener('input', (e) => {
    handleSearch(e.target.value);
  });
  
  elements.mobileSearchInput?.addEventListener('input', (e) => {
    handleMobileSearch(e.target.value);
  });
  
  // Track changes in note editor
  const trackChanges = () => {
    state.hasUnsavedChanges = true;
  };
  
  elements.noteTitle?.addEventListener('input', trackChanges);
  elements.noteTags?.addEventListener('input', trackChanges);
  elements.noteBody?.addEventListener('input', trackChanges);
  elements.noteCategory?.addEventListener('change', trackChanges);
  
  // Auto-save draft on input
  const saveDraft = ui.debounce(() => {
    if (state.activeNoteId && state.hasUnsavedChanges) {
      storage.saveDraft({
        id: state.activeNoteId,
        title: elements.noteTitle?.value || '',
        content: elements.noteBody?.value || '',
        tags: elements.noteTags?.value || ''
      });
    }
  }, 1000);
  
  elements.noteTitle?.addEventListener('input', saveDraft);
  elements.noteTags?.addEventListener('input', saveDraft);
  elements.noteBody?.addEventListener('input', saveDraft);
  
  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      if (state.activeNoteId) {
        saveCurrentNote();
      }
    }
    
    // Ctrl/Cmd + N to create new note
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      createNewNote();
    }
    
    // Escape to close modals/overlays
    if (e.key === 'Escape') {
      if (!elements.searchOverlay?.hidden) {
        elements.searchOverlay.hidden = true;
      }
      if (!elements.tagsOverlay?.hidden) {
        elements.tagsOverlay.hidden = true;
      }
    }
  });
  
  // Warn before leaving with unsaved changes
  window.addEventListener('beforeunload', (e) => {
    if (state.hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  });
  
  // Handle window resize for responsive behavior
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // If resizing from mobile to desktop while viewing a note, clean up mobile state
      if (!isMobileView() && isMobileNoteViewing) {
        isMobileNoteViewing = false;
        document.getElementById('app')?.classList.remove('note-viewing');
        elements.noteEditor?.classList.remove('note-viewing');
        if (elements.mobileNoteHeader) {
          elements.mobileNoteHeader.hidden = true;
        }
      }
      
      // If resizing from desktop to mobile while a note is selected, enter mobile view
      if (isMobileView() && state.activeNoteId && !isMobileNoteViewing) {
        enterMobileNoteView();
      }
      
      renderNotesList();
    }, 250);
  });
};

/**
 * Restore draft if available
 */
const restoreDraft = () => {
  const draft = storage.loadDraft();
  
  if (draft && draft.id) {
    const note = noteManager.getNoteById(draft.id);
    
    if (note) {
      // Restore draft content
      if (elements.noteTitle) elements.noteTitle.value = draft.title || '';
      if (elements.noteTags) elements.noteTags.value = draft.tags || '';
      if (elements.noteBody) elements.noteBody.value = draft.content || '';
      
      state.activeNoteId = draft.id;
      state.hasUnsavedChanges = true;
      
      ui.toggleEmptyState(false, elements.emptyState, elements.noteContent);
      ui.toggleSidebarActions(true, elements.sidebarActions);
      
      ui.showToast('Draft restored', 'info');
      storage.clearDraft();
    }
  }
};

/**
 * Check authentication and redirect if not logged in
 * @returns {boolean} True if authenticated, false otherwise
 */
const checkAuth = () => {
  if (!storage.isAuthenticated()) {
    // Redirect to login page
    window.location.href = './auth/login.html';
    return false;
  }
  return true;
};

/**
 * Initialize the application
 */
const init = async () => {
  // Check storage availability
  if (!storage.isStorageAvailable()) {
    console.warn('localStorage is not available. Data will not persist.');
  }
  
  // Check authentication first - redirect to login if not authenticated
  if (!checkAuth()) {
    return; // Stop initialization if not authenticated
  }
  
  // Initialize themes
  themes.initializeThemes();
  
  // Initialize DOM elements
  initElements();
  
  // Initialize notes (async)
  await noteManager.initializeNotes();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initial render
  renderNotesList();
  renderTagsList();
  renderCategoryList();
  
  // Restore draft if available
  restoreDraft();
  
  // Check URL params for initial view
  const urlParams = new URLSearchParams(window.location.search);
  const viewParam = urlParams.get('view');
  const tagParam = urlParams.get('tag');
  
  if (viewParam === 'archived') {
    changeView('archived');
  } else if (tagParam) {
    changeView('tag', tagParam);
  }
  
  console.log('Notes app initialized');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

