/**
 * Auth Module
 * Handles authentication page interactions (login, signup, forgot password)
 */

import { initializeThemes } from './themes.js';

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

// Form validation and submission
const initForms = () => {
  // Login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = loginForm.querySelector('#email')?.value;
      const password = loginForm.querySelector('#password')?.value;
      
      if (email && password) {
        // Simulate login - in a real app, this would make an API call
        console.log('Login attempt:', { email });
        
        // Redirect to main app
        window.location.href = '../index.html';
      }
    });
  }
  
  // Signup form
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = signupForm.querySelector('#email')?.value;
      const password = signupForm.querySelector('#password')?.value;
      
      if (email && password) {
        // Simulate signup - in a real app, this would make an API call
        console.log('Signup attempt:', { email });
        
        // Redirect to login or main app
        window.location.href = './login.html';
      }
    });
  }
  
  // Forgot password form (request reset link)
  const resetForm = document.getElementById('resetForm');
  if (resetForm) {
    resetForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = resetForm.querySelector('#email')?.value;
      
      if (email) {
        // Simulate password reset - in a real app, this would make an API call
        console.log('Password reset request:', { email });
        
        // Show success message or redirect
        alert('If an account exists with this email, you will receive a password reset link.');
        window.location.href = './login.html';
      }
    });
  }

  // Reset password form (set new password)
  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    resetPasswordForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newPassword = resetPasswordForm.querySelector('#newPassword')?.value;
      const confirmPassword = resetPasswordForm.querySelector('#confirmPassword')?.value;
      
      if (newPassword && confirmPassword) {
        if (newPassword !== confirmPassword) {
          alert('Passwords do not match. Please try again.');
          return;
        }
        
        if (newPassword.length < 8) {
          alert('Password must be at least 8 characters long.');
          return;
        }
        
        // Simulate password reset - in a real app, this would make an API call
        console.log('Password reset successful');
        
        // Show success message and redirect to login
        alert('Your password has been reset successfully. Please log in with your new password.');
        window.location.href = './login.html';
      }
    });
  }
};

// Social login buttons
const initSocialLogin = () => {
  const socialButtons = document.querySelectorAll('.btn--social');
  
  socialButtons.forEach(button => {
    button.addEventListener('click', () => {
      // In a real app, this would initiate OAuth flow
      console.log('Social login clicked');
      alert('Social login is not implemented in this demo.');
    });
  });
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Initialize themes from saved preferences
  initializeThemes();
  
  initPasswordToggles();
  initForms();
  initSocialLogin();
});

