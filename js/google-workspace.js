/**
 * Google Workspace Migration Visualizer
 * Entry point for the Google Workspace migration visualization page
 */
import { GoogleWorkspaceVisualizer } from './visualizers/google-workspace.js';
import { visualizerRegistry } from './core/visualizer-registry.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

// Register the visualizer
visualizerRegistry.register('google-workspace', GoogleWorkspaceVisualizer);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Create and initialize the visualizer
    const visualizer = visualizerRegistry.create('google-workspace');
    
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
    console.error('Failed to initialize Google Workspace visualizer:', error);
  }
});
