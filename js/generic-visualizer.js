/**
 * Generic Migration Visualizer Entry Point
 * Handles all migration concepts dynamically using JSON configuration
 */
import { createMigrationVisualizer } from './visualizers/generic-migration.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Get concept from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const concept = urlParams.get('concept') || 'tenant-to-tenant';
    
    console.log(`Loading migration concept: ${concept}`);
    
    // Create the generic visualizer using JSON configuration
    // Now all concept files are merged
    const visualizer = await createMigrationVisualizer(`${concept}-merged`);
    console.log(`Loaded merged concept: ${concept}-merged`);
    
    // Make it globally available for migration zone (temporary for compatibility)
    window.migrationVisualizer = visualizer;
    
    // Update page title
    updatePageTitle(visualizer.conceptDefinition.name);
    
    // Load the HTML template based on the concept definition
    loadDynamicTemplate(visualizer.conceptDefinition);
    
    // Initialize the visualizer
    await visualizer.init();
    
    // Initialize migration zone
    initializeMigrationZone();
    adjustArrowsForScreenSize();
    
    // Make visualizer available globally for debugging
    if (window.DEBUG || localStorage.getItem('debug') === 'true') {
      window.visualizer = visualizer;
    }
    
    console.log('Generic migration visualizer initialized successfully');
  } catch (error) {
    console.error('Failed to initialize generic visualizer:', error);
    showError(`Failed to load migration concept. ${error.message}`);
  }
});

/**
 * Update page title
 */
function updatePageTitle(title) {
  document.title = title;
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    pageTitle.textContent = title;
  }
}

/**
 * Load dynamic HTML template based on concept definition
 */
function loadDynamicTemplate(conceptDefinition) {
  const migrationContainer = document.getElementById('migration-container');
  if (!migrationContainer) {
    throw new Error('Migration container not found');
  }
  
  // Generate source environment HTML
  const sourceHtml = generateEnvironmentHtml(conceptDefinition.sourceEnvironment, 'source-environment');
  
  // Generate destination environment HTML  
  const targetHtml = generateEnvironmentHtml(conceptDefinition.targetEnvironment, 'destination-environment');
  
  // Migration zone HTML
  const migrationZoneHtml = `
    <div class="migration-zone" id="migration-zone">
      <div class="migration-arrows-container">
        <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
        <div class="migration-arrow"><i class="fas fa-arrow-right"></i></div>
      </div>
      <div class="migration-action-text">Click to Migrate Selected Objects</div>
    </div>
  `;
  
  // Combine all HTML
  const template = sourceHtml + migrationZoneHtml + targetHtml;
  migrationContainer.innerHTML = template.trim();
}

/**
 * Generate HTML for an environment (source or target)
 */
function generateEnvironmentHtml(environment, cssClass) {
  const bucketsHtml = environment.buckets.map(bucket => `
    <div class="bucket" data-type="${bucket.objectType}">
      <h4 class="bucket-title">${bucket.title}</h4>
      <div class="bucket-content" id="${bucket.id}"></div>
    </div>
  `).join('');
  
  return `
    <div class="environment ${cssClass}">
      <h3 class="environment-title">${environment.title}</h3>
      <div class="bucket-container">
        ${bucketsHtml}
      </div>
    </div>
  `;
}

/**
 * Show error message
 */
function showError(message) {
  // Create error message element if it doesn't exist
  let errorElement = document.getElementById('error-message');
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.className = 'error-message';
    document.querySelector('.visualizer-main').prepend(errorElement);
  }
  
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Hide loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.style.display = 'none';
  }
}