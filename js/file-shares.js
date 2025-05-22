/**
 * File Shares Migration Visualizer
 * Main entry point for the file shares migration page
 */
import { FileSharesMigrationVisualizer } from './file-shares/FileSharesMigrationVisualizer.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the file shares visualizer
  const fileSharesVisualizer = new FileSharesMigrationVisualizer();
  
  // Make it globally available for migration zone
  window.migrationVisualizer = fileSharesVisualizer;
  
  fileSharesVisualizer.init();
  
  // Initialize migration zone
  initializeMigrationZone();
  adjustArrowsForScreenSize();
});