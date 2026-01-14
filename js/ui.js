/**
 * UI Module
 * Handles all UI rendering and DOM manipulation
 */

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const options = { day: '2-digit', month: 'short', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
};

/**
 * Render a single note item in the notes list
 * @param {Object} note - Note object
 * @param {boolean} isActive - Whether this note is currently selected
 * @returns {string} HTML string for the note item
 */
export const renderNoteItem = (note, isActive = false) => {
  const tagsHTML = note.tags.map(tag => 
    `<span class="note-item__tag">${escapeHTML(tag)}</span>`
  ).join('');

  const categoryHTML = note.category && note.category !== 'Uncategorized' 
      ? `<span class="note-item__tag note-item__tag--category" style="background-color: var(--color-primary-light); color: var(--color-primary); border: 1px solid var(--color-primary);">${escapeHTML(note.category)}</span>` 
      : '';

  return `
    <article 
      class="note-item ${isActive ? 'note-item--active' : ''}" 
      data-note-id="${note.id}"
      role="listitem"
      tabindex="0"
      aria-label="Note: ${escapeHTML(note.title)}"
    >
      <h3 class="note-item__title">${escapeHTML(note.title) || 'Untitled'}</h3>
      <div class="note-item__tags" aria-label="Tags">
        ${categoryHTML}
        ${tagsHTML}
      </div>
      <time class="note-item__date" datetime="${note.lastEdited}">
        ${formatDate(note.lastEdited)}
      </time>
    </article>
  `;
};

/**
 * Render all notes in the notes list
 * @param {Array} notes - Array of note objects
 * @param {string} activeNoteId - ID of the currently active note
 * @param {HTMLElement} container - Container element for notes list
 */
export const renderAllNotes = (notes, activeNoteId, container) => {
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">No notes yet. Create your first note!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map(note => 
    renderNoteItem(note, note.id === activeNoteId)
  ).join('');
};

/**
 * Render note content in the editor
 * @param {Object} note - Note object
 * @param {Object} elements - Object containing DOM elements
 */
export const renderNoteContent = (note, elements) => {
  const { titleInput, tagsInput, lastEditedSpan, bodyTextarea, categorySelect } = elements;

  if (!note) {
    if (titleInput) titleInput.value = '';
    if (tagsInput) tagsInput.value = '';
    if (lastEditedSpan) lastEditedSpan.textContent = '—';
    // Handle both textarea and contenteditable div
    if (bodyTextarea) {
      if (bodyTextarea.tagName === 'TEXTAREA') {
        bodyTextarea.value = '';
      } else {
        bodyTextarea.innerHTML = '';
      }
    }
    if (categorySelect) categorySelect.value = 'Uncategorized';
    return;
  }

  if (titleInput) titleInput.value = note.title || '';
  if (tagsInput) tagsInput.value = note.tags.join(', ');
  if (lastEditedSpan) lastEditedSpan.textContent = formatDate(note.lastEdited);
  // Handle both textarea and contenteditable div
  if (bodyTextarea) {
    if (bodyTextarea.tagName === 'TEXTAREA') {
      bodyTextarea.value = note.content || '';
    } else {
      // For contenteditable, set innerHTML to preserve formatting
      bodyTextarea.innerHTML = note.content || '';
    }
  }
  if (categorySelect) categorySelect.value = note.category || 'Uncategorized';
};

/**
 * Show validation error on a field
 * @param {HTMLElement} field - Input element
 * @param {string} message - Error message
 */
export const showValidationError = (field, message) => {
  // Remove any existing error
  hideValidationError(field);

  // Add error class
  field.classList.add('is-invalid');
  field.setAttribute('aria-invalid', 'true');

  // Create error message element
  const errorEl = document.createElement('span');
  errorEl.className = 'validation-error';
  errorEl.id = `${field.id}-error`;
  errorEl.textContent = message;
  errorEl.setAttribute('role', 'alert');

  // Insert after field
  field.parentNode.insertBefore(errorEl, field.nextSibling);
  field.setAttribute('aria-describedby', errorEl.id);
};

/**
 * Hide validation error on a field
 * @param {HTMLElement} field - Input element
 */
export const hideValidationError = (field) => {
  field.classList.remove('is-invalid');
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');

  const errorEl = field.parentNode.querySelector('.validation-error');
  if (errorEl) {
    errorEl.remove();
  }
};

/**
 * Render tag list in sidebar
 * @param {Array} tags - Array of tag strings
 * @param {string} activeTag - Currently active/selected tag
 * @param {HTMLElement} container - Container element for tag list
 */
export const renderTagList = (tags, activeTag, container) => {
  if (!container) return;

  if (tags.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = tags.map(tag => `
    <li>
      <button 
        class="tag-item ${tag === activeTag ? 'tag-item--active' : ''}" 
        data-tag="${escapeHTML(tag)}"
        aria-pressed="${tag === activeTag}"
      >
        <img src="./assets/images/icon-tag.svg" alt="" class="tag-item__icon" aria-hidden="true">
        <span class="tag-item__text">${escapeHTML(tag)}</span>
      </button>
    </li>
  `).join('');
};

/**
 * Render category list in sidebar
 * @param {Array} categories - Array of category strings
 * @param {string} activeCategory - Currently active/selected category
 * @param {HTMLElement} container - Container element for category list
 */
export const renderCategoryList = (categories, activeCategory, container) => {
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = '<li><span style="padding: 0.5rem; color: var(--color-text-secondary); font-size: 0.8rem;">No categories</span></li>';
    return;
  }

  container.innerHTML = categories.map(category => `
    <li style="display: flex; align-items: center; justify-content: space-between;">
      <button 
        class="nav-link ${category === activeCategory ? 'nav-link--active' : ''}" 
        data-category="${escapeHTML(category)}"
        aria-pressed="${category === activeCategory}"
        style="flex: 1;"
      >
        <img src="./assets/images/icon-tag.svg" alt="" class="nav-link__icon" aria-hidden="true" style="width: 16px; height: 16px;">
        <span class="nav-link__text">${escapeHTML(category)}</span>
      </button>
      ${category !== 'Uncategorized' ? `
      <button class="btn btn--icon delete-category-btn" data-category="${escapeHTML(category)}" aria-label="Delete ${escapeHTML(category)}" style="padding: 0.25rem;">
         <img src="./assets/images/icon-delete.svg" alt="" style="width: 14px; height: 14px; opacity: 0.5;">
      </button>` : ''}
    </li>
  `).join('');
};

/**
 * Toggle archive view
 * @param {boolean} isArchiveView - Whether to show archive view
 * @param {Object} elements - Object containing DOM elements
 */
export const toggleArchiveView = (isArchiveView, elements) => {
  const { pageTitle, archiveBtn } = elements;

  if (pageTitle) {
    pageTitle.textContent = isArchiveView ? 'Archived Notes' : 'All Notes';
  }

  if (archiveBtn) {
    const icon = archiveBtn.querySelector('img');
    const text = archiveBtn.querySelector('span');
    
    if (isArchiveView) {
      if (icon) icon.src = './assets/images/icon-restore.svg';
      if (text) text.textContent = 'Restore Note';
    } else {
      if (icon) icon.src = './assets/images/icon-archive.svg';
      if (text) text.textContent = 'Archive Note';
    }
  }
};

/**
 * Show/hide empty state
 * @param {boolean} show - Whether to show empty state
 * @param {HTMLElement} emptyState - Empty state element
 * @param {HTMLElement} noteContent - Note content element
 */
export const toggleEmptyState = (show, emptyState, noteContent) => {
  if (emptyState) emptyState.hidden = !show;
  if (noteContent) noteContent.hidden = show;
};

/**
 * Show/hide sidebar actions
 * @param {boolean} show - Whether to show actions
 * @param {HTMLElement} sidebarActions - Sidebar actions element
 */
export const toggleSidebarActions = (show, sidebarActions) => {
  if (sidebarActions) sidebarActions.hidden = !show;
};

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {string} type - Toast type ('success', 'error', 'info')
 * @param {number} duration - Duration in ms
 * @param {Object} link - Optional link object { text: string, href: string }
 */
export const showToast = (message, type = 'success', duration = 3000, link = null) => {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');
  const toastLink = document.getElementById('toastLink');
  const toastClose = document.getElementById('toastClose');

  if (!toast || !toastMessage) return;

  // Set icon based on type
  const iconMap = {
    success: './assets/images/icon-check-circle.svg',
    error: './assets/images/icon-cross.svg',
    info: './assets/images/icon-info.svg'
  };

  if (toastIcon) {
    toastIcon.src = iconMap[type] || iconMap.info;
  }

  // Set toast type class for styling
  toast.className = 'toast';
  if (type === 'success') {
    toast.classList.add('toast--success');
  }

  toastMessage.textContent = message;
  
  // Handle optional link
  if (toastLink) {
    if (link && link.text && link.href) {
      toastLink.textContent = link.text;
      toastLink.href = link.href;
      toastLink.hidden = false;
    } else {
      toastLink.hidden = true;
    }
  }

  toast.hidden = false;

  // Auto-hide timeout
  let hideTimeout = setTimeout(() => {
    toast.hidden = true;
  }, duration);

  // Close button handler
  if (toastClose) {
    const closeHandler = () => {
      clearTimeout(hideTimeout);
      toast.hidden = true;
      toastClose.removeEventListener('click', closeHandler);
    };
    toastClose.addEventListener('click', closeHandler);
  }
};

/**
 * Show modal
 * @param {HTMLElement} modal - Modal element
 */
export const showModal = (modal) => {
  if (!modal) return;
  
  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  
  // Focus first focusable element
  const focusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable) {
    focusable.focus();
  }

  // Trap focus within modal
  document.addEventListener('keydown', handleModalKeydown);
};

/**
 * Hide modal
 * @param {HTMLElement} modal - Modal element
 */
export const hideModal = (modal) => {
  if (!modal) return;
  
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  
  document.removeEventListener('keydown', handleModalKeydown);
};

/**
 * Handle keydown events in modal (for focus trapping and escape)
 * @param {KeyboardEvent} e - Keyboard event
 */
const handleModalKeydown = (e) => {
  const modal = document.querySelector('.modal:not([hidden])');
  if (!modal) return;

  if (e.key === 'Escape') {
    hideModal(modal);
    return;
  }

  if (e.key === 'Tab') {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault();
      lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault();
      firstElement.focus();
    }
  }
};

/**
 * Update navigation active state
 * @param {string} view - Current view ('all', 'archived', 'tag')
 * @param {NodeList} navLinks - Navigation link elements
 */
export const updateNavActiveState = (view, navLinks) => {
  navLinks.forEach(link => {
    const linkView = link.dataset.view;
    const isActive = linkView === view;
    
    link.classList.toggle('nav-link--active', isActive);
    
    if (isActive) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });
};

/**
 * Update mobile navigation active state
 * @param {string} view - Current view
 * @param {NodeList} mobileNavItems - Mobile navigation items
 */
export const updateMobileNavActiveState = (view, mobileNavItems) => {
  mobileNavItems.forEach(item => {
    const itemView = item.dataset.view;
    const isActive = itemView === view;
    
    item.classList.toggle('mobile-nav__item--active', isActive);
    
    if (isActive) {
      item.setAttribute('aria-current', 'page');
    } else {
      item.removeAttribute('aria-current');
    }
  });
};

/**
 * Escape HTML to prevent XSS
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
export const escapeHTML = (str) => {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

/**
 * Highlight search terms in text
 * @param {string} text - Text to highlight in
 * @param {string} searchTerm - Term to highlight
 * @returns {string} HTML string with highlighted terms
 */
export const highlightSearchTerm = (text, searchTerm) => {
  if (!searchTerm || !text) return escapeHTML(text);
  
  const escapedText = escapeHTML(text);
  const escapedTerm = escapeHTML(searchTerm);
  const regex = new RegExp(`(${escapedTerm})`, 'gi');
  
  return escapedText.replace(regex, '<mark class="highlight">$1</mark>');
};

/**
 * Render search results
 * @param {Array} notes - Array of matching notes
 * @param {string} searchTerm - Search term used
 * @param {HTMLElement} container - Container element
 */
export const renderSearchResults = (notes, searchTerm, container) => {
  if (!container) return;

  if (notes.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p class="empty-state__text">No notes found matching "${escapeHTML(searchTerm)}"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = notes.map(note => `
    <article 
      class="note-item" 
      data-note-id="${note.id}"
      role="listitem"
      tabindex="0"
    >
      <h3 class="note-item__title">${highlightSearchTerm(note.title, searchTerm) || 'Untitled'}</h3>
      <div class="note-item__tags">
        ${note.tags.map(tag => 
          `<span class="note-item__tag">${highlightSearchTerm(tag, searchTerm)}</span>`
        ).join('')}
      </div>
      <time class="note-item__date" datetime="${note.lastEdited}">
        ${formatDate(note.lastEdited)}
      </time>
    </article>
  `).join('');
};

/**
 * Debounce function for search input
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

