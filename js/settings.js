/**
 * Settings Page Module
 * Handles settings page functionality
 */

import * as storage from './storage.js';
import * as themes from './themes.js';
import * as noteManager from './noteManager.js';
import * as ui from './ui.js';

// DOM Elements
const elements = {};

/**
 * Initialize DOM element references
 */
const initElements = () => {
  // Settings navigation
  elements.settingsNavItems = document.querySelectorAll('.settings-nav__item');
  
  // Settings sections
  elements.colorThemeSection = document.getElementById('colorThemeSection');
  elements.fontThemeSection = document.getElementById('fontThemeSection');
  elements.changePasswordSection = document.getElementById('changePasswordSection');
  
  // Theme inputs
  elements.colorThemeInputs = document.querySelectorAll('input[name="colorTheme"]');
  elements.fontThemeInputs = document.querySelectorAll('input[name="fontTheme"]');
  
  // Apply buttons
  elements.applyColorThemeBtn = document.getElementById('applyColorThemeBtn');
  elements.applyFontThemeBtn = document.getElementById('applyFontThemeBtn');
  
  // Change password form
  elements.changePasswordForm = document.getElementById('changePasswordForm');
  
  // Tag list
  elements.tagList = document.getElementById('tagList');
  
  // Toast
  elements.toast = document.getElementById('toast');
};

/**
 * Show a settings section
 * @param {string} sectionId - Section to show ('color-theme', 'font-theme', 'change-password')
 */
const showSection = (sectionId) => {
  // Hide all sections
  elements.colorThemeSection.hidden = true;
  elements.fontThemeSection.hidden = true;
  if (elements.changePasswordSection) {
    elements.changePasswordSection.hidden = true;
  }
  
  // Show selected section
  switch (sectionId) {
    case 'color-theme':
      elements.colorThemeSection.hidden = false;
      break;
    case 'font-theme':
      elements.fontThemeSection.hidden = false;
      break;
    case 'change-password':
      if (elements.changePasswordSection) {
        elements.changePasswordSection.hidden = false;
      }
      break;
    case 'logout':
      // Handle logout - clear auth and redirect to login page
      handleLogout();
      return;
  }
  
  // Update nav active state and chevron visibility
  elements.settingsNavItems.forEach(item => {
    const isActive = item.dataset.setting === sectionId;
    item.classList.toggle('settings-nav__item--active', isActive);
    
    // Handle chevron - only active item should have chevron
    const existingChevron = item.querySelector('.settings-nav__chevron');
    
    if (isActive && !existingChevron) {
      // Add chevron to active item
      const chevron = document.createElement('img');
      chevron.src = './assets/images/icon-chevron-right.svg';
      chevron.alt = '';
      chevron.className = 'settings-nav__chevron';
      chevron.setAttribute('aria-hidden', 'true');
      item.appendChild(chevron);
    } else if (!isActive && existingChevron) {
      // Remove chevron from inactive item
      existingChevron.remove();
    }
  });
};

/**
 * Load current preferences and update UI
 */
const loadCurrentPreferences = () => {
  const prefs = storage.loadPreferences();
  
  // Set color theme radio
  elements.colorThemeInputs.forEach(input => {
    input.checked = input.value === prefs.colorTheme;
  });
  
  // Set font theme radio
  elements.fontThemeInputs.forEach(input => {
    input.checked = input.value === prefs.fontTheme;
  });
};

/**
 * Apply color theme
 */
const applyColorTheme = () => {
  const selectedTheme = document.querySelector('input[name="colorTheme"]:checked');
  
  if (selectedTheme) {
    themes.applyTheme(selectedTheme.value);
    ui.showToast('Settings updated successfully!', 'success');
  }
};

/**
 * Apply font theme
 */
const applyFontTheme = () => {
  const selectedFont = document.querySelector('input[name="fontTheme"]:checked');
  
  if (selectedFont) {
    themes.applyFont(selectedFont.value);
    ui.showToast('Settings updated successfully!', 'success');
  }
};

/**
 * Handle change password form submission
 * @param {Event} e - Form submit event
 */
const handleChangePassword = (e) => {
  e.preventDefault();
  
  const oldPassword = document.getElementById('oldPassword')?.value;
  const newPassword = document.getElementById('newPassword')?.value;
  const confirmNewPassword = document.getElementById('confirmNewPassword')?.value;
  
  // Validate passwords
  if (!oldPassword || !newPassword || !confirmNewPassword) {
    ui.showToast('Please fill in all fields', 'error');
    return;
  }
  
  if (newPassword.length < 8) {
    ui.showToast('New password must be at least 8 characters', 'error');
    return;
  }
  
  if (newPassword !== confirmNewPassword) {
    ui.showToast('New passwords do not match', 'error');
    return;
  }
  
  // In a real app, this would make an API call to change the password
  console.log('Password change requested');
  
  // Clear the form
  elements.changePasswordForm.reset();
  
  // Show success message
  ui.showToast('Password changed successfully!', 'success');
};

/**
 * Initialize password toggle functionality
 */
const initPasswordToggles = () => {
  const toggleButtons = document.querySelectorAll('[data-toggle-password]');
  
  toggleButtons.forEach(button => {
    button.addEventListener('click', () => {
      const field = button.closest('.form-field--password');
      const input = field?.querySelector('.form-input');
      const showIcon = button.querySelector('.password-toggle__icon--show');
      const hideIcon = button.querySelector('.password-toggle__icon--hide');
      
      if (!input) return;
      
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      
      // Toggle icons
      if (showIcon && hideIcon) {
        showIcon.hidden = !isPassword;
        hideIcon.hidden = isPassword;
      }
      
      // Update aria-label
      button.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
    });
  });
};

/**
 * Render tags list in sidebar
 */
const renderTagsList = async () => {
  // Initialize notes to get tags
  await noteManager.initializeNotes();
  const tags = noteManager.getAllTags(true);
  ui.renderTagList(tags, null, elements.tagList);
};

/**
 * Set up event listeners
 */
const setupEventListeners = () => {
  // Settings navigation
  elements.settingsNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const setting = item.dataset.setting;
      showSection(setting);
    });
  });
  
  // Apply buttons
  elements.applyColorThemeBtn?.addEventListener('click', applyColorTheme);
  elements.applyFontThemeBtn?.addEventListener('click', applyFontTheme);
  
  // Change password form
  elements.changePasswordForm?.addEventListener('submit', handleChangePassword);
  
  // Tag list clicks
  elements.tagList?.addEventListener('click', (e) => {
    const tagItem = e.target.closest('.tag-item');
    if (tagItem) {
      const tag = tagItem.dataset.tag;
      window.location.href = `./index.html?tag=${encodeURIComponent(tag)}`;
    }
  });
  
  // Live preview for theme changes
  elements.colorThemeInputs.forEach(input => {
    input.addEventListener('change', () => {
      // Preview the theme without saving
      const value = input.value;
      let effectiveTheme = value;
      
      if (value === 'system') {
        effectiveTheme = themes.getSystemTheme();
      }
      
      document.documentElement.setAttribute('data-theme', effectiveTheme);
    });
  });
  
  elements.fontThemeInputs.forEach(input => {
    input.addEventListener('change', () => {
      // Preview the font without saving
      document.documentElement.setAttribute('data-font', input.value);
    });
  });
};

/**
 * Check authentication and redirect if not logged in
 * @returns {boolean} True if authenticated, false otherwise
 */
const checkAuth = () => {
  if (!storage.isAuthenticated()) {
    window.location.href = './auth/login.html';
    return false;
  }
  return true;
};

/**
 * Handle logout action
 */
const handleLogout = () => {
  // Clear authentication
  storage.clearAuth();
  
  // Redirect to login page
  window.location.href = './auth/login.html';
};

/**
 * Initialize the settings page
 */
const init = async () => {
  // Check authentication first
  if (!checkAuth()) {
    return;
  }
  
  // Initialize themes first
  themes.initializeThemes();
  
  // Initialize DOM elements
  initElements();
  
  // Load current preferences
  loadCurrentPreferences();
  
  // Render tags
  await renderTagsList();
  
  // Set up event listeners
  setupEventListeners();
  
  // Initialize password toggles
  initPasswordToggles();
  
  // Show default section
  showSection('color-theme');
  
  console.log('Settings page initialized');
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

