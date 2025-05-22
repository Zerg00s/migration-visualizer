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
 * Create flying animation for object migration
 * @param {HTMLElement} sourceElement - Source element to fly from
 * @param {HTMLElement} destElement - Destination element to fly to
 * @param {Object} objectData - Object data for the migrating element
 */
export function createFlyingAnimation(sourceElement, destElement, objectData) {
  // Get positions for source and destination
  const sourceRect = sourceElement.getBoundingClientRect();
  const destRect = destElement.getBoundingClientRect();
  
  // Create a clone of the source element to animate
  const flyingElement = sourceElement.cloneNode(true);
  flyingElement.id = 'flying-' + objectData.id;
  flyingElement.className = `object-circle ${objectData.type} flying-object`;
  
  // Remove any unnecessary elements from the clone
  const tooltip = flyingElement.querySelector('.object-tooltip');
  if (tooltip) {
    tooltip.remove();
  }
  
  // Set initial position (fixed positioning relative to viewport)
  flyingElement.style.setProperty('--start-x', '0px');
  flyingElement.style.setProperty('--start-y', '0px');
  flyingElement.style.setProperty('--end-x', `${destRect.left - sourceRect.left}px`);
  flyingElement.style.setProperty('--end-y', `${destRect.top - sourceRect.top}px`);
  
  // Set position
  flyingElement.style.left = `${sourceRect.left}px`;
  flyingElement.style.top = `${sourceRect.top}px`;
  
  // Add to body for proper animation
  document.body.appendChild(flyingElement);
  
  // Add trail effect
  let trailCount = 0;
  const maxTrails = 5;
  const trailColors = [
    objectData.color,
    '#43a047',  // Success green
    '#64b5f6',  // Light blue
    '#7e57c2',  // Purple
  ];
  
  const trailInterval = setInterval(() => {
    if (trailCount >= maxTrails) {
      clearInterval(trailInterval);
      return;
    }
    
    // Create trail element
    const trail = document.createElement('div');
    trail.className = 'migration-trail';
    
    // Randomize trail position slightly
    const trailRect = flyingElement.getBoundingClientRect();
    const randomOffsetX = Math.random() * 20 - 10;
    const randomOffsetY = Math.random() * 20 - 10;
    
    trail.style.left = `${trailRect.left + randomOffsetX}px`;
    trail.style.top = `${trailRect.top + randomOffsetY}px`;
    trail.style.backgroundColor = trailColors[trailCount % trailColors.length];
    
    document.body.appendChild(trail);
    
    // Remove trail after animation
    setTimeout(() => {
      if (trail.parentNode) {
        trail.parentNode.removeChild(trail);
      }
    }, 600);
    
    trailCount++;
  }, 200);
  
  // Add flash effect to source element
  sourceElement.classList.add('migration-flash');
  
  // Remove the flying element after animation completes
  setTimeout(() => {
    if (flyingElement.parentNode) {
      flyingElement.parentNode.removeChild(flyingElement);
    }
    
    // Add appearing effect to destination
    destElement.classList.add('object-appearing');
    
    // Remove classes after animations complete
    setTimeout(() => {
      sourceElement.classList.remove('migration-flash');
      destElement.classList.remove('object-appearing');
    }, 500);
    
  }, 1200);
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