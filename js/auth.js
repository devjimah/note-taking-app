/**
 * Auth Module
 * Handles authentication page interactions (login, signup, forgot password)
 */

import { initializeThemes } from './themes.js';
import { saveAuth, isAuthenticated } from './storage.js';

/**
 * Check if user is already logged in and redirect to app
 */
const checkAlreadyLoggedIn = () => {
  // Don't redirect if on logout action or reset password pages
  const isLogoutAction = window.location.search.includes('logout=true');
  const isResetPage = window.location.pathname.includes('reset-password');
  
  if (!isLogoutAction && !isResetPage && isAuthenticated()) {
    window.location.href = '../index.html';
    return true;
  }
  return false;
};

// Password toggle functionality
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
 * Show form error message
 * @param {HTMLElement} form - Form element
 * @param {string} message - Error message
 */
const showFormError = (form, message) => {
  // Remove existing error
  const existingError = form.querySelector('.form-error');
  if (existingError) existingError.remove();
  
  // Create error element
  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.textContent = message;
  errorEl.style.cssText = 'color: var(--color-danger, #dc2626); font-size: 0.875rem; margin-bottom: 1rem; text-align: center;';
  
  // Insert at top of form
  form.insertBefore(errorEl, form.firstChild);
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Form validation and submission
const initForms = () => {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('#email')?.value?.trim();
      const password = loginForm.querySelector('#password')?.value;
      
      // Validate email
      if (!email || !isValidEmail(email)) {
        showFormError(loginForm, 'Please enter a valid email address.');
        return;
      }
      
      // Validate password
      if (!password || password.length < 1) {
        showFormError(loginForm, 'Please enter your password.');
        return;
      }
      
      // Save authentication state
      saveAuth({
        isLoggedIn: true,
        user: {
          email: email,
          loginTime: new Date().toISOString()
        }
      });
      
      console.log('Login successful:', { email });
      
      // Redirect to main app
      window.location.href = '../index.html';
    });
  }
  
  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = signupForm.querySelector('#email')?.value?.trim();
      const password = signupForm.querySelector('#password')?.value;
      
      // Validate email
      if (!email || !isValidEmail(email)) {
        showFormError(signupForm, 'Please enter a valid email address.');
        return;
      }
      
      // Validate password
      if (!password || password.length < 8) {
        showFormError(signupForm, 'Password must be at least 8 characters long.');
        return;
      }
      
      // Save authentication state (auto-login after signup)
      saveAuth({
        isLoggedIn: true,
        user: {
          email: email,
          loginTime: new Date().toISOString()
        }
      });
      
      console.log('Signup successful:', { email });
      
      // Redirect to main app
      window.location.href = '../index.html';
    });
  }
  
  // Forgot password form (request reset link)
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = resetForm.querySelector('#email')?.value?.trim();
      
      // Validate email
      if (!email || !isValidEmail(email)) {
        showFormError(resetForm, 'Please enter a valid email address.');
        return;
      }
      
      console.log('Password reset request:', { email });
      
      // Show success message or redirect
      alert('If an account exists with this email, you will receive a password reset link.');
      window.location.href = './login.html';
    });
  }

  // Reset password form (set new password)
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newPassword = resetPasswordForm.querySelector('#newPassword')?.value;
      const confirmPassword = resetPasswordForm.querySelector('#confirmPassword')?.value;
      
      if (!newPassword || newPassword.length < 8) {
        showFormError(resetPasswordForm, 'Password must be at least 8 characters long.');
        return;
      }
      
      if (newPassword !== confirmPassword) {
        showFormError(resetPasswordForm, 'Passwords do not match. Please try again.');
        return;
      }
      
      console.log('Password reset successful');
      
      // Show success message and redirect to login
      alert('Your password has been reset successfully. Please log in with your new password.');
      window.location.href = './login.html';
    });
  }
};

// Social login buttons
const initSocialLogin = () => {
  const socialButtons = document.querySelectorAll('.btn--social');
  
  socialButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real app, this would initiate OAuth flow
      // For demo, we'll simulate a Google login
      const demoEmail = 'demo@google.com';
      
      saveAuth({
        isLoggedIn: true,
        user: {
          email: demoEmail,
          loginTime: new Date().toISOString(),
          provider: 'google'
        }
      });
      
      console.log('Social login successful');
      window.location.href = '../index.html';
    });
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize themes from saved preferences
  initializeThemes();
  
  // Check if already logged in (redirect to app)
  if (checkAlreadyLoggedIn()) {
    return;
  }
  
  initPasswordToggles();
  initForms();
  initSocialLogin();
});
