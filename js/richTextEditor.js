/**
 * Rich Text Editor Module
 * Handles rich text formatting for note content
 */

/**
 * Initialize rich text editor on a contenteditable element
 * @param {HTMLElement} editorElement - The contenteditable element
 * @param {HTMLElement} toolbarElement - The formatting toolbar element
 */
export const initRichTextEditor = (editorElement, toolbarElement) => {
  if (!editorElement) return;
  
  // Make sure element is contenteditable
  editorElement.setAttribute('contenteditable', 'true');
  
  // Set up toolbar button handlers
  if (toolbarElement) {
    setupToolbarHandlers(toolbarElement, editorElement);
  }
  
  // Set up keyboard shortcuts
  setupKeyboardShortcuts(editorElement);
  
  // Handle paste to strip formatting (optional - can preserve some)
  editorElement.addEventListener('paste', handlePaste);
};

/**
 * Set up toolbar button click handlers
 * @param {HTMLElement} toolbar - Toolbar element
 * @param {HTMLElement} editor - Editor element
 */
const setupToolbarHandlers = (toolbar, editor) => {
  toolbar.querySelectorAll('[data-format]').forEach(button => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const format = button.dataset.format;
      applyFormat(format, editor);
      editor.focus();
    });
  });
};

/**
 * Set up keyboard shortcuts for formatting
 * @param {HTMLElement} editor - Editor element
 */
const setupKeyboardShortcuts = (editor) => {
  editor.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          applyFormat('bold', editor);
          break;
        case 'i':
          e.preventDefault();
          applyFormat('italic', editor);
          break;
        case 'u':
          e.preventDefault();
          applyFormat('underline', editor);
          break;
      }
    }
  });
};

/**
 * Apply formatting to selected text
 * @param {string} format - Format type (bold, italic, underline, ul, ol)
 * @param {HTMLElement} editor - Editor element
 */
export const applyFormat = (format, editor) => {
  // Ensure focus is on editor
  editor.focus();
  
  // Restore selection if needed
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  
  switch (format) {
    case 'bold':
      document.execCommand('bold', false, null);
      break;
    case 'italic':
      document.execCommand('italic', false, null);
      break;
    case 'underline':
      document.execCommand('underline', false, null);
      break;
    case 'strikethrough':
      document.execCommand('strikeThrough', false, null);
      break;
    case 'ul':
      document.execCommand('insertUnorderedList', false, null);
      break;
    case 'ol':
      document.execCommand('insertOrderedList', false, null);
      break;
    case 'indent':
      document.execCommand('indent', false, null);
      break;
    case 'outdent':
      document.execCommand('outdent', false, null);
      break;
    case 'removeFormat':
      document.execCommand('removeFormat', false, null);
      break;
  }
  
  // Trigger input event to track changes
  editor.dispatchEvent(new Event('input', { bubbles: true }));
};

/**
 * Handle paste event to clean up pasted content
 * @param {ClipboardEvent} e - Paste event
 */
const handlePaste = (e) => {
  e.preventDefault();
  
  // Get clipboard data
  const clipboardData = e.clipboardData || window.clipboardData;
  let pastedData = clipboardData.getData('text/html');
  
  if (!pastedData) {
    // Fall back to plain text
    pastedData = clipboardData.getData('text/plain');
    document.execCommand('insertText', false, pastedData);
    return;
  }
  
  // Clean HTML - keep only allowed tags
  const cleanedHTML = sanitizeHTML(pastedData);
  document.execCommand('insertHTML', false, cleanedHTML);
};

/**
 * Sanitize HTML to allow only safe formatting tags
 * @param {string} html - Raw HTML string
 * @returns {string} Sanitized HTML
 */
export const sanitizeHTML = (html) => {
  // Create a temporary div
  const temp = document.createElement('div');
  temp.innerHTML = html;
  
  // List of allowed tags
  const allowedTags = ['B', 'I', 'U', 'STRONG', 'EM', 'S', 'STRIKE', 'UL', 'OL', 'LI', 'BR', 'P', 'DIV', 'SPAN'];
  
  // Recursively clean nodes
  const cleanNode = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    }
    
    if (node.nodeType !== Node.ELEMENT_NODE) {
      return '';
    }
    
    const tagName = node.tagName.toUpperCase();
    
    // Check if tag is allowed
    if (!allowedTags.includes(tagName)) {
      // Just return the text content
      return Array.from(node.childNodes).map(cleanNode).join('');
    }
    
    // Recursively clean children
    const innerContent = Array.from(node.childNodes).map(cleanNode).join('');
    
    // Return with the tag (remove all attributes except for lists)
    switch (tagName) {
      case 'UL':
        return `<ul>${innerContent}</ul>`;
      case 'OL':
        return `<ol>${innerContent}</ol>`;
      case 'LI':
        return `<li>${innerContent}</li>`;
      case 'B':
      case 'STRONG':
        return `<strong>${innerContent}</strong>`;
      case 'I':
      case 'EM':
        return `<em>${innerContent}</em>`;
      case 'U':
        return `<u>${innerContent}</u>`;
      case 'S':
      case 'STRIKE':
        return `<s>${innerContent}</s>`;
      case 'BR':
        return '<br>';
      case 'P':
        return `<p>${innerContent}</p>`;
      case 'DIV':
        return `<div>${innerContent}</div>`;
      default:
        return innerContent;
    }
  };
  
  return cleanNode(temp);
};

/**
 * Get HTML content from editor
 * @param {HTMLElement} editor - Editor element
 * @returns {string} HTML content
 */
export const getEditorContent = (editor) => {
  if (!editor) return '';
  return editor.innerHTML;
};

/**
 * Set HTML content in editor
 * @param {HTMLElement} editor - Editor element
 * @param {string} html - HTML content to set
 */
export const setEditorContent = (editor, html) => {
  if (!editor) return;
  editor.innerHTML = sanitizeHTML(html);
};

/**
 * Get plain text content from editor
 * @param {HTMLElement} editor - Editor element
 * @returns {string} Plain text content
 */
export const getPlainTextContent = (editor) => {
  if (!editor) return '';
  return editor.innerText || editor.textContent || '';
};

/**
 * Check if content has any formatting
 * @param {string} html - HTML content
 * @returns {boolean} True if content has formatting tags
 */
export const hasFormatting = (html) => {
  const formattingTags = /<(strong|em|u|s|ul|ol|li|b|i)\b[^>]*>/i;
  return formattingTags.test(html);
};

/**
 * Convert plain text to HTML (preserve line breaks)
 * @param {string} text - Plain text
 * @returns {string} HTML with line breaks converted
 */
export const textToHTML = (text) => {
  if (!text) return '';
  
  // Escape HTML entities
  const escaped = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
  
  // Convert line breaks to <br>
  return escaped.replace(/\n/g, '<br>');
};

/**
 * Convert HTML to plain text
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
export const htmlToText = (html) => {
  if (!html) return '';
  
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.innerText || temp.textContent || '';
};

/**
 * Check if editor is currently focused
 * @param {HTMLElement} editor - Editor element
 * @returns {boolean} True if focused
 */
export const isEditorFocused = (editor) => {
  return document.activeElement === editor;
};

/**
 * Get current selection range
 * @returns {Range|null} Current selection range
 */
export const getSelectionRange = () => {
  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    return selection.getRangeAt(0);
  }
  return null;
};

/**
 * Restore selection range
 * @param {Range} range - Range to restore
 */
export const restoreSelectionRange = (range) => {
  if (!range) return;
  
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
};
