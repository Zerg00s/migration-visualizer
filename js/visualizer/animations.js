/**
 * Animation functionality for the Migration Visualizer
 */

/**
 * Animate the initial render of the visualization
 */
export function animateInitialRender() {
  // Animate the environments
  const sourceEnv = document.querySelector('.source-environment');
  const destEnv = document.querySelector('.destination-environment');
  
  sourceEnv.style.opacity = '0';
  destEnv.style.opacity = '0';
  
  setTimeout(() => {
    sourceEnv.style.opacity = '1';
    sourceEnv.style.transform = 'translateX(0)';
  }, 300);
  
  setTimeout(() => {
    destEnv.style.opacity = '1';
    destEnv.style.transform = 'translateX(0)';
  }, 600);
  
  // Animate the objects
  document.querySelectorAll('.object-circle').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'scale(0.5)';
    
    setTimeout(() => {
      el.style.opacity = '1';
      el.style.transform = 'scale(1)';
    }, 900 + (index * 50));
  });
}

/**
 * Add animation to hero section elements
 */
export function animateHero() {
  // Animate hero section elements on page load
  const heroContent = document.querySelector('.hero-content');
  const heroImage = document.querySelector('.hero-image');
  
  if (heroContent && heroImage) {
    setTimeout(() => {
      heroContent.style.opacity = '1';
      heroContent.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
      heroImage.style.opacity = '1';
      heroImage.style.transform = 'translateY(0)';
    }, 300);
  }
}

/**
 * Add fade-in animations to cards
 */
export function animateCards() {
  // Add fade-in animations to cards
  const cards = document.querySelectorAll('.card');
  if (cards.length) {
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, 300 + (index * 150));
    });
  }
}