/**
 * Migration Visualizer - Main App JS
 * Global script for all pages
 */
import { animateHero, animateCards } from './visualizer/animations.js';

document.addEventListener('DOMContentLoaded', async function() {
  // Animate hero section elements
  animateHero();
  
  // Load migration concepts dynamically if on index page
  if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
    await loadMigrationConcepts();
  }
  
  // Animate cards
  animateCards();
  
  // Handle navigation active state
  handleNavigationState();
  
  // Add smooth scrolling for anchor links
  setupSmoothScrolling();
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

/**
 * Load migration concepts dynamically from JSON
 */
async function loadMigrationConcepts() {
  const conceptCardsContainer = document.getElementById('concept-cards');
  if (!conceptCardsContainer) return;
  
  try {
    // Fetch the migration concepts data
    const response = await fetch('data/migration-concepts.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const concepts = data.migrationConcepts || [];
    
    // Clear the loading message
    conceptCardsContainer.innerHTML = '';
    
    // Create cards for each concept
    concepts.forEach((concept, index) => {
      const card = createConceptCard(concept);
      conceptCardsContainer.appendChild(card);
      
      // Add staggered animation
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
    
  } catch (error) {
    console.error('Error loading migration concepts:', error);
    conceptCardsContainer.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: #e53935;">
        <i class="fas fa-exclamation-triangle"></i> Error loading migration concepts. Please refresh the page.
      </div>
    `;
  }
}

/**
 * Create a concept card element
 * @param {Object} concept - Concept data
 * @returns {HTMLElement} Card element
 */
function createConceptCard(concept) {
  const card = document.createElement('div');
  card.className = 'card';
  card.style.opacity = '0'; // Start invisible for animation
  
  // Extract icon class properly (handle both 'fas fa-icon' and 'fab fa-icon' formats)
  const iconClass = concept.icon || 'fas fa-cube';
  
  card.innerHTML = `
    <div class="card-icon">
      <i class="${iconClass}"></i>
    </div>
    <h3>${concept.name}</h3>
    <p>${concept.description}</p>
    <a href="tenant-to-tenant-generic.html?concept=${concept.id}" class="btn-secondary">Explore</a>
  `;
  
  return card;
}