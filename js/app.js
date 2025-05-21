/**
 * Migration Visualizer - Main App JS
 * Global script for all pages
 */
import { addNotificationStyles } from './utils/helpers.js';
import { animateHero, animateCards } from './visualizer/animations.js';

document.addEventListener('DOMContentLoaded', function() {
  // Animate hero section elements
  animateHero();
  
  // Animate cards
  animateCards();
  
  // Handle navigation active state
  handleNavigationState();
  
  // Add smooth scrolling for anchor links
  setupSmoothScrolling();
  
  // Add notification styles
  addNotificationStyles();
});

/**
 * Handle navigation active state
 */
function handleNavigationState() {
  const navLinks = document.querySelectorAll('.nav-links a');
  const currentPath = window.location.pathname;
  
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href');
    if (currentPath.includes(linkPath) && linkPath !== 'index.html') {
      link.classList.add('active');
    } else if (currentPath.endsWith('/') && linkPath === 'index.html') {
      link.classList.add('active');
    }
  });
}

/**
 * Set up smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId !== '#') {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });
}