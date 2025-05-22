/**
 * Tenant-to-Tenant Migration Visualizer
 * Main entry point for the visualizer page
 */
import { MigrationVisualizer } from './visualizer/MigrationVisualizer.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the visualizer
  const migrationVisualizer = new MigrationVisualizer();
  
  // Make it globally available for migration zone
  window.migrationVisualizer = migrationVisualizer;
  
  migrationVisualizer.init();
  
  // Initialize migration zone
  initializeMigrationZone();
  adjustArrowsForScreenSize();
});