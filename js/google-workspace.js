/**
 * Google Workspace Migration Visualizer
 * Main entry point for the Google Workspace migration page
 */
import { GoogleWorkspaceMigrationVisualizer } from './google-workspace/GoogleWorkspaceMigrationVisualizer.js';
import { initializeMigrationZone, adjustArrowsForScreenSize } from './migration-zone.js';

document.addEventListener('DOMContentLoaded', function() {
  // Initialize the Google Workspace visualizer
  const googleWorkspaceVisualizer = new GoogleWorkspaceMigrationVisualizer();
  
  // Make it globally available for migration zone
  window.migrationVisualizer = googleWorkspaceVisualizer;
  
  googleWorkspaceVisualizer.init();
  
  // Initialize migration zone
  initializeMigrationZone();
  adjustArrowsForScreenSize();
});