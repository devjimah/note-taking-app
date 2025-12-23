/**
 * Themes Module
 * Handles theme and font customization
 */

import { savePreferences, loadPreferences } from './storage.js';

// Available themes
export const COLOR_THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

export const FONT_THEMES = {
  SANS_SERIF: 'sans-serif',
  SERIF: 'serif',
  MONOSPACE: 'monospace'
};

/**
 * Apply color theme to the document
 * @param {string} themeName - Theme name ('light', 'dark', 'system')
 */
export const applyTheme = (themeName) => {
  const root = document.documentElement;
  
  let effectiveTheme = themeName;
  
  // Handle system theme preference
  if (themeName === COLOR_THEMES.SYSTEM) {
    effectiveTheme = getSystemTheme();
    
    // Listen for system theme changes
    setupSystemThemeListener();
  } else {
    // Remove system theme listener if not using system theme
    removeSystemThemeListener();
  }
  
  root.setAttribute('data-theme', effectiveTheme);
  
  // Save preference
  savePreferences({ colorTheme: themeName });
  
  return effectiveTheme;
};

/**
 * Apply font theme to the document
 * @param {string} fontName - Font theme name ('sans-serif', 'serif', 'monospace')
 */
export const applyFont = (fontName) => {
  const root = document.documentElement;
  
  // Validate font name
  const validFonts = Object.values(FONT_THEMES);
  if (!validFonts.includes(fontName)) {
    console.warn(`Invalid font theme: ${fontName}. Using default.`);
    fontName = FONT_THEMES.SANS_SERIF;
  }
  
  root.setAttribute('data-font', fontName);
  
  // Save preference
  savePreferences({ fontTheme: fontName });
  
  return fontName;
};

/**
 * Get the current system theme preference
 * @returns {string} 'light' or 'dark'
 */
export const getSystemTheme = () => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return COLOR_THEMES.DARK;
  }
  return COLOR_THEMES.LIGHT;
};

/**
 * System theme change handler
 * @param {MediaQueryListEvent} e - Media query event
 */
const handleSystemThemeChange = (e) => {
  const prefs = loadPreferences();
  
  // Only update if user has system theme selected
  if (prefs.colorTheme === COLOR_THEMES.SYSTEM) {
    const newTheme = e.matches ? COLOR_THEMES.DARK : COLOR_THEMES.LIGHT;
    document.documentElement.setAttribute('data-theme', newTheme);
  }
};

// Media query for system theme
let systemThemeMediaQuery = null;

/**
 * Set up listener for system theme changes
 */
const setupSystemThemeListener = () => {
  if (!window.matchMedia) return;
  
  // Remove existing listener if any
  removeSystemThemeListener();
  
  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  systemThemeMediaQuery.addEventListener('change', handleSystemThemeChange);
};

/**
 * Remove system theme change listener
 */
const removeSystemThemeListener = () => {
  if (systemThemeMediaQuery) {
    systemThemeMediaQuery.removeEventListener('change', handleSystemThemeChange);
    systemThemeMediaQuery = null;
  }
};

/**
 * Get current theme from document
 * @returns {string} Current theme name
 */
export const getCurrentTheme = () => {
  return document.documentElement.getAttribute('data-theme') || COLOR_THEMES.LIGHT;
};

/**
 * Get current font from document
 * @returns {string} Current font theme name
 */
export const getCurrentFont = () => {
  return document.documentElement.getAttribute('data-font') || FONT_THEMES.SANS_SERIF;
};

/**
 * Toggle between light and dark themes
 * @returns {string} New theme name
 */
export const toggleTheme = () => {
  const currentTheme = getCurrentTheme();
  const newTheme = currentTheme === COLOR_THEMES.DARK ? COLOR_THEMES.LIGHT : COLOR_THEMES.DARK;
  return applyTheme(newTheme);
};

/**
 * Initialize themes from saved preferences
 */
export const initializeThemes = () => {
  const prefs = loadPreferences();
  
  // Apply saved color theme
  if (prefs.colorTheme) {
    applyTheme(prefs.colorTheme);
  }
  
  // Apply saved font theme
  if (prefs.fontTheme) {
    applyFont(prefs.fontTheme);
  }
  
  return prefs;
};

/**
 * Get all available color themes
 * @returns {Array} Array of theme objects with name and label
 */
export const getColorThemeOptions = () => [
  { value: COLOR_THEMES.LIGHT, label: 'Light Mode', description: 'Pick a clean and classic light theme' },
  { value: COLOR_THEMES.DARK, label: 'Dark Mode', description: 'Select a sleek and modern dark theme' },
  { value: COLOR_THEMES.SYSTEM, label: 'System', description: "Adapts to your device's theme" }
];

/**
 * Get all available font themes
 * @returns {Array} Array of font objects with name and label
 */
export const getFontThemeOptions = () => [
  { value: FONT_THEMES.SANS_SERIF, label: 'Sans-serif', description: 'Clean and modern, easy to read.' },
  { value: FONT_THEMES.SERIF, label: 'Serif', description: 'Classic and elegant for a timeless feel.' },
  { value: FONT_THEMES.MONOSPACE, label: 'Monospace', description: 'Code-like, great for a technical vibe.' }
];

