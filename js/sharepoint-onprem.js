/**
 * SharePoint On-Premises Migration Visualizer
 * Entry point for the SharePoint on-prem migration visualization page
 */
import { SharePointOnPremVisualizer } from './visualizers/sharepoint-onprem.js';
import { visualizerRegistry } from './core/visualizer-registry.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

// Register the visualizer
visualizerRegistry.register('sharepoint-onprem', SharePointOnPremVisualizer);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Create and initialize the visualizer
    const visualizer = visualizerRegistry.create('sharepoint-onprem');
    
    // Make it globally available for migration zone (temporary for compatibility)
    window.migrationVisualizer = visualizer;
    
    // Initialize the visualizer
    await visualizer.init();
    
    // Initialize migration zone
    initializeMigrationZone();
    adjustArrowsForScreenSize();
    
    // Make visualizer available globally for debugging
    if (window.DEBUG || localStorage.getItem('debug') === 'true') {
      window.visualizer = visualizer;
    }
  } catch (error) {
    console.error('Failed to initialize SharePoint on-prem visualizer:', error);
  }
});
