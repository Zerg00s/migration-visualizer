/**
 * File Shares Migration Visualizer
 * Entry point for the file shares migration visualization page
 */
import { FileSharesVisualizer } from './migrations/file-shares/FileSharesVisualizer.js';
import { visualizerRegistry } from './core/VisualizerRegistry.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

// Register the visualizer
visualizerRegistry.register('file-shares', FileSharesVisualizer);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
  try {
    // Create and initialize the visualizer
    const visualizer = visualizerRegistry.create('file-shares');
    
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
    console.error('Failed to initialize file shares visualizer:', error);
  }
});
